import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureApp } from './configure-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  // Interactive API docs at /docs. The Swagger plugin in nest-cli.json reads the DTOs,
  // so the request bodies and their validation rules are documented without extra decorators.
  const config = new DocumentBuilder()
    .setTitle('Quantus API')
    .setDescription('Bill of quantities: articles, drawing objects and the summary.')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
