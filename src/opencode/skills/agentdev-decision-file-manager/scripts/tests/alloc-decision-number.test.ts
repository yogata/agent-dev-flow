import { test, expect, describe } from "bun:test";
import { nextDecisionNumber, formatDecisionId } from "../src/alloc-decision-number.ts";

describe("nextDecisionNumber", () => {
  test("returns 1 for empty list", () => {
    expect(nextDecisionNumber([])).toBe(1);
  });

  test("returns max+1 for non-empty list", () => {
    expect(nextDecisionNumber([127, 128, 129])).toBe(130);
  });

  test("does not backfill gaps", () => {
    expect(nextDecisionNumber([101, 105])).toBe(106);
  });

  test("ignores invalid values", () => {
    expect(nextDecisionNumber([131, -1, Number.NaN])).toBe(132);
  });
});

describe("formatDecisionId", () => {
  test("zero-pads to 3 digits", () => {
    expect(formatDecisionId(1)).toBe("DEC-001");
  });

  test("preserves numbers already at or above 3 digits", () => {
    expect(formatDecisionId(131)).toBe("DEC-131");
  });
});
