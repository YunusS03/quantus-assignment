import { codeFitsParent } from './article-code.js';

describe('codeFitsParent', () => {
  it('accepts a child that is one group deeper than its parent', () => {
    expect(codeFitsParent('20.11.', '20.')).toBe(true);
    expect(codeFitsParent('20.11.10.', '20.11.')).toBe(true);
  });

  it('accepts a single-group code at the top level', () => {
    expect(codeFitsParent('20.', null)).toBe(true);
  });

  it('rejects a child that skips a level', () => {
    expect(codeFitsParent('20.11.10.', '20.')).toBe(false);
  });

  it('rejects a child from another branch', () => {
    expect(codeFitsParent('30.11.', '20.')).toBe(false);
  });

  it('rejects a multi-group code at the top level', () => {
    expect(codeFitsParent('20.11.', null)).toBe(false);
  });

  // These two show why no separate cycle check is needed.
  it('rejects an article as its own parent', () => {
    expect(codeFitsParent('20.', '20.')).toBe(false);
  });

  it('rejects moving an article under its own child', () => {
    expect(codeFitsParent('20.', '20.11.')).toBe(false);
  });
});
