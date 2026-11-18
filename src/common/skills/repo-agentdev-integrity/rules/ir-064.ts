// rules/ir-064.ts — unresolved-placeholder。
// ルール詳細: docs/designs/integrity/rules/IR-064-unresolved-placeholder.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { collectCommandScopeFiles } from "./reference-path-core.ts";

const TODO_MARKER_RE = /\b(TODO|FIXME|XXX|HACK)\b/g;
const ID_PLACEHOLDER_RE =
  /\b(?:REQ|DEC|ADR|AG|QG|IR|RU|TS|OU|AC|CR|EC|SC|ACT|DD|DESIGN|RD|SPEC|WS|GMT)-\{[^}]*\}/g;

function isTemplatePath(relPath: string): boolean {
  return (
    relPath.startsWith("src/common/commands/agentdev/templates/") ||
    /^src\/common\/skills\/[^/]+\/templates\//.test(relPath) ||
    /(^|\/)_template\.md$/.test(relPath)
  );
}

function isInsideParentheses(line: string, matchIndex: number): boolean {
  let depth = 0;
  for (let i = 0; i < matchIndex && i < line.length; i++) {
    const c = line[i];
    if (c === "(" || c === "（") depth++;
    else if (c === ")" || c === "）") depth = Math.max(0, depth - 1);
  }
  return depth > 0;
}

function isInsideQuoteBracket(line: string, matchIndex: number): boolean {
  let inQuote = false;
  for (let i = 0; i < matchIndex && i < line.length; i++) {
    if (line[i] === "「") inQuote = true;
    else if (line[i] === "」") inQuote = false;
  }
  return inQuote;
}

function isInCodeBlock(lines: string[], lineIdx: number): boolean {
  let inCode = false;
  for (let i = 0; i <= lineIdx && i < lines.length; i++) {
    const fenceCount = (lines[i]!.match(/^\s*```/g) ?? []).length;
    if (i < lineIdx && fenceCount % 2 === 1) inCode = !inCode;
    else if (i === lineIdx && fenceCount % 2 === 1 && lines[i]!.trimStart().startsWith("```")) inCode = inCode;
  }
  return inCode;
}

function isInsideCodeSpan(line: string, charIndex: number): boolean {
  let backtickCount = 0;
  for (let i = 0; i < charIndex && i < line.length; i++) {
    if (line[i] === "`") backtickCount++;
  }
  return backtickCount % 2 === 1;
}

export const ir064: IntegrityRule = {
  id: "IR-064",
  slug: "unresolved-placeholder",
  title: "unresolved-placeholder",
  description:
    "実行時配布対象に残る未解決 TODO 系マーカーと ID 系プレースホルダーの裸出力を検出する（template 領域・code span・括弧・引用は許容）。",
  relatedReqs: ["REQ-010-065", "REQ-010-068"],
  targetGlobs: ["src/common/commands/agentdev/**/*.md", "src/common/skills/**/*.md"],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const seen = new Set<string>();
    const targets: string[] = [];
    for (const file of collectCommandScopeFiles(ctx)) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      targets.push(file.path);
    }
    for (const file of ctx.getFilesByGlob("src/common/skills/agentdev-*/**/*.md")) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      targets.push(file.path);
    }

    for (const targetPath of targets) {
      const file = ctx.readFile(targetPath);
      if (file === null) continue;
      const isTemplate = isTemplatePath(targetPath);
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i] ?? "";
        if (isInCodeBlock(file.lines, i)) continue;

        TODO_MARKER_RE.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = TODO_MARKER_RE.exec(line)) !== null) {
          if (isInsideCodeSpan(line, m.index)) continue;
          if (isInsideQuoteBracket(line, m.index)) continue;
          if (isTemplate) continue;
          violations.push({
            ruleId: "IR-064",
            severity: "error",
            filePath: targetPath,
            line: i + 1,
            message: `Unresolved TODO-family marker '${m[1]}' remains in distribution target (REQ-010-065, IR-064)`,
            remediationHint: "resolve the marker or move the note to a non-distribution document",
          });
        }

        ID_PLACEHOLDER_RE.lastIndex = 0;
        let m2: RegExpExecArray | null;
        const reported = new Set<string>();
        while ((m2 = ID_PLACEHOLDER_RE.exec(line)) !== null) {
          if (isInsideCodeSpan(line, m2.index)) continue;
          if (isInsideParentheses(line, m2.index)) continue;
          if (isTemplate) continue;
          if (reported.has(m2[0])) continue;
          reported.add(m2[0]);
          violations.push({
            ruleId: "IR-064",
            severity: "warning",
            filePath: targetPath,
            line: i + 1,
            message: `ID placeholder '${m2[0]}' appears bare in body text (not in code span, parentheses, or template) (REQ-010-065, IR-064)`,
            remediationHint:
              "wrap the placeholder in backticks or parenthesized delegation-notation, or resolve it to a concrete value",
          });
        }
      }
    }
    return violations;
  },
};
