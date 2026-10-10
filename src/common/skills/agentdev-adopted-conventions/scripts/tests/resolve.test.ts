// 採用宣言の schema 検証、解析、解決手順（採用宣言の確認 → 基準の特定）の検査。
// silent skip 禁止、継承義務の fail-closed、移行期デフォルト接続、
// scope による単独工程の基準特定を対象とする。

import { describe, expect, test } from "bun:test";
import { validateConventions, CONVENTIONS_VERSION, type AdoptedConventions } from "../lib/schema.ts";
import { loadConventions } from "../lib/parse.ts";
import { resolveBasis, identifyCriteria, TRANSITION_DEFAULT_REFERENCE } from "../lib/resolve.ts";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function makeProject(): string {
  return mkdtempSync(join(tmpdir(), "adopted-conventions-resolve-"));
}

function writeDeclaration(root: string, yaml: string, file?: string): void {
  const path = file ?? ".agentdev/adopted-conventions.yaml";
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), yaml, "utf8");
}

function validDeclarationYaml(): string {
  return [
    "version: adopted-conventions-v1",
    'adoptedAt: "2026-10-10"',
    "processes:",
    "  - id: detail-design",
    "    title: 詳細設計",
    "    requires: []",
    "requiredArtifacts:",
    "  - process: detail-design",
    "    path: docs/designs/detail-design.md",
    "exclusions: []",
    "",
  ].join("\n");
}

describe("採用宣言の schema 検証", () => {
  test("version が一致する採用宣言を受理する", () => {
    const result = validateConventions({
      version: CONVENTIONS_VERSION,
      adoptedAt: "2026-10-10",
      processes: [{ id: "detail-design", title: "詳細設計", requires: [], restructuredFrom: [], inheritsObligations: null }],
      requiredArtifacts: [{ process: "detail-design", path: "docs/designs/detail-design.md" }],
      exclusions: [],
    });
    expect(result.issues).toEqual([]);
    expect(result.declarations?.processes).toHaveLength(1);
  });

  test("version 不一致・未知キー・欠落フィールドを黙って読み飛ばさず全部収集する", () => {
    const result = validateConventions({
      version: "adopted-conventions-v2",
      unknownTopKey: true,
      processes: [{ id: "x", requires: [], unknownKey: 1 }],
      requiredArtifacts: [{ process: "no-such-process", path: "a.md" }],
      exclusions: [{ process: "x", artifact: "not-declared.md", reason: "no" }],
    });
    expect(result.declarations).toBeNull();
    const details = result.issues.map((i) => i.detail).join("\n");
    expect(details).toContain("version");
    expect(details).toContain("未知のキー");
    expect(details).toContain("requiredArtifacts");
    expect(details).toContain("存在しない");
  });

  test("工程 id の重複を検出する", () => {
    const result = validateConventions({
      version: CONVENTIONS_VERSION,
      adoptedAt: "2026-10-10",
      processes: [
        { id: "dup", requires: [], restructuredFrom: [], inheritsObligations: null },
        { id: "dup", requires: [], restructuredFrom: [], inheritsObligations: null },
      ],
      requiredArtifacts: [],
      exclusions: [],
    });
    expect(result.declarations).toBeNull();
    expect(result.issues.some((i) => i.detail.includes("重複"))).toBe(true);
  });

  test("分割・統合（restructuredFrom）で継承義務がない宣言を fail-closed で拒否する", () => {
    const result = validateConventions({
      version: CONVENTIONS_VERSION,
      adoptedAt: "2026-10-10",
      processes: [
        { id: "origin", requires: [], restructuredFrom: [], inheritsObligations: null },
        { id: "split", requires: [], restructuredFrom: ["origin"], inheritsObligations: null },
      ],
      requiredArtifacts: [],
      exclusions: [],
    });
    expect(result.declarations).toBeNull();
    expect(result.issues.some((i) => i.detail.includes("継承宣言"))).toBe(true);
  });

  test("継承義務の空宣言も義務喪失として拒否する", () => {
    const result = validateConventions({
      version: CONVENTIONS_VERSION,
      adoptedAt: "2026-10-10",
      processes: [
        { id: "origin", requires: [], restructuredFrom: [], inheritsObligations: null },
        { id: "split", requires: [], restructuredFrom: ["origin"], inheritsObligations: { requirements: [], constraints: [], acceptanceCriteria: [], verificationObligations: [] } },
      ],
      requiredArtifacts: [],
      exclusions: [],
    });
    expect(result.declarations).toBeNull();
    expect(result.issues.some((i) => i.detail.includes("継承義務が空"))).toBe(true);
  });

  test("継承義務を持つ分割・統合の宣言を受理する", () => {
    const result = validateConventions({
      version: CONVENTIONS_VERSION,
      adoptedAt: "2026-10-10",
      processes: [
        { id: "origin", requires: [], restructuredFrom: [], inheritsObligations: null },
        { id: "split", requires: [], restructuredFrom: ["origin"], inheritsObligations: { requirements: ["元の要求 A"], constraints: [], acceptanceCriteria: [], verificationObligations: ["検証義務 B"] } },
      ],
      requiredArtifacts: [],
      exclusions: [],
    });
    expect(result.issues).toEqual([]);
    expect(result.declarations?.processes[1]?.inheritsObligations?.requirements).toEqual(["元の要求 A"]);
  });

  test("除外宣言は必須成果物の宣言に対してのみ成立する", () => {
    const result = validateConventions({
      version: CONVENTIONS_VERSION,
      adoptedAt: "2026-10-10",
      processes: [{ id: "p", requires: [], restructuredFrom: [], inheritsObligations: null }],
      requiredArtifacts: [{ process: "p", path: "docs/required.md" }],
      exclusions: [{ process: "p", artifact: "docs/undeclared.md", reason: "根拠" }],
    });
    expect(result.declarations).toBeNull();
    expect(result.issues.some((i) => i.detail.includes("必須成果物"))).toBe(true);
  });

  test("root からの相対パスの区切りを POSIX 形式へ正規化する", () => {
    const result = validateConventions({
      version: CONVENTIONS_VERSION,
      adoptedAt: "2026-10-10",
      processes: [{ id: "p", requires: [], restructuredFrom: [], inheritsObligations: null }],
      requiredArtifacts: [{ process: "p", path: "docs\\designs\\a.md" }],
      exclusions: [],
    });
    expect(result.declarations?.requiredArtifacts[0]?.path).toBe("docs/designs/a.md");
  });
});

