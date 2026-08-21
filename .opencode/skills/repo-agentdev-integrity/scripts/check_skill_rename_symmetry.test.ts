// ADF-COVERS(verification): REQ-010-063
/**
 * Tests for check_skill_rename_symmetry.ts (REQ-026).
 *
 * Combines unit tests for pure helpers with an integration test that runs
 * the checker against the real repository. The real repo has known
 * asymmetries (a superseded SPEC without a skill dir, a draft SPEC without
 * a skill dir) which the checker must classify correctly rather than
 * crashing on.
 */

import { expect, test, describe } from "bun:test";
import {
  checkSkillRenameSymmetry,
  parseFrontmatter,
  extractSkillNameFromTitle,
} from "./check_skill_rename_symmetry.ts";
import * as path from "path";

// Resolve to the worktree root (4 levels up from .opencode/skills/repo-agentdev-integrity/scripts).
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

describe("parseFrontmatter", () => {
  test("parses simple key: value pairs", () => {
    const text = `---
name: agentdev-sample
title: \`agentdev-sample\` SPEC
status: accepted
---
# body`;
    const fm = parseFrontmatter(text);
    expect(fm.name).toBe("agentdev-sample");
    expect(fm.title).toBe("`agentdev-sample` SPEC");
    expect(fm.status).toBe("accepted");
  });

  test("strips surrounding double quotes", () => {
    const text = `---
title: "agentdev-sample SPEC"
---
body`;
    expect(parseFrontmatter(text).title).toBe("agentdev-sample SPEC");
  });

  test("strips surrounding single quotes", () => {
    const text = `---
title: 'agentdev-sample SPEC'
---
body`;
    expect(parseFrontmatter(text).title).toBe("agentdev-sample SPEC");
  });

  test("returns empty object when frontmatter absent", () => {
    expect(parseFrontmatter("# just a body")).toEqual({});
  });

  test("skips malformed lines silently", () => {
    const text = `---
name: ok
- not a key: value
status: accepted
---
body`;
    const fm = parseFrontmatter(text);
    expect(fm.name).toBe("ok");
    expect(fm.status).toBe("accepted");
  });
});

describe("extractSkillNameFromTitle", () => {
  test("extracts backtick-wrapped token", () => {
    expect(extractSkillNameFromTitle("`agentdev-doc-writing` SPEC")).toBe(
      "agentdev-doc-writing",
    );
  });

  test("extracts double-quoted token", () => {
    expect(extractSkillNameFromTitle('"agentdev-gh-cli" SPEC')).toBe(
      "agentdev-gh-cli",
    );
  });

  test("extracts bare leading token", () => {
    expect(extractSkillNameFromTitle("agentdev-workflow-lifecycle SPEC")).toBe(
      "agentdev-workflow-lifecycle",
    );
  });

  test("returns null for empty input", () => {
    expect(extractSkillNameFromTitle("")).toBeNull();
  });

  test("returns null when no leading token", () => {
    expect(extractSkillNameFromTitle("   ")).toBeNull();
  });
});

describe("checkSkillRenameSymmetry (integration against real repo)", () => {
  test("returns well-formed report", () => {
    const report = checkSkillRenameSymmetry(REPO_ROOT);
    expect(typeof report.ok).toBe("boolean");
    expect(Array.isArray(report.failures)).toBe(true);
    expect(typeof report.stats.skills_scanned).toBe("number");
    expect(typeof report.stats.designs_scanned).toBe("number");
    expect(typeof report.stats.graph_skill_nodes_scanned).toBe("number");
    expect(report.stats.skills_scanned).toBeGreaterThan(0);
    expect(report.stats.designs_scanned).toBeGreaterThan(0);
  });

  test("superseded SPEC without skill dir is not flagged as path-symmetry violation", () => {
    const report = checkSkillRenameSymmetry(REPO_ROOT);
    const deepReviewFailure = report.failures.find(
      (f) =>
        f.category === "path-symmetry" &&
        f.file &&
        f.file.endsWith("agentdev-deep-review.md"),
    );
    // agentdev-deep-review.md has status: superseded; its skill dir was
    // intentionally removed. The checker must NOT report it as a violation.
    expect(deepReviewFailure).toBeUndefined();
  });

  test("every scanned skill has consistent SKILL.md name <-> dir", () => {
    const report = checkSkillRenameSymmetry(REPO_ROOT);
    const nameDirMismatches = report.failures.filter(
      (f) =>
        f.category === "frontmatter-id" &&
        f.level === "ng" &&
        f.message.includes("does not match parent directory"),
    );
    // All real skills should have name == dir; any mismatch is a regression.
    expect(nameDirMismatches.length).toBe(0);
  });

  test("graph-node failures are warnings, not ng", () => {
    const report = checkSkillRenameSymmetry(REPO_ROOT);
    for (const f of report.failures) {
      if (f.category === "graph-node") {
        expect(f.level).toBe("warning");
      }
    }
  });
});
