import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ObjectsController } from './objects.controller.js';
import { ObjectsService } from './objects.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ObjectsController],
  providers: [ObjectsService],
  exports: [ObjectsService],
})
export class ObjectsModule {}
