// Authority-aware URL extractor for the distribution boundary detector.
//
// Extracted from boundary-candidate-model.ts to keep that module under the
// 250 pure LOC ceiling. One responsibility: turn a line into URL candidate
// spans whose host is exactly `github.com` or `raw.githubusercontent.com`.
//
// Authority classification (host/port/backslash malformedness) lives in
// boundary-url-authority.ts. This module owns the line scan and candidate
// emission:
//   - HOST_SCAN finds a recognized host followed by `/` (path) or `:`
//     (port), so default-port URLs (`https://github.com:443/...`) are seen.
//   - For each hit, scanAuthorityForward advances a single forward cursor
//     from the previous hit up to `hostStart`, carrying scheme and
//     backslash evidence. Total scan cost is O(line.length) regardless of
//     how many host hits land on the line. A backslash in the authority
//     is always malformed: it makes the host position ambiguous and the
//     URL cannot own/hide contained producer references.
//   - Port validation: only the scheme default port is accepted (443 for
//     https, 80 for http). Any other port, or any port on a scheme-less
//     URL, is malformed. A malformed authority NEVER silently passes: it
//     is emitted as a separate candidate whose ownership span covers only
//     the authority region, so contained path references stay independently
//     visible, and resolveCandidate classifies it as evasion-attempt.
//
// `steps` counts the per-character work performed by the scanner (forward
// authority scan + URL-end walk), exposing a linear-complexity contract:
// callers can assert `steps <= K * line.length + C`.
//
// Side-effect-free: pure over inputs.

import type { Span } from "./boundary-candidate-ownership.ts";
import {
  canonicalizeHostEvasion,
  classifyAuthority,
  findAuthorityEnd,
  INITIAL_AUTHORITY_SCAN_CURSOR,
  scanAuthorityForward,
  type AuthorityScanCursor,
  type RecognizedHost,
} from "./boundary-url-authority.ts";

const OWNER_PATTERN = /^[A-Za-z0-9_-]+$/;
const REPO_PATTERN = /^[A-Za-z0-9_.-]+$/;

/** Scan pattern: case-insensitive recognized host followed by `/`, `:`,
 *  or `\`. The backslash terminator catches `github.com\@evil.com/...`
 *  and `github.com\evil.com/...` — both make the host position ambiguous
 *  (a backslash is path-like in Win32 but illegal in a URL host) and are
 *  emitted as malformed rather than skipped (blocker #1, P0). */
const HOST_SCAN = /(?:github\.com|raw\.githubusercontent\.com)(?=[/:\\])/gi;

/** Evasion host scan: bounded run of host-like chars (including percent-encoded
 *  and Unicode dots) followed by `/`, `:`, or `\`. Bounded to 80 to prevent
 *  O(n²) backtracking on adversarial long runs; longest recognized host fully
 *  percent-encoded is 72 chars. Post-filtered by canonicalization. The
 *  backslash terminator mirrors HOST_SCAN so percent-encoded / Unicode-dot
 *  hosts followed by a backslash are also caught. The Unicode-dot class
 *  covers U+3002, U+FF0E, and U+FF61; canonicalizeHostEvasion collapses all
 *  three to ASCII `.`. */
const EVASION_HOST_TOKEN = /(?:%[0-9A-Fa-f]{2}|[A-Za-z0-9.\u3002\uFF0E\uFF61-]){1,80}(?=[/:\\])/g;

/** URL end exclusion set: terminates URL ownership at boundary markers.
 * Backslash is NOT here (it sets pathHasBackslash and extends the URL, marking
 * it malformed). Em dash U+2014 terminates so trailing IDs stay visible.
 * ASCII `:` is conditional (handled in the forward scan): it terminates
 * only in the path component, not in the authority (`:port`) or inside
 * a query (`?...`) / fragment (`#...`). */
