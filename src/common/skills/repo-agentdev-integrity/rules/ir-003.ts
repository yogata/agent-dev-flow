// rules/ir-003.ts — Active/廃止 REQ ID 重複。
// ルール詳細: docs/designs/integrity/rules/IR-003-active-retired-req-id-conflict.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

// retired REQ/ADR への言及は、歴史文脈（退役識別・changelog・関連情報節）であれば
// 許容される（REQ-010-012 相当の文脈規則）。本表現は行内退役語彙または歴史見出し配下を検出する。
const RETIREMENT_CONTEXT_RE =
  /retired|migrated|retired-no-successor|historical-only|historical|履歴|過去経緯|廃止|移行|移管|再配置|再編|統合|吸収|changelog|superseded|deprecated|後継|前身|predecessor|successor|旧REQ|旧ADR|は\s*retired|is\s*retired/i;
const HISTORICAL_HEADING_RE =
  /\b(retired|historical)\b|履歴|過去経緯|retired-no-successor|historical-only|Update\s+Notes|Changelog|変更履歴|関連情報|関連\s*ADR|Related|Migration|移行表|適用範囲/i;

function isHistoricalReferenceContext(lines: string[], lineIndex: number): boolean {
  if (RETIREMENT_CONTEXT_RE.test(lines[lineIndex] ?? "")) return true;
  let currentHeading = "";
  for (let i = 0; i <= lineIndex && i < lines.length; i++) {
    const m = lines[i]!.match(/^#{1,6}\s+(.+)$/);
    if (m) currentHeading = m[1]!;
  }
  return HISTORICAL_HEADING_RE.test(currentHeading);
}

/** IR-003 (c) 検査の対象ファイル集合: docs 正規成果物（retired・ADR・report を除く）。 */
const SCAN_GLOBS = [
  "docs/requirements/*.md",
  "docs/designs/**/*.md",
  "docs/guides/*.md",
  "docs/README.md",
  "README.md",
] as const;

function collectScanFiles(ctx: IntegrityContext): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const glob of SCAN_GLOBS) {
    for (const file of ctx.getFilesByGlob(glob)) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      out.push(file.path);
    }
  }
  return out;
}

export const ir003: IntegrityRule = {
  id: "IR-003",
  slug: "active-retired-req-id-conflict",
  title: "Active/廃止 REQ ID 重複",
  description:
    "現行 REQ と廃止 REQ の ID 重複、廃止 REQ の現行インデックス掲載、非 retired 文書での廃止 REQ 一次参照を検出する。",
  relatedReqs: ["REQ-010"],
  targetGlobs: ["docs/requirements/*.md", "docs/requirements/retired/*.md"],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const activeIds = new Set(
      ctx
        .getFilesByGlob("docs/requirements/REQ-*.md")
        .map((f) => (f.path.split("/").pop() ?? "").replace(/\.md$/, ""))
        .filter((name) => name !== "README.md"),
    );
    const retiredIds = new Set(
      ctx
        .getFilesByGlob("docs/requirements/retired/REQ-*.md")
        .map((f) => (f.path.split("/").pop() ?? "").replace(/\.md$/, "")),
    );

    for (const id of activeIds) {
      if (retiredIds.has(id)) {
        violations.push({
          ruleId: "IR-003",
          severity: "error",
          filePath: `docs/requirements/${id}.md`,
          message: `${id} exists in both active and retired directories`,
          remediationHint: "unique IDs across active and retired",
        });
      }
    }

    const readme = ctx.readFile("docs/requirements/README.md");
    if (readme !== null) {
      const indexedIds = extractActiveIndexIds(readme.rawContent);
      for (const id of indexedIds) {
        if (retiredIds.has(id) && !activeIds.has(id)) {
          violations.push({
            ruleId: "IR-003",
            severity: "error",
            filePath: "docs/requirements/README.md",
            message: `${id} is retired but still listed in active README index`,
            remediationHint: "retired IDs should not appear in active index",
          });
        }
      }
    }

    for (const filePath of collectScanFiles(ctx)) {
      if (filePath.startsWith("docs/requirements/retired/")) continue;
      if (filePath.startsWith("docs/adr/ADR-")) continue;
      const file = ctx.readFile(filePath);
      if (file === null) continue;
      const refs = new Set(
        [...file.rawContent.matchAll(/(?<![\w-])REQ-\d+(?![\w-])/g)].map((m) => m[0]!),
      );
      for (const ref of refs) {
        if (retiredIds.has(ref) && !activeIds.has(ref)) {
          const appearsOutsideHistorical = file.lines.some(
            (line, idx) => line.includes(ref) && !isHistoricalReferenceContext(file.lines, idx),
          );
          if (!appearsOutsideHistorical) continue;
          violations.push({
            ruleId: "IR-003",
            severity: "warning",
            filePath,
            message: `${ref} is retired but referenced in ${filePath}`,
            remediationHint: "retired REQs should not be primary references",
          });
        }
      }
    }
    return violations;
  },
};

function extractActiveIndexIds(content: string): Set<string> {
  const ids = new Set<string>();
  let underRetiredHeading = false;
  for (const line of content.split("\n")) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      underRetiredHeading =
        /\b(retired|historical)\b|履歴|過去経緯|廃止済み|廃止|retired-no-successor|historical-only/i.test(
          headingMatch[1]!,
        );
      continue;
    }
    if (underRetiredHeading) continue;
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const plainMatch = trimmed.match(/\|\s*(REQ-\d+)\s*\|/);
    if (plainMatch) {
      ids.add(plainMatch[1]!);
      continue;
    }
    for (const m of trimmed.matchAll(/\[(REQ-\d+)\]\([^)]+\)/g)) {
      ids.add(m[1]!);
    }
  }
  return ids;
}
