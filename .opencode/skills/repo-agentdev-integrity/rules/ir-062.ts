// rules/ir-062.ts — skill/command パス参照実在。
// ルール詳細: docs/designs/integrity/rules/IR-062-reference-path-existence.md
// 検出コアは rules/reference-path-core.ts を IR-008 と共有する（対象: commands/*.md）。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import {
  checkReferencePaths,
  collectCommandScopeFiles,
} from "./reference-path-core.ts";

export const ir062: IntegrityRule = {
  id: "IR-062",
  slug: "reference-path-existence",
  title: "skill/command パス参照実在",
  description:
    "共通 command 本文が参照する scripts/templates/references パスの実在を確認する（runtime-generated path の親ディレクトリ確認を含む）。",
  relatedReqs: ["REQ-010"],
  targetGlobs: ["src/common/commands/agentdev/*.md"],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    return checkReferencePaths(ctx, {
      ruleId: "IR-062",
      files: collectCommandScopeFiles(ctx),
      isSkillScope: false,
    });
  },
};
