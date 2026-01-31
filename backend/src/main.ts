import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 20; // Increase from default 10
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Requirement: Sanitize inputs and validate DTOs [cite: 40, 76]
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Requirement: Enable CORS properly [cite: 76]
  app.enableCors();

  // Requirement: API documentation (Swagger) [cite: 87, 102, 118]
  const config = new DocumentBuilder()
    .setTitle('Product Data Explorer API')
    .setDescription('Real-time scraping API for World of Books [cite: 6]')
    .setVersion('1.0')
    .addTag('products')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Set up the interactive documentation endpoint [cite: 87]
  SwaggerModule.setup('api', app, document);

  // Requirement: Use secure environment variables [cite: 76, 124]
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api`);
}
void bootstrap();
