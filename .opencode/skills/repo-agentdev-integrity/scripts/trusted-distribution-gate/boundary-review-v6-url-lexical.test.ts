// Review-v6 URL lexical evasion: GitHub URL evasion forms must fail closed.
//
// Per distribution-boundary.md, the detector must never let an evasion-form
// GitHub URL pass clean. Each evasion form emits one malformed URL candidate
// (ownershipSpan: null) so contained producer references stay independently
// visible and the gate fails. This replaces the historical "unsupported
// scheme → 0 URLs, gate PASS" contract, which was fail-open.
//
// Scope:
//   - L1 unsupported schemes (ftp://, evil://, git+https://) → 1 malformed.
//   - L2 composite scheme (abchttps://) → 1 malformed.
//   - L3 percent-encoded host (%67ithub.com, github%2ecom) → 1 malformed.
//   - L4 Unicode dot host (github\u3002com) → 1 malformed.
//   - L5 excessive slashes (https:////) → 1 malformed.
//   - L6 backslash in path → 1 malformed, lexical-extent span.
//   - L7 dot segments (.., %2e%2e) in owner/repo → 1 malformed.
//   - L8 assignment URL (url=https://...) → 1 valid producer URL.
//   - L9 em dash U+2014 terminates URL; trailing ID independently visible.
//   - L10 controls: valid URL stays valid; github.com@evil.com → no candidate.

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";
import { detectCandidates, type Candidate, type DetectorConfig } from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function gateFor(text: string) {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", baseConfig).gate;
}

function findDirectId(cs: readonly Candidate[], value: string) {
  return cs.find((c): c is Extract<Candidate, { type: "direct-id" }> => c.type === "direct-id" && c.value === value);
}

// L1: unsupported schemes ftp://, evil://, git+https:// each yield 1 malformed.
describe("L1 unsupported schemes / 1 malformed candidate, gate fail", () => {
  for (const scheme of ["ftp://", "evil://", "git+https://"]) {
    test(`${scheme}github.com/yogata/agent-dev-flow/blob/main/x.md → 1 malformed, ownershipSpan null`, () => {
      const text = `See ${scheme}github.com/yogata/agent-dev-flow/blob/main/x.md end.`;
      const { urls } = extractUrls(text, 64);
      expect(urls).toHaveLength(1);
      const u = urls[0];
      if (u === undefined) throw new Error("expected one malformed url");
      expect(u.malformed).toBe(true);
      expect(u.ownershipSpan).toBeNull();
      expect(u.span.start).toBe(text.indexOf(scheme));
      const g = gateFor(text);
      expect(g.pass).toBe(false);
      expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
    });
  }
});

// L2: composite scheme abchttps:// → malformed.
describe("L2 composite scheme / abchttps fails closed", () => {
  test("abchttps://github.com/... → 1 malformed, ownershipSpan null", () => {
    const text = "See abchttps://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(u.span.start).toBe(text.indexOf("abchttps"));
    expect(gateFor(text).pass).toBe(false);
  });
});

// L3: percent-encoded host → malformed.
describe("L3 percent-encoded host / canonicalizes to github.com", () => {
  test("%67ithub.com/... → 1 malformed (%67 = 'g')", () => {
    const text = "See %67ithub.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(gateFor(text).pass).toBe(false);
  });

  test("github%2ecom/... → 1 malformed (%2e = '.')", () => {
    const text = "See github%2ecom/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(gateFor(text).pass).toBe(false);
  });
});

// L4: Unicode dot host (U+3002) → malformed.
describe("L4 Unicode dot host / U+3002 canonicalizes to ASCII dot", () => {
  test("github\\u3002com/... → 1 malformed", () => {
    const text = "See github\u3002com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(gateFor(text).pass).toBe(false);
  });
});

// L5: excessive slashes https://// → malformed.
describe("L5 excessive slashes / https://// fails closed", () => {
  test("https:////github.com/... → 1 malformed", () => {
    const text = "See https:////github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(u.span.start).toBe(text.indexOf("https"));
    expect(gateFor(text).pass).toBe(false);
  });
});

// L6: backslash in path → malformed with lexical-extent span.
describe("L6 backslash in path / lexical-extent malformed", () => {
  test("https://github.com/yogata/agent-dev-flow\\\\blob/main/x.md → 1 malformed, span covers backslash", () => {
    const text = "See https://github.com/yogata/agent-dev-flow\\blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    // Span must extend past the backslash (lexical extent).
    const bsIdx = text.indexOf("\\");
    expect(u.span.end).toBeGreaterThan(bsIdx);
    expect(gateFor(text).pass).toBe(false);
  });
});

// L7: dot segments in owner/repo path → malformed.
describe("L7 dot segments / .. and %2e%2e in path fail closed", () => {
  test("https://github.com/yogata/../agent-dev-flow/blob/main/x.md → 1 malformed", () => {
    const text = "See https://github.com/yogata/../agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(gateFor(text).pass).toBe(false);
  });

  test("https://github.com/%2e%2e/yogata/agent-dev-flow/blob/main/x.md → 1 malformed", () => {
    const text = "See https://github.com/%2e%2e/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(gateFor(text).pass).toBe(false);
  });
});

// L8: assignment URL url=https://... → 1 valid producer URL (gate fails on producer-internal).
describe("L8 assignment URL / url= left boundary accepted for scheme", () => {
  test("url=https://github.com/yogata/agent-dev-flow/blob/main/x.md → 1 valid producer URL", () => {
    const text = "See url=https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one valid url");
    expect(u.malformed).toBe(false);
    expect(u.value).toBe("https://github.com/yogata/agent-dev-flow/blob/main/x.md");
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.find((d) => d.category === "fixed-url")?.classification).toBe("producer-internal");
  });
});

// L9: em dash U+2014 terminates URL; trailing ID independently visible.
describe("L9 em dash U+2014 / URL terminates, trailing ID visible", () => {
  test("https://github.com/vercel/next.js/blob/main/x.md\\u2014ADR-0001 → URL ends before U+2014, ADR visible", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md\u2014ADR-0001 end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    const dashIdx = text.indexOf("\u2014");
    expect(u.span.end).toBeLessThanOrEqual(dashIdx);
    expect(u.value).toBe("https://github.com/vercel/next.js/blob/main/x.md");
    const cs = detectCandidates(text, baseConfig);
    expect(findDirectId(cs, "ADR-0001")).toBeDefined();
  });
});

// L10: controls — valid URL stays valid; github.com@evil.com → no candidate.
describe("L10 controls / valid URL and userinfo deception unchanged", () => {
  test("valid https://github.com/yogata/agent-dev-flow/blob/main/x.md → 1 valid producer URL", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(false);
    expect(u.value).toBe("https://github.com/yogata/agent-dev-flow/blob/main/x.md");
  });

  test("github.com@evil.com → no URL candidate", () => {
    const text = "See github.com@evil.com end.";
    expect(extractUrls(text, 64).urls).toHaveLength(0);
    expect(gateFor(text).pass).toBe(true);
  });

  test("https://github.com@evil.com/yogata/... → no URL candidate (userinfo deception)", () => {
    const text = "See https://github.com@evil.com/yogata/agent-dev-flow/blob/main/x.md end.";
    expect(extractUrls(text, 64).urls).toHaveLength(0);
  });
});
