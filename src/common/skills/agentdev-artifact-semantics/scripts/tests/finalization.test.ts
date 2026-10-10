import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assessFinalization, ARTIFACT_PHASES, FinalizationError } from "../lib/finalization.ts";
import type { ArtifactCoverageRelation } from "../lib/coverage-report.ts";

let root: string;

const DESIGN_ARTIFACT = "docs/designs/plan.md";
const UPSTREAM_REQ = "REQ-900-001";
const UNKNOWN_REQ = "REQ-900-999";
const VERIFICATION_TEST = "tests/plan.test.ts";

function createArtifact(relativePath: string, content = "# plan\n"): string {
  const absolute = join(root, relativePath);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf-8");
  return relativePath;
}

function artifactCoverageJson(relations: ArtifactCoverageRelation[], artifact = DESIGN_ARTIFACT): string {
  return JSON.stringify({ mode: "artifact", artifact, relations });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "artifact-semantics-finalization-"));
  // 現行要件行（docs/requirements）と検証根拠、設計成果物を用意する
  mkdirSync(join(root, "docs", "requirements"), { recursive: true });
  writeFileSync(join(root, "docs", "requirements", "REQ-900.md"), `| ${UPSTREAM_REQ} | test line |\n`, "utf-8");
  createArtifact(VERIFICATION_TEST, "// verification evidence\n");
  createArtifact(DESIGN_ARTIFACT);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("assessFinalization", () => {
  test("finalizes a design artifact before implementation exists (REQ-105-006)", () => {
    // 後続工程（実装）の成果物を要求せず、設計工程の成果物を確定できる
    const result = assessFinalization(
      root,
      DESIGN_ARTIFACT,
      "design",
      [UPSTREAM_REQ],
      [VERIFICATION_TEST],
      artifactCoverageJson([{ reqId: UPSTREAM_REQ, role: "design", line: 1 }]),
    );
    expect(result.finalized).toBe(true);
    expect(result.roleOwned).toBe(true);
    expect(result.upstreamAlignment.aligned).toEqual([UPSTREAM_REQ]);
    expect(result.verificationEvidence.resolved).toEqual([VERIFICATION_TEST]);
  });

  test("never derives requirement satisfaction from finalization (REQ-105-007)", () => {
    // 設計成果物の正式確定をもって最終的な要求充足済みと判定しない構造保証
    const result = assessFinalization(
      root,
      DESIGN_ARTIFACT,
      "design",
      [UPSTREAM_REQ],
      [VERIFICATION_TEST],
      artifactCoverageJson([{ reqId: UPSTREAM_REQ, role: "design", line: 1 }]),
    );
    expect(result.finalized).toBe(true);
    expect(result.requirementSatisfaction.status).toBe("not-assessed-by-this-tool");
    expect(result.requirementSatisfaction.reason.length).toBeGreaterThan(0);
  });

  test("does not finalize when no upstream is requested (fail-closed)", () => {
    const result = assessFinalization(root, DESIGN_ARTIFACT, "design", [], [VERIFICATION_TEST], artifactCoverageJson([]));
    expect(result.finalized).toBe(false);
  });

  test("does not finalize when verification evidence is absent (fail-closed)", () => {
    const result = assessFinalization(root, DESIGN_ARTIFACT, "design", [UPSTREAM_REQ], [], artifactCoverageJson([{ reqId: UPSTREAM_REQ, role: "design", line: 1 }]));
    expect(result.finalized).toBe(false);
  });

  test("does not finalize when upstream references an unknown requirement line", () => {
    const result = assessFinalization(
      root,
      DESIGN_ARTIFACT,
      "design",
      [UNKNOWN_REQ],
      [VERIFICATION_TEST],
      artifactCoverageJson([{ reqId: UNKNOWN_REQ, role: "design", line: 1 }]),
    );
    expect(result.finalized).toBe(false);
    expect(result.upstreamAlignment.unknownRequirementLines).toEqual([UNKNOWN_REQ]);
    expect(result.upstreamAlignment.aligned).toEqual([]);
  });

  test("does not finalize when upstream alignment lacks a declared relation", () => {
    // 上流整合の決定的根拠（対応宣言）が無い場合、確定させない
    const result = assessFinalization(root, DESIGN_ARTIFACT, "design", [UPSTREAM_REQ], [VERIFICATION_TEST], artifactCoverageJson([]));
    expect(result.finalized).toBe(false);
    expect(result.upstreamAlignment.undeclaredRelations).toEqual([UPSTREAM_REQ]);
  });

  test("does not finalize when the artifact is missing", () => {
    const result = assessFinalization(
      root,
      "docs/designs/ghost.md",
      "design",
      [UPSTREAM_REQ],
      [VERIFICATION_TEST],
      artifactCoverageJson([{ reqId: UPSTREAM_REQ, role: "design", line: 1 }], "docs/designs/ghost.md"),
    );
    expect(result.finalized).toBe(false);
    expect(result.artifactExists).toBe(false);
  });

  test("does not finalize when verification evidence is missing on disk or not verification-typed", () => {
    const ghost = "tests/ghost.test.ts";
    const notVerification = createArtifact("src/helper.ts");
    const missingType = assessFinalization(root, DESIGN_ARTIFACT, "design", [UPSTREAM_REQ], [ghost], artifactCoverageJson([{ reqId: UPSTREAM_REQ, role: "design", line: 1 }]));
    expect(missingType.finalized).toBe(false);
    expect(missingType.verificationEvidence.missing).toEqual([ghost]);

    const wrongType = assessFinalization(root, DESIGN_ARTIFACT, "design", [UPSTREAM_REQ], [notVerification], artifactCoverageJson([{ reqId: UPSTREAM_REQ, role: "design", line: 1 }]));
    expect(wrongType.finalized).toBe(false);
    expect(wrongType.verificationEvidence.missing).toEqual([notVerification]);
  });

  test("rejects coverage report whose artifact differs from the target (fail-closed)", () => {
    expect(() =>
      assessFinalization(root, DESIGN_ARTIFACT, "design", [UPSTREAM_REQ], [VERIFICATION_TEST], artifactCoverageJson([], "docs/designs/other.md")),
    ).toThrow(FinalizationError);
  });

  test("accepts every artifact role as a phase", () => {
    expect(ARTIFACT_PHASES).toEqual(["requirement", "decision", "design", "implementation", "verification"]);
  });
});
