// Path classification for the distribution boundary guard.
//
// Stage B regression (PR #2092): the pre-write gate must inspect write/edit/
// apply_patch operations whose target lands under src/opencode/{commands/agentdev,
// skills/agentdev-*|japanese-tech-writing}/**. The detector core is a pure
// string classifier; this module owns the boundary between raw tool args
// (which may be repo-relative, absolute under the project worktree, absolute
// outside the worktree, or contain traversal segments) and the regex-based
// distributed-path predicate.
//
// Three-valued classification keeps the gate fail-closed (the distribution
// boundary DEC, decision 5):
//   - "distributed"     -> apply the detector
//   - "non-distributed" -> gate passes (no inspection needed)
//   - "outside-root"    -> gate fails closed (inspection error)
//
// Pure: no fs/path/I/O imports; same input => same output.

// Distributed text artifact paths. Matches either src/opencode/... source
// projection (the only path the pre-write gate needs to defend; consumer-side
// link/archive projections are checked by the final gate / release pipeline).
// Case-insensitive: Windows filesystem is case-insensitive at runtime.
export const DISTRIBUTED_PATH_RE =
  /^src\/opencode\/commands\/agentdev\/|^src\/opencode\/skills\/(?:agentdev-[^\/]+|japanese-tech-writing)\//i;

export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

export type PathClass = "distributed" | "non-distributed" | "outside-root";

/**
 * True when the path is absolute on either POSIX (`/`) or Windows
 * (`C:/`, `C:\`). Drive letters are matched case-insensitively.
 */
function isAbsolute(normalizedPath: string): boolean {
  if (normalizedPath.startsWith("/")) return true;
  return /^[A-Za-z]:[\\/]/.test(normalizedPath);
}

/**
 * Walk the relative-path segments, resolving `.` / `..` / empty segments
 * into a canonical relative path. Returns `{ ok: false }` when any `..`
 * would escape above the root (depth goes negative). Otherwise returns the
 * resolved slash-joined path (which may be the empty string for the root
 * itself).
 *
 * Resolution (not just depth-counting) is necessary so a path like
 * `src/opencode/commands/agentdev/../../../etc/passwd` is recognised as the
 * non-distributed `src/etc/passwd` rather than matching the literal
 * `src/opencode/commands/agentdev/` prefix of the distributed-path regex.
 */
function resolveSegments(relPath: string): { ok: true; resolved: string } | { ok: false } {
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

function hasDriveLetter(normalizedPath: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(normalizedPath);
}

/**
 * Case-insensitive equality when at least one side carries a Windows drive
 * letter (the Windows filesystem is case-insensitive). Case-sensitive
 * equality for POSIX paths.
 */
function pathsEqual(a: string, b: string): boolean {
  if (hasDriveLetter(a) || hasDriveLetter(b)) {
    return a.toLowerCase() === b.toLowerCase();
  }
  return a === b;
}

/**
 * True when `prefix + "/"` is a parent of `path` (or `prefix === path`).
 * Drive-letter-aware: case-insensitive on Windows-style paths.
 */
function isUnderRoot(prefix: string, path: string): boolean {
  if (pathsEqual(prefix, path)) return true;
  const slashPrefix = prefix.endsWith("/") ? prefix : prefix + "/";
  if (hasDriveLetter(prefix) || hasDriveLetter(path)) {
    return path.toLowerCase().startsWith(slashPrefix.toLowerCase());
  }
  return path.startsWith(slashPrefix);
}

/**
 * Slice `path` to remove the `prefix + "/"` portion. Drive-letter-aware so
 * the slice offset is computed from the case-insensitive match.
 */
function sliceAfterRoot(prefix: string, path: string): string {
  const slashPrefix = prefix.endsWith("/") ? prefix : prefix + "/";
  if (hasDriveLetter(prefix) || hasDriveLetter(path)) {
    return path.slice(slashPrefix.length);
  }
  return path.slice(slashPrefix.length);
}

/**
 * Resolve `rawPath` (as observed in tool args) against `projectRoot` (the
 * active worktree root) into one of three PathClass values.
 *
 * - Absolute path: must equal projectRoot or live beneath it; otherwise
 *   classified as "outside-root". Traversal escape is impossible for an
 *   absolute path under root because the prefix check rejects any sibling.
 * - Relative path: traversal that would escape root (`../../etc/passwd`) is
 *   classified as "outside-root".
 *
 * `projectRoot` may be empty/null when the plugin cannot determine the
 * worktree (e.g. legacy test shims that pre-date the input.worktree field).
 * In that case absolute paths are treated as "outside-root" (fail closed)
 * and relative paths are classified by the distributed-path regex alone.
 *
 * Segment resolution runs before the distributed-path regex so a path like
 * `src/opencode/commands/agentdev/../../../etc/passwd` is recognised as the
 * resolved `src/etc/passwd` (non-distributed) rather than the literal prefix.
 */
export function classifyPath(rawPath: string, projectRoot: string | null | undefined): PathClass {
  const normalized = normalizePath(rawPath);
  const root = projectRoot !== null && projectRoot !== undefined && projectRoot.length > 0
    ? normalizePath(projectRoot).replace(/\/$/, "")
    : "";

  if (isAbsolute(normalized)) {
    if (root.length === 0) return "outside-root";
    if (!isUnderRoot(root, normalized)) return "outside-root";
    const rel = sliceAfterRoot(root, normalized);
    const r = resolveSegments(rel);
    if (!r.ok) return "outside-root";
    return DISTRIBUTED_PATH_RE.test(r.resolved) ? "distributed" : "non-distributed";
  }

  const r = resolveSegments(normalized);
  if (!r.ok) return "outside-root";
  return DISTRIBUTED_PATH_RE.test(r.resolved) ? "distributed" : "non-distributed";
}

/**
 * Default classifier used by legacy `evaluateWriteContent` / `evaluateEdit` /
 * `evaluateApplyPatch` shims that have no project root. Treats absolute paths
 * as "outside-root" (fail closed) since the worktree is unknown.
 */
export function classifyPathNoRoot(rawPath: string): PathClass {
  return classifyPath(rawPath, null);
}

/**
 * Boolean form for callers/tests that only need the distributed predicate.
 * Equivalent to `classifyPathNoRoot(p) === "distributed"` but slightly
 * cheaper when the caller does not care about the outside-root distinction.
 */
export function isDistributedPath(filePath: string): boolean {
  return classifyPathNoRoot(filePath) === "distributed";
}
