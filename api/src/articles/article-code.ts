// A child's code is its parent's code plus one group ("20." -> "20.11."); a top-level code is one group.
export function codeFitsParent(code: string, parentCode: string | null): boolean {
  // Drop the last group: "20.11.10." -> "20.11.", and "20." -> "".
  const withoutLastGroup = code.slice(0, code.slice(0, -1).lastIndexOf('.') + 1);
  const expectedParentCode = withoutLastGroup === '' ? null : withoutLastGroup;
  return expectedParentCode === parentCode;
}
