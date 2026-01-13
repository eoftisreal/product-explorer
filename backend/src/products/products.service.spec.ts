import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ViewHistory } from './entities/view-history.entity';
import { Repository } from 'typeorm';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: Repository<Product>;
  let historyRepo: Repository<ViewHistory>;

  // --- 1. Define Mocks outside beforeEach to access them in tests ---
  
  // A. QueryBuilder Mock (Chainable)
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(), // Will be defined in test
    getMany: jest.fn(),
  };

  // B. Repositories
  const mockProductRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder), // Returns the specific mock above
  };

  const mockHistoryRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    // RESET all mocks before every test to prevent data leaking
    jest.clearAllMocks(); 

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
        {
          provide: getRepositoryToken(ViewHistory),
          useValue: mockHistoryRepo,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    historyRepo = module.get<Repository<ViewHistory>>(getRepositoryToken(ViewHistory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- TEST 1: PAGINATION ---
  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockProducts = [{ id: 1, title: 'Book A' }];
      const mockTotal = 1;

      // Override the return value for this specific test
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProducts, mockTotal]);

      const result = await service.findAll(1, 10, '', 'All');

      expect(result).toEqual({
        data: mockProducts,
        total: mockTotal,
        page: 1,
        lastPage: 1,
      });
    });
  });

  // --- TEST 2: LOGGING HISTORY ---
  describe('logView', () => {
    it('should save history if not recently viewed', async () => {
      // Mock: No previous history found
      mockHistoryRepo.findOne.mockResolvedValue(null);

      await service.logView(1, 'session-123');

      expect(mockHistoryRepo.save).toHaveBeenCalledTimes(1);
      expect(mockHistoryRepo.save).toHaveBeenCalledWith({
        productId: 1,
        sessionId: 'session-123',
      });
    });

    it('should NOT save history if recently viewed (debounce)', async () => {
      // Mock: History exists and was viewed 1 minute ago
      mockHistoryRepo.findOne.mockResolvedValue({
        viewedAt: new Date(Date.now() - 60000), // 1 min ago
      });

      await service.logView(1, 'session-123');

      // Should NOT save because 1 min < 5 min threshold
      expect(mockHistoryRepo.save).not.toHaveBeenCalled();
    });
  });

  // --- TEST 3: GETTING HISTORY ---
  describe('getHistory', () => {
    it('should return history list', async () => {
      const mockHistory = [
        { id: 1, product: { title: 'Book A' } },
        { id: 2, product: { title: 'Book B' } },
      ];
      mockHistoryRepo.find.mockResolvedValue(mockHistory);

      const result = await service.getHistory('session-123');

      expect(result).toEqual(mockHistory);
      expect(mockHistoryRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { sessionId: 'session-123' },
        take: 20, 
      }));
    });
  });
});