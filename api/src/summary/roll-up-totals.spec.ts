import { Prisma } from '../generated/prisma/client.js';
import { lineTotal, rollUpTotals } from './roll-up-totals.js';

const articles = [
  { id: 1, parentId: null }, // 20.
  { id: 2, parentId: 1 }, //    20.11.
  { id: 3, parentId: 2 }, //       20.11.10.
  { id: 4, parentId: null }, // 30.
];

function object(articleId: number, quantity: string, unitPrice: string) {
  return { articleId, quantity: new Prisma.Decimal(quantity), unitPrice: new Prisma.Decimal(unitPrice) };
}

describe('lineTotal', () => {
  it('multiplies quantity by unit price without rounding', () => {
    expect(lineTotal(object(1, '0.5', '2.25')).toString()).toBe('1.125');
  });
});

describe('rollUpTotals', () => {
  it('adds an object to its own article and every article above it', () => {
    const totals = rollUpTotals(articles, [object(3, '2', '10')]);

    expect(totals.get(3)?.toNumber()).toBe(20);
    expect(totals.get(2)?.toNumber()).toBe(20);
    expect(totals.get(1)?.toNumber()).toBe(20);
  });

  it('gives a middle-level article the sum of its whole subtree', () => {
    const totals = rollUpTotals(articles, [object(2, '1', '5'), object(3, '2', '10')]);

    expect(totals.get(2)?.toNumber()).toBe(25);
    expect(totals.get(3)?.toNumber()).toBe(20);
  });

  it('leaves other branches untouched and gives empty articles 0', () => {
    const totals = rollUpTotals(articles, [object(3, '2', '10')]);

    expect(totals.get(4)?.toNumber()).toBe(0);
  });

  it('keeps full precision: two lines of 1.125 total 2.25', () => {
    const totals = rollUpTotals(articles, [object(3, '0.5', '2.25'), object(3, '0.5', '2.25')]);

    expect(totals.get(1)?.toString()).toBe('2.25');
  });
});
