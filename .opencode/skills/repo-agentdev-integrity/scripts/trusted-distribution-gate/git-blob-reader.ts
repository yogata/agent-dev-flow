// Git blob reader adapter.
//
// This is the ONLY module in the trust root that performs I/O. It spawns
// `git ls-tree` and `git cat-file` against a fixed candidate OID. The
// boundary detector (boundary-pipeline.ts) is side-effect-free and consumes
// bytes this adapter returns.
//
// Safety contract:
//   - Modes other than `100644` and `100755` are rejected (no symlinks
//     `120000`, no gitlinks `160000`, no trees `040000`).
//   - Object kind must be `blob`. `tree` and `commit` are rejected.
//   - Duplicate paths in the listing are rejected.
//   - The adapter NEVER imports or executes candidate code. It only reads
//     bytes via `git cat-file`.

import type { GitOid, GitTreeEntry, RepoPath, TreeMode } from "./types.ts";

// ---------------------------------------------------------------------------
// Adapter interface (seam for testing)
// ---------------------------------------------------------------------------

export interface RawGitAdapter {
  readonly cwd: string;
  spawnGit(args: readonly string[]): Buffer;
}

export class GitAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitAdapterError";
  }
}

// ---------------------------------------------------------------------------
// Production adapter
// ---------------------------------------------------------------------------

import { execFileSync } from "child_process";

export function makeProductionAdapter(repoRoot: RepoPath): RawGitAdapter {
  return {
    cwd: repoRoot,
    spawnGit(args: readonly string[]): Buffer {
      // Pass args as an array (parent defect #2). execFileSync does NOT
      // spawn a shell, so interpolated paths/args cannot inject commands.
      try {
        return execFileSync("git", [...args], {
          cwd: repoRoot,
          maxBuffer: 256 * 1024 * 1024,
          // We treat non-zero exit as an error and surface GitAdapterError
          // so callers can react to "path does not exist" distinctly from
          // real I/O failures (see protected-check.ts).
          encoding: "buffer",
        }) as Buffer;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new GitAdapterError(`git ${args[0]} failed: ${msg}`);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// ls-tree parsing
// ---------------------------------------------------------------------------

const VALID_MODES: readonly TreeMode[] = ["100644", "100755"];

/**
 * Parse a single `git ls-tree -z` line (without the trailing NUL).
 *
 * Throws GitAdapterError when:
 *   - mode is not 100644 or 100755 (rejects symlinks/gitlinks/trees)
 *   - object kind is not `blob` (rejects `tree` and `commit`)
 *   - line is malformed (no tab, wrong field count)
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
  if (!VALID_MODES.includes(modeRaw as TreeMode)) {
    throw new GitAdapterError(
      `rejected ls-tree mode ${modeRaw} for path ${pathPart} (only regular blobs allowed)`,
    );
  }
  if (kindRaw !== "blob") {
    throw new GitAdapterError(
      `rejected ls-tree kind ${kindRaw} for path ${pathPart} (only blob allowed)`,
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
 * paths (collision attack).
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

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

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

/**
 * Read a single blob's bytes via `git cat-file blob <oid>:<path>`. The path
 * is the repo-relative path as observed in ls-tree; no globbing.
 */
export function readBlob(
  adapter: RawGitAdapter,
  oid: GitOid,
  _label: string,
  filePath: string,
): Uint8Array {
  const buf = adapter.spawnGit(["cat-file", "blob", `${oid}:${filePath}`]);
  // Copy into a fresh Uint8Array to avoid Buffer's Node-specific view.
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}
