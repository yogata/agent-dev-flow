// Tests for the side-effect-free boundary detector pipeline.
//
// The detector must NOT be a closed (REQ|ADR|DEC) list. It must classify
// arbitrary producer-internal ID families, concrete docs paths (slash,
// backslash, URI-encoded), producer-repository fixed URLs (by configured
// identity), generic/template allowances, and fail-closed on unclassified
// input.
//
// Stage A vocabulary amendment / evasion regression coverage lives in
// boundary-pipeline-evasion.test.ts.

import { describe, expect, test } from "bun:test";
import {
  classifyLine,
  type DetectorConfig,
} from "./boundary-pipeline.ts";

const baseConfig: DetectorConfig = {
  repository_identity: {
    owner_slash_name: "yogata/agent-dev-flow",
    default_branch: "main",
  },
  // Default producer-internal ID prefixes observed in this repo plus an
  // extension slot for new families. The detector matches `<UPPER>-<digits>`
  // and classifies by whether the prefix is known producer-internal.
  producer_internal_id_prefixes: [
    "ADR",
    "REQ",
    "DEC",
    "SPEC",
    "IR",
    "RU",
    "TS",
    "AG",
    "OU",
    "EC",
  ],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
};

describe("boundary-pipeline / classifyLine", () => {
  test("accepts a clean line with no references", () => {
    const r = classifyLine(
      { text: "Just prose, no references.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    expect(r.detections).toEqual([]);
  });

  test("classifies known producer-internal concrete ID as violation", () => {
    const r = classifyLine(
      { text: "See ADR-0135 for the decision.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    expect(r.detections).toHaveLength(1);
    expect(r.detections[0]?.classification).toBe("producer-internal");
    expect(r.detections[0]?.category).toBe("concrete-id");
    expect(r.detections[0]?.matched).toBe("ADR-0135");
  });

  test("rejects 5+ digit IDs (extended width)", () => {
    const r = classifyLine(
      { text: "REQ-100002 is the future.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    expect(r.detections).toHaveLength(1);
    expect(r.detections[0]?.classification).toBe("producer-internal");
  });

  test("detects arbitrary new producer-internal ID family when prefix is configured", () => {
    const cfg: DetectorConfig = {
      ...baseConfig,
      producer_internal_id_prefixes: [...baseConfig.producer_internal_id_prefixes, "FOO"],
    };
    const r = classifyLine(
      { text: "Track via FOO-42.", lineNumber: 1, filePath: "f.md", projection: "source" },
      cfg,
    );
    expect(r.detections[0]?.classification).toBe("producer-internal");
    expect(r.detections[0]?.matched).toBe("FOO-42");
  });

  test("fails closed on unknown ID family (unclassified, not consumer-resolvable)", () => {
    // JIRA-123 has an unknown prefix; pipeline must NOT silently allow it.
    const r = classifyLine(
      { text: "Track via JIRA-123.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    expect(r.detections).toHaveLength(1);
    expect(r.detections[0]?.classification).toBe("unclassified");
    expect(r.detections[0]?.category).toBe("unclassified-entry");
  });

  test("allows ID template placeholders", () => {
    const r = classifyLine(
      { text: "Pattern REQ-{NNNN} is fine.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    expect(r.detections).toEqual([]);
  });

  test("allows ID glob placeholders", () => {
    const r = classifyLine(
      { text: "Pattern REQ-* matches all.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    expect(r.detections).toEqual([]);
  });

  test("allows ID angle-bracket placeholders", () => {
    const r = classifyLine(
      { text: "Pattern <REQ-NNNN> placeholder.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    expect(r.detections).toEqual([]);
  });

  test("detects concrete docs path under requirements", () => {
    const r = classifyLine(
      { text: "Bad: docs/requirements/REQ-0149.md is concrete.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const pathDetection = r.detections.find((d) => d.category === "concrete-path");
    expect(pathDetection).toBeDefined();
    expect(pathDetection?.classification).toBe("producer-internal");
  });

  test("allows docs README index", () => {
    const r = classifyLine(
      { text: "See docs/adr/README.md for the index.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const pathDetection = r.detections.find((d) => d.category === "concrete-path");
    expect(pathDetection?.classification).toBe("generic-or-template");
  });

  test("allows docs path template (no producer-internal detection)", () => {
    const r = classifyLine(
      { text: "Pattern docs/specs/<domain>/<spec>.md is fine.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const producerInternal = r.detections.find((d) => d.classification === "producer-internal");
    expect(producerInternal).toBeUndefined();
  });

  test("allows docs path glob (no producer-internal detection)", () => {
    const r = classifyLine(
      { text: "Glob docs/requirements/REQ-*.md is fine.", lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const producerInternal = r.detections.find((d) => d.classification === "producer-internal");
    expect(producerInternal).toBeUndefined();
  });

  test("detects producer-internal fixed URL (github blob path under docs/)", () => {
    const r = classifyLine(
      { text: "See https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const urlDetection = r.detections.find((d) => d.category === "fixed-url");
    expect(urlDetection).toBeDefined();
    expect(urlDetection?.classification).toBe("producer-internal");
  });

  test("detects producer-internal same-repo URL OUTSIDE docs/ (scripts path)", () => {
    // Regression: parent defect #5. URL into producer's own repo is
    // producer-internal regardless of path (docs, scripts, src, etc.).
    const r = classifyLine(
      { text: "See https://github.com/yogata/agent-dev-flow/blob/main/scripts/install.ps1",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const urlDetection = r.detections.find((d) => d.category === "fixed-url");
    expect(urlDetection).toBeDefined();
    expect(urlDetection?.classification).toBe("producer-internal");
  });

  test("allows external repo URL even when it points at external docs/", () => {
    // Regression: parent defect #5. URL into a DIFFERENT repo's docs/ is
    // consumer-resolvable (was incorrectly producer-internal under the
    // old /docs/-only check).
    const r = classifyLine(
      { text: "See https://github.com/vercel/next.js/blob/main/docs/tutorial.md",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const urlDetection = r.detections.find((d) => d.category === "fixed-url");
    expect(urlDetection).toBeDefined();
    expect(urlDetection?.classification).toBe("consumer-resolvable");
  });

  test("producer-internal URL match is case-insensitive on owner/repo", () => {
    // GitHub owner/repo names are case-insensitive (legacy).
    const r = classifyLine(
      { text: "See https://github.com/Yogata/Agent-Dev-Flow/blob/main/x.md",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const urlDetection = r.detections.find((d) => d.category === "fixed-url");
    expect(urlDetection?.classification).toBe("producer-internal");
  });

  test("allows external github URL outside docs/", () => {
    const r = classifyLine(
      { text: "See https://github.com/vercel/next.js/blob/main/src/index.ts",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const urlDetection = r.detections.find((d) => d.category === "fixed-url");
    expect(urlDetection?.classification).toBe("consumer-resolvable");
  });

  test("detects raw.githubusercontent producer-internal URL", () => {
    const r = classifyLine(
      { text: "Raw: raw.githubusercontent.com/yogata/agent-dev-flow/main/docs/specs/system.md",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const urlDetection = r.detections.find((d) => d.category === "fixed-url");
    expect(urlDetection?.classification).toBe("producer-internal");
  });

  test("normalizes backslash path token before classification", () => {
    const r = classifyLine(
      { text: "Bad: docs\\requirements\\REQ-0001.md is concrete on Windows.",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const pathDetection = r.detections.find((d) => d.category === "concrete-path");
    expect(pathDetection).toBeDefined();
    expect(pathDetection?.classification).toBe("producer-internal");
  });

  test("normalizes percent-encoded path before classification", () => {
    // docs%2Frequirements%2FREQ-0001.md 窶・URI-encoded slashes
    const r = classifyLine(
      { text: "Bad: docs%2Frequirements%2FREQ-0001.md is encoded.",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      baseConfig,
    );
    const pathDetection = r.detections.find((d) => d.category === "concrete-path");
    expect(pathDetection?.classification).toBe("producer-internal");
  });

  test("does NOT detect producer-internal when repository identity is empty", () => {
    const cfg: DetectorConfig = {
      ...baseConfig,
      repository_identity: { owner_slash_name: "", default_branch: "main" },
    };
    const r = classifyLine(
      { text: "See https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md",
        lineNumber: 1, filePath: "f.md", projection: "source" },
      cfg,
    );
    const urlDetection = r.detections.find((d) => d.category === "fixed-url");
    // No identity configured: URL extraction itself is suppressed to avoid
    // false positives. fail-closed is via the empty identity contract.
    expect(urlDetection).toBeUndefined();
  });
});
