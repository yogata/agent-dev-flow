// ADF-COVERS(verification): REQ-010-063
/**
 * Tests for check_skill_rename_symmetry.ts (REQ-010-063).
 *
 * Regression cases for the REQ-010-063 inspection contract
 * (docs/designs/integrity/targeted-docs-guard-implementation.md
 * "skill rename 対称性検査観点"):
 *
 *  (1) a Workflow Skill fixture without a same-name Design is NOT flagged
 *      as a path-symmetry violation (constant mode)
 *  (2) an intentional SKILL.md frontmatter name != dir mismatch IS detected
 *  (3) an intentional Design title token != filename stem mismatch IS detected
 *  (4) a declared rename with broken old/new correspondence IS detected
 *  (5) without declared renames, rename-only symmetry conditions are not
 *      required (ordinary changes pass without same-name Design pairing)
 *
 * Maintained exceptions are also pinned: a superseded Design left at the old
 * name is tolerated; a draft Design symmetry break is a warning, not ng.
 */

import { expect, test, describe } from "bun:test";
import {
  checkSkillRenameSymmetry,
  parseFrontmatter,
  extractSkillNameFromTitle,
  type SymmetryReport,
} from "./check_skill_rename_symmetry.ts";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

// Resolve to the worktree root (4 levels up from .opencode/skills/repo-agentdev-integrity/scripts).
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

interface FixtureSkill {
  name: string;
  frontmatterName?: string;
}

interface FixtureDesign {
  name: string;
  title?: string;
  status?: string;
}

function buildFixtureRepo(
  skills: FixtureSkill[],
  designs: FixtureDesign[],
): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adf-rename-sym-"));
  for (const s of skills) {
    const dir = path.join(root, "src", "opencode", "skills", s.name);
    fs.mkdirSync(dir, { recursive: true });
    const nameField = s.frontmatterName ?? s.name;
    fs.writeFileSync(
      path.join(dir, "SKILL.md"),
      `---\nname: ${nameField}\ndescription: fixture skill\n---\n\n# ${s.name}\n`,
      "utf-8",
    );
  }
  fs.mkdirSync(path.join(root, "docs", "designs", "skills"), {
    recursive: true,
  });
  for (const d of designs) {
    const title = d.title ?? `\`${d.name}\` Design`;
    const statusLine = d.status ? `status: ${d.status}\n` : "";
    fs.writeFileSync(
      path.join(root, "docs", "designs", "skills", `${d.name}.md`),
      `---\ntitle: ${title}\n${statusLine}---\n\n# ${d.name}\n`,
      "utf-8",
    );
  }
  return root;
}