const URL_STOP_CHAR = /[\s()\[\]|"'`<>{},;\u3001\u3002\uFF1B\uFF0C\uFF01\uFF1F\uFF1A\u2014]/;

/** Preceding char rejects the left boundary (host/path/query continuation). */
const LEFT_REJECT_CHAR = /[A-Za-z0-9._@:?#&=\\/-]/;

/**
 * Extract `owner/repo` from a URL value whose authority is a VALID recognized
 * GitHub authority (default port accepted; malformed port or backslash
 * authority returns null). Path-lookalike and userinfo-deception URLs return
 * null because their host is not a recognized GitHub authority.
 *
 * Calls `classifyAuthority` directly (not `parseUrlHost`) so the host is
 * typed as `RecognizedHost` and the host branch below is exhaustive:
 * adding a new recognized host without updating this function is a
 * compile error via `assertNeverRecognizedHost` (blocker #10).
 */
export function extractOwnerRepo(url: string): string | null {
  const cls = classifyAuthority(url);
  if (cls.kind !== "valid") return null;
  const host: RecognizedHost = cls.host;
  const schemeMatch = /^https?:\/\//i.exec(url);
  const afterScheme = schemeMatch ? url.substring(schemeMatch[0].length) : url;
  const slashIdx = afterScheme.indexOf("/");
  if (slashIdx === -1) return null;
  const segments = afterScheme.substring(slashIdx + 1).split("/");
  const owner = segments[0];
  const repo = segments[1];
  if (owner === undefined || repo === undefined) return null;
  if (!OWNER_PATTERN.test(owner) || !REPO_PATTERN.test(repo)) return null;
  if (host === "github.com") {
    const action = segments[2];
    const tail = segments[3];
    if ((action !== "blob" && action !== "raw") || tail === undefined || tail.length === 0) return null;
  } else if (host === "raw.githubusercontent.com") {
    const tail = segments[2];
    if (tail === undefined || tail.length === 0) return null;
  } else {
    assertNeverRecognizedHost(host);
  }
  return `${owner}/${repo}`;
}

/** Exhaustiveness guard for the RecognizedHost discriminated branch in
 *  extractOwnerRepo. If a new host is added to RecognizedHost without
 *  updating the branch above, the call here fails to typecheck because
 *  `host` is no longer narrowed to `never` at the call site. */
function assertNeverRecognizedHost(host: never): never {
  throw new Error(`unreachable: unrecognized host ${host}`);
}

/** True when the URL points into the producer's own repo (case-insensitive). */
export function isProducerOwnedUrl(url: string, identity: { readonly owner_slash_name: string }): boolean {
  if (identity.owner_slash_name.length === 0) return false;
  const ownerRepo = extractOwnerRepo(url);
  if (ownerRepo === null) return false;
  return ownerRepo.toLowerCase() === identity.owner_slash_name.toLowerCase();
}

export interface ExtractedUrl {
  readonly value: string;
  readonly span: Span;
  /** True when the authority is malformed (backslash / bad port). The span
   * covers ONLY the authority region so contained path references stay
   * independently visible; resolveCandidate classifies it evasion-attempt. */
  readonly malformed: boolean;
/** Suppression scope. For a valid URL: from the first path slash after the
 * authority (authorityEnd) to the first `?` or `#` (path-only). The start
 * is the path slash, not the URL start, so producer-internal IDs in the
 * scheme/userinfo (`https://ADR-0001@github.com/...`) are NOT inside the
 * ownership span and stay independently visible (blocker #8). When the URL
 * has no path (no slash after the authority), this is `null` (no path to
 * own). For a malformed URL: `null` (malformed URLs never own/suppress
 * contained references). The full `span` remains the classification
 * evidence; `ownershipSpan` is the only range that suppresses
 * lower-precedence candidates. */
readonly ownershipSpan: Span | null;
}

/**
 * Scan a line for URL candidates whose host is a recognized GitHub
 * authority. Returns at most `cap` entries; `overflow` is set when the cap
 * is reached mid-scan (ownership never suppresses overflow).
 *
 * For each host hit, scanAuthorityForward advances a single forward cursor
 * from the previous hit up to `hostStart`, carrying scheme and backslash
 * evidence. A backslash in the authority => malformed. A valid scheme URL
 * with a non-default port => malformed. A scheme-less URL with any port
 * => malformed. Malformed candidates' spans cover ONLY the authority
 * region so path references stay independently visible; valid URLs span
 * the full URL (scheme through stop char) and own their path.
 *
 * `steps` counts per-character scanner operations (forward authority scan
 * + URL-end walk). It is bounded by a linear function of `line.length`.
 */
export function extractUrls(line: string, cap: number): {
  readonly urls: readonly ExtractedUrl[];
  readonly overflow: boolean;
  readonly steps: number;
} {
  const out: ExtractedUrl[] = [];
  let cursor: AuthorityScanCursor = INITIAL_AUTHORITY_SCAN_CURSOR;
  let steps = 0;
  HOST_SCAN.lastIndex = 0;
  for (let m: RegExpExecArray | null; (m = HOST_SCAN.exec(line)) !== null;) {
    const hostStart = m.index;
    const hostEnd = hostStart + m[0].length;
    const fwd = scanAuthorityForward(line, hostStart, cursor);
    cursor = fwd.cursor;
    steps += fwd.steps;
    const scan = fwd.scan;
    let urlEnd = hostEnd;
    let inPath = false;
    let inQueryOrFrag = false;
    let firstQueryOrFrag = -1;
    let pathHasBackslash = false;
    while (urlEnd < line.length) {
      steps++;
      const c = line.charAt(urlEnd);
      if (URL_STOP_CHAR.test(c)) break;
      if (c === "\\") { pathHasBackslash = true; urlEnd++; continue; }
      if (c === "?" || c === "#") {
        if (firstQueryOrFrag === -1) firstQueryOrFrag = urlEnd;
        inQueryOrFrag = true;
      } else if (c === "/") { if (!inQueryOrFrag) inPath = true; }
      else if (c === ":" && inPath && !inQueryOrFrag) break;
      urlEnd++;
    }
    const authorityEnd = findAuthorityEnd(line, hostEnd, urlEnd);
    // Linear-scan guarantee (blocker #7): advance HOST_SCAN past the URL
    // value just scanned, so subsequent `github.com/` hits inside the SAME
    // URL value do not each trigger a fresh urlEnd walk (quadratic on
    // `"github.com/".repeat(1000)`). When the URL has a `?` or `#`, resume
    // just after it so nested URLs in the query/fragment are still found.
    // Placed before any branch so every continue inherits the advancement.
    const scanResume = firstQueryOrFrag !== -1 ? firstQueryOrFrag + 1 : urlEnd;
    if (scanResume > HOST_SCAN.lastIndex) HOST_SCAN.lastIndex = scanResume;
    if (scan.hasBackslash) {
      const aStart = scan.schemeStart !== -1 ? scan.schemeStart : scan.authorityLeft;
      if (out.length >= cap) return { urls: out, overflow: true, steps };
      out.push({ value: line.substring(aStart, authorityEnd), span: { start: aStart, end: authorityEnd }, malformed: true, ownershipSpan: null });
      continue;
    }
    if (scan.rejectedSchemeStart !== -1) {
      if (out.length >= cap) return { urls: out, overflow: true, steps };
      out.push({ value: line.substring(scan.rejectedSchemeStart, urlEnd), span: { start: scan.rejectedSchemeStart, end: urlEnd }, malformed: true, ownershipSpan: null });
      continue;
    }
    const urlStart = scan.schemeStart !== -1 ? scan.schemeStart : hostStart;
    const hasScheme = scan.schemeStart !== -1;
    // Scheme-less URL with userinfo before the host (e.g. `user@github.com:443/...`):
    // extend urlStart back to authorityLeft so the URL value carries the
    // userinfo+port into classifyAuthority, where the scheme-less port fires
    // the malformed branch (blocker #9). Without this, `@` in LEFT_REJECT_CHAR
    // silently rejected the host at the left boundary and the URL vanished.
    // The deception form `github.com@evil.com/...` is unaffected: HOST_SCAN's
    // lookahead requires `/`, `:`, or `\` after the host, so `github.com@`
    // never matches and no candidate is emitted for it.
    const effectiveUrlStart = !hasScheme && scan.authorityLeft < hostStart && line.substring(scan.authorityLeft, hostStart).includes("@")
      ? scan.authorityLeft
      : urlStart;
    if (!isValidLeftBoundary(line, effectiveUrlStart, hasScheme)) continue;
    const value = line.substring(effectiveUrlStart, urlEnd);
    const cls = classifyAuthority(value);
    // Malformed check fires BEFORE the rejected short-circuit: a backslash
    // in the path makes the host position ambiguous even when classifyAuthority
    // returns rejected (e.g. `https://github.com\@evil.com/...` classifies as
    // rejected because the post-`@` host is evil.com, but the backslash still
    // makes the URL malformed and the gate must fail). Reordering closes the
    // P0 fail-open hole where the rejected branch hid the path backslash.
    if (pathHasBackslash || cls.kind === "malformed" || hasDotSegment(value)) {
      const mEnd = cls.kind === "malformed" ? authorityEnd : urlEnd;
      if (out.length >= cap) return { urls: out, overflow: true, steps };
      out.push({ value: line.substring(effectiveUrlStart, mEnd), span: { start: effectiveUrlStart, end: mEnd }, malformed: true, ownershipSpan: null });
      continue;
    }
    if (cls.kind === "rejected") continue;
    if (extractOwnerRepo(value) === null) continue;
    if (out.length >= cap) return { urls: out, overflow: true, steps };
    out.push({ value, span: { start: effectiveUrlStart, end: urlEnd }, malformed: false, ownershipSpan: ownershipSpanFor(authorityEnd, urlEnd, firstQueryOrFrag) });
  }
  EVASION_HOST_TOKEN.lastIndex = 0;
  for (let em: RegExpExecArray | null; (em = EVASION_HOST_TOKEN.exec(line)) !== null;) {
    const raw = em[0];
    const lower = raw.toLowerCase();
    if (lower === "github.com" || lower === "raw.githubusercontent.com") continue;
    const canonical = canonicalizeHostEvasion(raw);
    if (canonical !== "github.com" && canonical !== "raw.githubusercontent.com") continue;
    const ts = em.index;
    // Blocker #6: dedup against ownershipSpan (path-only), not the full URL
    // span. An evasion host placed in an external URL's query sits inside
    // the outer URL's full `span` but OUTSIDE its `ownershipSpan` (which
    // ends at the first `?`/`#`), so it must be emitted independently.
    if (out.some((u) => u.ownershipSpan !== null && u.ownershipSpan.start <= ts && ts < u.ownershipSpan.end)) continue;
    if (out.length >= cap) return { urls: out, overflow: true, steps };
    let ue = ts + raw.length;
    let evasionFirstQueryOrFrag = -1;
    while (ue < line.length) {
      steps++;
      const ch = line.charAt(ue);
      if (URL_STOP_CHAR.test(ch) || ch === "\\") break;
      if ((ch === "?" || ch === "#") && evasionFirstQueryOrFrag === -1) evasionFirstQueryOrFrag = ue;
      ue++;
    }
    out.push({ value: line.substring(ts, ue), span: { start: ts, end: ue }, malformed: true, ownershipSpan: null });
    // Same linear-scan guarantee as HOST_SCAN (blocker #7).
    const evasionResume = evasionFirstQueryOrFrag !== -1 ? evasionFirstQueryOrFrag + 1 : ue;
    if (evasionResume > EVASION_HOST_TOKEN.lastIndex) EVASION_HOST_TOKEN.lastIndex = evasionResume;
  }
  return { urls: out, overflow: false, steps };
}

/** Ownership span starts at `authorityEnd` (the first path slash after the
 *  host) and ends at the first `?` or `#` within `[authorityEnd, end)`.
 *  Returns null when there is no path region to own (authorityEnd >= end,
 *  or a `?`/`#` precedes the path slash). */
function ownershipSpanFor(authorityEnd: number, end: number, firstQueryOrFrag: number): Span | null {
  if (authorityEnd >= end) return null;
  if (firstQueryOrFrag === -1) return { start: authorityEnd, end };
  if (firstQueryOrFrag <= authorityEnd) return null;
  return { start: authorityEnd, end: firstQueryOrFrag };
}

function isValidLeftBoundary(line: string, pos: number, hasScheme: boolean): boolean {
  if (pos === 0) return true;
  const prev = line.charAt(pos - 1);
  // Scheme URLs are unambiguous; accept `=` (query-param value) and `&`
  // (param separator) so a URL nested in a parent URL's query is detected.
  if (hasScheme && (prev === "=" || prev === "&")) return true;
  return !LEFT_REJECT_CHAR.test(prev);
}

/** True when the URL path contains a dot-segment in the owner/repo/tail
 *  position. RFC 3986 reserves `.` and `..` for relative-path resolution;
 *  they never appear in a concrete GitHub URL. Each segment is normalized
 *  by case-insensitively replacing `%2e` with `.` first, so mixed
 *  literal+encoded forms (`.%2e`, `%2e.`) collapse to `..` and are caught
 *  alongside the pure literal (`..`) and pure-encoded (`%2e%2e`) forms. */
function hasDotSegment(url: string): boolean {
  const m = /^([A-Za-z][A-Za-z0-9.+-]*:\/\/)?[^/]+\//.exec(url);
  if (!m) return false;
  for (const seg of url.substring(m[0].length).split("/")) {
    const norm = seg.replace(/%2e/gi, ".");
    if (norm === "." || norm === "..") return true;
  }
  return false;
}
