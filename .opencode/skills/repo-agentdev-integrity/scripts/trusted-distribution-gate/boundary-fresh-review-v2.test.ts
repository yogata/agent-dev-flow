// Fresh-review-v2 lexical ownership fixes: T1 targeted coverage.
//
// Each test describes a specific fail-open path that was identified
// during fresh review at 23a076c4. These tests fail against the current
// code, then pass after the T1 fix lands.
//
// T1 scope:
//   - userinfo extraction (https://user@github.com/... extracts correctly)
//   - punctuation termination (comma, semicolon, CJK punctuation)
//   - unsupported-scheme fallback (evil://, ftp:// are not scheme-less)

import { describe, expect, test } from "bun:test";
import {
  detectCandidates,
  detectReconstructedIds,
  type DetectorConfig,
  type Candidate,
} from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";
import type { Detection } from "./types.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function gateFor(text: string) {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", baseConfig).gate;
}

function urls(cs: readonly Candidate[]) {
  return cs.filter((c) => c.type === "url");
}

// T1.1: userinfo extraction - producer URL with userinfo is still producer-internal
describe("T1.1 userinfo / producer URL with userinfo is producer-internal", () => {
  test("https://user@github.com/yogata/agent-dev-flow/blob/main/src/index.ts extracts one producer URL and gate fails", () => {
    const text = "See https://user@github.com/yogata/agent-dev-flow/blob/main/src/index.ts here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const fail = g.failures.find((d: Detection) => d.category === "fixed-url");
    expect(fail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(1);
  });
});

// T1.2: userinfo deception - https://github.com@evil.com/... is NOT GitHub authority
describe("T1.2 userinfo deception / github.com@evil.com is not GitHub authority", () => {
  test("https://github.com@evil.com/yogata/agent-dev-flow/blob/main/x.md is clean (no URL, gate passes)", () => {
    const text = "See https://github.com@evil.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(0);
  });
});

// T1.3: punctuation termination - URL ownership ends at comma, semicolon, CJK punctuation
describe("T1.3 punctuation termination / URL ends at comma/semicolon/CJK", () => {
  test("external GitHub URL followed by ASCII comma + docs/specs/foo.md exposes producer reference", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md, docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    // docs/specs/foo.md is producer-internal and should trigger failure
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
  });

  test("external GitHub URL followed by ideographic period + ADR-0001 exposes producer reference", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md\u3002 ADR-0001 here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const idFail = g.failures.find((d: Detection) => d.category === "concrete-id");
    expect(idFail?.classification).toBe("producer-internal");
  });

  test("external GitHub URL followed by full-width semicolon + ADR-0001 exposes producer reference", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md\uFF1B ADR-0001 here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const idFail = g.failures.find((d: Detection) => d.category === "concrete-id");
    expect(idFail?.classification).toBe("producer-internal");
  });
});

// T1.4: query and fragment remain inside valid URL ownership
describe("T1.4 query and fragment / remain inside URL ownership", () => {
  test("?query and #fragment remain inside valid producer URL ownership", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md?query=1#fragment here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const fail = g.failures.find((d: Detection) => d.category === "fixed-url");
    expect(fail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(1);
    // URL should include query and fragment
    expect(urls(cs)[0]?.value).toContain("?query=1#fragment");
  });
});

// T1.5: unsupported-scheme fallback - evil:// and ftp:// are NOT accepted as scheme-less
describe("T1.5 unsupported-scheme / evil:// and ftp:// are not scheme-less GitHub owners", () => {
  test("evil://github.com/... is NOT a GitHub authority (clean, gate passes)", () => {
    const text = "See evil://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(0);
  });

  test("ftp://github.com/... is NOT a GitHub authority (clean, gate passes)", () => {
    const text = "See ftp://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(0);
  });

  test("normal https:// remains accepted", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const fail = g.failures.find((d: Detection) => d.category === "fixed-url");
    expect(fail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(1);
  });

  test("valid bare scheme-less github.com/... remains accepted", () => {
    const text = "See github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs).length).toBe(1);
  });
});

// T2: Left-boundary handling - only clean ./ or ../ prefixes before docs
// Relative docs paths with explicit ./ or ../ should be detected as producer-internal
// but .docs, absolute paths, and hostname .docs should NOT be candidates
describe("T2 relative docs-path left-boundary handling", () => {
  test("./docs/specs/foo.md becomes concrete producer path and gate fails", () => {
    const text = "See ./docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
  });

  test("../docs/specs/foo.md becomes concrete producer path and gate fails", () => {
    const text = "See ../docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
  });

  test(".\\docs/specs/foo.md (backslash) becomes concrete producer path and gate fails", () => {
    const text = "See .\\docs\\specs\\foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
  });

  test("..\\docs/specs/foo.md (backslash) becomes concrete producer path and gate fails", () => {
    const text = "See ..\\docs\\specs\\foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
  });

  test(".docs/specs/foo.md does NOT become a candidate (no prefix separator)", () => {
    const text = "See .docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail).toBeUndefined();
  });

  test("/docs/specs/foo.md does NOT become a candidate (absolute path)", () => {
    const text = "See /docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail).toBeUndefined();
  });

  test("a/../docs/specs/foo.md does NOT become a candidate (identifier before /)", () => {
    const text = "See a/../docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail).toBeUndefined();
  });

  test("https://evil.docs/specs/x.md remains suppressed by URL ownership", () => {
    const text = "See https://evil.docs/specs/x.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail).toBeUndefined();
  });

  test("plain docs/specs/foo.md remains concrete producer path", () => {
    const text = "See docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
  });
});

