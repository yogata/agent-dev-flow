// Review-v5 URL ownership of docs paths: URL spans fully contain docs-path
// candidates, and the path extraction must skip those contained candidates
// BEFORE checking/incrementing the cap (D7).
//
// Scope:
//   - D7.1 docs-path without owner span is emitted; fully contained by owner span is omitted.
//   - D7.2 partial overlap does NOT suppress (path is not fully contained).
//   - D7.3 valid URL with embedded docs-looking path yields URL only (no path candidate).
//   - D7.4 flood regression: 5 valid URLs (each with embedded docs substring) + 55 standalone docs paths = 5 URLs + 55 paths, no overflow.
//   - D7.5 standalone cap exact/cap+1 behavior remains unchanged.
//   - D7.6 malformed authority path remains independently visible (small authority span cannot contain later path).

import { describe, expect, test } from "bun:test";
import { extractDocsPaths } from "./boundary-docs-path-parser.ts";
import { extractUrls } from "./boundary-url-parser.ts";
import type { Span } from "./boundary-candidate-ownership.ts";

// D7.1: containment skip behavior.
describe("D7.1 containment skip / omitted when fully contained by owner span", () => {
  test("same docs path emitted without owner span", () => {
    const line = "docs/specs/REQ-0001.md";
    const result = extractDocsPaths(line, 64);
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]?.value).toBe("docs/specs/REQ-0001.md");
    expect(result.overflow).toBe(false);
  });

  test("same docs path omitted when fully contained by owner span", () => {
    const line = "https://github.com/vercel/next.js/blob/main/docs/specs/REQ-0001.md end.";
    const { urls } = extractUrls(line, 64);
    expect(urls).toHaveLength(1);
    const urlSpan: Span = urls[0]?.span ?? { start: 0, end: 1 };
    const result = extractDocsPaths(line, 64, [urlSpan]);
    expect(result.paths).toHaveLength(0);
    expect(result.overflow).toBe(false);
  });
});

// D7.2: partial overlap does NOT suppress.
describe("D7.2 partial overlap does NOT suppress path", () => {
  test("path starting before URL span end is not fully contained", () => {
    const line = "docs/specs/REQ-0001.md https://github.com/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(line, 64);
    expect(urls).toHaveLength(1);
    const urlSpan: Span = urls[0]?.span ?? { start: 0, end: 1 };
    const result = extractDocsPaths(line, 64, [urlSpan]);
    // Path starts at 0, URL starts later, path is NOT contained
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]?.value).toBe("docs/specs/REQ-0001.md");
  });

  test("explicit partially overlapping span does NOT suppress path", () => {
    const line = "See docs/specs/REQ-0001.md and more text";
    const partialSpan: Span = { start: 10, end: 40 };
    const result = extractDocsPaths(line, 64, [partialSpan]);
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]?.value).toBe("docs/specs/REQ-0001.md");
    expect(result.paths[0]?.span).toEqual({ start: 4, end: 26 });
  });

  test("path ending after owner span start is not fully contained", () => {
    const lineWithPath = "docs/specs/REQ-0001.md https://github.com/vercel/next.js/blob/main/x.md";
    const { urls: urlsWithPath } = extractUrls(lineWithPath, 64);
    const pathResult = extractDocsPaths(lineWithPath, 64, [urlsWithPath[0]?.span ?? { start: 0, end: 1 }]);
    expect(pathResult.paths).toHaveLength(1);
    expect(pathResult.paths[0]?.value).toBe("docs/specs/REQ-0001.md");
  });
});

// D7.3: valid URL with embedded docs-looking path yields URL only.
describe("D7.3 valid URL with embedded docs path / URL only, no path candidate", () => {
  test("URL contains docs/specs/ADR-0001.md - only URL emitted", () => {
    const line = "See https://github.com/vercel/next.js/blob/main/docs/specs/ADR-0001.md end.";
    const { urls } = extractUrls(line, 64);
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(false);
    const urlSpan: Span = urls[0]?.span ?? { start: 0, end: 1 };
    const result = extractDocsPaths(line, 64, [urlSpan]);
    expect(result.paths).toHaveLength(0);
    expect(result.overflow).toBe(false);
  });

  test("external URL with docs/requirements/REQ-0001.md - only URL emitted", () => {
    const line = "See https://github.com/external/repo/blob/main/docs/requirements/REQ-0001.md end.";
    const { urls } = extractUrls(line, 64);
    expect(urls).toHaveLength(1);
    const urlSpan: Span = urls[0]?.span ?? { start: 0, end: 1 };
    const result = extractDocsPaths(line, 64, [urlSpan]);
    expect(result.paths).toHaveLength(0);
  });
});

