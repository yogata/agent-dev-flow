import { test, expect, describe } from "bun:test";
import {
  nextRowNumber,
  formatCompositeId,
  extractAllCompositeIds,
} from "../src/alloc-composite-id.ts";
import { extractCompositeIdNumbers } from "../lib/frontmatter.ts";

describe("nextRowNumber", () => {
  test("returns 1 for empty list", () => {
    expect(nextRowNumber([])).toBe(1);
  });

  test("returns max+1 for non-empty list", () => {
    expect(nextRowNumber([1, 2, 3])).toBe(4);
  });

  test("does not backfill gaps", () => {
    expect(nextRowNumber([1, 5, 10])).toBe(11);
  });
});

describe("formatCompositeId", () => {
  test("formats REQ-NNNN-MMM with zero-padding", () => {
    expect(formatCompositeId(103, 1)).toBe("REQ-0103-001");
    expect(formatCompositeId(1234, 56)).toBe("REQ-1234-056");
  });
});

describe("extractAllCompositeIds", () => {
  test("extracts all REQ-NNNN-MMM patterns from content", () => {
    const content = `
Some text REQ-0103-001 and REQ-0103-002.
REQ-0102-005 is also matched.
Not REQ-0103 or REQ-NNNN-MMM pattern.
`;
    const ids = extractAllCompositeIds(content);
    expect(ids).toEqual(["REQ-0103-001", "REQ-0103-002", "REQ-0102-005"]);
  });

  test("returns empty array when no IDs match", () => {
    const content = "No IDs here";
    expect(extractAllCompositeIds(content)).toEqual([]);
  });

  test("extracts 3-digit REQ IDs (REQ-NNN-MMM) consistently with 4-digit", () => {
    const content = `
3-digit: REQ-001-001, REQ-008-003, REQ-010-002
4-digit: REQ-0011-005
Neither: REQ-12-001 (too short), REQ-12345-001 (too long)
`;
    const ids = extractAllCompositeIds(content);
    expect(ids).toEqual([
      "REQ-001-001",
      "REQ-008-003",
      "REQ-010-002",
      "REQ-0011-005",
    ]);
  });

  test("mixed 3-digit and 4-digit REQ IDs return correct max via extractCompositeIdNumbers (REQ-ID 形式契約の一律性)", () => {
    const content = `
REQ-001-001
REQ-003-002
REQ-006-004
REQ-008-007
REQ-010-003
REQ-0011-009
`;
    const ids = extractAllCompositeIds(content);

    const parsed = ids
      .map((id) => extractCompositeIdNumbers(id))
      .filter((p): p is { req: number; row: number } => p !== null);

    const maxRow = parsed.reduce((acc, p) => (p.row > acc ? p.row : acc), 0);
    expect(maxRow).toBe(9);

    const req8Rows = parsed
      .filter((p) => p.req === 8)
      .map((p) => p.row);
    expect(req8Rows).toEqual([7]);
  });
});
