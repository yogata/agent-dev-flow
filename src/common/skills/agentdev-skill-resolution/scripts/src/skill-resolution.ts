// Skill discovery, bundled-asset resolution, and workspace root resolution
// contract shared by all hosts. The business contract of skill discovery is
// owned by the common canonical side; host connection areas (src/opencode/,
// src/senpi/) bind their public entry roots and delegate resolution to this
// module. They must not duplicate the rules.
//
// Contract shape (fail-closed throughout):
//   - Workspace resolution: a workspace root is recognized only through the
//     ADF domain-state marker directory. No marker -> no workspace. The root
//     is never guessed from cwd, env vars, or drive layout.
//   - Workspace containment: edit targets and tool/guard resolved paths must
//     resolve beneath the designated workspace root. Anything that escapes
//     the root (sibling workspace, parent, unrelated drive) is rejected.
//   - Skill discovery: parent and child skills resolve through the same
//     contract: host entry projections first, then the canonical skills dir.
//     Broken entries (projection without a readable SKILL.md, e.g. stale or
//     unpropagated junctions) are skipped, not fatal.
//   - Bundled assets: references, templates, and scripts shipped inside a
//     skill directory resolve relative to that skill root and never escape
//     it. Traversal above the skill root is rejected without filesystem I/O.
//
// Deterministic: no reads other than existence checks; no environment
// lookups; results depend only on the inputs.

import * as fs from "node:fs";
import * as path from "node:path";

/** Marker directory that identifies an ADF workspace root. */
export const WORKSPACE_MARKER_DIR = ".agentdev";

/** Public entry file of a distributed skill. */
export const SKILL_ENTRY_FILE = "SKILL.md";

export type ResolutionOrigin = "entry" | "canonical";

export interface SkillEntry {
  skillName: string;
  /** Absolute path to the skill directory containing SKILL.md. */
  skillRoot: string;
  /** Absolute path to SKILL.md. */
  skillMdPath: string;
  /** Where the skill was resolved: host entry projection or canonical source. */
  origin: ResolutionOrigin;
}

export interface DiscoverSkillInput {
  skillName: string;
  /** Host public entry dirs (projection roots), first match wins. */
  entrySkillsDirs: string[];
  /** Canonical skills dir (src/common/skills equivalent). */
  canonicalSkillsDir: string;
}

export type SkillDiscoveryResult =
  | { ok: true; entry: SkillEntry }
  | { ok: false; reason: "invalid-name" | "not-found" };

export type WorkspaceResolution =
  | { ok: true; workspaceRoot: string }
  | { ok: false; reason: "no-marker" };

export type AssetResolution =
  | { ok: true; assetPath: string }
  | { ok: false; reason: "escapes-skill-root" | "missing" };

