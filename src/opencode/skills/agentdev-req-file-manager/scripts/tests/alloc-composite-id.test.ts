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
  test("formats with zero-padded req and row numbers", () => {
    const result = formatCompositeId(103, 1);
    expect(result).toMatch(/^REQ-\d+-\d{3}$/);
    expect(result).toContain("0103");
    expect(result).toContain("001");
  });

  test("preserves large req and row numbers", () => {
    const result = formatCompositeId(1234, 56);
    expect(result).toMatch(/^REQ-\d+-\d{3}$/);
    expect(result).toContain("1234");
    expect(result).toContain("056");
  });
});

describe("extractAllCompositeIds", () => {
  test("extracts IDs that formatCompositeId produces", () => {
    const id1 = formatCompositeId(103, 1);
    const id2 = formatCompositeId(103, 2);
    const id3 = formatCompositeId(102, 5);
    const content = `Some text ${id1} and ${id2}.\n${id3} is also matched.`;
    const ids = extractAllCompositeIds(content);
    expect(ids).toEqual([id1, id2, id3]);
  });

  test("returns empty array when no IDs match", () => {
    expect(extractAllCompositeIds("No IDs here")).toEqual([]);
  });

  test("round-trips formatCompositeId output for various inputs", () => {
    for (const [req, row] of [[1, 1], [8, 3], [10, 2], [11, 5], [9999, 999]]) {
      const id = formatCompositeId(req, row);
      const extracted = extractAllCompositeIds(id);
      expect(extracted).toEqual([id]);
    }
  });

  test("mixed inputs return correct max row via extractCompositeIdNumbers", () => {
    const ids = [
      formatCompositeId(1, 1),
      formatCompositeId(3, 2),
      formatCompositeId(6, 4),
      formatCompositeId(8, 7),
      formatCompositeId(10, 3),
      formatCompositeId(11, 9),
    ];
    const content = ids.join("\n");
    const extracted = extractAllCompositeIds(content);

    const parsed = extracted
      .map((id) => extractCompositeIdNumbers(id))
      .filter((p): p is { req: number; row: number } => p !== null);

    const maxRow = parsed.reduce((acc, p) => (p.row > acc ? p.row : acc), 0);
    expect(maxRow).toBe(9);

    const req8Rows = parsed.filter((p) => p.req === 8).map((p) => p.row);
    expect(req8Rows).toEqual([7]);
  });
});
