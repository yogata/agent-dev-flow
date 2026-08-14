// Review-v7 URL ownership-span and linear-scan remediation.
//
// Three blockers found in review-v7 across the URL extractor:
//   - #6 evasion dedup used the full URL `span` instead of `ownershipSpan`,
//     so a percent-encoded evasion host placed in an external URL's query
//     was suppressed by the outer URL's full span (which extends past the
//     query) and never emitted.
//   - #7 each HOST_SCAN hit re-scanned the entire URL value to its end.
//     For `"github.com/".repeat(1000)` (a single 11KB token) each hit
//     re-walked the remaining ~11K chars, giving quadratic step counts.
//   - #8 valid URL `ownershipSpan.start` was `urlStart` (includes scheme +
//     authority + userinfo), so a producer-internal ID embedded in the
//     userinfo (`https://ADR-0001@github.com/...`) was hidden inside the
//     ownership span and never surfaced as a direct-id.
//
// Each blocker is pinned as a RED→GREEN test. GREEN controls verify that
// consumer-resolvable URLs still pass the gate and that V6 query behavior
// is preserved (no regression from the dedup / ownershipSpan changes).

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";
import {
  detectCandidates,
  type Candidate,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function gateFor(text: string) {
  const files: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(files, "source", baseConfig).gate;
}

function urlsOf(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "url" }> => c.type === "url");
}
function directsOf(cs: readonly Candidate[]) {
  return cs.filter((c): c is Extract<Candidate, { type: "direct-id" }> => c.type === "direct-id");
}

const LINEAR_K = 16;
const LINEAR_C = 64;

// #6: evasion host in external URL query is independently detected.
describe("#6 evasion dedup uses ownershipSpan / evasion host in query detected", () => {
  test("https://...x.md?next=%67ithub.com/yogata/agent-dev-flow/... → 1 external URL + 1 malformed evasion URL", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md?next=%67ithub.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    // The vercel/next.js URL is the consumer-resolvable outer URL.
    const outer = urls.find((u) => !u.malformed);
    expect(outer).toBeDefined();
    // The percent-encoded host (`%67ithub.com` decodes to `github.com`) is a
    // separate malformed evasion URL placed in the outer URL's query.
    const evasion = urls.find((u) => u.malformed);
    expect(evasion).toBeDefined();
    expect(urls.length).toBeGreaterThanOrEqual(2);
  });

  test("gate FAIL (producer-internal evasion URL independently visible)", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md?next=%67ithub.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    // The evasion URL itself is malformed → unclassified evasion-attempt.
    expect(g.errors.some((d) => d.category === "evasion-attempt")).toBe(true);
  });
});

// #7: linear step bound on adversarial repeated hosts.
describe("#7 linear step bound on repeated hosts in path", () => {
  test("\"github.com/\".repeat(1000) → steps within linear bound", () => {
    const text = "github.com/".repeat(1000);
    const result = extractUrls(text, 64);
    const bound = LINEAR_K * text.length + LINEAR_C;
    expect(
      result.steps,
      `steps=${result.steps} must be <= bound=${bound} (text.length=${text.length})`,
    ).toBeLessThanOrEqual(bound);
  });

  test("\"github.com/\".repeat(500) + \" ADR-0001\" → steps within linear bound AND gate FAIL", () => {
    const text = "github.com/".repeat(500) + " ADR-0001";
    const result = extractUrls(text, 64);
    const bound = LINEAR_K * text.length + LINEAR_C;
    expect(
      result.steps,
      `steps=${result.steps} must be <= bound=${bound} (text.length=${text.length})`,
    ).toBeLessThanOrEqual(bound);
    // The ADR-0001 outside the URL region is independently visible.
    const cs = detectCandidates(text, baseConfig);
    const adr = directsOf(cs).find((c) => c.value === "ADR-0001");
    expect(adr).toBeDefined();
    expect(gateFor(text).pass).toBe(false);
  });
});

// #8: valid URL ownershipSpan starts at path (authorityEnd), not urlStart.
describe("#8 valid URL ownershipSpan starts at authorityEnd (path), not urlStart", () => {
  test("https://ADR-0001@github.com/vercel/... → ownershipSpan.start at first path slash", () => {
    const text = "See https://ADR-0001@github.com/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(false);
    expect(u.ownershipSpan).not.toBeNull();
    // ownershipSpan.start = position of `/` after `github.com` (path start).
    const pathSlashIdx = text.indexOf("github.com/") + "github.com".length;
    expect(u.ownershipSpan?.start).toBe(pathSlashIdx);
    // ownershipSpan.end = same as span.end when no ?/#.
    expect(u.ownershipSpan?.end).toBe(u.span.end);
  });

  test("https://ADR-0001@github.com/vercel/... → 1 valid URL + 1 direct-id ADR-0001, gate FAIL", () => {
    const text = "See https://ADR-0001@github.com/vercel/next.js/blob/main/x.md end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urlsOf(cs)).toHaveLength(1);
    const adr = directsOf(cs).find((c) => c.value === "ADR-0001");
    expect(adr).toBeDefined();
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.some((d) => d.classification === "producer-internal" && d.matched === "ADR-0001")).toBe(true);
  });
});

// GREEN controls: existing behavior must not regress.
describe("controls / consumer URL and query-direct-id behavior preserved", () => {
  test("https://github.com/vercel/next.js/blob/main/x.md → 1 consumer URL, gate PASS", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one url");
    expect(u.malformed).toBe(false);
    expect(gateFor(text).pass).toBe(true);
  });

  test("https://github.com/vercel/next.js/blob/main/x.md?q=ADR-0001 → 1 consumer URL + 1 direct-id, gate FAIL", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md?q=ADR-0001 end.";
    const cs = detectCandidates(text, baseConfig);
    expect(urlsOf(cs)).toHaveLength(1);
    const adr = directsOf(cs).find((c) => c.value === "ADR-0001");
    expect(adr).toBeDefined();
    expect(gateFor(text).pass).toBe(false);
  });
});
