import { test, expect, describe } from "bun:test";
import { extractKnownGapNumbers, nextReqNumber, formatReqId } from "../src/alloc-req-number.ts";

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
  test("zero-pads single digit to 3 digits", () => {
    const result = formatReqId(1);
    expect(result).toStartWith("REQ-");
    expect(result).toHaveLength(7);
    expect(result.endsWith("001")).toBe(true);
  });

  test("preserves 4-digit numbers without truncation", () => {
    const result = formatReqId(1234);
    expect(result).toStartWith("REQ-");
    expect(result).toHaveLength(8);
    expect(result.endsWith("1234")).toBe(true);
  });

  test("preserves 5-digit numbers without truncation", () => {
    const result = formatReqId(12345);
    expect(result).toStartWith("REQ-");
    expect(result).toHaveLength(9);
    expect(result.endsWith("12345")).toBe(true);
  });
});

describe("extractKnownGapNumbers code fence awareness (節範囲特定はコード囲みの内側の # 行を節境界として扱わない)", () => {
  test("keeps reading entries placed after a fenced block containing a heading-like line", () => {
    const policy = [
      "# 採番ポリシー",
      "",
      "## 既知の欠番",
      "",
      "REQ-090: 例",
      "",
      "```bash",
      "## 次節の例",
      "echo sample",
      "```",
      "",
      "REQ-092: 廃止",
      "",
      "## 採番ミスの是正",
      "",
      "本文",
    ].join("\n");
    expect(extractKnownGapNumbers(policy)).toEqual([90, 92]);
  });

  test("does not start the section at a heading line inside a code fence", () => {
    const policy = [
      "# 採番ポリシー",
      "",
      "```",
      "## 既知の欠番",
      "REQ-001: 例示",
      "```",
      "",
      "## 既知の欠番",
      "",
      "REQ-092: 廃止",
      "",
      "## 採番ミスの是正",
    ].join("\n");
    expect(extractKnownGapNumbers(policy)).toEqual([92]);
  });
});
