// Stage A vocabulary amendment / evasion regression coverage.
//
// Extracted from boundary-pipeline.test.ts and
// boundary-pipeline-helpers.test.ts to keep every touched file <=250
// pure LOC. Each describe maps to a reviewer blocker from the Stage A
// trust-root 5-lane review.
//
// Bypass map (blocker -> describe):
//   B1 wrapper bypass                -> "B1 wrapper bypass closed"
//   B2 wildcard exemption            -> "B2 wildcard is a token boundary"
//   B3 prefix escape                 -> "B3-B6 bounded reconstruction"
//   B4 suffix digit concat           -> "B3-B6 bounded reconstruction"
//   B5 escaped hyphen                -> "B3-B6 bounded reconstruction"
//   B6 multiple mixed escapes        -> "B3-B6 bounded reconstruction"
//   B7 producer/distributed overlap  -> "B7 overlap, producer wins"
//   B8 classification precedence     -> "B8 precedence" + "B8 gate"
//   B9 false positives               -> "B9 false positives"
//   B10 malformed / out-of-scope     -> "B10 malformed"
//   B11 non-discriminated candidate  -> exhaustive switch is exercised by
//                                       every resolveCandidate/classifyLine
//                                       call below.
//   B12 maximal-token adjacency       -> "B12 maximal-token adjacency"

import { describe, expect, test } from "bun:test";
import {
  classifyLine,
  detectCandidates,
  resolveCandidate,
  type Candidate,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";
import type { DependencyClass, DetectionCategory } from "./types.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function cls(text: string, cfg: DetectorConfig = baseConfig) {
  return classifyLine({ text, lineNumber: 1, filePath: "f.md", projection: "source" }, cfg);
}

// resolveCandidate ignores span; tests use a fixed placeholder to satisfy the
// typed Candidate union (span is exercised by detectCandidates/ownership).
const SPAN = { start: 0, end: 1 };

describe("Stage A vocabulary / UTF encoding labels remain clean", () => {
  for (const label of ["UTF-8", "UTF-16", "UTF-32"]) {
    test(`${label} is not flagged`, () => {
      expect(cls(`File encoded in ${label}.`).detections).toEqual([]);
    });
  }
});

describe("Stage A vocabulary / direct STEP and QG distributed-control", () => {
  test("direct STEP-N is generic-or-template/distributed-control", () => {
    const r = cls("See STEP-1 for requirements.");
    expect(r.detections[0]?.classification).toBe("generic-or-template");
    expect(r.detections[0]?.category).toBe("distributed-control");
    expect(r.detections[0]?.matched).toBe("STEP-1");
  });

  test("direct QG-N is generic-or-template/distributed-control", () => {
    const r = cls("See QG-2 for quality gate.");
    expect(r.detections[0]?.classification).toBe("generic-or-template");
    expect(r.detections[0]?.category).toBe("distributed-control");
    expect(r.detections[0]?.matched).toBe("QG-2");
  });

  test("unknown ID prefix remains unclassified (fail-closed)", () => {
    const r = cls("See MYSTERY-99.");
    expect(r.detections[0]?.classification).toBe("unclassified");
    expect(r.detections[0]?.category).toBe("unclassified-entry");
  });
});

// B1: wrapper bypass closed. `<`, `>`, `{`, `}`, `*` are token boundaries.
describe("B1 wrapper bypass closed", () => {
  test("<ADR-\\u0041> wrapper: no concrete ID reconstructed (ADR-A has no digits)", () => {
    expect(cls("See <ADR-\\u0041> for the decision.").detections).toEqual([]);
  });

  test("{REQ-\\x31} wrapper reconstructs REQ-1 and is flagged", () => {
    const r = cls("See {REQ-\\x31} for the requirement.");
    expect(r.detections[0]?.classification).toBe("producer-internal");
    expect(r.detections[0]?.category).toBe("evasion-attempt");
    expect(r.detections[0]?.matched).toBe("REQ-\\x31");
  });

  test("<STEP-0x31> wrapper reconstructs STEP-1 and is fail-closed", () => {
    const r = cls("See <STEP-0x31> for the step.");
    expect(r.detections[0]?.classification).toBe("unclassified");
    expect(r.detections[0]?.category).toBe("evasion-attempt");
    expect(r.detections[0]?.matched).toBe("STEP-0x31");
  });

  test("<STEP-0X31> uppercase 0X prefix reconstructs STEP-1 (case-insensitive 0[xX])", () => {
    const r = cls("See <STEP-0X31> for the step.");
    expect(r.detections).toHaveLength(1);
    expect(r.detections[0]?.classification).toBe("unclassified");
    expect(r.detections[0]?.category).toBe("evasion-attempt");
    expect(r.detections[0]?.matched).toBe("STEP-0X31");
  });
});

