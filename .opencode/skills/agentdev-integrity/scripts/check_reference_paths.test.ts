import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from "fs";
import { join } from "path";
import type { IntegrityReport } from "./cli_utils.ts";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_integrity.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `ref-paths-test-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

function mkdirp(p: string): void {
  mkdirSync(p, { recursive: true });
}

function copyScripts(fixtureRoot: string): void {
  const dest = join(fixtureRoot, ".opencode", "skills", "agentdev-integrity", "scripts");
  mkdirp(dest);
  copyFileSync(SCRIPT_FILE, join(dest, "check_integrity.ts"));
  copyFileSync(CLI_UTILS_FILE, join(dest, "cli_utils.ts"));
}

interface RunResult {
  exitCode: number;
  report: IntegrityReport | null;
  stderr: string;
}

function runScriptJson(cwd: string): RunResult {
  const scriptPath = join(cwd, ".opencode", "skills", "agentdev-integrity", "scripts", "check_integrity.ts");
  const proc = Bun.spawnSync(["bun", "run", scriptPath, "--json"], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = proc.stdout?.toString("utf-8") ?? "";
  const stderr = proc.stderr?.toString("utf-8") ?? "";
  let report: IntegrityReport | null = null;
  try {
    report = JSON.parse(stdout);
  } catch {
  }
  return { exitCode: proc.exitCode ?? -1, report, stderr };
}

function buildMinimalFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(join(reqDir, "REQ-0001.md"), [
    "---",
    "id: REQ-0001",
    "title: Test",
    "created: 2025-01-01",
    "updated: 2025-01-01",
    "tags:",
    "  - test",
    "---",
    "",
    "Body.",
    "",
  ].join("\n"), "utf-8");
  writeFileSync(join(reqDir, "README.md"), [
    "# Requirements",
    "",
    "| ID | Title |",
    "|----|-------|",
    "| REQ-0001 | Test |",
    "",
  ].join("\n"), "utf-8");

  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);
  writeFileSync(join(adrDir, "ADR-0001.md"), [
    "---",
    "id: ADR-0001",
    "title: Test ADR",
    "---",
    "",
    "Relates to REQ-0001.",
    "",
  ].join("\n"), "utf-8");

  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);
  writeFileSync(join(specsDir, "system.md"), "# System\n\ntest-cmd\n", "utf-8");
  writeFileSync(join(specsDir, "patterns.md"), "# Patterns\n", "utf-8");

  const skillsDir = join(root, ".opencode", "skills");
  const minimalSkills = ["agentdev-test-skill", "agentdev-workflow-reporting"];
  for (const name of minimalSkills) {
    mkdirp(join(skillsDir, name));
  }
  writeFileSync(join(skillsDir, "agentdev-test-skill", "SKILL.md"), "# agentdev-test-skill\n", "utf-8");
  writeFileSync(join(skillsDir, "agentdev-workflow-reporting", "SKILL.md"), "# agentdev-workflow-reporting\n", "utf-8");

  const reportingRefDir = join(skillsDir, "agentdev-workflow-reporting", "references");
  mkdirp(reportingRefDir);
  writeFileSync(join(reportingRefDir, "completion-reports.md"), [
    "# 完了報告フォーマット",
    "",
    "## test-cmd 完了時",
    "",
    "```",
    "✅ test-cmd 完了",
    "```",
    "",
  ].join("\n"), "utf-8");

  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(join(cmdDir, "README.md"), [
    "# Commands",
    "",
    "| Command | Description | Agent | Skills |",
    "|---------|-------------|-------|--------|",
    "| `agentdev/test-cmd` | Test | test-agent | agentdev-test-skill |",
    "",
  ].join("\n"), "utf-8");
}

