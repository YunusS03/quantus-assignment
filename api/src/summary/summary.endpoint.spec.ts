import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SummaryModule } from './summary.module.js';

// Real controller and service; only the database is replaced by fixed data.
const fakePrisma = {
  $transaction: (queries: Promise<unknown>[]) => Promise.all(queries),
  article: {
    findMany: async () => [
      { id: 1, code: '20.', title: 'Masonry', parentId: null },
      { id: 2, code: '20.11.', title: 'Masonry - materials', parentId: 1 },
      { id: 3, code: '30.', title: 'Carpentry', parentId: null },
    ],
  },
  drawingObject: {
    findMany: async () => [
      { articleId: 2, quantity: new Prisma.Decimal('0.5'), unitPrice: new Prisma.Decimal('2.25') },
      { articleId: 3, quantity: new Prisma.Decimal('0.5'), unitPrice: new Prisma.Decimal('2.25') },
    ],
  },
};

describe('GET /summary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [SummaryModule] })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the currency, a subtotal per top-level article and the grand total', async () => {
    const response = await request(app.getHttpServer()).get('/summary').expect(200);

    expect(response.body).toEqual({
      currency: 'EUR',
      articles: [
        { id: 1, code: '20.', title: 'Masonry', subtotal: 1.13 },
        { id: 3, code: '30.', title: 'Carpentry', subtotal: 1.13 },
      ],
      grandTotal: 2.25,
    });
  });
});