// B2: wildcard `*` is a token boundary, not an exemption.
describe("B2 wildcard is a token boundary", () => {
  test("REQ-123* detects direct ID REQ-123", () => {
    const r = cls("Pattern REQ-123* suffix.");
    const direct = r.detections.find((d) => d.category === "concrete-id");
    expect(direct?.matched).toBe("REQ-123");
    expect(direct?.classification).toBe("producer-internal");
  });

  test("REQ-* with no digits is not detected", () => {
    expect(cls("Pattern REQ-* matches all.").detections).toEqual([]);
  });
});

// B3-B6: prefix escape, escaped hyphen, multiple mixed. The fixed-width
// \uXXXX contract reconstructs all digit-continuation forms: \u00310
// decodes to '1' + literal '0' = ADR-10 (see boundary-span-overflow.test.ts
// C2). The \x form ADR-\x310 is also caught (see C1).
describe("B3-B6 bounded reconstruction of producer IDs", () => {
  const producerCases: Array<[string, string]> = [
    ["\\u0041DR-0001", "B3 prefix escape"],
    ["ADR\\u002d0001", "B5 escaped hyphen"],
    ["\\u0041DR\\u002d\\u0030\\u0030\\u0030\\u0031", "B6 multiple mixed escapes"],
  ];
  for (const [token, label] of producerCases) {
    test(`${label}: ${token} reconstructs producer ID and is flagged`, () => {
      const r = cls(`See ${token} here.`);
      expect(r.detections).toHaveLength(1);
      expect(r.detections[0]?.classification).toBe("producer-internal");
      expect(r.detections[0]?.category).toBe("evasion-attempt");
      expect(r.detections[0]?.matched).toBe(token);
    });
  }

  test("STEP-\\u0031 (\\u0031='1') reconstructs STEP-1 and is fail-closed", () => {
    const r = cls("See STEP-\\u0031 here.");
    expect(r.detections[0]?.classification).toBe("unclassified");
    expect(r.detections[0]?.category).toBe("evasion-attempt");
  });

  test("QG-\\u0032 reconstructs QG-2 and is fail-closed", () => {
    const r = cls("See QG-\\u0032 here.");
    expect(r.detections[0]?.classification).toBe("unclassified");
    expect(r.detections[0]?.category).toBe("evasion-attempt");
  });
});

// B7: producer/distributed overlap, producer wins.
describe("B7 producer and distributed overlap, producer wins", () => {
  const overlapCfg: DetectorConfig = {
    ...baseConfig,
    producer_internal_id_prefixes: [...baseConfig.producer_internal_id_prefixes, "STEP"],
    distributed_workflow_control_prefixes: ["STEP", "QG"],
  };

  test("direct STEP-N with overlap => producer-internal/concrete-id", () => {
    const r = resolveCandidate({ type: "direct-id", value: "STEP-1", span: SPAN }, overlapCfg);
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("concrete-id");
  });

  test("reconstructed STEP-N with overlap => producer-internal/evasion-attempt", () => {
    const r = resolveCandidate(
      { type: "reconstructed-id", value: "STEP-1", original: "STEP-\\u0031", span: SPAN },
      overlapCfg,
    );
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("evasion-attempt");
  });

  test("classifyLine under overlap => direct STEP-5 is producer-internal", () => {
    const r = cls("See STEP-5.", overlapCfg);
    expect(r.detections[0]?.classification).toBe("producer-internal");
    expect(r.detections[0]?.category).toBe("concrete-id");
  });
});

// B8: classification precedence through resolveCandidate.
describe("B8 classification precedence through resolveCandidate", () => {
  const cases: Array<[Candidate, DependencyClass, DetectionCategory]> = [
    [{ type: "direct-id", value: "ADR-0001", span: SPAN }, "producer-internal", "concrete-id"],
    [{ type: "reconstructed-id", value: "ADR-0001", original: "ADR-\\u0031", span: SPAN }, "producer-internal", "evasion-attempt"],
    [{ type: "direct-id", value: "STEP-1", span: SPAN }, "generic-or-template", "distributed-control"],
    [{ type: "reconstructed-id", value: "STEP-1", original: "STEP-\\u0031", span: SPAN }, "unclassified", "evasion-attempt"],
    [{ type: "reconstructed-id", value: "MYSTERY-1", original: "MYSTERY-\\u0031", span: SPAN }, "unclassified", "evasion-attempt"],
    [{ type: "direct-id", value: "UNKNOWN-99", span: SPAN }, "unclassified", "unclassified-entry"],
  ];
  for (const [c, classification, category] of cases) {
    const label = "value" in c ? c.value : c.type;
    test(`${c.type} ${label} => ${classification}/${category}`, () => {
      expect(resolveCandidate(c, baseConfig)).toEqual({ classification, category });
    });
  }
});

