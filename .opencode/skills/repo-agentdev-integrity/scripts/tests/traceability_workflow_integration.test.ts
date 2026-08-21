// ADF-COVERS(verification): REQ-021-011, REQ-021-012, REQ-021-013, REQ-021-014, REQ-021-015, REQ-021-016, REQ-021-017, REQ-021-018, REQ-021-019, REQ-021-020, REQ-021-021, REQ-021-022
//
// トレーサビリティのワークフロー統合（OU-003、Issue #2361）の切替検証。
// 対象 Design・Workflow Skill 本文・extension の旧 agentdev-artifact-graph 参照の残存なし、
// 診断・レビュー系工程の agentdev-traceability 一般探索利用の禁止、
// REQ-021-011〜022 の割り当て文言の存在を検証する。

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..", "..", "..", "..", "..");

function read(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), "utf-8");
}

/** Issue #2361 の対象範囲（Design 10件 + req-save Design + Workflow Skill 10件 + extension 6件） */
const SWITCH_TARGET_FILES: readonly string[] = [
  "docs/designs/commands/req-define.md",
  "docs/designs/commands/design-save.md",
  "docs/designs/commands/case-open.md",
  "docs/designs/commands/case-run.md",
  "docs/designs/commands/case-close.md",
  "docs/designs/commands/inspect-docs.md",
  "docs/designs/commands/inspect-skills.md",
  "docs/designs/commands/backlog-review.md",
  "docs/designs/commands/req-save.md",
  "docs/designs/skills/agentdev-doc-diagnostics.md",
  "docs/designs/skills/agentdev-adversarial-review.md",
  "src/opencode/skills/agentdev-workflow-req-define/SKILL.md",
  "src/opencode/skills/agentdev-workflow-design-save/SKILL.md",
  "src/opencode/skills/agentdev-workflow-case-open/SKILL.md",
  "src/opencode/skills/agentdev-workflow-case-run/SKILL.md",
  "src/opencode/skills/agentdev-workflow-case-close/SKILL.md",
  "src/opencode/skills/agentdev-workflow-inspect-docs/SKILL.md",
  "src/opencode/skills/agentdev-workflow-inspect-skills/SKILL.md",
  "src/opencode/skills/agentdev-workflow-backlog-review/SKILL.md",
  "src/opencode/skills/agentdev-adversarial-review/SKILL.md",
  "src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md",
  ".agentdev/extensions/skills/agentdev-workflow-req-define.yaml",
  ".agentdev/extensions/skills/agentdev-workflow-design-save.yaml",
  ".agentdev/extensions/skills/agentdev-workflow-case-open.yaml",
  ".agentdev/extensions/skills/agentdev-workflow-case-run.yaml",
  ".agentdev/extensions/skills/agentdev-workflow-case-close.yaml",
  ".agentdev/extensions/skills/agentdev-adversarial-review.yaml",
];

/** REQ-021-021 の対象（診断・レビュー系5工程: Design と Workflow Skill 本文） */
const DIAGNOSTIC_REVIEW_FILES: readonly string[] = [
  "docs/designs/commands/inspect-docs.md",
  "docs/designs/commands/inspect-skills.md",
  "docs/designs/commands/backlog-review.md",
  "docs/designs/skills/agentdev-doc-diagnostics.md",
  "docs/designs/skills/agentdev-adversarial-review.md",
  "src/opencode/skills/agentdev-workflow-inspect-docs/SKILL.md",
  "src/opencode/skills/agentdev-workflow-inspect-skills/SKILL.md",
  "src/opencode/skills/agentdev-workflow-backlog-review/SKILL.md",
  "src/opencode/skills/agentdev-adversarial-review/SKILL.md",
];

const LEGACY_PATTERNS: readonly RegExp[] = [
  /agentdev-artifact-graph/,
  /Artifact Graph/,
  /\.agentdev\/graph/,
];

describe("トレーサビリティのワークフロー統合: 旧参照の残存なし", () => {
  it.each(SWITCH_TARGET_FILES)("対象ファイルに旧参照が残存しない: %s", (rel) => {
    const content = read(rel);
    for (const pattern of LEGACY_PATTERNS) {
      expect(pattern.test(content)).toBe(false);
    }
  });
});

describe("REQ-021-021: 診断・レビュー系工程の agentdev-traceability 一般探索利用の禁止", () => {
  it.each(DIAGNOSTIC_REVIEW_FILES)("agentdev-traceability の言及が否定文のみ: %s", (rel) => {
    const lines = read(rel).split(/\r?\n/);
    for (const line of lines) {
      if (line.includes("agentdev-traceability")) {
        expect(line.includes("利用しない")).toBe(true);
      }
    }
  });

  it.each(DIAGNOSTIC_REVIEW_FILES.slice(0, 5))("独立探索手段への切替が記述されている: %s", (rel) => {
    expect(read(rel).includes("独立探索手段")).toBe(true);
  });
});

