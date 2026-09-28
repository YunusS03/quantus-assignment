import { Injectable } from '@nestjs/common';
import { CURRENCY } from '../currency.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { calculateSummary } from './calculate-summary.js';

@Injectable()
export class SummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    // RepeatableRead: both queries see the same snapshot, so an article and object
    // created in between can't leave an object whose article is missing from the list.
    const [articles, objects] = await this.prisma.$transaction(
      [
        this.prisma.article.findMany({
          select: { id: true, code: true, title: true, parentId: true },
          orderBy: { code: 'asc' },
        }),
        this.prisma.drawingObject.findMany({
          select: { articleId: true, quantity: true, unitPrice: true },
        }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
    return { currency: CURRENCY, ...calculateSummary(articles, objects) };
  }
}
