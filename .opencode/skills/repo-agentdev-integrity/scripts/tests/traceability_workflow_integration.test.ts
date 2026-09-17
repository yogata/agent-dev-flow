// ADF-COVERS(verification): REQ-021-011, REQ-021-012, REQ-021-013, REQ-021-014, REQ-021-015, REQ-021-016, REQ-021-017, REQ-021-018, REQ-021-019, REQ-021-020, REQ-021-021, REQ-021-022
//
// トレーサビリティのワークフロー統合（OU-003、Issue #2361）の切替検証。
// 対象 Design・Workflow Skill 本文・extension の旧 agentdev-artifact-graph 参照の残存なし、
// 診断・レビュー系工程の agentdev-traceability 一般探索利用の禁止、
// REQ-021-011〜022 の割り当て文言の存在を検証する。

import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..", "..", "..", "..", "..");

function read(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), "utf-8");
}

/** Issue #2361 の対象範囲（Design + Workflow Skill + extension）。
 * req-save / design-save 系（Design、Workflow Skill、extension）は Issue #2810（DEC-029）で廃止済みのため検査対象から除去した。
 * REQ-021-012/013/020 の割り当て先再設定は REQ-021 側の更新（後続工程）で対応する。 */
const SWITCH_TARGET_FILES: readonly string[] = [
  "docs/designs/commands/req-define.md",
  "docs/designs/commands/case-open.md",
  "docs/designs/commands/case-run.md",
  "docs/designs/commands/case-close.md",
  "docs/designs/commands/inspect-docs.md",
  "docs/designs/commands/inspect-skills.md",
  "docs/designs/commands/backlog-review.md",
  "docs/designs/skills/agentdev-doc-diagnostics.md",
  "docs/designs/skills/agentdev-adversarial-review.md",
  "src/opencode/skills/agentdev-workflow-req-define/SKILL.md",
  "src/opencode/skills/agentdev-workflow-case-open/SKILL.md",
  "src/opencode/skills/agentdev-workflow-case-run/SKILL.md",
  "src/opencode/skills/agentdev-workflow-case-close/SKILL.md",
  "src/opencode/skills/agentdev-workflow-inspect-docs/SKILL.md",
  "src/opencode/skills/agentdev-workflow-inspect-skills/SKILL.md",
  "src/opencode/skills/agentdev-workflow-backlog-review/SKILL.md",
  "src/opencode/skills/agentdev-adversarial-review/SKILL.md",
  "src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md",
  ".agentdev/extensions/skills/agentdev-workflow-req-define.yaml",
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
        // Wave 1（Definition PR #2937）で sidecar 配置先の文言へ更新された
        "component / package 単位 sidecar へ作成・更新する",
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
      // Wave 1（Definition PR #2937）で fail-closed 区別の文言へ更新された
      phrases: ["対応完全性の合格として扱わず"],
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
    "src/opencode/skills/agentdev-workflow-case-open/SKILL.md",
    "src/opencode/skills/agentdev-workflow-case-run/SKILL.md",
    "src/opencode/skills/agentdev-workflow-case-close/SKILL.md",
  ])("Workflow Skill がトレーサビリティ能力の利用節を持つ: %s", (rel) => {
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
    ".agentdev/extensions/skills/agentdev-workflow-case-ready.yaml",
    ".agentdev/extensions/skills/agentdev-workflow-case-open.yaml",
    ".agentdev/extensions/skills/agentdev-adversarial-review.yaml",
  ])("traceability を利用しない工程の extension が rules を持たない: %s", (rel) => {
    expect(read(rel).includes("rules: []")).toBe(true);
  });
});

