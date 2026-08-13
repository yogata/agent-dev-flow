// Authority-aware URL extractor for the distribution boundary detector.
//
// Extracted from boundary-candidate-model.ts to keep that module under the
// 250 pure LOC ceiling and to make the URL lexer independently testable.
// One responsibility: turn a line into URL candidate spans whose host is
// exactly `github.com` or `raw.githubusercontent.com`.
//
// Authority model (no URL dependency):
//   - Scheme form: `https?://[userinfo@]host[:port][/path][?query][#frag]`.
//     Port is NOT supported: `host:port` is rejected (host with `:` is not
//     a valid hostname for the GitHub authority).
//   - Userinfo is stripped via the LAST `@` so `https://github.com@evil.com`
//     is parsed as userinfo=`github.com`, host=`evil.com` — not a GitHub
//     authority.
//   - Host comparison is case-insensitive (host lowercased). Owner/repo
//     comparison is case-insensitive (GitHub legacy). Directory family
//     names elsewhere remain case-sensitive (NOT this module's concern).
//   - Host suffix / subdomain / path lookalikes are rejected: host must
//     equal `github.com` or `raw.githubusercontent.com` exactly. So
//     `notgithub.com`, `github.com.evil.com`, `evil.github.com`, and
//     `example.com/github.com/...` are NOT GitHub authorities.
//   - Scheme-less `github.com/...` and `raw.githubusercontent.com/...`
//     are supported only at a valid left boundary: the char before the
//     host must NOT be a host/path/query/fragment continuation char
//     (`[A-Za-z0-9._@:?#&=\\/-]`), except the `://` scheme separator is
//     accepted (so the host of a scheme URL is matched).
//
// Side-effect-free: pure over inputs.

import type { Span } from "./boundary-candidate-ownership.ts";

/** URL authority hosts the detector recognizes. */
const GITHUB_HOST = "github.com";
const RAW_HOST = "raw.githubusercontent.com";
const RECOGNIZED_HOSTS: ReadonlySet<string> = new Set([GITHUB_HOST, RAW_HOST]);

const OWNER_PATTERN = /^[A-Za-z0-9_-]+$/;
const REPO_PATTERN = /^[A-Za-z0-9_.-]+$/;

/** Scan pattern: case-insensitive `github.com/` or `raw.githubusercontent.com/`. */
const HOST_SCAN = /(?:github\.com|raw\.githubusercontent\.com)\//gi;

/** URL end exclusion set (matches the legacy URL_CANDIDATE_PATTERN).
 * Includes comma, semicolon, Japanese punctuation, and full-width punctuation
 * to terminate URL ownership at these boundary markers.
 */
const URL_STOP_CHAR = /[\s)\]|\\"'`<>{},;\u3001\u3002\uFF1B\uFF0C\uFF01\uFF1F]/;

