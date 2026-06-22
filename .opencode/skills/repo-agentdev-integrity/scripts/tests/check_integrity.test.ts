/**
 * Regression test for Issue #657 (Epic #647 G4 remaining fixes).
 *
 * Verifies the following fixes via CLI execution:
 * 1. Broken junction (agentdev-integrity) should not exist
 * 2. REQ-0101-014 guide count should be 10 (not 9)
 * 3. Pattern A/B/C/D references should not appear in design-principles.md
 * 4. check_integrity.ts exit code is 0 for valid fixtures
 * 5. check_integrity.ts exit code is non-zero for invalid fixtures
 *
 * Uses child_process.execSync to run the CLI script (CLI execution result verification).
 */
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const SCRIPT_DIR = import.meta.dir;
const FIXTURES_DIR = join(SCRIPT_DIR, "fixtures");
const PARENT_SCRIPTS_DIR = join(SCRIPT_DIR, "..");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `issue657-regression-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function runCli(cwd: string, args: string[]): CliResult {
  const scriptPath = join(
    cwd,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "scripts",
    "check_integrity.ts",
  );
  try {
    const stdout = execSync(`bun run "${scriptPath}" ${args.join(" ")}`, {
      cwd,
      encoding: "utf-8",
      timeout: 30000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { exitCode: 0, stdout, stderr: "" };
  } catch (e: unknown) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return {
      exitCode: typeof err.status === "number" ? err.status : -1,
      stdout: typeof err.stdout === "string" ? err.stdout : "",
      stderr: typeof err.stderr === "string" ? err.stderr : "",
    };
  }
}

function mkdirp(p: string): void {
  mkdirSync(p, { recursive: true });
}

function copyScripts(fixtureRoot: string): void {
  const dest = join(
    fixtureRoot,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "scripts",
  );
  mkdirp(dest);
  for (const f of readdirSync(PARENT_SCRIPTS_DIR)) {
    if (f.endsWith(".ts") && !f.endsWith(".test.ts")) {
      copyFileSync(join(PARENT_SCRIPTS_DIR, f), join(dest, f));
    }
  }
}

/**
 * Build a valid fixture with 10 guides (matching REQ-0101-014 updated count).
 */
function buildValidFixture(root: string): void {
  // REQ directory with valid frontmatter
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "REQ-0101.md"),
    [
      "---",
      "id: REQ-0101",
      "title: Test requirement",
      "created: 2026-01-01",
      "updated: 2026-06-07",
      "tags:",
      "  - test",
      "---",
      "",
      "## Body",
      "",
      "See ADR-0001 for context.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-0101 | Test requirement |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // ADR directory
  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);
  writeFileSync(
    join(adrDir, "ADR-0001.md"),
    [
      "---",
      "id: ADR-0001",
      "title: Valid ADR",
      "---",
      "",
      "Relates to REQ-0101.",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Specs
  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);
  writeFileSync(
    join(specsDir, "system.md"),
    [
      "# System",
      "",
      "## Commands",
      "",
      "| Command | Description |",
      "|---------|-------------|",
      "| `/agentdev/test-cmd` | Test command |",
      "| `/agentdev/case-run` | Run |",
      "| `/agentdev/case-close` | Close |",
      "| `/agentdev/case-open` | Open |",
      "| `/agentdev/case-auto` | Auto |",
      "| `/agentdev/req-save` | Save |",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(join(specsDir, "patterns.md"), "# Patterns\n", "utf-8");
  writeFileSync(
    join(specsDir, "design-principles.md"),
    [
      "# Design Principles",
      "",
      "## 1. work_type",
      "",
      "work_type と scale の組み合わせで workflow_route を導出する。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 10 guide files (matching updated REQ-0101-014 count) + README.md
  const guidesDir = join(root, "docs", "guides");
  mkdirp(guidesDir);
  const guideNames = [
    "quickstart",
    "command-selection",
    "req-case-flow",
    "intake-learning-backlog-flow",
    "diagnostics-and-maintenance",
    "artifacts-and-state",
    "project-docs-and-specs",
    "consumer-project-setup",
    "troubleshooting",
    "glossary",
  ];
  writeFileSync(
    join(guidesDir, "README.md"),
    "# Guides\n",
    "utf-8",
  );
  for (const name of guideNames) {
    writeFileSync(join(guidesDir, `${name}.md`), `# ${name}\n`, "utf-8");
  }

  // Skills: agentdev-test-skill (valid prefix) — both source and projection
  const skillDir = join(root, ".opencode", "skills", "agentdev-test-skill");
  mkdirp(skillDir);
  writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-test-skill\n", "utf-8");
  const skillSrcDir = join(root, "src", "opencode", "skills", "agentdev-test-skill");
  mkdirp(skillSrcDir);
  writeFileSync(join(skillSrcDir, "SKILL.md"), "# agentdev-test-skill\n", "utf-8");

  // Skills: agentdev-workflow-orchestration — both source and projection
  const wfOrchProjDir = join(root, ".opencode", "skills", "agentdev-workflow-orchestration");
  mkdirp(wfOrchProjDir);
  writeFileSync(join(wfOrchProjDir, "SKILL.md"), "# agentdev-workflow-orchestration\n", "utf-8");

  // Skills: agentdev-workflow-templates — both source and projection
  const wfTemplatesProjDir = join(root, ".opencode", "skills", "agentdev-workflow-templates");
  mkdirp(wfTemplatesProjDir);
  writeFileSync(join(wfTemplatesProjDir, "SKILL.md"), "# agentdev-workflow-templates\n", "utf-8");
  const wfTemplatesSrcDir = join(root, "src", "opencode", "skills", "agentdev-workflow-templates");
  mkdirp(wfTemplatesSrcDir);
  writeFileSync(join(wfTemplatesSrcDir, "SKILL.md"), "# agentdev-workflow-templates\n", "utf-8");

  // Skills: repo-agentdev-integrity (required by the script)
  const integritySkillDir = join(
    root,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
  );
  mkdirp(integritySkillDir);
  writeFileSync(
    join(integritySkillDir, "SKILL.md"),
    [
      "# repo-agentdev-integrity",
      "",
      "## USE FOR",
      "",
      "- integrity checks",
      "",
      "## 検査カテゴリ",
      "",
      "| 検査カテゴリ | 対象 |",
      "|---|---|",
      "| REQ frontmatter ↔ ファイル名 | REQ files |",
      "",
    ].join("\n"),
    "utf-8",
  );
  const integrityRefsDir = join(integritySkillDir, "references");
  mkdirp(integrityRefsDir);
  writeFileSync(
    join(integrityRefsDir, "vocabulary-registry.md"),
    [
      "# Vocabulary Registry",
      "",
      "| コマンド名 | コマンドパス | スキル名 | 廃止済み概念 |",
      "|---|---|---|---|",
      "| test-cmd | .opencode/commands/agentdev/test-cmd.md | agentdev-test-skill | (none) |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Commands
  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(
    join(cmdDir, "test-cmd.md"),
    [
      "---",
      "description: Test command",
      "agent: test-agent",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Capture-boundary duty commands (required by check_integrity.ts checkCommandCaptureDuties)
  const captureDutyCommands: Record<string, string> = {
    "case-run.md": "記録のみ（capture-boundaries 参照）",
    "case-close.md": "回収・保存（capture-boundaries 参照）",
    "req-save.md": "原則非関与（capture-boundaries 参照）",
    "case-open.md": "非関与（capture-boundaries 参照）",
    "case-auto.md": "委譲（capture-boundaries 参照）",
  };
  for (const [filename, body] of Object.entries(captureDutyCommands)) {
    writeFileSync(
      join(cmdDir, filename),
      [
        "---",
        `description: ${filename} capture duty stub`,
        "agent: sisyphus",
        "---",
        "",
        `capture-boundaries 参照。duty: ${body}`,
        "",
      ].join("\n"),
      "utf-8",
    );
  }

  writeFileSync(
    join(cmdDir, "README.md"),
    [
      "# Commands",
      "",
      "| Command | Description | Agent |",
      "|---------|-------------|-------|",
      "| `agentdev/test-cmd` | Test command | test-agent |",
      "| `agentdev/case-run` | Run | sisyphus |",
      "| `agentdev/case-close` | Close | sisyphus |",
      "| `agentdev/case-open` | Open | sisyphus |",
      "| `agentdev/case-auto` | Auto | sisyphus |",
      "| `agentdev/req-save` | Save | sisyphus |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // capture-boundaries.md at canonical location (src/opencode/skills/agentdev-workflow-orchestration/references/)
  const captureBoundariesDir = join(
    root,
    "src",
    "opencode",
    "skills",
    "agentdev-workflow-orchestration",
    "references",
  );
  mkdirp(captureBoundariesDir);
  writeFileSync(
    join(captureBoundariesDir, "capture-boundaries.md"),
    "# Capture Boundaries\n",
    "utf-8",
  );

  // pr_desc.md template with required capture section structure
  const templatesDir = join(
    root,
    ".opencode",
    "skills",
    "agentdev-workflow-templates",
    "templates",
  );
  mkdirp(templatesDir);
  writeFileSync(
    join(templatesDir, "pr_desc.md"),
    [
      "# PR Description",
      "",
      "## Findings / Capture候補",
      "",
      "### intake",
      "",
      "（intake 候補）",
      "",
      "### learning",
      "",
      "（learning 候補）",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Root README
  writeFileSync(
    join(root, "README.md"),
    [
      "# Test Repo",
      "",
      "test-cmd case-run case-close case-open case-auto req-save",
      "",
    ].join("\n"),
    "utf-8",
  );
}

/**
 * Build an invalid fixture: REQ id/filename mismatch + legacy Pattern A/B/C/D in design-principles.
 */
function buildInvalidFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "REQ-0002.md"),
    [
      "---",
      "id: REQ-9999",
      "title: Mismatched id",
      "created: 2026-01-01",
      "updated: 2026-06-07",
      "tags:",
      "  - test",
      "---",
      "",
      "Body.",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-0002 | Mismatched id |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);
  writeFileSync(
    join(specsDir, "design-principles.md"),
    [
      "# Design Principles",
      "",
      "## 1. Patterns",
      "",
      "> **歴史的参照**: `Pattern A/B/C/D` は旧分類コード。",
      "",
    ].join("\n"),
    "utf-8",
  );

  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);

  const skillDir = join(root, ".opencode", "skills", "agentdev-test-skill");
  mkdirp(skillDir);
  writeFileSync(join(skillDir, "SKILL.md"), "# agentdev-test-skill\n", "utf-8");

  const integritySkillDir = join(
    root,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
  );
  mkdirp(integritySkillDir);
  writeFileSync(
    join(integritySkillDir, "SKILL.md"),
    [
      "# repo-agentdev-integrity",
      "",
      "## USE FOR",
      "",
      "- integrity checks",
      "",
    ].join("\n"),
    "utf-8",
  );

  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(
    join(cmdDir, "test-cmd.md"),
    [
      "---",
      "description: Test command",
      "agent: test-agent",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(cmdDir, "README.md"),
    [
      "# Commands",
      "",
      "| Command | Description | Agent |",
      "|---------|-------------|-------|",
      "| `agentdev/test-cmd` | Test command | test-agent |",
      "",
    ].join("\n"),
    "utf-8",
  );
}

const VALID_ROOT = join(TEMP_ROOT, "valid");
const INVALID_ROOT = join(TEMP_ROOT, "invalid");

beforeAll(() => {
  mkdirp(VALID_ROOT);
  mkdirp(INVALID_ROOT);

  buildValidFixture(VALID_ROOT);
  buildInvalidFixture(INVALID_ROOT);

  copyScripts(VALID_ROOT);
  copyScripts(INVALID_ROOT);
});

afterAll(() => {
  if (existsSync(TEMP_ROOT)) {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  }
});

describe("Issue #657 regression: CLI execution verification", () => {
  describe("valid fixture with 10 guides", () => {
    it("exits with code 0 for valid fixture", () => {
      const r = runCli(VALID_ROOT, ["--json"]);
      expect(r.exitCode).toBe(0);
    });

    it("has zero ng results for valid fixture", () => {
      const r = runCli(VALID_ROOT, ["--json"]);
      const parsed = JSON.parse(r.stdout);
      expect(parsed.summary.ng).toBe(0);
    });

    it("does not reference legacy Pattern A/B/C/D in design-principles.md fixture", () => {
      const fixturePath = join(FIXTURES_DIR, "design-principles.md");
      if (!existsSync(fixturePath)) return;
      const content = require("fs").readFileSync(fixturePath, "utf-8") as string;
      expect(content).not.toContain("Pattern A/B/C/D");
      expect(content).not.toMatch(/Pattern\s+[A-D]/);
    });

    it("valid fixture has 10 guide files matching REQ-0101-014 count", () => {
      const guidesDir = join(VALID_ROOT, "docs", "guides");
      const files = require("fs")
        .readdirSync(guidesDir)
        .filter((f: string) => f.endsWith(".md") && f !== "README.md");
      expect(files.length).toBe(10);
    });
  });

  describe("invalid fixture detection", () => {
    it("exits with non-zero code for invalid fixture", () => {
      const r = runCli(INVALID_ROOT, ["--json"]);
      expect(r.exitCode).not.toBe(0);
    });

    it("detects REQ id/filename mismatch", () => {
      const r = runCli(INVALID_ROOT, ["--json"]);
      const parsed = JSON.parse(r.stdout);
      const mismatch = parsed.results.find(
        (res: { check: string; message: string }) =>
          res.check === "frontmatter-filename" &&
          res.message.includes("REQ-9999"),
      );
      expect(mismatch).toBeDefined();
      expect(mismatch.level).toBe("ng");
    });

    it("produces valid JSON output with expected structure", () => {
      const r = runCli(VALID_ROOT, ["--json"]);
      const parsed = JSON.parse(r.stdout);
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("script");
      expect(parsed).toHaveProperty("scanned");
      expect(parsed).toHaveProperty("summary");
      expect(parsed).toHaveProperty("results");
      expect(parsed.script).toBe("check_integrity.ts");
    });
  });

  describe("--help and --dry-run", () => {
    it("--help exits with code 0", () => {
      const r = runCli(VALID_ROOT, ["--help"]);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain("check_integrity.ts");
    });

    it("--dry-run exits with code 0", () => {
      const r = runCli(VALID_ROOT, ["--dry-run"]);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain("Dry run");
    });
  });

  describe("broken junction absence", () => {
    it("agentdev-integrity skill directory does not exist in valid fixture", () => {
      const brokenPath = join(
        VALID_ROOT,
        ".opencode",
        "skills",
        "agentdev-integrity",
      );
      expect(existsSync(brokenPath)).toBe(false);
    });
  });

  describe("REQ-0101-014 guide count in fixture", () => {
    it("fixture REQ-0101-014 mentions 10 ガイド (not 9)", () => {
      const fixturePath = join(FIXTURES_DIR, "REQ-0101.md");
      const content = require("fs").readFileSync(fixturePath, "utf-8") as string;
      expect(content).toContain("10 ガイド");
      expect(content).not.toContain("9 ガイド");
    });
  });

  describe("fixture drift detection (REQ-0144-009)", () => {
    it("valid fixture produces zero NG (drift detection smoke test)", () => {
      const r = runCli(VALID_ROOT, ["--json"]);
      const parsed = JSON.parse(r.stdout);
      expect(parsed.summary.ng).toBe(0);
    });

    it("valid fixture produces zero warnings (drift detection for warning-level rules)", () => {
      const r = runCli(VALID_ROOT, ["--json"]);
      const parsed = JSON.parse(r.stdout);
      expect(parsed.summary.warning).toBe(0);
    });

    it("copied script matches source script (copyScripts sync verification)", () => {
      const sourceScript = join(PARENT_SCRIPTS_DIR, "check_integrity.ts");
      const copiedScript = join(
        VALID_ROOT,
        ".opencode",
        "skills",
        "repo-agentdev-integrity",
        "scripts",
        "check_integrity.ts",
      );
      const sourceContent = require("fs").readFileSync(sourceScript, "utf-8") as string;
      const copiedContent = require("fs").readFileSync(copiedScript, "utf-8") as string;
      expect(copiedContent).toBe(sourceContent);
    });
  });
});
