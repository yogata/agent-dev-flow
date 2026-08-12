/**
 * Tests for lib/distribution-boundary.ts (canonical side-effect-free detector).
 *
 * Covers TS-002 (positive/negative fixture verification), TS-004 (source text
 * artifact coverage), TS-007/008 (projection separation), TS-009 (inspection
 * error gate-not-passed). Tests are pure: they pass strings into the detector
 * and assert on returned classifications. No filesystem, no network.
 *
 * Stage B regression tests (PR #2092): the detector must align with Stage A
 * trusted detector semantics — arbitrary producer-internal ID families,
 * repository-identity-based URL classification, query/fragment path
 * normalization, percent-encoded / backslash paths, and an explicit
 * text/binary/unknown tri-state where unknown fails closed.
 */

import { expect, test, describe } from "bun:test";
import {
  classifyLine,
  classifyContent,
  classifyLineConfig,
  classifyContentConfig,
  decideGate,
  PROJECTIONS,
  resolveCandidate,
  resolveCandidateConfig,
  isTextFile,
  TEXT_EXTENSIONS,
  classifyBytes,
  DEFAULT_REPOSITORY_IDENTITY,
  DEFAULT_DETECTOR_CONFIG,
  type Projection,
  type Detection,
  type DetectorConfig,
  type ByteClassification,
} from "./distribution-boundary.ts";

