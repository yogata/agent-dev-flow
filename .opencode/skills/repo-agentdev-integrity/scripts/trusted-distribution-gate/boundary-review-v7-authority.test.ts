// Review-v7 authority blockers: malicious authority forms must fail closed.
//
// Review-v7 found three blockers in the trusted-distribution detector that
// let malicious authority forms pass the gate clean. This file pins each
// remediation as a regression test, plus GREEN controls for unchanged
// producer / consumer / deception behavior.
//
// Scope:
//   - B1 backslash before rejected authority (P0):
//       https://github.com\@evil.com/...  → 1 malformed, gate FAIL
//       https://github.com\evil.com/...   → 1 malformed, gate FAIL
//     Root cause: HOST_SCAN lookahead missed `\`, and the rejected branch
//     short-circuited before the pathHasBackslash malformed check.
//   - B9 scheme-less userinfo+port left boundary:
//       user@github.com:443/... → 1 malformed, gate FAIL
//     Root cause: `@` is in LEFT_REJECT_CHAR, so the scheme-less host was
//     rejected at the left boundary without emitting a malformed candidate.
//   - B10 extractOwnerRepo host branching: the RecognizedHost type narrows
//     the host so the implicit `else` (non-github host) becomes a
//     compile-time unreachable branch via assertNever. This contract is
//     enforced by `bun run typecheck` (tsc --noEmit) succeeding — there is
//     no runtime assertion in this file. The GREEN controls below exercise
//     both host branches at runtime so a regression in either branch
//     surfaces as a test failure.

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

// B1: backslash before rejected authority must fail closed.
describe("B1 backslash before rejected authority / fail closed (P0)", () => {
  test("https://github.com\\@evil.com/yogata/agent-dev-flow/blob/main/x.md → 1 malformed, gate FAIL", () => {
    const text = "See https://github.com\\@evil.com/yogata/agent-dev-flow/blob/main/x.md end.";
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
  });

  test("https://github.com\\evil.com/yogata/agent-dev-flow/blob/main/x.md (no @) → 1 malformed, gate FAIL", () => {
    const text = "See https://github.com\\evil.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(gateFor(text).pass).toBe(false);
  });
});

// B9: scheme-less userinfo + port left boundary must fail closed.
describe("B9 scheme-less userinfo+port / fail closed", () => {
  test("user@github.com:443/yogata/agent-dev-flow/blob/main/x.md → 1 malformed, gate FAIL", () => {
    const text = "See user@github.com:443/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one malformed url");
    expect(u.malformed).toBe(true);
    expect(u.ownershipSpan).toBeNull();
    expect(gateFor(text).pass).toBe(false);
  });
});

// Controls: producer-internal, userinfo deception, consumer-resolvable.
describe("controls / producer, deception, consumer unchanged", () => {
  test("https://github.com/yogata/agent-dev-flow/blob/main/x.md → valid producer URL, gate FAIL (producer-internal)", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one valid url");
    expect(u.malformed).toBe(false);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.find((d) => d.category === "fixed-url")?.classification).toBe("producer-internal");
  });

  test("https://github.com@evil.com/yogata/agent-dev-flow/blob/main/x.md → 0 candidates, gate PASS (userinfo deception)", () => {
    const text = "See https://github.com@evil.com/yogata/agent-dev-flow/blob/main/x.md end.";
    expect(extractUrls(text, 64).urls).toHaveLength(0);
    expect(gateFor(text).pass).toBe(true);
  });

  test("https://github.com/vercel/next.js/blob/main/x.md → consumer-resolvable, gate PASS", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(false);
    expect(gateFor(text).pass).toBe(true);
  });
});
