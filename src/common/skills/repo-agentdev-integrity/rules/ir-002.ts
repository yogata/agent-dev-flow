// rules/ir-002.ts — 現行 REQ 必須 frontmatter fields。
// ルール詳細: docs/designs/integrity/rules/IR-002-req-required-frontmatter.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

const REQUIRED_FIELDS = ["id", "title", "created", "updated"] as const;

export const ir002: IntegrityRule = {
  id: "IR-002",
  slug: "req-required-frontmatter",
  title: "現行 REQ 必須 frontmatter fields",
  description: "現行 REQ ファイルの frontmatter が必須フィールド（id/title/created/updated）を欠落しない。",
  relatedReqs: ["REQ-010-001"],
  targetGlobs: ["docs/requirements/*.md"],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const file of ctx.getFilesByGlob("docs/requirements/REQ-*.md")) {
      const fileName = file.path.split("/").pop() ?? "";
      if (fileName === "README.md") continue;
      if (file.frontmatter === null) {
        violations.push({
          ruleId: "IR-002",
          severity: "error",
          filePath: file.path,
          message: "No frontmatter to validate",
        });
        continue;
      }
      const missing = REQUIRED_FIELDS.filter(
        (key) => file.frontmatter![key] === undefined || file.frontmatter![key] === "",
      );
      if (missing.length > 0) {
        violations.push({
          ruleId: "IR-002",
          severity: "error",
          filePath: file.path,
          message: `Missing required fields: ${missing.join(", ")}`,
        });
      }
    }
    return violations;
  },
};
