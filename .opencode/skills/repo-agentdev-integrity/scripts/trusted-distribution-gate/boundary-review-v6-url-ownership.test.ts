// Review-v6 URL ownership span separation: classification evidence (`span`)
// is split from ownership suppression scope (`ownershipSpan`). The full URL
// span (including query/fragment) used to suppress contained IDs/docs paths.
// After v6, only the path portion (before `?`/`#`) owns; query/fragment refs
// are independently visible.
//
// Scope:
//   - V6.1 External URL `?ref=ADR-1` → ADR-1 independently visible as
//     direct-id → gate fail.
//   - V6.2 External URL `#docs/specs/foo.md` → docs path independently
//     visible → gate fail.
//   - V6.3 External URL `?next=https://github.com/yogata/agent-dev-flow/...`
//     → nested producer URL independently visible as url candidate →
//     gate fail.
//   - V6.4 External URL without query/fragment → path ownership preserved
//     (control). Embedded refs stay suppressed.
//   - V6.5 Malformed URL → ownershipSpan: null, contained refs visible.
//   - V6.6 Valid producer URL → ownershipSpan covers path; gate still
//     fails on producer-internal.
//   - V6.7 Cap flood: 1 external URL with 62 query IDs → 63 candidates,
//     no overflow. 1 + 63 → overflow (fail-closed).

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";
import {
  detectCandidates,
  type Candidate,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
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

function urlsOf(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "url" }> => c.type === "url");
}
function directsOf(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "direct-id" }> => c.type === "direct-id");
}
function pathsOf(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "path" }> => c.type === "path");
}
function hasOverflow(cs: readonly Candidate[]) {
  return cs.some((c) => c.type === "overflow");
}

// V6.1: query-ref ADR-1 independently visible as direct-id.
describe("V6.1 external URL ?ref=ADR-1 / ADR-1 visible as direct-id, gate fails", () => {
  test("extractUrls ownershipSpan ends at first ?", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md?ref=ADR-1 end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(false);
    expect(u.ownershipSpan).not.toBeNull();
    const qIdx = text.indexOf("?");
    expect(u.ownershipSpan?.end).toBe(qIdx);
  });

  test("detectCandidates emits URL + direct-id ADR-1", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md?ref=ADR-1 end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urlsOf(cs)).toHaveLength(1);
    const adr = directsOf(cs).find((c) => c.value === "ADR-1");
    expect(adr).toBeDefined();
  });

  test("gate fails on producer-internal ADR-1 (not hidden by external URL query)", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md?ref=ADR-1 end.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.some((d) => d.classification === "producer-internal" && d.matched === "ADR-1")).toBe(true);
  });
});

// V6.2: fragment-embedded docs path independently visible.
describe("V6.2 external URL #docs/specs/foo.md / docs path visible, gate fails", () => {
  test("extractUrls ownershipSpan ends at first #", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md#docs/specs/foo.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.ownershipSpan).not.toBeNull();
    const hashIdx = text.indexOf("#");
    expect(u.ownershipSpan?.end).toBe(hashIdx);
  });

  test("detectCandidates emits URL + path docs/specs/foo.md", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md#docs/specs/foo.md end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urlsOf(cs)).toHaveLength(1);
    const p = pathsOf(cs).find((c) => c.value === "docs/specs/foo.md");
    expect(p).toBeDefined();
  });

  test("gate fails on producer-internal docs path", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md#docs/specs/foo.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.some((d) => d.classification === "producer-internal" && d.matched === "docs/specs/foo.md")).toBe(true);
  });
});

// V6.3: nested producer URL independently visible.
describe("V6.3 external URL ?next=<producer URL> / nested URL visible, gate fails", () => {
  test("extractUrls emits both outer and nested URLs", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md?next=https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls.length).toBeGreaterThanOrEqual(2);
    const values = urls.map((u) => u.value);
    expect(values.some((v) => v === "https://github.com/yogata/agent-dev-flow/blob/main/x.md")).toBe(true);
  });

  test("detectCandidates emits nested producer URL candidate", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md?next=https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const cs = detectCandidates(text, baseConfig);
    const nested = urlsOf(cs).find((c) => c.value === "https://github.com/yogata/agent-dev-flow/blob/main/x.md");
    expect(nested).toBeDefined();
  });

  test("gate fails on producer-internal nested URL", () => {
    const text = "See https://github.com/external/repo/blob/main/x.md?next=https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.some((d) => d.classification === "producer-internal" && d.category === "fixed-url")).toBe(true);
  });
});

