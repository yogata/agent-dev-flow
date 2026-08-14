// Review-v8 blocker #2: query-assignment scheme-less URL must fail closed.
//
// isValidLeftBoundary accepts `=` and `&` ONLY for scheme URLs (hasScheme=true).
// For scheme-less URLs, `=` sits in LEFT_REJECT_CHAR, so a recognized host that
// appears right after a query-assignment delimiter (`?next=github.com/...`,
// `&link=github.com/...`, bare `=github.com/...`) is rejected at the left
// boundary and skipped via `continue`. The candidate vanishes, the gate sees
// 0 candidates, and a producer reference hidden in a query value passes clean.
//
// Remediation: when `!hasScheme` and the char before the host is `=` or `&`,
// emit a MALFORMED candidate (ownershipSpan null) instead of skipping. The gate
// then resolves it to evasion-attempt / unclassified and FAILs. Scheme URLs are
// unaffected (`!hasScheme` guard), so `url=https://github.com/...` still yields
// a valid producer URL (control L8 in boundary-review-v6-url-lexical).
//
// Scope:
//   - B2a: `?next=github.com/...`            → 1 malformed, gate FAIL
//   - B2b: `?ref=github.com/...`             → 1 malformed, gate FAIL
//   - B2c: `&link=github.com/...`            → 1 malformed, gate FAIL
//   - C1 : `https://example.com/?next=...`   → embedded scheme-less host malformed, gate FAIL
//   - C2 : bare `=github.com/...`            → 1 malformed, gate FAIL
//   - C3 : `https://github.com/...` (scheme) → 1 valid producer URL, gate FAIL (producer-internal), no malformed

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";
import type { DetectorConfig } from "./boundary-pipeline.ts";
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

// Shared shape for every blocker case: exactly one malformed URL whose ownership
// span is null, and a gate that FAILs with an evasion-attempt / unclassified
// error (malformed URLs resolve to unclassified/evasion-attempt per
// resolveCandidate, routed into gate.errors).
function expectMalformedEvasion(text: string): void {
  const { urls } = extractUrls(text, 64);
  expect(urls).toHaveLength(1);
  const u = urls[0];
  if (u === undefined) throw new Error("expected one malformed url");
  expect(u.malformed).toBe(true);
  expect(u.ownershipSpan).toBeNull();
  const g = gateFor(text);
  expect(g.pass).toBe(false);
  expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  expect(g.errors.find((d) => d.classification === "unclassified")).toBeDefined();
}

// B2: scheme-less recognized host after a query-assignment delimiter must fail closed.
describe("B2 query-assignment scheme-less URL / fail closed", () => {
  test("?next=github.com/yogata/agent-dev-flow/blob/main/x.md → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See ?next=github.com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("?ref=github.com/yogata/agent-dev-flow/blob/main/x.md → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See ?ref=github.com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("&link=github.com/yogata/agent-dev-flow/blob/main/x.md → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See prev &link=github.com/yogata/agent-dev-flow/blob/main/x.md end.");
  });
});

// Controls: already-correct or adjacent behavior must remain sound.
describe("controls / scheme context unchanged", () => {
  test("https://example.com/?next=github.com/... → embedded scheme-less host malformed, gate FAIL", () => {
    // example.com is not a recognized host, so only the embedded scheme-less
    // github.com (after `=`) is scanned. Its `?` resets the authority scan, so
    // the embedded host is scheme-less and must be caught as malformed rather
    // than hidden behind the outer URL.
    const text = "See https://example.com/?next=github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });

  test("=github.com/yogata/agent-dev-flow/blob/main/x.md (standalone) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See =github.com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("https://github.com/yogata/agent-dev-flow/blob/main/x.md (scheme URL) → 1 valid producer URL, gate FAIL (producer-internal), no malformed", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one valid url");
    expect(u.malformed).toBe(false);
    expect(u.ownershipSpan).not.toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.find((d) => d.category === "fixed-url")?.classification).toBe("producer-internal");
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeUndefined();
  });
});
