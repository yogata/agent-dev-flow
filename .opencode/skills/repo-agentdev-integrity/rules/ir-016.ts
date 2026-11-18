// rules/ir-016.ts — source/projection 整合性（copy 投影版）。
// ルール詳細: docs/designs/integrity/rules/IR-016-source-projection-integrity.md
// DEC-065 決定3 により repo-agentdev-integrity の正本（src/common/skills/**）と
// copy 投影（.opencode/skills/**）のファイル集合・内容一致を検査する。

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { loadProjectionManifest } from "./projection-manifest.ts";

function listFilesRecursive(ctx: IntegrityContext, relDir: string): string[] {
  const out: string[] = [];
  for (const name of ctx.listDir(relDir)) {
    const child = `${relDir}/${name}`;
    if (ctx.readRaw(child) !== null) {
      out.push(child);
      continue;
    }
    if (ctx.listDir(child).length > 0) {
      out.push(...listFilesRecursive(ctx, child));
    }
  }
  return out;
}

export function compareCopyProjection(
  ctx: IntegrityContext,
  canonicalDir: string,
  projectionDir: string,
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const canonicalFiles = listFilesRecursive(ctx, canonicalDir);
  const projectionFiles = listFilesRecursive(ctx, projectionDir);
  const canonicalRelSet = new Set(canonicalFiles.map((f) => f.slice(canonicalDir.length + 1)));
  const projectionRelSet = new Set(projectionFiles.map((f) => f.slice(projectionDir.length + 1)));

  for (const relInside of [...canonicalRelSet].sort()) {
    if (!projectionRelSet.has(relInside)) {
      violations.push({
        ruleId: "IR-016",
        severity: "error",
        filePath: `${canonicalDir}/${relInside}`,
        message: `${canonicalDir}/${relInside} exists in source (canonical) but missing from copy projection`,
        remediationHint: "rebuild the copy projection from the canonical source",
      });
      continue;
    }
    const canonical = ctx.readRaw(`${canonicalDir}/${relInside}`);
    const projection = ctx.readRaw(`${projectionDir}/${relInside}`);
    if (canonical !== projection) {
      violations.push({
        ruleId: "IR-016",
        severity: "error",
        filePath: `${canonicalDir}/${relInside}`,
        message: `copy projection content mismatch: ${canonicalDir}/${relInside} differs between canonical and projection`,
        remediationHint: "re-sync the copy projection from the canonical source",
      });
    }
  }
  for (const relInside of [...projectionRelSet].sort()) {
    if (!canonicalRelSet.has(relInside)) {
      violations.push({
        ruleId: "IR-016",
        severity: "error",
        filePath: `${projectionDir}/${relInside}`,
        message: `${projectionDir}/${relInside} exists in copy projection but missing from source (canonical)`,
        remediationHint: "remove the stale projection file or add it to the canonical source",
      });
    }
  }
  return violations;
}

export const ir016: IntegrityRule = {
  id: "IR-016",
  slug: "source-projection-integrity",
  title: "Source/projection 整合性",
  description:
    "skill-projection-manifest の copy 投影登録（repo-agentdev-integrity）について、src 正本と .opencode 投影のファイル集合・内容一致を検査する。",
  relatedReqs: ["REQ-002-048", "REQ-002-049", "REQ-002-050", "REQ-002-051", "REQ-002-052"],
  targetGlobs: [
    "src/common/skills/repo-agentdev-integrity/**",
    ".opencode/skills/repo-agentdev-integrity/**",
    ".opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml",
  ],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const manifest = loadProjectionManifest(ctx);
    for (const entry of manifest.copyProjections) {
      if (!ctx.pathExists(entry.canonical)) {
        violations.push({
          ruleId: "IR-016",
          severity: "error",
          filePath: entry.canonical,
          message: `copy projection registration declares missing canonical dir: ${entry.canonical}`,
          remediationHint: "fix the copy_projections entry in the projection manifest",
        });
        continue;
      }
      if (!ctx.pathExists(entry.projection)) {
        violations.push({
          ruleId: "IR-016",
          severity: "error",
          filePath: entry.projection,
          message: `copy projection registration declares missing projection dir: ${entry.projection}`,
          remediationHint: "rebuild the copy projection from the canonical source",
        });
        continue;
      }
      violations.push(...compareCopyProjection(ctx, entry.canonical, entry.projection));
    }
    return violations;
  },
};
