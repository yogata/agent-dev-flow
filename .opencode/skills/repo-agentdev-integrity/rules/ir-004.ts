// rules/ir-004.ts — REQ index ↔ 現行 REQ 一致。
// ルール詳細: docs/designs/integrity/rules/IR-004-req-index-actual-consistency.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

/** README 表から現行 REQ ID 集合を抽出する。 */
export function extractReadmeTableReqIds(content: string): Set<string> {
  const ids = new Set<string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const plainMatch = trimmed.match(/\|\s*(REQ-\d+)\s*\|/);
    if (plainMatch) {
      ids.add(plainMatch[1]!);
      continue;
    }
    const linkMatches = trimmed.matchAll(/\[(REQ-\d+)\]\([^)]+\)/g);
    for (const m of linkMatches) {
      ids.add(m[1]!);
    }
  }
  return ids;
}

export const ir004: IntegrityRule = {
  id: "IR-004",
  slug: "req-index-actual-consistency",
  title: "REQ index ↔ 現行 REQ 一致",
  description: "docs/requirements/README.md の現行 REQ インデックスが実ファイル集合と一致する。",
  relatedReqs: ["REQ-010-003"],
  targetGlobs: ["docs/requirements/*.md"],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const reqFiles = ctx
      .getFilesByGlob("docs/requirements/REQ-*.md")
      .map((f) => f.path.split("/").pop() ?? "")
      .filter((name) => name !== "README.md");
    const reqIds = new Set(reqFiles.map((name) => name.replace(/\.md$/, "")));

    const readme = ctx.readFile("docs/requirements/README.md");
    if (readme === null) {
      violations.push({
        ruleId: "IR-004",
        severity: "error",
        filePath: "docs/requirements/README.md",
        message: "README.md not found in docs/requirements",
      });
      return violations;
    }

    const indexedIds = extractReadmeTableReqIds(readme.rawContent);
    for (const id of reqIds) {
      if (!indexedIds.has(id)) {
        violations.push({
          ruleId: "IR-004",
          severity: "error",
          filePath: "docs/requirements/README.md",
          message: `${id} exists as file but missing from README index`,
        });
      }
    }
    for (const id of indexedIds) {
      if (!reqIds.has(id)) {
        violations.push({
          ruleId: "IR-004",
          severity: "error",
          filePath: "docs/requirements/README.md",
          message: `${id} listed in README index but no corresponding file`,
        });
      }
    }
    return violations;
  },
};
