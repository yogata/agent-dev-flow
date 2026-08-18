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

import { expect, test, describe } from "bun:test";
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
    expect(report.stats.workflow_extensions).toBe(16);
    expect(report.stats.internal_workflow_extensions).toBe(0);
    expect(report.stats.capability_extensions).toBe(13);
    expect(report.stats.legacy_kind_files).toBe(0);
    expect(report.stats.commands_dir_files).toBe(0);
    expect(report.stats.doc_inputs_residual_files).toBe(0);
    const strictFailures = report.failures.filter((f) => f.severity === "strict");
    expect(strictFailures.length).toBe(0);
  });

  test("classifies the real skill tree deterministically", () => {
    // REQ-018 cwd-independence: explicit repoRoot, independent of bun test's cwd.
    const classification = deriveSkillClassification(REPO_ROOT);
    expect(classification.workflowSkills.has("agentdev-workflow-case-run")).toBe(true);
    expect(classification.workflowSkills.has("agentdev-workflow-orchestration")).toBe(false);
    expect(classification.capabilitySkills.has("agentdev-workflow-orchestration")).toBe(true);
    expect(classification.capabilitySkills.has("agentdev-gh-cli")).toBe(true);
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
describe("extBaselineKey path normalization (Issue #2206, OU-0008)", () => {
  test("unifies .opencode/ and src/opencode/ notations into one bucket key", () => {
    const projection = extBaselineKey(
      3,
      "id-target-consistency",
      ".opencode/commands/agentdev/case-close.md",
      "same message",
    );
    const source = extBaselineKey(
      3,
      "id-target-consistency",
      "src/opencode/commands/agentdev/case-close.md",
      "same message",
    );
    expect(projection).toBe(source);
  });

  test("normalizes backslash separators; null file stays empty", () => {
    expect(
      extBaselineKey(1, "check", ".opencode\\skills\\agentdev-x\\SKILL.md", null),
    ).toBe(
      extBaselineKey(1, "check", "src/opencode/skills/agentdev-x/SKILL.md", null),
    );
    expect(extBaselineKey(1, "check", null, "m")).toBe("1\tcheck\t\tm");
  });
});
