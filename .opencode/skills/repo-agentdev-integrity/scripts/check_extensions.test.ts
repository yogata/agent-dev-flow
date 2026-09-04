// ADF-COVERS(verification): REQ-002-030, REQ-002-031
// ADF-COVERS(verification): REQ-044-002
// ADF-COVERS(verification): REQ-044-001, REQ-044-002, REQ-044-005
/**
 * Tests for check_extensions.ts (IR-056 validation, new-kind era).
 *
 * Integration target is the parent repo (the agent-dev-flow repo this script
 * ships in): after the DEC-012 atomic cutover all extensions live under
 * .agentdev/extensions/skills/ with the 3-kind enum, the legacy commands/
 * directory is gone, and the report must be ok=true.
 *
 * resolveExtensionState unit tests mirror the UC-001 case 1 state table and
 * runExtensionScenarios executes the TS-006 extension scenarios.
 */

import { expect, test, describe, afterAll } from "bun:test";
import {
  checkExtensions,
  resolveExtensionState,
  runExtensionScenarios,
  deriveSkillClassification,
  extBaselineKey,
} from "./check_extensions.ts";
import * as path from "path";
import * as fs from "fs";

// Resolve to the worktree root (4 levels up from .opencode/skills/repo-agentdev-integrity/scripts).
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

describe("checkExtensions (integration against real repo)", () => {
  test("returns ok=true with migrated stats after the atomic cutover", () => {
    const report = checkExtensions(REPO_ROOT);
    expect(report.ok).toBe(true);
    // 17th workflow extension was added after the cutover (base known drift,
    // captured via Issue #2559); stats follow the live .agentdev/extensions tree.
    expect(report.stats.workflow_extensions).toBe(17);
    expect(report.stats.internal_workflow_extensions).toBe(0);
    expect(report.stats.capability_extensions).toBe(13);
    expect(report.stats.legacy_kind_files).toBe(0);
    expect(report.stats.commands_dir_files).toBe(0);
    expect(report.stats.doc_inputs_residual_files).toBe(0);
    const strictFailures = report.failures.filter((f) => f.severity === "strict");
    expect(strictFailures.length).toBe(0);
  });

  test("shared ng-baseline operation: no separated baseline file exists", () => {
    // SPEC 確定 (integrity-contracts.md「baseline entry 運用契約」): checkers
    // share ng-baseline.json; check-extensions-baseline.json must not exist.
    const separated = path.join(
      REPO_ROOT,
      ".opencode",
      "skills",
      "repo-agentdev-integrity",
      "baselines",
      "check-extensions-baseline.json",
    );
    expect(fs.existsSync(separated)).toBe(false);
  });

  test("classifies the real skill tree deterministically", () => {
    // REQ-018 cwd-independence: explicit repoRoot, independent of bun test's cwd.
    const classification = deriveSkillClassification(REPO_ROOT);
    expect(classification.workflowSkills.has("agentdev-workflow-case-run")).toBe(true);
    expect(classification.workflowSkills.has("agentdev-workflow-orchestration")).toBe(false);
    expect(classification.capabilitySkills.has("agentdev-workflow-orchestration")).toBe(true);
    expect(classification.capabilitySkills.has("agentdev-issue-management")).toBe(true);
    expect(classification.capabilitySkills.has("agentdev-gh-cli")).toBe(false);
  });
});

describe("resolveExtensionState (UC-001 case 1 state table)", () => {
  test("missing when the file is absent", () => {
    expect(resolveExtensionState(null)).toEqual({ state: "missing" });
  });

  test("malformed on YAML syntax corruption (fail-open at runtime)", () => {
    const resolution = resolveExtensionState(":\n\t- ][{ ::\n\tversion: [[[\n");
    expect(resolution.state).toBe("malformed");
  });

  test("malformed on missing required fields (fail-open at runtime)", () => {
    const resolution = resolveExtensionState("version: 1\nkind: workflow-extension\n");
    expect(resolution.state).toBe("malformed");
  });

  test("migration-required on legacy command-extension", () => {
    expect(resolveExtensionState(
      "version: 1\nkind: command-extension\nid: /agentdev/demo\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n",
    )).toEqual({ state: "migration-required", kind: "command-extension" });
  });

  test("migration-required on legacy skill-extension", () => {
    expect(resolveExtensionState(
      "version: 1\nkind: skill-extension\nid: agentdemo\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n",
    )).toEqual({ state: "migration-required", kind: "skill-extension" });
  });

  test("schema-violation on unknown kind", () => {
    expect(resolveExtensionState(
      "version: 1\nkind: solar-extension\nid: agentdemo\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n",
    )).toEqual({ state: "schema-violation", kind: "solar-extension" });
  });

  test("valid for each new kind", () => {
    for (const kind of [
      "workflow-extension",
      "internal-workflow-extension",
      "capability-skill-extension",
    ] as const) {
      expect(resolveExtensionState(
        `version: 1\nkind: ${kind}\nid: agentdemo\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n`,
      )).toEqual({ state: "valid", kind });
    }
  });
});

describe("runExtensionScenarios (TS-006 extension scenarios)", () => {
  test("all scenarios pass", () => {
    const baseDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "agentdev-ext-test-"));
    try {
      const results = runExtensionScenarios(baseDir);
      expect(results.length).toBe(9);
      const failed = results.filter((r) => !r.pass);
      expect(failed).toEqual([]);
    } finally {
      fs.rmSync(baseDir, { recursive: true, force: true });
    }
  });
});

