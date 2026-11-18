// rules/ir-013.ts — 完了報告種別実在（variant path existence）。
// ルール詳細: docs/designs/integrity/rules/IR-013-variant-path-existence.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

const COMMANDS_DIR = "src/common/commands/agentdev";
const VARIANT_REF_RE = /completion-reports\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*\.md/g;

export const ir013: IntegrityRule = {
  id: "IR-013",
  slug: "variant-path-existence",
  title: "完了報告種別実在",
  description:
    "command 本文が参照する completion-reports/<種別>/<variant>.md の実在を機械確認する。",
  relatedReqs: ["REQ-036-008"],
  targetGlobs: ["src/common/commands/agentdev/*.md"],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const file of ctx.getFilesByGlob(`${COMMANDS_DIR}/*.md`)) {
      const cmdName = (file.path.split("/").pop() ?? "").replace(/\.md$/, "");
      if (cmdName === "README") continue;
      const variantRefs = new Set(file.rawContent.match(VARIANT_REF_RE) ?? []);
      for (const ref of variantRefs) {
        const variantPath = `docs/commands/${ref}`;
        if (!ctx.pathExists(variantPath)) {
          violations.push({
            ruleId: "IR-013",
            severity: "error",
            filePath: file.path,
            message: `Command '${cmdName}' references '${ref}' but file does not exist`,
            remediationHint: "referenced variant file must exist",
          });
        }
      }
    }
    return violations;
  },
};
