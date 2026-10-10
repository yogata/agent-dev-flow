// 受け入れ条件（基本責務のみでの運用〜単独/一気通貫の双方実施）を実装済み
// resolver・CLI の実動作で検査する。模擬判定器の合格ではなく、実装の resolver と
// CLI を模擬適用先プロジェクトの実ファイルに対して実際に実行した観測結果を検査する。
// 各テストは AC 対応を名前で明示する。

import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveBasis, identifyCriteria, type ResolutionBasis } from "../lib/resolve.ts";
import { evaluateCriteria } from "../lib/judge.ts";
import type { EvaluateOutcome } from "../lib/judge.ts";

function judged(outcome: EvaluateOutcome): Extract<EvaluateOutcome, { outcome: "judged" }> {
  if (outcome.outcome !== "judged") throw new Error(`判定結果ではない: ${outcome.outcome}`);
  return outcome;
}

function assertAdopted(basis: ResolutionBasis): Extract<ResolutionBasis, { basis: "adopted" }> {
  if (basis.basis !== "adopted") throw new Error(`採用済み基準で解決されていない: ${basis.basis}`);
  return basis;
}

function makeProject(): string {
  return mkdtempSync(join(tmpdir(), "adopted-conventions-ac-"));
}

function writeDeclaration(root: string, lines: readonly string[]): void {
  mkdirSync(join(root, ".agentdev"), { recursive: true });
  writeFileSync(join(root, ".agentdev", "adopted-conventions.yaml"), [...lines, ""].join("\n"), "utf8");
}

function writeFile(root: string, path: string, content = ""): void {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), content, "utf8");
}

const REFERENCE_MODEL_NOTE = "参照モデル（採用されていない例示）の工程は判定基準に含まれない";

