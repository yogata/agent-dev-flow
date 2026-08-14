// Review-v7 docs-path blockers: CJK punctuation left boundary (#5) and
// dot-segment prefix normalization (#11).
//
// #5 root cause: URL_STOP_CHAR in url-parser includes CJK punctuation
// (\uFF1A, \uFF1B, \uFF0C, \uFF1F, \u2014) but the docs-path parser's
// left-boundary set did NOT. After a URL terminated at these characters,
// a following docs/specs/... path was rejected because the preceding
// char was outside the accepted boundary set.
//
// #11 root cause: the strict relative prefix grammar only accepted
// pure dot-segment prefixes (../, ./). Identifier segments before ../
// (e.g. x/../docs) were rejected even though x/../ normalizes to the
// empty prefix in standard path semantics, resolving to docs.
//
// Both blockers let a hidden producer reference pass the gate clean.
// Each RED case now expects detection (1 path / gate FAIL).

import { describe, expect, test } from "bun:test";
import { extractDocsPaths } from "./boundary-docs-path-parser.ts";
import { detectCandidates, type DetectorConfig, type Candidate } from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";
import type { Detection, GateResult } from "./types.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function gateFor(text: string): GateResult {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", baseConfig).gate;
}

function paths(cs: readonly Candidate[]): readonly Candidate[] {
  return cs.filter((c) => c.type === "path");
}

function urls(cs: readonly Candidate[]): readonly Candidate[] {
  return cs.filter((c) => c.type === "url");
}

function findFailureByCategory(gate: GateResult, category: Detection["category"]): Detection | undefined {
  return gate.failures.find((d: Detection) => d.category === category);
}

// #5: docs path hidden behind CJK punctuation must be detected.
describe("#5 CJK punctuation left boundary / docs path detected", () => {
  test("text\uFF1Adocs/specs/foo.md (fullwidth colon U+FF1A) -> 1 path, gate FAIL", () => {
    const text = "text\uFF1Adocs/specs/foo.md";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(findFailureByCategory(g, "concrete-path")?.classification).toBe("producer-internal");
  });

  test("text\uFF1Bdocs/specs/foo.md (fullwidth semicolon U+FF1B) -> 1 path, gate FAIL", () => {
    const text = "text\uFF1Bdocs/specs/foo.md";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });

  test("text\uFF0Cdocs/specs/foo.md (fullwidth comma U+FF0C) -> 1 path, gate FAIL", () => {
    const text = "text\uFF0Cdocs/specs/foo.md";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });

  test("text\uFF1Fdocs/specs/foo.md (fullwidth question mark U+FF1F) -> 1 path, gate FAIL", () => {
    const text = "text\uFF1Fdocs/specs/foo.md";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });

  test("text\u2014docs/specs/foo.md (em dash U+2014) -> 1 path, gate FAIL", () => {
    const text = "text\u2014docs/specs/foo.md";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });

  test("consumer URL then fullwidth colon then docs path -> 1 URL + 1 path, gate FAIL", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md\uFF1Adocs/specs/foo.md end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urls(cs)).toHaveLength(1);
    expect(paths(cs)).toHaveLength(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });
});

// #11: dot-segment prefix that normalizes to docs must be detected.
describe("#11 dot-segment prefix normalization / docs path detected", () => {
  test("x/../docs/specs/foo.md -> 1 path, gate FAIL", () => {
    const text = "See x/../docs/specs/foo.md here.";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(findFailureByCategory(g, "concrete-path")?.classification).toBe("producer-internal");
  });

  test("../../x/../docs/specs/foo.md -> 1 path, gate FAIL", () => {
    const text = "See ../../x/../docs/specs/foo.md here.";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });
});

// GREEN controls: already-correct behavior must remain unchanged.
describe("controls / already-correct behavior unchanged", () => {
  test("docs/specs/foo.md -> 1 path (plain)", () => {
    const r = extractDocsPaths("docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(1);
  });

  test("./docs/specs/foo.md -> 1 path (single-dot prefix)", () => {
    const r = extractDocsPaths("./docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(1);
  });

  test("../docs/specs/foo.md -> 1 path (double-dot prefix)", () => {
    const r = extractDocsPaths("../docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(1);
  });

  test("../../docs/specs/foo.md -> 1 path (arbitrary depth)", () => {
    const r = extractDocsPaths("../../docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(1);
  });

  test(".docs/specs/foo.md -> 0 paths (hostname form, rejected)", () => {
    const r = extractDocsPaths(".docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(0);
  });

  test("/docs/specs/foo.md -> 0 paths (absolute, rejected)", () => {
    const r = extractDocsPaths("/docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(0);
  });

  test(".../docs/specs/foo.md -> 0 paths (three-dot segment, rejected)", () => {
    const r = extractDocsPaths(".../docs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(0);
  });

  test("mydocs/specs/foo.md -> 0 paths (identifier prefix, rejected)", () => {
    const r = extractDocsPaths("mydocs/specs/foo.md", 10);
    expect(r.paths).toHaveLength(0);
  });
});
