// ADF-COVERS(verification): REQ-012-044, REQ-012-048, REQ-012-049, REQ-012-052, REQ-021-011, REQ-021-012, REQ-021-013, REQ-021-014, REQ-021-015, REQ-021-016, REQ-021-017, REQ-021-018, REQ-021-019, REQ-021-020, REQ-021-021, REQ-021-022
//
// agentdev-traceability 配布スキルのワークフロー横断の統合検証。
// 3能力（coverage、impact、check）の統合動作（派生 Graph 非依存・旧公開API非依存・
// `.agentdev/graph/` の生成・鮮度管理の非実行）、REQ-012-043〜050 の対応宣言の完全性
// （実コーパス）、トレーサビリティのワークフロー統合の切替検証（対象 Design・Workflow
// Skill 本文・extension の旧参照の残存なし、診断・レビュー系工程の一般探索利用の禁止、
// 割り当て文言の存在）、case-ready / case-close / case-run のトレーサビリティ契約文言を
// 検証する。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_EXCLUDE_DIRS,
  DEFAULT_EXCLUDE_DIR_PATHS,
  scanCorpus,
} from "../../../../skills/agentdev-traceability/scripts/lib/corpus.ts";
import { parseDeclarations } from "../../../../skills/agentdev-traceability/scripts/lib/declarations.ts";
import { coverageByRequirement, impactByArtifact } from "../../../../skills/agentdev-traceability/scripts/lib/query.ts";
import { runChecks } from "../../../../skills/agentdev-traceability/scripts/lib/check.ts";
import { currentRequirementLineIds } from "../../../../skills/agentdev-traceability/scripts/lib/requirements.ts";
import { findRepoRoot } from "../../lib/cli_utils.ts";

