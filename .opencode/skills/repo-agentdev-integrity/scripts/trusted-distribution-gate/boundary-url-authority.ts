// Authority classification for the boundary URL extractor.
//
// Extracted from boundary-url-parser.ts to keep that module under the 250
// pure LOC ceiling. One responsibility: classify a URL value's authority
// as valid / malformed / rejected, and expose the backward authority scan
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

/** Recognized GitHub authority hosts. */
const GITHUB_HOST = "github.com";
const RAW_HOST = "raw.githubusercontent.com";
const RECOGNIZED_HOSTS: ReadonlySet<string> = new Set([GITHUB_HOST, RAW_HOST]);

/** Authority terminator: first of these ends the authority region. */
const AUTHORITY_TERMINATOR = /[/?#]/;

/** Port must be all decimal digits (non-digit port => malformed). */
const PORT_DIGITS = /^[0-9]+$/;

/** Characters allowed inside a URL authority (userinfo) region (RFC 3986). */
const AUTHORITY_CHAR = /[A-Za-z0-9._~!$&'()*+,;=:@%]/;

/** One character of an RFC 3986 scheme token: ALPHA / DIGIT / "+" / "-" / ".". */
const SCHEME_CHAR = /[A-Za-z0-9+\-.]/;

export type AuthorityKind = "valid" | "malformed" | "rejected";

export interface AuthorityClassification {
  readonly kind: AuthorityKind;
  /** Lowercased recognized host when kind is valid or malformed; null otherwise. */
  readonly host: string | null;
}

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
    if (host.length > 0 && RECOGNIZED_HOSTS.has(hostLower)) {
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
  if (!RECOGNIZED_HOSTS.has(hostLower)) return { kind: "rejected", host: null };
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
 */
export function parseUrlHost(url: string): string | null {
  const cls = classifyAuthority(url);
  return cls.kind === "valid" ? cls.host : null;
}

export interface AuthorityScan {
  /** Start index of an http(s):// scheme whose authority ends at hostStart, or -1. */
  readonly schemeStart: number;
  /** True when a backslash was crossed during the backward walk. */
  readonly hasBackslash: boolean;
  /** Leftmost index reached by the walk (start of the authority evidence). */
  readonly authorityLeft: number;
}

/**
 * Walk backward from `hostStart - 1` through the lexical authority region
 * (RFC 3986 authority chars AND backslash) to locate an http(s):// scheme
 * and detect backslash malformedness. The walk stops at any char that is
 * neither an authority char nor a backslash (whitespace, a path separator
 * from a DIFFERENT token, etc.), so a later bare host never grabs an
 * earlier URL's scheme. Crossing a backslash sets hasBackslash so the
 * caller emits a malformed candidate rather than silently dropping it.
 */
export function scanAuthorityBackward(line: string, hostStart: number): AuthorityScan {
  let i = hostStart - 1;
  let hasBackslash = false;
  while (i >= 0) {
    const c = line.charAt(i);
    if (c === "\\") { hasBackslash = true; i--; continue; }
    if (i >= 2 && line.substring(i - 2, i + 1) === "://") {
      const schemeEnd = i - 2;
      let j = schemeEnd - 1;
      if (j < 0 || !/[A-Za-z]/.test(line.charAt(j))) {
        return { schemeStart: -1, hasBackslash, authorityLeft: i + 1 };
      }
      while (j > 0 && SCHEME_CHAR.test(line.charAt(j - 1))) j--;
      const scheme = line.substring(j, schemeEnd).toLowerCase();
      if (scheme === "http" || scheme === "https") {
        return { schemeStart: j, hasBackslash, authorityLeft: j };
      }
      return { schemeStart: -1, hasBackslash, authorityLeft: i + 1 };
    }
    if (!AUTHORITY_CHAR.test(c)) {
      return { schemeStart: -1, hasBackslash, authorityLeft: i + 1 };
    }
    i--;
  }
  return { schemeStart: -1, hasBackslash, authorityLeft: 0 };
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
