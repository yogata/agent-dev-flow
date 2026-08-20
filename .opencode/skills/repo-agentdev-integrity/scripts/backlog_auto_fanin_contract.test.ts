/**
 * Contract tests for the backlog-auto fan-in result-state mapping table.
 *
 * Issue #2224 (OU-0006, Epic #2223 EU-E Wave 1):
 * - ACT-SPEC-004 promoted the per-system result-state mapping table
 *   (learning-promote inbox.md-absent error report -> "no target"
 *   termination) into the Design body. These tests pin that promotion.
 * - CR-012 keeps the serialization-queue execution unit (child workflow
 *   persistence point = commit unit) in references; the Design body must not
 *   redefine it.
 * - REQ-041-013: "no target" terminations are treated as normal completion,
 *   not as batch failures.
 */
import { describe, expect, it } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    if (fs.existsSync(path.join(dir, "src", "opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);

function resolveSkillFile(...segments: string[]): string {
  const projection = path.join(REPO_ROOT, ".opencode", "skills", ...segments);
  if (fs.existsSync(projection)) return projection;
  return path.join(REPO_ROOT, "src", "opencode", "skills", ...segments);
}

const SPEC_PATH = path.join(
  REPO_ROOT,
  "docs", "designs",
  "skills",
  "agentdev-workflow-backlog-auto.md",
);
const STAGE_EXECUTION_PATH = resolveSkillFile(
  "agentdev-workflow-backlog-auto",
  "references",
  "stage-execution.md",
);
const FAN_IN_REPORTING_PATH = resolveSkillFile(
  "agentdev-workflow-backlog-auto",
  "references",
  "fan-in-and-reporting.md",
);
const LEARNING_PROMOTE_SKILL_PATH = resolveSkillFile(
  "agentdev-workflow-learning-promote",
  "SKILL.md",
);
const LEARNING_PROMOTE_ANALYSIS_PATH = resolveSkillFile(
  "agentdev-workflow-learning-promote",
  "references",
  "analysis-and-review.md",
);

function read(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

function extractSection(content: string, headingLine: string): string {
  const lines = content.split("\n");
  const start = lines.findIndex((line) => line.trim() === headingLine);
  if (start === -1) return "";
  const level = headingLine.match(/^#+/)?.[0].length ?? 2;
  const sectionLines: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const heading = lines[i].match(/^(#{2,6})\s/);
    if (heading && heading[1].length <= level) break;
    sectionLines.push(lines[i]);
  }
  return sectionLines.join("\n");
}

function headings(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => /^#{1,6}\s/.test(line))
    .map((line) => line.trim());
}

describe("backlog-auto fan-in 読み替え表契約（Issue #2224、REQ-041-013、CR-012）", () => {
  const spec = read(SPEC_PATH);
  const fanInSection = extractSection(spec, "### fan-in 判定");

  describe("Design 本文: fan-in 判定節の読み替え表（ACT-SPEC-004 昇格分）", () => {
    it("fan-in 判定節に読み替え表が Design 本文契約として存在する", () => {
      expect(fanInSection).not.toBe("");
      expect(fanInSection).toContain(
        "系統別の結果状態は次の読み替え表に従って fan-in 判定へ入力する（Design 本文の契約として正規所有する）。",
      );
      expect(fanInSection).toContain(
        "| 子コマンドの報告状態 | fan-in 判定上の取扱い |",
      );
    });

    it("learning-promote の inbox.md 不在時エラー報告を対象なし終了へ読み替える行が存在する", () => {
      expect(fanInSection).toContain(
        "| learning-promote の inbox.md 不在時の子コマンドエラー報告 | 対象なし終了へ読み替える（障害扱いしない） |",
      );
    });

    it("読み替え表は blocked / failed / 未完了を障害として維持する", () => {
      expect(fanInSection).toContain(
        "| blocked（user-decision-required 含む） | blocked |",
      );
      expect(fanInSection).toContain(
        "| failed（実行失敗、external failure） | failed |",
      );
      expect(fanInSection).toContain("| 未完了（タイムアウト、中断） | 未完了 |");
    });
  });

  describe("Design 本文: 直列化キュー実行単位の reference 参照維持（CR-012）", () => {
    it("直列化キューの実行単位を各子 Workflow Skill の reference 詳細へ委譲し、本 Design では再定義しない", () => {
      expect(fanInSection).toContain(
        "直列化キューの実行単位（子ワークフロー定義の永続化ポイント = commit 単位）は各子 Workflow Skill の reference 詳細に従い、本 Design では再定義しない。",
      );
    });

    it("Design 本文に直列化キュー詳細セクションを持たない（実行単位の Design 本文昇格なし）", () => {
      const queueHeadings = headings(spec).filter(
        (heading) => /^#{1,6}\s+直列化キュー/.test(heading),
      );
      expect(queueHeadings).toEqual([]);
    });

    it("参照する references 節が直列化キュー詳細の reference 配置を明示する", () => {
      const referencesSection = extractSection(spec, "## 参照する references");
      expect(referencesSection).toContain("直列化キュー");
    });
  });

  describe("実装 reference との一致（backlog-auto workflow）", () => {
    it("stage-execution の系統別結果状態の読み替えが Design 記載と一致する（learning-promote inbox.md 不在 → 対象なし終了）", () => {
      const stageExecution = read(STAGE_EXECUTION_PATH);
      const mappingSection = extractSection(
        stageExecution,
        "## 系統別結果状態の読み替え",
      );
      expect(mappingSection).not.toBe("");
      expect(mappingSection).toContain("| learning-promote |");
      expect(mappingSection).toContain("不在時の子コマンドのエラー報告");
      expect(mappingSection).toContain("`agentdev-learning-capture` 案内");
      expect(mappingSection).toContain("対象なし終了として扱い");
      expect(mappingSection).toContain(
        "対象なし終了は正常終了として扱い、一括処理の失敗としない。",
      );
    });

    it("stage-execution の直列化キュー実行単位が子ワークフロー定義の永続化ポイント（commit 単位）へ従属する", () => {
      const stageExecution = read(STAGE_EXECUTION_PATH);
      const queueSection = extractSection(stageExecution, "## 直列化キュー");
      expect(queueSection).toContain(
        "実行単位は子ワークフローが定義する永続化ポイント（commit 単位）とする",
      );
    });

    it("fan-in-and-reporting の STEP-4 判定表が対象なし終了を開始可として扱う", () => {
      const fanInReporting = read(FAN_IN_REPORTING_PATH);
      expect(fanInReporting).toContain(
        "| 3系統すべてが正常完了または対象なし終了 | 開始可 | STEP-5 |",
      );
    });
  });

  describe("読み替え入力の実在（learning-promote 子コマンドの inbox.md 不在時挙動）", () => {
    it("learning-promote SKILL.md が inbox.md 不在時のエラー終了を定義する", () => {
      const skill = read(LEARNING_PROMOTE_SKILL_PATH);
      expect(skill).toContain(
        "**inbox.md 空または不在**: STEP-1 で終了（不在時はエラー終了）",
      );
    });

    it("learning-promote の analysis reference が agentdev-learning-capture 案内つきエラー報告を定義する", () => {
      const analysis = read(LEARNING_PROMOTE_ANALYSIS_PATH);
      expect(analysis).toContain("不存在時はエラー終了");
      expect(analysis).toContain("`agentdev-learning-capture`");
    });
  });
});