describe("checkScriptTemplateReferencePaths", () => {
  beforeAll(() => {
    mkdirp(TEMP_ROOT);
  });

  afterAll(() => {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

  it("reports ok when referenced script path exists", () => {
    const root = join(TEMP_ROOT, "existing-path");
    buildMinimalFixture(root);
    copyScripts(root);

    const skillsDir = join(root, ".opencode", "skills");
    mkdirp(join(skillsDir, "agentdev-test-skill", "scripts"));
    writeFileSync(join(skillsDir, "agentdev-test-skill", "scripts", "run.ts"), "// ok", "utf-8");

    writeFileSync(join(skillsDir, "agentdev-test-skill", "SKILL.md"), [
      "---",
      "name: agentdev-test-skill",
      "---",
      "",
      "See scripts/run.ts for implementation.",
      "",
    ].join("\n"), "utf-8");

    const cmdDir = join(root, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: oracle",
      "implementation_pattern: file-pipeline",
      "load_skills:",
      "  - agentdev-test-skill",
      "---",
      "",
      "Invoke .opencode/skills/agentdev-test-skill/scripts/run.ts.",
      "",
    ].join("\n"), "utf-8");

    const result = runScriptJson(root);
    expect(result.report).not.toBeNull();
    const refResults = (result.report!.results || []).filter(
      (r) => r.category === "ReferencePath" && r.check === "reference-path-existence",
    );
    const ngResults = refResults.filter((r) => r.level === "ng");
    expect(ngResults.length).toBe(0);
    expect(refResults.some((r) => r.level === "ok")).toBe(true);
  });

  it("reports ng when referenced script path is missing", () => {
    const root = join(TEMP_ROOT, "missing-path");
    buildMinimalFixture(root);
    copyScripts(root);

    const skillsDir = join(root, ".opencode", "skills");
    mkdirp(join(skillsDir, "agentdev-test-skill", "scripts"));

    const cmdDir = join(root, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: oracle",
      "implementation_pattern: file-pipeline",
      "load_skills:",
      "  - agentdev-test-skill",
      "---",
      "",
      "Run scripts/missing.ts to validate.",
      "",
    ].join("\n"), "utf-8");

    const result = runScriptJson(root);
    expect(result.report).not.toBeNull();
    const refNg = (result.report!.results || []).filter(
      (r) => r.category === "ReferencePath" && r.level === "ng",
    );
    expect(refNg.length).toBeGreaterThanOrEqual(1);
    expect(refNg.some((r) => r.evidence?.includes("missing.ts"))).toBe(true);
    expect(refNg.every((r) => r.route === "intake")).toBe(true);
  });

  it("resolves repo-root-relative paths", () => {
    const root = join(TEMP_ROOT, "root-rel-path");
    buildMinimalFixture(root);
    copyScripts(root);

    const skillsDir = join(root, ".opencode", "skills");
    mkdirp(join(skillsDir, "agentdev-test-skill", "scripts"));
    writeFileSync(join(skillsDir, "agentdev-test-skill", "scripts", "run.ts"), "// ok", "utf-8");

    const cmdDir = join(root, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: oracle",
      "implementation_pattern: file-pipeline",
      "load_skills:",
      "  - agentdev-test-skill",
      "---",
      "",
      "Invoke .opencode/skills/agentdev-test-skill/scripts/run.ts.",
      "",
    ].join("\n"), "utf-8");

    const result = runScriptJson(root);
    expect(result.report).not.toBeNull();
    const refNg = (result.report!.results || []).filter(
      (r) => r.category === "ReferencePath" && r.level === "ng",
    );
    expect(refNg.length).toBe(0);
  });

  it("does not flag paths inside code blocks", () => {
    const root = join(TEMP_ROOT, "codeblock-path");
    buildMinimalFixture(root);
    copyScripts(root);

    const skillsDir = join(root, ".opencode", "skills");
    mkdirp(join(skillsDir, "agentdev-test-skill", "scripts"));

    const cmdDir = join(root, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: oracle",
      "implementation_pattern: file-pipeline",
      "load_skills:",
      "  - agentdev-test-skill",
      "---",
      "",
      "Example:",
      "```",
      "scripts/nonexistent.ts",
      "```",
      "",
    ].join("\n"), "utf-8");

    const result = runScriptJson(root);
    expect(result.report).not.toBeNull();
    const refNg = (result.report!.results || []).filter(
      (r) => r.category === "ReferencePath" && r.level === "ng",
    );
    expect(refNg.length).toBe(0);
  });

  it("does not flag template placeholders with curly braces", () => {
    const root = join(TEMP_ROOT, "placeholder-path");
    buildMinimalFixture(root);
    copyScripts(root);

    const cmdDir = join(root, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: oracle",
      "implementation_pattern: file-pipeline",
      "load_skills:",
      "  - agentdev-test-skill",
      "---",
      "",
      "Run scripts/{script_name}.ts to validate.",
      "",
    ].join("\n"), "utf-8");

    const result = runScriptJson(root);
    expect(result.report).not.toBeNull();
    const refNg = (result.report!.results || []).filter(
      (r) => r.category === "ReferencePath" && r.level === "ng",
    );
    const placeholderNg = refNg.filter((r) => r.evidence?.includes("{"));
    expect(placeholderNg.length).toBe(0);
  });

  it("reports ng for missing repo-root-relative references", () => {
    const root = join(TEMP_ROOT, "root-rel-missing");
    buildMinimalFixture(root);
    copyScripts(root);

    const cmdDir = join(root, ".opencode", "commands", "agentdev");
    writeFileSync(join(cmdDir, "test-cmd.md"), [
      "---",
      "description: Test",
      "agent: oracle",
      "implementation_pattern: file-pipeline",
      "load_skills:",
      "  - agentdev-test-skill",
      "---",
      "",
      "See .opencode/skills/agentdev-test-skill/scripts/absent.ts for logic.",
      "",
    ].join("\n"), "utf-8");

    const result = runScriptJson(root);
    expect(result.report).not.toBeNull();
    const refNg = (result.report!.results || []).filter(
      (r) => r.category === "ReferencePath" && r.level === "ng",
    );
    expect(refNg.length).toBeGreaterThanOrEqual(1);
    expect(refNg.some((r) => r.evidence?.includes("absent.ts"))).toBe(true);
  });

  it("resolves skill-relative paths from SKILL.md", () => {
    const root = join(TEMP_ROOT, "skill-relative");
    buildMinimalFixture(root);
    copyScripts(root);

    const skillsDir = join(root, ".opencode", "skills");
    mkdirp(join(skillsDir, "agentdev-test-skill", "scripts"));
    writeFileSync(join(skillsDir, "agentdev-test-skill", "scripts", "validate.ts"), "// ok", "utf-8");

    writeFileSync(join(skillsDir, "agentdev-test-skill", "SKILL.md"), [
      "---",
      "name: agentdev-test-skill",
      "---",
      "",
      "See scripts/validate.ts for implementation.",
      "",
    ].join("\n"), "utf-8");

    const result = runScriptJson(root);
    expect(result.report).not.toBeNull();
    const refNg = (result.report!.results || []).filter(
      (r) => r.category === "ReferencePath" && r.level === "ng",
    );
    expect(refNg.length).toBe(0);
  });
});
