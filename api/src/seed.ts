import { Unit } from './generated/prisma/client.js';
import { PrismaService } from './prisma/prisma.service.js';

// Parents come before their children, so each parent already exists when a child is saved.
const articles = [
  { code: '20.', parentCode: null, title: 'Masonry', description: '<p>All masonry work.</p>' },
  { code: '20.11.', parentCode: '20.', title: 'Masonry - materials', description: '<p>Materials for masonry.</p>' },
  { code: '20.11.10.', parentCode: '20.11.', title: 'Materials - mortar', description: '<p>Walls of 14 cm, laid in cement mortar.</p>' },
  { code: '20.11.20.', parentCode: '20.11.', title: 'Materials - facing bricks', description: '<p>Facing bricks and lintels for the facade.</p>' },
  { code: '30.', parentCode: null, title: 'Carpentry', description: '<p>Interior and exterior carpentry.</p>' },
  { code: '30.11.', parentCode: '30.', title: 'Interior doors', description: '<p>Painted interior doors, frame included.</p>' },
  { code: '30.12.', parentCode: '30.', title: 'Windows', description: '<p>Aluminium windows with double glazing.</p>' },
  { code: '40.', parentCode: null, title: 'Painting', description: '<p>Not priced yet.</p>' },
];

// Fixed UUIDs stand in for the ids from the drawing, and keep the seed repeatable.
const objects = [
  { id: 'd6313bce-2d8f-4e40-8fbf-d355f56b1248', articleCode: '20.11.', name: 'Damp-proof course', type: 'Membrane', unit: Unit.M, unitPrice: 4.15, quantity: 48.6 },
  { id: 'c9cc99f0-cd15-4018-8c9f-86f02ec60992', articleCode: '20.11.10.', name: 'Wall 14 cm - ground floor north', type: 'Wall', unit: Unit.M2, unitPrice: 38.5, quantity: 42.75 },
  { id: '3c6c13f3-3242-4667-b2cb-4415cc7d1f21', articleCode: '20.11.10.', name: 'Wall 14 cm - ground floor south', type: 'Wall', unit: Unit.M2, unitPrice: 38.5, quantity: 42.75 },
  { id: '1931610b-5b22-4954-b423-b28ef34fc732', articleCode: '20.11.10.', name: 'Wall 14 cm - first floor', type: 'Wall', unit: Unit.M2, unitPrice: 38.5, quantity: 65.2 },
  { id: '7b597eed-9c70-4009-94b9-e495bd9d188c', articleCode: '20.11.20.', name: 'Facing brick - east facade', type: 'Wall', unit: Unit.M2, unitPrice: 64.9, quantity: 31.125 },
  { id: 'fee9de40-052b-4a2a-9a82-ec405f25d2a7', articleCode: '20.11.20.', name: 'Lintel - kitchen window', type: 'Beam', unit: Unit.M, unitPrice: 27.35, quantity: 2.4 },
  { id: '9ffab34c-2393-464e-86fb-5184f9088362', articleCode: '30.11.', name: 'Door 83 cm - bathroom', type: 'Door', unit: Unit.PIECE, unitPrice: 389, quantity: 1 },
  { id: 'b6d6d27c-3a45-4e49-bdde-1fbd5e154265', articleCode: '30.11.', name: 'Door 93 cm - living room', type: 'Door', unit: Unit.PIECE, unitPrice: 429, quantity: 1 },
  { id: 'c018a08a-a93f-4755-8d44-72fd2b30638e', articleCode: '30.12.', name: 'Window - living room', type: 'Window', unit: Unit.M2, unitPrice: 412.5, quantity: 4.32 },
  { id: '9fc856cd-7309-4a9b-9a83-2e3ff6d6fed8', articleCode: '30.12.', name: 'Window - kitchen', type: 'Window', unit: Unit.M2, unitPrice: 412.5, quantity: 1.89 },
];

const prisma = new PrismaService();
const idByCode = new Map<string, number>();

// Upserts make the seed safe to run again: existing rows are updated, not duplicated.
for (const { parentCode, ...article } of articles) {
  const data = { ...article, parentId: parentCode === null ? null : idByCode.get(parentCode)! };
  const saved = await prisma.article.upsert({ where: { code: article.code }, update: data, create: data });
  idByCode.set(saved.code, saved.id);
}

for (const { articleCode, ...object } of objects) {
  const data = { ...object, articleId: idByCode.get(articleCode)! };
  await prisma.drawingObject.upsert({ where: { id: object.id }, update: data, create: data });
}

await prisma.$disconnect();
console.log(`Seeded ${articles.length} articles and ${objects.length} objects.`);
