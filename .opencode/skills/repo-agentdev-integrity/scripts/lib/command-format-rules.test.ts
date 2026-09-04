// ADF-COVERS(verification): REQ-047-009
/**
 * Tests for lib/command-format-rules.ts (canonical rules loader).
 *
 * Covers TS-006 single-path canonical loading: the checker consumes the
 * detection signals from data/command-format-rules.yaml and fails closed
 * when the yaml is missing. Tests do not mutate the canonical yaml.
 */

import { describe, expect, test } from "bun:test";
import { loadCommandFormatRules } from "./command-format-rules.ts";
import * as path from "path";
import * as fs from "fs";

function findRepoRoot(startDir: string): string {
  let current = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return current;
    current = parent;
  }
}

describe("loadCommandFormatRules: canonical yaml loading (REQ-047-009)", () => {
  test("loads IR-028/029/030/031 signals from the canonical yaml", () => {
    const rules = loadCommandFormatRules(findRepoRoot(process.cwd()));
    expect(rules.scanDirs).toContain("src/opencode/commands/agentdev");
    expect(rules.scanDirs).toContain(".opencode/commands/repo");
    expect(rules.ir028ForbiddenHeading.test("### Step A: bad")).toBe(true);
    expect(rules.ir028ForbiddenHeading.test("### Step 1: ok")).toBe(false);
    expect(rules.ir029ForbiddenSubstep.test("run Step 1-a now")).toBe(true);
    expect(rules.ir030ForbiddenPatterns.length).toBeGreaterThan(0);
    expect(rules.ir030ExemptionHints.length).toBeGreaterThan(0);
    expect(rules.ir031ForbiddenPrimaryHeadings.length).toBe(3);
    expect(
      rules.ir031ForbiddenPrimaryHeadings.some((re) => re.test("## Capture")),
    ).toBe(true);
  });

  test("fails closed when the yaml is missing", () => {
    expect(() =>
      loadCommandFormatRules("/nonexistent-repo-root-for-ts006"),
    ).toThrow(/fail-closed.*missing/i);
  });
});