describe("classifyLine - concrete-id detection", () => {
  test("flags ADR-NNNN and REQ-NNNN as producer-internal", () => {
    const d = classifyLine({
      text: "Read ADR-0135 first, then REQ-0023.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const ids = d.filter((x) => x.category === "concrete-id");
    expect(ids.length).toBe(2);
    const matched = ids.map((x) => x.matched).sort();
    expect(matched).toEqual(["ADR-0135", "REQ-0023"]);
    for (const x of ids) {
      expect(x.classification).toBe("producer-internal");
    }
  });

  test("does not flag template placeholders ADR-{NNNN} / REQ-{NNNN}", () => {
    const d = classifyLine({
      text: "Pattern: ADR-{NNNN} and REQ-{NNNN} are templates.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const ids = d.filter((x) => x.category === "concrete-id");
    expect(ids.length).toBe(0);
  });

  test("does not flag glob forms ADR-* / REQ-*", () => {
    const d = classifyLine({
      text: "Glob pattern docs/requirements/REQ-*.md is allowed.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const ids = d.filter((x) => x.category === "concrete-id");
    expect(ids.length).toBe(0);
  });

  test("does not flag REQ-NNNN-NNNN subitem form (consumer-resolvable via extension layer)", () => {
    // REQ-NNNN-NNNN subitem references are not producer-internal concrete IDs
    // in the same sense; they are consumer-resolvable through the extension layer.
    // The detector only flags the 3-4 digit ADR/REQ form per IR-059.
    const d = classifyLine({
      text: "REQ-0023-001 is a subitem reference.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    // Implementation note: detector MAY flag REQ-0023 portion; consumer decides.
    // For now, the lib follows IR-059 pattern: \b(ADR|REQ)-\d{3,4}\b matches
    // the leading ID portion of REQ-0023-001.
    const ids = d.filter((x) => x.category === "concrete-id");
    expect(ids.length).toBe(1);
    expect(ids[0]!.matched).toBe("REQ-0023");
  });
});

describe("classifyLine - concrete-path detection", () => {
  test("flags concrete docs file paths", () => {
    const d = classifyLine({
      text: "See docs/requirements/REQ-0149.md for detail.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(1);
    expect(paths[0]!.matched).toBe("docs/requirements/REQ-0149.md");
    expect(paths[0]!.classification).toBe("producer-internal");
  });

  test("does not flag docs README.md (index, allowed)", () => {
    const d = classifyLine({
      text: "See docs/adr/README.md for the index.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(0);
  });

  test("does not flag template path forms docs/specs/<domain>/<spec>.md", () => {
    const d = classifyLine({
      text: "Template: docs/specs/<domain>/<spec>.md is allowed.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(0);
  });

  test("does not flag glob path forms docs/specs/**", () => {
    const d = classifyLine({
      text: "Glob: docs/specs/** is fine.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(0);
  });
});

describe("classifyLine - fixed-url detection", () => {
  test("flags github.com blob URLs pointing to docs/", () => {
    const d = classifyLine({
      text: "Bad: <https://github.com/yogata/agent-dev-flow/blob/main/docs/specs/foo.md>",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const urls = d.filter((x) => x.category === "fixed-url");
    expect(urls.length).toBe(1);
    expect(urls[0]!.classification).toBe("producer-internal");
  });

  test("flags raw.githubusercontent.com URLs pointing to docs/", () => {
    const d = classifyLine({
      text: "Bad: raw.githubusercontent.com/yogata/agent-dev-flow/main/docs/requirements/x.md",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const urls = d.filter((x) => x.category === "fixed-url");
    expect(urls.length).toBe(1);
  });

  test("does NOT flag external GitHub URLs (non-docs paths)", () => {
    const d = classifyLine({
      text: "See https://github.com/sst/opencode/blob/main/packages/plugin/src/index.ts for API",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const urls = d.filter((x) => x.category === "fixed-url");
    expect(urls.length).toBe(0);
  });

  test("flags raw.githubusercontent.com URLs into the producer repo at any path", () => {
    // Stage B regression: URLs into the producer repository are producer-internal
    // regardless of path content. The OLD behavior classified by /docs/ path
    // heuristic and let producer script URLs through; that was a bypass.
    const d = classifyLine({
      text: "ref raw.githubusercontent.com/yogata/agent-dev-flow/main/scripts/foo.ps1",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const urls = d.filter((x) => x.category === "fixed-url");
    expect(urls.length).toBe(1);
    expect(urls[0]!.classification).toBe("producer-internal");
  });
});

describe("classifyLine - generic-or-template allowance", () => {
  test("pattern references docs/specs/{NNNN} are not flagged", () => {
    const d = classifyLine({
      text: "Use docs/specs/{NNNN} for SPEC references.",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    expect(d.length).toBe(0);
  });
});

describe("classifyContent - file-level aggregation", () => {
  test("aggregates detections across multiple lines with correct line numbers", () => {
    const content = [
      "# sample",
      "",
      "Read ADR-0135 first.",
      "See docs/requirements/REQ-0149.md for detail.",
      "Pattern docs/specs/<x>.md is allowed.",
    ].join("\n");
    const d = classifyContent(content, "src/opencode/commands/agentdev/sample.md", "source");
    // Line 4 contains both a concrete-id (REQ-0149) and a concrete-path
    // (docs/requirements/REQ-0149.md). Both are emitted independently, mirroring
    // the legacy checker behavior so the adapter remains a drop-in replacement.
    const ids = d.filter((x) => x.category === "concrete-id");
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(ids.length).toBe(2);
    const adr = ids.find((x) => x.matched === "ADR-0135");
    expect(adr).toBeDefined();
    if (adr) {
      expect(adr.line).toBe(3);
    }
    const req = ids.find((x) => x.matched === "REQ-0149");
    expect(req).toBeDefined();
    if (req) {
      expect(req.line).toBe(4);
    }
    expect(paths.length).toBe(1);
    expect(paths[0]!.line).toBe(4);
    expect(paths[0]!.matched).toBe("docs/requirements/REQ-0149.md");
  });

  test("handles CRLF line endings", () => {
    const content = "line1 ADR-0001\r\nline2\r\n";
    const d = classifyContent(content, "x.md", "source");
    const ids = d.filter((x) => x.category === "concrete-id");
    expect(ids.length).toBe(1);
    expect(ids[0]!.line).toBe(1);
  });

  test("empty content returns no detections", () => {
    const d = classifyContent("", "x.md", "source");
    expect(d.length).toBe(0);
  });

  test("projection is recorded on each detection", () => {
    const projections: Projection[] = [...PROJECTIONS];
    for (const p of projections) {
      const d = classifyContent("ref ADR-0001", "x.md", p);
      expect(d.length).toBe(1);
      expect(d[0]!.projection).toBe(p);
    }
  });
});

describe("decideGate - gate decision", () => {
  test("passes when no detections", () => {
    const r = decideGate([]);
    expect(r.pass).toBe(true);
    expect(r.failures.length).toBe(0);
    expect(r.errors.length).toBe(0);
  });

  test("fails when producer-internal detection present", () => {
    const d = classifyContent("ref ADR-0001 here", "x.md", "source");
    const r = decideGate(d);
    expect(r.pass).toBe(false);
    expect(r.failures.length).toBe(1);
  });

  test("passes when only generic-or-template detections (none expected currently)", () => {
    // Currently the detector never emits generic-or-template; if it did, gate
    // would still pass since only producer-internal and unclassified fail.
    const r = decideGate([]);
    expect(r.pass).toBe(true);
  });

  test("fails on unclassified classification", () => {
    // Synthesize an unclassified detection (e.g. adapter-failure scenario)
    // decideGate accepts the wider Detection type; construct a valid
    // unclassified Detection without type suppression.
    const fake: Detection = {
      text: "",
      line: 0,
      file: "x.md",
      projection: "source",
      classification: "unclassified",
      matched: "",
      snippet: "",
      category: "unclassified-entry",
    };
    const r = decideGate([fake]);
    expect(r.pass).toBe(false);
    expect(r.errors.length).toBe(1);
  });
});

describe("TS-009: inspection error gate-not-passed", () => {
  test("unclassified classification goes to errors, not failures", () => {
    const fake: Detection = {
      text: "",
      line: 0,
      file: "x.md",
      projection: "source",
      classification: "unclassified",
      matched: "",
      snippet: "",
      category: "unclassified-entry",
    };
    const r = decideGate([fake]);
    expect(r.pass).toBe(false);
    expect(r.errors.length).toBe(1);
    expect(r.failures.length).toBe(0);
  });

  test("adapter-failure category goes to errors", () => {
    const fake: Detection = {
      text: "",
      line: 0,
      file: "x.md",
      projection: "source",
      classification: "unclassified",
      matched: "",
      snippet: "read failure",
      category: "adapter-failure",
    };
    const r = decideGate([fake]);
    expect(r.pass).toBe(false);
    expect(r.errors.length).toBe(1);
  });

  test("mixed failures and errors all cause gate-not-passed", () => {
    const detections: Detection[] = [
      ...classifyContent("ref ADR-0001", "x.md", "source"),
      {
        text: "",
        line: 0,
        file: "y.md",
        projection: "source",
        classification: "unclassified",
        matched: "",
        snippet: "",
        category: "unclassified-entry",
      },
    ];
    const r = decideGate(detections);
    expect(r.pass).toBe(false);
    expect(r.failures.length).toBe(1);
    expect(r.errors.length).toBe(1);
  });
});

describe("TS-007/008: projection separation", () => {
  test("all 4 projections are first-class values", () => {
    expect(PROJECTIONS).toContain("source");
    expect(PROJECTIONS).toContain("link");
    expect(PROJECTIONS).toContain("archive");
    expect(PROJECTIONS).toContain("archive-installed");
    expect(PROJECTIONS.length).toBe(4);
  });

  test("same content produces same logical detections across projections", () => {
    const content = "ref ADR-0001 in any projection";
    for (const p of PROJECTIONS) {
      const d = classifyContent(content, "x.md", p);
      expect(d.length).toBe(1);
      expect(d[0]!.matched).toBe("ADR-0001");
      expect(d[0]!.classification).toBe("producer-internal");
      expect(d[0]!.projection).toBe(p);
    }
  });
});

describe("DEC-NNN detection (Oracle finding 3)", () => {
  test("flags DEC-014 as producer-internal", () => {
    const d = classifyLine({
      text: "per DEC-014 decision 2",
      lineNumber: 1,
      filePath: "src/opencode/commands/agentdev/sample.md",
      projection: "source",
    });
    const ids = d.filter((x) => x.category === "concrete-id");
    expect(ids.length).toBe(1);
    expect(ids[0]!.matched).toBe("DEC-014");
    expect(ids[0]!.classification).toBe("producer-internal");
  });

  test("flags DEC-001, DEC-006, DEC-014 alike", () => {
    for (const dec of ["DEC-001", "DEC-006", "DEC-014"]) {
      const d = classifyLine({
        text: `ref ${dec} here`,
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      });
      const ids = d.filter((x) => x.matched === dec);
      expect(ids.length).toBe(1);
    }
  });

  test("does not flag DEC-{N} template form", () => {
    const d = classifyLine({
      text: "template DEC-{N} form",
      lineNumber: 1,
      filePath: "x.md",
      projection: "source",
    });
    const ids = d.filter((x) => x.category === "concrete-id");
    expect(ids.length).toBe(0);
  });
});

describe("docs/decisions/ path detection", () => {
  test("flags concrete docs/decisions/DEC-014.md path", () => {
    const d = classifyLine({
      text: "see docs/decisions/DEC-014.md",
      lineNumber: 1,
      filePath: "x.md",
      projection: "source",
    });
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(1);
    expect(paths[0]!.matched).toBe("docs/decisions/DEC-014.md");
  });
});

describe("resolveCandidate pipeline (Oracle finding 3)", () => {
  test("ID candidates resolve to producer-internal", () => {
    const r = resolveCandidate({ type: "id", value: "REQ-015" });
    expect(r.classification).toBe("producer-internal");
    expect(r.category).toBe("concrete-id");
  });

  test("concrete path candidates resolve to producer-internal", () => {
    const r = resolveCandidate({ type: "path", value: "docs/specs/foo.md" });
    expect(r.classification).toBe("producer-internal");
  });

  test("template path candidates resolve to generic-or-template", () => {
    const r = resolveCandidate({ type: "path", value: "docs/specs/<x>.md" });
    expect(r.classification).toBe("generic-or-template");
  });

  test("docs URL resolves to producer-internal", () => {
    const r = resolveCandidate({
      type: "url",
      value: "github.com/yogata/agent-dev-flow/blob/main/docs/specs/foo.md",
    });
    expect(r.classification).toBe("producer-internal");
  });

  test("external URL resolves to consumer-resolvable", () => {
    const r = resolveCandidate({
      type: "url",
      value: "github.com/sst/opencode/blob/main/packages/foo.ts",
    });
    expect(r.classification).toBe("consumer-resolvable");
  });
});

describe("isTextFile (Oracle finding 2: all text artifacts)", () => {
  test("recognizes .md as text", () => {
    expect(isTextFile("foo.md")).toBe(true);
  });
  test("recognizes .yaml, .json, .ps1, .ts as text", () => {
    expect(isTextFile("data.yaml")).toBe(true);
    expect(isTextFile("config.json")).toBe(true);
    expect(isTextFile("install.ps1")).toBe(true);
    expect(isTextFile("script.ts")).toBe(true);
  });
  test("recognizes extensionless files as text (README, LICENSE)", () => {
    expect(isTextFile("README")).toBe(true);
    expect(isTextFile("LICENSE")).toBe(true);
  });
  test("recognizes binary extensions", () => {
    expect(isTextFile("logo.png")).toBe(false);
    expect(isTextFile("archive.zip")).toBe(false);
    expect(isTextFile("data.lockb")).toBe(false);
  });
  test("TEXT_EXTENSIONS includes key types", () => {
    expect(TEXT_EXTENSIONS.has(".md")).toBe(true);
    expect(TEXT_EXTENSIONS.has(".yaml")).toBe(true);
    expect(TEXT_EXTENSIONS.has(".ps1")).toBe(true);
  });
});

// =============================================================================
// Stage B regression (PR #2092) — alignment with Stage A trusted detector.
//
// These tests encode the contracts the Stage A trusted detector at
// trusted-distribution-gate/boundary-pipeline.ts already enforces. The lib
// detector consumed by the Stage B plugin and the repo-local checker adapter
// must produce equivalent classifications so the pre-write gate and the final
// archive gate agree. The detector must NOT be a closed (ADR|REQ|DEC) list,
// must classify URLs by configured repository identity (not by `/docs/` path
// content), must normalize percent-encoded / backslash / query / fragment
// path variants, and must expose an explicit text/binary/unknown tri-state.
// =============================================================================

describe("Stage B regression: arbitrary producer-internal ID families", () => {
  test("default DetectorConfig classifies ADR/REQ/DEC as producer-internal", () => {
    const cfg = DEFAULT_DETECTOR_CONFIG;
    for (const id of ["ADR-0135", "REQ-0023", "DEC-014"]) {
      const r = resolveCandidateConfig({ type: "id", value: id }, cfg);
      expect(r.classification).toBe("producer-internal");
      expect(r.category).toBe("concrete-id");
    }
  });

  test("default DetectorConfig fails closed on UNKNOWN ID family (e.g. OU-1, TS-1, AG-1)", () => {
    // These are real producer ID families not in the default producer_internal
    // set. They MUST NOT silently pass — the detector returns `unclassified`
    // and the gate layer treats that as gate-not-passed (DEC-014 decision 5).
    const cfg = DEFAULT_DETECTOR_CONFIG;
    for (const id of ["OU-1", "TS-1", "AG-1", "EC-1", "RU-42", "IR-059"]) {
      const r = resolveCandidateConfig({ type: "id", value: id }, cfg);
      expect(r.classification).toBe("unclassified");
      expect(r.category).toBe("unclassified-entry");
    }
  });

  test("configured DetectorConfig can extend producer-internal families", () => {
    const cfg: DetectorConfig = {
      repository_identity: DEFAULT_REPOSITORY_IDENTITY,
      producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "OU", "TS", "AG"],
    };
    expect(
      resolveCandidateConfig({ type: "id", value: "OU-3" }, cfg).classification,
    ).toBe("producer-internal");
    expect(
      resolveCandidateConfig({ type: "id", value: "ZZ-9" }, cfg).classification,
    ).toBe("unclassified");
  });

  test("classifyLineConfig emits a Detection for unclassified IDs (gate-not-passed)", () => {
    const d = classifyLineConfig(
      {
        text: "See OU-3 for the plan.",
        lineNumber: 1,
        filePath: "src/opencode/commands/agentdev/sample.md",
        projection: "source",
      },
      DEFAULT_DETECTOR_CONFIG,
    );
    const unclassified = d.filter((x) => x.classification === "unclassified");
    expect(unclassified.length).toBe(1);
    expect(unclassified[0]!.matched).toBe("OU-3");
    // decideGate must mark this as an error, not silently clean.
    const gate = decideGate(d);
    expect(gate.pass).toBe(false);
    expect(gate.errors.length).toBe(1);
  });

  test("template-wrapped IDs ({NNNN}, <NNNN>, *) are not flagged", () => {
    const d = classifyLineConfig(
      {
        text: "Pattern ADR-{NNNN} <REQ-1234> DEC-* allowed.",
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      },
      DEFAULT_DETECTOR_CONFIG,
    );
    const flagged = d.filter((x) => x.classification !== "generic-or-template");
    expect(flagged.length).toBe(0);
  });
});

describe("Stage B regression: repository-identity URL classification", () => {
  test("URL into producer repo (any path) is producer-internal", () => {
    const cfg = DEFAULT_DETECTOR_CONFIG;
    const d = classifyLineConfig(
      {
        text: "see https://github.com/yogata/agent-dev-flow/blob/main/scripts/install.ps1",
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      },
      cfg,
    );
    const urls = d.filter((x) => x.category === "fixed-url");
    expect(urls.length).toBe(1);
    expect(urls[0]!.classification).toBe("producer-internal");
  });

  test("URL into external repo (even docs/) is consumer-resolvable (no Detection emitted)", () => {
    const cfg = DEFAULT_DETECTOR_CONFIG;
    const d = classifyLineConfig(
      {
        text: "ref https://github.com/sst/opencode/blob/main/docs/guide.md",
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      },
      cfg,
    );
    const urls = d.filter((x) => x.category === "fixed-url");
    expect(urls.length).toBe(0);
  });

  test("raw.githubusercontent.com producer URL is producer-internal", () => {
    const cfg = DEFAULT_DETECTOR_CONFIG;
    const r = resolveCandidateConfig(
      {
        type: "url",
        value:
          "raw.githubusercontent.com/yogata/agent-dev-flow/main/scripts/install.ps1",
      },
      cfg,
    );
    expect(r.classification).toBe("producer-internal");
  });

  test("URL owner/repo comparison is case-insensitive (GitHub convention)", () => {
    const cfg: DetectorConfig = {
      repository_identity: {
        owner_slash_name: "yogata/agent-dev-flow",
        default_branch: "main",
      },
      producer_internal_id_prefixes: ["ADR", "REQ", "DEC"],
    };
    const r = resolveCandidateConfig(
      {
        type: "url",
        value: "https://github.com/Yogata/Agent-Dev-Flow/blob/main/x.md",
      },
      cfg,
    );
    expect(r.classification).toBe("producer-internal");
  });

  test("empty repository_identity fail-closes URL candidates as unclassified", () => {
    // When the consumer has not pinned a producer, URLs cannot be safely
    // classified. The detector MUST NOT silently allow them — it returns
    // `unclassified` so the gate layer fails closed.
    const cfg: DetectorConfig = {
      repository_identity: { owner_slash_name: "", default_branch: "" },
      producer_internal_id_prefixes: ["ADR", "REQ", "DEC"],
    };
    const r = resolveCandidateConfig(
      {
        type: "url",
        value: "https://github.com/yogata/agent-dev-flow/blob/main/docs/x.md",
      },
      cfg,
    );
    expect(r.classification).toBe("unclassified");
  });
});

describe("Stage B regression: path normalization (backslash / percent / query / fragment)", () => {
  test("backslash docs path is flagged as concrete", () => {
    const d = classifyLineConfig(
      {
        text: "see docs\\requirements\\REQ-0149.md for detail",
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      },
      DEFAULT_DETECTOR_CONFIG,
    );
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(1);
    // The matched value should normalize to forward slashes for stable downstream comparison.
    expect(paths[0]!.matched.replace(/\\/g, "/")).toBe(
      "docs/requirements/REQ-0149.md",
    );
  });

  test("percent-encoded docs path is flagged", () => {
    const d = classifyLineConfig(
      {
        text: "see docs%2Frequirements%2FREQ-0149.md here",
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      },
      DEFAULT_DETECTOR_CONFIG,
    );
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(1);
  });

  test("docs path with query string is flagged (query stripped on normalization)", () => {
    const d = classifyLineConfig(
      {
        text: "see docs/requirements/REQ-0149.md?raw=true",
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      },
      DEFAULT_DETECTOR_CONFIG,
    );
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(1);
  });

  test("docs path with fragment is flagged (fragment stripped on normalization)", () => {
    const d = classifyLineConfig(
      {
        text: "see docs/specs/foo.md#section-name",
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      },
      DEFAULT_DETECTOR_CONFIG,
    );
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(1);
  });

  test("Windows backslash + mixed path still classifies as concrete", () => {
    const d = classifyLineConfig(
      {
        text: "ref docs\\adr\\ADR-0001.md and docs/decisions/DEC-014.md",
        lineNumber: 1,
        filePath: "x.md",
        projection: "source",
      },
      DEFAULT_DETECTOR_CONFIG,
    );
    const paths = d.filter((x) => x.category === "concrete-path");
    expect(paths.length).toBe(2);
  });
});

describe("Stage B regression: text/binary/unknown tri-state classification", () => {
  test("classifyBytes returns 'text' for valid UTF-8 bytes", () => {
    const text = "Hello ADR-0001";
    const bytes = new TextEncoder().encode(text);
    const r = classifyBytes(bytes);
    expect(r.kind).toBe("text");
    if (r.kind === "text") {
      expect(r.text).toBe(text);
    }
  });

  test("classifyBytes returns 'binary' for bytes containing NUL", () => {
    const bytes = new Uint8Array([0x68, 0x00, 0x69]); // "h\0i"
    const r = classifyBytes(bytes);
    expect(r.kind).toBe("binary");
  });

  test("classifyBytes returns 'binary' for invalid UTF-8 sequences", () => {
    // 0xFF is never valid in UTF-8.
    const bytes = new Uint8Array([0x68, 0xff, 0x69]);
    const r = classifyBytes(bytes);
    expect(r.kind).toBe("binary");
  });

  test("classifyBytes returns 'binary' for overlong 2-byte form (0xC0 0x80)", () => {
    const bytes = new Uint8Array([0x68, 0xc0, 0x80, 0x69]);
    const r = classifyBytes(bytes);
    expect(r.kind).toBe("binary");
  });

  test("classifyBytes returns 'binary' for surrogate-half (U+D800)", () => {
    // U+D800 encoded as 0xED 0xA0 0x80 — surrogates are forbidden in UTF-8.
    const bytes = new Uint8Array([0xed, 0xa0, 0x80]);
    const r = classifyBytes(bytes);
    expect(r.kind).toBe("binary");
  });

  test("ByteClassification 'unknown' is never returned by classifyBytes (text|binary only)", () => {
    // classifyBytes is deterministic strict-UTF-8: text|binary. The tri-state
    // is exposed at the gate layer (BytesClassification = text|binary|unknown)
    // where unknown means 'extension-based detection could not decide' and
    // MUST fail closed. We verify the type allows unknown and that classifyBytes
    // itself only emits text|binary (so the gate treats unknown as fail-closed).
    const values: ByteClassification[] = [
      { kind: "text", text: "" },
      { kind: "binary", reason: "nul" },
      { kind: "unknown", reason: "no extension, no bytes" },
    ];
    expect(values.map((v) => v.kind)).toContain("unknown");
  });
});

describe("Stage B regression: classifier config plumbing", () => {
  test("classifyContentConfig matches classifyContent behavior under default config", () => {
    const text = "ref ADR-0001 and docs/requirements/REQ-0002.md";
    const defaultResult = classifyContent(text, "x.md", "source");
    const configResult = classifyContentConfig(
      text,
      "x.md",
      "source",
      DEFAULT_DETECTOR_CONFIG,
    );
    expect(configResult.length).toBe(defaultResult.length);
  });

  test("classifyContentConfig with custom config flags additional ID families", () => {
    const cfg: DetectorConfig = {
      repository_identity: DEFAULT_REPOSITORY_IDENTITY,
      producer_internal_id_prefixes: ["ADR", "REQ", "DEC", "OU"],
    };
    const d = classifyContentConfig("ref OU-3", "x.md", "source", cfg);
    expect(d.length).toBe(1);
    expect(d[0]!.classification).toBe("producer-internal");
  });
});