describe("3能力の統合（coverage・impact・check）", () => {
  // 3能力（coverage、impact、check）の統合検証（OU-002、Issue #2360）。派生 Graph が
  // 存在しない状態での動作（AC-001）、旧公開API非依存（AC-009）、`.agentdev/graph/` の
  // 生成・鮮度管理の非実行（AC-010）、および REQ-012-043〜050 の対応宣言の完全性
  // （完了条件6）を検証する。

  const SCRIPT_DIR = import.meta.dir;
  const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
  const SKILL_SCRIPTS = join(
    REPO_ROOT,
    "src",
    "common",
    "skills",
    "agentdev-traceability",
    "scripts",
  );

  const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
  const RUN_ID = `trace-int-${crypto.randomUUID().slice(0, 8)}`;
  const ROOT = join(TEMP_BASE, RUN_ID);

  const MARKER = ["ADF", "-", "COVERS"].join("");

  // フィクスチャ用の宣言行生成。実リポジトリのコーパス走査での誤検出を避けるため
  // マーカーはパーツ結合経由で組み立てる。
  function decl(role: string, ids: string): string {
    return `<!-- ${MARKER}(${role}): ${ids} -->`;
  }

  // TypeScript 正規宣言位置（行頭 // コメント）用の宣言行生成。
  // 対象外判定により .ts 内の HTML コメント行は prose として無視されるため使い分ける。
  function tsDecl(role: string, ids: string): string {
    return `// ${MARKER}(${role}): ${ids}`;
  }

  function writeFixture(rel: string, lines: readonly string[]): void {
    const filePath = join(ROOT, rel);
    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
  }

  beforeAll(() => {
    mkdirSync(ROOT, { recursive: true });
  });
  afterAll(() => {
    rmSync(ROOT, { recursive: true, force: true });
  });

  describe("派生 Graph が存在しない状態での3能力の動作（AC-001、REQ-012-044）", () => {
    it("coverage、impact、check がすべて正規成果物の直接走査のみで成立する", () => {
      writeFixture("docs/requirements/REQ-910.md", [
        "| ID | 要件 |",
        "|---|---|",
        "| REQ-910-001 | 統合用 |",
      ]);
      writeFixture("docs/designs/int.md", [decl("design", "REQ-910-001")]);
      writeFixture("src/int.ts", [tsDecl("implementation", "REQ-910-001")]);
      writeFixture("tests/int.test.ts", [tsDecl("verification", "REQ-910-001")]);
      // フィクスチャルートに派生 Graph は存在しない
      expect(readdirSync(ROOT).includes(".agentdev")).toBe(false);

      const scan = scanCorpus(ROOT);
      expect(scan.declarations).toHaveLength(3);

      const coverage = coverageByRequirement(scan.declarations, "REQ-910-001");
      expect(coverage.counts).toEqual({
        decision: 0,
        design: 1,
        implementation: 1,
        verification: 1,
        total: 3,
      });

      const impact = impactByArtifact(scan.declarations, "src/int.ts");
      expect(impact.recheckCandidates.map((c) => c.file).sort()).toEqual([
        "docs/designs/int.md",
        "tests/int.test.ts",
      ]);

      const known = currentRequirementLineIds(ROOT);
      expect(known).toContain("REQ-910-001");
      const report = runChecks(scan, known, { completenessReqIds: ["REQ-910-001"] });
      // 12種検査（導出宣言の重複・矛盾検査追加に伴い 11 → 12。
      // フィクスチャに sidecar・policy はなく pass）
      expect(report.summary).toEqual({ pass: 12, fail: 0 });
    });
  });

  describe("4桁第1セグメント REQ の要件行収集（Issue #2594）", () => {
    it("4桁 REQ ファイル名と4桁要件行テーブル行を収集する（3桁ファイルも併存受理）", () => {
      writeFixture("docs/requirements/REQ-0037.md", [
        "| ID | 要件 |",
        "|---|---|",
        "| REQ-0037-001 | 4桁要件1 |",
        "| REQ-0037-002 | 4桁要件2 |",
      ]);
      writeFixture("docs/requirements/REQ-911.md", [
        "| ID | 要件 |",
        "|---|---|",
        "| REQ-911-001 | 3桁要件 |",
      ]);
      const known = currentRequirementLineIds(ROOT);
      expect(known).toContain("REQ-0037-001");
      expect(known).toContain("REQ-0037-002");
      expect(known).toContain("REQ-911-001");
      expect(known).toContain("REQ-910-001");
    });
  });

  describe("旧公開API・旧 Graph 生成物への非依存（AC-009、AC-010、REQ-012-049）", () => {
    it("旧 artifact-graph 実装を import していない", () => {
      let files: string[] = [];
      const walk = (dir: string) => {
        for (const name of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, name.name);
          if (name.isDirectory()) {
            if (name.name === "node_modules") continue;
            walk(full);
          } else if (name.name.endsWith(".ts")) files.push(full);
        }
      };
      walk(SKILL_SCRIPTS);
      expect(files.length).toBeGreaterThan(0);
      for (const file of files) {
        // 検査対象は import 文のみ（コメント・文字列内の言及は対象外）
        const importLines = readFileSync(file, "utf-8")
          .split("\n")
          .filter((line) => line.trim().startsWith("import "));
        expect(importLines.join("\n")).not.toContain("artifact-graph");
      }
    });

    it("旧 Graph 生成物を配置しても走査対象に含めない（.agentdev 除外）", () => {
      writeFixture(".agentdev/graph/nodes.jsonl", ["{}"]);
      writeFixture("visible.md", [decl("implementation", "REQ-910-001")]);
      const scan = scanCorpus(ROOT);
      expect(scan.declarations.every((d) => !d.file.startsWith(".agentdev/"))).toBe(true);
      expect(scan.declarations.some((d) => d.file === "visible.md")).toBe(true);
      expect(DEFAULT_EXCLUDE_DIRS).toContain(".agentdev");
      expect(DEFAULT_EXCLUDE_DIRS).toContain(".worktrees");
      expect(DEFAULT_EXCLUDE_DIRS).toContain("node_modules");
    });

    it("docs/reports 配下（履歴記録領域）を走査対象に含めない", () => {
      writeFixture("docs/reports/historic-audit.md", [
        decl("implementation", "REQ-910-001"),
        decl("implementation", "REQ-912-999"),
      ]);
      const scan = scanCorpus(ROOT);
      expect(scan.declarations.every((d) => !d.file.startsWith("docs/reports/"))).toBe(true);
      expect(DEFAULT_EXCLUDE_DIR_PATHS).toContain("docs/reports");
      // 除外は docs/reports パス単位（履歴記録領域の位置づけ）。docs 配下の他パスは走査対象のまま
      expect(scan.declarations.some((d) => d.file === "docs/designs/int.md")).toBe(true);
    });

    it("シンボリックリンク・ジャンクション配下を走査しない", () => {
      const outside = join(TEMP_BASE, `${RUN_ID}-outside`);
      mkdirSync(outside, { recursive: true });
      writeFileSync(join(outside, "linked.md"), decl("implementation", "REQ-910-001") + "\n", "utf-8");
      const linkPath = join(ROOT, "linkeddir");
      try {
        rmSync(linkPath, { recursive: true, force: true });
        symlinkSync(outside, linkPath, "dir");
        const scan = scanCorpus(ROOT);
        expect(scan.declarations.every((d) => !d.file.startsWith("linkeddir/"))).toBe(true);
      } finally {
        rmSync(linkPath, { recursive: true, force: true });
        rmSync(outside, { recursive: true, force: true });
      }
    });
  });

  describe("REQ-012-043〜050 の対応宣言の完全性（OU-002 完了条件6、実コーパス）", () => {
    const OU002_SCOPE: readonly string[] = Array.from(
      { length: 8 },
      (_, i) => `REQ-012-${String(43 + i).padStart(3, "0")}`,
    );

    // 宣言コーパスは tim_declarations_contract.test.ts と同一（docs + repo-integrity scripts）。
    // 配布物（src/common/skills/agentdev-traceability/）は concrete 要件行ID を持たないため
    // （配布依存境界、DEC-014）、実装対応は agentdev-traceability Design が、検証対応は
    // repo-local の traceability 統合試験が保持する。
    function corpusDeclarations() {
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const name of readdirSync(dir, { withFileTypes: true })) {
          if (name.name === "node_modules") continue;
          const full = join(dir, name.name);
          if (name.isDirectory()) walk(full);
          else if (name.name.endsWith(".md") || name.name.endsWith(".ts")) files.push(full);
        }
      };
      walk(join(REPO_ROOT, "docs"));
      walk(join(REPO_ROOT, ".opencode", "skills", "repo-agentdev-integrity", "scripts"));
      return files.flatMap((f) =>
        parseDeclarations(
          f.slice(REPO_ROOT.length + 1).replaceAll("\\", "/"),
          readFileSync(f, "utf-8"),
        ).declarations,
      );
    }

    it("各要件行へ実装対応が1件以上保存されている", () => {
      const declarations = corpusDeclarations();
      const lacking = OU002_SCOPE.filter(
        (reqId) =>
          !declarations.some((d) => d.role === "implementation" && d.reqIds.includes(reqId)),
      );
      expect(lacking).toEqual([]);
    });

    it("各要件行へ検証対応が1件以上保存されている", () => {
      const declarations = corpusDeclarations();
      const lacking = OU002_SCOPE.filter(
        (reqId) =>
          !declarations.some((d) => d.role === "verification" && d.reqIds.includes(reqId)),
      );
      expect(lacking).toEqual([]);
    });

    it("配布スキル配下に concrete 要件行ID が存在しない（宣言は非配布領域へ保存）", () => {
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const name of readdirSync(dir, { withFileTypes: true })) {
          if (name.name === "node_modules") continue;
          const full = join(dir, name.name);
          if (name.isDirectory()) walk(full);
          else files.push(full);
        }
      };
      walk(join(SKILL_SCRIPTS, "..")); // スキルルート全体（SKILL.md + scripts/）
      const concrete = /(?:REQ|DEC|ADR)-\d{1,}/;
      for (const file of files) {
        const hits = readFileSync(file, "utf-8")
          .split(/\r?\n/)
          .filter((line) => concrete.test(line));
        expect({ file, hits }).toEqual({ file, hits: [] });
      }
    });
  });
});

