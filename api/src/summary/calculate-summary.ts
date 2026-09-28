import { Prisma } from '../generated/prisma/client.js';
import { toMoney } from '../money.js';

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
  const parentIdOf = new Map(articles.map((article) => [article.id, article.parentId]));

  // Walk up the parent chain until an article has no parent. The code rule
  // makes cycles impossible, so this loop always ends.
  function topLevelIdOf(articleId: number): number {
    let id = articleId;
    let parentId = parentIdOf.get(id) ?? null;
    while (parentId !== null) {
      id = parentId;
      parentId = parentIdOf.get(id) ?? null;
    }
    return id;
  }

  const topLevelArticles = articles.filter((article) => article.parentId === null);
  const subtotals = new Map(topLevelArticles.map((article) => [article.id, new Prisma.Decimal(0)]));

  // Same snapshot + foreign key: every object's article is in the list, so the lookup can't miss.
  for (const object of objects) {
    const topLevelId = topLevelIdOf(object.articleId);
    const lineTotal = object.quantity.mul(object.unitPrice);
    subtotals.set(topLevelId, subtotals.get(topLevelId)!.add(lineTotal));
  }

  // Add the unrounded subtotals and round only for output: the grand total is exact,
  // even if the rounded subtotals shown next to it differ by a cent.
  let grandTotal = new Prisma.Decimal(0);
  for (const subtotal of subtotals.values()) {
    grandTotal = grandTotal.add(subtotal);
  }

  return {
    articles: topLevelArticles.map((article) => ({
      id: article.id,
      code: article.code,
      title: article.title,
      subtotal: toMoney(subtotals.get(article.id)!),
    })),
    grandTotal: toMoney(grandTotal),
  };
}
