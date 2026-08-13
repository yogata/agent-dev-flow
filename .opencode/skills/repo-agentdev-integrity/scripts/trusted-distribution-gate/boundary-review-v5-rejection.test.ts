// Review-v5 path lexical fixes: Part 2 - .docs and /docs rejection, regression guard.
//
// Part 2 scope (C1.4-C1.5, C1.7):
//   - .docs is rejected (no prefix separator)
//   - /docs is rejected (absolute path)
//   - Preserve ./ and ../ behavior (regression guard)

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

describe("C1.4 .docs is rejected (no prefix separator)", () => {
  test(".docs/specs/foo.md does NOT become a candidate", () => {
    const text = "See .docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });
});

describe("C1.5 /docs is rejected (absolute path)", () => {
  test("/docs/specs/foo.md does NOT become a candidate", () => {
    const text = "See /docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });

  test("///docs/specs/foo.md does NOT become a candidate", () => {
    const text = "See ///docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });
});

describe("C1.7 preserve ./ and ../ behavior (regression guard)", () => {
  test("./docs/specs/foo.md remains concrete producer path", () => {
    const text = "See ./docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("../docs/specs/foo.md remains concrete producer path", () => {
    const text = "See ../docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test(".\\docs/specs/foo.md (backslash) remains concrete producer path", () => {
    const text = "See .\\docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("..\\docs/specs/foo.md (backslash) remains concrete producer path", () => {
    const text = "See ..\\docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });
});