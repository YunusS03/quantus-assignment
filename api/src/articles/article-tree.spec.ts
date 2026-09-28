import { subtreeIds } from './article-tree.js';

const articles = [
  { id: 1, parentId: null }, // 25.
  { id: 2, parentId: 1 }, //    25.10.
  { id: 3, parentId: 1 }, //    25.20.
  { id: 4, parentId: 3 }, //       25.20.10.
  { id: 5, parentId: null }, // 30.
  { id: 6, parentId: 5 }, //    30.11.
];

describe('subtreeIds', () => {
  it('returns only the article itself when it has no sub-articles', () => {
    expect(subtreeIds(articles, 2)).toEqual([2]);
  });

  it('includes sub-articles at every depth', () => {
    expect(subtreeIds(articles, 1).sort()).toEqual([1, 2, 3, 4]);
  });

  it('leaves out other branches', () => {
    expect(subtreeIds(articles, 3).sort()).toEqual([3, 4]);
  });
});
