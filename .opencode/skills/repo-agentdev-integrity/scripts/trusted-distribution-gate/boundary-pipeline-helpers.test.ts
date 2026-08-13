// Boundary-pipeline helper-function tests: normalizePathToken,
// detectCandidates, resolveCandidate. Extracted from
// boundary-pipeline.test.ts to keep that file under the 250 pure LOC
// ceiling (parent defect #12).

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
    expect(types).toContain("id");
    expect(types).toContain("path");
  });
});

describe("boundary-pipeline helpers / resolveCandidate", () => {
  test("known ID prefix resolves to producer-internal", () => {
    const r = resolveCandidate({ type: "id", value: "REQ-0001" }, baseConfig);
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("concrete-id");
  });

  test("unknown ID prefix resolves to unclassified (fail-closed)", () => {
    const r = resolveCandidate({ type: "id", value: "MYSTERY-99" }, baseConfig);
    expect(r.classification).toBe("unclassified");
    expect(r.category).toBe("unclassified-entry");
  });

  test("known path resolves to producer-internal (concrete)", () => {
    const r = resolveCandidate(
      { type: "path", value: "docs/requirements/REQ-0001.md" },
      baseConfig,
    );
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("concrete-path");
  });

  test("template path resolves to generic-or-template", () => {
    const r = resolveCandidate(
      { type: "path", value: "docs/specs/<domain>/x.md" },
      baseConfig,
    );
    expect(r.classification).toBe("generic-or-template");
  });

  test("producer-owned URL resolves to producer-internal (parent defect #5)", () => {
    const r = resolveCandidate(
      { type: "url", value: "https://github.com/yogata/agent-dev-flow/blob/main/x.md" },
      baseConfig,
    );
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("fixed-url");
  });

  test("external-repo URL resolves to consumer-resolvable (parent defect #5)", () => {
    const r = resolveCandidate(
      { type: "url", value: "https://github.com/vercel/next.js/blob/main/docs/x.md" },
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

describe("Stage A vocabulary amendment - evasion detection helpers", () => {
  const cfgWithStepQg: DetectorConfig = {
    ...baseConfig,
    distributed_workflow_control_prefixes: ["STEP", "QG"],
  };

  describe("ID-shaped evasion: \\uXXXX escape patterns", () => {
    test("detects evasion with \\uXXXX after producer prefix", () => {
      const r = resolveCandidate({ type: "evasion", value: "ADR-\\u0041" }, cfgWithStepQg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("evasion-attempt");
    });

    test("detects evasion with \\uXXXX after unknown prefix", () => {
      const r = resolveCandidate({ type: "evasion", value: "MYSTERY-\\u0041" }, cfgWithStepQg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("evasion-attempt");
    });

    test("detects evasion with \\uXXXX after STEP/QG prefix", () => {
      const r1 = resolveCandidate({ type: "evasion", value: "STEP-\\u0031" }, cfgWithStepQg);
      expect(r1.classification).toBe("unclassified");
      expect(r1.category).toBe("evasion-attempt");

      const r2 = resolveCandidate({ type: "evasion", value: "QG-\\u0032" }, cfgWithStepQg);
      expect(r2.classification).toBe("unclassified");
      expect(r2.category).toBe("evasion-attempt");
    });
  });

  describe("ID-shaped evasion: \\xXX escape patterns", () => {
    test("detects evasion with \\xXX after producer prefix", () => {
      const r = resolveCandidate({ type: "evasion", value: "REQ-\\x31" }, cfgWithStepQg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("evasion-attempt");
    });

    test("detects evasion with \\xXX after unknown prefix", () => {
      const r = resolveCandidate({ type: "evasion", value: "FOO-\\x42" }, cfgWithStepQg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("evasion-attempt");
    });
  });

  describe("ID-shaped evasion: 0xXX hex literal patterns", () => {
    test("detects evasion with 0xXX after producer prefix", () => {
      const r = resolveCandidate({ type: "evasion", value: "DEC-0x33" }, cfgWithStepQg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("evasion-attempt");
    });

    test("detects evasion with 0xXX after unknown prefix", () => {
      const r = resolveCandidate({ type: "evasion", value: "BAR-0x44" }, cfgWithStepQg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("evasion-attempt");
    });

    test("detects evasion with 0xXXXX (4-digit)", () => {
      const r = resolveCandidate({ type: "evasion", value: "SPEC-0x1234" }, cfgWithStepQg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("evasion-attempt");
    });
  });

  describe("distributed workflow control STEP/QG classification", () => {
    test("STEP-N resolves to generic-or-template with distributed-control", () => {
      const r = resolveCandidate({ type: "id", value: "STEP-1" }, cfgWithStepQg);
      expect(r.classification).toBe("generic-or-template");
      expect(r.category).toBe("distributed-control");
    });

    test("QG-N resolves to generic-or-template with distributed-control", () => {
      const r = resolveCandidate({ type: "id", value: "QG-2" }, cfgWithStepQg);
      expect(r.classification).toBe("generic-or-template");
      expect(r.category).toBe("distributed-control");
    });

    test("unknown prefix remains unclassified (fail-closed)", () => {
      const r = resolveCandidate({ type: "id", value: "UNKNOWN-99" }, cfgWithStepQg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("unclassified-entry");
    });

    test("producer prefixes remain concrete violations", () => {
      const r = resolveCandidate({ type: "id", value: "ADR-0001" }, cfgWithStepQg);
      expect(r.classification).toBe("producer-internal");
      expect(r.category).toBe("concrete-id");
    });
  });
});