// Issue #2206 (OU-0008): パス bucket key の環境依存対策。`.opencode/...`（main
// junction 環境）と `src/opencode/...`（worktree fallback 環境）の表記差異が
// baseline bucket key 比較で解消されることを固定する。
// Issue #2560: bucket key is the shared ng-baseline 4-tuple
// (category/check/file/evidence) — same shape as check_integrity.ts.
describe("extBaselineKey path normalization (Issue #2206, OU-0008)", () => {
  test("unifies .opencode/ and src/opencode/ notations into one bucket key", () => {
    const projection = extBaselineKey(
      "Extensions",
      "id-target-consistency",
      ".opencode/commands/agentdev/case-close.md",
      "same message",
    );
    const source = extBaselineKey(
      "Extensions",
      "id-target-consistency",
      "src/opencode/commands/agentdev/case-close.md",
      "same message",
    );
    expect(projection).toBe(source);
  });

  test("normalizes backslash separators; null file stays empty", () => {
    expect(
      extBaselineKey("Extensions", "check", ".opencode\\skills\\agentdev-x\\SKILL.md", null),
    ).toBe(
      extBaselineKey("Extensions", "check", "src/opencode/skills/agentdev-x/SKILL.md", null),
    );
    expect(extBaselineKey("Extensions", "check", null, "m")).toBe(
      "Extensions\tcheck\t\tm",
    );
  });
});

// Issue #2560 (OU-004 / TS-004): the shared ng-baseline operation. Baseline-known
// strict failures are demoted to warning and do not fail the pass criterion;
// only the delta exceeding the baseline stays strict (ok=false).
describe("shared ng-baseline demotion contract (Issue #2560, TS-004)", () => {
  const baseDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "agentdev-ext-baseline-"));
  const fixtureRoot = path.join(baseDir, "root");
  const extDir = path.join(
    fixtureRoot,
    ".agentdev",
    "extensions",
    "skills",
    "agentdev-workflow-demo",
  );

  function writeViolatingExtension(): void {
    fs.mkdirSync(extDir, { recursive: true });
    fs.writeFileSync(
      path.join(extDir, "inner.yaml"),
      "version: 1\nkind: workflow-extension\nid: agentdev-workflow-demo\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n",
      "utf-8",
    );
  }

  function writeBaselineFromFailures(countPerBucket: number): void {
    const raw = checkExtensions(fixtureRoot);
    const baseline = {
      version: 1,
      rule_id: "NG-BASELINE",
      generated_at: "2026-09-04",
      entries: raw.failures.map((f) => ({
        category: "Extensions",
        check: f.check_name,
        file: f.file ?? null,
        evidence: f.message ?? null,
        count: countPerBucket,
        provenance: "test-fixture",
        reason: "fixture: shared ng-baseline demotion contract (Issue #2560)",
      })),
    };
    const baselineDir = path.join(
      fixtureRoot,
      ".opencode",
      "skills",
      "repo-agentdev-integrity",
      "baselines",
    );
    fs.mkdirSync(baselineDir, { recursive: true });
    fs.writeFileSync(
      path.join(baselineDir, "ng-baseline.json"),
      JSON.stringify(baseline, null, 2) + "\n",
      "utf-8",
    );
  }

  fs.mkdirSync(path.join(fixtureRoot, "src", "opencode", "commands", "agentdev"), { recursive: true });
  fs.writeFileSync(
    path.join(fixtureRoot, "src", "opencode", "commands", "agentdev", "demo.md"),
    "---\ndescription: fixture command\n---\n# demo\n",
    "utf-8",
  );
  const skillDir = path.join(fixtureRoot, "src", "opencode", "skills", "agentdev-workflow-demo");
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    "---\nname: agentdev-workflow-demo\ndescription: fixture skill\n---\n",
    "utf-8",
  );
  writeViolatingExtension();

  afterAll(() => {
    fs.rmSync(baseDir, { recursive: true, force: true });
  });

  test("without baseline, violations stay strict and fail the pass criterion", () => {
    const report = checkExtensions(fixtureRoot);
    expect(report.ok).toBe(false);
    expect(report.failures.length).toBeGreaterThan(0);
    expect(report.failures.every((f) => f.severity === "strict")).toBe(true);
    expect(report.ng_baseline).toBeUndefined();
  });

  test("baseline-known failures are demoted to warning and pass; delta stays strict", () => {
    writeBaselineFromFailures(1);
    const demoted = checkExtensions(fixtureRoot);
    expect(demoted.ok).toBe(true);
    expect(demoted.ng_baseline).toBeDefined();
    expect(demoted.ng_baseline?.newNg).toBe(0);
    expect(demoted.ng_baseline?.baselineKnown + demoted.ng_baseline?.approvedAdditions).toBe(
      demoted.failures.length,
    );
    expect(
      demoted.failures.every((f) =>
        f.message.startsWith("[baseline-known provenance=test-fixture]"),
      ),
    ).toBe(true);

    writeBaselineFromFailures(2);
    fs.writeFileSync(
      path.join(extDir, "inner.yaml"),
      "version: 1\nkind: workflow-extension\nid: agentdev-workflow-demo2\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n",
      "utf-8",
    );
    const withDelta = checkExtensions(fixtureRoot);
    expect(withDelta.ok).toBe(false);
    expect(withDelta.ng_baseline?.newNg).toBeGreaterThan(0);
    const strictRemaining = withDelta.failures.filter((f) => f.severity === "strict");
    expect(strictRemaining.length).toBeGreaterThan(0);
    expect(
      strictRemaining.every((f) => !f.message.startsWith("[baseline-known")),
    ).toBe(true);
  });
});
