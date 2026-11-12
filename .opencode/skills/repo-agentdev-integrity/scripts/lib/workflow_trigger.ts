// Workflow Skill 構造検査の正本共有モジュール（B3-5b、Issue #4034）。
//
// docs/designs/integrity/validator-split-criteria.md「validator の責務境界」節の
// 契約（Workflow Skill 構造検査〔「単独起動」禁止等〕の正本を1箇所に寄せる）に従い、
// check_workflow_preventive.ts（check 3: workflow-soft-guard）と lint_skills.ts
// （AG-005: workflow trigger item）が独立保持していた同一検査の実装資産
// （検出語定数・command-bound 対象集合導出・frontmatter description 抽出）を
// 本モジュールへ集約する。両 checker は本モジュール経由で同一の不変式を検査する。
//
// ===== 統合名簿（削除対象 / 意図的に残す検査の区別と根拠、AG-008）=====
//
// 【削除 = 正本集約】（統合後に二重保守がなくなった対象）
//
// 1. WORKFLOW_TRIGGER_ITEM 定数の二重保持（旧 check_workflow_preventive.ts と
//    lint_skills.ts の同名定数）→ 本モジュールの WORKFLOW_TRIGGER_ITEM に集約。
//    根拠: AG-004 検出語の単一所属。二重保持は検出語変更時に片側だけ更新される
//    drift リスクを生む（旧 check_workflow_preventive.ts 側コメントが同一形維持を
//    自認していた）。
// 2. command-bound Workflow Skill 対象集合導出（旧 lint_skills.ts
//    listCommandBoundWorkflowSkills と check_workflow_preventive.ts 本文中の
//    agentdev-workflow-{X} インライン導出）→ commandBoundWorkflowSkillName /
//    listCommandBoundWorkflowSkills に集約。
//    根拠: 「src/common/commands/agentdev/{X}.md 存在（README.md 除外）」という
//    AG-004 対象導出規則の単一所属。deriveSkillClassification（内部 lifecycle
//    command〔case-*〕を含む分類）とは別物であり、統合しない。簡潔トリガー項の
//    肯定検査対象は公開 command 結びの Workflow Skill に限定される。
// 3. frontmatter description 抽出（旧 check_workflow_preventive.ts
//    extractFrontMatterDescription と lint_skills.ts parseFrontMatter の
//    description 部分）→ parseSkillFrontMatterFields に集約。
//    根拠: 「same single-line semantics as lint_skills.ts parseFrontMatter」という
//    informal mirror を解消し、抽出意味論（単一行・初出優先）を1箇所で定義する。
// 4. lint_skills.ts モジュール読込時 main() 実行の事情: lint_skills.ts の main()
//    は既に import.meta.main ガード済みで、モジュール import は安全である。
//    旧 check_workflow_preventive.ts コメント（「runs main() at module top
//    level and cannot be imported here」）は陳腐化しており、本統合で当該
//    コメントと二重定数を撤去した。正本を checker 間 import ではなく共有 lib
//    へ置く理由は、checker → checker の直接依存（cli_utils 等の移植域取り込み）
//    を避け、依存方向を両 checker → 共有 lib の木構造に保つためである。
//
// 【意図的に残す検査】（判定段階が異なるため統合せず両 checker に残す）
//
// A. check_workflow_preventive.ts check 3（workflow-soft-guard）:
//    AG-008 予防検査 7 項目の command 単位構造段階。strict 判定で同 checker の
//    exit code を直接駆動し、baseline 適用を持たない。段階統合すると AG-008 の
//    検査網羅と exit code 契約が変わるため残す。
// B. lint_skills.ts AG-005「workflow trigger item」:
//    skill 記述基準 linter 段階。lint-skills-baseline.json による delta-aware
//    grandfathering（baseline-known の info 降格）を伴う別の判定段階であり、
//    段階統合は baseline 契約の変更を意味するため残す。
//
// 両段階は同一の不変式（検出語・対象集合・description 抽出）を本モジュール経由で
// 検査し、差分は検査段階（実行タイミング・severity モデル・baseline 適用）のみである。
// 大規模検査器（check_integrity）は本不変式を所有しない（専用検査器の責務）。
//
// 名簿と実態の一致は lib/workflow_trigger.test.ts が機械検証する。

import * as fs from "fs";
import * as path from "path";

/**
 * AG-004 簡潔トリガー項の検出語（command-bound Workflow Skill の frontmatter
 * description が DO NOT USE FOR で宣言すべき項の検出語）。
 */
export const WORKFLOW_TRIGGER_ITEM = "単独起動";

/**
 * AG-004 が定める簡潔トリガー項の Design 権威形（検査不合格メッセージが引用する
 * 完全形）。両 checker のメッセージは本定数を引用し、形の二重保持を防ぐ。
 */
export const WORKFLOW_TRIGGER_ITEM_FULL_FORM =
  "単独起動（対応する /agentdev/* コマンド経由で利用すること）";

/**
 * command {X} に結び付く Workflow Skill 名（agentdev-workflow-{X}）。
 * 公開 command 対象集合導出と Workflow Skill 名導出の正本。
 */
export function commandBoundWorkflowSkillName(commandBase: string): string {
  return `agentdev-workflow-${commandBase}`;
}

/**
 * command-bound Workflow Skill 対象集合（AG-004 簡潔トリガー項の肯定検査対象）。
 *
 * Workflow Skill = agentdev-workflow-{X} where src/common/commands/agentdev/{X}.md
 * exists（README.md 除外）。deriveSkillClassification とは別の集合であり、
 * 内部 lifecycle command（case-*）を含まない（AG-004 対象は公開 command 結びのみ）。
 */
export function listCommandBoundWorkflowSkills(repoRoot: string): Set<string> {
  const bound = new Set<string>();
  const cmdDir = path.join(repoRoot, "src", "common", "commands", "agentdev");
  if (!fs.existsSync(cmdDir)) return bound;
  for (const f of fs.readdirSync(cmdDir)) {
    if (!f.endsWith(".md") || f === "README.md") continue;
    bound.add(commandBoundWorkflowSkillName(f.replace(/\.md$/, "")));
  }
  return bound;
}

/**
 * SKILL.md frontmatter の field 単一行抽出（両 checker 共通の抽出意味論）。
 *
 * - frontmatter 区切り（---）が揃わない場合は null
 * - 各行は最初の ":" で key / value に分割し、両辺を trim する（単一行記述前提。
 *   配布 SKILL.md の description は単一行のうち）
 * - 同一 key の重複行は初出を優先する（正本意味論）
 */
export function parseSkillFrontMatterFields(
  content: string,
): Record<string, string> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const fields: Record<string, string> = {};
  for (const line of (parts[1] ?? "").split(/\r?\n/)) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    if (key in fields) continue;
    fields[key] = line.slice(colonIndex + 1).trim();
  }
  return fields;
}
