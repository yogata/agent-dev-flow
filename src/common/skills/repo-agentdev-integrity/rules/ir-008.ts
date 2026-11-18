// rules/ir-008.ts — Skill references/ 存在。
// ルール詳細: docs/designs/integrity/rules/IR-008-skill-references-existence.md
// 検出コアは rules/reference-path-core.ts を IR-062 と共有する（対象: SKILL.md と references/*.md）。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import {
  checkReferencePaths,
  collectSkillScopeFiles,
} from "./reference-path-core.ts";

export const ir008: IntegrityRule = {
  id: "IR-008",
  slug: "skill-references-existence",
  title: "Skill references/ 存在",
  description:
    "SKILL.md と references/*.md が参照する scripts/templates/references パスの実在を確認する（cross-skill 裸参照の検出を含む）。",
  relatedReqs: ["REQ-036-008"],
  targetGlobs: ["src/common/skills/**/SKILL.md", "src/common/skills/**/references/*.md"],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    return checkReferencePaths(ctx, {
      ruleId: "IR-008",
      files: collectSkillScopeFiles(ctx),
      isSkillScope: true,
    });
  },
};
