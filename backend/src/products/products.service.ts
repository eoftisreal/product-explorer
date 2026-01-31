import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { PlaywrightCrawler } from 'crawlee';
import { Product } from './entities/product.entity';
import { ViewHistory } from './entities/view-history.entity';
import {
  ScrapeJob,
  ScrapeStatus,
} from '../scrape-jobs/entities/scrape-job.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly FALLBACK_IMAGE =
    'http://www.worldofbooks.com/cdn/shop/files/0008532818.jpg?v=1750907970';

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ViewHistory)
    private historyRepository: Repository<ViewHistory>,
    @InjectRepository(ScrapeJob)
    private scrapeJobRepository: Repository<ScrapeJob>,
  ) {}

  /**
   * Scrapes a category from World of Books.
   * Runs asynchronously in the background.
   */
  async scrapeCategory(url: string, categoryName: string, jobId?: number) {
    if (jobId) await this.updateJobStatus(jobId, ScrapeStatus.PROCESSING);

    // Run crawler asynchronously (fire and forget)
    const runCrawler = async () => {
      try {
        const crawler = new PlaywrightCrawler({
          headless: true,
          maxConcurrency: 5,
          maxRequestRetries: 3,
          requestHandler: async ({ page, request, enqueueLinks }) => {
            if (!request.url.includes('/products/')) {
              await page.waitForLoadState('networkidle');
              const products = await page.evaluate(
                ({ cat, fallback }) => {
                  return Array.from(
                    document.querySelectorAll('a[data-item_name]'),
                  ).map((link) => {
                    const id =
                      link.getAttribute('data-item_id') ||
                      Math.random().toString(36).substr(2, 9);
                    const href = link.getAttribute('href') || '';
                    const isbn = href.split('-').pop();
                    return {
                      title: link.getAttribute('data-item_name') || 'Unknown',
                      price: '£' + (link.getAttribute('data-price') || '0.00'),
                      image: isbn
                        ? `https://image-server.worldofbooks.com/images/${isbn}.jpg`
                        : fallback,
                      sourceUrl: window.location.origin + href,
                      sourceId: id,
                      category: cat,
                    };
                  });
                },
                { cat: categoryName, fallback: this.FALLBACK_IMAGE },
              );

              for (const p of products) {
                await this.productRepository.upsert(p, ['sourceId']);
              }
              await enqueueLinks({ selector: 'a[data-item_name]' });
            } else {
              await page
                .waitForSelector('.panel', { timeout: 5000 })
                .catch(() => null);
              const extracted = await page.evaluate(() => {
                const panel = document.querySelector('.panel') as HTMLElement;
                return panel ? { description: panel.innerText.trim() } : null;
              });

              if (extracted) {
                await this.productRepository.update(
                  { sourceUrl: request.url },
                  extracted,
                );
              }
            }
          },
        });

        await crawler.run([url]);
        if (jobId) await this.updateJobStatus(jobId, ScrapeStatus.COMPLETED);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (jobId)
          await this.updateJobStatus(jobId, ScrapeStatus.FAILED, errorMessage);
      }
    };

    void runCrawler();
  }

  async updateJobStatus(jobId: number, status: ScrapeStatus, error?: string) {
    await this.scrapeJobRepository.update(jobId, {
      status,
      errorLog: error ?? null,
      finishedAt:
        status === ScrapeStatus.COMPLETED || status === ScrapeStatus.FAILED
          ? new Date()
          : null,
    });
  }

  /**
   * Retrieves products with pagination and filters.
   */
  async findAll(
    page: number = 1,
    limit: number = 12,
    search?: string,
    category?: string,
  ) {
    const query = this.productRepository.createQueryBuilder('product');
    if (category && category !== 'All')
      query.andWhere('product.category = :category', { category });
    if (search)
      query.andWhere('LOWER(product.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  /**
   * Finds a single product by ID.
   */
  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  /**
   * Finds related products based on category.
   * Excludes the current product ID.
   */
  async findRelated(id: number) {
    const product = await this.findOne(id);
    return this.productRepository.find({
      where: {
        category: product.category,
        id: Not(id),
      },
      take: 4,
    });
  }

  async logView(productId: number, sessionId: string) {
    if (!sessionId || sessionId === 'null') return;
    await this.historyRepository.save({ productId, sessionId });
  }

  async getHistory(sessionId: string) {
    const history = await this.historyRepository.find({
      where: { sessionId },
      relations: ['product'],
      order: { viewedAt: 'DESC' },
      take: 20,
    });

    return history.map((h) => {
      if (
        h.product &&
        (!h.product.image || h.product.image.includes('undefined'))
      ) {
        h.product.image = this.FALLBACK_IMAGE;
      }
      return h;
    });
  }
}
