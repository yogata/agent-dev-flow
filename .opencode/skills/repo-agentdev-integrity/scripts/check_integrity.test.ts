import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_integrity.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `integrity-test-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function runScript(cwd: string, args: string[]): RunResult {
  const scriptPath = join(
    cwd,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "scripts",
    "check_integrity.ts",
  );
  const proc = Bun.spawnSync(["bun", "run", scriptPath, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    exitCode: proc.exitCode ?? -1,
    stdout: proc.stdout?.toString("utf-8") ?? "",
    stderr: proc.stderr?.toString("utf-8") ?? "",
  };
}

function mkdirp(p: string): void {
  mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdirp(p.split(/[\\/]/g).slice(0, -1).join("/")!);
  writeFileSync(p, content, "utf-8");
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
  copyFileSync(SCRIPT_FILE, join(dest, "check_integrity.ts"));
  copyFileSync(CLI_UTILS_FILE, join(dest, "cli_utils.ts"));
}

function buildValidFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  writeFileSync(
    join(reqDir, "REQ-0001.md"),
    [
      "---",
      "id: REQ-0001",
      "title: Valid requirement",
      "created: 2025-01-01",
      "updated: 2025-01-02",
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
      "| REQ-0001 | Valid requirement |",
      "",
    ].join("\n"),
    "utf-8",
  );

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
      "Relates to REQ-0001.",
      "",
    ].join("\n"),
    "utf-8",
  );

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
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(join(specsDir, "patterns.md"), "# Patterns\n", "utf-8");

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
      "## 検査カテゴリ",
      "",
      "| 検査カテゴリ | 対象 |",
      "|---|---|",
      "| REQ frontmatter ↔ ファイル名 | REQ files |",
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

function buildInvalidFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  writeFileSync(
    join(reqDir, "REQ-0002.md"),
    [
      "---",
      "id: REQ-9999",
      "title: Mismatched id",
      "created: 2025-01-01",
      "updated: 2025-01-02",
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
    join(reqDir, "REQ-0003.md"),
    [
      "---",
      "id: REQ-0003",
      "title: Missing fields",
      "created: 2025-01-01",
      "---",
      "",
      "Body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  // README.md: lists REQ-0002 (OK) and phantom REQ-0099 (no file)
  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-0002 | Mismatched id |",
      "| REQ-0099 | Phantom entry |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);

  writeFileSync(
    join(adrDir, "ADR-0001.md"),
    [
      "---",
      "id: ADR-0001",
      "title: Cross-ref to missing REQ",
      "---",
      "",
      "Relates to REQ-0099.",
      "",
    ].join("\n"),
    "utf-8",
  );

  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);

  const skill1 = join(root, ".opencode", "skills", "agentdev-test-skill");
  mkdirp(skill1);
  writeFileSync(join(skill1, "SKILL.md"), "# agentdev-test-skill\n", "utf-8");

  const skill2 = join(root, ".opencode", "skills", "bad-skill");
  mkdirp(skill2);
  writeFileSync(join(skill2, "SKILL.md"), "# bad-skill\n", "utf-8");

  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);

  writeFileSync(
    join(cmdDir, "test-cmd.md"),
    [
      "---",
      "description: Test command",
      "agent: test-agent",
      "implementation_pattern: single_agent",
      "load_skills:",
      "  - agentdev-nonexistent",
      "---",
      "",
      "Test command body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(cmdDir, "bad-cmd.md"),
    [
      "---",
      "description: Bad command",
      "---",
      "",
      "Missing agent and load_skills.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(cmdDir, "README.md"),
    [
      "# Commands",
      "",
      "| Command | Description | Agent | Skills |",
      "|---------|-------------|-------|--------|",
      "| `agentdev/test-cmd` | Test command | test-agent | agentdev-nonexistent |",
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

describe("check_integrity.ts --help", () => {
  it("exits with code 0 and shows help text", () => {
    const r = runScript(VALID_ROOT, ["--help"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("check_integrity.ts");
    expect(r.stdout).toContain("USAGE");
    expect(r.stdout).toContain("--json");
    expect(r.stdout).toContain("--dry-run");
  });
});

describe("check_integrity.ts --dry-run", () => {
  it("exits with code 0 and shows what would be checked", () => {
    const r = runScript(VALID_ROOT, ["--dry-run"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("Dry run");
    expect(r.stdout).toContain("REQ files");
    expect(r.stdout).toContain("ADR files");
    expect(r.stdout).toContain("Skills");
    expect(r.stdout).toContain("Commands");
  });
});

describe("check_integrity.ts --json output schema", () => {
  it("produces valid JSON with expected top-level keys", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed).toHaveProperty("timestamp");
    expect(parsed).toHaveProperty("script");
    expect(parsed).toHaveProperty("scanned");
    expect(parsed).toHaveProperty("summary");
    expect(parsed).toHaveProperty("results");
    expect(parsed.script).toBe("check_integrity.ts");
    expect(typeof parsed.summary.ok).toBe("number");
    expect(typeof parsed.summary.ng).toBe("number");
    expect(typeof parsed.summary.warning).toBe("number");
    expect(typeof parsed.summary.info).toBe("number");
    expect(Array.isArray(parsed.results)).toBe(true);
  });
});

describe("valid fixture (all checks pass or info-only)", () => {
  it("exits with code 0", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    expect(r.exitCode).toBe(0);
  });

  it("has zero ng results", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary.ng).toBe(0);
  });

  it("REQ frontmatter-filename check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "frontmatter-filename",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("REQ required-fields check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "required-fields",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("REQ readme-index-sync check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "readme-index-sync",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("ADR cross-reference check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ADR" && res.check === "adr-req-crossref",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("specs existence check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const specResults = parsed.results.filter(
      (res: { category: string }) => res.category === "Specs",
    );
    expect(specResults.length).toBeGreaterThanOrEqual(1);
    for (const sr of specResults) {
      expect(sr.level).toBe("ok");
    }
  });
});

describe("invalid fixture detects violations", () => {
  it("exits with code 1 (NG)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    expect(r.exitCode).toBe(1);
  });

  it("has at least one ng result", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary.ng).toBeGreaterThan(0);
  });

  it("detects REQ id/filename mismatch (REQ-0002 has id REQ-9999)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const mismatch = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "frontmatter-filename" &&
        res.message.includes("REQ-9999") &&
        res.message.includes("REQ-0002"),
    );
    expect(mismatch).toBeDefined();
    expect(mismatch.level).toBe("ng");
  });

  it("detects missing required fields (REQ-0003)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const missingFields = parsed.results.find(
      (res: { check: string; message: string; file?: string }) =>
        res.check === "required-fields" &&
        (res.message.includes("REQ-0003") ||
          (res.file ?? "").includes("REQ-0003")),
    );
    expect(missingFields).toBeDefined();
    expect(missingFields.level).toBe("ng");
  });

  it("detects phantom README index entry (REQ-0099)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const phantom = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "readme-index-sync" && res.message.includes("REQ-0099"),
    );
    expect(phantom).toBeDefined();
    expect(phantom.level).toBe("ng");
  });

  it("detects REQ file missing from README index", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const missing = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "readme-index-sync" &&
        res.message.includes("REQ-0003") &&
        res.message.includes("missing from README"),
    );
    expect(missing).toBeDefined();
    expect(missing.level).toBe("ng");
  });

  it("detects ADR referencing non-existent REQ (REQ-0099)", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const badRef = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "adr-req-crossref" && res.message.includes("REQ-0099"),
    );
    expect(badRef).toBeDefined();
    expect(badRef.level).toBe("ng");
  });

  it("detects missing spec files", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const specNg = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "Specs" && res.level === "ng",
    );
    expect(specNg.length).toBeGreaterThan(0);
  });

  it("detects load_skills referencing non-existent skill", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const badSkill = parsed.results.find(
      (res: { check: string; message: string }) =>
        (res.check === "cmd-load-skills" ||
          res.check === "load-skills-frontmatter") &&
        (res.message.includes("agentdev-nonexistent") ||
          (res.evidence ?? "").includes("agentdev-nonexistent")),
    );
    expect(badSkill).toBeDefined();
    expect(badSkill.level).toBe("ng");
  });

  it("detects command missing required frontmatter fields", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const badCmd = parsed.results.find(
      (res: { check: string; message: string; file?: string }) =>
        res.check === "command-inventory" &&
        (res.message.includes("bad-cmd") ||
          (res.file ?? "").includes("bad-cmd")),
    );
    expect(badCmd).toBeDefined();
    expect(badCmd.level).toBe("ng");
  });
});
