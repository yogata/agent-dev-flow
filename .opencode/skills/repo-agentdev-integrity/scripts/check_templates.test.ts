import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_PATH = path.join(SCRIPT_DIR, "check_templates.ts");

const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..", "..", "..", "..");
const WORKTREE_ROOT = path.resolve(REPO_ROOT, ".worktrees", "328-feature");

const TEMP_BASE = path.join(os.tmpdir(), "opencode");
const TEST_ID = crypto.randomUUID().slice(0, 8);
const TEMP_ROOT = path.join(TEMP_BASE, `templates-test-${TEST_ID}`);

const FIXTURE_TEMPLATES_DIR = path.join(
  TEMP_ROOT,
  ".opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
const FIXTURE_SCRIPTS_DIR = path.join(
  TEMP_ROOT,
  ".opencode",
  "skills",
  "agentdev-integrity",
  "scripts",
);

const VALID_TEMPLATE = `---
name: Feature Request
about: 新機能の要求テンプレート
labels: enhancement
---

## 概要 <!-- 【必須】 -->

機能の概要を記載してください。

## 課題 <!-- 【必須】 -->

現在の課題を記載してください。

## 提案内容 <!-- 【必須】 -->

提案内容を記載してください。

| 項目 | 値 |
|------|-----|
| 優先度 | High |
| 影響範囲 | Backend |

## 完了条件 <!-- 【必須】 -->

完了条件を記載してください。

## テスト戦略 <!-- 【必須】 -->

テスト戦略を記載してください。
`;

const INVALID_TEMPLATE_NO_FRONTMATTER = `## 概要

No frontmatter here.
`;

const BAD_NAME_TEMPLATE = `---
name: Bad Name
about: テスト
---

## 内容 <!-- 【必須】 -->

Some content.
`;

const PLACEHOLDER_TEMPLATE = `---
name: Placeholder Test
about: テスト
---

## 概要 <!-- 【必須】 -->

\${MISSING_VALUE} is unresolved.
Another __PLACEHOLDER__ here.
`;

const TABLE_MISMATCH_TEMPLATE = `---
name: Table Mismatch
about: テスト
---

## 内容 <!-- 【必須】 -->

| 項目 | 値 |
|------|
| test |
`;

function runScript(
  args: string[],
  cwd?: string,
): { exitCode: number; stdout: string; stderr: string } {
  const scriptToRun = cwd
    ? path.join(
        cwd,
        ".opencode",
        "skills",
        "agentdev-integrity",
        "scripts",
        "check_templates.ts",
      )
    : SCRIPT_PATH;

  const result = spawnSync("bun", ["run", scriptToRun, ...args], {
    cwd: cwd ?? REPO_ROOT,
    encoding: "utf-8",
    timeout: 30000,
    env: { ...process.env },
  });

  return {
    exitCode: result.status ?? 1,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
  };
}

function writeFixture(
  templatesDir: string,
  fileName: string,
  content: string,
): void {
  fs.writeFileSync(path.join(templatesDir, fileName), content, "utf-8");
}

function setupFixtureDir(): string {
  fs.mkdirSync(FIXTURE_TEMPLATES_DIR, { recursive: true });
  fs.mkdirSync(FIXTURE_SCRIPTS_DIR, { recursive: true });

  for (const f of fs.readdirSync(SCRIPT_DIR)) {
    if (f.endsWith(".ts") && !f.endsWith(".test.ts")) {
      fs.copyFileSync(path.join(SCRIPT_DIR, f), path.join(FIXTURE_SCRIPTS_DIR, f));
    }
  }

  return FIXTURE_TEMPLATES_DIR;
}

function cleanupDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe("check_templates.ts", () => {
  afterAll(() => {
    cleanupDir(TEMP_ROOT);
  });

  describe("--help flag", () => {
    it("exits with code 0", () => {
      const result = runScript(["--help"]);
      expect(result.exitCode).toBe(0);
    });

    it("stdout contains usage information", () => {
      const result = runScript(["--help"]);
      expect(result.stdout).toContain("check_templates");
      expect(result.stdout).toContain("USAGE");
      expect(result.stdout).toContain("--help");
      expect(result.stdout).toContain("--json");
      expect(result.stdout).toContain("--dry-run");
    });
  });

  describe("--dry-run flag", () => {
    it("exits with code 0 using existing worktree templates", () => {
      const result = runScript(["--dry-run"]);
      expect(result.exitCode).toBe(0);
    });

    it("produces markdown output by default", () => {
      const result = runScript(["--dry-run"]);
      expect(result.stdout).toContain("check_templates Report");
    });
  });

  describe("--json flag", () => {
    it("outputs valid JSON with --json --dry-run", () => {
      const result = runScript(["--json", "--dry-run"]);
      expect(result.exitCode).toBe(0);

      const parsed = JSON.parse(result.stdout);
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("script", "check_templates");
      expect(parsed).toHaveProperty("scanned");
      expect(parsed).toHaveProperty("summary");
      expect(parsed).toHaveProperty("results");

      expect(parsed.summary).toHaveProperty("ok");
      expect(parsed.summary).toHaveProperty("ng");
      expect(parsed.summary).toHaveProperty("warning");
      expect(parsed.summary).toHaveProperty("info");
    });
  });

  describe("valid template directory", () => {
    it("detects OK results for a well-formed feature template", () => {
      const templatesDir = setupFixtureDir();
      writeFixture(templatesDir, "issue_desc_feature.md", VALID_TEMPLATE);

      const result = runScript(["--json"], TEMP_ROOT);
      const parsed = JSON.parse(result.stdout);

      const okResults = parsed.results.filter(
        (r: { level: string }) => r.level === "ok",
      );
      expect(okResults.length).toBeGreaterThan(0);

      const frontmatterNg = parsed.results.find(
        (r: { category: string; level: string }) =>
          r.category === "Frontmatter" && r.level === "ng",
      );
      expect(frontmatterNg).toBeUndefined();

      const placeholderNg = parsed.results.find(
        (r: { check: string; level: string }) =>
          r.check === "Unresolved placeholders" && r.level === "ng",
      );
      expect(placeholderNg).toBeUndefined();
    });
  });

  describe("missing frontmatter", () => {
    it("detects NG for template without frontmatter", () => {
      const templatesDir = setupFixtureDir();
      writeFixture(
        templatesDir,
        "issue_desc_no_fm.md",
        INVALID_TEMPLATE_NO_FRONTMATTER,
      );

      const result = runScript(["--json"], TEMP_ROOT);
      const parsed = JSON.parse(result.stdout);

      const frontmatterNg = parsed.results.find(
        (r: { category: string; level: string; message: string }) =>
          r.category === "Frontmatter" &&
          r.level === "ng" &&
          r.message.includes("Missing frontmatter"),
      );
      expect(frontmatterNg).toBeDefined();
    });
  });

  describe("bad naming convention", () => {
    it("detects warning for file not matching naming patterns", () => {
      const templatesDir = setupFixtureDir();
      writeFixture(templatesDir, "bad_name.md", BAD_NAME_TEMPLATE);

      const result = runScript(["--json"], TEMP_ROOT);
      const parsed = JSON.parse(result.stdout);

      const namingWarn = parsed.results.find(
        (r: { check: string; level: string; message: string }) =>
          r.check === "Naming convention" &&
          r.level === "warning" &&
          r.message.includes("does not match known naming pattern"),
      );
      expect(namingWarn).toBeDefined();
    });
  });

  describe("unresolved placeholders", () => {
    it("detects NG for ${...} and __PLACEHOLDER__ patterns", () => {
      const templatesDir = setupFixtureDir();
      writeFixture(
        templatesDir,
        "issue_desc_placeholder.md",
        PLACEHOLDER_TEMPLATE,
      );

      const result = runScript(["--json"], TEMP_ROOT);
      const parsed = JSON.parse(result.stdout);

      const placeholderNg = parsed.results.filter(
        (r: { check: string; level: string }) =>
          r.check === "Unresolved placeholders" && r.level === "ng",
      );
      expect(placeholderNg.length).toBeGreaterThan(0);
    });
  });

  describe("table structure mismatch", () => {
    it("detects NG when table columns are inconsistent", () => {
      const templatesDir = setupFixtureDir();
      writeFixture(
        templatesDir,
        "issue_desc_table.md",
        TABLE_MISMATCH_TEMPLATE,
      );

      const result = runScript(["--json"], TEMP_ROOT);
      const parsed = JSON.parse(result.stdout);

      const tableNg = parsed.results.find(
        (r: { check: string; level: string; message: string }) =>
          r.check === "Table structure" &&
          r.level === "ng" &&
          r.message.includes("column mismatch"),
      );
      expect(tableNg).toBeDefined();
    });
  });

  describe("exit codes", () => {
    it("returns exit code 2 when templates directory is missing", () => {
      fs.mkdirSync(FIXTURE_SCRIPTS_DIR, { recursive: true });
      for (const f of fs.readdirSync(SCRIPT_DIR)) {
        if (f.endsWith(".ts") && !f.endsWith(".test.ts")) {
          fs.copyFileSync(path.join(SCRIPT_DIR, f), path.join(FIXTURE_SCRIPTS_DIR, f));
        }
      }

      cleanupDir(FIXTURE_TEMPLATES_DIR);

      const result = runScript([], TEMP_ROOT);
      expect(result.exitCode).toBe(2);
    });

    it("returns exit code 1 when issues are detected", () => {
      const templatesDir = setupFixtureDir();
      writeFixture(
        templatesDir,
        "issue_desc_no_fm.md",
        INVALID_TEMPLATE_NO_FRONTMATTER,
      );

      const result = runScript([], TEMP_ROOT);
      expect(result.exitCode).toBe(1);
    });
  });
});
