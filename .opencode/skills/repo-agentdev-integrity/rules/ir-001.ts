// rules/ir-001.ts — 現行 REQ frontmatter id ↔ ファイル名。
// ルール詳細: docs/designs/integrity/rules/IR-001-req-frontmatter-id-filename.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

export const ir001: IntegrityRule = {
  id: "IR-001",
  slug: "req-frontmatter-id-filename",
  title: "現行 REQ frontmatter id ↔ ファイル名",
  description: "現行 REQ ファイルの frontmatter id がファイル名（REQ-NNN）と一致する。",
  relatedReqs: ["REQ-010-001", "REQ-001"],
  targetGlobs: ["docs/requirements/*.md"],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const file of ctx.getFilesByGlob("docs/requirements/REQ-*.md")) {
      const fileName = file.path.split("/").pop() ?? "";
      if (fileName === "README.md") continue;
      const expectedId = fileName.replace(/\.md$/, "");
      if (file.frontmatter === null) {
        violations.push({
          ruleId: "IR-001",
          severity: "error",
          filePath: file.path,
          message: "No valid frontmatter found",
        });
        continue;
      }
      const actualId = file.frontmatter["id"];
      if (typeof actualId !== "string") {
        violations.push({
          ruleId: "IR-001",
          severity: "error",
          filePath: file.path,
          message: "Missing or invalid 'id' field",
        });
      } else if (actualId !== expectedId) {
        violations.push({
          ruleId: "IR-001",
          severity: "error",
          filePath: file.path,
          message: `id '${actualId}' does not match filename '${expectedId}'`,
        });
      }
    }
    return violations;
  },
};