describe("case-ready トレーサビリティ完全性ゲート契約（REQ-061-023、CR-009、TS-009）", () => {
  const CASE_READY_SKILL = "src/opencode/skills/agentdev-workflow-case-ready/SKILL.md";
  const CASE_READY_GATE_REF =
    "src/opencode/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md";
  const CASE_READY_DEF_REF =
    "src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md";

  it("case-ready 本文が Design 対応 1 件以上とポリシー有効性を ready 遷移の必要条件として記述する", () => {
    const skill = read(CASE_READY_SKILL);
    expect(skill.includes("Design 対応 1 件以上")).toBe(true);
    expect(skill.includes("トレーサビリティポリシーの有効性")).toBe(true);
    expect(skill.includes("ready 遷移の必要条件")).toBe(true);
  });

  it("missing-design / policy 不正を ready 不遷移条件として記述する", () => {
    const skill = read(CASE_READY_SKILL);
    expect(skill.includes("missing-design")).toBe(true);
    expect(skill.includes("ready へ遷移させない")).toBe(true);
    const gateRef = read(CASE_READY_GATE_REF);
    expect(gateRef.includes("ready へ遷移させず")).toBe(true);
    const defRef = read(CASE_READY_DEF_REF);
    expect(defRef.includes("case-open へ差し戻す")).toBe(true);
  });

  it("missing-verification 単独では ready 遷移を拒否しない（CR-009）", () => {
    for (const rel of [CASE_READY_SKILL, CASE_READY_GATE_REF, CASE_READY_DEF_REF]) {
      const content = read(rel);
      expect(content.includes("ready 拒否条件に含めない")).toBe(true);
    }
  });
});

describe("REQ 保存・Root Case 確立の対応不在非阻害（REQ-021-012、REQ-021-024、TS-010）", () => {
  it("case-open 本文が Design 対応未成立でも Root Case 確立を妨げないことを記述する", () => {
    const skill = read("src/opencode/skills/agentdev-workflow-case-open/SKILL.md");
    expect(skill.includes("Design 対応が未成立でも Root Case の確立を妨げない")).toBe(true);
    expect(skill.includes("Design 対応の成立判定（トレーサビリティ完全性ゲート）は case-ready が所有する")).toBe(true);
  });

  it("req-define 本文が対応作成除外と保存非阻害を記述する（REQ-021-012）", () => {
    const skill = read("src/opencode/skills/agentdev-workflow-req-define/SKILL.md");
    expect(skill.includes("Design 対応、実装対応、検証対応のいずれかを作成する責務を持たない")).toBe(true);
    expect(skill.includes("対応が存在しないことを理由に保存を失敗させない")).toBe(true);
  });

  it("req-define 本文が policy 登録記録と未登録非阻害を記述する（REQ-021-023）", () => {
    const skill = read("src/opencode/skills/agentdev-workflow-req-define/SKILL.md");
    expect(skill.includes("トレーサビリティポリシーへ明示登録されているかを保存結果に記録できる")).toBe(true);
    expect(skill.includes("未登録（検証対応必須扱い）であることを理由として保存を失敗させない")).toBe(true);
  });
});

describe("case-close QG-4 の3完全性再検査（REQ-021-018、REQ-021-025、REQ-021-027、TS-011）", () => {
  const CASE_CLOSE_SKILL = "src/opencode/skills/agentdev-workflow-case-close/SKILL.md";

  it("QG-4 が Design・implementation・required 行 verification の3完全性を独立再検査する", () => {
    const skill = read(CASE_CLOSE_SKILL);
    expect(
      skill.includes(
        "Design 対応、implementation 対応、verification 対応（policy が required と判定する要件行）の完全性",
      ),
    ).toBe(true);
    expect(skill.includes("inline declaration と top-level `traceability/` 配下の sidecar を同一に扱う")).toBe(true);
  });

  it("check 実行不能時に対応完全性を合格扱いしない（fail-closed）", () => {
    const skill = read(CASE_CLOSE_SKILL);
    expect(skill.includes("対応完全性の合格として扱わず")).toBe(true);
  });

  it("worktree root と main 側 root の再実行と policy 登録 commit の時系列確認を記述する（REQ-021-027）", () => {
    const skill = read(CASE_CLOSE_SKILL);
    expect(skill.includes("main 側 root で check を再実行")).toBe(true);
    expect(skill.includes("トレーサビリティポリシー登録 commit の時系列")).toBe(true);
    expect(skill.includes("durable state 上で解消済みの対象行を本変更起因の失敗と誤判定しない")).toBe(true);
  });
});

