import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' });
  await app.listen(3001);
  console.log('NestJS API Gateway listening on :3001');
}
bootstrap();