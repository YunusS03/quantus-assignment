import { Unit } from './generated/prisma/client.js';
import { PrismaService } from './prisma/prisma.service.js';

// A small detached house. Parents come before their children, so each parent
// already exists when a child is saved.
const articles = [
  { code: '10.', parentCode: null, title: 'Earthworks', description: '<p>Excavation and backfill for the foundations.</p>' },
  { code: '10.10.', parentCode: '10.', title: 'Excavation', description: '<p>Foundation trenches, soil removed from site.</p>' },
  { code: '10.20.', parentCode: '10.', title: 'Backfill', description: '<p>Backfill with excavated soil, compacted in layers.</p>' },
  { code: '15.', parentCode: null, title: 'Structural concrete', description: '<p>Foundations, floor slabs and structural steel.</p>' },
  { code: '15.10.', parentCode: '15.', title: 'Reinforced concrete', description: '<p>Cast-in-place reinforced concrete.</p>' },
  { code: '15.10.10.', parentCode: '15.10.', title: 'Concrete C25/30', description: '<p>Ready-mix concrete C25/30, poured and vibrated.</p>' },
  { code: '15.10.20.', parentCode: '15.10.', title: 'Reinforcement steel', description: '<p>BE 500 S rebar, cut, bent and placed.</p>' },
  { code: '15.20.', parentCode: '15.', title: 'Steel lintels and beams', description: '<p>Hot-rolled steel profiles, fire-protected.</p>' },
  { code: '20.', parentCode: null, title: 'Masonry', description: '<p>All masonry work.</p>' },
  { code: '20.11.', parentCode: '20.', title: 'Masonry - materials', description: '<p>Materials for masonry.</p>' },
  { code: '20.11.10.', parentCode: '20.11.', title: 'Materials - mortar', description: '<p>Walls of 14 cm, laid in cement mortar.</p>' },
  { code: '20.11.20.', parentCode: '20.11.', title: 'Materials - facing bricks', description: '<p>Facing bricks and lintels for the facade.</p>' },
  { code: '20.12.', parentCode: '20.', title: 'Inner leaf', description: '<p>Inner leaf of the cavity walls and inner walls.</p>' },
  { code: '20.12.10.', parentCode: '20.12.', title: 'Concrete blocks', description: '<p>Hollow concrete blocks, laid in thin-bed mortar.</p>' },
  { code: '20.12.10.10.', parentCode: '20.12.10.', title: 'Blocks 14 cm', description: '<p>Blocks of 14 cm for non-load-bearing walls.</p>' },
  { code: '20.12.10.20.', parentCode: '20.12.10.', title: 'Blocks 19 cm', description: '<p>Blocks of 19 cm for load-bearing walls.</p>' },
  { code: '25.', parentCode: null, title: 'Roofing', description: '<p>Pitched roof with clay tiles.</p>' },
  { code: '25.10.', parentCode: '25.', title: 'Roof structure', description: '<p>Timber rafters and roof boarding.</p>' },
  { code: '25.20.', parentCode: '25.', title: 'Roof tiles', description: '<p>Clay roof tiles on battens, including ridge tiles.</p>' },
  { code: '25.30.', parentCode: '25.', title: 'Gutters and downpipes', description: '<p>Zinc gutters and downpipes.</p>' },
  { code: '25.40.', parentCode: '25.', title: 'Skylights', description: '<p>Not priced yet.</p>' },
  { code: '30.', parentCode: null, title: 'Carpentry', description: '<p>Interior and exterior carpentry.</p>' },
  { code: '30.11.', parentCode: '30.', title: 'Interior doors', description: '<p>Painted interior doors, frame included.</p>' },
  { code: '30.12.', parentCode: '30.', title: 'Windows', description: '<p>Aluminium windows with double glazing.</p>' },
  { code: '30.13.', parentCode: '30.', title: 'Exterior doors', description: '<p>Insulated front door and garage door.</p>' },
  { code: '40.', parentCode: null, title: 'Painting', description: '<p>Not priced yet.</p>' },
];

