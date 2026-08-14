// Tests for GENERIC_ID_PATTERN stateful behavior fix.
//
// Bug: The /g flag on GENERIC_ID_PATTERN causes .test() to advance lastIndex,
// making subsequent detectCandidates calls return empty results (call-order-dependent fail-open).
//
// This test file verifies that:
// 1. GENERIC_ID_PATTERN.test() can be called multiple times with consistent results
// 2. detectCandidates() can be called multiple times with consistent results
// 3. Multiple IDs are extracted (not just the first)
// 4. GENERIC_ID_PATTERN.test() and detectCandidates() don't interfere with each other

import { describe, expect, test } from "bun:test";
import {
  detectCandidates,
  GENERIC_ID_PATTERN,
  type DetectorConfig,
} from "./boundary-pipeline.ts";

const baseConfig: DetectorConfig = {
  repository_identity: {
    owner_slash_name: "yogata/agent-dev-flow",
    default_branch: "main",
  },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

describe("GENERIC_ID_PATTERN stateful behavior", () => {
  test("test() returns true twice in a row for same input", () => {
    // Bug: second call returns false due to lastIndex advance
    const text = "ADR-0001";
    const first = GENERIC_ID_PATTERN.test(text);
    const second = GENERIC_ID_PATTERN.test(text);

    expect(first).toBe(true);
    expect(second).toBe(true);
  });

  test("test() can be called repeatedly on different inputs", () => {
    const text1 = "REQ-1234";
    const text2 = "DEC-5678";
    const text3 = "SPEC-9999";

    expect(GENERIC_ID_PATTERN.test(text1)).toBe(true);
    expect(GENERIC_ID_PATTERN.test(text2)).toBe(true);
    expect(GENERIC_ID_PATTERN.test(text3)).toBe(true);
    // All should work regardless of call order
  });

  test("detectCandidates returns same results on repeated calls with same input", () => {
    const line = "See ADR-0001 and REQ-0002 for details.";
    const first = detectCandidates(line, baseConfig);
    const second = detectCandidates(line, baseConfig);

    // Both calls should return identical results
    expect(first).toEqual(second);
    // Both should find the IDs
    expect(first.length).toBeGreaterThan(0);
  });

  test("detectCandidates extracts all IDs in a line", () => {
    const line = "ADR-0001 REQ-0002 DEC-0003 SPEC-0004";
    const result = detectCandidates(line, baseConfig);

    // Should find all 4 IDs, not just the first
    const directIds = result.filter((c) => c.type === "direct-id");
    expect(directIds.length).toBe(4);
    expect(directIds[0]?.value).toBe("ADR-0001");
    expect(directIds[1]?.value).toBe("REQ-0002");
    expect(directIds[2]?.value).toBe("DEC-0003");
    expect(directIds[3]?.value).toBe("SPEC-0004");
  });

  test("GENERIC_ID_PATTERN.test() then detectCandidates() both work correctly", () => {
    const line = "ADR-0001 REQ-0002";

    // First call test()
    const testResult = GENERIC_ID_PATTERN.test(line);
    expect(testResult).toBe(true);

    // Then call detectCandidates()
    const detectResult = detectCandidates(line, baseConfig);
    const directIds = detectResult.filter((c) => c.type === "direct-id");

    // Should still find all IDs, not affected by test() call
    expect(directIds.length).toBe(2);
  });

  test("detectCandidates() then GENERIC_ID_PATTERN.test() both work correctly", () => {
    const line = "ADR-0001 REQ-0002";

    // First call detectCandidates()
    const detectResult = detectCandidates(line, baseConfig);
    const directIds = detectResult.filter((c) => c.type === "direct-id");
    expect(directIds.length).toBe(2);

    // Then call test()
    const testResult = GENERIC_ID_PATTERN.test(line);
    // test() should still work
    expect(testResult).toBe(true);
  });

  test("test() returns false for non-matching input consistently", () => {
    const text = "no-ids-here";
    const first = GENERIC_ID_PATTERN.test(text);
    const second = GENERIC_ID_PATTERN.test(text);

    expect(first).toBe(false);
    expect(second).toBe(false);
  });

  test("detectCandidates handles line with no IDs consistently", () => {
    const line = "Just prose, no references.";
    const first = detectCandidates(line, baseConfig);
    const second = detectCandidates(line, baseConfig);

    expect(first).toEqual(second);
    expect(first).toEqual([]);
  });

  test("multiple detectCandidates calls with different inputs work correctly", () => {
    const line1 = "ADR-0001";
    const line2 = "REQ-0002";
    const line3 = "Both ADR-0003 and REQ-0004";

    const result1 = detectCandidates(line1, baseConfig);
    const result2 = detectCandidates(line2, baseConfig);
    const result3 = detectCandidates(line3, baseConfig);

    expect(result1.filter((c) => c.type === "direct-id").length).toBe(1);
    expect(result2.filter((c) => c.type === "direct-id").length).toBe(1);
    expect(result3.filter((c) => c.type === "direct-id").length).toBe(2);
  });
});