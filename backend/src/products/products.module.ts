import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ViewHistory } from './entities/view-history.entity';
import { ScrapeJob } from '../scrape-jobs/entities/scrape-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ViewHistory, ScrapeJob])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
