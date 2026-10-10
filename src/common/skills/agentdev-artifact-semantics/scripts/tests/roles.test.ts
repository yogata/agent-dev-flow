import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assessArtifactRoles, ARTIFACT_ROLES, RoleAssessmentError } from "../lib/roles.ts";

let root: string;

function createFile(relativePath: string, content: string): string {
  const absolute = join(root, relativePath);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf-8");
  return relativePath;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "artifact-semantics-roles-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("assessArtifactRoles", () => {
  test("derives design role from canonical placement", () => {
    const file = createFile(join("docs", "designs", "example.md"), "# Example\n");
    const assessment = assessArtifactRoles(root, file);
    expect(assessment.roles).toEqual(["design"]);
    expect(assessment.unclassified).toBe(false);
    expect(assessment.declaredRoles).toBeNull();
  });

  test("derives requirement and decision roles from canonical placements", () => {
    const req = createFile(join("docs", "requirements", "REQ-900.md"), "# x\n");
    const dec = createFile(join("docs", "decisions", "DEC-900.md"), "# y\n");
    expect(assessArtifactRoles(root, req).roles).toEqual(["requirement"]);
    expect(assessArtifactRoles(root, dec).roles).toEqual(["decision"]);
  });

  test("derives verification role from test file suffix", () => {
    const file = createFile(join("src", "mod.test.ts"), "// test\n");
    expect(assessArtifactRoles(root, file).roles).toEqual(["verification"]);
  });

  test("prioritizes self-declared roles over placement-derived roles", () => {
    // 宣言は配置規約より優先する（成果物が自らの意味を所有する第一経路）
    const file = createFile(
      join("docs", "designs", "dual.md"),
      "---\nartifact_roles: [design, implementation]\n---\n# dual role\n",
    );
    const assessment = assessArtifactRoles(root, file);
    expect(assessment.declaredRoles).toEqual(["design", "implementation"]);
    expect(assessment.roles).toEqual(["design", "implementation"]);
    expect(assessment.unclassified).toBe(false);
  });

  test("allows multiple roles on one file without requiring separate files (REQ-105-005)", () => {
    // 同じファイルが設計と実装の双方の役割を担うことを別ファイル必須とせず受理する
    const file = createFile(
      join("src", "feature", "spec.md"),
      "---\nartifact_roles: [design, implementation, verification]\n---\nbody\n",
    );
    const assessment = assessArtifactRoles(root, file);
    expect(assessment.roles).toEqual(["design", "implementation", "verification"]);
  });

  test("reports unclassified instead of guessing unknown placements", () => {
    const file = createFile(join("docs", "knowledge", "note.md"), "content\n");
    const assessment = assessArtifactRoles(root, file);
    expect(assessment.roles).toEqual([]);
    expect(assessment.unclassified).toBe(true);
  });

  test("rejects unknown declared roles (fail-closed)", () => {
    const file = createFile(
      join("docs", "designs", "bad-role.md"),
      "---\nartifact_roles: [specification]\n---\nbody\n",
    );
    expect(() => assessArtifactRoles(root, file)).toThrow(RoleAssessmentError);
  });

  test("rejects empty declared roles (fail-closed)", () => {
    const file = createFile(
      join("docs", "designs", "empty-role.md"),
      "---\nartifact_roles: []\n---\nbody\n",
    );
    expect(() => assessArtifactRoles(root, file)).toThrow(RoleAssessmentError);
  });

  test("fails on unreadable artifacts", () => {
    expect(() => assessArtifactRoles(root, "missing/does-not-exist.md")).toThrow(RoleAssessmentError);
  });

  test("exposes the meaning of every role (REQ-105-001 semantic distinction)", () => {
    expect(ARTIFACT_ROLES).toEqual(["requirement", "decision", "design", "implementation", "verification"]);
    for (const role of ARTIFACT_ROLES) {
      expect(assessArtifactRoles(root, createFile(join("docs", "designs", `${role}.md`), "x")).roleNotes[role]).toBeTruthy();
    }
  });
});
