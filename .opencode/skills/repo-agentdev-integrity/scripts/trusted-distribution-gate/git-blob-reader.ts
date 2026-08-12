// Git tree-listing adapter.
//
// This module performs `git ls-tree` against a fixed candidate OID and
// parses the result. Per-blob and batched blob reads live in
// git-blob-batch.ts. Both modules share the typed-error taxonomy from
// types.ts.
//
// Safety contract:
//   - Modes other than `100644` and `100755` are rejected (no symlinks
//     `120000`, no gitlinks `160000`, no trees `040000`).
//   - Object kind must be `blob`. `tree` and `commit` are rejected.
//   - Duplicate paths in the listing are rejected.
//   - The adapter NEVER imports or executes candidate code. It only reads
//     bytes via `git cat-file`.

import type { GitOid, GitTreeEntry, RepoPath, TreeMode } from "./types.ts";
import { GitAdapterError, PathSafetyError } from "./types.ts";

// Re-export typed errors so callers can import everything from this module.
export { GitAdapterError, GitBlobMissingError, PathSafetyError } from "./types.ts";

export interface RawGitAdapter {
  readonly cwd: string;
  spawnGit(args: readonly string[]): Buffer;
  /**
   * Spawn git with binary stdin. REQUIRED — used by `git cat-file --batch`
   * to read many blobs in a single subprocess (parent defect #12), and
   * by `git cat-file --batch-check` for structured existence probing
   * (parent blocker round 3 #3). Adapters that cannot feed stdin MUST
   * throw; the reader no longer falls back to `cat-file -e` because that
   * fallback silently downgrades every infrastructure error to "missing".
   */
  spawnGitWithInput(args: readonly string[], input: Buffer): Buffer;
}

// ---------------------------------------------------------------------------
// Production adapter
// ---------------------------------------------------------------------------

import { execFileSync } from "child_process";

export function makeProductionAdapter(repoRoot: RepoPath): RawGitAdapter {
  return {
    cwd: repoRoot,
    spawnGit(args: readonly string[]): Buffer {
      try {
        return execFileSync("git", [...args], {
          cwd: repoRoot,
          maxBuffer: 256 * 1024 * 1024,
          encoding: "buffer",
        }) as Buffer;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new GitAdapterError(`git ${args[0] ?? ""} failed: ${msg}`);
      }
    },
    spawnGitWithInput(args: readonly string[], input: Buffer): Buffer {
      try {
        return execFileSync("git", [...args], {
          cwd: repoRoot,
          maxBuffer: 256 * 1024 * 1024,
          encoding: "buffer",
          input,
        }) as Buffer;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new GitAdapterError(`git ${args[0] ?? ""} failed: ${msg}`);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// ls-tree parsing
// ---------------------------------------------------------------------------

const REGULAR_MODES: readonly TreeMode[] = ["100644", "100755"];

/**
 * Parse a single `git ls-tree -z` line (without the trailing NUL).
 *
 * Throws PathSafetyError when mode is a symlink (120000), gitlink (160000),
 * tree (040000), or any other non-regular mode.
 * Throws PathSafetyError when object kind is `tree` or `commit` rather than blob.
 * Throws GitAdapterError only when the line itself is malformed (no tab, bad
 * header) — the line-shape problem is a git protocol error, not a path
 * safety issue.
 */
export function parseGitLsTreeLine(line: string): GitTreeEntry {
  const tabIdx = line.indexOf("\t");
  if (tabIdx < 0) {
    throw new GitAdapterError(`malformed ls-tree line (no tab): ${line}`);
  }
  const before = line.substring(0, tabIdx);
  const pathPart = line.substring(tabIdx + 1);
  const parts = before.split(" ");
  if (parts.length !== 3) {
    throw new GitAdapterError(`malformed ls-tree header: ${before}`);
  }
  const [modeRaw, kindRaw, oidRaw] = parts as [string, string, string];

  if (modeRaw === "120000") {
    throw new PathSafetyError("symlink", `symlink mode rejected for path ${pathPart}`);
  }
  if (modeRaw === "160000") {
    throw new PathSafetyError("gitlink", `gitlink mode rejected for path ${pathPart}`);
  }
  if (modeRaw === "040000") {
    throw new PathSafetyError("non-blob", `tree kind rejected for path ${pathPart}`);
  }
  if (!REGULAR_MODES.includes(modeRaw as TreeMode)) {
    throw new PathSafetyError(
      "unsupported-mode",
      `unsupported mode ${modeRaw} for path ${pathPart} (only 100644/100755 regular blobs allowed)`,
    );
  }
  if (kindRaw !== "blob") {
    throw new PathSafetyError(
      "non-blob",
      `non-blob kind ${kindRaw} rejected for path ${pathPart}`,
    );
  }
  if (!/^[0-9a-f]{40}$|^[0-9a-f]{64}$/.test(oidRaw)) {
    throw new GitAdapterError(`invalid blob oid ${oidRaw}`);
  }
  return {
    mode: modeRaw as TreeMode,
    object_kind: "blob",
    oid: oidRaw as GitOid,
    path: pathPart,
  };
}

/**
 * Parse the full NUL-separated `git ls-tree -r -z` output. Rejects duplicate
 * paths (collision attack). Path-safety errors surface the first offending
 * entry rather than silently dropping it.
 */
export function parseLsTreeOutput(output: string): readonly GitTreeEntry[] {
  const lines = output.split("\0").filter((l) => l.length > 0);
  const entries = lines.map(parseGitLsTreeLine);
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.path)) {
      throw new GitAdapterError(`duplicate path in ls-tree output: ${e.path}`);
    }
    seen.add(e.path);
  }
  return entries;
}

/**
 * List every regular blob under the given OID. Uses `git ls-tree -r -z` so
 * the listing is complete and deterministic. Refuses to execute candidate
 * code; this only reads tree state.
 */
export function listTreeEntries(
  adapter: RawGitAdapter,
  oid: GitOid,
  _label: string,
): readonly GitTreeEntry[] {
  const buf = adapter.spawnGit(["ls-tree", "-r", "-z", oid]);
  const output = buf.toString("utf-8");
  return parseLsTreeOutput(output);
}

// Back-compat re-exports. Per-blob and batched reads live in
// git-blob-batch.ts (split for the 250 pure LOC ceiling).
export { readBlob, readBlobsBatched } from "./git-blob-batch.ts";
export type { BatchedReadResult } from "./git-blob-batch.ts";