// B8: gate placement (failures vs errors).
describe("B8 gate placement: failures vs errors", () => {
  type GateShape = {
    pass: boolean;
    failures: number;
    errors: number;
    firstFailureCat?: string;
    firstErrorCat?: string;
  };
  function gateFor(text: string): GateShape {
    const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
    const r = decideProjection(files, "source", baseConfig).gate;
    return {
      pass: r.pass,
      failures: r.failures.length,
      errors: r.errors.length,
      firstFailureCat: r.failures[0]?.category,
      firstErrorCat: r.errors[0]?.category,
    };
  }

  test("direct producer ID => gate failure (concrete-id)", () => {
    expect(gateFor("See ADR-0001.")).toEqual({
      pass: false, failures: 1, errors: 0, firstFailureCat: "concrete-id", firstErrorCat: undefined,
    });
  });

  test("reconstructed producer ID => gate failure (evasion-attempt)", () => {
    expect(gateFor("See \\u0041DR-0001.")).toEqual({
      pass: false, failures: 1, errors: 0, firstFailureCat: "evasion-attempt", firstErrorCat: undefined,
    });
  });

  test("reconstructed STEP/QG => gate error (evasion-attempt, fail-closed)", () => {
    expect(gateFor("See <STEP-0x31>.")).toEqual({
      pass: false, failures: 0, errors: 1, firstFailureCat: undefined, firstErrorCat: "evasion-attempt",
    });
  });

  test("reconstructed unknown => gate error (evasion-attempt)", () => {
    const r = gateFor("See FOO-\\u0031.");
    expect(r.pass).toBe(false);
    expect(r.errors).toBe(1);
    expect(r.firstErrorCat).toBe("evasion-attempt");
  });
});

// B9: false positives from the security reviewer stay clean (lowercase and uppercase 0x prefix).
describe("B9 false positives remain clean", () => {
  const cleanCases: Array<[string, string]> = [
    ["byte 0x41 represents 'A'", "0x41 not in 30..39"],
    ["Register CPU-0xFF.", "0xFF not in 30..39"],
    ["Color COLOR-0xFFFFFF.", "more than 2 hex digits"],
    ["Escape CTRL-\\x1B.", "decoded ESC is not a digit"],
    ["Char UNICODE-\\u1234.", "decoded codepoint not a digit"],
    ["byte 0X41 represents 'A'", "0X41 (uppercase) not in 30..39"],
    ["Register CPU-0XFF.", "0XFF (uppercase) not in 30..39"],
    ["Color COLOR-0XFFFFFF.", "0XFFFFFF (uppercase) more than 2 hex digits"],
  ];
  for (const [text, label] of cleanCases) {
    test(`${label}: '${text}' is clean`, () => {
      expect(cls(text).detections).toEqual([]);
    });
  }
});

// B10: malformed escapes and out-of-scope forms remain clean.
describe("B10 out-of-scope and malformed escapes remain clean", () => {
  const malformedCases: Array<[string, string]> = [
    ["See ADR-\\u{0031} for the decision.", "\\u{...} curly-brace not supported"],
    ["See ADR-\\u0041 here.", "\\u0041 decodes to non-digit 'A'"],
    ["See REQ-\\x00 here.", "\\x00 NUL byte"],
    ["See DEC-0x0032 here.", "0x0032 4 hex digits (not exactly 2)"],
    ["See SPEC-0x1234 here.", "0x1234 not in 30..39 range"],
  ];
  for (const [text, label] of malformedCases) {
    test(`${label}: '${text}' is clean`, () => {
      expect(cls(text).detections).toEqual([]);
    });
  }
});

// B11: detectCandidates emits the reconstructed-id variant; exhaustive
// switch in resolveCandidate handles every Candidate variant.
describe("B11 detectCandidates emits reconstructed-id candidates", () => {
  test("detectCandidates returns reconstructed-id for \\u0041DR-0001", () => {
    const cs = detectCandidates("See \\u0041DR-0001 here.", baseConfig);
    const r = cs.find((c): c is Extract<Candidate, { type: "reconstructed-id" }> => c.type === "reconstructed-id");
    expect(r).toBeDefined();
    expect(r?.value).toBe("ADR-0001");
    expect(r?.original).toBe("\\u0041DR-0001");
  });

  test("detectCandidates returns direct-id for plain ADR-0001", () => {
    const cs = detectCandidates("See ADR-0001 here.", baseConfig);
    const r = cs.find((c): c is Extract<Candidate, { type: "direct-id" }> => c.type === "direct-id");
    expect(r).toBeDefined();
    expect(r?.value).toBe("ADR-0001");
  });
});

// B12: maximal-token adjacency — escaped delimiter exposes adjacent literal ID.
describe("B12 maximal-token adjacency: escaped delimiter exposes adjacent ID", () => {
  test("STEP-1\\u0020ADR-0002 fails: escaped space exposes ADR-0002 (producer-internal/evasion-attempt, minimal span)", () => {
    const files: ClassifyFileInput[] = [
      { filePath: "f.md", projection: "source", text: "See STEP-1\\u0020ADR-0002." },
    ];
    const result = decideProjection(files, "source", baseConfig);
    expect(result.gate.pass).toBe(false);
    const producerFailure = result.gate.failures.find(
      (d) => d.classification === "producer-internal" && d.category === "evasion-attempt",
    );
    expect(producerFailure?.matched).toBe("\\u0020ADR-0002");
  });
});
