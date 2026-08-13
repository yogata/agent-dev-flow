// Bounded processing at the pipeline entry and boundary-gate stage.
//
// Covers: detectCandidates line-scan cap firing BEFORE any regex extraction,
// per-projection detection cap with typed overflow, cap/cap+1 boundary, and
// CRLF/LF/empty/trailing-newline line numbering after the split→index rewrite.

import { describe, expect, test } from "bun:test";
import {
  detectCandidates,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import {
  decideProjection,
  type ClassifyFileInput,
} from "./boundary-gate.ts";
import { MAX_LINE_SCAN } from "./boundary-reconstruction.ts";

const cfg: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function gateFor(text: string): ReturnType<typeof decideProjection>["gate"] {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", cfg).gate;
}

// G1: detectCandidates line-scan cap. A line over MAX_LINE_SCAN must return
// ONLY a typed line-scan-exceeded overflow — regex/path/URL extraction must
// NOT accumulate before the overflow fires.
describe("G1 detectCandidates line-scan cap fires before regex extraction", () => {
  test("huge line with many ADR IDs returns exactly one overflow candidate", () => {
    const huge = "ADR-0001 ".repeat(10000);
    expect(huge.length).toBeGreaterThan(MAX_LINE_SCAN);
    const cs = detectCandidates(huge, cfg);
    expect(cs).toHaveLength(1);
    expect(cs[0]?.type).toBe("overflow");
  });

  test("huge line overflow reason is line-scan-exceeded", () => {
    const huge = "x".repeat(MAX_LINE_SCAN + 100);
    const cs = detectCandidates(huge, cfg);
    const ov = cs.find((c): c is Extract<typeof c, { type: "overflow" }> => c.type === "overflow");
    expect(ov?.reason).toBe("line-scan-exceeded");
  });

  test("huge line with path and URL tokens: no path/url candidates leak", () => {
    const huge = "docs/adr/ADR-1.md https://github.com/yogata/agent-dev-flow/blob/main/x.md "
      + "x".repeat(MAX_LINE_SCAN);
    const cs = detectCandidates(huge, cfg);
    expect(cs.every((c) => c.type === "overflow")).toBe(true);
    expect(cs).toHaveLength(1);
  });

  test("line at exactly MAX_LINE_SCAN: normal extraction proceeds", () => {
    const exactLen = "ADR-0001 " + "x".repeat(MAX_LINE_SCAN - 9);
    expect(exactLen.length).toBe(MAX_LINE_SCAN);
    const cs = detectCandidates(exactLen, cfg);
    expect(cs.some((c) => c.type === "direct-id")).toBe(true);
    expect(cs.some((c) => c.type === "overflow")).toBe(false);
  });
});

// G2: per-projection detection cap. The combined failures+errors are bounded;
// once the cap is reached, exactly one typed projection-overflow Detection is
// appended and classification stops. The gate is false.
describe("G2 per-projection detection cap with typed overflow", () => {
  test("file over cap: bounded detections + exactly one projection overflow + gate false", () => {
    const text = Array.from({ length: 2000 }, (_, i) => `ADR-${String(i + 1).padStart(4, "0")}`).join("\n");
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const total = g.failures.length + g.errors.length;
    expect(total).toBeLessThanOrEqual(1025);
    expect(total).toBeGreaterThanOrEqual(1024);
    const ov = g.errors.find((d) => d.matched.includes("[overflow: projection"));
    expect(ov).toBeDefined();
    expect(ov?.classification).toBe("unclassified");
    expect(ov?.category).toBe("evasion-attempt");
  });

  test("allowed detections over cap still stop processing and fail closed", () => {
    const text = Array.from({ length: 1025 }, (_, i) => `STEP-${i + 1}`).join("\n");
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures).toEqual([]);
    expect(g.errors).toHaveLength(1);
    expect(g.errors[0]?.matched).toContain("[overflow: projection");
  });
});

// G3: cap and cap+1 boundary behavior.
describe("G3 projection cap boundary", () => {
  test("exactly 1024 detections: no projection overflow", () => {
    const ids = Array.from({ length: 1024 }, (_, i) => `ADR-${String(i + 1).padStart(4, "0")}`).join("\n");
    const g = gateFor(ids);
    expect(g.failures.length + g.errors.length).toBe(1024);
    expect(g.errors.some((d) => d.matched.includes("[overflow: projection"))).toBe(false);
  });

  test("1025 detections: projection overflow appended, total bounded to 1025", () => {
    const ids = Array.from({ length: 1025 }, (_, i) => `ADR-${String(i + 1).padStart(4, "0")}`).join("\n");
    const g = gateFor(ids);
    expect(g.failures.length + g.errors.length).toBe(1025);
    expect(g.errors.some((d) => d.matched.includes("[overflow: projection"))).toBe(true);
  });
});

// G4: line numbering under CRLF, LF, empty file, trailing newline.
describe("G4 multi-line CRLF/LF/empty/trailing-newline line numbering", () => {
  test("LF: line numbers are 1-based correct", () => {
    const text = "clean line\nADR-0001\nclean";
    const g = gateFor(text);
    const det = g.failures[0];
    expect(det?.line).toBe(2);
  });

  test("CRLF: line numbers are 1-based correct (\\r stripped, not counted)", () => {
    const text = "clean line\r\nADR-0001\r\nclean";
    const g = gateFor(text);
    expect(g.failures[0]?.line).toBe(2);
  });

  test("empty file: gate passes with no detections", () => {
    const g = gateFor("");
    expect(g.pass).toBe(true);
    expect(g.failures).toEqual([]);
    expect(g.errors).toEqual([]);
  });

  test("trailing newline: no phantom empty last line detection", () => {
    const text = "ADR-0001\n";
    const g = gateFor(text);
    expect(g.failures).toHaveLength(1);
    expect(g.failures[0]?.line).toBe(1);
  });

  test("CRLF trailing newline: no phantom empty last line detection", () => {
    const text = "ADR-0001\r\n";
    const g = gateFor(text);
    expect(g.failures).toHaveLength(1);
    expect(g.failures[0]?.line).toBe(1);
  });
});
