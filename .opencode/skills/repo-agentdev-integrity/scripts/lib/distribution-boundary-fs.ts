// Filesystem helpers for the distribution boundary adapter.
//
// Strict byte-level reading: artifacts are read as raw bytes and classified
// via the lib text/binary classifier so invalid UTF-8 / NUL is reported as
// an adapter failure instead of being silently replaced with U+FFFD by
// Node's `readFileSync(p, "utf-8")` (the false-clean vector PR #2092 closes).
//
// Unknown extension fail-closed: `listTextArtifacts` partitions directory
// entries into text/binary/unknown via `classifyByExtension`. Unknown-ext
// files are surfaced via the `unknownExtensionFiles` out-parameter so the
// orchestrator can emit adapter-failure Detections rather than silently
// skipping or scanning them as text.
//
// Projection semantics (source/link/archive/archive-installed) per
// docs/designs/integrity/distribution-boundary.md "projection の分離":
//   - source/archive        -> src/opencode/**
//   - link/archive-installed-> .opencode/**
// Both projections enumerate the same logical content (consumer install
// copies src/opencode/** -> .opencode/**); the directory choice reflects
// where the scanner must look for that projection.

import * as path from "path";
import * as fs from "fs";
import {
  classifyByExtension,
  classifyBytes,
  type ByteSource,
  type Projection,
} from "./distribution-boundary.ts";
import type { BoundaryFailure } from "./distribution-boundary-types.ts";

export const PUBLIC_COMMAND_DIR = "src/opencode/commands/agentdev";
export const PUBLIC_SKILLS_PARENT = "src/opencode/skills";
export const PUBLIC_TOOLS_PARENT = "src/opencode/tools";
export const PUBLIC_PLUGINS_PARENT = "src/opencode/plugins";

// ADF-COVERS(implementation): REQ-052-006, REQ-052-007, REQ-029-006

export type FailureCategory = BoundaryFailure["category"];

export function dirExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Resolve a path to its canonical real path for traversal dedup.
 * Returns the input unchanged when realpath fails (deleted/mid-scan race),
 * so dedup stays best-effort and never blocks the scan.
 */
function safeRealpath(p: string): string {
  try {
    return fs.realpathSync(p);
  } catch {
    return p;
  }
}

/**
 * Dirent directory test that also treats directory symlinks / junctions as
 * directories (Windows junctions report isSymbolicLink() === true and
 * isDirectory() === false from lstat-based readdirSync entries, so
 * isDirectory() alone silently skips them and the link projection scan
 * misses the projection entirely).
 * A symlink is followed via statSync only to confirm it targets a directory;
 * file symlinks fall through to the regular file branch.
 */
function direntPointsToDirectory(ent: fs.Dirent, full: string): boolean {
  if (ent.isDirectory()) return true;
  if (!ent.isSymbolicLink()) return false;
  try {
    return fs.statSync(full).isDirectory();
  } catch {
    // Broken symlink: treat as traversal failure target-free, skip it.
    return false;
  }
}

export type ReadArtifactResult =
  | { ok: true; text: string }
  | { ok: false; reason: "read-failure" | "invalid-utf8"; detail: string };

/**
 * Read a distribution artifact as raw bytes and classify via strict UTF-8.
 * Returns `invalid-utf8` (covering both NUL and any non-strict-UTF-8 byte
 * sequence) so the orchestrator emits a single adapter-failure Detection
 * rather than scanning replaced-charset text.
 */
export function readArtifactBytes(p: string): ReadArtifactResult {
  let bytes: ByteSource;
  try {
    bytes = fs.readFileSync(p);
  } catch {
    return { ok: false, reason: "read-failure", detail: p };
  }
  const cls = classifyBytes(bytes);
  if (cls.kind === "binary") {
    return { ok: false, reason: "invalid-utf8", detail: cls.reason ?? "binary" };
  }
  // classifyBytes returns text only when bytes are strict-UTF-8 clean.
  return { ok: true, text: cls.text ?? "" };
}

export interface ArtifactListing {
  /** Text-extension files to be scanned. */
  readonly textFiles: readonly string[];
  /** Binary-extension files to be skipped (tracked for stats). */
  readonly binaryFiles: readonly string[];
  /** Unknown-extension files to fail-closed at the orchestrator. */
  readonly unknownFiles: readonly string[];
}

