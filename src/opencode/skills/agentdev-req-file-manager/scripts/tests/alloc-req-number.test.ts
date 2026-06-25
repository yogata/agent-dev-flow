import { test, expect, describe } from "bun:test";
import { nextReqNumber, formatReqId } from "../src/alloc-req-number.ts";

describe("nextReqNumber", () => {
  test("returns 1 for empty list", () => {
    expect(nextReqNumber([])).toBe(1);
  });

  test("returns max+1 for non-empty list", () => {
    expect(nextReqNumber([101, 102, 103])).toBe(104);
  });

  test("returns max+1 ignoring gaps (no backfill)", () => {
    expect(nextReqNumber([101, 103])).toBe(104);
  });

  test("returns max+1 when list has single element", () => {
    expect(nextReqNumber([152])).toBe(153);
  });

  test("ignores non-positive and NaN values", () => {
    expect(nextReqNumber([101, -5, 0, Number.NaN])).toBe(102);
  });
});

describe("formatReqId", () => {
  test("zero-pads to 4 digits", () => {
    expect(formatReqId(1)).toBe("REQ-0001");
  });

  test("preserves 4-digit numbers", () => {
    expect(formatReqId(1234)).toBe("REQ-1234");
  });

  test("preserves 5-digit numbers", () => {
    expect(formatReqId(12345)).toBe("REQ-12345");
  });
});
