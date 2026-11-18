// rules/ir-068.ts — skill-projection-manifest。
// ルール詳細: docs/designs/integrity/rules/IR-068-skill-projection-manifest.md
// manifest ↔ src/common/skills 突合、junction 投影突合（worktree は skip）、
// copy_projections 登録の実在突合（IR-016 が内容突合を専担）。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import {
  MANIFEST_REL,
  loadProjectionManifest,
} from "./projection-manifest.ts";

function listProjectionSkillEntries(ctx: IntegrityContext): {
  resolvable: Set<string>;
  broken: string[];
} {
  const resolvable = new Set<string>();
  const broken: string[] = [];
  for (const name of ctx.listDir(".opencode/skills")) {
    if (name.startsWith("repo-")) continue;
    if (ctx.readRaw(`.opencode/skills/${name}`) !== null) {
      broken.push(name);
      continue;
    }
    resolvable.add(name);
  }
  return { resolvable, broken };
}

export const ir068: IntegrityRule = {
  id: "IR-068",
  slug: "skill-projection-manifest",
  title: "skill-projection-manifest",
  description:
    "manifest ↔ src/common/skills の突合、junction 投影突合、copy 投影登録の実在突合を検査データ（skill-projection-manifest.yaml）で実施する。",
  relatedReqs: ["REQ-010-068", "REQ-018-002"],
  targetGlobs: [
    ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml",
    ".opencode/skills/**",
  ],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const manifest = loadProjectionManifest(ctx);
    const toleratedThirdParty = new Set(manifest.thirdPartySkills);
    for (const w of manifest.warnings) {
      violations.push({
        ruleId: "IR-068",
        severity: "warning",
        filePath: MANIFEST_REL,
        message: `Manifest schema warning: ${w} (IR-068)`,
        remediationHint: "manifest entries must be unique lowercase skill dir names",
      });
    }
    if (manifest.skills === null) {
      return violations;
    }

    const srcSet = new Set(
      ctx
        .listDir("src/common/skills")
        // repo-*（repo-agentdev-integrity 等）は copy 投影登録（copy_projections:）の
        // 管理対象であり、skills:（junction 投影の検出ビュー）の突合対象から除外する
        // （generate_indexes deriveSkillProjectionManifestSkills と同一規則）。
        .filter((d) => !d.startsWith("repo-")),
    );
    const manifestSet = new Set(manifest.skills);

    for (const name of [...manifestSet].sort()) {
      if (!srcSet.has(name)) {
        violations.push({
          ruleId: "IR-068",
          severity: "error",
          filePath: MANIFEST_REL,
          message: `Manifest declares skill '${name}' but src/common/skills does not contain it (IR-068)`,
          remediationHint: `remove '${name}' from the manifest or add src/common/skills/${name}/`,
        });
      }
    }
    for (const name of [...srcSet].sort()) {
      if (!manifestSet.has(name)) {
        violations.push({
          ruleId: "IR-068",
          severity: "error",
          filePath: MANIFEST_REL,
          message: `Skill '${name}' exists in src/common/skills but is missing from ${MANIFEST_REL} (IR-068)`,
          remediationHint: `add '${name}' to the manifest (detection view of src enumeration)`,
        });
      }
    }

    const { resolvable: projSet, broken: brokenProj } = listProjectionSkillEntries(ctx);
    for (const name of [...srcSet].sort()) {
      if (!projSet.has(name)) {
        violations.push({
          ruleId: "IR-068",
          severity: "error",
          filePath: ".opencode/skills",
          message: `Skill '${name}' exists in src/common/skills but is missing from .opencode/skills projection (IR-068)`,
          remediationHint: `rebuild junctions (scripts/install.ps1 -Mode apply) or create .opencode/skills/${name}`,
        });
      }
    }
    for (const name of [...projSet].sort()) {
      if (!srcSet.has(name)) {
        if (toleratedThirdParty.has(name)) continue;
        violations.push({
          ruleId: "IR-068",
          severity: "error",
          filePath: `.opencode/skills/${name}`,
          message: `Skill '${name}' exists in .opencode/skills projection but not in src/common/skills (stale junction, IR-068)`,
          remediationHint: "remove the stale junction .opencode/skills/" + name + " (rebuild via scripts/install.ps1 -Mode apply)",
        });
      }
    }
    for (const name of [...brokenProj].sort()) {
      violations.push({
        ruleId: "IR-068",
        severity: "error",
        filePath: `.opencode/skills/${name}`,
        message: `Projection entry '${name}' exists under .opencode/skills but does not resolve to a directory (broken junction or stray entry, IR-068)`,
        remediationHint: "remove the stale junction .opencode/skills/" + name + " (rebuild via scripts/install.ps1 -Mode apply)",
      });
    }

    for (const entry of manifest.copyProjections) {
      if (!ctx.pathExists(entry.canonical) || !ctx.pathExists(entry.projection)) {
        violations.push({
          ruleId: "IR-068",
          severity: "error",
          filePath: MANIFEST_REL,
          message: `copy_projections entry '${entry.canonical}' -> '${entry.projection}' does not resolve to existing directories (IR-068)`,
          remediationHint: "fix the registration or rebuild the copy projection",
        });
      }
    }
    return violations;
  },
};
