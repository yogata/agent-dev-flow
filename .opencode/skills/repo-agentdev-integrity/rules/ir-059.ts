// rules/ir-059.ts — distribution-reference-boundary。
// ルール詳細: docs/designs/integrity/rules/IR-059-distribution-reference-boundary.md
// 検出本体は trusted-distribution-gate/check_distribution_boundary.ts（配布境界 Design の
// stable implementation contract。fs 走査を gate モジュール群側で専担）。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import {
  checkDistributionBoundary,
} from "../trusted-distribution-gate/check_distribution_boundary.ts";
import { DEFAULT_DETECTOR_CONFIG } from "../trusted-distribution-gate/distribution-boundary.ts";

export const ir059: IntegrityRule = {
  id: "IR-059",
  slug: "distribution-reference-boundary",
  title: "distribution-reference-boundary",
  description:
    "配布物内の具体 ID・docs パス・GitHub URL 等の参照が配布依存境界（REQ-029）に違反しないことを検出する。",
  relatedReqs: ["REQ-029"],
  targetGlobs: [
    "src/common/commands/**",
    "src/common/skills/**",
    "src/common/tools/**",
    "src/common/guards/**",
    "docs/**",
    "README.md",
  ],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const report = checkDistributionBoundary(ctx.repoRoot, "source", DEFAULT_DETECTOR_CONFIG);
    return report.failures.map((failure) => ({
      ruleId: "IR-059",
      severity: "error",
      filePath: failure.file,
      line: failure.line || undefined,
      message: `[${failure.category}] ${failure.snippet} (matched: ${failure.matched})`,
      remediationHint:
        "distribution artifacts must not carry concrete producer-side identifiers/paths/URLs (REQ-029)",
    }));
  },
};