/** Preceding char rejects the left boundary (host/path/query continuation). */
const LEFT_REJECT_CHAR = /[A-Za-z0-9._@:?#&=\\/-]/;

/**
 * Decide whether `hostStart` is a valid left boundary for a scheme-less
 * authority. Returns true when the host begins the URL (start of line,
 * whitespace, opening punctuation, etc.) or is preceded by `://`.
 *
 * When the host is preceded by `://`, the scheme must be http or https.
 * Unsupported schemes (evil://, ftp://, etc.) cause rejection.
 *
 * For scheme URLs, we validate the boundary at the scheme start, not at
 * the host start, to correctly handle userinfo.
 */
function isValidLeftBoundary(line: string, hostStart: number): boolean {
  if (hostStart === 0) return true;
  const schemeStart = findSchemeStartBeforeHost(line, hostStart);
  if (schemeStart !== -1) {
    // Validate the boundary at the scheme start, not at the host start.
    if (schemeStart === 0) return true;
    const prev = line.charAt(schemeStart - 1);
    return !LEFT_REJECT_CHAR.test(prev);
  }
  const prev = line.charAt(hostStart - 1);
  return !LEFT_REJECT_CHAR.test(prev);
}

/**
 * Parse the authority of a URL value and return the lowercased host, or
 * null when the URL has a port (unsupported) or no parseable authority.
 *
 * Precondition: caller ensures the URL value starts at a valid boundary
 * (scheme form OR scheme-less host). The host is the part of the authority
 * after the last `@` (userinfo stripped) and before any `:port`.
 */
export function parseUrlHost(url: string): string | null {
  const schemeMatch = /^https?:\/\//i.exec(url);
  const afterScheme = schemeMatch ? url.substring(schemeMatch[0].length) : url;
  let authorityEnd = afterScheme.length;
  for (let i = 0; i < afterScheme.length; i++) {
    const c = afterScheme.charAt(i);
    if (c === "/" || c === "?" || c === "#") { authorityEnd = i; break; }
  }
  const authority = afterScheme.substring(0, authorityEnd);
  const atIdx = authority.lastIndexOf("@");
  const hostPort = atIdx === -1 ? authority : authority.substring(atIdx + 1);
  // Reject port form: a `:` in the host segment is not a valid hostname.
  if (hostPort.includes(":")) return null;
  return hostPort.toLowerCase();
}

/**
 * Extract `owner/repo` from a URL value whose host is a recognized GitHub
 * authority, or null when the URL does not point at GitHub. Authority-aware:
 * the URL must host-match exactly (case-insensitive). Path-lookalike and
 * userinfo-deception URLs return null because their host is not GitHub.
 */
export function extractOwnerRepo(url: string): string | null {
  const host = parseUrlHost(url);
  if (host === null || !RECOGNIZED_HOSTS.has(host)) return null;
  const schemeMatch = /^https?:\/\//i.exec(url);
  const afterScheme = schemeMatch ? url.substring(schemeMatch[0].length) : url;
  const slashIdx = afterScheme.indexOf("/");
  if (slashIdx === -1) return null;
  const segments = afterScheme.substring(slashIdx + 1).split("/");
  const owner = segments[0];
  const repo = segments[1];
  if (owner === undefined || repo === undefined) return null;
  if (!OWNER_PATTERN.test(owner) || !REPO_PATTERN.test(repo)) return null;
  if (host === GITHUB_HOST) {
    const action = segments[2];
    const tail = segments[3];
    if ((action !== "blob" && action !== "raw") || tail === undefined || tail.length === 0) return null;
  } else {
    const tail = segments[2];
    if (tail === undefined || tail.length === 0) return null;
  }
  return `${owner}/${repo}`;
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
}

/**
 * Scan a line for URL candidates whose host is a recognized GitHub
 * authority. Returns at most `cap` entries; the boolean `overflow` flag
 * is set when the cap is reached mid-scan (the caller MUST surface a
 * typed overflow in that case — ownership never suppresses overflow).
 *
 * For each scan hit, the left boundary is checked. The URL value extends
 * backward to include the scheme prefix when the host is immediately
 * preceded by `://`, and forward until the first URL stop char.
 */
export function extractUrls(line: string, cap: number): {
  readonly urls: readonly ExtractedUrl[];
  readonly overflow: boolean;
} {
  const out: ExtractedUrl[] = [];
  HOST_SCAN.lastIndex = 0;
  for (let m: RegExpExecArray | null; (m = HOST_SCAN.exec(line)) !== null;) {
    const matchEnd = m.index + m[0].length; // index right after the trailing `/`
    // The host starts at m.index. But the regex may have matched a host
    // continuation like the `github.com/` inside `notgithub.com/`: the
    // preceding char rejects the boundary in that case.
    const hostStart = m.index;
    if (!isValidLeftBoundary(line, hostStart)) continue;
    // Extend URL start back to include the scheme prefix when present.
    let start = hostStart;
    const schemeStart = findSchemeStartBeforeHost(line, hostStart);
    if (schemeStart !== -1) start = schemeStart;
    // Extend URL end forward until the first URL stop char.
    let end = matchEnd;
    while (end < line.length && !URL_STOP_CHAR.test(line.charAt(end))) end++;
    const value = line.substring(start, end);
    if (extractOwnerRepo(value) === null) continue;
    if (out.length >= cap) return { urls: out, overflow: true };
    out.push({ value, span: { start, end } });
  }
  return { urls: out, overflow: false };
}

/** Find the start index of an `http(s)://` scheme before the host position.
 * Returns -1 if the scheme is not http/https.
 */
function findSchemeStartBeforeHost(line: string, hostStart: number): number {
  // Look for `://` pattern before the host. The scheme is immediately before `://`.
  for (let i = hostStart - 1; i >= 3; i--) {
    if (line.substring(i - 2, i + 1) === "://") {
      // Found `://` at positions i-2, i-1, i. Check if the preceding chars form http or https.
      const schemeEnd = i - 2;
      let j = schemeEnd - 1;
      while (j >= 0 && /[A-Za-z]/.test(line.charAt(j))) j--;
      const scheme = line.substring(j + 1, schemeEnd).toLowerCase();
      if (scheme === "http" || scheme === "https") return j + 1;
    }
  }
  return -1;
}