describe("case-run cleanup 判定の producer 側パス認定（REQ-021-015、RA-009）", () => {
  it("単一・Epic Wave の cleanup 判定が producer 側パス認定と表現形式非区別を記述する", () => {
    for (const rel of [
      "src/opencode/skills/agentdev-workflow-case-run/references/single.md",
      "src/opencode/skills/agentdev-workflow-case-run/references/epic-wave.md",
    ]) {
      const content = read(rel);
      expect(content.includes("implementation 役割かつ producer 側パス")).toBe(true);
      expect(content.includes("対応関係の表現形式を区別せず")).toBe(true);
      expect(content.includes("docs/ パスフィルタ")).toBe(false);
    }
  });

  it("case-run SKILL.md が対応宣言の作成先を配布境界で決定することを記述する", () => {
    const skill = read("src/opencode/skills/agentdev-workflow-case-run/SKILL.md");
    expect(skill.includes("consumer distribution closure")).toBe(true);
    expect(skill.includes("component / package 単位 sidecar")).toBe(true);
    expect(skill.includes("inline `ADF-COVERS` 宣言または sidecar")).toBe(true);
  });
});

describe("case-run PR 前 check 契約の9検出項目（REQ-021-016、RA-009）", () => {
  it("adapter 本文が9検出項目を列挙し Decision 欠落を非計上とする", () => {
    const content = read("src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md");
    for (const kind of [
      "malformed-declarations",
      "unknown-roles",
      "unknown-req-refs",
      "invalid-artifact-paths",
      "missing-design",
      "missing-implementation",
      "missing-verification",
      "policy-invalid",
      "duplicate-inconsistencies",
    ]) {
      expect(content.includes(`\`${kind}\``)).toBe(true);
    }
    expect(content.includes("Decision 対応の欠落は検出対象に含めない")).toBe(true);
  });
});

describe("workflow スキル本文スコープの旧語彙残存なし（TS-014、AC-21）", () => {
  const WORKFLOW_BODY_ROOTS: readonly string[] = [
    "src/opencode/skills/agentdev-workflow-case-run",
    "src/opencode/skills/agentdev-workflow-case-close",
    "src/opencode/skills/agentdev-workflow-case-ready",
    "src/opencode/skills/agentdev-workflow-case-open",
    "src/opencode/skills/agentdev-workflow-req-define",
    "src/opencode/skills/agentdev-case-run-execution-adapter",
  ];
  const LEGACY_BODY_PATTERNS: readonly RegExp[] = [
    /検証対応要否/,
    /verification-scope-catalog/,
    /検証対応必須行/,
    /検証対応任意行/,
    /未分類行/,
    /未分類残存/,
    /unclassified/,
    /implementation 役割かつ docs\/ 配下パス/,
    /docs\/ パスフィルタ/,
  ];

  function collectBodyFiles(root: string): string[] {
    const out: string[] = [];
    const stack = [join(REPO_ROOT, root)];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const full = join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(full);
        } else if (/\.(md|ts)$/.test(entry.name)) {
          out.push(full);
        }
      }
    }
    return out;
  }

  it("旧語彙が workflow スキル本文スコープから 0 件", () => {
    const offenders: string[] = [];
    for (const root of WORKFLOW_BODY_ROOTS) {
      for (const file of collectBodyFiles(root)) {
        const rel = file.slice(REPO_ROOT.length + 1).replaceAll("\\", "/");
        const lines = read(rel).split(/\r?\n/);
        lines.forEach((line, i) => {
          for (const pattern of LEGACY_BODY_PATTERNS) {
            if (pattern.test(line)) offenders.push(`${rel}:${i + 1}: ${pattern.source}`);
          }
        });
      }
    }
    expect(offenders).toEqual([]);
  });
});
