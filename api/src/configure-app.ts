import { INestApplication, ValidationPipe } from '@nestjs/common';

// Shared by main.ts and the endpoint tests, so the tests run the app exactly as in production.
export function configureApp(app: INestApplication) {
  // The browser only lets the frontend (another origin) call the API if the API allows it.
  app.enableCors({ origin: 'http://localhost:8080' });
  // Reject unknown fields instead of silently dropping them.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}
