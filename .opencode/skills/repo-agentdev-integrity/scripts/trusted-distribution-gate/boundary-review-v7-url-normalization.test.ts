// Review-v7 URL normalization blockers: host/scheme/dot evasion must fail closed.
//
// Review-v7 found three blockers that let URL normalization-evasion forms pass
// the gate clean (0 candidates). Each form canonicalizes to a recognized
// GitHub host or a valid-looking URL but bypasses the detector's evasion
// filters, so a hidden producer reference could ride inside. This file pins
// each remediation as a RED test (now failing) plus GREEN controls proving
// already-correct behavior is preserved.
//
// Scope:
//   - B2 host normalization gaps / canonicalizeHostEvasion pipeline:
//       github\uFF61com          (halfwidth ideographic full stop)
//       github%E3%80%82com       (UTF-8 percent-encoded U+3002)
//       %2567ithub.com           (double percent-encoding)
//       GITHUB\u3002COM          (uppercase after Unicode dot)
//     Root cause: one ASCII percent-decode pass + U+3002/U+FF0E replacement
//     only; no UTF-8 decode, no second round, no post-canonical lowercase.
//   - B3 scheme slash variants / scanAuthorityForward colon branch:
//       https:github.com  (0 slashes after colon — WHATWG-valid)
//       https:/github.com (1 slash  — WHATWG-valid)
//     Root cause: scheme detection required exact "://"; the 0/1-slash forms
//     fell through and the leading ":" rejected the host at the left boundary.
//   - B4 mixed-encoded dot segments / hasDotSegment normalization:
//       decoy/.%2e/  and  decoy/%2e./  (literal dot + encoded %2e = "..")
//     Root cause: hasDotSegment matched ".", "..", "%2e", "%2e%2e" at the
//     segment level but not the mixed literal+encoded combinations.

import { describe, expect, test } from "bun:test";
import { extractUrls } from "./boundary-url-parser.ts";
import type { DetectorConfig } from "./boundary-pipeline.ts";
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

// Shared shape for every RED case: exactly one malformed URL whose ownership
// span is null, and a gate that fails with an evasion-attempt / unclassified
// error (malformed URLs resolve to unclassified/evasion-attempt per
// resolveCandidate, routed into gate.errors).
function expectMalformedEvasion(text: string): void {
  const { urls } = extractUrls(text, 64);
  expect(urls).toHaveLength(1);
  const u = urls[0];
  if (u === undefined) throw new Error("expected one malformed url");
  expect(u.malformed).toBe(true);
  expect(u.ownershipSpan).toBeNull();
  const g = gateFor(text);
  expect(g.pass).toBe(false);
  expect(g.errors.find((d) => d.category === "evasion-attempt")).toBeDefined();
  expect(g.errors.find((d) => d.classification === "unclassified")).toBeDefined();
}

// B2: host normalization gaps must fail closed.
describe("B2 host normalization gaps / canonicalizeHostEvasion fail closed", () => {
  test("github\uFF61com/... (halfwidth ideographic full stop U+FF61) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See github\uFF61com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("github%E3%80%82com/... (UTF-8 percent-encoded U+3002) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See github%E3%80%82com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("%2567ithub.com/... (double percent-encoding: %25→% then %67→g) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See %2567ithub.com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("GITHUB\u3002COM/... (uppercase after Unicode dot) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See GITHUB\u3002COM/yogata/agent-dev-flow/blob/main/x.md end.");
  });
});

// B3: scheme slash variants (WHATWG-valid 0/1-slash forms) must fail closed.
describe("B3 scheme slash variants / 0-or-1 slash fail closed", () => {
  test("https:github.com/... (0 slashes after colon) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See https:github.com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("https:/github.com/... (1 slash after colon) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See https:/github.com/yogata/agent-dev-flow/blob/main/x.md end.");
  });
});

// B4: mixed literal+encoded dot segments must fail closed.
describe("B4 mixed-encoded dot segments / .%2e and %2e. fail closed", () => {
  test("https://github.com/decoy/.%2e/... (.%2e = ..) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See https://github.com/decoy/.%2e/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("https://github.com/decoy/%2e./... (%2e. = ..) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See https://github.com/decoy/%2e./yogata/agent-dev-flow/blob/main/x.md end.");
  });
});

// GREEN controls: already-correct behavior must remain green.
describe("controls / already-correct behavior unchanged", () => {
  test("https://github.com/yogata/agent-dev-flow/blob/main/x.md → valid producer URL, gate FAIL (producer-internal)", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/x.md end.";
    const { urls } = extractUrls(text, 64);
    expect(urls).toHaveLength(1);
    const u = urls[0];
    if (u === undefined) throw new Error("expected one valid url");
    expect(u.malformed).toBe(false);
    const g = gateFor(text);
    expect(g.pass).toBe(false);
    expect(g.failures.find((d) => d.category === "fixed-url")?.classification).toBe("producer-internal");
  });

  test("%67ithub.com/... (single percent-decode, %67 = 'g') → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See %67ithub.com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("github\u3002com/... (Unicode dot U+3002) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See github\u3002com/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("github\uFF0Ecom/... (Unicode dot U+FF0E) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See github\uFF0Ecom/yogata/agent-dev-flow/blob/main/x.md end.");
  });

  test("https://github.com/decoy/../yogata/agent-dev-flow/blob/main/x.md (literal .. segment) → 1 malformed, gate FAIL", () => {
    expectMalformedEvasion("See https://github.com/decoy/../yogata/agent-dev-flow/blob/main/x.md end.");
  });
});
