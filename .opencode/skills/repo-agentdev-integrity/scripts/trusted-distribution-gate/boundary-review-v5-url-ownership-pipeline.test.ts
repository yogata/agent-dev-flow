// End-to-end pipeline tests for URL ownership of docs paths (D7).
//
// These tests exercise the full detectCandidates pipeline to ensure
// valid URL spans are correctly passed as exclusions to docs path extraction,
// while malformed URL spans are NOT treated as exclusions.
//
// Scope:
//   - D7.4 E2E flood: 5 valid external URLs with embedded docs + 55 standalone paths = 5 url + 55 path, no overflow.
//   - D7.6 E2E malformed authority: malformed URL does NOT suppress docs path, evasion-attempt error present.

import { describe, expect, test } from "bun:test";
import {
  detectCandidates,
  type Candidate,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import { resolveCandidate } from "./boundary-candidate-model.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function getUrl(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "url" }> => c.type === "url");
}

function getPath(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "path" }> => c.type === "path");
}

function getOverflow(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "overflow" }> => c.type === "overflow");
}

// D7.4 E2E: flood regression through full pipeline.
describe("D7.4 E2E flood regression / 5 valid URLs + 55 standalone paths = 5 url + 55 path, no overflow", () => {
  test("flood scenario: 5 URLs with embedded docs paths + 55 standalone paths", () => {
    const embeddedParts = Array.from({ length: 5 }, (_, i) =>
      `https://github.com/external${i}/repo${i}/blob/main/docs/specs/REQ-${String(i).padStart(4, "0")}.md`,
    ).join(" ");
    const standaloneParts = Array.from({ length: 55 }, (_, i) =>
      `docs/specs/REQ-${String(i + 100).padStart(4, "0")}.md`,
    ).join(" ");
    const line = `See ${embeddedParts} ${standaloneParts} end.`;

    const candidates = detectCandidates(line, baseConfig);
    const urls = getUrl(candidates);
    const paths = getPath(candidates);
    const overflows = getOverflow(candidates);

    // Exactly 5 URLs from embedded paths
    expect(urls).toHaveLength(5);
    expect(urls.every((u) => u.malformed === false)).toBe(true);

    // Exactly 55 standalone paths (embedded docs paths excluded by URL spans)
    expect(paths).toHaveLength(55);

    // No overflow candidates
    expect(overflows).toHaveLength(0);
  });
});

// D7.6 E2E: malformed authority does NOT suppress docs path.
describe("D7.6 E2E malformed authority / path remains visible, evasion-attempt error present", () => {
  test("backslash authority malformed URL + docs path after: both present, evasion-attempt on URL", () => {
    const line = "See https://evil.com\\@github.com/vercel/next.js/blob/main/x.md docs/requirements/REQ-0001.md end.";
    const candidates = detectCandidates(line, baseConfig);
    const urls = getUrl(candidates);
    const paths = getPath(candidates);

    // Malformed URL is emitted as evasion-attempt
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(true);

    if (urls[0] !== undefined) {
      const urlResult = resolveCandidate(urls[0], baseConfig);
      expect(urlResult.category).toBe("evasion-attempt");
    }

    // Docs path is NOT suppressed by malformed URL span
    expect(paths).toHaveLength(1);
    expect(paths[0]?.value).toBe("docs/requirements/REQ-0001.md");
  });

  test("malformed authority with docs path in path region + standalone docs path: both visible", () => {
    const line = "https://evil.com\\@github.com/vercel/next.js/blob/main/docs/specs/REQ-0001.md docs/requirements/REQ-9999.md end.";
    const candidates = detectCandidates(line, baseConfig);
    const urls = getUrl(candidates);
    const paths = getPath(candidates);

    // Malformed URL is emitted
    expect(urls).toHaveLength(1);
    expect(urls[0]?.malformed).toBe(true);

    // The standalone docs path must be visible (not suppressed by malformed span)
    const standalonePath = paths.find((p) => p.value === "docs/requirements/REQ-9999.md");
    expect(standalonePath).toBeDefined();
  });

  test("malformed authority URL span MUST NOT act as exclusion: explicit span containment test", () => {
    const line = "https://evil.com\\@github.com/owner/repo/blob/main/x.md docs/specs/REQ-0001.md";
    const candidates = detectCandidates(line, baseConfig);
    const urls = getUrl(candidates);
    const paths = getPath(candidates);

    expect(urls).toHaveLength(1);
    const url0 = urls[0];
    if (url0 === undefined) {
      throw new Error("expected url0 to be defined");
    }
    expect(url0.malformed).toBe(true);
    expect(url0.value).toBe("https://evil.com\\@github.com");

    expect(paths).toHaveLength(1);
    expect(paths[0]?.value).toBe("docs/specs/REQ-0001.md");
  });

  test("valid URL DOES suppress embedded docs path; malformed URL does NOT", () => {
    const validLine = "See https://github.com/vercel/next.js/blob/main/docs/specs/REQ-0001.md end.";
    const validCandidates = detectCandidates(validLine, baseConfig);
    const validUrls = getUrl(validCandidates);
    const validPaths = getPath(validCandidates);

    expect(validUrls).toHaveLength(1);
    expect(validUrls[0]?.malformed).toBe(false);
    expect(validPaths).toHaveLength(0);

    const malformedLine = "See https://evil.com\\@github.com/vercel/next.js/blob/main/x.md docs/specs/REQ-0001.md end.";
    const malformedCandidates = detectCandidates(malformedLine, baseConfig);
    const malformedUrls = getUrl(malformedCandidates);
    const malformedPaths = getPath(malformedCandidates);

    expect(malformedUrls).toHaveLength(1);
    expect(malformedUrls[0]?.malformed).toBe(true);
    expect(malformedPaths).toHaveLength(1);
    expect(malformedPaths[0]?.value).toBe("docs/specs/REQ-0001.md");
  });
});