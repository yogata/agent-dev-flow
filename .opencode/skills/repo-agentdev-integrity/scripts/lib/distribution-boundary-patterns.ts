// Detection patterns, path normalization, and URL ownership helpers for the
// distribution boundary detector.
//
// Stage A alignment (PR #2092): mirrors trusted-distribution-gate/boundary-pipeline.ts
// pattern semantics so the pre-write gate (Stage B plugin) and the final
// archive gate agree on what counts as a candidate. Resolution and
// classification live in distribution-boundary-detector.ts.
//
// Pure: no fs/path/I/O imports; same input => same output.

import type { RepositoryIdentity } from "./distribution-boundary-detector.ts";

// ---------------------------------------------------------------------------
// Detection patterns
// ---------------------------------------------------------------------------

// Generic ID family: any UPPER-CASE prefix of 2+ letters followed by a hyphen
// and 1+ digits. Captures ADR/REQ/DEC AND any future family (OU, TS, AG, IR,
// RU, EC). Resolution stage decides producer-internal vs unclassified by
// consulting DetectorConfig.producer_internal_id_prefixes.
// Template wrappers ({NNNN}, <NNNN>, *) do not match because the closing
// marker breaks the word boundary and the placeholder forms have no digits.
export const GENERIC_ID_PATTERN = /\b([A-Z]{2,})-(\d{1,})\b/g;

// Legacy alias: closed-list pattern is kept as a deprecated re-export so the
// existing checker adapter continues to compile. The actual extractor uses
// GENERIC_ID_PATTERN.
export const CONCRETE_ID_PATTERN = GENERIC_ID_PATTERN;

// Docs path token: slash, backslash, or percent-encoded separator. Captures
// the broad token; resolution normalizes and inspects the trailing portion.
// Query and fragment separators terminate the path token.
export const DOCS_PATH_PATTERN =
  /docs[\\/](?:adr|requirements|specs|decisions)[\\/][^\s)\]\|\\"'`<>{}?#]+/g;

// Percent-encoded docs path: docs%2F...%2F...
export const DOCS_PATH_PERCENT_PATTERN =
  /docs%2[Ff](?:adr|requirements|specs|decisions)%2[Ff][^\s)\]\|\\"'`<>{}?#]+/g;

// Candidate GitHub blob/raw URLs. The resolution stage parses owner/repo
// from each candidate URL and compares to the configured repository identity.
export const URL_CANDIDATE_PATTERN =
  /(?:github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/(?:blob|raw)\/|raw\.githubusercontent\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/)[^\s)\]\\"'`<>{}]+/g;

export const FIXED_URL_PATTERN = URL_CANDIDATE_PATTERN;
export const RAW_FIXED_URL_PATTERN = URL_CANDIDATE_PATTERN;

// ---------------------------------------------------------------------------
// Path normalization
// ---------------------------------------------------------------------------

/**
 * Normalize a path token: convert backslashes and percent-encoded slashes
 * to forward slashes. Pure; does not touch the filesystem.
 */
export function normalizePathToken(token: string): string {
  return token.replace(/\\/g, "/").replace(/%2[fF]/g, "/");
}

/**
 * Strip query (`?...`) and fragment (`#...`) trailers from a path token.
 */
export function stripQueryAndFragment(token: string): string {
  const q = token.indexOf("?");
  if (q >= 0) return token.slice(0, q);
  const h = token.indexOf("#");
  if (h >= 0) return token.slice(0, h);
  return token;
}

/**
 * Decide whether a docs path token is a CONCRETE file reference (violation).
 * Template / glob / README forms are allowed.
 */
export function isConcreteDocsPath(token: string): boolean {
  const normalized = normalizePathToken(stripQueryAndFragment(token));
  if (normalized.endsWith("/README.md")) return false;
  if (/[<>{}]/.test(normalized)) return false;
  if (normalized.includes("*")) return false;
  if (!normalized.endsWith(".md")) return false;
  return true;
}

// ---------------------------------------------------------------------------
// URL ownership
// ---------------------------------------------------------------------------

/**
 * Extract the `owner/repo` segment from a GitHub blob/raw URL. Returns null
 * when the URL does not match the expected shape.
 */
export function extractOwnerRepo(url: string): string | null {
  const m = /(?:github\.com\/|raw\.githubusercontent\.com\/)([A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+)\//.exec(
    url,
  );
  if (!m) return null;
  return m[1] ?? null;
}

/**
 * Decide whether a candidate URL points into the producer's own repository,
 * based on the configured repository identity. Pure. Returns false when
 * identity is empty (caller must fail-closed upstream).
 */
export function isProducerOwnedUrl(
  url: string,
  identity: RepositoryIdentity,
): boolean {
  if (identity.owner_slash_name.length === 0) return false;
  const ownerRepo = extractOwnerRepo(url);
  if (ownerRepo === null) return false;
  // GitHub owner/repo names are case-insensitive (legacy).
  return (
    ownerRepo.toLowerCase() === identity.owner_slash_name.toLowerCase()
  );
}

// ---------------------------------------------------------------------------
// Line / snippet helpers
// ---------------------------------------------------------------------------

export function trimSnippet(line: string, maxLen: number): string {
  const t = line.trim();
  return t.length <= maxLen ? t : t.substring(0, maxLen);
}

/**
 * Skip line-level extraction for placeholder-only ID forms. `REQ-{NNNN}`,
 * `<REQ-NNNN>`, `REQ-*` etc. are template forms that should not be flagged.
 */
export function isTemplateWrappedId(
  text: string,
  matchStart: number,
  matchEnd: number,
): boolean {
  const before = text.charAt(matchStart - 1);
  const after = text.charAt(matchEnd);
  if (before === "{" && after === "}") return true;
  if (before === "<" && after === ">") return true;
  if (after === "*") return true;
  return false;
}