/** Normalize Windows separators to slashes for path-segment logic. */
export function normalizeSlashes(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Resolve `.` / `..` segments. Returns { ok: false } when a `..` would climb
 * above the root of the given relative path.
 */
export function resolveRelativeSegments(
  relPath: string,
): { ok: true; resolved: string } | { ok: false } {
  const stack: string[] = [];
  for (const seg of relPath.split("/")) {
    if (seg === "..") {
      if (stack.length === 0) return { ok: false };
      stack.pop();
    } else if (seg !== "." && seg !== "") {
      stack.push(seg);
    }
  }
  return { ok: true, resolved: stack.join("/") };
}

function hasDriveLetter(p: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(p);
}

/** Root containment check. Case-insensitive when a Windows drive letter is present. */
export function isUnderRoot(root: string, target: string): boolean {
  const r = normalizeSlashes(root).replace(/\/+$/, "");
  const t = normalizeSlashes(target).replace(/\/+$/, "");
  if (r === t) return true;
  if (hasDriveLetter(r) || hasDriveLetter(t)) {
    return t.toLowerCase().startsWith((r.toLowerCase()) + "/");
  }
  return t.startsWith(r + "/");
}

/** Distributed skill names are directory names only: letters, digits, dashes. */
export function isValidSkillName(skillName: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(skillName);
}

function resolveSkillEntryFile(skillDir: string): string {
  const skillMdPath = path.join(skillDir, SKILL_ENTRY_FILE);
  try {
    if (!fs.statSync(skillMdPath).isFile()) return "";
  } catch {
    // Broken projection entry (stale junction, unpropagated link): skip.
    return "";
  }
  return skillMdPath;
}

/**
 * Resolve a skill by name through the host contract: entry projections in
 * order, then the canonical skills dir. Child skills use the same function;
 * they never resolve relative to the parent skill directory.
 */
export function discoverSkill(input: DiscoverSkillInput): SkillDiscoveryResult {
  if (!isValidSkillName(input.skillName)) {
    return { ok: false, reason: "invalid-name" };
  }
  const candidates: Array<{ dir: string; origin: ResolutionOrigin }> = [
    ...input.entrySkillsDirs.map((dir) => ({ dir, origin: "entry" as const })),
    { dir: input.canonicalSkillsDir, origin: "canonical" as const },
  ];
  for (const candidate of candidates) {
    const skillDir = path.join(candidate.dir, input.skillName);
    const skillMdPath = resolveSkillEntryFile(skillDir);
    if (skillMdPath !== "") {
      return {
        ok: true,
        entry: {
          skillName: input.skillName,
          skillRoot: skillDir,
          skillMdPath,
          origin: candidate.origin,
        },
      };
    }
  }
  return { ok: false, reason: "not-found" };
}

/**
 * Resolve a reference, template, or script shipped inside a skill directory.
 * The reference is skill-root relative; traversal above the skill root is
 * rejected before any filesystem access (fail-closed, no side effects).
 */
export function resolveSkillAsset(entry: SkillEntry, relativeRef: string): AssetResolution {
  const normalized = normalizeSlashes(relativeRef);
  if (path.isAbsolute(normalized)) {
    return { ok: false, reason: "escapes-skill-root" };
  }
  const resolved = resolveRelativeSegments(normalized);
  if (!resolved.ok) {
    return { ok: false, reason: "escapes-skill-root" };
  }
  const assetPath = path.join(entry.skillRoot, resolved.resolved);
  if (!isUnderRoot(entry.skillRoot, assetPath)) {
    return { ok: false, reason: "escapes-skill-root" };
  }
  try {
    if (!fs.statSync(assetPath).isFile()) return { ok: false, reason: "missing" };
  } catch {
    return { ok: false, reason: "missing" };
  }
  return { ok: true, assetPath };
}

/**
 * Resolve the workspace root from a start directory by walking up until the
 * ADF domain-state marker is found. No marker -> no workspace (fail-closed);
 * the root is never guessed from cwd or environment.
 */
export function resolveWorkspaceRoot(startDir: string): WorkspaceResolution {
  let dir = path.resolve(startDir);
  for (;;) {
    try {
      if (fs.statSync(path.join(dir, WORKSPACE_MARKER_DIR)).isDirectory()) {
        return { ok: true, workspaceRoot: dir };
      }
    } catch {
      // Marker absent in this directory; keep walking up.
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return { ok: false, reason: "no-marker" };
}

/**
 * True when `target` is the workspace root or lives beneath it. This is the
 * containment predicate edit tools and guard/tool connections use to keep
 * their resolved root identical to the designated workspace.
 */
export function isWithinWorkspace(workspaceRoot: string, target: string): boolean {
  return isUnderRoot(workspaceRoot, target);
}

/**
 * Reject anything that is not strictly inside the designated workspace.
 * Used as the fail-closed gate before write-side effects.
 */
export function assertWithinWorkspace(
  workspaceRoot: string,
  target: string,
): { ok: true } | { ok: false; reason: "outside-workspace" } {
  return isWithinWorkspace(workspaceRoot, target)
    ? { ok: true }
    : { ok: false, reason: "outside-workspace" };
}
