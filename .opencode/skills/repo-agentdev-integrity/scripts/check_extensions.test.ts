/**
 * Tests for check_extensions.ts (IR-056 validation, extensions era).
 *
 * Uses the parent repo (the agent-dev-flow repo this script ships in) as the
 * integration target. Per TS-001, the script must report ok=true against the
 * fully-migrated repo (valid extensions under .agentdev/extensions/**, no
 * legacy .agentdev/doc-inputs/** residual). Distribution reference boundary
 * (direct refs in src/opencode/**) is covered by check_distribution_boundary
 * .test.ts.
 */

import { expect, test, describe } from "bun:test";
import { checkExtensions } from "./check_extensions.ts";
import * as path from "path";

// Resolve to the worktree root (4 levels up from .opencode/skills/repo-agentdev-integrity/scripts).
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

describe("checkExtensions (integration against real repo)", () => {
  test("returns well-formed report with ok=true after migration", () => {
    const report = checkExtensions(REPO_ROOT);
    // Stats sanity
    expect(report.stats.command_extensions).toBeGreaterThan(0);
    expect(report.stats.skill_extensions).toBeGreaterThan(0);
    expect(report.stats.public_commands).toBeGreaterThan(0);
    expect(report.stats.doc_inputs_residual_files).toBe(0);
    // No strict failures (warnings on legacy residual / missing optional skills allowed)
    const strictFailures = report.failures.filter((f) => f.severity === "strict");
    expect(strictFailures.length).toBe(0);
    expect(report.ok).toBe(true);
  });

  test("checks all categories when invoked on real repo", () => {
    const report = checkExtensions(REPO_ROOT);
    expect(Array.isArray(report.failures)).toBe(true);
    expect(typeof report.stats.command_extensions).toBe("number");
    expect(typeof report.stats.skill_extensions).toBe("number");
    expect(typeof report.stats.public_commands).toBe("number");
    expect(typeof report.stats.public_skills).toBe("number");
    expect(typeof report.stats.doc_inputs_residual_files).toBe("number");
  });
});
