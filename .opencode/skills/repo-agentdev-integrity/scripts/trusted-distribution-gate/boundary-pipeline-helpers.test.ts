// Boundary-pipeline helper-function tests: normalizePathToken,
// detectCandidates, resolveCandidate. Extracted from
// boundary-pipeline.test.ts to keep that file under the 250 pure LOC
// ceiling (parent defect #12).
//
// Stage A vocabulary amendment / evasion helper coverage lives in
// boundary-pipeline-evasion.test.ts.

import { describe, expect, test } from "bun:test";
import {
  detectCandidates,
  isConcreteDocsPath,
  normalizePathToken,
  resolveCandidate,
  type DetectorConfig,
} from "./boundary-pipeline.ts";

const baseConfig: DetectorConfig = {
  repository_identity: {
    owner_slash_name: "yogata/agent-dev-flow",
    default_branch: "main",
  },
  producer_internal_id_prefixes: [
    "ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC",
  ],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

describe("boundary-pipeline helpers / normalizePathToken", () => {
  test("passes forward-slash through", () => {
    expect(normalizePathToken("docs/foo/bar.md")).toBe("docs/foo/bar.md");
  });
  test("converts backslashes to forward slashes", () => {
    expect(normalizePathToken("docs\\foo\\bar.md")).toBe("docs/foo/bar.md");
  });
  test("decodes percent-encoded slashes", () => {
    expect(normalizePathToken("docs%2Ffoo%2Fbar.md")).toBe("docs/foo/bar.md");
  });
  test("mixed encoding", () => {
    expect(normalizePathToken("docs%2Ffoo\\bar.md")).toBe("docs/foo/bar.md");
  });
});

describe("boundary-pipeline helpers / detectCandidates", () => {
  test("returns empty for clean line", () => {
    expect(detectCandidates("clean line", baseConfig)).toEqual([]);
  });

  test("returns multiple candidates for mixed line", () => {
    const cs = detectCandidates("See ADR-0001 and docs/specs/ADR-0002.md", baseConfig);
    expect(cs.length).toBeGreaterThanOrEqual(2);
    const types = cs.map((c) => c.type).sort();
    expect(types).toContain("direct-id");
    expect(types).toContain("path");
  });
});

describe("boundary-pipeline helpers / resolveCandidate", () => {
  // resolveCandidate ignores span; placeholder satisfies the typed union.
  const S = { start: 0, end: 1 };
  test("known ID prefix resolves to producer-internal", () => {
    const r = resolveCandidate({ type: "direct-id", value: "REQ-0001", span: S }, baseConfig);
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("concrete-id");
  });

  test("unknown ID prefix resolves to unclassified (fail-closed)", () => {
    const r = resolveCandidate({ type: "direct-id", value: "MYSTERY-99", span: S }, baseConfig);
    expect(r.classification).toBe("unclassified");
    expect(r.category).toBe("unclassified-entry");
  });

  test("known path resolves to producer-internal (concrete)", () => {
    const r = resolveCandidate(
      { type: "path", value: "docs/requirements/REQ-0001.md", span: S },
      baseConfig,
    );
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("concrete-path");
  });

  test("template path resolves to generic-or-template", () => {
    const r = resolveCandidate(
      { type: "path", value: "docs/specs/<domain>/x.md", span: S },
      baseConfig,
    );
    expect(r.classification).toBe("generic-or-template");
  });

  test("producer-owned URL resolves to producer-internal (parent defect #5)", () => {
    const r = resolveCandidate(
      { type: "url", value: "https://github.com/yogata/agent-dev-flow/blob/main/x.md", span: S },
      baseConfig,
    );
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("fixed-url");
  });

  test("external-repo URL resolves to consumer-resolvable (parent defect #5)", () => {
    const r = resolveCandidate(
      { type: "url", value: "https://github.com/vercel/next.js/blob/main/docs/x.md", span: S },
      baseConfig,
    );
    expect(r.classification).toBe("consumer-resolvable");
    expect(r.category).toBe("fixed-url");
  });
});

describe("boundary-pipeline helpers / isConcreteDocsPath", () => {
  test("rejects README index", () => {
    expect(isConcreteDocsPath("docs/adr/README.md")).toBe(false);
  });
  test("rejects template", () => {
    expect(isConcreteDocsPath("docs/specs/<domain>/<spec>.md")).toBe(false);
  });
  test("rejects glob", () => {
    expect(isConcreteDocsPath("docs/requirements/REQ-*.md")).toBe(false);
  });
  test("rejects non-markdown", () => {
    expect(isConcreteDocsPath("docs/adr/ADR-0001.txt")).toBe(false);
  });
  test("accepts concrete markdown file", () => {
    expect(isConcreteDocsPath("docs/adr/ADR-0001.md")).toBe(true);
  });
});
