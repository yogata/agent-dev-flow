// node:fs glob based recursive file enumeration shared by the graph scripts.
//
// Behavioral contract kept from the previous Dirent-based enumeration:
// - regular files only (lstat), so link files are not reported
// - link directories (junctions/symlinks) are not descended
// - a missing scan root yields an empty result; ENOENT during enumeration
//   skips that subtree while other errors propagate
// - forward-slash, root-relative paths in sorted (deterministic) order
//
// Runtime limitation (documented): glob wildcards cannot enumerate dot-named
// path components. Dot-named directories directly under the scan root are
// enumerated via a single-level readdir plus a glob rooted inside them;
// deeper dot-named directories and dot files are not enumerable.

import { globSync, lstatSync, readdirSync } from "node:fs"
import type { Dirent } from "node:fs"
import { join } from "node:path"

function hasNoLinkAncestor(rootDir: string, segments: readonly string[]): boolean {
  for (let i = 1; i < segments.length; i += 1) {
    try {
      if (lstatSync(join(rootDir, ...segments.slice(0, i))).isSymbolicLink()) return false
    } catch {
      return false
    }
  }
  return true
}

function collectMatches(
  rootDir: string,
  cwd: string,
  prefix: readonly string[],
  out: string[],
): void {
  let matches: string[]
  try {
    matches = globSync("**/*", { cwd }) as string[]
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return
    throw error
  }
  for (const match of matches) {
    const segments = [...prefix, ...match.replaceAll("\\", "/").split("/")]
    let isFile = false
    try {
      isFile = lstatSync(join(rootDir, ...segments)).isFile()
    } catch {
      isFile = false
    }
    if (!isFile) continue
    if (!hasNoLinkAncestor(rootDir, segments)) continue
    out.push(segments.join("/"))
  }
}

export function enumerateFilesRel(rootDir: string): readonly string[] {
  const out: string[] = []
  collectMatches(rootDir, rootDir, [], out)

  let entries: Dirent[] = []
  try {
    entries = readdirSync(rootDir, { withFileTypes: true }) as Dirent[]
  } catch {
    entries = []
  }
  for (const ent of entries) {
    if (!ent.isDirectory() || !ent.name.startsWith(".")) continue
    collectMatches(rootDir, join(rootDir, ent.name), [ent.name], out)
  }
  return out.sort()
}
