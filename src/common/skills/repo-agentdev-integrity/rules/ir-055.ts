// rules/ir-055.ts — runtime-unresolved-reference。
// ルール詳細: docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { collectCommandScopeFiles } from "./reference-path-core.ts";

const STRICT_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: "REQ-NNNN-NNN", pattern: /\bREQ-\d+-\d+(?!\d)\b/g },
  { name: "REQ-NNNN", pattern: /\bREQ-\d+(?!-\d)(?!\d)\b/g },
  { name: "DEC-NNN", pattern: /\bDEC-\d{3}\b/g },
  { name: "ADR-NNNN", pattern: /\bADR-\d{3,4}\b/g },
  { name: "obsolete src/opencode/{commands,skills,tools}/", pattern: /\bsrc\/opencode\/(?:commands|skills|tools)\//g },
  { name: "/repo/", pattern: /\/repo\//g },
  { name: "repo-*", pattern: /\brepo-[a-z][a-z0-9-]*/g },
];

const HEURISTIC_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: "docs/designs/", pattern: /\bdocs\/designs\//g },
  { name: "docs/guides/", pattern: /\bdocs\/guides\//g },
  {
    name: "main-repo GitHub URL",
    pattern: /\bhttps?:\/\/github\.com\/yogata\/agent-dev-flow\/(blob|tree|issues|pull)\//g,
  },
  { name: "line-number ref", pattern: /\b[\w.-]+\.md#L\d+\b/g },
];

const EXEMPT_PATH_PATTERNS: RegExp[] = [
  /\/vocabulary-registry\.md$/,
  /\/integrity-rule-catalog\.md$/,
  /\/integrity-contracts\.md$/,
  /\/rules\/IR-055[-/]/,
];

const TOKEN_CHAR = /[\w`{}<>.\/#:,-]/;

function isInsideCodeBlock(lines: string[], lineIndex: number): boolean {
  let count = 0;
  for (let i = 0; i < lineIndex; i++) {
    if ((lines[i] ?? "").trimStart().startsWith("```")) count++;
  }
  return count % 2 === 1;
}

function isPlaceholderAdjacentMatch(line: string, matchIndex: number, matchLength: number): boolean {
  let start = matchIndex;
  let end = matchIndex + matchLength;
  while (start > 0 && TOKEN_CHAR.test(line[start - 1]!)) start--;
  while (end < line.length && TOKEN_CHAR.test(line[end]!)) end++;
  const token = line.slice(start, end);
  return /\{[^}]*\}/.test(token) || /<[^<>]+>/.test(token);
}

export const ir055: IntegrityRule = {
  id: "IR-055",
  slug: "runtime-unresolved-reference",
  title: "runtime-unresolved-reference（配布物内の導入先未解決参照検出）",
  description:
    "配布物内で consumer 環境で解決不能な参照（REQ/DEC ID・廃止パス・docs 内部パス・main リポジトリ URL 等）を検出する（strict/heuristic 併用）。",
  relatedReqs: ["REQ-029-003"],
  targetGlobs: ["src/common/commands/agentdev/*.md", "src/common/skills/**/*.md"],
  globalScan: false,
  severity: "strict",
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

    const scanList = [
      ...STRICT_PATTERNS.map((p) => ({ ...p, kind: "strict" as const })),
      ...HEURISTIC_PATTERNS.map((p) => ({ ...p, kind: "heuristic" as const })),
    ];

    for (const targetPath of targets) {
      if (EXEMPT_PATH_PATTERNS.some((re) => re.test(targetPath))) continue;
      const file = ctx.readFile(targetPath);
      if (file === null) continue;
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i] ?? "";
        if (isInsideCodeBlock(file.lines, i)) continue;
        for (const { name, pattern, kind } of scanList) {
          pattern.lastIndex = 0;
          let match: RegExpExecArray | null;
          while ((match = pattern.exec(line)) !== null) {
            if (name === "ADR-NNNN" && (match.index ?? 0) >= 3 && line.slice((match.index ?? 0) - 3, match.index) === "v2:") {
              continue;
            }
            if (isPlaceholderAdjacentMatch(line, match.index ?? 0, match[0].length)) continue;
            violations.push({
              ruleId: "IR-055",
              severity: kind === "strict" ? "error" : "warning",
              filePath: targetPath,
              line: i + 1,
              message: `${kind === "strict" ? "Strict" : "Heuristic"} violation: ${name} reference '${match[0]}' detected (IR-055)`,
              remediationHint:
                kind === "strict"
                  ? `distribution files must not contain ${name} references (unresolved in consumer env)`
                  : `distribution files should avoid ${name} references (likely unresolved in consumer env)`,
            });
          }
        }
      }
    }
    return violations;
  },
};
