// Candidate ownership: span-based suppression that resolves which candidate
// "owns" a given source region. Extracted from boundary-pipeline.ts to keep
// that module under the 250 pure LOC ceiling (parent defect #12) and to make
// the ownership contract independently testable.
//
// Ownership order (highest precedence wins):
//   URL > path > direct
//
// Rules (UTF-16 half-open [start, end) spans):
//   - A URL suppresses every path/direct candidate whose span is FULLY
//     CONTAINED in the URL span. The URL is classified by its owner alone;
//     embedded IDs/paths are represented by the URL, not double-counted.
//   - A path suppresses every direct candidate whose span is fully contained
//     in the path span.
//
// Side-effect-free: pure over the input entries.

/** UTF-16 half-open source span [start, end). */
export interface Span {
  readonly start: number;
  readonly end: number;
}

export type CandidatePrecedence = "url" | "path" | "direct";

/**
 * Minimal ownership projection of a candidate. The pipeline maps each
 * spanned candidate to this shape so this module has no dependency on the
 * Candidate union (keeps the import graph acyclic: types -> ownership ->
 * pipeline -> gate -> runner).
 *
 * `span` is the classification-evidence span. `ownershipSpan` is the
 * suppression range used by keepers to contain lower-precedence entries:
 * `null` means the keeper suppresses nothing; when omitted, defaults to
 * `span` for non-URL keepers (path).
 */
export interface OwnershipEntry {
  readonly span: Span;
  readonly ownershipSpan: Span | null;
  readonly precedence: CandidatePrecedence;
}

const PRECEDENCE_RANK: Record<CandidatePrecedence, number> = {
  url: 0,
  path: 1,
  direct: 3,
};

/** True when `outer` fully contains `inner` (inclusive bounds). */
function contains(outer: Span, inner: Span): boolean {
  return outer.start <= inner.start && inner.end <= outer.end;
}

/**
 * Compute a keep-mask aligned with the input order. Entry `i` survives when
 * `mask[i]` is true. Entries are evaluated in precedence order (url first);
 * among equal precedence, input order is preserved (stable).
 *
 * Keeper containment uses `ownershipSpan`: a URL keeper with `ownershipSpan
 * === null` suppresses nothing; a URL keeper with a path-only
 * `ownershipSpan` suppresses only entries whose `span` lies fully inside
 * that path region.
 */
export function ownershipMask(entries: readonly OwnershipEntry[]): boolean[] {
  const order = entries
    .map((entry, idx) => ({ entry, idx }))
    .sort((a, b) => {
      const ra = PRECEDENCE_RANK[a.entry.precedence];
      const rb = PRECEDENCE_RANK[b.entry.precedence];
      return ra !== rb ? ra - rb : a.idx - b.idx;
    });

  const keepers: Array<{ suppressSpan: Span | null; precedence: CandidatePrecedence }> = [];
  const mask = new Array<boolean>(entries.length).fill(false);

  for (const { entry, idx } of order) {
    let suppressed = false;
    for (const k of keepers) {
      if (k.suppressSpan !== null && contains(k.suppressSpan, entry.span)) {
        suppressed = true;
        break;
      }
    }
    if (!suppressed) {
      mask[idx] = true;
      keepers.push({ suppressSpan: entry.ownershipSpan, precedence: entry.precedence });
    }
  }
  return mask;
}
