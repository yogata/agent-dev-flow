// rules/ir-067.ts — referenced-req-row-existence。
// ルール詳細: docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

export const REQ_ROW_ID_RE = /(?<!v2:)(?<![\w-])REQ-(\d+)-(\d+)(?![\w-])/g;

/** docs/requirements（現行+retired）の REQ テーブル行から行 ID 集合を構築する。 */
export function buildReqRowIndex(ctx: IntegrityContext): Set<string> {
  const rows = new Set<string>();
  for (const file of ctx.getFilesByGlob("docs/requirements/**/*.md")) {
    const fileName = file.path.split("/").pop() ?? "";
    if (!fileName.startsWith("REQ-") || fileName === "README.md") continue;
    for (const line of file.lines) {
      if (!line.trim().startsWith("|")) continue;
      REQ_ROW_ID_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = REQ_ROW_ID_RE.exec(line)) !== null) {
        rows.add(m[0]);
      }
    }
  }
  return rows;
}

/** AUTOGEN ブロック内の行は機械生成領域。 */
export function buildAutogenLineMask(lines: string[]): boolean[] {
  const mask = new Array<boolean>(lines.length).fill(false);
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    if (/<!--\s*AUTOGEN:BEGIN/.test(lines[i] ?? "")) inBlock = true;
    mask[i] = inBlock;
    if (/<!--\s*AUTOGEN:END\s*-->/.test(lines[i] ?? "")) inBlock = false;
  }
  return mask;
}

function isInsideCodeBlock(lines: string[], lineIdx: number): boolean {
  let inCode = false;
  for (let i = 0; i < lineIdx && i < lines.length; i++) {
    const fenceCount = (lines[i]!.match(/^\s*```/g) ?? []).length;
    if (fenceCount % 2 === 1) inCode = !inCode;
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

/** 階層 REQ 行ID が旧4桁番号帯（v2 歴史帯）かを判定する。 */
export function isV2HistoricalReqRowId(id: string): boolean {
  const m = /^REQ-(\d+)-\d+$/.exec(id);
  if (!m) return false;
  return m[1]!.length === 4 && Number(m[1]) < 141;
}

const TARGET_GLOBS = [
  "docs/designs/**/*.md",
  "docs/requirements/*.md",
  "docs/decisions/*.md",
  "docs/guides/*.md",
  "src/common/**/*.md",
  "src/common/**/*.yaml",
  ".agentdev/extensions/**/*.md",
  ".agentdev/extensions/**/*.yaml",
] as const;

const EXCLUDES = [
  "docs/requirements/retired/",
  "docs/decisions/retired/",
  "docs/reports/",
  "src/common/commands/agentdev/templates/",
];

function isTemplatePath(relPath: string): boolean {
  return (
    relPath.startsWith("src/common/commands/agentdev/templates/") ||
    /^src\/common\/skills\/[^/]+\/templates\//.test(relPath) ||
    /(^|\/)_template\.md$/.test(relPath)
  );
}

function isIntegrityRuleDescriptionFile(relPath: string): boolean {
  return /docs\/designs\/integrity\/rules\/IR-\d+/.test(relPath);
}

export const ir067: IntegrityRule = {
  id: "IR-067",
  slug: "referenced-req-row-existence",
  title: "referenced-req-row-existence",
  description:
    "docs 本文が引用する階層 REQ 行 ID（REQ-NNN-NNN）の実在性を検査しファントム引用を検出する。",
  relatedReqs: ["REQ-010-069", "REQ-010-065", "REQ-010-068"],
  targetGlobs: [
    "docs/**/*.md",
    "src/common/**/*.md",
    "src/common/**/*.yaml",
    ".agentdev/extensions/**",
    "README.md",
  ],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const rowIndex = buildReqRowIndex(ctx);
    if (rowIndex.size === 0) {
      return violations;
    }

    const seen = new Set<string>();
    const targets: string[] = [];
    for (const glob of TARGET_GLOBS) {
      for (const file of ctx.getFilesByGlob(glob)) {
        if (seen.has(file.path)) continue;
        seen.add(file.path);
        targets.push(file.path);
      }
    }
    for (const single of ["README.md", "docs/README.md"]) {
      const file = ctx.readFile(single);
      if (file !== null && !seen.has(single)) {
        seen.add(single);
        targets.push(single);
      }
    }

    for (const targetPath of targets) {
      if (EXCLUDES.some((p) => targetPath.startsWith(p))) continue;
      if (isTemplatePath(targetPath)) continue;
      if (isIntegrityRuleDescriptionFile(targetPath)) continue;
      const file = ctx.readFile(targetPath);
      if (file === null) continue;
      const autogenMask = buildAutogenLineMask(file.lines);
      const reportedOnLine = new Set<string>();
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i] ?? "";
        if (isInsideCodeBlock(file.lines, i)) continue;
        if (autogenMask[i]) continue;
        REQ_ROW_ID_RE.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = REQ_ROW_ID_RE.exec(line)) !== null) {
          if (isInsideCodeSpan(line, m.index ?? 0)) continue;
          const id = m[0];
          if (isV2HistoricalReqRowId(id)) continue;
          const dedupeKey = `${i}:${id}`;
          if (reportedOnLine.has(dedupeKey)) continue;
          reportedOnLine.add(dedupeKey);
          if (rowIndex.has(id)) continue;
          const reqPartNumber = Number(m[1]);
          violations.push({
            ruleId: "IR-067",
            severity: "error",
            filePath: targetPath,
            line: i + 1,
            message: `Phantom REQ row citation '${id}' is referenced but no requirement row exists (REQ-010-069, IR-067)`,
            remediationHint: `${id} must exist as a requirement row in docs/requirements/REQ-${String(reqPartNumber).padStart(3, "0")}.md`,
          });
        }
      }
    }
    return violations;
  },
};
