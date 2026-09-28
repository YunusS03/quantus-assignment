import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ArticlesModule } from './articles/articles.module.js';
import { ObjectsModule } from './objects/objects.module.js';
import { SummaryModule } from './summary/summary.module.js';

@Module({
  imports: [ArticlesModule, ObjectsModule, SummaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
