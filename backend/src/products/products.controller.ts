import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@ApiTags('products') 
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('scrape')
  @ApiOperation({ summary: 'Trigger an on-demand scrape of a World of Books category' })
  @ApiResponse({ status: 201, description: 'Scrape job started successfully.' })
  scrape(@Body() body: { url?: string; categoryName?: string }) {
    return this.productsService.scrapeCategory(
      body.url || 'https://www.worldofbooks.com/en-gb/collections/fiction-books', 
      body.categoryName || 'Fiction'
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 12 })
  @ApiQuery({ name: 'category', required: false, example: 'Fiction' })
  @ApiQuery({ name: 'search', required: false, example: 'Gatsby' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
    @Query('search') search: string = '',
    @Query('category') category: string = 'All',
  ) {
    return this.productsService.findAll(+page, +limit, search, category);
  }

  // REQUIRED: GET HISTORY 
  @Get('history/:sessionId')
  @ApiOperation({ summary: 'Retrieve user browsing history' })
  @ApiParam({ name: 'sessionId', description: 'Unique session ID from localStorage' })
  getHistory(@Param('sessionId') sessionId: string) {
    return this.productsService.getHistory(sessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiResponse({ status: 200, type: Product })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // REQUIRED: RELATED PRODUCTS [cite: 56]
  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products based on category' })
  findRelated(@Param('id') id: string) {
    return this.productsService.findRelated(+id);
  }

  // REQUIRED: LOG VIEW HISTORY 
  @Post(':id/view')
  @ApiOperation({ summary: 'Log a product view to history' })
  logView(
    @Param('id') id: string,
    @Body('sessionId') sessionId: string
  ) {
    return this.productsService.logView(+id, sessionId);
  }
}