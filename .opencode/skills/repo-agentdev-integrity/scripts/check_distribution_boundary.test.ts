// ADF-COVERS(verification): REQ-029-001, REQ-029-002, REQ-029-003, REQ-029-005, REQ-029-006, REQ-029-007
/**
 * Tests for check_distribution_boundary.ts.
 *
 * Covers concrete-id / concrete-path / fixed-url detection, plus the
 * template-line exemptions and README.md allowance. Uses an in-memory
 * fixture tree so the test does not depend on the real repo state.
 */

import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import {
  checkDistributionBoundary,
  buildBaseline,
  saveBaseline,
  loadBaseline,
  loadExemptions,
  applyExemptions,
  computeDelta,
} from "./check_distribution_boundary.ts";
import * as path from "path";
import * as fs from "fs";

const TMP_ROOT = path.join(
  process.cwd(),
  ".worktrees-tmp-test-distribution-boundary",
);

function writeFile(rel: string, content: string): void {
  const full = path.join(TMP_ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

beforeAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });

  // Public command body with each violation category.
  writeFile(
    "src/opencode/commands/agentdev/sample.md",
    [
      "# sample command",
      "",
      "Read ADR-0135 first.",
      "See docs/adr/README.md for the index.",
      "Template form docs/designs/<domain>/<design>.md is allowed.",
      "Glob form docs/requirements/REQ-*.md is allowed.",
      "Bad: docs/requirements/REQ-0149.md is a concrete ref.",
      "Bad: <https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md>",
      "Bad: raw.githubusercontent.com/yogata/agent-dev-flow/main/x.md",
      "",
    ].join("\n"),
  );

  // Public skill body, all-clean.
  writeFile(
    "src/opencode/skills/agentdev-foo/SKILL.md",
    [
      "# foo skill",
      "",
      "References must flow via extension layer.",
      "Pattern docs/designs/** is fine.",
      "ID template REQ-{NNNN} is fine.",
      "",
    ].join("\n"),
  );

  // Non-agentdev skill should be ignored even if it has refs.
  writeFile(
    "src/opencode/skills/other-skill/SKILL.md",
    "Ignore: ADR-9999 and docs/adr/ADR-9999.md\n",
  );

  // README.md under commands should still be scanned (it is in commands/).
  writeFile(
    "src/opencode/commands/agentdev/README.md",
    "# commands index\nNo concrete refs here.\n",
  );
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});

describe("checkDistributionBoundary", () => {
  test("flags concrete IDs, concrete paths, and fixed URLs", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    expect(report.ok).toBe(false);

    const categories = report.failures.map((f) => f.category).sort();
    expect(categories).toContain("concrete-id");
    expect(categories).toContain("concrete-path");
    expect(categories).toContain("fixed-url");

    // Concrete ID: ADR-0135 on line 3 of sample.md
    const idHit = report.failures.find(
      (f) => f.category === "concrete-id" && f.matched === "ADR-0135",
    );
    expect(idHit).toBeDefined();
    expect(idHit!.line).toBe(3);

    // Concrete path: docs/requirements/REQ-0149.md
    const pathHit = report.failures.find(
      (f) => f.category === "concrete-path" && f.matched === "docs/requirements/REQ-0149.md",
    );
    expect(pathHit).toBeDefined();

    // Fixed URL
    const urlHit = report.failures.find((f) => f.category === "fixed-url");
    expect(urlHit).toBeDefined();
  });

  test("exempts template forms and README index", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    // README index path should NOT be flagged.
    const readmeHit = report.failures.find(
      (f) => f.matched === "docs/adr/README.md",
    );
    expect(readmeHit).toBeUndefined();

    // Template forms should NOT be flagged.
    const tmplHits = report.failures.filter(
      (f) =>
        f.matched.includes("docs/designs/<") ||
        f.matched.includes("REQ-*") ||
        f.matched.includes("{NNNN}"),
    );
    expect(tmplHits.length).toBe(0);
  });

  test("ignores non-agentdev skills", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    // other-skill had ADR-9999 but should not be scanned.
    const strangerHit = report.failures.find((f) =>
      f.file.includes("other-skill"),
    );
    expect(strangerHit).toBeUndefined();
  });

  test("stats are well-formed", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    expect(report.stats.scanned_files).toBeGreaterThan(0);
    expect(report.stats.concrete_id_hits).toBeGreaterThan(0);
    expect(report.stats.concrete_path_hits).toBeGreaterThan(0);
    expect(report.stats.fixed_url_hits).toBeGreaterThan(0);
  });
});