describe("ワークフロー統合の切替検証", () => {
  // トレーサビリティのワークフロー統合（OU-003、Issue #2361）の切替検証。
  // 対象 Design・Workflow Skill 本文・extension の旧 agentdev-artifact-graph 参照の残存なし、
  // 診断・レビュー系工程の agentdev-traceability 一般探索利用の禁止、
  // REQ-021-011〜022 の割り当て文言の存在を検証する。

  const REPO_ROOT = join(import.meta.dir, "..", "..", "..", "..", "..", "..");

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
    "docs/designs/commands/backlog-review.md",
    "docs/designs/skills/agentdev-doc-diagnostics.md",
    "docs/designs/skills/agentdev-adversarial-review.md",
    "src/common/skills/agentdev-workflow-req-define/SKILL.md",
    "src/common/skills/agentdev-workflow-case-open/SKILL.md",
    "src/common/skills/agentdev-workflow-case-run/SKILL.md",
    "src/common/skills/agentdev-workflow-case-close/SKILL.md",
    "src/common/skills/agentdev-workflow-inspect-docs/SKILL.md",
    "src/common/skills/agentdev-workflow-backlog-review/SKILL.md",
    "src/common/skills/agentdev-adversarial-review/SKILL.md",
    "src/common/skills/agentdev-case-run-execution-adapter/SKILL.md",
    ".agentdev/extensions/skills/agentdev-workflow-req-define.yaml",
    ".agentdev/extensions/skills/agentdev-workflow-case-open.yaml",
    ".agentdev/extensions/skills/agentdev-workflow-case-run.yaml",
    ".agentdev/extensions/skills/agentdev-workflow-case-close.yaml",
  ];

  /** REQ-021-021 の対象（診断・レビュー系5工程: Design と Workflow Skill 本文） */
  const DIAGNOSTIC_REVIEW_FILES: readonly string[] = [
    "docs/designs/commands/inspect-docs.md",
    "docs/designs/commands/backlog-review.md",
    "docs/designs/skills/agentdev-doc-diagnostics.md",
    "docs/designs/skills/agentdev-adversarial-review.md",
    "src/common/skills/agentdev-workflow-inspect-docs/SKILL.md",
    "src/common/skills/agentdev-workflow-backlog-review/SKILL.md",
    "src/common/skills/agentdev-adversarial-review/SKILL.md",
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
    // Wave-4（REQ-122-012）で Design が骨格＋references/ 構造へ分割されたため、
    // 検査対象を Design 本体＋同 references/ 配下の詳細ファイルへ拡張する（文言の意味保存）。
    function readWithReferences(rel: string): string {
      const main = read(rel);
      const refDir = join(REPO_ROOT, rel.replace(/\.md$/, ""), "references");
      let acc = main;
      if (existsSync(refDir)) {
        for (const f of readdirSync(refDir).sort()) {
          if (f.endsWith(".md")) {
            acc += "\n" + readFileSync(join(refDir, f), "utf-8");
          }
        }
      }
      return acc;
    }
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
      const content = readWithReferences(file);
      for (const phrase of phrases) {
        expect(content.includes(phrase)).toBe(true);
      }
    });
  });

  describe("Workflow Skill 本文・extension の切替", () => {
    it.each([
      "src/common/skills/agentdev-workflow-req-define/SKILL.md",
      "src/common/skills/agentdev-workflow-case-open/SKILL.md",
      "src/common/skills/agentdev-workflow-case-run/SKILL.md",
      "src/common/skills/agentdev-workflow-case-close/SKILL.md",
    ])("Workflow Skill がトレーサビリティ能力の利用節を持つ: %s", (rel) => {
      expect(read(rel).includes("## トレーサビリティ能力の利用")).toBe(true);
    });

    it.each([
      "src/common/skills/agentdev-workflow-inspect-docs/SKILL.md",
      "src/common/skills/agentdev-workflow-backlog-review/SKILL.md",
      "src/common/skills/agentdev-adversarial-review/SKILL.md",
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
    ])("traceability を利用しない工程の extension が traceability rule を持たない: %s", (rel) => {
      // 本テストの判定対象は traceability 委譲 rule の不在とする
      expect(read(rel).includes("skill: agentdev-traceability")).toBe(false);
    });
  });

  describe("case-ready トレーサビリティ完全性ゲート契約（REQ-061-023、CR-009、TS-009）", () => {
    const CASE_READY_SKILL = "src/common/skills/agentdev-workflow-case-ready/SKILL.md";
    const CASE_READY_GATE_REF =
      "src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md";
    const CASE_READY_DEF_REF =
      "src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md";

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
      const skill = read("src/common/skills/agentdev-workflow-case-open/SKILL.md");
      expect(skill.includes("設計根拠対応が未成立でも Root Case の確立を妨げない")).toBe(true);
      expect(skill.includes("設計根拠対応の成立判定（トレーサビリティ完全性ゲート）は case-ready が所有する")).toBe(true);
    });

    it("req-define 本文が対応作成除外と保存非阻害を記述する（REQ-021-012）", () => {
      const skill = read("src/common/skills/agentdev-workflow-req-define/SKILL.md");
      expect(skill.includes("Design 対応、実装対応、検証対応のいずれかを作成する責務を持たない")).toBe(true);
      expect(skill.includes("対応が存在しないことを理由に保存を失敗させない")).toBe(true);
    });

    it("req-define 本文が policy 登録記録と未登録非阻害を記述する（REQ-021-023）", () => {
      const skill = read("src/common/skills/agentdev-workflow-req-define/SKILL.md");
      expect(skill.includes("トレーサビリティポリシーへ明示登録されているかを保存結果に記録できる")).toBe(true);
      expect(skill.includes("未登録（検証対応必須扱い）であることを理由として保存を失敗させない")).toBe(true);
    });
  });

  describe("case-close QG-4 の3完全性再検査（REQ-021-018、REQ-021-025、REQ-021-027、TS-011）", () => {
    const CASE_CLOSE_SKILL = "src/common/skills/agentdev-workflow-case-close/SKILL.md";

    it("QG-4 が Design・implementation・required 行 verification の3完全性を独立再検査する", () => {
      const skill = read(CASE_CLOSE_SKILL);
      expect(
        skill.includes(
          "Design 対応、implementation 対応、verification 対応（policy が required と判定する要件行）の完全性",
        ),
      ).toBe(true);
      expect(skill.includes("inline declaration と top-level `traceability/` 配下の sidecar を同一に扱う")).toBe(true);
    });

    it("check 実行不能時に対応完全性を合格扱いしない（fail-closed。検査不能と代替検証の統合文）", () => {
      const skill = read(CASE_CLOSE_SKILL);
      expect(skill.includes("の場合は合格として扱わず、検査不能の旨を報告して完了判定とマージへ進まない")).toBe(true);
    });

    it("worktree root と main 側 root の再実行と policy 登録 commit の時系列確認を記述する（REQ-021-027）", () => {
      const skill = read(CASE_CLOSE_SKILL);
      expect(skill.includes("main 側 root で check を再実行")).toBe(true);
      expect(skill.includes("トレーサビリティポリシー登録 commit の時系列")).toBe(true);
      expect(skill.includes("durable state 上で解消済みの対象行を本変更起因の失敗と誤判定しない")).toBe(true);
    });
  });

  describe("case-run cleanup 判定の producer 側パス認定（REQ-021-015、RA-009）", () => {
    it("単一 Issue 実行の cleanup 判定が producer 側パス認定と表現形式非区別を記述する", () => {
      const content = read("src/common/skills/agentdev-workflow-case-run/references/single.md");
      expect(content.includes("implementation 役割かつ producer 側パス")).toBe(true);
      expect(content.includes("対応関係の表現形式を区別せず")).toBe(true);
      expect(content.includes("docs/ パスフィルタ")).toBe(false);
    });

    it("case-run SKILL.md が対応宣言の作成先を配布境界で決定することを記述する", () => {
      const skill = read("src/common/skills/agentdev-workflow-case-run/SKILL.md");
      expect(skill.includes("consumer distribution closure")).toBe(true);
      expect(skill.includes("component / package 単位 sidecar")).toBe(true);
      expect(skill.includes("inline `ADF-COVERS` 宣言または sidecar")).toBe(true);
    });
  });

  describe("case-run PR 前 check 契約の9検出項目（REQ-021-016、RA-009）", () => {
    it("adapter 本文が9検出項目を列挙し Decision 欠落を非計上とする", () => {
      const content = read("src/common/skills/agentdev-case-run-execution-adapter/SKILL.md");
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
      "src/common/skills/agentdev-workflow-case-run",
      "src/common/skills/agentdev-workflow-case-close",
      "src/common/skills/agentdev-workflow-case-ready",
      "src/common/skills/agentdev-workflow-case-open",
      "src/common/skills/agentdev-workflow-req-define",
      "src/common/skills/agentdev-case-run-execution-adapter",
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
});