describe("REQ-021-011〜022 の割り当て文言の存在", () => {
  const phraseChecks: ReadonlyArray<{ req: string; file: string; phrases: readonly string[] }> = [
    {
      req: "REQ-021-011",
      file: "docs/designs/commands/req-define.md",
      phrases: [
        "impact を変更影響候補の確認に利用できる",
        "impact の空結果を「影響なし」の根拠としない",
        "推測して正規情報として保存しない",
        "対象範囲を確定しない",
      ],
    },
    {
      req: "REQ-021-012",
      file: "docs/designs/commands/req-save.md",
      phrases: [
        "対応宣言を作成する責務を持たない",
        "失敗させない",
      ],
    },
    {
      req: "REQ-021-013",
      file: "docs/designs/commands/design-save.md",
      phrases: [
        "明示的に確定している場合",
        "再推論して正規の対応関係を生成しない",
        "Design action が存在しない要件の処理を妨げない",
      ],
    },
    {
      req: "REQ-021-014",
      file: "docs/designs/commands/case-open.md",
      phrases: [
        "対象要件と実行契約を Issue へ引き継ぐ",
        "対象範囲を再決定しない",
      ],
    },
    {
      req: "REQ-021-015",
      file: "docs/designs/commands/case-run.md",
      phrases: [
        "そのファイルを要件へ自動的に対応付けない",
        "対応宣言として正規成果物へ明示する",
      ],
    },
    {
      req: "REQ-021-016",
      file: "docs/designs/commands/case-run.md",
      phrases: [
        "PR 作成前に対象要件について check を実行し",
        "修正して再検証する",
      ],
    },
    {
      req: "REQ-021-017",
      file: "docs/designs/commands/case-run.md",
      phrases: [
        "blocked として必要な判断事項を報告する",
      ],
    },
    {
      req: "REQ-021-018",
      file: "docs/designs/commands/case-close.md",
      phrases: [
        "独立して再検査する",
        "マージせず停止する",
        "修正対象として差し戻せる",
      ],
    },
    {
      req: "REQ-021-019",
      file: "docs/designs/commands/case-run.md",
      phrases: [
        "恒常的な対応関係",
        "実行結果は Issue, PR, QG 側で扱う",
      ],
    },
    {
      req: "REQ-021-019",
      file: "docs/designs/commands/case-close.md",
      phrases: [
        "分離して扱う",
      ],
    },
    {
      req: "REQ-021-020",
      file: "docs/designs/commands/design-save.md",
      phrases: [
        "同じ対応宣言を重複生成しない",
      ],
    },
    {
      req: "REQ-021-020",
      file: "docs/designs/commands/case-run.md",
      phrases: [
        "同じ対応宣言を重複生成しない",
      ],
    },
    {
      req: "REQ-021-022",
      file: "docs/designs/commands/req-define.md",
      phrases: ["トレーサビリティ機能側の異常を区別する"],
    },
    {
      req: "REQ-021-022",
      file: "docs/designs/commands/case-run.md",
      phrases: ["トレーサビリティ機能側の異常を区別する"],
    },
    {
      req: "REQ-021-022",
      file: "docs/designs/commands/case-close.md",
      phrases: ["トレーサビリティ機能側の異常を区別する"],
    },
  ];

  it.each(phraseChecks)("%s: %s", ({ file, phrases }) => {
    const content = read(file);
    for (const phrase of phrases) {
      expect(content.includes(phrase)).toBe(true);
    }
  });
});

describe("Workflow Skill 本文・extension の切替", () => {
  it.each([
    "src/opencode/skills/agentdev-workflow-req-define/SKILL.md",
    "src/opencode/skills/agentdev-workflow-design-save/SKILL.md",
    "src/opencode/skills/agentdev-workflow-case-open/SKILL.md",
    "src/opencode/skills/agentdev-workflow-case-run/SKILL.md",
    "src/opencode/skills/agentdev-workflow-case-close/SKILL.md",
  ])("5工程 Workflow Skill がトレーサビリティ能力の利用節を持つ: %s", (rel) => {
    expect(read(rel).includes("## トレーサビリティ能力の利用")).toBe(true);
  });

  it.each([
    "src/opencode/skills/agentdev-workflow-inspect-docs/SKILL.md",
    "src/opencode/skills/agentdev-workflow-inspect-skills/SKILL.md",
    "src/opencode/skills/agentdev-workflow-backlog-review/SKILL.md",
    "src/opencode/skills/agentdev-adversarial-review/SKILL.md",
  ])("診断・レビュー系 Workflow Skill が独立探索手段の節を持つ: %s", (rel) => {
    expect(read(rel).includes("## 候補探索（独立探索手段）")).toBe(true);
  });

  it.each([
    ".agentdev/extensions/skills/agentdev-workflow-req-define.yaml",
    ".agentdev/extensions/skills/agentdev-workflow-case-run.yaml",
    ".agentdev/extensions/skills/agentdev-workflow-case-close.yaml",
  ])("traceability を利用する工程の extension rule が agentdev-traceability を指す: %s", (rel) => {
    expect(read(rel).includes("skill: agentdev-traceability")).toBe(true);
  });

  it.each([
    ".agentdev/extensions/skills/agentdev-workflow-design-save.yaml",
    ".agentdev/extensions/skills/agentdev-workflow-case-open.yaml",
    ".agentdev/extensions/skills/agentdev-adversarial-review.yaml",
  ])("traceability を利用しない工程の extension が rules を持たない: %s", (rel) => {
    expect(read(rel).includes("rules: []")).toBe(true);
  });
});