describe("baseline build / save / load", () => {
  test("buildBaseline dedupes by (file, category, matched) and counts occurrences", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "test baseline");
    expect(baseline.version).toBe(1);
    expect(baseline.rule_id).toBe("IR-059");
    expect(baseline.description).toBe("test baseline");

    const idEntry = baseline.entries.find(
      (e) => e.category === "concrete-id" && e.matched === "ADR-0135",
    );
    expect(idEntry).toBeDefined();
    expect(idEntry!.count).toBe(1);
    expect(idEntry!.file).toBe("src/opencode/commands/agentdev/sample.md");

    const totalCount = baseline.entries.reduce((s, e) => s + e.count, 0);
    expect(totalCount).toBe(report.failures.length);
  });

  test("saveBaseline then loadBaseline round-trips", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "roundtrip");
    const tmpFile = path.join(TMP_ROOT, "baseline.json");
    saveBaseline(baseline, tmpFile);
    const reloaded = loadBaseline(tmpFile);
    expect(reloaded).not.toBeNull();
    expect(reloaded!.entries.length).toBe(baseline.entries.length);
    expect(reloaded!.description).toBe("roundtrip");
    fs.unlinkSync(tmpFile);
  });

  test("loadBaseline returns null for malformed or wrong-rule files", () => {
    const bad = path.join(TMP_ROOT, "bad.json");
    fs.writeFileSync(bad, JSON.stringify({ version: 2, rule_id: "other" }), "utf8");
    expect(loadBaseline(bad)).toBeNull();
    fs.writeFileSync(bad, "not json at all", "utf8");
    expect(loadBaseline(bad)).toBeNull();
    expect(loadBaseline(path.join(TMP_ROOT, "absent.json"))).toBeNull();
    fs.unlinkSync(bad);
  });
});

describe("computeDelta", () => {
  test("delta is empty when current matches baseline", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "snapshot");
    const delta = computeDelta(report, baseline, TMP_ROOT);
    expect(delta.ok).toBe(true);
    expect(delta.new_failures.length).toBe(0);
    expect(delta.resolved.length).toBe(0);
    expect(delta.stats.new_delta).toBe(0);
    expect(delta.stats.current_total).toBe(report.failures.length);
    expect(delta.stats.baseline_total).toBe(report.failures.length);
  });

  test("delta flags a newly introduced violation", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "snapshot");
    const newFailure = {
      category: "concrete-id" as const,
      file: path.join(TMP_ROOT, "src/opencode/commands/agentdev/sample.md"),
      line: 99,
      snippet: "Newly introduced REQ-1234 reference",
      matched: "REQ-1234",
    };
    const reportWithExtra = { ...report, failures: [...report.failures, newFailure] };
    const delta = computeDelta(reportWithExtra, baseline, TMP_ROOT);
    expect(delta.ok).toBe(false);
    expect(delta.new_failures.length).toBe(1);
    expect(delta.new_failures[0]!.matched).toBe("REQ-1234");
    expect(delta.stats.new_delta).toBe(1);
  });

  test("delta reports resolved when a baseline violation disappears", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const pruned = report.failures.filter((f) => f.matched !== "ADR-0135");
    const baseline = buildBaseline(report, TMP_ROOT, "snapshot");
    const delta = computeDelta(
      { ...report, failures: pruned },
      baseline,
      TMP_ROOT,
    );
    expect(delta.ok).toBe(true);
    expect(delta.resolved.length).toBeGreaterThan(0);
    const resolvedAdr = delta.resolved.find((r) => r.matched === "ADR-0135");
    expect(resolvedAdr).toBeDefined();
    expect(resolvedAdr!.baseline_count).toBe(1);
    expect(resolvedAdr!.current_count).toBe(0);
  });

  test("delta counts overshoot within the same signature as new violations", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const baseline = buildBaseline(report, TMP_ROOT, "snapshot");
    const sameFile = path.join(TMP_ROOT, "src/opencode/commands/agentdev/sample.md");
    const extra = {
      category: "concrete-id" as const,
      file: sameFile,
      line: 200,
      snippet: "duplicate ADR-0135",
      matched: "ADR-0135",
    };
    const reportWithExtra = { ...report, failures: [...report.failures, extra] };
    const delta = computeDelta(reportWithExtra, baseline, TMP_ROOT);
    expect(delta.ok).toBe(false);
    expect(delta.stats.new_delta).toBe(1);
    expect(delta.new_failures[0]!.matched).toBe("ADR-0135");
  });
});

