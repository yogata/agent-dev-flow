// rules/ir-075.ts — ir-file-size（250 行上限・DEC-065 決定5）。
// ルール詳細: docs/designs/integrity/rules/IR-075-ir-file-size.md
// 判定: YAML Frontmatter を含む総行数 250 行超過が違反。バイト数のみの超過は違反としない。
// **/references/**/*.md は判定対象から除外する。違反メッセージには行数とバイト数の両方を出力する。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

const MAX_LINES = 250;
const RULE_ID = "IR-075";

export const IR075_TARGET_GLOBS = [
  "src/common/commands/agentdev/**/*.md",
  "src/common/skills/agentdev-*/SKILL.md",
  "src/common/skills/agentdev-*/references/*.md",
] as const;

/**
 * YAML Frontmatter を含む総行数。末尾の単一改行は行として数えない
 * （エディタ表示行数・`wc -l` と一致させる。末尾改行なしの最終行も 1 行として数える）。
 */
export function countFileLines(rawContent: string): number {
  let text = rawContent;
  if (text.endsWith("\n")) text = text.slice(0, -1);
  if (text === "") return 0;
  return text.split("\n").length;
}

// references/**/*.md 除外（DEC-065 決定5・AG-011 の exemption）。
export function isReferencesExempt(filePath: string): boolean {
  return /\/references\/[^/]*\.md$/.test(filePath);
}

function collectTargets(ctx: IntegrityContext): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const pattern of IR075_TARGET_GLOBS) {
    for (const file of ctx.getFilesByGlob(pattern)) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      out.push(file.path);
    }
  }
  return out.sort();
}

export const ir075: IntegrityRule = {
  id: RULE_ID,
  slug: "ir-file-size",
  title: "ir-file-size",
  description:
    "巨大コマンド・スキル文書によるコンテキスト圧迫と指示遵守率低下を防ぐ 250 行上限を機械検査する（YAML Frontmatter 込み総行数判定、references/ 除外、バイト数併記メッセージ）。",
  relatedReqs: ["REQ-122-011"],
  targetGlobs: [...IR075_TARGET_GLOBS],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const relPath of collectTargets(ctx)) {
      if (isReferencesExempt(relPath)) continue;
      const content = ctx.readRaw(relPath);
      if (content === null) continue;
      const lineCount = countFileLines(content);
      if (lineCount <= MAX_LINES) continue;
      const byteCount = Buffer.byteLength(content, "utf-8");
      violations.push({
        ruleId: RULE_ID,
        severity: "error",
        filePath: relPath,
        message: `file exceeds the ${MAX_LINES}-line limit (lines: ${lineCount}, bytes: ${byteCount})`,
        remediationHint:
          "split into a control-flow skeleton (target 150-200 lines) and references/ sub-documents",
      });
    }
    return violations;
  },
};
