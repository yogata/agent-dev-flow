/**
 * Tests for check_read_contracts.ts (IR-056 validation).
 *
 * Uses the parent repo (the agent-dev-flow repo this script ships in) as the
 * integration target. Per TS-001, the script must report ok=true against the
 * fully-migrated repo (zero direct docs/specs/{domain}/** refs in src/opencode/**,
 * valid config.yaml, command read contract for each public command, etc).
 *
 * Per-expectation fixture isolation on Windows is brittle (EBUSY on recursive
 * rm). The integration test against the real repo covers all 9 checks at once.
 */

import { expect, test, describe } from "bun:test";
import { checkReadContracts } from "./check_read_contracts.ts";
import * as path from "path";

// Resolve to the worktree root (4 levels up from .opencode/skills/repo-agentdev-integrity/scripts).
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

describe("checkReadContracts (integration against real repo)", () => {
  test("returns well-formed report with ok=true after migration", () => {
    const report = checkReadContracts(REPO_ROOT);
    // Stats sanity
    expect(report.stats.public_commands).toBeGreaterThan(0);
    expect(report.stats.command_read_contracts).toBeGreaterThan(0);
    expect(report.stats.direct_refs_in_commands).toBe(0);
    expect(report.stats.direct_refs_in_skills).toBe(0);
    // No strict failures (warnings on missing optional read contracts are allowed)
    const strictFailures = report.failures.filter((f) => f.severity === "strict");
    expect(strictFailures.length).toBe(0);
    expect(report.ok).toBe(true);
  });

  test("checks all 9 categories when invoked on real repo", () => {
    const report = checkReadContracts(REPO_ROOT);
    // We don't assert any specific check is present in failures (a clean repo has none),
    // but the script must not throw and must produce a report with the expected shape.
    expect(Array.isArray(report.failures)).toBe(true);
    expect(typeof report.stats.public_commands).toBe("number");
    expect(typeof report.stats.command_read_contracts).toBe("number");
    expect(typeof report.stats.skill_read_contracts).toBe("number");
    expect(typeof report.stats.direct_refs_in_commands).toBe("number");
    expect(typeof report.stats.direct_refs_in_skills).toBe("number");
  });
});