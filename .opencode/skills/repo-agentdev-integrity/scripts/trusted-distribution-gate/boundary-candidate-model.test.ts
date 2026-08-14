// Direct tests for boundary-candidate-model.ts: the typed Candidate union,
// resolution switch, URL/path helpers. These import from the leaf module
// directly (not via the pipeline barrel) to pin the module contract.

import { describe, expect, test } from "bun:test";
import {
  extractOwnerRepo,
  isConcreteDocsPath,
  isProducerOwnedUrl,
  matchedForCandidate,
  normalizePathToken,
  resolveCandidate,
  type DetectorConfig,
  type RepositoryIdentity,
} from "./boundary-candidate-model.ts";

const ident: RepositoryIdentity = { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" };
const cfg: DetectorConfig = {
  repository_identity: ident,
  producer_internal_id_prefixes: ["ADR", "REQ"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};
const S = { start: 0, end: 1 };

describe("candidate-model / resolveCandidate exhaustive", () => {
  test("direct producer-id -> producer-internal/concrete-id", () => {
    expect(resolveCandidate({ type: "direct-id", value: "ADR-1", span: S }, cfg)).toEqual({
      classification: "producer-internal", category: "concrete-id",
    });
  });
  test("reconstructed producer-id -> producer-internal/evasion-attempt", () => {
    expect(resolveCandidate({ type: "reconstructed-id", value: "ADR-1", original: "x", span: S }, cfg)).toEqual({
      classification: "producer-internal", category: "evasion-attempt",
    });
  });
  test("overflow -> unclassified/evasion-attempt (fail-closed)", () => {
    expect(resolveCandidate({ type: "overflow", reason: "token-ids-exceeded" }, cfg)).toEqual({
      classification: "unclassified", category: "evasion-attempt",
    });
  });
});

describe("candidate-model / matchedForCandidate", () => {
  test("overflow matched carries the typed reason string", () => {
    expect(matchedForCandidate({ type: "overflow", reason: "line-scan-exceeded" })).toContain("[overflow");
  });
});

describe("candidate-model / URL helpers", () => {
  test("extractOwnerRepo parses owner/repo", () => {
    expect(extractOwnerRepo("https://github.com/vercel/next.js/blob/main/x.ts")).toBe("vercel/next.js");
  });
  test("isProducerOwnedUrl matches own repo case-insensitively", () => {
    expect(isProducerOwnedUrl("https://github.com/Yogata/Agent-Dev-Flow/blob/main/x.md", ident)).toBe(true);
    expect(isProducerOwnedUrl("https://github.com/vercel/next.js/blob/main/x.md", ident)).toBe(false);
  });
});

describe("candidate-model / path helpers", () => {
  test("normalizePathToken converts backslash and percent-slash", () => {
    expect(normalizePathToken("docs\\x%2fy.md")).toBe("docs/x/y.md");
  });
  test("isConcreteDocsPath accepts concrete .md, rejects README/template/glob", () => {
    expect(isConcreteDocsPath("docs/adr/ADR-1.md")).toBe(true);
    expect(isConcreteDocsPath("docs/adr/README.md")).toBe(false);
    expect(isConcreteDocsPath("docs/specs/<d>/x.md")).toBe(false);
  });
});