// =============================================================================
// Stage B regression: PR #2092 review blockers (false-clean fixes).
// =============================================================================

describe("checkDistributionBoundary: strict UTF-8 enforcement (no silent replacement)", () => {
  const STRICT_ROOT = path.join(
    process.cwd(),
    ".worktrees-tmp-test-distribution-boundary-strict",
  );

  beforeAll(() => {
    fs.rmSync(STRICT_ROOT, { recursive: true, force: true });
    fs.mkdirSync(path.join(STRICT_ROOT, "src", "opencode", "commands", "agentdev"), {
      recursive: true,
    });
    // Invalid UTF-8: 0xFF is never valid in UTF-8.
    fs.writeFileSync(
      path.join(STRICT_ROOT, "src", "opencode", "commands", "agentdev", "bad.md"),
      Buffer.from([0x68, 0xff, 0x69, 0x0a]),
    );
    // NUL byte.
    fs.writeFileSync(
      path.join(STRICT_ROOT, "src", "opencode", "commands", "agentdev", "nul.md"),
      Buffer.from([0x68, 0x00, 0x69, 0x0a]),
    );
  });

  afterAll(() => {
    fs.rmSync(STRICT_ROOT, { recursive: true, force: true });
  });

  test("invalid UTF-8 bytes in .md produce adapter-failure Detection (no silent replacement)", () => {
    const report = checkDistributionBoundary(STRICT_ROOT);
    expect(report.ok).toBe(false);
    const adapterFailures = report.failures.filter(
      (f) => f.category === "adapter-failure" && f.file.endsWith("bad.md"),
    );
    expect(adapterFailures.length).toBe(1);
    expect(adapterFailures[0]!.matched).toContain("invalid-utf8");
  });

  test("NUL byte in .md produces adapter-failure Detection", () => {
    const report = checkDistributionBoundary(STRICT_ROOT);
    const nulFailures = report.failures.filter(
      (f) => f.category === "adapter-failure" && f.file.endsWith("nul.md"),
    );
    expect(nulFailures.length).toBe(1);
    expect(nulFailures[0]!.matched).toContain("invalid-utf8");
  });
});

describe("checkDistributionBoundary: unknown extension fails closed", () => {
  const UNKNOWN_ROOT = path.join(
    process.cwd(),
    ".worktrees-tmp-test-distribution-boundary-unknown-ext",
  );

  beforeAll(() => {
    fs.rmSync(UNKNOWN_ROOT, { recursive: true, force: true });
    fs.mkdirSync(path.join(UNKNOWN_ROOT, "src", "opencode", "commands", "agentdev"), {
      recursive: true,
    });
    // Unknown extension that is neither text nor binary.
    fs.writeFileSync(
      path.join(UNKNOWN_ROOT, "src", "opencode", "commands", "agentdev", "blob.xyz"),
      "ADR-9999 reference inside\n",
    );
  });

  afterAll(() => {
    fs.rmSync(UNKNOWN_ROOT, { recursive: true, force: true });
  });

  test("unknown extension file produces adapter-failure Detection (not silently scanned)", () => {
    const report = checkDistributionBoundary(UNKNOWN_ROOT);
    expect(report.ok).toBe(false);
    const unknownFailures = report.failures.filter(
      (f) => f.category === "adapter-failure" && f.file.endsWith("blob.xyz"),
    );
    expect(unknownFailures.length).toBe(1);
    expect(unknownFailures[0]!.matched).toContain("unknown-extension");
  });
});

