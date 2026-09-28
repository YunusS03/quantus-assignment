import { Module } from '@nestjs/common';
import { ArticlesModule } from './articles/articles.module.js';
import { ObjectsModule } from './objects/objects.module.js';
import { SummaryModule } from './summary/summary.module.js';

@Module({
  imports: [ArticlesModule, ObjectsModule, SummaryModule],
})
export class AppModule {}