describe("AC01: 基本責務のみを採用したプロジェクトで、詳細工程を必須とせずに必要な設計と検証を行える", () => {
  test("基本責務のみ（詳細工程ゼロ・必須成果物ゼロ）の採用宣言が解決・判定とも成立する", () => {
    const root = makeProject();
    try {
      // 基本責務のみを採用したプロジェクト。参照モデルの詳細工程（基本設計・詳細設計等）は採用しない
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes: []",
        "requiredArtifacts: []",
        "exclusions: []",
      ]);
      writeFile(root, "docs/notes/design-notes.md", "設計と検証は共通責務の範囲で対象作業内に保持する");
      const basis = resolveBasis(root);
      expect(basis.basis).toBe("adopted");
      const criteria = identifyCriteria(assertAdopted(basis).declarations);
      expect(criteria.processes).toHaveLength(0);
      expect(criteria.requiredArtifacts).toHaveLength(0);
      // 詳細工程の成果物がなくても判定は合格（詳細工程を必須としない）
      const result = judged(evaluateCriteria(root, basis));
      expect(result.accepted).toBe(true);
      expect(result.summary.total).toBe(0);
      expect(REFERENCE_MODEL_NOTE).toContain("参照モデル");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("基本責務のみの採用で、独立工程・独立文書の欠落を欠落と誤判定しない", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes: []",
        "requiredArtifacts: []",
        "exclusions: []",
      ]);
      const basis = resolveBasis(root);
      // 基本設計・詳細設計の独立文書（未採用参照例）の不在を問い合わせても欠落でない
      const result = judged(evaluateCriteria(root, basis, { checkPaths: ["docs/designs/basic-design.md", "docs/designs/detail-design.md"] }));
      expect(result.accepted).toBe(true);
      expect(result.summary.notInCriteria).toBe(2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("AC02: プロジェクトが詳細工程と必須成果物を定めたとき、ADF はそれらを対象作業の基準として参照できる", () => {
  test("採用宣言に定めた詳細工程・工程間関係・必須成果物を基準として解決し参照できる", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes:",
        "  - id: env-definition",
        "    title: 環境定義",
        "    requires: []",
        "  - id: detail-design",
        "    title: 詳細設計",
        "    requires: [env-definition]",
        "requiredArtifacts:",
        "  - process: env-definition",
        "    path: docs/designs/env-definition.md",
        "    purpose: 環境定義の完了判定に用いる成果物",
        "  - process: detail-design",
        "    path: docs/designs/detail-design.md",
        "exclusions: []",
      ]);
      writeFile(root, "docs/designs/env-definition.md");
      const basis = resolveBasis(root);
      expect(basis.basis).toBe("adopted");
      const criteria = identifyCriteria(assertAdopted(basis).declarations);
      // 採用済み工程・工程間関係・必須成果物が基準として参照できる
      expect(criteria.processes.map((p) => p.id)).toEqual(["env-definition", "detail-design"]);
      expect(criteria.processRelations).toContainEqual({ from: "env-definition", to: "detail-design" });
      expect(criteria.requiredArtifacts.map((a) => a.path)).toEqual(["docs/designs/env-definition.md", "docs/designs/detail-design.md"]);
      // 基準に基づく判定が動作する
      const result = judged(evaluateCriteria(root, basis));
      expect(result.accepted).toBe(false);
      expect(result.summary.missing).toBe(1);
      writeFile(root, "docs/designs/detail-design.md");
      const after = judged(evaluateCriteria(root, resolveBasis(root)));
      expect(after.accepted).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("AC03: 採用されていない参照例の工程・成果物を、欠落として誤判定しない", () => {
  test("詳細設計と環境定義を採用したプロジェクトで、基本設計（未採用参照例）の不在が欠落として計上されない", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes:",
        "  - id: detail-design",
        "    requires: []",
        "  - id: env-definition",
        "    requires: []",
        "requiredArtifacts:",
        "  - process: detail-design",
        "    path: docs/designs/detail-design.md",
        "  - process: env-definition",
        "    path: docs/designs/env-definition.md",
        "exclusions: []",
      ]);
      writeFile(root, "docs/designs/detail-design.md");
      writeFile(root, "docs/designs/env-definition.md");
      // 基本設計（basic-design）は参照モデルには示されるが採用していない
      const result = judged(evaluateCriteria(root, resolveBasis(root)));
      expect(result.accepted).toBe(true);
      expect(result.summary.missing).toBe(0);
      expect(result.verdicts.every((v) => v.status !== "not-in-criteria" || v.artifact.includes("basic-design"))).toBe(true);
      const notInCriteria = judged(evaluateCriteria(root, resolveBasis(root), { checkPaths: ["docs/designs/basic-design.md"] }));
      expect(notInCriteria.summary.notInCriteria).toBe(1);
      expect(notInCriteria.summary.missing).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("AC04: 採用済みで必須の成果物が存在しないとき、ファイル不在だけを根拠に工程省略として合格させない", () => {
  test("採用済み必須成果物の不在は missing のままで合格しない。根拠確認（省略明示・除外宣言）を経ない限り解消しない", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes:",
        "  - id: detail-design",
        "    requires: []",
        "requiredArtifacts:",
        "  - process: detail-design",
        "    path: docs/designs/detail-design.md",
        "exclusions: []",
      ]);
      const basis = resolveBasis(root);
      const before = judged(evaluateCriteria(root, basis));
      expect(before.accepted).toBe(false);
      expect(before.verdicts[0]?.status).toBe("missing");
      // 空の根拠（ファイル不在だけ）では解消されない
      const emptyReason = judged(evaluateCriteria(root, basis, {
        executionExclusions: [{ process: "detail-design", artifact: "docs/designs/detail-design.md", reason: "" }],
      }));
      expect(emptyReason.accepted).toBe(false);
      // 根拠ある除外宣言（実行契約由来）でのみ解消する
      const withBasis = judged(evaluateCriteria(root, basis, {
        executionExclusions: [{ process: "detail-design", artifact: "docs/designs/detail-design.md", reason: "対象作業の実行契約で省略を明示" }],
      }));
      expect(withBasis.accepted).toBe(true);
      const excluded = withBasis.verdicts[0];
      expect(excluded?.status).toBe("excluded-with-basis");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("採用規約上の省略明示（exclusions）のある必須成果物は根拠確認済みとして解消する", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes:",
        "  - id: detail-design",
        "    requires: []",
        "requiredArtifacts:",
        "  - process: detail-design",
        "    path: docs/designs/detail-design.md",
        "  - process: detail-design",
        "    path: docs/designs/detailed-review-record.md",
        "exclusions:",
        "  - process: detail-design",
        "    artifact: docs/designs/detailed-review-record.md",
        "    reason: 採用規約上、本成果物は省略と明示済み",
      ]);
      writeFile(root, "docs/designs/detail-design.md");
      const result = judged(evaluateCriteria(root, resolveBasis(root)));
      expect(result.accepted).toBe(true);
      expect(result.summary.pass).toBe(1);
      expect(result.summary.excluded).toBe(1);
      expect(result.summary.missing).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("AC05: 工程を分割・統合・省略しても、元の要求・制約・受け入れ条件・必要な検証義務が失われない", () => {
  test("分割した工程は継承義務の宣言が必須で、継承義務が基準に保持される（fail-closed）", () => {
    const root = makeProject();
    try {
      // 継承義務なしの分割は schema 検証で拒否され解決を実行不能とする（義務喪失を構造的に防ぐ）
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes:",
        "  - id: design-verification",
        "    requires: []",
        "  - id: design-review",
        "    requires: []",
        "    restructuredFrom: [design-verification]",
        "requiredArtifacts: []",
        "exclusions: []",
      ]);
      const rejected = resolveBasis(root);
      expect(rejected.basis).toBe("unresolvable");
      // 継承義務を宣言した分割は受理され、元の義務が基準に保持される
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes:",
        "  - id: design-verification",
        "    requires: []",
        "  - id: design-review",
        "    requires: []",
        "    restructuredFrom: [design-verification]",
        "    inheritsObligations:",
        "      requirements:",
        "        - 元の設計検証の要求",
        "      constraints:",
        "        - 元の設計検証の制約",
        "      acceptanceCriteria:",
        "        - 元の受け入れ条件",
        "      verificationObligations:",
        "        - 元の検証義務",
        "requiredArtifacts: []",
        "exclusions: []",
      ]);
      const basis = resolveBasis(root);
      expect(basis.basis).toBe("adopted");
      const criteria = identifyCriteria(assertAdopted(basis).declarations);
      expect(criteria.inheritedObligations).toHaveLength(1);
      const inherited = criteria.inheritedObligations[0];
      expect(inherited?.obligations.requirements).toEqual(["元の設計検証の要求"]);
      expect(inherited?.obligations.constraints).toEqual(["元の設計検証の制約"]);
      expect(inherited?.obligations.acceptanceCriteria).toEqual(["元の受け入れ条件"]);
      expect(inherited?.obligations.verificationObligations).toEqual(["元の検証義務"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("工程の省略は根拠ある除外宣言を経由してのみ成立する（AC04 の省略合格禁止と同一経路）", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, [
        "version: adopted-conventions-v1",
        'adoptedAt: "2026-10-10"',
        "processes:",
        "  - id: detail-design",
        "    requires: []",
        "requiredArtifacts:",
        "  - process: detail-design",
        "    path: docs/designs/detail-design.md",
        "exclusions: []",
      ]);
      const basis = resolveBasis(root);
      const result = judged(evaluateCriteria(root, basis));
      // 根拠のない不在は工程省略として合格しない
      expect(result.accepted).toBe(false);
      expect(result.verdicts[0]?.status).toBe("missing");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("AC06: 同じ共通責務モデルで、単独工程の実施と一気通貫の実施を扱え、恒久的な工程進捗の管理を必須としない", () => {
  const pipelineDeclaration = [
    "version: adopted-conventions-v1",
    'adoptedAt: "2026-10-10"',
    "processes:",
    "  - id: requirement-definition",
    "    requires: []",
    "  - id: design",
    "    requires: [requirement-definition]",
    "  - id: implementation",
    "    requires: [design]",
    "requiredArtifacts:",
    "  - process: requirement-definition",
    "    path: docs/requirements/feature.md",
    "  - process: design",
    "    path: docs/notes/design-notes.md",
    "  - process: implementation",
    "    path: src/feature.ts",
    "exclusions: []",
  ];

  test("単独工程（design のみ）の部分集合を同一 resolver の scope で実施・判定できる", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, pipelineDeclaration);
      writeFile(root, "docs/requirements/feature.md");
      writeFile(root, "docs/notes/design-notes.md");
      // design 単独の実施（scope により前置依存 requirement-definition も基準に含まれる）
      const basis = resolveBasis(root);
      const criteria = identifyCriteria(assertAdopted(basis).declarations, ["design"]);
      expect(criteria.processes.map((p) => p.id)).toEqual(["requirement-definition", "design"]);
      const result = judged(evaluateCriteria(root, basis, { processScope: ["design"] }));
      expect(result.accepted).toBe(true);
      expect(result.summary.total).toBe(2);
      // implementation の成果物は scope 外のため判定対象にならない（恒久進捗管理なし・必要時のみ）
      expect(result.verdicts.every((v) => v.status === "pass" || v.status === "not-in-criteria")).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("同一 resolver で一気通貫（全工程）の実施・判定ができる", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, pipelineDeclaration);
      writeFile(root, "docs/requirements/feature.md");
      writeFile(root, "docs/notes/design-notes.md");
      writeFile(root, "src/feature.ts");
      const result = judged(evaluateCriteria(root, resolveBasis(root)));
      expect(result.accepted).toBe(true);
      expect(result.summary.pass).toBe(3);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("resolver は工程進捗の恒久状態を保持しない（同一入力・同一結果の純関数）", () => {
    const root = makeProject();
    try {
      writeDeclaration(root, pipelineDeclaration);
      writeFile(root, "docs/requirements/feature.md");
      const basis = resolveBasis(root);
      const first = judged(evaluateCriteria(root, basis));
      const second = judged(evaluateCriteria(root, basis));
      expect(first).toEqual(second);
      // 採用宣言ファイル自体が判定基準に副作用として含まれない（恒久進捗台帳化しない）
      const result = judged(evaluateCriteria(root, resolveBasis(root), { checkPaths: [".agentdev/adopted-conventions.yaml"] }));
      expect(result.summary.notInCriteria).toBe(1);
      expect(result.summary.missing).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
