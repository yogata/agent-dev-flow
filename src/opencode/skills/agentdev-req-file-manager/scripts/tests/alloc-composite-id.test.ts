import { test, expect, describe } from "bun:test";
import {
  nextRowNumber,
  formatCompositeId,
  extractAllCompositeIds,
} from "../src/alloc-composite-id.ts";

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
});