// V6.4: external URL without query/fragment — path ownership preserved.
// After the v7 path-ownership fix, ownershipSpan.start is authorityEnd
// (the first path slash after the host), not urlStart. The end is still
// the URL end when no `?`/`#` is present.
describe("V6.4 external URL without ?/# / path ownership preserved (control)", () => {
  test("extractUrls ownershipSpan starts at path slash (authorityEnd), end at URL end", () => {
    const text = "See https://github.com/external/repo/blob/main/docs/specs/ADR-0001.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.ownershipSpan).not.toBeNull();
    const pathSlashIdx = text.indexOf("github.com/") + "github.com".length;
    expect(u.ownershipSpan?.start).toBe(pathSlashIdx);
    expect(u.ownershipSpan?.end).toBe(u.span.end);
  });

  test("detectCandidates emits only URL (no path, no direct-id)", () => {
    const text = "See https://github.com/external/repo/blob/main/docs/specs/ADR-0001.md end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urlsOf(cs)).toHaveLength(1);
    expect(pathsOf(cs)).toHaveLength(0);
    expect(directsOf(cs)).toHaveLength(0);
  });

  test("gate passes (URL consumer-resolvable, embedded refs suppressed)", () => {
    const text = "See https://github.com/external/repo/blob/main/docs/specs/ADR-0001.md end.";
    expect(gateFor(text).pass).toBe(true);
  });
});

// V6.5: malformed URL ownershipSpan is null.
describe("V6.5 malformed URL / ownershipSpan null, contained refs visible", () => {
  test("backslash authority malformed URL ownershipSpan is null", () => {
    const text = "See https://evil.com\\@github.com/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
  });

  test("non-default-port malformed URL ownershipSpan is null", () => {
    const text = "See https://github.com:8080/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
  });

  test("docs path after malformed URL is independently visible", () => {
    const text = "See https://evil.com\\@github.com/vercel/next.js/blob/main/x.md docs/requirements/REQ-0001.md end.";
    const cs = detectCandidates(text, baseConfig);
    const p = pathsOf(cs).find((c) => c.value === "docs/requirements/REQ-0001.md");
    expect(p).toBeDefined();
  });
});

// V6.6: valid producer URL ownershipSpan covers path; gate still fails.
describe("V6.6 valid producer URL / ownershipSpan covers path, gate fails on producer-internal", () => {
  test("extractUrls ownershipSpan ends at first ? for producer URL", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md?ref=ADR-1 end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(false);
    const qIdx = text.indexOf("?");
    expect(u.ownershipSpan?.end).toBe(qIdx);
  });

  test("producer URL with embedded ADR + query-ref ADR-1 → URL + 1 direct-id", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/docs/specs/ADR-0001.md?ref=ADR-1 end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urlsOf(cs)).toHaveLength(1);
    const adr = directsOf(cs).find((c) => c.value === "ADR-1");
    expect(adr).toBeDefined();
    // The embedded ADR-0001 in the URL path is suppressed by ownershipSpan.
    expect(directsOf(cs).find((c) => c.value === "ADR-0001")).toBeUndefined();
  });

  test("gate fails on producer-internal URL (path-owned ADR-0001 hidden, query ADR-1 visible)", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/docs/specs/ADR-0001.md?ref=ADR-1 end.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.some((d) => d.category === "fixed-url")).toBe(true);
  });
});

// V6.7: cap flood — query IDs visible, candidate cap enforced.
describe("V6.7 cap flood / 1 URL + 62 query IDs = 63 no overflow; +63 = overflow", () => {
  test("1 external URL + 62 producer IDs in query → 63 candidates, no overflow", () => {
    const ids = Array.from({ length: 62 }, (_, i) => `ADR-${i + 1}`).join("/");
    const text = `See https://github.com/external/repo/blob/main/x.md?ids=${ids} end.`;
    const cs = detectCandidates(text, baseConfig);
    expect(urlsOf(cs)).toHaveLength(1);
    expect(directsOf(cs)).toHaveLength(62);
    expect(hasOverflow(cs)).toBe(false);
  });

  test("1 external URL + 63 producer IDs in query → overflow (fail-closed)", () => {
    const ids = Array.from({ length: 63 }, (_, i) => `ADR-${i + 1}`).join("/");
    const text = `See https://github.com/external/repo/blob/main/x.md?ids=${ids} end.`;
    const cs = detectCandidates(text, baseConfig);
    expect(hasOverflow(cs)).toBe(true);
    expect(gateFor(text).pass).toBe(false);
  });
});
