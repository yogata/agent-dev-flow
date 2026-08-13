// Review-v5 path lexical fixes: Part 1 - arbitrary-depth relative path detection.
//
// Part 1 scope (C1.1-C1.3):
//   - ../../docs/... (arbitrary dot-segment depth) classifies as producer-internal
//   - Deeper slash/backslash/mixed prefixes classify as producer-internal
//   - a/../../docs is rejected (identifier before dot-segments)

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

describe("C1.1 arbitrary-depth relative docs paths / ../../docs...", () => {
  test("../../docs/specs/foo.md becomes concrete producer path and gate fails", () => {
    const text = "See ../../docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("../../../docs/adr/ADR-0001.md becomes concrete producer path and gate fails", () => {
    const text = "See ../../../docs/adr/ADR-0001.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("../../../../docs/specs/foundation/system.md becomes concrete producer path and gate fails", () => {
    const text = "See ../../../../docs/specs/foundation/system.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });
});

describe("C1.2 deeper slash/backslash/mixed prefixes classify as producer-internal", () => {
  test("../../\\docs/specs/foo.md (mixed separators) becomes concrete producer path", () => {
    const text = "See ../../\\docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("..\\..\\docs/specs/foo.md (backslash depth) becomes concrete producer path", () => {
    const text = "See ..\\..\\docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("..\\../../docs/specs/foo.md (mixed backslash/slash depth) becomes concrete producer path", () => {
    const text = "See ..\\../../docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });

  test("../../docs\\adr\\ADR-0001.md (mixed after docs) becomes concrete producer path", () => {
    const text = "See ../../docs\\adr\\ADR-0001.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail?.classification).toBe("producer-internal");
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(1);
  });
});

describe("C1.3 a/../../docs is rejected (identifier before dot-segments)", () => {
  test("a/../../docs/specs/foo.md does NOT become a candidate", () => {
    const text = "See a/../../docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });

  test("foo/bar/../../docs/specs/foo.md does NOT become a candidate", () => {
    const text = "See foo/bar/../../docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });

  test("x/../../../docs/specs/foo.md does NOT become a candidate", () => {
    const text = "See x/../../../docs/specs/foo.md here.";
    const g = gateFor(text);
    expect(g.pass).toBe(true);
    const pathFail = findFailureByCategory(g, "concrete-path");
    expect(pathFail).toBeUndefined();
    const cs = detectCandidates(text, baseConfig);
    expect(paths(cs).length).toBe(0);
  });
});