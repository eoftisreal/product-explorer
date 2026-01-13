import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Product } from '../products/entities/product.entity'; // Import the Entity

@Module({
  // This line gives the service access to the Product Table
  imports: [TypeOrmModule.forFeature([Product])], 
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}