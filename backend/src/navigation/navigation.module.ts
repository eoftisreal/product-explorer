import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation } from './entities/navigation.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  // FIX: This line gives the Service access to both tables
  imports: [TypeOrmModule.forFeature([Navigation, Category])],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
