import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assessDesignBasis } from "../lib/design-basis.ts";
import { MIGRATION_DEFAULT_CONVENTIONS, parseAdoptedConventions, ConventionsError } from "../lib/conventions.ts";
import type { ArtifactSemanticsConventions } from "../lib/conventions.ts";
import type { RequirementCoverageRelation } from "../lib/coverage-report.ts";

let root: string;

const REQ = "REQ-900-001";

function createArtifact(relativePath: string): string {
  const absolute = join(root, relativePath);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, `# basis artifact\n`, "utf-8");
  return relativePath;
}

function coverageJson(relations: RequirementCoverageRelation[]): string {
  return JSON.stringify({ mode: "requirement", reqId: REQ, relations });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "artifact-semantics-basis-"));
  mkdirSync(join(root, "docs", "requirements"), { recursive: true });
  writeFileSync(join(root, "docs", "requirements", "REQ-900.md"), `| ${REQ} | test line |\n`, "utf-8");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("parseAdoptedConventions", () => {
  test("parses adopted conventions from declaration YAML", () => {
    const yaml = "artifact_semantics:\n  independentDesignRequired: false\n  alternativeDesignBasisAllowed: true\n  adoptedAt: \"2026-10-10\"\n";
    const conventions = parseAdoptedConventions(yaml);
    expect(conventions).toEqual({
      independentDesignRequired: false,
      alternativeDesignBasisAllowed: true,
      source: "adopted",
      adoptedAt: "2026-10-10",
    });
  });

  test("fails closed when required flags are missing", () => {
    expect(() => parseAdoptedConventions("artifact_semantics:\n  independentDesignRequired: true\n")).toThrow(ConventionsError);
  });

  test("fails closed when root section is absent", () => {
    expect(() => parseAdoptedConventions("other: true\n")).toThrow(ConventionsError);
  });
});

describe("migration default conventions (REQ-105-008)", () => {
  test("resolves currently-effective operation as adopted conventions when no adoption declaration exists", () => {
    // 採用宣言が無い間は、現に実効している運用を採用済み規約として扱う
    const conventions = MIGRATION_DEFAULT_CONVENTIONS;
    expect(conventions.source).toBe("migration-default");
    expect(conventions.independentDesignRequired).toBe(true);
    expect(conventions.alternativeDesignBasisAllowed).toBe(true);
  });
});

describe("assessDesignBasis", () => {
  test("confirms basis from independent design document declaration", () => {
    const artifact = createArtifact(join("docs", "designs", "basis.md"));
    const result = assessDesignBasis(root, coverageJson([{ role: "design", file: artifact, line: 7 }]), MIGRATION_DEFAULT_CONVENTIONS);
    expect(result.designBasis).toBe("confirmed");
    expect(result.basisKind).toBe("independent-design");
    expect(result.independentDesignDeclarations).toEqual([{ file: artifact, line: 7 }]);
  });

  test("does not treat a missing independent design document alone as unfulfilled design responsibility (REQ-105-002)", () => {
    // 独立 Design 文書がないことだけを理由に設計責務を未成立としない:
    // 採用規約が認める適切な成果物からの設計根拠宣言で confirmed になる
    const basisArtifact = createArtifact(join("docs", "knowledge", "basis-note.md"));
    const result = assessDesignBasis(root, coverageJson([{ role: "design", file: basisArtifact, line: 3 }]), MIGRATION_DEFAULT_CONVENTIONS);
    expect(result.designBasis).toBe("confirmed");
    expect(result.basisKind).toBe("alternative-artifact");
    expect(result.alternativeDesignDeclarations).toEqual([{ file: basisArtifact, line: 3 }]);
  });

  test("detects missing design basis when no declaration exists (REQ-105-003)", () => {
    const result = assessDesignBasis(root, coverageJson([]), MIGRATION_DEFAULT_CONVENTIONS);
    expect(result.designBasis).toBe("missing");
    expect(result.missingReason).toBe("no-design-basis-declaration");
    expect(result.independentDesignRequired).toBe(true);
  });

  test("does not count a declaration whose referenced artifact does not exist (REQ-105-004)", () => {
    // 対応宣言の存在だけを根拠に合格にしない: 参照先成果物が実在しない宣言は根拠に数えない
    const missingArtifact = join("docs", "designs", "ghost.md");
    const result = assessDesignBasis(root, coverageJson([{ role: "design", file: missingArtifact, line: 1 }]), MIGRATION_DEFAULT_CONVENTIONS);
    expect(result.designBasis).toBe("missing");
    expect(result.missingReason).toBe("declared-artifact-not-found");
    expect(result.unresolvedDeclarations).toEqual([{ file: missingArtifact, line: 1 }]);
  });

  test("rejects alternative basis when conventions do not allow it (independent design required)", () => {
    // 独立設計書を必須成果物として採用した場合、代替成果物を認めない採用では欠落を見逃さない
    const basisArtifact = createArtifact(join("docs", "knowledge", "basis-note.md"));
    const conventions: ArtifactSemanticsConventions = {
      independentDesignRequired: true,
      alternativeDesignBasisAllowed: false,
      source: "adopted",
    };
    const result = assessDesignBasis(root, coverageJson([{ role: "design", file: basisArtifact, line: 3 }]), conventions);
    expect(result.designBasis).toBe("missing");
    expect(result.missingReason).toBe("alternative-basis-not-allowed-by-conventions");
  });

  test("never outputs a design validity verdict from declarations or existence (REQ-105-004)", () => {
    // 宣言が confirmed でも、妥当性の合格値を出力しない構造保証
    const artifact = createArtifact(join("docs", "designs", "basis.md"));
    const confirmed = assessDesignBasis(root, coverageJson([{ role: "design", file: artifact, line: 7 }]), MIGRATION_DEFAULT_CONVENTIONS);
    expect(confirmed.designValidity).toBe("not-evaluated-by-this-tool");
    const missing = assessDesignBasis(root, coverageJson([]), MIGRATION_DEFAULT_CONVENTIONS);
    expect(missing.designValidity).toBe("not-evaluated-by-this-tool");
  });

  test("ignores non-design relations when classifying design basis", () => {
    const artifact = createArtifact(join("src", "impl.ts"));
    const result = assessDesignBasis(root, coverageJson([{ role: "implementation", file: artifact, line: 1 }]), MIGRATION_DEFAULT_CONVENTIONS);
    expect(result.designBasis).toBe("missing");
    expect(result.missingReason).toBe("no-design-basis-declaration");
  });
});