// T3: Owned-span reconstruction suppression - prevent reconstructed-ID token
// processing inside already-owned URL/path spans. External GitHub URLs
// containing many escaped IDs must NOT trigger token-ids-exceeded overflow.
describe("T3 owned-span reconstruction suppression", () => {
  test("single token with 17 reconstructable IDs overflows when standalone", () => {
    const token = "ADR-0x31-".repeat(17);
    const cs = detectCandidates(token, baseConfig);
    const overflow = cs.find((c) => c.type === "overflow");
    expect(overflow).toBeDefined();
    if (overflow && overflow.type === "overflow") {
      expect(overflow.reason).toBe("token-ids-exceeded");
    }
  });

  test("17 reconstructable IDs inside external GitHub URL do NOT overflow, gate passes", () => {
    const exploit = "ADR-0x31-".repeat(17);
    const text = `See https://github.com/vercel/next.js/blob/main/${exploit}.md here.`;
    const cs = detectCandidates(text, baseConfig);
    const g = gateFor(text);

    // Gate passes because URL is external
    expect(g.pass).toBe(true);

    // Exactly one URL owner, no reconstructed IDs, no overflow
    const urlCandidates = cs.filter((c) => c.type === "url");
    expect(urlCandidates.length).toBe(1);
    const reconstructed = cs.filter((c) => c.type === "reconstructed-id");
    expect(reconstructed.length).toBe(0);
    const overflow = cs.find((c) => c.type === "overflow");
    expect(overflow).toBeUndefined();
  });

  test("17 reconstructable IDs inside producer URL do NOT overflow, gate fails with URL classification", () => {
    const exploit = "ADR-0x31-".repeat(17);
    const text = `See https://github.com/yogata/agent-dev-flow/blob/main/${exploit}.md here.`;
    const cs = detectCandidates(text, baseConfig);
    const g = gateFor(text);

    // Gate fails because URL is producer-internal
    expect(g.pass).toBe(false);

    // Exactly one URL, no reconstructed IDs, no overflow
    const urlCandidates = cs.filter((c) => c.type === "url");
    expect(urlCandidates.length).toBe(1);
    const reconstructed = cs.filter((c) => c.type === "reconstructed-id");
    expect(reconstructed.length).toBe(0);
    const overflow = cs.find((c) => c.type === "overflow");
    expect(overflow).toBeUndefined();

    // Gate failure should be fixed-url (producer-internal)
    const urlFail = g.failures.find((d: Detection) => d.category === "fixed-url");
    expect(urlFail?.classification).toBe("producer-internal");
  });

  test("17 reconstructable IDs inside docs path do NOT overflow, gate fails with path classification", () => {
    const exploit = "ADR-0x31-".repeat(17);
    const text = `See docs/specs/${exploit}.md here.`;
    const cs = detectCandidates(text, baseConfig);
    const g = gateFor(text);

    // Gate fails because path is producer-internal
    expect(g.pass).toBe(false);

    // Exactly one valid docs path, no reconstructed IDs, no overflow
    const pathCandidates = cs.filter((c) => c.type === "path");
    expect(pathCandidates.length).toBe(1);
    expect(pathCandidates[0]?.value).toBe(`docs/specs/${exploit}.md`);
    const reconstructed = cs.filter((c) => c.type === "reconstructed-id");
    expect(reconstructed.length).toBe(0);
    const overflow = cs.find((c) => c.type === "overflow");
    expect(overflow).toBeUndefined();

    // Gate failure should be concrete-path (producer-internal)
    const pathFail = g.failures.find((d: Detection) => d.category === "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
  });

  test("token partially overlapping owner is NOT silently skipped, overflow fires", () => {
    const exploit = "ADR-0x31-".repeat(17);
    // Test partial overlap directly via detectReconstructedIds with a span that ends one char early
    const ownedSpan = { start: 0, end: exploit.length - 1 };
    const result = detectReconstructedIds(exploit, [ownedSpan]);

    // Overflow should fire because token is NOT fully inside the owned span
    expect(result.overflow).toBe(true);
    expect(result.overflowReason).toBe("token-ids-exceeded");
  });

  test("token fully inside owned span emits no IDs and no overflow", () => {
    const exploit = "ADR-0x31-".repeat(17);
    // Test full containment
    const ownedSpan = { start: 0, end: exploit.length };
    const result = detectReconstructedIds(exploit, [ownedSpan]);

    // No IDs, no overflow when fully owned
    expect(result.ids.length).toBe(0);
    expect(result.overflow).toBe(false);
    expect(result.overflowReason).toBe(null);
  });

  test("line-scan overflow remains unchanged when line exceeds MAX_LINE_SCAN", () => {
    const longSegment = "A".repeat(70000);
    const text = `See ${longSegment} ADR-0001 here.`;
    const cs = detectCandidates(text, baseConfig);
    const overflow = cs.find((c) => c.type === "overflow");
    expect(overflow).toBeDefined();
    if (overflow && overflow.type === "overflow") {
      expect(overflow.reason).toBe("line-scan-exceeded");
    }
  });
});