// rules/ir-044.ts — REQ/Design 境界違反検出。
// ルール詳細: docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

const SIGNAL_PATTERNS: ReadonlyArray<{ signal: string; pattern: RegExp }> = [
  {
    signal: "schema field",
    pattern:
      /schema\s*field|スキーマ\s*フィールド|frontmatter\s*フィールド\s*の\s*型|フィールド\s*の\s*型\s*は\s*["'`]|必須\s*フィールド\s*.*型\s*[=:]/i,
  },
  {
    signal: "enum value list",
    pattern:
      /\benum\s*(値|リスト|一覧)?|列挙値\s*(一覧|リスト)?|列挙\s*(一覧|リスト)|値\s*一覧\s*[:：]/i,
  },
  { signal: "fixture detail", pattern: /\bfixtures?\b|フィクスチャ|テスト\s*データ\s*詳細/i },
  {
    signal: "checker individual rule",
    pattern:
      /checker\s*(個別\s*)?ルール|検出\s*(ルール|パターン)\s*[:：]|detection\s*pattern\s*[:：]/i,
  },
  {
    signal: "false positive suppression",
    pattern:
      /false\s*positive\s*(抑制|除外)|偽陽性\s*(抑制|除外)|\bFP\s*抑制|除外\s*(パス|ルール)\s*[:：]|\bexempt\s*(path|file)/i,
  },
  {
    signal: "Step number",
    pattern: /\bStep\s*\d+(?:\s*[-–]\s*\d+)?\b|ステップ\s*\d+(?:\s*[-–]\s*\d+)?|手順\s*\d+(?:\s*[-–]\s*\d+)?/,
  },
  { signal: "Phase number", pattern: /\bPhase\s*\d+\b|フェーズ\s*\d+/ },
  { signal: "internal algorithm", pattern: /内部\s*アルゴリズム|internal\s*algorithm|実装\s*の\s*アルゴリズム/i },
  {
    signal: "work history",
    pattern:
      /作業履歴\s*[:：]|PR\s*#\d+|commit\s+[0-9a-f]{7,40}|\bINC-\d{4,}\b|Issue\s*#\d+\s*で\s*(実装|追加|修正)/i,
  },
];

function stripInlineCode(text: string): string {
  return text.replace(/`[^`]+`/g, "");
}

function hasCountOrContentRule(line: string): boolean {
  return /\d+\s*(件|個|本|つ|種類|項目|以上|以下)|最大\s*\d+|最小\s*\d+/.test(line);
}

function isBehaviorPredicateContext(line: string): boolean {
  if (hasCountOrContentRule(line)) return false;
  return /が\s*存在\s*すること|を\s*禁止\s*する|を\s*許可\s*しない/.test(line);
}

function isMetaRuleLine(line: string): boolean {
  if (hasCountOrContentRule(line)) return false;
  if (/切り出し|切り出す|配置する\s*(対象|こと)|混入\s*させ(ない|ぬ)/.test(line)) return true;
  if (/REQ\s*は.*Design\s*は/.test(line)) return true;
  if (/文書種別|境界\s*を\s*(定義|規定)|exemption\s*対象/.test(line)) return true;
  if (/委譲/.test(line) && /Design|catalog|カタログ|reference|リファレンス/.test(line)) return true;
  return false;
}

const REQUIREMENT_ROW_RE = /^\|\s*(REQ-\d+-\d+)\s*\|\s*([\s\S]*?)\s*\|\s*$/;

export const ir044: IntegrityRule = {
  id: "IR-044",
  slug: "req-spec-boundary-violation-detection",
  title: "REQ/Design 境界違反検出",
  description:
    "現行 REQ の要件行に混入した Design 詳細（9 種シグナル）を純パターンマッチで検出する（heuristic）。",
  relatedReqs: ["REQ-001-002", "REQ-001-003", "REQ-001-067", "REQ-001-068", "REQ-010-002", "REQ-010-012", "REQ-001-049"],
  targetGlobs: ["docs/requirements/*.md"],
  globalScan: false,
  severity: "heuristic",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const file of ctx.getFilesByGlob("docs/requirements/REQ-*.md")) {
      const fileName = (file.path.split("/").pop() ?? "").replace(/\.md$/, "");
      if (fileName === "README") continue;
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i] ?? "";
        const rowMatch = line.match(REQUIREMENT_ROW_RE);
        if (!rowMatch) continue;
        const description = rowMatch[2]!;
        if (/^-+$/.test(description) || /^要\s*件$/.test(description.trim())) continue;
        const stripped = stripInlineCode(description);
        for (const { signal, pattern } of SIGNAL_PATTERNS) {
          if (!pattern.test(stripped)) continue;
          if (isBehaviorPredicateContext(stripped)) break;
          if (isMetaRuleLine(stripped)) break;
          violations.push({
            ruleId: "IR-044",
            severity: "warning",
            filePath: file.path,
            line: i + 1,
            message: `REQ requirement line may contain Design detail ("${signal}") — consider moving to Design/rule catalog/command reference (IR-044, v2:REQ-0108-259)`,
            remediationHint:
              "REQ should describe external contract / state / behavior; Design detail belongs in Design docs",
          });
          break;
        }
      }
    }
    return violations;
  },
};
