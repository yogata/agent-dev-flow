// rules/ir-056.ts — project-extensions-integrity。
// ルール詳細: docs/designs/integrity/rules/IR-056-project-extensions-integrity.md
// 検出本体は lib/extensions-integrity.ts（IntegrityContext 経由 I/O のみ）。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { checkExtensions } from "../lib/extensions-integrity.ts";

export const ir056: IntegrityRule = {
  id: "IR-056",
  slug: "project-extensions-integrity",
  title: "project-extensions-integrity",
  description:
    "Project Extensions（.agentdev/extensions/**）の kind 検証・配置整合・id-target 一致・Workflow/Capability 分類整合・context.paths 実在を検出する。",
  relatedReqs: ["REQ-002"],
  targetGlobs: [".agentdev/extensions/**", "src/common/commands/agentdev/*.md", "src/common/skills/**"],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const report = checkExtensions(ctx);
    return report.failures.map((failure) => ({
      ruleId: "IR-056",
      severity: failure.severity === "strict" ? ("error" as const) : ("warning" as const),
      filePath: failure.file ?? ".agentdev/extensions",
      message: `#${failure.check} ${failure.check_name}: ${failure.message} [${failure.classification}]`,
      remediationHint: failure.classification,
    }));
  },
};
