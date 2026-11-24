// Antigravity host connection for skill discovery and public command entry.
//
// The business rules of skill discovery and command entry live on the
// common canonical side (skill-resolution lib). This connection only binds
// the Antigravity public entry root (.agent/skills, as documented in
// Antigravity's public material) and the designated workspace to that
// contract; it does not re-implement any rule.
//
// Binding contract:
//   - Entry root: <workspaceRoot>/.agent/skills/ is the Antigravity public
//     entry projection (the installer populates it from the canonical
//     skills).
//   - Canonical root: <repoRoot>/src/common/skills/ and
//     <repoRoot>/src/common/commands/agentdev/ are the common canonical
//     sources. The canonical skills dir is the fallback when the entry
//     projection is absent (fresh workspace before install, worktree
//     without propagated links).
//   - Public command entry: the entry resolves the full command text and
//     the delegated Workflow Skill (`agentdev-workflow-<businessName>`)
//     and passes the arguments through unchanged; the command text is
//     applied before the Workflow Skill is read.
//   - Workspace containment: every resolved skill root, bundled asset, and
//     write target must resolve beneath the designated workspace root.
//   - Repo root: passed in by the caller; this module never walks up to
//     find it.

import * as path from "node:path";
import {
  assertWithinWorkspace,
  discoverSkill,
  resolveSkillAsset,
  type AssetResolution,
  type SkillDiscoveryResult,
  type SkillEntry,
} from "../../common/skills/agentdev-skill-resolution/scripts/src/skill-resolution.ts";
import {
  applyPublicEntry,
  type PublicEntryResult,
} from "../../common/skills/agentdev-skill-resolution/scripts/src/command-entry.ts";

/** Antigravity public entry skills dir, relative to the workspace root. */
export const ANTIGRAVITY_ENTRY_SKILLS_DIR = ".agent/skills";

/** Common canonical skills dir, relative to the repo root. */
export const ANTIGRAVITY_CANONICAL_SKILLS_DIR = "src/common/skills";

/** Common canonical commands dir, relative to the repo root. */
export const ANTIGRAVITY_CANONICAL_COMMANDS_DIR = "src/common/commands/agentdev";

/** Absolute Antigravity public entry skills dir for the designated workspace. */
export function antigravityEntrySkillsDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, ANTIGRAVITY_ENTRY_SKILLS_DIR);
}

/** Absolute common canonical skills dir for the given repo root. */
export function antigravityCanonicalSkillsDir(repoRoot: string): string {
  return path.join(repoRoot, ANTIGRAVITY_CANONICAL_SKILLS_DIR);
}

/** Absolute common canonical commands dir for the given repo root. */
export function antigravityCanonicalCommandsDir(repoRoot: string): string {
  return path.join(repoRoot, ANTIGRAVITY_CANONICAL_COMMANDS_DIR);
}

/**
 * Resolve a parent or child skill for the Antigravity host. Parent and
 * child share the same contract: entry projection first, canonical
 * fallback second.
 */
export function antigravityDiscoverSkill(
  workspaceRoot: string,
  repoRoot: string,
  skillName: string,
): SkillDiscoveryResult {
  return discoverSkill({
    skillName,
    entrySkillsDirs: [antigravityEntrySkillsDir(workspaceRoot)],
    canonicalSkillsDir: antigravityCanonicalSkillsDir(repoRoot),
  });
}

/**
 * Resolve a reference, template, or script shipped inside a skill, and keep
 * the resolution inside the designated workspace. Returns the common
 * contract rejection when the asset escapes its skill root.
 */
export function antigravityResolveSkillAsset(
  workspaceRoot: string,
  entry: SkillEntry,
  relativeRef: string,
): AssetResolution {
  const inside = assertWithinWorkspace(workspaceRoot, entry.skillRoot);
  if (!inside.ok) return { ok: false, reason: "escapes-skill-root" };
  return resolveSkillAsset(entry, relativeRef);
}

/**
 * Fail-closed gate for write-side effects on the Antigravity host: a write
 * or edit target is accepted only when it resolves beneath the designated
 * workspace root. Anything else (sibling workspace, parent dir, unrelated
 * drive) is rejected before side effects happen.
 */
export function antigravityAssertWriteTarget(
  workspaceRoot: string,
  target: string,
): { ok: true } | { ok: false; reason: "outside-workspace" } {
  return assertWithinWorkspace(workspaceRoot, target);
}

/**
 * Apply a public command entry for the Antigravity host: the full command
 * text is loaded first, the delegated Workflow Skill is resolved through
 * the Antigravity entry projection (canonical fallback second), and the
 * arguments pass through unchanged. Rejections follow the common contract.
 */
export function antigravityApplyPublicEntry(
  workspaceRoot: string,
  repoRoot: string,
  businessName: string,
  args: string,
): PublicEntryResult {
  return applyPublicEntry({
    commandsDir: antigravityCanonicalCommandsDir(repoRoot),
    entrySkillsDirs: [antigravityEntrySkillsDir(workspaceRoot)],
    canonicalSkillsDir: antigravityCanonicalSkillsDir(repoRoot),
    businessName,
    args,
  });
}
