// Review-v8 blocker: triple percent-encoded hosts must be detected as evasion.
//
// Blocker #3: canonicalizeHostEvasion does ≤2 decodeURIComponent rounds.
// Triple-encoded hosts like %252567ithub.com need 3 rounds to fully resolve:
//   %252567ithub.com → %2567ithub.com → %67ithub.com → github.com
// With only 2 rounds, the loop stops at %67ithub.com, which is NOT recognized
// as github.com, so no evasion candidate is emitted → gate FAIL bypass.
//
// Scope:
//   - Triple-encoded host: %252567ithub.com → 1 malformed, gate FAIL (evasion-attempt)
//   - Double-encoded control: %2567ithub.com → still detected (2 rounds sufficient), 1 malformed, gate FAIL
//   - Single-encoded control: %67ithub.com → still detected, 1 malformed, gate FAIL
//   - Plain control: github.com → 1 valid producer URL, gate FAIL (producer-internal), no malformed

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

// Triple percent-encoding requires 3 decode rounds.
describe("triple percent-encoding / evasion detection (B3)", () => {
  test("%252567ithub.com/yogata/agent-dev-flow/blob/main/x.md → 1 malformed, gate FAIL (evasion-attempt)", () => {
    const text = "See %252567ithub.com/yogata/agent-dev-flow/blob/main/x.md end.";
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

  test("%2567ithub.com/yogata/agent-dev-flow/blob/main/x.md (double-encoded control) → 1 malformed, gate FAIL", () => {
    const text = "See %2567ithub.com/yogata/agent-dev-flow/blob/main/x.md end.";
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

  test("%67ithub.com/yogata/agent-dev-flow/blob/main/x.md (single-encoded control) → 1 malformed, gate FAIL", () => {
    const text = "See %67ithub.com/yogata/agent-dev-flow/blob/main/x.md end.";
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
});