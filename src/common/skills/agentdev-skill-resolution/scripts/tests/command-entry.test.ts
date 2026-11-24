import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  applyPublicEntry,
  expectedWorkflowSkillName,
  resolveCommandEntry,
} from "../src/command-entry.ts";

// Repo root located from this test file:
// src/common/skills/agentdev-skill-resolution/scripts/tests -> repo root.
const REPO_ROOT = path.resolve(import.meta.dir, "..", "..", "..", "..", "..", "..");
const REAL_COMMANDS_DIR = path.join(REPO_ROOT, "src", "common", "commands", "agentdev");

// The public command set (fixed expectation). Internal lifecycle stages and
// backlog/inspect workflows are driven inside public commands, not exposed
// as public entries.
const PUBLIC_BUSINESS_NAMES = [
  "req-define",
  "backlog-auto",
  "case-auto",
  "phase-tasks-create",
  "phase-tasks-update",
  "phase-artifacts-update",
  "phase-review",
  "phase-transition",
] as const;

let fixtureRoot: string | null = null;

function buildFixture(): string {
  fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "adf-command-entry-"));
  return fixtureRoot;
}

function writeCommand(commandsDir: string, name: string, body: string): void {
  fs.mkdirSync(commandsDir, { recursive: true });
  fs.writeFileSync(path.join(commandsDir, `${name}.md`), body, "utf-8");
}

function writeSkill(skillsDir: string, skillName: string): void {
  const skillDir = path.join(skillsDir, skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    `---\nname: ${skillName}\ndescription: fixture twin\n---\n`,
    "utf-8",
  );
}

afterEach(() => {
  if (fixtureRoot !== null) {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
    fixtureRoot = null;
  }
});

describe("resolveCommandEntry against the real command bodies", () => {
  test("every public command resolves and delegates to its matching workflow skill", () => {
    for (const businessName of PUBLIC_BUSINESS_NAMES) {
      const result = resolveCommandEntry(REAL_COMMANDS_DIR, businessName);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.entry.businessName).toBe(businessName);
        expect(result.entry.workflowSkillName).toBe(expectedWorkflowSkillName(businessName));
        expect(result.entry.commandText).toMatch(/^## workflow\s*$/m);
      }
    }
  });

  test("rejects an unknown business name", () => {
    expect(resolveCommandEntry(REAL_COMMANDS_DIR, "no-such-command")).toEqual({
      ok: false,
      reason: "not-found",
    });
  });

  test("rejects a business name that is not a file name stem", () => {
    expect(resolveCommandEntry(REAL_COMMANDS_DIR, "bad/name")).toEqual({
      ok: false,
      reason: "invalid-name",
    });
  });

  test("rejects the command index body (no workflow delegation)", () => {
    expect(resolveCommandEntry(REAL_COMMANDS_DIR, "README")).toEqual({
      ok: false,
      reason: "missing-workflow-delegation",
    });
  });
});

describe("resolveCommandEntry against fixtures", () => {
  test("rejects a workflow section that delegates to a different skill", () => {
    const root = buildFixture();
    const commandsDir = path.join(root, "commands");
    writeCommand(
      commandsDir,
      "sample",
      "# sample\n\n## workflow\n\nDelegates to `agentdev-workflow-other` skill.\n",
    );
    expect(resolveCommandEntry(commandsDir, "sample")).toEqual({
      ok: false,
      reason: "workflow-skill-mismatch",
    });
  });

  test("rejects a workflow section that names two distinct skills", () => {
    const root = buildFixture();
    const commandsDir = path.join(root, "commands");
    writeCommand(
      commandsDir,
      "ambiguous",
      "# ambiguous\n\n## workflow\n\nDelegates to `agentdev-workflow-ambiguous` after consulting `agentdev-workflow-base`.\n",
    );
    expect(resolveCommandEntry(commandsDir, "ambiguous")).toEqual({
      ok: false,
      reason: "missing-workflow-delegation",
    });
  });
});

describe("applyPublicEntry", () => {
  test("returns the command text, the resolved workflow skill, and unchanged args", () => {
    const root = buildFixture();
    const commandsDir = path.join(root, "commands");
    const canonicalSkills = path.join(root, "src", "common", "skills");
    writeCommand(
      commandsDir,
      "sample",
      "# sample\n\n## workflow\n\nDelegates to `agentdev-workflow-sample` skill.\n",
    );
    writeSkill(canonicalSkills, "agentdev-workflow-sample");
    const result = applyPublicEntry({
      commandsDir,
      entrySkillsDirs: [path.join(root, "entry-skills")],
      canonicalSkillsDir: canonicalSkills,
      businessName: "sample",
      args: "issue-42 --dry",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.application.commandText).toContain("agentdev-workflow-sample");
      expect(result.application.workflowSkill.skillName).toBe("agentdev-workflow-sample");
      expect(result.application.workflowSkill.origin).toBe("canonical");
      expect(result.application.args).toBe("issue-42 --dry");
    }
  });

  test("prefers the entry projection over the canonical twin", () => {
    const root = buildFixture();
    const commandsDir = path.join(root, "commands");
    const entrySkills = path.join(root, "entry-skills");
    const canonicalSkills = path.join(root, "src", "common", "skills");
    writeCommand(
      commandsDir,
      "sample",
      "# sample\n\n## workflow\n\nDelegates to `agentdev-workflow-sample` skill.\n",
    );
    writeSkill(entrySkills, "agentdev-workflow-sample");
    writeSkill(canonicalSkills, "agentdev-workflow-sample");
    const result = applyPublicEntry({
      commandsDir,
      entrySkillsDirs: [entrySkills],
      canonicalSkillsDir: canonicalSkills,
      businessName: "sample",
      args: "",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.application.workflowSkill.origin).toBe("entry");
    }
  });

  test("fails closed when the workflow skill is missing everywhere", () => {
    const root = buildFixture();
    const commandsDir = path.join(root, "commands");
    const emptySkills = path.join(root, "empty-skills");
    fs.mkdirSync(emptySkills, { recursive: true });
    writeCommand(
      commandsDir,
      "lonely",
      "# lonely\n\n## workflow\n\nDelegates to `agentdev-workflow-lonely` skill.\n",
    );
    expect(
      applyPublicEntry({
        commandsDir,
        entrySkillsDirs: [path.join(root, "entry-skills")],
        canonicalSkillsDir: emptySkills,
        businessName: "lonely",
        args: "",
      }),
    ).toEqual({ ok: false, reason: "workflow-skill-not-found" });
  });
});