describe("採用宣言の読み込みと解決", () => {
  test("採用宣言が存在する場合は adopted として解決する", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, validDeclarationYaml());
      const basis = resolveBasis(root);
      expect(basis.basis).toBe("adopted");
      if (basis.basis !== "adopted") return;
      expect(basis.declarations.processes[0]?.id).toBe("detail-design");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("採用宣言が存在しない場合は移行期デフォルトへ接続する", () => {
    const root = makeProject();
    try {
      const basis = resolveBasis(root);
      expect(basis.basis).toBe("transition-default");
      if (basis.basis !== "transition-default") return;
      expect(basis.reference).toBe(TRANSITION_DEFAULT_REFERENCE);
      expect(basis.file).toBeNull();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("移行期デフォルトの参照点は現行運用の正規成果物から解決する旨を含む", () => {
    expect(TRANSITION_DEFAULT_REFERENCE).toContain("現に実効している");
    expect(TRANSITION_DEFAULT_REFERENCE).toContain("現行の正規成果物");
  });

  test("schema 不適合の採用宣言は解決を実行不能とする（silent skip しない）", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, "version: wrong-version\nadoptedAt: \"2026-10-10\"\nprocesses: []\nrequiredArtifacts: []\n");
      const basis = resolveBasis(root);
      expect(basis.basis).toBe("unresolvable");
      if (basis.basis !== "unresolvable") return;
      expect(basis.reason).toContain("schema");
      expect(basis.issues.length).toBeGreaterThan(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("YAML 解析不能な採用宣言は解決を実行不能とする", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, "\t- version: [\n  bad");
      const basis = resolveBasis(root);
      expect(basis.basis).toBe("unresolvable");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("loadConventions は宣言不在・読取不能を区別する", () => {
    const root = makeProject();
    try {
      expect(loadConventions(root).status).toBe("absent");
      mkdirSync(join(root, ".agentdev"), { recursive: true });
      writeFileSync(join(root, ".agentdev", "adopted-conventions.yaml"), "", "utf8");
      expect(loadConventions(root).status).toBe("invalid");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("基準の特定（identifyCriteria）", () => {
  const declarations: AdoptedConventions = {
    version: CONVENTIONS_VERSION,
    adoptedAt: "2026-10-10",
    processes: [
      { id: "basic-design", requires: [], restructuredFrom: [], inheritsObligations: null },
      { id: "detail-design", requires: ["basic-design"], restructuredFrom: [], inheritsObligations: null },
      { id: "detail-design-split", requires: [], restructuredFrom: ["detail-design"], inheritsObligations: { requirements: ["元の要求"], constraints: [], acceptanceCriteria: [], verificationObligations: [] } },
    ],
    requiredArtifacts: [
      { process: "basic-design", path: "docs/designs/basic.md" },
      { process: "detail-design", path: "docs/designs/detail.md" },
    ],
    exclusions: [],
  };

  test("工程間関係（requires）を順序・依存として導出する", () => {
    const criteria = identifyCriteria(declarations);
    expect(criteria.processRelations).toContainEqual({ from: "basic-design", to: "detail-design" });
    expect(criteria.requiredArtifacts).toHaveLength(2);
  });

  test("分割・統合元の義務継承を基準に保持する", () => {
    const criteria = identifyCriteria(declarations);
    expect(criteria.inheritedObligations).toHaveLength(1);
    expect(criteria.inheritedObligations[0]?.process).toBe("detail-design-split");
    expect(criteria.inheritedObligations[0]?.obligations.requirements).toEqual(["元の要求"]);
  });

  test("scope で単独工程の部分集合を特定できる", () => {
    const criteria = identifyCriteria(declarations, ["detail-design"]);
    // detail-design の前置依存（basic-design）も基準に含まれる（依存切断で義務を失わせない）
    expect(criteria.processes.map((p) => p.id)).toEqual(["basic-design", "detail-design"]);
    expect(criteria.requiredArtifacts.map((a) => a.path)).toEqual(["docs/designs/basic.md", "docs/designs/detail.md"]);
  });

  test("scope 内工程の前置依存も基準に含める（依存切断で義務を失わせない）", () => {
    const criteria = identifyCriteria(declarations, ["detail-design-split", "detail-design"]);
    // detail-design-split は前置依存を持たない。detail-design は basic-design を前置に持つため含まれる
    expect(criteria.processes.map((p) => p.id)).toContain("basic-design");
  });

  test("scope に採用されていない工程 id があればエラーとする（未採用参照例を基準にしない）", () => {
    expect(() => identifyCriteria(declarations, ["basic-detail-not-adopted"])).toThrow("採用されていない");
  });
});
