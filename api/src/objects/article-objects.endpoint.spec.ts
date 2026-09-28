import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ArticlesModule } from '../articles/articles.module.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

function object(id: string, articleId: number, quantity: string, unitPrice: string) {
  return {
    id,
    name: `Wall ${id}`,
    type: 'Wall',
    unit: 'M2',
    quantity: new Prisma.Decimal(quantity),
    unitPrice: new Prisma.Decimal(unitPrice),
    articleId,
  };
}

// 20. (id 5) > 20.11.10. (id 7): two objects on 20.11.10., one directly on 20.
const articles = [
  { id: 5, code: '20.', title: 'Masonry', parentId: null },
  { id: 7, code: '20.11.10.', title: 'Materials - mortar', parentId: 5 },
];
const objects = [object('a', 7, '0.5', '2.25'), object('b', 7, '0.5', '2.25'), object('c', 5, '2', '10')];

// Real controller and services; only the database is replaced by fixed data.
const fakePrisma = {
  article: {
    findUnique: async ({ where }: { where: { id: number } }) => articles.find((a) => a.id === where.id) ?? null,
    findMany: async () => articles,
  },
  drawingObject: {
    findMany: async ({ where }: { where: { articleId: { in: number[] } } }) =>
      objects.filter((o) => where.articleId.in.includes(o.articleId)),
  },
};

describe('GET /articles/:id/objects', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ArticlesModule] })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns each line total and the article total from unrounded values', async () => {
    const response = await request(app.getHttpServer()).get('/articles/7/objects').expect(200);

    expect(response.body.currency).toBe('EUR');
    expect(response.body.objects.map((o: { lineTotal: number }) => o.lineTotal)).toEqual([1.13, 1.13]);
    // 1.125 + 1.125 = 2.25; adding the rounded lines would give 2.26.
    expect(response.body.total).toBe(2.25);
  });

  it('returns only the direct objects by default', async () => {
    const response = await request(app.getHttpServer()).get('/articles/5/objects').expect(200);

    expect(response.body.objects.map((o: { id: string }) => o.id)).toEqual(['c']);
    expect(response.body.total).toBe(20);
  });

  it('includes the objects of all sub-articles when asked', async () => {
    const response = await request(app.getHttpServer())
      .get('/articles/5/objects?includeSubArticles=true')
      .expect(200);

    expect(response.body.objects.map((o: { id: string }) => o.id).sort()).toEqual(['a', 'b', 'c']);
    // 20 + 1.125 + 1.125: the same rolled-up value /summary gives for 20.
    expect(response.body.total).toBe(22.25);
  });

  it('rejects an includeSubArticles value that is not true or false', async () => {
    await request(app.getHttpServer()).get('/articles/5/objects?includeSubArticles=maybe').expect(400);
  });

  it('returns 404 for an unknown article', async () => {
    await request(app.getHttpServer()).get('/articles/99/objects').expect(404);
  });
});
