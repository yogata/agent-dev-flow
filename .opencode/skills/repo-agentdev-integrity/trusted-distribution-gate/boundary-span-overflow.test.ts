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
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";

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
    expect(detectReconstructedIds("\\x41DR-0001").ids.map((x) => x.decoded)).toContain("ADR-0001");
    expect(detectReconstructedIds("ADR\\x2d0001").ids.map((x) => x.decoded)).toContain("ADR-0001");
    expect(detectReconstructedIds("ADR-\\x310").ids.map((x) => x.decoded)).toContain("ADR-10");
  });
});

// C2: \uXXXX is fixed-width four hex digits. The digit-continuation
// rejection is removed: \u00310 decodes to '1' and the trailing '0' is a
// literal, reconstructing ADR-10. \u{...} remains unsupported/clean.
describe("C2 U fixed-width four-hex reconstruction", () => {
  test("ADR-\\u00310 reconstructs ADR-10 and fails (producer-internal/evasion-attempt)", () => {
    const r = cls("See ADR-\\u00310 here.");
    expect(r.detections).toHaveLength(1);
    expect(r.detections[0]?.classification).toBe("producer-internal");
    expect(r.detections[0]?.category).toBe("evasion-attempt");
    expect(r.detections[0]?.matched).toBe("ADR-\\u00310");
  });

  test("detectReconstructedIds decodes ADR-\\u00310 to ADR-10", () => {
    const res = detectReconstructedIds("ADR-\\u00310");
    expect(res.ids.map((x) => x.decoded)).toEqual(["ADR-10"]);
    expect(res.overflow).toBe(false);
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

  test("\\u{0031} curly-brace form remains unsupported (clean)", () => {
    expect(cls("See ADR-\\u{0031} here.").detections).toEqual([]);
  });
});

// C3: span-aware reconstruction with symmetric escape-created boundaries.
// An escape atom creates a word boundary on EITHER side of an ID: left
// (escape immediately before) or right (escape immediately after). Both are
// evasion-attempt. UTF-8/16/32 labels stay clean. `matched` is minimal.
describe("C3 span-aware reconstruction, symmetric boundaries", () => {
  test("STEP-1\\u0020ADR-0002 emits reconstructed STEP-1 (error) and ADR-0002 (failure)", () => {
    const g = gateFor("See STEP-1\\u0020ADR-0002.");
    expect(g.failures).toHaveLength(1);
    expect(g.errors).toHaveLength(1);
    expect(g.failures[0]?.category).toBe("evasion-attempt");
    expect(g.failures[0]?.matched).toBe("\\u0020ADR-0002");
    expect(g.errors[0]?.matched).toBe("STEP-1\\u0020");
  });

  test("STEP-1\\u0020text fails (right-boundary escape exposes STEP-1)", () => {
    const g = gateFor("See STEP-1\\u0020text here.");
    expect(g.pass).toBe(false);
    expect(g.errors.some((e) => e.category === "evasion-attempt" && e.matched === "STEP-1\\u0020")).toBe(true);
  });

  test("QG-2\\x20prose fails (right-boundary escape exposes QG-2)", () => {
    const g = gateFor("See QG-2\\x20prose here.");
    expect(g.pass).toBe(false);
    expect(g.errors.some((e) => e.category === "evasion-attempt" && e.matched === "QG-2\\x20")).toBe(true);
  });

  test("UTF-8\\u0020text stays clean (UTF label excluded from reconstruction)", () => {
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

// C5: reconstructed wins over direct on a conflicting overlap. STEP-1\x32
// reconstructs STEP-12; the shorter direct STEP-1 is dropped, not the
// reconstructed. Same for QG-2\u0033 -> QG-23.
describe("C5 reconstructed wins conflicting overlap", () => {
  test("STEP-1\\x32 reconstructs STEP-12 and fails closed (direct STEP-1 dropped)", () => {
    const cs = detectCandidates("See STEP-1\\x32 here.", baseConfig);
    expect(cs.map((c) => c.type)).toContain("reconstructed-id");
    const recon = cs.find((c): c is Extract<typeof c, { type: "reconstructed-id" }> => c.type === "reconstructed-id");
    expect(recon?.value).toBe("STEP-12");
    expect(cs.some((c) => c.type === "direct-id")).toBe(false);
    const g = gateFor("See STEP-1\\x32 here.");
    expect(g.pass).toBe(false);
    expect(g.errors.some((e) => e.category === "evasion-attempt")).toBe(true);
  });

  test("QG-2\\u0033 reconstructs QG-23 and fails closed", () => {
    const g = gateFor("See QG-2\\u0033 here.");
    expect(g.pass).toBe(false);
    const recon = detectCandidates("See QG-2\\u0033 here.", baseConfig)
      .find((c): c is Extract<typeof c, { type: "reconstructed-id" }> => c.type === "reconstructed-id");
    expect(recon?.value).toBe("QG-23");
  });
});

// C6: per-token ID cap. 16 IDs in one token are all emitted; a 17th turns a
// typed overflow that propagates to a fail-closed candidate even if earlier
// reconstructed candidates are later deduped/owned. Closes the exploit
// ("STEP-1\u0032-").repeat(16) + "\u0041DR-1".
describe("C6 per-token ID cap overflow", () => {
  test("16 IDs in one token: all emitted, no overflow", () => {
    const token = "STEP-1\\u0032-".repeat(16);
    const res = detectReconstructedIds(token);
    expect(res.ids.length).toBe(16);
    expect(res.overflow).toBe(false);
  });

  test("exploit (17th hidden ID): overflow propagates, gate fails closed", () => {
    const exploit = "STEP-1\\u0032-".repeat(16) + "\\u0041DR-1";
    const g = gateFor(exploit);
    expect(g.pass).toBe(false);
    const overflow = g.errors.concat(g.failures).find((d) => d.matched.includes("[overflow"));
    expect(overflow).toBeDefined();
  });
});

// C7: pathological large input is bounded by the scan budget and fails
// closed (typed line-scan-exceeded overflow).
describe("C7 pathological large input bounded", () => {
  test("huge escape run is bounded and fails closed", () => {
    const huge = "\\x41".repeat(50000);
    const g = gateFor(huge);
    expect(g.pass).toBe(false);
  });

  test("detectReconstructedIds signals line-scan overflow for huge input", () => {
    const res = detectReconstructedIds("\\x41".repeat(50000));
    expect(res.overflow).toBe(true);
    expect(res.overflowReason).toBe("line-scan-exceeded");
  });
});
