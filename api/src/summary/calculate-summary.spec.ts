import { Prisma } from '../generated/prisma/client.js';
import { calculateSummary } from './calculate-summary.js';

function article(id: number, code: string, parentId: number | null = null) {
  return { id, code, title: `Article ${code}`, parentId };
}

function object(articleId: number, quantity: string, unitPrice: string) {
  return {
    articleId,
    quantity: new Prisma.Decimal(quantity),
    unitPrice: new Prisma.Decimal(unitPrice),
  };
}

describe('calculateSummary', () => {
  it('rolls an object two levels deep up into its top-level article', () => {
    const articles = [article(1, '20.'), article(2, '20.11.', 1), article(3, '20.11.10.', 2)];
    const objects = [object(3, '10', '5')];

    const summary = calculateSummary(articles, objects);

    expect(summary.articles).toEqual([{ id: 1, code: '20.', title: 'Article 20.', subtotal: 50 }]);
  });

  // Equal to the sum of the unrounded subtotals; the last test shows the rounded ones can differ by a cent.
  it('makes the grand total equal to the sum of the subtotals', () => {
    const articles = [article(1, '20.'), article(2, '20.11.', 1), article(3, '30.')];
    const objects = [object(1, '2', '10'), object(2, '1', '5.5'), object(3, '4', '25')];

    const summary = calculateSummary(articles, objects);

    const sumOfSubtotals = summary.articles.reduce((sum, a) => sum + a.subtotal, 0);
    expect(summary.grandTotal).toBe(sumOfSubtotals);
    expect(summary.grandTotal).toBe(125.5);
  });

  it('gives an article without objects a subtotal of 0', () => {
    const articles = [article(1, '40.'), article(2, '40.11.', 1)];

    const summary = calculateSummary(articles, []);

    expect(summary.articles).toEqual([{ id: 1, code: '40.', title: 'Article 40.', subtotal: 0 }]);
    expect(summary.grandTotal).toBe(0);
  });

  it('adds decimals exactly: 3 x (0.1 x 1) is 0.30, not 0.30000000000000004', () => {
    const articles = [article(1, '20.')];
    const objects = [object(1, '0.1', '1'), object(1, '0.1', '1'), object(1, '0.1', '1')];

    const summary = calculateSummary(articles, objects);

    expect(summary.articles[0].subtotal).toBe(0.3);
    expect(summary.grandTotal).toBe(0.3);
  });

  it('totals multiple top-level articles separately', () => {
    const articles = [article(1, '20.'), article(2, '30.'), article(3, '30.11.', 2)];
    const objects = [object(1, '1', '100'), object(3, '2', '40')];

    const summary = calculateSummary(articles, objects);

    expect(summary.articles).toEqual([
      { id: 1, code: '20.', title: 'Article 20.', subtotal: 100 },
      { id: 2, code: '30.', title: 'Article 30.', subtotal: 80 },
    ]);
  });

  it('rounds only at the end: two subtotals of 1.125 show as 1.13 each, the grand total as 2.25', () => {
    const articles = [article(1, '20.'), article(2, '30.')];
    const objects = [object(1, '0.5', '2.25'), object(2, '0.5', '2.25')];

    const summary = calculateSummary(articles, objects);

    expect(summary.articles.map((a) => a.subtotal)).toEqual([1.13, 1.13]);
    // Adding the rounded subtotals would give 2.26; the unrounded sum 2.25 is the exact total.
    expect(summary.grandTotal).toBe(2.25);
  });
});
