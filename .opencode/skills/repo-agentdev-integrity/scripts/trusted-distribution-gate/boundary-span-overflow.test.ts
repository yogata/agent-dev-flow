// Stage A fresh-review blocker coverage: X fixed-width, U exact-contract,
// span-aware reconstruction, and bounded evidence. Extracted into its own
// module so boundary-pipeline-evasion.test.ts stays under the 250 pure LOC
// ceiling (parent defect #12). Each describe maps to one fresh-review
// blocker from the goal/code/security lanes.
//
// Blocker map (fresh-review blocker -> describe):
//   C1 X fixed-width misses valid escapes  -> "C1 X fixed-width"
//   C2 U exact-contract malformed digit-run -> "C2 U exact-contract"
//   C3 span-aware reconstruction           -> "C3 span-aware reconstruction"
//   C4 bounded evidence / fail-closed      -> "C4 bounded evidence"

import { describe, expect, test } from "bun:test";
import { detectReconstructedIds } from "./boundary-reconstruction.ts";
import {
  classifyLine,
  detectCandidates,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-pipeline.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function cls(text: string) {
  return classifyLine({ text, lineNumber: 1, filePath: "f.md", projection: "source" }, baseConfig);
}

function gateFor(text: string) {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", baseConfig).gate;
}

// C1: \xXX is fixed width 2. The old negative lookahead (?![0-9A-Fa-f])
// rejected every case where the char after the two hex digits was itself a
// hex letter/digit, which is exactly the reconstructed-ID shape.
describe("C1 X fixed-width catches valid fixed-width x escapes", () => {
  test("\\x41DR-0001 reconstructs ADR-0001 (prefix via \\x41)", () => {
    const r = cls("See \\x41DR-0001 here.");
    const ev = r.detections.find((d) => d.category === "evasion-attempt");
    expect(ev?.classification).toBe("producer-internal");
    expect(ev?.matched).toBe("\\x41DR-0001");
  });

  test("ADR\\x2d0001 reconstructs ADR-0001 (escaped hyphen via \\x2d)", () => {
    const r = cls("See ADR\\x2d0001 here.");
    const ev = r.detections.find((d) => d.category === "evasion-attempt");
    expect(ev?.classification).toBe("producer-internal");
    expect(ev?.matched).toBe("ADR\\x2d0001");
  });

  test("ADR-\\x310 reconstructs ADR-10 (suffix digit via \\x31 + literal 0)", () => {
    const r = cls("See ADR-\\x310 here.");
    const ev = r.detections.find((d) => d.category === "evasion-attempt");
    expect(ev?.classification).toBe("producer-internal");
    expect(ev?.matched).toBe("ADR-\\x310");
  });

  test("detectReconstructedIds decodes all three X forms", () => {
    expect(detectReconstructedIds("\\x41DR-0001").map((x) => x.decoded)).toContain("ADR-0001");
    expect(detectReconstructedIds("ADR\\x2d0001").map((x) => x.decoded)).toContain("ADR-0001");
    expect(detectReconstructedIds("ADR-\\x310").map((x) => x.decoded)).toContain("ADR-10");
  });
});

// C2: \uXXXX is exact contract. A digit-valued escape immediately followed
// by another hex digit is a malformed digit-continuation run and must NOT
// decode (left as literal text -> clean). Non-digit escapes followed by a
// hex-looking literal still decode.
describe("C2 U exact-contract rejects malformed digit-continuation", () => {
  test("ADR-\\u00310 is clean (digit-continuation rejected)", () => {
    expect(cls("See ADR-\\u00310 here.").detections).toEqual([]);
  });

  test("detectReconstructedIds yields nothing for ADR-\\u00310", () => {
    expect(detectReconstructedIds("ADR-\\u00310")).toEqual([]);
  });

  test("\\u0041DR-0001 still reconstructs (non-digit escape + hex literal)", () => {
    const r = cls("See \\u0041DR-0001 here.");
    const ev = r.detections.find((d) => d.category === "evasion-attempt");
    expect(ev?.classification).toBe("producer-internal");
  });

  test("ADR\\u002d0001 still reconstructs (escaped hyphen, non-digit)", () => {
    expect(gateFor("See ADR\\u002d0001.").pass).toBe(false);
  });

  test("STEP-\\u0031 and QG-\\u0032 still fail-closed (digit, non-hex follower)", () => {
    const step = cls("See STEP-\\u0031 here.").detections.find((d) => d.category === "evasion-attempt");
    expect(step?.classification).toBe("unclassified");
    const qg = cls("See QG-\\u0032 here.").detections.find((d) => d.category === "evasion-attempt");
    expect(qg?.classification).toBe("unclassified");
  });
});

// C3: span-aware reconstruction. An ID is emitted only when its own decoded
// span includes an escape atom, or an escape atom creates the boundary that
// exposes it. A literal ID sharing a token with an unrelated escape is NOT
// emitted as reconstructed. `matched` is the minimal relevant source span.
describe("C3 span-aware reconstruction", () => {
  test("STEP-1\\u0020ADR-0002 emits only reconstructed ADR-0002, minimal span", () => {
    const g = gateFor("See STEP-1\\u0020ADR-0002.");
    expect(g.failures).toHaveLength(1);
    expect(g.errors).toHaveLength(0);
    const f = g.failures[0];
    expect(f?.category).toBe("evasion-attempt");
    expect(f?.matched).toBe("\\u0020ADR-0002");
  });

  test("STEP-1\\u0020text stays clean at the gate (direct STEP-1 allowed, no reconstructed false positive)", () => {
    const g = gateFor("See STEP-1\\u0020text here.");
    expect(g.pass).toBe(true);
    expect(g.failures).toEqual([]);
    expect(g.errors).toEqual([]);
  });

  test("QG-2\\x20prose stays clean at the gate", () => {
    const g = gateFor("See QG-2\\x20prose here.");
    expect(g.pass).toBe(true);
  });

  test("UTF-8\\u0020text stays clean (no detection at all)", () => {
    const g = gateFor("See UTF-8\\u0020text here.");
    expect(g.pass).toBe(true);
    expect(g.failures).toEqual([]);
    expect(g.errors).toEqual([]);
  });

  test("matched is minimal relevant span, not maximal token", () => {
    const r = cls("See STEP-1\\u0020ADR-0002.");
    const ev = r.detections.find((d) => d.category === "evasion-attempt" && d.classification === "producer-internal");
    expect(ev?.matched).toBe("\\u0020ADR-0002");
    expect(ev?.matched).not.toContain("STEP-1");
  });
});

// C4: bounded evidence. Per-line/per-token candidate counts are bounded; on
// overflow a single typed overflow candidate fails the gate closed.
// Detection.text is bounded so a long line cannot amplify per detection.
describe("C4 bounded evidence and fail-closed overflow", () => {
  test("Detection.text is bounded below the full line length", () => {
    const long = "x".repeat(5000) + " ADR-0001";
    const d = cls(long).detections;
    const det = d.find((x) => x.matched === "ADR-0001");
    expect(det).toBeDefined();
    expect((det?.text.length ?? 9999) < long.length).toBe(true);
    expect((det?.text.length ?? 9999) <= 200).toBe(true);
  });

  test("moderate repeated payload is bounded and fails closed (no amplification)", () => {
    const rep = "\\u0041DR-0001 ".repeat(300);
    const g = gateFor(rep);
    const total = g.failures.length + g.errors.length;
    expect(g.pass).toBe(false);
    expect(total).toBeLessThanOrEqual(65);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  test("overflow yields exactly one unclassified/evasion-attempt error", () => {
    const rep = "\\u0041DR-0001 ".repeat(300);
    const g = gateFor(rep);
    const overflow = g.errors.find((e) => e.category === "evasion-attempt" && e.classification === "unclassified");
    expect(overflow).toBeDefined();
  });

  test("detectCandidates bounds candidate count on pathological input", () => {
    const rep = "\\u0041DR-0001 ".repeat(300);
    const cs = detectCandidates(rep, baseConfig);
    expect(cs.length).toBeLessThanOrEqual(65);
  });
});
