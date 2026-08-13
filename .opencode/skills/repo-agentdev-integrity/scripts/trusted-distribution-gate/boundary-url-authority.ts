// Authority classification for the boundary URL extractor.
//
// Extracted from boundary-url-parser.ts to keep that module under the 250
// pure LOC ceiling. One responsibility: classify a URL value's authority
// as valid / malformed / rejected, and expose the forward authority scan
// used to locate the scheme and detect backslash malformedness.
//
// Classification rules:
//   - valid:     recognized host, no port OR port equals the scheme default
//                (443 for https, 80 for http), no backslash in authority.
//   - malformed: recognized host but the authority contains a backslash, OR
//                a port is present that is not the scheme default (including
//                any port on a scheme-less URL — without a scheme the port
//                cannot be verified and the URL is treated as malformed).
//   - rejected:  host is not a recognized GitHub authority (lookalike,
//                userinfo-deception to a non-GitHub host, empty host, etc.).
//
// A malformed authority NEVER silently passes clean: the caller emits it as
// a separate candidate (resolveCandidate -> unclassified/evasion-attempt)
// whose ownership span covers only the authority region, so contained path
// references stay independently visible.
//
// Side-effect-free: pure over inputs.

/** Recognized GitHub authority hosts. The literal set is also the type
 *  narrow: consumers branch exhaustively on `host === "github.com"` /
 *  `"raw.githubusercontent.com"` with an `assertNever` final branch, so
 *  adding a host here is a compile-breaking change surfaced at every
 *  branch site (blocker #10: closes the silent implicit-else hole). */
const GITHUB_HOST = "github.com";
const RAW_HOST = "raw.githubusercontent.com";
export type RecognizedHost = "github.com" | "raw.githubusercontent.com";

/** Type guard: narrows `s` to RecognizedHost so the discriminated-union
 *  variants below carry a typed host rather than `string`. Replaces the
 *  prior `Set<string>.has` lookup, which left the host typed as `string`
 *  and let an unreachable third-host branch compile silently. */
function isRecognizedHost(s: string): s is RecognizedHost {
  return s === GITHUB_HOST || s === RAW_HOST;
}

