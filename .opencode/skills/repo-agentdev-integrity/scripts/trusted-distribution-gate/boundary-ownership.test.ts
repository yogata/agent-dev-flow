// URL/path ownership and reconstructed-vs-direct dedup coverage.
//
// Ownership order: URL > path > reconstructed > direct. A higher-precedence
// candidate suppresses lower-precedence candidates whose spans it contains
// (URL/path) or overlaps (reconstructed over direct). Standalone IDs and
// paths outside URLs are preserved.

import { describe, expect, test } from "bun:test";
import {
  classifyLine,
  detectCandidates,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import { decideProjection, type ClassifyFileInput } from "./boundary-gate.ts";
import { ownershipMask, type OwnershipEntry } from "./boundary-candidate-ownership.ts";

const baseConfig: DetectorConfig = {
  repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

function cls(text: string) {
  return classifyLine({ text, lineNumber: 1, filePath: "f.md", projection: "source" }, baseConfig);
}
function gate(text: string) {
  const f: ClassifyFileInput[] = [{ filePath: "f.md", projection: "source", text }];
  return decideProjection(f, "source", baseConfig).gate;
}

describe("URL ownership / external URL suppresses contained IDs and paths", () => {
  test("external URL with embedded ADR + docs path is consumer-resolvable only", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/docs/specs/ADR-0001.md";
    const cs = detectCandidates(text, baseConfig);
    expect(cs.map((c) => c.type)).toEqual(["url"]);
    const g = gate(text);
    expect(g.pass).toBe(true);
    const url = cs.find((c): c is Extract<typeof c, { type: "url" }> => c.type === "url");
    expect(url).toBeDefined();
  });

  test("external URL keeps consumer-resolvable classification", () => {
    const r = cls("See https://github.com/vercel/next.js/blob/main/docs/specs/ADR-0001.md");
    const urlDet = r.detections.find((d) => d.category === "fixed-url");
    expect(urlDet?.classification).toBe("consumer-resolvable");
  });
});

describe("URL ownership / producer URL remains a producer failure", () => {
  test("producer URL with embedded ADR + path: only URL candidate, producer-internal", () => {
    const text = "See https://github.com/yogata/agent-dev-flow/blob/main/docs/specs/ADR-0001.md";
    const cs = detectCandidates(text, baseConfig);
    expect(cs.map((c) => c.type)).toEqual(["url"]);
    const g = gate(text);
    expect(g.failures.some((f) => f.classification === "producer-internal" && f.category === "fixed-url")).toBe(true);
  });
});

describe("URL ownership / standalone ID and path detection preserved", () => {
  test("standalone ADR-0001 next to a URL is still detected", () => {
    const text = "See ADR-0001 and https://github.com/vercel/next.js/blob/main/x.md";
    const cs = detectCandidates(text, baseConfig);
    const direct = cs.find((c): c is Extract<typeof c, { type: "direct-id" }> => c.type === "direct-id");
    expect(direct?.value).toBe("ADR-0001");
  });

  test("standalone docs path next to a URL is still detected", () => {
    const text = "See https://github.com/vercel/next.js/blob/main/x.md and docs/requirements/REQ-0001.md";
    const cs = detectCandidates(text, baseConfig);
    const path = cs.find((c): c is Extract<typeof c, { type: "path" }> => c.type === "path");
    expect(path).toBeDefined();
  });
});

describe("ownershipMask / reconstructed suppresses overlapping direct", () => {
  test("direct fully inside reconstructed span is suppressed", () => {
    const entries: OwnershipEntry[] = [
      { span: { start: 0, end: 10 }, precedence: "reconstructed" },
      { span: { start: 0, end: 6 }, precedence: "direct" },
    ];
    expect(ownershipMask(entries)).toEqual([true, false]);
  });

  test("same-value reconstructed and direct (same span) dedup to reconstructed", () => {
    const entries: OwnershipEntry[] = [
      { span: { start: 0, end: 8 }, precedence: "reconstructed" },
      { span: { start: 0, end: 8 }, precedence: "direct" },
    ];
    expect(ownershipMask(entries)).toEqual([true, false]);
  });

  test("non-overlapping direct and reconstructed both survive", () => {
    const entries: OwnershipEntry[] = [
      { span: { start: 0, end: 6 }, precedence: "direct" },
      { span: { start: 10, end: 18 }, precedence: "reconstructed" },
    ];
    expect(ownershipMask(entries)).toEqual([true, true]);
  });
});
