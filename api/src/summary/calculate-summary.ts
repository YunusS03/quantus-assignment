import { Prisma } from '../generated/prisma/client.js';
import { toMoney } from '../money.js';
import { rollUpTotals } from './roll-up-totals.js';

interface SummaryArticle {
  id: number;
  code: string;
  title: string;
  parentId: number | null;
}

interface SummaryObject {
  articleId: number;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
}

// A top-level article's subtotal is the sum of the objects anywhere below it, at any depth.
export function calculateSummary(articles: SummaryArticle[], objects: SummaryObject[]) {
  const totals = rollUpTotals(articles, objects);
  const topLevelArticles = articles.filter((article) => article.parentId === null);

  // Add the unrounded subtotals and round only for output: the grand total is exact,
  // even if the rounded subtotals shown next to it differ by a cent.
  let grandTotal = new Prisma.Decimal(0);
  for (const article of topLevelArticles) {
    grandTotal = grandTotal.add(totals.get(article.id)!);
  }

  return {
    articles: topLevelArticles.map((article) => ({
      id: article.id,
      code: article.code,
      title: article.title,
      subtotal: toMoney(totals.get(article.id)!),
    })),
    grandTotal: toMoney(grandTotal),
  };
}