function withFixture<T>(
  skills: FixtureSkill[],
  designs: FixtureDesign[],
  fn: (root: string) => T,
): T {
  const root = buildFixtureRepo(skills, designs);
  try {
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function pathSymmetryFailures(report: SymmetryReport) {
  return report.failures.filter((f) => f.category === "path-symmetry");
}

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

describe("constant checks: frontmatter id <-> physical path (REQ-010-063)", () => {
  test("(1) workflow-skill fixture without same-name Design is not flagged as path-symmetry violation", () => {
    withFixture(
      [
        { name: "agentdev-workflow-fixture-a" },
        { name: "agentdev-workflow-fixture-b" },
      ],
      [],
      (root) => {
        const report = checkSkillRenameSymmetry(root);
        expect(pathSymmetryFailures(report)).toEqual([]);
        expect(report.stats.path_symmetry_violations).toBe(0);
        expect(report.stats.renames_checked).toBe(0);
        expect(report.ok).toBe(true);
      },
    );
  });

  test("(2) intentional SKILL.md frontmatter name != dir mismatch is detected", () => {
    withFixture(
      [{ name: "agentdev-sample", frontmatterName: "agentdev-wrong-name" }],
      [],
      (root) => {
        const report = checkSkillRenameSymmetry(root);
        const mismatch = report.failures.find(
          (f) =>
            f.category === "frontmatter-id" &&
            f.level === "ng" &&
            f.message.includes("does not match parent directory"),
        );
        expect(mismatch).toBeDefined();
        expect(report.ok).toBe(false);
      },
    );
  });

  test("(3) intentional Design title token != filename stem mismatch is detected", () => {
    withFixture(
      [],
      [{ name: "agentdev-sample", title: "`agentdev-other-name` Design" }],
      (root) => {
        const report = checkSkillRenameSymmetry(root);
        const mismatch = report.failures.find(
          (f) =>
            f.category === "frontmatter-id" &&
            f.level === "warning" &&
            f.message.includes("does not match filename stem"),
        );
        expect(mismatch).toBeDefined();
        expect(report.ok).toBe(false);
      },
    );
  });
});

describe("rename-time checks: old/new name symmetry (REQ-010-063)", () => {
  test("(4) declared rename where the Design remains at the old name is detected", () => {
    withFixture(
      [{ name: "agentdev-renamed" }],
      [{ name: "agentdev-original", status: "accepted" }],
      (root) => {
        const report = checkSkillRenameSymmetry(root, {
          renames: [{ from: "agentdev-original", to: "agentdev-renamed" }],
        });
        const failures = pathSymmetryFailures(report);
        expect(failures.length).toBeGreaterThan(0);
        expect(
          failures.some(
            (f) =>
              f.level === "ng" &&
              f.message.includes("remains at") &&
              f.message.includes("agentdev-original"),
          ),
        ).toBe(true);
        expect(report.stats.renames_checked).toBe(1);
        expect(report.stats.path_symmetry_violations).toBeGreaterThan(0);
      },
    );
  });

  test("(4) declared rename where the skill dir remains at the old name is detected", () => {
    withFixture(
      [{ name: "agentdev-original" }],
      [{ name: "agentdev-renamed", status: "accepted" }],
      (root) => {
        const report = checkSkillRenameSymmetry(root, {
          renames: [{ from: "agentdev-original", to: "agentdev-renamed" }],
        });
        expect(
          pathSymmetryFailures(report).some(
            (f) =>
              f.level === "ng" &&
              f.message.includes("skill dir remains at") &&
              f.message.includes("agentdev-original"),
          ),
        ).toBe(true);
      },
    );
  });

  test("(5) same fixture without declared renames requires no rename-only symmetry", () => {
    withFixture(
      [{ name: "agentdev-renamed" }],
      [{ name: "agentdev-original", status: "accepted" }],
      (root) => {
        const report = checkSkillRenameSymmetry(root);
        expect(pathSymmetryFailures(report)).toEqual([]);
        expect(report.stats.renames_checked).toBe(0);
        expect(report.ok).toBe(true);
      },
    );
  });

  test("consistent rename (skill and Design moved together) is not a violation", () => {
    withFixture(
      [{ name: "agentdev-renamed" }],
      [{ name: "agentdev-renamed", status: "accepted" }],
      (root) => {
        const report = checkSkillRenameSymmetry(root, {
          renames: [{ from: "agentdev-original", to: "agentdev-renamed" }],
        });
        expect(pathSymmetryFailures(report)).toEqual([]);
      },
    );
  });

  test("both old and new skill dirs remaining (incomplete rename) is detected", () => {
    withFixture(
      [{ name: "agentdev-original" }, { name: "agentdev-renamed" }],
      [],
      (root) => {
        const report = checkSkillRenameSymmetry(root, {
          renames: [{ from: "agentdev-original", to: "agentdev-renamed" }],
        });
        expect(
          pathSymmetryFailures(report).some(
            (f) =>
              f.level === "ng" &&
              f.message.includes("both old and new skill dirs exist"),
          ),
        ).toBe(true);
      },
    );
  });

  test("superseded old Design left behind is tolerated (maintained exception)", () => {
    withFixture(
      [{ name: "agentdev-renamed" }],
      [{ name: "agentdev-original", status: "superseded" }],
      (root) => {
        const report = checkSkillRenameSymmetry(root, {
          renames: [{ from: "agentdev-original", to: "agentdev-renamed" }],
        });
        expect(pathSymmetryFailures(report)).toEqual([]);
      },
    );
  });

  test("draft Design symmetry break is reported as warning, not ng (maintained exception)", () => {
    withFixture(
      [{ name: "agentdev-original" }],
      [{ name: "agentdev-renamed", status: "draft" }],
      (root) => {
        const report = checkSkillRenameSymmetry(root, {
          renames: [{ from: "agentdev-original", to: "agentdev-renamed" }],
        });
        const failures = pathSymmetryFailures(report);
        expect(failures.length).toBeGreaterThan(0);
        expect(failures.every((f) => f.level === "warning")).toBe(true);
      },
    );
  });

  test("workflow-skill rename without any Design is not a violation", () => {
    withFixture(
      [{ name: "agentdev-workflow-renamed" }],
      [],
      (root) => {
        const report = checkSkillRenameSymmetry(root, {
          renames: [
            {
              from: "agentdev-workflow-original",
              to: "agentdev-workflow-renamed",
            },
          ],
        });
        expect(pathSymmetryFailures(report)).toEqual([]);
      },
    );
  });
});

describe("checkSkillRenameSymmetry (integration against real repo)", () => {
  test("returns well-formed report", () => {
    const report = checkSkillRenameSymmetry(REPO_ROOT);
    expect(typeof report.ok).toBe("boolean");
    expect(Array.isArray(report.failures)).toBe(true);
    expect(typeof report.stats.skills_scanned).toBe("number");
    expect(typeof report.stats.designs_scanned).toBe("number");
    expect(report.stats.skills_scanned).toBeGreaterThan(0);
    expect(report.stats.designs_scanned).toBeGreaterThan(0);
    expect(report.stats.renames_checked).toBe(0);
  });

  test("workflow skills without same-name Design are not flagged as path-symmetry violations (docs-check criterion)", () => {
    const report = checkSkillRenameSymmetry(REPO_ROOT);
    expect(report.stats.path_symmetry_violations).toBe(0);

    const skillsParent = path.join(REPO_ROOT, "src", "opencode", "skills");
    const designsDir = path.join(REPO_ROOT, "docs", "designs", "skills");
    const workflowSkillsWithoutDesign = fs
      .readdirSync(skillsParent)
      .filter(
        (n) =>
          n.startsWith("agentdev-workflow-") &&
          fs.statSync(path.join(skillsParent, n)).isDirectory() &&
          !fs.existsSync(path.join(designsDir, `${n}.md`)),
      );
    // 17 workflow skills currently have no same-name Design (Issue #2417).
    // The count may grow; each of them must stay unflagged.
    expect(workflowSkillsWithoutDesign.length).toBeGreaterThanOrEqual(1);
    for (const name of workflowSkillsWithoutDesign) {
      const flagged = report.failures.some(
        (f) => f.message.includes(name) || (f.file ?? "").includes(name),
      );
      expect(flagged).toBe(false);
    }
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
});

describe("CLI --rename parsing", () => {
  const SCRIPT = path.join(__dirname, "check_skill_rename_symmetry.ts");

  test("malformed --rename value exits with code 2", () => {
    const proc = Bun.spawnSync(
      ["bun", "run", SCRIPT, REPO_ROOT, "--json", "--rename", "no-equal-sign"],
      { stdout: "pipe", stderr: "pipe" },
    );
    expect(proc.exitCode).toBe(2);
  });

  test("--rename=old=new form reports renames_checked without phantom violations", () => {
    const proc = Bun.spawnSync(
      [
        "bun",
        "run",
        SCRIPT,
        REPO_ROOT,
        "--json",
        "--rename=agentdev-original=agentdev-renamed",
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    const stdout = proc.stdout?.toString("utf-8") ?? "";
    const parsed = JSON.parse(stdout) as SymmetryReport;
    expect(parsed.stats.renames_checked).toBe(1);
    expect(parsed.stats.path_symmetry_violations).toBe(0);
  });
});
