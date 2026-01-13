import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature Modules
import { ProductsModule } from './products/products.module';
import { NavigationModule } from './navigation/navigation.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // DATABASE CONNECTION
    TypeOrmModule.forRoot({
      type: 'postgres',
      
      // DYNAMIC HOST: Use 'postgres' if running in Docker, otherwise 'localhost'
      host: process.env.DB_HOST || 'localhost',
      
      port: 5432,
      
      // CREDENTIALS: Look for Env Vars first, fallback to your local defaults
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'mario',
      database: process.env.DB_NAME || 'product_explorer',
      
      autoLoadEntities: true, 
      synchronize: true,          
    }),

    ProductsModule,
    NavigationModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}