function listArtifactsRec(dirPath: string): ArtifactListing {
  const textFiles: string[] = [];
  const binaryFiles: string[] = [];
  const unknownFiles: string[] = [];
  if (!dirExists(dirPath)) {
    return { textFiles, binaryFiles, unknownFiles };
  }
  // Cycle prevention: track visited real paths so junction / symlink loops
  // (e.g. a symlink pointing back to an ancestor) terminate instead of
  // looping forever.
  const visited = new Set<string>([safeRealpath(dirPath)]);
  const stack: string[] = [dirPath];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) break;
    let entries: Array<fs.Dirent>;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true }) as Array<fs.Dirent>;
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (direntPointsToDirectory(ent, full)) {
        if (ent.name === "node_modules") continue;
        const real = safeRealpath(full);
        if (visited.has(real)) continue;
        visited.add(real);
        stack.push(full);
      } else if (ent.isFile() || ent.isSymbolicLink()) {
        const cls = classifyByExtension(ent.name);
        const normalized = full.replace(/\\/g, "/");
        if (cls.kind === "text") {
          textFiles.push(normalized);
        } else if (cls.kind === "binary") {
          binaryFiles.push(normalized);
        } else {
          unknownFiles.push(normalized);
        }
      }
    }
  }
  return { textFiles, binaryFiles, unknownFiles };
}

/**
 * Enumerate scan targets for a projection. Returns text/binary/unknown
 * partition so the orchestrator can apply projection-specific semantics
 * (binary skipped, unknown fail-closed).
 */
export function collectTargets(repoRoot: string, projection: Projection): ArtifactListing {
  const isInstalledProjection =
    projection === "link" || projection === "archive-installed";
  const commandRel = isInstalledProjection
    ? path.join(".opencode", "commands", "agentdev")
    : PUBLIC_COMMAND_DIR;
  const skillsRel = isInstalledProjection
    ? path.join(".opencode", "skills")
    : PUBLIC_SKILLS_PARENT;

  let merged: ArtifactListing = listArtifactsRec(path.join(repoRoot, commandRel));

  // agentdev-* and japanese-tech-writing both ship in archive; others ignored.
  const shippableSkills = (name: string): boolean =>
    name.startsWith("agentdev-") || name === "japanese-tech-writing";
  // Custom Tools and Plugins/Hooks ship under agentdev-* distribution names
  // (REQ-052); other entries under these parents are repo-local and ignored.
  const shippableDistribution = (name: string): boolean => name.startsWith("agentdev-");

  for (const [rel, accept] of [
    [skillsRel, shippableSkills],
    [isInstalledProjection ? path.join(".opencode", "tools") : PUBLIC_TOOLS_PARENT, shippableDistribution],
    [isInstalledProjection ? path.join(".opencode", "plugins") : PUBLIC_PLUGINS_PARENT, shippableDistribution],
  ] as const) {
    const parent = path.join(repoRoot, rel);
    if (!dirExists(parent)) continue;
    let entries: Array<fs.Dirent>;
    try {
      entries = fs.readdirSync(parent, { withFileTypes: true }) as Array<fs.Dirent>;
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(parent, ent.name);
      // Junction / symlink skill entries count as directories (link
      // projection traversal).
      if (!direntPointsToDirectory(ent, full)) continue;
      if (!accept(ent.name)) continue;
      merged = appendListing(
        merged,
        listArtifactsRec(full),
      );
    }
  }
  return merged;
}

function appendListing(into: ArtifactListing, from: ArtifactListing): ArtifactListing {
  return {
    textFiles: [...into.textFiles, ...from.textFiles],
    binaryFiles: [...into.binaryFiles, ...from.binaryFiles],
    unknownFiles: [...into.unknownFiles, ...from.unknownFiles],
  };
}

export function normalizeFileForBaseline(file: string, repoRoot: string): string {
  const norm = file.replace(/\\/g, "/");
  const root = repoRoot.replace(/\\/g, "/");
  if (norm.startsWith(root + "/")) {
    return norm.slice(root.length + 1);
  }
  return norm;
}

export interface SignatureCount {
  file: string;
  category: FailureCategory;
  matched: string;
  count: number;
}

/**
 * Build a (file, category, matched) -> count map keyed on a NUL-joined
 * signature. Used by baseline construction and delta computation.
 */
export function countBySignature(
  failures: ReadonlyArray<{
    file: string;
    category: FailureCategory;
    matched: string;
  }>,
  repoRoot: string,
): Map<string, SignatureCount> {
  const map = new Map<string, SignatureCount>();
  for (const f of failures) {
    const file = normalizeFileForBaseline(f.file, repoRoot);
    const key = `${file}\u0000${f.category}\u0000${f.matched}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { file, category: f.category, matched: f.matched, count: 1 });
    }
  }
  return map;
}
