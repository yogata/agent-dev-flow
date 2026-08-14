// Review-v9 security blocker: `:`/`?`/`#` delimited producer URLs pass clean.
//
// isValidLeftBoundary accepts `=` and `&` ONLY for scheme URLs (hasScheme=true).
// For scheme-less URLs, commit v8-C3 (`2be3671e`) added malformed emission
// when prevChar is `=` or `&`. The symmetric treatment for `:`, `?`, and `#`
// was NOT applied, leaving these fail-open holes:
//   - `label:github.com/yogata/agent-dev-flow/blob/main/secret.md` (scheme-less, `:`)
//   - `?github.com/yogata/agent-dev-flow/blob/main/x.md` (scheme-less, `?`)
//   - `#github.com/yogata/agent-dev-flow/blob/main/x.md` (scheme-less, `#`)
//   - `label:https://github.com/yogata/...` (schemed, `:` before scheme start)
//
// Remediation: extend commit v8-C3's malformed emission to also cover `:`, `?`,
// `#` for scheme-less URLs. For schemed URLs, add `:`, `?`, `#` to the accepted
// left-boundary chars (the scheme token is unambiguous).
//
// Scope:
//   D1: `label:github.com/...` (scheme-less)  -> 1 malformed, gate FAIL
//   D2: `?github.com/...` (scheme-less)        -> 1 malformed, gate FAIL
//   D3: `#github.com/...` (scheme-less)        -> 1 malformed, gate FAIL
//   D4: `http://external.com/p?github.com/...` -> 1 malformed, gate FAIL
//   D5: `http://external.com/p#github.com/...` -> 1 malformed, gate FAIL
//   D6: `label:https://github.com/yogata/...`  -> 1 valid producer, gate FAIL
//   D7: `?https://github.com/yogata/...`        -> 1 valid producer, gate FAIL
//   D8: `#https://github.com/yogata/...`        -> 1 valid producer, gate FAIL
//   C1: `label:https://github.com/vercel/...`  -> 1 valid consumer, gate PASS
//   C2: `?https://github.com/vercel/...`        -> 1 valid consumer, gate PASS

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

// D1-D5: scheme-less host after `:` `?` `#` must emit malformed and FAIL gate.
describe("D scheme-less host after : ? # / fail closed", () => {
  test("D1 label:github.com/yogata/agent-dev-flow/blob/main/secret.md -> 1 malformed, gate FAIL", () => {
    const text = "See label:github.com/yogata/agent-dev-flow/blob/main/secret.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(true);
    expect(urls[0]?.ownershipSpan).toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });

  test("D2 ?github.com/yogata/agent-dev-flow/blob/main/x.md -> 1 malformed, gate FAIL", () => {
    const text = "See ?github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(true);
    expect(urls[0]?.ownershipSpan).toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });

  test("D3 #github.com/yogata/agent-dev-flow/blob/main/x.md -> 1 malformed, gate FAIL", () => {
    const text = "See #github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(true);
    expect(urls[0]?.ownershipSpan).toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });

  test("D4 http://external.com/p?github.com/yogata/... -> 1 malformed, gate FAIL", () => {
    const text = "See http://external.com/p?github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(true);
    expect(urls[0]?.ownershipSpan).toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });

  test("D5 http://external.com/p#github.com/yogata/... -> 1 malformed, gate FAIL", () => {
    const text = "See http://external.com/p#github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(true);
    expect(urls[0]?.ownershipSpan).toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  });
});

// D6-D8: schemed URL after `:` `?` `#` must be accepted and classified.
describe("D schemed URL after : ? # / accepted and classified", () => {
  test("D6 label:https://github.com/yogata/agent-dev-flow/blob/main/x.md -> 1 valid producer, gate FAIL", () => {
    const text = "See label:https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    expect(urls[0]?.ownershipSpan).not.toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.find((d) => d.category === "fixed-url")?.classification).toBe("producer-internal");
    expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeUndefined();
  });

  test("D7 ?https://github.com/yogata/agent-dev-flow/blob/main/x.md -> 1 valid producer, gate FAIL", () => {
    const text = "See ?https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    expect(urls[0]?.ownershipSpan).not.toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.find((d) => d.category === "fixed-url")?.classification).toBe("producer-internal");
  });

  test("D8 #https://github.com/yogata/agent-dev-flow/blob/main/x.md -> 1 valid producer, gate FAIL", () => {
    const text = "See #https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    expect(urls[0]?.ownershipSpan).not.toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.find((d) => d.category === "fixed-url")?.classification).toBe("producer-internal");
  });
});

// C1-C2: external URLs after delimiters should still PASS gate.
describe("C external URLs after delimiters / gate PASS", () => {
  test("C1 label:https://github.com/vercel/next.js/blob/main/x.md -> 1 valid consumer, gate PASS", () => {
    const text = "See label:https://github.com/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    expect(urls[0]?.ownershipSpan).not.toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(true);
  });

  test("C2 ?https://github.com/vercel/next.js/blob/main/x.md -> 1 valid consumer, gate PASS", () => {
    const text = "See ?https://github.com/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    expect(urls[0]?.ownershipSpan).not.toBeNull();
    const g = gateFor(text);
    expect(g.pass).toBe(true);
  });
});