describe("checkDistributionBoundary: mandatory repository_identity", () => {
  const EMPTY_IDENTITY_ROOT = path.join(
    process.cwd(),
    ".worktrees-tmp-test-distribution-boundary-empty-identity",
  );

  beforeAll(() => {
    fs.rmSync(EMPTY_IDENTITY_ROOT, { recursive: true, force: true });
    fs.mkdirSync(
      path.join(EMPTY_IDENTITY_ROOT, "src", "opencode", "commands", "agentdev"),
      { recursive: true },
    );
    fs.writeFileSync(
      path.join(EMPTY_IDENTITY_ROOT, "src", "opencode", "commands", "agentdev", "ok.md"),
      "no violations here\n",
    );
  });

  afterAll(() => {
    fs.rmSync(EMPTY_IDENTITY_ROOT, { recursive: true, force: true });
  });

  test("empty owner_slash_name produces adapter-failure Detection (no silent scan)", () => {
    const report = checkDistributionBoundary(EMPTY_IDENTITY_ROOT, "source", {
      repository_identity: { owner_slash_name: "", default_branch: "" },
      producer_internal_id_prefixes: ["ADR", "REQ", "DEC"],
      distributed_workflow_control_prefixes: ["STEP", "QG"],
    });
    expect(report.ok).toBe(false);
    const identityFailures = report.failures.filter(
      (f) =>
        f.category === "adapter-failure" &&
        f.matched.includes("missing-repository-identity"),
    );
    expect(identityFailures.length).toBe(1);
  });
});

