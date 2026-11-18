// rules/ir-053.ts — gh 直接記述検出。
// ルール詳細: docs/designs/integrity/rules/IR-053-gh-direct-invocation-detection.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { collectCommandScopeFiles } from "./reference-path-core.ts";

const GH_DIRECT_PATTERN = /\bgh\s+(issue|pr)\s+(create|edit|view|comment|merge|close|list|status)\b/i;

const NEGATED_USE_PATTERN = /(?:しません|しない|せず)/;

function isInsideCodeBlock(lines: string[], lineIndex: number): boolean {
  let count = 0;
  for (let i = 0; i < lineIndex; i++) {
    if ((lines[i] ?? "").trimStart().startsWith("```")) count++;
  }
  return count % 2 === 1;
}

function isNegatedUseMention(line: string, matchEndIndex: number): boolean {
  const rest = line.slice(matchEndIndex);
  const delimiter = rest.search(/[。！？!?]/);
  const sentenceRest = delimiter === -1 ? rest : rest.slice(0, delimiter);
  return NEGATED_USE_PATTERN.test(sentenceRest);
}

const EXEMPT_PATH_PATTERNS: RegExp[] = [
  /^(?:src\/common|\.opencode)\/skills\/agentdev-issue-management\/references\/issue-operation-safety\.md$/,
  /^(?:src\/common|\.opencode)\/skills\/agentdev-workflow-case-open\/references\/definition-pr-and-idempotency\.md$/,
];

export const ir053: IntegrityRule = {
  id: "IR-053",
  slug: "gh-direct-invocation-detection",
  title: "gh 直接記述検出",
  description:
    "配布 command / skill 定義へ埋め込まれた gh CLI 直接呼出記述を検出する（Custom Tool 境界。code block 免除・否定文脈免除付き）。",
  relatedReqs: ["REQ-011"],
  targetGlobs: ["src/common/commands/agentdev/*.md", "src/common/skills/**/*.md"],
  globalScan: false,
  severity: "heuristic",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const seen = new Set<string>();
    const targets: string[] = [];
    for (const file of collectCommandScopeFiles(ctx)) {
      seen.add(file.path);
      targets.push(file.path);
    }
    for (const file of ctx.getFilesByGlob("src/common/skills/agentdev-*/**/*.md")) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      targets.push(file.path);
    }

    for (const targetPath of targets) {
      if (EXEMPT_PATH_PATTERNS.some((re) => re.test(targetPath))) continue;
      const file = ctx.readFile(targetPath);
      if (file === null) continue;
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i] ?? "";
        if (isInsideCodeBlock(file.lines, i)) continue;
        const match = line.match(GH_DIRECT_PATTERN);
        if (!match) continue;
        if (isNegatedUseMention(line, (match.index ?? 0) + match[0].length)) continue;
        violations.push({
          ruleId: "IR-053",
          severity: "warning",
          filePath: targetPath,
          line: i + 1,
          message: `Direct gh CLI invocation 'gh ${match[1]} ${match[2]}' detected — route via the agentdev_gh Custom Tool (IR-053, v2:REQ-0152-001)`,
          remediationHint: "delegate GitHub I/O through the agentdev_gh Custom Tool operations (REQ-011-001)",
        });
      }
    }
    return violations;
  },
};