// D7.4: flood regression - 5 URLs with embedded docs + 55 standalone = 5 + 55, no overflow.
describe("D7.4 flood regression / 5 embedded + 55 standalone = 5 URLs + 55 paths, no overflow", () => {
  test("exact flood scenario: 5 URLs with embedded docs paths + 55 standalone paths", () => {
    // Build line with 5 URLs each containing docs/specs and 55 standalone paths
    const embeddedParts = Array.from({ length: 5 }, (_, i) =>
      `https://github.com/external${i}/repo${i}/blob/main/docs/specs/REQ-${String(i).padStart(4, "0")}.md`,
    ).join(" ");
    const standaloneParts = Array.from({ length: 55 }, (_, i) =>
      `docs/specs/REQ-${String(i + 100).padStart(4, "0")}.md`,
    ).join(" ");
    const line = `See ${embeddedParts} ${standaloneParts} end.`;

    const { urls } = extractUrls(line, 64);
    expect(urls).toHaveLength(5);

    const urlSpans: Span[] = urls.map((u) => u.span);
    const result = extractDocsPaths(line, 64, urlSpans);

    // All 5 embedded docs paths are skipped (contained by URL spans)
    // All 55 standalone paths are emitted
    expect(result.paths).toHaveLength(55);
    expect(result.overflow).toBe(false);
  });
});

// D7.5: standalone cap exact/cap+1 behavior remains unchanged.
describe("D7.5 standalone cap behavior / exact and cap+1 unchanged", () => {
  test("exact cap returns every path without overflow (no owner spans)", () => {
    const line = Array.from({ length: 63 }, (_, i) => `docs/specs/x${i}.md`).join(" ");
    const result = extractDocsPaths(line, 63, []);
    expect(result.paths).toHaveLength(63);
    expect(result.overflow).toBe(false);
  });

  test("cap plus one returns capped paths with overflow (no owner spans)", () => {
    const line = Array.from({ length: 64 }, (_, i) => `docs/specs/x${i}.md`).join(" ");
    const result = extractDocsPaths(line, 63, []);
    expect(result.paths).toHaveLength(63);
    expect(result.overflow).toBe(true);
  });

  test("cap behavior with non-containing owner spans unchanged", () => {
    const line = Array.from({ length: 64 }, (_, i) => `docs/specs/x${i}.md`).join(" ");
    // Owner span at position 100, doesn't contain any path
    const nonContainingSpan: Span = { start: 100, end: 110 };
    const result = extractDocsPaths(line, 63, [nonContainingSpan]);
    expect(result.paths).toHaveLength(63);
    expect(result.overflow).toBe(true);
  });
});

// D7.6: malformed authority path remains independently visible.
describe("D7.6 malformed authority / small authority span cannot contain later path", () => {
  test("backslash authority malformed URL has small span, docs path after is visible", () => {
    const line = "See https://evil.com\\@github.com/vercel/next.js/blob/main/x.md docs/requirements/REQ-0001.md end.";
    const { urls } = extractUrls(line, 64);
    expect(urls).toHaveLength(1);
    const url = urls[0];
    expect(url?.malformed).toBe(true);

    // Malformed authority span covers only the authority region, not the path
    const urlSpan: Span = url?.span ?? { start: 0, end: 1 };
    const result = extractDocsPaths(line, 64, [urlSpan]);

    // Path is NOT contained in the small authority span, so it is emitted
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]?.value).toBe("docs/requirements/REQ-0001.md");
  });

  test("malformed authority with embedded-looking path does NOT suppress real docs path", () => {
    const line = "https://evil.com\\@github.com/vercel/next.js/blob/main/docs/specs/REQ-0001.md docs/requirements/REQ-9999.md end.";
    const { urls } = extractUrls(line, 64);
    expect(urls).toHaveLength(1);
    const urlSpan: Span = urls[0]?.span ?? { start: 0, end: 1 };

    const result = extractDocsPaths(line, 64, [urlSpan]);

    // The docs/requirements/REQ-9999.md is outside the malformed authority span
    expect(result.paths).toHaveLength(1);
    expect(result.paths[0]?.value).toBe("docs/requirements/REQ-9999.md");
  });
});