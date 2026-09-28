interface TreeArticle {
  id: number;
  parentId: number | null;
}

// The article itself plus every article below it, at any depth.
export function subtreeIds(articles: TreeArticle[], rootId: number): number[] {
  const ids = [rootId];
  // The list grows while we loop: each id found adds its own children to the end.
  for (let i = 0; i < ids.length; i++) {
    for (const article of articles) {
      if (article.parentId === ids[i]) {
        ids.push(article.id);
      }
    }
  }
  return ids;
}
