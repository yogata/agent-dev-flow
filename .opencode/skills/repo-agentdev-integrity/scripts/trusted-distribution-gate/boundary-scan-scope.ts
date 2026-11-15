// Boundary scan-target scope: 検査対象の除外領域.
//
// Mirrors the exclusion canon owned by the distribution boundary Design
// (docs/designs/integrity/distribution-boundary.md「配布テキスト成果物の
// 対象モデル」検査対象の除外領域):
//   - 共通原本側 tests/ 配下 (detection-stimulus sample strings in tests)
//   - tools/<name>/local/ 配下 (Local implementation region excluded from
//     consumer sync/install distribution)
// are NOT distribution text artifacts for the boundary detector and are
// excluded from the boundary scan target in every projection.
//
// The exclusion applies ONLY to the boundary scan target. Manifest
// membership is unaffected: tests and local/ entries stay in the audit
// expectation manifests (manifest.ts keeps "none excluded" semantics).
//
// Side-effect-free: pure path predicate, no I/O.

/**
 * Decide whether a candidate-tree source path is a boundary scan target.
 * Returns false for paths inside the Design-owned exclusion regions:
 *   - any `tests` path segment under src/common/
 *   - `src/common/tools/<name>/local/...`
 * Backslashes are normalized to forward slashes first (Windows tolerance).
 */
export function isBoundaryScanTarget(sourcePath: string): boolean {
  const norm = sourcePath.replace(/\\/g, "/");
  const seg = norm.split("/");
  if (seg[0] !== "src" || seg[1] !== "common") return true;
  if (seg.includes("tests")) return false;
  if (seg.length > 4 && seg[2] === "tools" && seg[4] === "local") return false;
  return true;
}

// Repo-local plugin originals stay in the SOURCE projection (producer-side
// audit of the canonical tree) but are excluded from every consumer
// distribution projection (link / archive / archive-installed): the canon
// forbids placing them in consumer environments, so they can never appear in
// those projections' scan targets either. Kept as an independent scan-scope
// list, consistent with the manifest audit expectation's I-004 reservation.
const REPO_LOCAL_PLUGIN_PREFIXES: readonly string[] = [
  "src/opencode/plugins/agentdev-distribution-boundary-guard/",
];

/**
 * Decide whether a runtime source path is scanned in the consumer
 * distribution projections (link / archive / archive-installed). Returns
 * false for repo-local plugin originals (not distributed to consumers).
 */
export function isConsumerProjectionScanTarget(sourcePath: string): boolean {
  const norm = sourcePath.replace(/\\/g, "/");
  return !REPO_LOCAL_PLUGIN_PREFIXES.some((p) => norm.startsWith(p));
}
