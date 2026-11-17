// ADF-COVERS(verification): REQ-029-001, REQ-029-002, REQ-029-003, REQ-029-005, REQ-029-006, REQ-029-007, REQ-029-010, REQ-047-009
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
} from "./check_distribution_boundary.ts";
import { loadDistributionTargets } from "./lib/distribution-boundary-rules.ts";
import { DEFAULT_DETECTOR_CONFIG } from "./lib/distribution-boundary.ts";
import * as path from "path";
import * as fs from "fs";

const TMP_ROOT = path.join(
  process.cwd(),
  ".worktrees-tmp-test-distribution-boundary",
);
const EMPTY_ROOT = path.join(
  process.cwd(),
  ".worktrees-tmp-test-distribution-boundary-empty",
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
    "src/common/commands/agentdev/sample.md",
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
    "src/common/skills/agentdev-foo/SKILL.md",
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
    "src/common/skills/other-skill/SKILL.md",
    "Ignore: ADR-9999 and docs/adr/ADR-9999.md\n",
  );

  // README.md under commands should still be scanned (it is in commands/).
  writeFile(
    "src/common/commands/agentdev/README.md",
    "# commands index\nNo concrete refs here.\n",
  );

  // tests/ directory: detection-stimulus strings for the package's own
  // detection tests; excluded from violation scanning (Issue #2480).
  writeFile(
    "src/opencode/plugins/agentdev-foo/tests/plugin.test.ts",
    [
      "const samples = [",
      "  \"ADR-0123\",",
      "  \"docs/requirements/REQ-0123.md\",",
      "  \"https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md\",",
      "];",
      "export default samples;",
      "",
    ].join("\n"),
  );

  // tools/<name>/local/: producer-internal Local runner area excluded from
  // the distribution set (REQ-009-016); its producer metadata is out of scope.
  writeFile(
    "src/common/tools/agentdev-gh/local/runner-local.ts",
    [
      "// agentdev-gh Custom Tool の Local 実現（GhRunner）。",
      "// ADF-COVERS(implementation): REQ-011-024",
      "",
    ].join("\n"),
  );

  // TS-012 deliberate contamination fixtures (REQ-029-010): inline
  // declaration, traceability sidecar, and policy-style files carrying
  // producer-side traceability metadata inside the consumer distribution
  // closure. Detected via the ADF-COVERS declaration marker signal with no
  // role or path filter; the gate failure decision is deferred to the Wave 4
  // enforcement switch.
  writeFile(
    "src/common/skills/agentdev-foo/references/contaminated-inline.md",
    [
      "# contaminated reference",
      "",
      "<!-- ADF-COVERS(implementation): REQ-029-010 -->",
      "",
    ].join("\n"),
  );
  writeFile(
    "src/common/skills/agentdev-foo/traceability/covers-sidecar.md",
    [
      "# traceability sidecar",
      "",
      "<!-- ADF-COVERS(verification): REQ-029-011 -->",
      "",
    ].join("\n"),
  );
  writeFile(
    "src/common/skills/agentdev-foo/traceability/policy.md",
    [
      "# traceability policy",
      "",
      "<!-- ADF-COVERS(design): REQ-029-010 -->",
      "",
    ].join("\n"),
  );
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.rmSync(EMPTY_ROOT, { recursive: true, force: true });
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

  test("excludes files under tests/ directories from violation scanning", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const testsHits = report.failures.filter((f) =>
      f.file.replace(/\\/g, "/").includes("/tests/"),
    );
    expect(testsHits.length).toBe(0);
  });

  test("excludes tools/<name>/local/ producer-internal area from violation scanning (REQ-009-016)", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    const localHits = report.failures.filter((f) =>
      f.file.replace(/\\/g, "/").includes("tools/agentdev-gh/local/"),
    );
    expect(localHits.length).toBe(0);
  });
});

describe("zero-targets pre-warning channel (RA-004)", () => {
  test("emits a zero-targets pre-warning separate from the invalid-run failure", () => {
    fs.mkdirSync(EMPTY_ROOT, { recursive: true });
    const report = checkDistributionBoundary(EMPTY_ROOT, "link");
    // The adapter-failure stays the sole gate-accounted invalid-run record.
    const zeroTargetFailure = report.failures.find(
      (f) => f.matched === "zero-targets:link",
    );
    expect(zeroTargetFailure).toBeDefined();
    expect(zeroTargetFailure!.category).toBe("adapter-failure");
    expect(report.ok).toBe(false);
    expect(report.warnings).toHaveLength(1);
    const warning = report.warnings?.[0] ?? "";
    expect(warning).toContain("zero-targets pre-warning");
    expect(warning).toContain("'link'");
    expect(warning).toContain("junction propagation state");
    expect(report.failures.some((f) => f.snippet.includes("pre-warning"))).toBe(false);
  });

  test("keeps warnings empty for a populated scan", () => {
    const report = checkDistributionBoundary(TMP_ROOT);
    expect(report.warnings).toEqual([]);
  });
});

