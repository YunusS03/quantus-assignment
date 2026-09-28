import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // The browser only lets the frontend (another origin) call the API if the API allows it.
  app.enableCors({ origin: 'http://localhost:8080' });
  // Reject unknown fields instead of silently dropping them.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