// Fixed UUIDs stand in for the ids from the drawing, and keep the seed repeatable.
const objects = [
  { id: '263388a2-f965-4196-8e64-65a5f3d4f8b5', articleCode: '10.10.', name: 'Foundation trench - north', type: 'Excavation', unit: Unit.M3, unitPrice: 38, quantity: 14.625 },
  { id: '0111cf43-dd43-401f-8585-4e2257eea6a1', articleCode: '10.10.', name: 'Foundation trench - south', type: 'Excavation', unit: Unit.M3, unitPrice: 38, quantity: 14.625 },
  { id: 'f3259080-cbd7-4232-aaa7-b862277917a9', articleCode: '10.10.', name: 'Foundation trench - gables', type: 'Excavation', unit: Unit.M3, unitPrice: 38, quantity: 11.34 },
  { id: '489e7957-787c-43dd-ba39-a0bff6907ec9', articleCode: '10.20.', name: 'Backfill around foundations', type: 'Backfill', unit: Unit.M3, unitPrice: 24.5, quantity: 18.2 },
  { id: '98fe7003-c040-4bc7-a3a5-0501e8b2d1e9', articleCode: '15.10.10.', name: 'Strip footing - perimeter', type: 'Footing', unit: Unit.M3, unitPrice: 165, quantity: 16.8 },
  { id: 'b6e07f77-468b-4ad1-85b2-01aaa12126dd', articleCode: '15.10.10.', name: 'Ground floor slab', type: 'Slab', unit: Unit.M3, unitPrice: 158, quantity: 21.6 },
  { id: 'f55b0c6d-7bd0-4182-9580-c7d183492e6c', articleCode: '15.10.10.', name: 'First floor slab', type: 'Slab', unit: Unit.M3, unitPrice: 172, quantity: 19.44 },
  { id: '764e22c1-33fb-4a88-ba97-5e4d5327374d', articleCode: '15.10.20.', name: 'Rebar - strip footing', type: 'Rebar', unit: Unit.KG, unitPrice: 1.45, quantity: 1260 },
  { id: 'b725f709-6299-4b9d-a567-69bfe637c155', articleCode: '15.10.20.', name: 'Rebar - ground floor slab', type: 'Rebar', unit: Unit.KG, unitPrice: 1.45, quantity: 1728.5 },
  { id: '3159279e-3702-44b3-8c58-99e0bd91421c', articleCode: '15.10.20.', name: 'Rebar - first floor slab', type: 'Rebar', unit: Unit.KG, unitPrice: 1.45, quantity: 1944 },
  { id: '30702095-b20f-47eb-98ee-915fccd8e5a3', articleCode: '15.20.', name: 'Steel beam HEA 160 - living room', type: 'Beam', unit: Unit.KG, unitPrice: 3.85, quantity: 212.4 },
  { id: 'bfb26909-4626-495f-b87d-70a250fcbd79', articleCode: '15.20.', name: 'Steel lintel - garage door', type: 'Beam', unit: Unit.KG, unitPrice: 3.85, quantity: 96.75 },
  { id: 'd6313bce-2d8f-4e40-8fbf-d355f56b1248', articleCode: '20.11.', name: 'Damp-proof course', type: 'Membrane', unit: Unit.M, unitPrice: 4.15, quantity: 48.6 },
  { id: 'c9cc99f0-cd15-4018-8c9f-86f02ec60992', articleCode: '20.11.10.', name: 'Wall 14 cm - ground floor north', type: 'Wall', unit: Unit.M2, unitPrice: 38.5, quantity: 42.75 },
  { id: '3c6c13f3-3242-4667-b2cb-4415cc7d1f21', articleCode: '20.11.10.', name: 'Wall 14 cm - ground floor south', type: 'Wall', unit: Unit.M2, unitPrice: 38.5, quantity: 42.75 },
  { id: '1931610b-5b22-4954-b423-b28ef34fc732', articleCode: '20.11.10.', name: 'Wall 14 cm - first floor', type: 'Wall', unit: Unit.M2, unitPrice: 38.5, quantity: 65.2 },
  { id: '7b597eed-9c70-4009-94b9-e495bd9d188c', articleCode: '20.11.20.', name: 'Facing brick - east facade', type: 'Wall', unit: Unit.M2, unitPrice: 64.9, quantity: 31.125 },
  { id: 'fee9de40-052b-4a2a-9a82-ec405f25d2a7', articleCode: '20.11.20.', name: 'Lintel - kitchen window', type: 'Beam', unit: Unit.M, unitPrice: 27.35, quantity: 2.4 },
  { id: '1e34068b-1a42-4b76-8889-0cd76e817b18', articleCode: '20.12.10.10.', name: 'Inner leaf 14 cm - ground floor', type: 'Wall', unit: Unit.M2, unitPrice: 32.4, quantity: 86.5 },
  { id: '0e372bbc-f091-4186-a5b6-5a4eeec77222', articleCode: '20.12.10.10.', name: 'Inner leaf 14 cm - first floor', type: 'Wall', unit: Unit.M2, unitPrice: 32.4, quantity: 78.25 },
  { id: '98c02728-f801-4d36-896e-4f698cef8b0b', articleCode: '20.12.10.10.', name: 'Partition 14 cm - bathroom', type: 'Wall', unit: Unit.M2, unitPrice: 32.4, quantity: 12.375 },
  { id: 'fd87516f-4f84-44bf-b814-9f1250386bb6', articleCode: '20.12.10.20.', name: 'Load-bearing wall 19 cm - hall', type: 'Wall', unit: Unit.M2, unitPrice: 41.2, quantity: 18.9 },
  { id: '95faa68d-8a85-4f2d-88a2-ddba1c5318fa', articleCode: '20.12.10.20.', name: 'Load-bearing wall 19 cm - stairwell', type: 'Wall', unit: Unit.M2, unitPrice: 41.2, quantity: 22.05 },
  { id: '4ad02644-31aa-4ca3-b143-1704fda5593b', articleCode: '25.10.', name: 'Rafters 75x225', type: 'Timber', unit: Unit.M, unitPrice: 12.8, quantity: 184 },
  { id: '9d6ea139-fcd2-45f7-af0e-9462740b4e05', articleCode: '25.10.', name: 'Roof boarding', type: 'Sheathing', unit: Unit.M2, unitPrice: 21.5, quantity: 142.6 },
  { id: '81f96a31-5970-4a36-a3f5-1a521e44ae40', articleCode: '25.20.', name: 'Clay tiles - front slope', type: 'Roof', unit: Unit.M2, unitPrice: 46.75, quantity: 71.3 },
  { id: '5f92ce83-2765-456f-9911-b3458632a842', articleCode: '25.20.', name: 'Clay tiles - back slope', type: 'Roof', unit: Unit.M2, unitPrice: 46.75, quantity: 71.3 },
  { id: '93f5f028-17e9-407e-876b-f85fcfa65508', articleCode: '25.30.', name: 'Zinc gutter - front', type: 'Gutter', unit: Unit.M, unitPrice: 48.9, quantity: 11.2 },
  { id: 'df393bfd-88af-42c3-acd1-ff46e7cea63c', articleCode: '25.30.', name: 'Zinc gutter - back', type: 'Gutter', unit: Unit.M, unitPrice: 48.9, quantity: 11.2 },
  { id: '22af1e15-7291-4f55-88e9-c070f70a0a2a', articleCode: '25.30.', name: 'Zinc downpipes', type: 'Downpipe', unit: Unit.M, unitPrice: 39.6, quantity: 22.4 },
  { id: '9ffab34c-2393-464e-86fb-5184f9088362', articleCode: '30.11.', name: 'Door 83 cm - bathroom', type: 'Door', unit: Unit.PIECE, unitPrice: 389, quantity: 1 },
  { id: 'b6d6d27c-3a45-4e49-bdde-1fbd5e154265', articleCode: '30.11.', name: 'Door 93 cm - living room', type: 'Door', unit: Unit.PIECE, unitPrice: 429, quantity: 1 },
  { id: '0ad5821b-bce9-4ba1-9ed9-82429f98bdbb', articleCode: '30.11.', name: 'Door 73 cm - toilet', type: 'Door', unit: Unit.PIECE, unitPrice: 369, quantity: 1 },
  { id: 'c018a08a-a93f-4755-8d44-72fd2b30638e', articleCode: '30.12.', name: 'Window - living room', type: 'Window', unit: Unit.M2, unitPrice: 412.5, quantity: 4.32 },
  { id: '9fc856cd-7309-4a9b-9a83-2e3ff6d6fed8', articleCode: '30.12.', name: 'Window - kitchen', type: 'Window', unit: Unit.M2, unitPrice: 412.5, quantity: 1.89 },
  { id: 'b16e37bb-51a8-4893-98ce-b84e8e564cf0', articleCode: '30.12.', name: 'Window - bedroom 1', type: 'Window', unit: Unit.M2, unitPrice: 412.5, quantity: 2.16 },
  { id: '6a203237-a49c-434e-81c6-813ec520a852', articleCode: '30.12.', name: 'Window - bedroom 2', type: 'Window', unit: Unit.M2, unitPrice: 412.5, quantity: 2.16 },
  { id: '25cac24b-7769-4d8b-8ae1-725550a697c7', articleCode: '30.13.', name: 'Front door - aluminium', type: 'Door', unit: Unit.PIECE, unitPrice: 2475, quantity: 1 },
  { id: '4720d0ec-3ea2-47a9-87ba-8a2b43bb22ca', articleCode: '30.13.', name: 'Sectional garage door', type: 'Door', unit: Unit.PIECE, unitPrice: 1890, quantity: 1 },
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