/** Authority terminator: first of these ends the authority region. */
const AUTHORITY_TERMINATOR = /[/?#]/;

/** Port must be all decimal digits (non-digit port => malformed). */
const PORT_DIGITS = /^[0-9]+$/;

/** Characters allowed inside a URL authority (userinfo) region (RFC 3986
 *  unreserved + sub-delims + pct-encoded + `:` / `@`). Hyphen is included
 *  because it is RFC 3986 unreserved: without it, a userinfo like
 *  `ADR-0001` stops the backward authority scan at the `-` and the scheme
 *  `://` is never reached (blocker #8). */
const AUTHORITY_CHAR = /[A-Za-z0-9._~!$&'()*+,;=:@%-]/;

/** One character of an RFC 3986 scheme token: ALPHA / DIGIT / "+" / "-" / ".". */
const SCHEME_CHAR = /[A-Za-z0-9+\-.]/;

/** First character of a scheme must be ALPHA (RFC 3986). */
const ALPHA = /[A-Za-z]/;

export type AuthorityKind = "valid" | "malformed" | "rejected";

/** Discriminated by `kind`. The `valid` and `malformed` variants carry a
 *  typed `RecognizedHost` (the host is by definition recognized for those
 *  kinds); the `rejected` variant carries `null`. The narrow host type is
 *  what makes the implicit-else branch in extractOwnerRepo a compile
 *  error rather than a silent fallthrough (blocker #10). */
export type AuthorityClassification =
  | { readonly kind: "valid"; readonly host: RecognizedHost }
  | { readonly kind: "malformed"; readonly host: RecognizedHost }
  | { readonly kind: "rejected"; readonly host: null };

/** Default port for a scheme: 443 for https, 80 for http, null otherwise. */
function defaultPortForScheme(scheme: string | null): number | null {
  if (scheme === "https") return 443;
  if (scheme === "http") return 80;
  return null;
}

/**
 * Classify the authority of a URL value. The URL is the substring the scanner
 * considers a candidate (scheme prefix when present, forward to the URL stop
 * char). Classification is pure over this value.
 */
export function classifyAuthority(url: string): AuthorityClassification {
  const schemeMatch = /^https?:\/\//i.exec(url);
  const scheme = schemeMatch
    ? schemeMatch[0].substring(0, schemeMatch[0].length - 3).toLowerCase()
    : null;
  const afterScheme = schemeMatch ? url.substring(schemeMatch[0].length) : url;
  let authorityEnd = afterScheme.length;
  for (let i = 0; i < afterScheme.length; i++) {
    if (AUTHORITY_TERMINATOR.test(afterScheme.charAt(i))) { authorityEnd = i; break; }
  }
  const authority = afterScheme.substring(0, authorityEnd);
  // Backslash makes the host position ambiguous. Classify by the segment
  // after the last @ to decide recognized (malformed) vs rejected.
  if (authority.includes("\\")) {
    const atIdx = authority.lastIndexOf("@");
    const seg = atIdx === -1 ? authority : authority.substring(atIdx + 1);
    const colonIdx = seg.indexOf(":");
    const host = colonIdx === -1 ? seg : seg.substring(0, colonIdx);
    const hostLower = host.toLowerCase();
    if (host.length > 0 && isRecognizedHost(hostLower)) {
      return { kind: "malformed", host: hostLower };
    }
    return { kind: "rejected", host: null };
  }
  const atIdx = authority.lastIndexOf("@");
  const hostPort = atIdx === -1 ? authority : authority.substring(atIdx + 1);
  const colonIdx = hostPort.indexOf(":");
  const host = colonIdx === -1 ? hostPort : hostPort.substring(0, colonIdx);
  const portStr = colonIdx === -1 ? null : hostPort.substring(colonIdx + 1);
  const hostLower = host.toLowerCase();
  if (!isRecognizedHost(hostLower)) return { kind: "rejected", host: null };
  if (portStr !== null) {
    if (!PORT_DIGITS.test(portStr)) return { kind: "malformed", host: hostLower };
    const port = parseInt(portStr, 10);
    const def = defaultPortForScheme(scheme);
    if (def === null || port !== def) return { kind: "malformed", host: hostLower };
  }
  return { kind: "valid", host: hostLower };
}

/**
 * Return the lowercased host of a URL whose authority is VALID, or null.
 * Malformed and rejected authorities return null so legacy callers
 * (extractOwnerRepo, isProducerOwnedUrl) treat them as non-GitHub.
 *
 * Kept as `string | null` (not `RecognizedHost | null`) so legacy callers
 * that compare against `string` literals keep typechecking. New code that
 * needs the narrow host should call `classifyAuthority` directly and read
 * `cls.host` from the discriminated union (see extractOwnerRepo).
 */
export function parseUrlHost(url: string): string | null {
  const cls = classifyAuthority(url);
  return cls.kind === "valid" ? cls.host : null;
}

export interface AuthorityScan {
  /** Start index of an http(s):// scheme whose authority ends at hostStart, or -1. */
  readonly schemeStart: number;
  /** True when a backslash was crossed during the forward walk. */
  readonly hasBackslash: boolean;
  /** Leftmost index reached by the walk (start of the authority evidence). */
  readonly authorityLeft: number;
  /** Start index of a scheme token that cannot serve as a live http(s) scheme
   * but precedes the host: unsupported scheme (ftp, evil, git+https), or a
   * valid http(s) scheme invalidated by excessive slashes (`https:////`).
   * The caller emits a malformed candidate from this index. -1 when none. */
  readonly rejectedSchemeStart: number;
}

/**
 * Forward authority-scan cursor. Carries scheme and backslash evidence
 * accumulated from line start (or the previous host hit) up to `pos`,
 * so a HOST_SCAN hit at the next `hostStart` can be answered by walking
 * forward through `(pos, hostStart)` only. Across all calls with
 * monotonically increasing `hostStart`, total work is O(line.length):
 * every index is visited at most once.
 */
export interface AuthorityScanCursor {
  /** Last index processed (exclusive lower bound for the next call). */
  readonly pos: number;
  readonly schemeStart: number;
  readonly authorityLeft: number;
  readonly hasBackslash: boolean;
  readonly rejectedSchemeStart: number;
}

export const INITIAL_AUTHORITY_SCAN_CURSOR: AuthorityScanCursor = {
  pos: -1,
  schemeStart: -1,
  authorityLeft: 0,
  hasBackslash: false,
  rejectedSchemeStart: -1,
};

export interface AuthorityScanResult {
  readonly cursor: AuthorityScanCursor;
  readonly scan: AuthorityScan;
  /** Number of characters processed in this call (for step-count bound). */
  readonly steps: number;
}

/**
 * Advance the cursor forward through `(cursor.pos, hostStart)`, updating
 * scheme and backslash evidence. Returns the cursor state valid at
 * `hostStart - 1` (the index just before the host), the AuthorityScan
 * snapshot, and the number of characters processed.
 *
 * Per-index transition (let `i` be the index just consumed, `c = line[i]`):
 *   - `c === "\\"`: a backslash inside the live region sets hasBackslash;
 *     the walk continues (backslash never terminates the region).
 *   - `c === "/"` and `line[i-2..i] === "://"`: a scheme terminator. Probe
 *     backward within the scheme-char run (bounded by scheme length) to
 *     recover the scheme name; accept only `http` / `https`. The probe is
 *     short (scheme length ≤ 10), so total work stays linear.
 *   - any other non-AUTHORITY_CHAR: invalidates the live region (resets
 *     schemeStart to -1, hasBackslash to false, advances authorityLeft).
 *   - AUTHORITY_CHAR: state persists.
 *
 * The scheme-char probe is the only "backward" piece, and it is bounded
 * by the scheme token length, not by the authority length, so the per-call
 * cost is O(distance advanced) + O(scheme length) and the cross-call
 * total is O(line.length).
 */
export function scanAuthorityForward(
  line: string,
  hostStart: number,
  cursor: AuthorityScanCursor,
): AuthorityScanResult {
  let pos = cursor.pos;
  let schemeStart = cursor.schemeStart;
  let authorityLeft = cursor.authorityLeft;
  let hasBackslash = cursor.hasBackslash;
  let rejectedSchemeStart = cursor.rejectedSchemeStart;
  let steps = 0;
  while (pos + 1 < hostStart) {
    pos++;
    steps++;
    const i = pos;
    const c = line.charAt(i);
    if (c === "\\") {
      hasBackslash = true;
      continue;
    }
    if (c === "/" && i >= 2 && line.charAt(i - 1) === "/" && line.charAt(i - 2) === ":") {
      const schemeEnd = i - 2;
      let j = schemeEnd - 1;
      if (j < 0 || !ALPHA.test(line.charAt(j))) {
        schemeStart = -1; authorityLeft = i + 1; hasBackslash = false; rejectedSchemeStart = -1;
        continue;
      }
      while (j > 0 && SCHEME_CHAR.test(line.charAt(j - 1))) j--;
      const scheme = line.substring(j, schemeEnd).toLowerCase();
      if (scheme === "http" || scheme === "https") {
        schemeStart = j; authorityLeft = j; hasBackslash = false;
        rejectedSchemeStart = (i + 1 < line.length && line.charAt(i + 1) === "/") ? j : -1;
      } else {
        schemeStart = -1; authorityLeft = i + 1; hasBackslash = false; rejectedSchemeStart = j;
      }
      continue;
    }
    // Scheme-terminator colon: WHATWG also accepts `https:` (0 slashes) and
    // `https:/` (1 slash) as scheme URLs, but those forms hide the scheme
    // from the "://" detector above and let a producer URL slip through as
    // scheme-less. Treat 0/1-slash http(s) colons as rejected (malformed) by
    // pointing rejectedSchemeStart at the scheme token start. The 2-slash
    // valid case and the 3+-slash malformed case defer to the "://" branch
    // (slashCount >= 2 falls through; `:` is an AUTHORITY_CHAR so the
    // generic fallthrough is a no-op for it).
    if (c === ":" && i >= 1 && ALPHA.test(line.charAt(i - 1))) {
      let j = i - 1;
      while (j > 0 && SCHEME_CHAR.test(line.charAt(j - 1))) j--;
      const scheme = line.substring(j, i).toLowerCase();
      if (scheme === "http" || scheme === "https") {
        let slashCount = 0, k = i + 1;
        while (slashCount < 3 && k < line.length && line.charAt(k) === "/") { slashCount++; k++; }
        if (slashCount <= 1) {
          rejectedSchemeStart = j; schemeStart = -1; authorityLeft = i + 1; hasBackslash = false;
          continue;
        }
      }
    }
    if (!AUTHORITY_CHAR.test(c)) {
      schemeStart = -1; authorityLeft = i + 1; hasBackslash = false;
      if (c !== "/") rejectedSchemeStart = -1;
    }
  }
  const nextCursor: AuthorityScanCursor = { pos, schemeStart, authorityLeft, hasBackslash, rejectedSchemeStart };
  return { cursor: nextCursor, scan: { schemeStart, hasBackslash, authorityLeft, rejectedSchemeStart }, steps };
}

/**
 * Find the end index (exclusive) of the authority region: the first `/`,
 * `?`, or `#` at or after `from`, or `urlEnd` when none is found.
 */
export function findAuthorityEnd(line: string, from: number, urlEnd: number): number {
  let end = from;
  while (end < urlEnd) {
    const c = line.charAt(end);
    if (c === "/" || c === "?" || c === "#") break;
    end++;
  }
  return end;
}

/** Canonicalize a host token for evasion detection only: iterative UTF-8
 *  percent-decode (up to 2 rounds, like decodeURIComponent) + Unicode dot
 *  (U+3002, U+FF0E, U+FF61) replacement + ASCII lowercase. Used to detect
 *  percent-encoded / Unicode-dot / double-encoded / case-variant hosts that
 *  canonicalize to a recognized GitHub host. NOT used for producer/external
 *  classification.
 *
 *  Decode rounds: round 1 resolves single encoding (`%67`->`g`) and exposes
 *  UTF-8 sequences (`%E3%80%82`->U+3002); round 2 resolves double
 *  percent-encoding (`%2567`->`%67`->`g`). Stops early when no `%` remains,
 *  a round yields no change, or decodeURIComponent throws (invalid sequence)
 *  -- the last successful result is kept, so a malformed tail never aborts
 *  an otherwise-recognized host. Unicode-dot replacement and lowercasing
 *  run AFTER decoding so encoded dots (`%E3%80%82`) and case variants
 *  (`GITHUB\u3002COM`) both collapse to the lowercase ASCII form. */
export function canonicalizeHostEvasion(raw: string): string {
  let s = raw;
  for (let round = 0; round < 2 && s.includes("%"); round++) {
    let decoded: string;
    try { decoded = decodeURIComponent(s); } catch { break; }
    if (decoded === s) break;
    s = decoded;
  }
  return s.replace(/[\u3002\uFF0E\uFF61]/g, ".").toLowerCase();
}
