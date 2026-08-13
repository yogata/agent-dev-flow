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
//   - For each hit, scanAuthorityBackward locates the scheme and detects
//     backslash malformedness. A backslash in the authority is always
//     malformed: it makes the host position ambiguous and the URL cannot
//     own/hide contained producer references.
//   - Port validation: only the scheme default port is accepted (443 for
//     https, 80 for http). Any other port, or any port on a scheme-less
//     URL, is malformed. A malformed authority NEVER silently passes: it
//     is emitted as a separate candidate whose ownership span covers only
//     the authority region, so contained path references stay independently
//     visible, and resolveCandidate classifies it as evasion-attempt.
//
// Side-effect-free: pure over inputs.

import type { Span } from "./boundary-candidate-ownership.ts";
import {
  classifyAuthority,
  findAuthorityEnd,
  parseUrlHost,
  scanAuthorityBackward,
} from "./boundary-url-authority.ts";

const OWNER_PATTERN = /^[A-Za-z0-9_-]+$/;
const REPO_PATTERN = /^[A-Za-z0-9_.-]+$/;

/** Scan pattern: case-insensitive recognized host followed by `/` or `:`. */
const HOST_SCAN = /(?:github\.com|raw\.githubusercontent\.com)(?=[/:])/gi;

/** URL end exclusion set: terminates URL ownership at boundary markers.
 * Includes opening delimiters `(` `[` `{` and full-width colon U+FF1A.
 * ASCII `:` is conditional (handled in the forward scan): it terminates
 * only in the path component, not in the authority (`:port`) or inside
 * a query (`?...`) / fragment (`#...`). */
const URL_STOP_CHAR = /[\s()\[\]|\\"'`<>{},;\u3001\u3002\uFF1B\uFF0C\uFF01\uFF1F\uFF1A]/;

/** Preceding char rejects the left boundary (host/path/query continuation). */
const LEFT_REJECT_CHAR = /[A-Za-z0-9._@:?#&=\\/-]/;

/**
 * Extract `owner/repo` from a URL value whose authority is a VALID recognized
 * GitHub authority (default port accepted; malformed port or backslash
 * authority returns null). Path-lookalike and userinfo-deception URLs return
 * null because their host is not a recognized GitHub authority.
 */
export function extractOwnerRepo(url: string): string | null {
  const host = parseUrlHost(url);
  if (host === null) return null;
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
  /** True when the authority is malformed (backslash / bad port). The span
   * covers ONLY the authority region so contained path references stay
   * independently visible; resolveCandidate classifies it evasion-attempt. */
  readonly malformed: boolean;
}

/**
 * Scan a line for URL candidates whose host is a recognized GitHub
 * authority. Returns at most `cap` entries; `overflow` is set when the cap
 * is reached mid-scan (ownership never suppresses overflow).
 *
 * For each host hit, scanAuthorityBackward locates the scheme and detects
 * backslash malformedness. A backslash in the authority => malformed. A
 * valid scheme URL with a non-default port => malformed. A scheme-less URL
 * with any port => malformed. Malformed candidates' spans cover ONLY the
 * authority region so path references stay independently visible; valid
 * URLs span the full URL (scheme through stop char) and own their path.
 */
export function extractUrls(line: string, cap: number): {
  readonly urls: readonly ExtractedUrl[];
  readonly overflow: boolean;
} {
  const out: ExtractedUrl[] = [];
  HOST_SCAN.lastIndex = 0;
  for (let m: RegExpExecArray | null; (m = HOST_SCAN.exec(line)) !== null;) {
    const hostStart = m.index;
    const hostEnd = hostStart + m[0].length;
    const scan = scanAuthorityBackward(line, hostStart);
    let urlEnd = hostEnd;
    let inPath = false;
    let inQueryOrFrag = false;
    while (urlEnd < line.length) {
      const c = line.charAt(urlEnd);
      if (URL_STOP_CHAR.test(c)) break;
      if (c === "?" || c === "#") inQueryOrFrag = true;
      else if (c === "/") { if (!inQueryOrFrag) inPath = true; }
      else if (c === ":" && inPath && !inQueryOrFrag) break;
      urlEnd++;
    }
    const authorityEnd = findAuthorityEnd(line, hostEnd, urlEnd);
    if (scan.hasBackslash) {
      const aStart = scan.schemeStart !== -1 ? scan.schemeStart : scan.authorityLeft;
      if (out.length >= cap) return { urls: out, overflow: true };
      out.push({ value: line.substring(aStart, authorityEnd), span: { start: aStart, end: authorityEnd }, malformed: true });
      continue;
    }
    if (scan.schemeStart !== -1) {
      if (!isValidLeftBoundary(line, scan.schemeStart)) continue;
      const value = line.substring(scan.schemeStart, urlEnd);
      const cls = classifyAuthority(value);
      if (cls.kind === "rejected") continue;
      if (cls.kind === "malformed") {
        if (out.length >= cap) return { urls: out, overflow: true };
        out.push({ value: line.substring(scan.schemeStart, authorityEnd), span: { start: scan.schemeStart, end: authorityEnd }, malformed: true });
        continue;
      }
      if (extractOwnerRepo(value) === null) continue;
      if (out.length >= cap) return { urls: out, overflow: true };
      out.push({ value, span: { start: scan.schemeStart, end: urlEnd }, malformed: false });
      continue;
    }
    // Scheme-less host.
    if (!isValidLeftBoundary(line, hostStart)) continue;
    const value = line.substring(hostStart, urlEnd);
    const cls = classifyAuthority(value);
    if (cls.kind === "rejected") continue;
    if (cls.kind === "malformed") {
      if (out.length >= cap) return { urls: out, overflow: true };
      out.push({ value: line.substring(hostStart, authorityEnd), span: { start: hostStart, end: authorityEnd }, malformed: true });
      continue;
    }
    if (extractOwnerRepo(value) === null) continue;
    if (out.length >= cap) return { urls: out, overflow: true };
    out.push({ value, span: { start: hostStart, end: urlEnd }, malformed: false });
  }
  return { urls: out, overflow: false };
}

function isValidLeftBoundary(line: string, pos: number): boolean {
  if (pos === 0) return true;
  return !LEFT_REJECT_CHAR.test(line.charAt(pos - 1));
}
