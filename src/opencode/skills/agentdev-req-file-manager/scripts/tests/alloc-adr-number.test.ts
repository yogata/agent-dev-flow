import { test, expect, describe } from "bun:test";
import { nextAdrNumber, formatAdrId } from "../src/alloc-adr-number.ts";

describe("nextAdrNumber", () => {
  test("returns 1 for empty list", () => {
    expect(nextAdrNumber([])).toBe(1);
  });

  test("returns max+1 for non-empty list", () => {
    expect(nextAdrNumber([127, 128, 129])).toBe(130);
  });

  test("does not backfill gaps", () => {
    expect(nextAdrNumber([101, 105])).toBe(106);
  });

  test("ignores invalid values", () => {
    expect(nextAdrNumber([131, -1, Number.NaN])).toBe(132);
  });
});

describe("formatAdrId", () => {
  test("zero-pads to 4 digits", () => {
    expect(formatAdrId(1)).toBe("ADR-0001");
  });

  test("preserves 4-digit numbers", () => {
    expect(formatAdrId(131)).toBe("ADR-0131");
  });
});
