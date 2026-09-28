import { Prisma } from '../generated/prisma/client.js';

interface TreeArticle {
  id: number;
  parentId: number | null;
}

interface PricedObject {
  articleId: number;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
}

export function lineTotal(object: PricedObject): Prisma.Decimal {
  return object.quantity.mul(object.unitPrice);
}

// The one place where totals are added up, so /summary and the article pages always agree.
// Every article's total is the sum of the objects in its whole subtree, unrounded.
export function rollUpTotals(articles: TreeArticle[], objects: PricedObject[]) {
  const parentIdOf = new Map(articles.map((article) => [article.id, article.parentId]));
  const totals = new Map(articles.map((article) => [article.id, new Prisma.Decimal(0)]));

  for (const object of objects) {
    const amount = lineTotal(object);
    // Walk up from the object's article to the top, adding the amount at every level.
    // The code rule makes cycles impossible, so this loop always ends.
    let id: number | null = object.articleId;
    while (id !== null) {
      totals.set(id, totals.get(id)!.add(amount));
      id = parentIdOf.get(id) ?? null;
    }
  }
  return totals;
}