describe("checkDistributionBoundary: GITHUB.COM host detection (integration)", () => {
  const UPPER_ROOT = path.join(
    process.cwd(),
    ".worktrees-tmp-test-distribution-boundary-uppercase-host",
  );

  beforeAll(() => {
    fs.rmSync(UPPER_ROOT, { recursive: true, force: true });
    fs.mkdirSync(path.join(UPPER_ROOT, "src", "opencode", "commands", "agentdev"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(UPPER_ROOT, "src", "opencode", "commands", "agentdev", "upper.md"),
      "Bad: <https://GITHUB.COM/yogata/agent-dev-flow/blob/main/docs/foo.md>\n",
    );
  });

  afterAll(() => {
    fs.rmSync(UPPER_ROOT, { recursive: true, force: true });
  });

  test("GITHUB.COM uppercase host is detected as fixed-url violation", () => {
    const report = checkDistributionBoundary(UPPER_ROOT);
    const urlHits = report.failures.filter((f) => f.category === "fixed-url");
    expect(urlHits.length).toBe(1);
    expect(urlHits[0]!.matched).toMatch(/GITHUB\.COM/i);
  });
});

describe("loadBaseline: strict structural parsing (no unsafe cast)", () => {
  const TMP = path.join(
    process.cwd(),
    ".worktrees-tmp-test-distribution-boundary-baseline-strict",
  );

  beforeAll(() => {
    fs.rmSync(TMP, { recursive: true, force: true });
    fs.mkdirSync(TMP, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(TMP, { recursive: true, force: true });
  });

  test("rejects entries field that is not an array", () => {
    const p = path.join(TMP, "entries-not-array.json");
    fs.writeFileSync(
      p,
      JSON.stringify({ version: 1, rule_id: "IR-059", entries: "nope" }),
      "utf8",
    );
    expect(loadBaseline(p)).toBeNull();
  });

  test("rejects entries with wrong entry shape (matched not string)", () => {
    const p = path.join(TMP, "bad-entry.json");
    fs.writeFileSync(
      p,
      JSON.stringify({
        version: 1,
        rule_id: "IR-059",
        entries: [{ file: "x.md", category: "concrete-id", matched: 42, count: 1 }],
      }),
      "utf8",
    );
    expect(loadBaseline(p)).toBeNull();
  });

  test("rejects entries with negative count", () => {
    const p = path.join(TMP, "neg-count.json");
    fs.writeFileSync(
      p,
      JSON.stringify({
        version: 1,
        rule_id: "IR-059",
        entries: [
          { file: "x.md", category: "concrete-id", matched: "ADR-0001", count: -1 },
        ],
      }),
      "utf8",
    );
    expect(loadBaseline(p)).toBeNull();
  });

  test("rejects unknown category value", () => {
    const p = path.join(TMP, "bad-cat.json");
    fs.writeFileSync(
      p,
      JSON.stringify({
        version: 1,
        rule_id: "IR-059",
        entries: [
          { file: "x.md", category: "weird-cat", matched: "ADR-0001", count: 1 },
        ],
      }),
      "utf8",
    );
    expect(loadBaseline(p)).toBeNull();
  });

  test("rejects top-level non-object JSON", () => {
    const p = path.join(TMP, "array.json");
    fs.writeFileSync(p, "[1,2,3]", "utf8");
    expect(loadBaseline(p)).toBeNull();
  });
});

describe("loadExemptions: strict structural parsing (no unsafe cast)", () => {
  const TMP = path.join(
    process.cwd(),
    ".worktrees-tmp-test-distribution-boundary-exemptions-strict",
  );

  beforeAll(() => {
    fs.rmSync(TMP, { recursive: true, force: true });
    fs.mkdirSync(TMP, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(TMP, { recursive: true, force: true });
  });

  test("rejects entries field that is not an array", () => {
    const p = path.join(TMP, "bad.json");
    fs.writeFileSync(
      p,
      JSON.stringify({ version: 1, description: "x", entries: "nope" }),
      "utf8",
    );
    expect(loadExemptions(p)).toBeNull();
  });

  test("rejects entries with wrong entry shape (review_status not in enum)", () => {
    const p = path.join(TMP, "bad-status.json");
    fs.writeFileSync(
      p,
      JSON.stringify({
        version: 1,
        description: "x",
        entries: [
          {
            id: "ex1",
            rule: "IR-059",
            file: "x.md",
            matched: "ADR-0001",
            rationale_category: "harness_reference",
            rationale_ref: "x",
            added_at_commit: "abc",
            review_status: "weird-status",
          },
        ],
      }),
      "utf8",
    );
    expect(loadExemptions(p)).toBeNull();
  });

  test("rejects entries with wrong rationale_category value", () => {
    const p = path.join(TMP, "bad-rationale.json");
    fs.writeFileSync(
      p,
      JSON.stringify({
        version: 1,
        description: "x",
        entries: [
          {
            id: "ex1",
            rule: "IR-059",
            file: "x.md",
            matched: "ADR-0001",
            rationale_category: "bogus",
            rationale_ref: "x",
            added_at_commit: "abc",
            review_status: "accepted",
          },
        ],
      }),
      "utf8",
    );
    expect(loadExemptions(p)).toBeNull();
  });
});

describe("applyExemptions: robust to malformed loaded exemption shape", () => {
  test("null exemptions returns all failures as remaining", () => {
    const failures = [
      {
        category: "concrete-id" as const,
        file: "x.md",
        line: 1,
        snippet: "...",
        matched: "ADR-0001",
      },
    ];
    const r = applyExemptions(failures, null, "/repo");
    expect(r.exempted.length).toBe(0);
    expect(r.remaining.length).toBe(1);
  });
});
