// Senpi host connection for skill discovery and workspace-scoped resolution.
//
// The business rules of skill discovery live on the common canonical side
// (skill-resolution lib). This connection only binds the Senpi public entry
// roots and the designated workspace to that contract; it does not
// re-implement any discovery rule.
//
// Binding contract:
//   - Entry root: <workspaceRoot>/.senpi/skills/ is the Senpi public entry
//     projection (the installer populates it from the canonical skills).
//   - Canonical root: <repoRoot>/src/common/skills/ is the common canonical
//     skills source. It is the fallback when the entry projection is absent
//     (fresh workspace before install, worktree without propagated links).
//   - Workspace containment: every resolved skill root, bundled asset, and
//     write target must resolve beneath the designated workspace root. The
//     workspace root is passed in by the host runtime; it is never guessed.
//   - Repo root: passed in by the caller (self-hosting resolves it to the
//     active worktree, consumer installs resolve it to the installed
//     package). This module never walks up to find it.

import * as path from "node:path";
import {
  assertWithinWorkspace,
  discoverSkill,
  resolveSkillAsset,
  type AssetResolution,
  type SkillDiscoveryResult,
  type SkillEntry,
} from "../../common/skills/agentdev-skill-resolution/scripts/src/skill-resolution.ts";

/** Senpi public entry skills dir, relative to the workspace root. */
export const SENPI_ENTRY_SKILLS_DIR = ".senpi/skills";

/** Common canonical skills dir, relative to the repo root. */
export const SENPI_CANONICAL_SKILLS_DIR = "src/common/skills";

/** Absolute Senpi public entry skills dir for the designated workspace. */
export function senpiEntrySkillsDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, SENPI_ENTRY_SKILLS_DIR);
}

/** Absolute common canonical skills dir for the given repo root. */
export function senpiCanonicalSkillsDir(repoRoot: string): string {
  return path.join(repoRoot, SENPI_CANONICAL_SKILLS_DIR);
}

/**
 * Resolve a parent or child skill for the Senpi host. Parent and child share
 * the same contract: entry projection first, canonical fallback second.
 */
export function senpiDiscoverSkill(
  workspaceRoot: string,
  repoRoot: string,
  skillName: string,
): SkillDiscoveryResult {
  return discoverSkill({
    skillName,
    entrySkillsDirs: [senpiEntrySkillsDir(workspaceRoot)],
    canonicalSkillsDir: senpiCanonicalSkillsDir(repoRoot),
  });
}

/**
 * Resolve a reference, template, or script shipped inside a skill, and keep
 * the resolution inside the designated workspace. Returns the common
 * contract rejection when the asset escapes its skill root.
 */
export function senpiResolveSkillAsset(
  workspaceRoot: string,
  entry: SkillEntry,
  relativeRef: string,
): AssetResolution {
  const inside = assertWithinWorkspace(workspaceRoot, entry.skillRoot);
  if (!inside.ok) return { ok: false, reason: "escapes-skill-root" };
  return resolveSkillAsset(entry, relativeRef);
}

/**
 * Fail-closed gate for write-side effects on the Senpi host: a write or edit
 * target is accepted only when it resolves beneath the designated workspace
 * root. Anything else (sibling workspace, parent dir, unrelated drive) is
 * rejected before side effects happen.
 */
export function senpiAssertWriteTarget(
  workspaceRoot: string,
  target: string,
): { ok: true } | { ok: false; reason: "outside-workspace" } {
  return assertWithinWorkspace(workspaceRoot, target);
}
