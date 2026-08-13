// Review-v5 path lexical fixes: Part 3 - percent-encoded backslash separators.
//
// Part 3 scope (C1.6):
//   - %5C/%5c separators are normalized and gate rejects on invalid prefix

import { describe, expect, test } from "bun:test";
import { detectCandidates, type DetectorConfig, type Candidate } from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";
import type { Detection, GateResult } from "./types.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function gateFor(text: string) {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", baseConfig).gate;
}

function paths(cs: readonly Candidate[]) {
  return cs.filter((c) => c.type === "path");
}

function findFailureByCategory(gate: GateResult, category: Detection["category"]): Detection | undefined {
  return gate.failures.find((d: Detection) => d.category === category);
}

describe("C1.6 percent-encoded backslash separators %5C/%5c", () => {
  test("docs%5Cspecs%5Cfoo.md (no prefix) becomes concrete producer path", () => {
    const text = "See docs%5Cspecs%5Cfoo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("./docs%5Cspecs%5Cfoo.md (./ prefix) becomes concrete producer path", () => {
    const text = "See ./docs%5Cspecs%5Cfoo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("../docs%5Cspecs%5Cfoo.md (../ prefix) becomes concrete producer path", () => {
    const text = "See ../docs%5Cspecs%5Cfoo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("../../docs%5Cspecs%5Cfoo.md (arbitrary depth) becomes concrete producer path", () => {
    const text = "See ../../docs%5Cspecs%5Cfoo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("docs%5Cspecs/foo.md (mixed %5C and /) becomes concrete producer path", () => {
    const text = "See docs%5Cspecs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("docs/specs%5Cfoo.md (mixed / and %5C) becomes concrete producer path", () => {
    const text = "See docs/specs%5Cfoo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("/docs%5Cspecs%5Cfoo.md (absolute with %5C) does NOT become a candidate", () => {
    const text = "See /docs%5Cspecs%5Cfoo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });

  test(".docs%5Cspecs%5Cfoo.md (no prefix with %5C) does NOT become a candidate", () => {
    const text = "See .docs%5Cspecs%5Cfoo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });

  test("a/../../docs%5Cspecs%5Cfoo.md (identifier before) does NOT become a candidate", () => {
    const text = "See a/../../docs%5Cspecs%5Cfoo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });
});