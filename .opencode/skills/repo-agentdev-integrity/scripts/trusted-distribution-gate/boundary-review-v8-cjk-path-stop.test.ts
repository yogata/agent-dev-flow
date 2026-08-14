// Review-v8 blocker #1: CJK punctuation as path STOP char.
//
// ROOT CAUSE: boundary-docs-path-parser.ts LEFT_BOUNDARY (line ~100)
// includes U+FF1A, U+FF1B, U+FF0C, U+FF1F, U+2014 for left-boundary
// acceptance, but PATH_STOP_CHAR (line ~34) does NOT include these as
// content terminators. So `docs/specs/foo.md\uFF1Aend` — the U+FF1A is
// not in PATH_STOP_CHAR, so the content scan runs past `.md` through
// U+FF1A, making content `foo.md\uFF1Aend`. findMdEndpoint then sees
// the suffix `\uFF1Aend` after `.md`, which is not all `.` chars, so
// it returns -1. Result: 0 path candidates and the gate PASSes — a
// producer-internal reference leak.
//
// FIX: Add U+FF1A, U+FF1B, U+FF0C, U+FF1F, U+2014 to PATH_STOP_CHAR so
// the content scan terminates at these punctuation chars exactly as it
// terminates at ASCII `,;:?`. These are the same five characters that
// LEFT_BOUNDARY already accepts.
//
// Each RED case below expects detection (1 path / gate FAIL) for a
// docs-path whose trailing punctuation is one of the five CJK chars.

import { describe, expect, test } from "bun:test";
import { extractDocsPaths } from "./boundary-docs-path-parser.ts";
import { type DetectorConfig } from "./boundary-pipeline.ts";
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

function findFailureByCategory(gate: GateResult, category: Detection["category"]): Detection | undefined {
  return gate.failures.find((d: Detection) => d.category === category);
}

describe("v8 #1 CJK punctuation as path STOP char / docs path detected", () => {
  test("docs/specs/foo.md\uFF1Aend (fullwidth colon U+FF1A) -> 1 path, gate FAIL", () => {
    const text = "docs/specs/foo.md\uFF1Aend";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]?.value).toBe("docs/specs/foo.md");
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(findFailureByCategory(g, "concrete-path")?.classification).toBe("producer-internal");
  });

  test("docs/specs/foo.md\uFF1Bend (fullwidth semicolon U+FF1B) -> 1 path, gate FAIL", () => {
    const text = "docs/specs/foo.md\uFF1Bend";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]?.value).toBe("docs/specs/foo.md");
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });

  test("docs/specs/foo.md\uFF0Cend (fullwidth comma U+FF0C) -> 1 path, gate FAIL", () => {
    const text = "docs/specs/foo.md\uFF0Cend";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]?.value).toBe("docs/specs/foo.md");
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });

  test("docs/specs/foo.md\uFF1Fend (fullwidth question mark U+FF1F) -> 1 path, gate FAIL", () => {
    const text = "docs/specs/foo.md\uFF1Fend";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]?.value).toBe("docs/specs/foo.md");
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });

  test("docs/specs/foo.md\u2014end (em dash U+2014) -> 1 path, gate FAIL", () => {
    const text = "docs/specs/foo.md\u2014end";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]?.value).toBe("docs/specs/foo.md");
    const g = gateFor(text);
    expect(g.pass).toBe(false);
  });

  test("control: docs/specs/foo.md end (ASCII space) -> 1 path, unchanged", () => {
    const text = "docs/specs/foo.md end";
    const r = extractDocsPaths(text, 10);
    expect(r.paths).toHaveLength(1);
    expect(r.paths[0]?.value).toBe("docs/specs/foo.md");
  });
});
