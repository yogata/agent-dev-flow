// Candidate ownership: span-based suppression that resolves which candidate
// "owns" a given source region. Extracted from boundary-pipeline.ts to keep
// that module under the 250 pure LOC ceiling (parent defect #12) and to make
// the ownership contract independently testable.
//
// Ownership order (highest precedence wins):
//   URL > path > reconstructed > direct
//
// Rules (UTF-16 half-open [start, end) spans):
//   - A URL suppresses every path/reconstructed/direct candidate whose span
//     is FULLY CONTAINED in the URL span. The URL is classified by its owner
//     alone; embedded IDs/paths are represented by the URL, not double-counted.
//   - A path suppresses every reconstructed/direct candidate whose span is
//     fully contained in the path span.
//   - A reconstructed candidate suppresses every direct candidate whose span
//     OVERLAPS it (conflicting overlap: reconstructed wins; same value is a
//     dedup with the same outcome — the direct is dropped).
//
// Side-effect-free: pure over the input entries.

/** UTF-16 half-open source span [start, end). */
export interface Span {
  readonly start: number;
  readonly end: number;
}

export type CandidatePrecedence = "url" | "path" | "reconstructed" | "direct";

/**
 * Minimal ownership projection of a candidate. The pipeline maps each
 * spanned candidate to this shape so this module has no dependency on the
 * Candidate union (keeps the import graph acyclic: types -> reconstruction ->
 * ownership -> pipeline -> gate -> runner).
 *
 * `span` is the classification-evidence span (used for the
 * reconstructed-over-direct overlap rule and for the precedence sort).
 * `ownershipSpan` is the suppression range used by keepers to contain
 * lower-precedence entries: `null` means the keeper suppresses nothing
 * (e.g. malformed URLs); when omitted, defaults to `span` for non-URL
 * keepers (path/reconstructed).
 */
export interface OwnershipEntry {
  readonly span: Span;
  readonly ownershipSpan: Span | null;
  readonly precedence: CandidatePrecedence;
}

const PRECEDENCE_RANK: Record<CandidatePrecedence, number> = {
  url: 0,
  path: 1,
  reconstructed: 2,
  direct: 3,
};

/** True when `outer` fully contains `inner` (inclusive bounds). */
function contains(outer: Span, inner: Span): boolean {
  return outer.start <= inner.start && inner.end <= outer.end;
}

/** True when the two half-open spans share at least one position. */
function overlaps(a: Span, b: Span): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Compute a keep-mask aligned with the input order. Entry `i` survives when
 * `mask[i]` is true. Entries are evaluated in precedence order (url first);
 * among equal precedence, input order is preserved (stable).
 *
 * Keeper containment uses `ownershipSpan`: a URL keeper with `ownershipSpan
 * === null` (malformed) suppresses nothing; a URL keeper with a path-only
 * `ownershipSpan` suppresses only entries whose `span` lies fully inside
 * that path region. The reconstructed-over-direct rule still uses the
 * reconstructed keeper's `span` (its evidence span).
 */
export function ownershipMask(entries: readonly OwnershipEntry[]): boolean[] {
  const order = entries
    .map((entry, idx) => ({ entry, idx }))
    .sort((a, b) => {
      const ra = PRECEDENCE_RANK[a.entry.precedence];
      const rb = PRECEDENCE_RANK[b.entry.precedence];
      return ra !== rb ? ra - rb : a.idx - b.idx;
    });

  const keepers: Array<{ suppressSpan: Span | null; overlapSpan: Span; precedence: CandidatePrecedence }> = [];
  const mask = new Array<boolean>(entries.length).fill(false);

  for (const { entry, idx } of order) {
    let suppressed = false;
    for (const k of keepers) {
      if (entry.precedence === "direct" && k.precedence === "reconstructed") {
        if (overlaps(k.overlapSpan, entry.span)) { suppressed = true; break; }
      } else if (k.suppressSpan !== null && contains(k.suppressSpan, entry.span)) {
        suppressed = true;
        break;
      }
    }
    if (!suppressed) {
      mask[idx] = true;
      keepers.push({ suppressSpan: entry.ownershipSpan, overlapSpan: entry.span, precedence: entry.precedence });
    }
  }
  return mask;
}