describe("producer-side traceability metadata detection (DEC-030 decision 5)", () => {
  test("report mode counts deliberate contamination without failing the gate", () => {
    const report = checkDistributionBoundary(TMP_ROOT, "source", {
      ...DEFAULT_DETECTOR_CONFIG,
      producer_metadata_enforcement: "report",
    });
    // inline + sidecar + policy fixtures are all detected by the marker signal.
    expect(report.stats.producer_metadata_hits).toBe(3);
    const metaFailures = report.failures.filter(
      (f) => f.category === "producer-metadata",
    );
    expect(metaFailures.length).toBe(0);
  });

  test("enforce mode turns deliberate contamination into gate violations", () => {
    const report = checkDistributionBoundary(TMP_ROOT, "source", {
      ...DEFAULT_DETECTOR_CONFIG,
      producer_metadata_enforcement: "enforce",
    });
    const meta = report.failures.filter(
      (f) => f.category === "producer-metadata",
    );
    expect(meta.length).toBe(3);
    expect(meta.length).toBe(report.stats.producer_metadata_hits);
    expect(report.ok).toBe(false);
    const inlineHit = meta.find((f) =>
      f.file.replace(/\\/g, "/").includes("contaminated-inline.md"),
    );
    expect(inlineHit).toBeDefined();
    expect(inlineHit!.matched).toBe("ADF-COVERS");
    expect(inlineHit!.line).toBe(3);
  });

  test("marker signal has no role filter and no path filter", () => {
    const report = checkDistributionBoundary(TMP_ROOT, "source", {
      ...DEFAULT_DETECTOR_CONFIG,
      producer_metadata_enforcement: "enforce",
    });
    const meta = report.failures.filter(
      (f) => f.category === "producer-metadata",
    );
    const snippets = meta.map((f) => f.snippet).join(" ");
    for (const role of ["implementation", "verification", "design"]) {
      expect(snippets).toContain(`ADF-COVERS(${role})`);
    }
    const files = meta.map((f) => f.file.replace(/\\/g, "/"));
    expect(files.some((f) => f.includes("/references/"))).toBe(true);
    expect(files.some((f) => f.includes("/traceability/"))).toBe(true);
  });
});
describe("checkDistributionBoundary: strict UTF-8 enforcement (no silent replacement)", () => {
  const STRICT_ROOT = path.join(
    process.cwd(),
    ".worktrees-tmp-test-distribution-boundary-strict",
  );

  beforeAll(() => {
    fs.rmSync(STRICT_ROOT, { recursive: true, force: true });
    fs.mkdirSync(path.join(STRICT_ROOT, "src", "common", "commands", "agentdev"), {
      recursive: true,
    });
    // Invalid UTF-8: 0xFF is never valid in UTF-8.
    fs.writeFileSync(
      path.join(STRICT_ROOT, "src", "common", "commands", "agentdev", "bad.md"),
      Buffer.from([0x68, 0xff, 0x69, 0x0a]),
    );
    // NUL byte.
    fs.writeFileSync(
      path.join(STRICT_ROOT, "src", "common", "commands", "agentdev", "nul.md"),
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
    fs.mkdirSync(path.join(UNKNOWN_ROOT, "src", "common", "commands", "agentdev"), {
      recursive: true,
    });
    // Unknown extension that is neither text nor binary.
    fs.writeFileSync(
      path.join(UNKNOWN_ROOT, "src", "common", "commands", "agentdev", "blob.xyz"),
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
      path.join(EMPTY_IDENTITY_ROOT, "src", "common", "commands", "agentdev"),
      { recursive: true },
    );
    fs.writeFileSync(
      path.join(EMPTY_IDENTITY_ROOT, "src", "common", "commands", "agentdev", "ok.md"),
      "no violations here\n",
    );
  });

  afterAll(() => {
    fs.rmSync(EMPTY_IDENTITY_ROOT, { recursive: true, force: true });
  });

  test("empty owner_slash_name produces adapter-failure Detection (no silent scan)", () => {
    const report = checkDistributionBoundary(EMPTY_IDENTITY_ROOT, "source", {
      ...DEFAULT_DETECTOR_CONFIG,
      repository_identity: { owner_slash_name: "", default_branch: "" },
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
    fs.mkdirSync(path.join(UPPER_ROOT, "src", "common", "commands", "agentdev"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(UPPER_ROOT, "src", "common", "commands", "agentdev", "upper.md"),
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
describe("loadDistributionTargets: canonical yaml loading (REQ-047-009)", () => {
  test("loads IR-047/048 signals from the canonical yaml", () => {
    const targets = loadDistributionTargets(findRepoRoot(process.cwd()));
    expect(targets.ir047Allowed).toContain("agentdev-gh");
    expect(typeof targets.ir048Prefix).toBe("string");
    expect(targets.ir048Prefix.length).toBeGreaterThan(0);
  });

  test("resolves from the checker placement for non-producer projection roots", () => {
    const targets = loadDistributionTargets("/nonexistent-repo-root-for-projection");
    expect(targets.ir047Allowed).toContain("agentdev-gh");
  });

  test("fails closed when the yaml is missing at both the repo root and the checker placement", () => {
    expect(() =>
      loadDistributionTargets(
        "/nonexistent-repo-root-for-ts006",
        "/nonexistent-checker-placement-data/distribution-targets.yaml",
      ),
    ).toThrow(/fail-closed.*distribution targets file is missing/i);
  });
});

function findRepoRoot(startDir: string): string {
  let current = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return current;
    current = parent;
  }
}
