import { Module } from '@nestjs/common';
import { ObjectsModule } from '../objects/objects.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';

@Module({
  imports: [PrismaModule, ObjectsModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
