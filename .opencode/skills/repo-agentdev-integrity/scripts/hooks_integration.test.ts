import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_integrity.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const GATE_FILTER_FILE = join(SCRIPT_DIR, "gate_filter.ts");
const CATALOG_PARSER_FILE = join(SCRIPT_DIR, "integrity_catalog_parser.ts");
const IMPACT_MAP_PARSER_FILE = join(SCRIPT_DIR, "req_impact_map_parser.ts");
const REPO_ROOT = (function () {
  const path = require("path");
  let dir = path.resolve(SCRIPT_DIR);
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, ".githooks"))) return dir;
    dir = path.dirname(dir);
  }
  return path.dirname(path.dirname(path.dirname(SCRIPT_DIR)));
})();
const PRE_COMMIT_HOOK = join(REPO_ROOT, ".githooks", "pre-commit");
const CATALOG_SPEC = join(REPO_ROOT, "docs", "specs", "integrity-rule-catalog.md");
const IMPACT_MAP_SPEC = join(REPO_ROOT, "docs", "specs", "req-impact-map.md");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `hooks-test-${crypto.randomUUID().slice(0, 8)}`;
const TEMP_ROOT = join(TEMP_BASE, RUN_ID);

function mkdirp(p: string): void {
  mkdirSync(p, { recursive: true });
}

function sh(cwd: string, script: string): { code: number; stdout: string; stderr: string } {
  const proc = Bun.spawnSync(["sh", "-c", script], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    code: proc.exitCode ?? -1,
    stdout: proc.stdout?.toString("utf-8") ?? "",
    stderr: proc.stderr?.toString("utf-8") ?? "",
  };
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
  copyFileSync(GATE_FILTER_FILE, join(dest, "gate_filter.ts"));
  copyFileSync(CATALOG_PARSER_FILE, join(dest, "integrity_catalog_parser.ts"));
  copyFileSync(IMPACT_MAP_PARSER_FILE, join(dest, "req_impact_map_parser.ts"));
  const hooksDest = join(fixtureRoot, ".githooks");
  mkdirp(hooksDest);
  copyFileSync(PRE_COMMIT_HOOK, join(hooksDest, "pre-commit"));
  // Delta/Impact gates parse the catalog + impact-map SPEC files at runtime.
  const specsDest = join(fixtureRoot, "docs", "specs");
  mkdirp(specsDest);
  copyFileSync(CATALOG_SPEC, join(specsDest, "integrity-rule-catalog.md"));
  copyFileSync(IMPACT_MAP_SPEC, join(specsDest, "req-impact-map.md"));
}

function initGitRepo(root: string): void {
  sh(root, 'git init -q && git config user.email t@t.t && git config user.name t');
}

function buildBase(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "REQ-0001.md"),
    [
      "---",
      "id: REQ-0001",
      "title: Test REQ",
      "created: 2025-01-01",
      "updated: 2025-01-02",
      "---",
      "",
      "## 目的",
      "",
      "Valid requirement.",
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
      "| REQ-0001 | Test REQ |",
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
      "title: Test ADR",
      "status: accepted",
      "---",
      "",
      "REQ-0001.",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(adrDir, "README.md"),
    [
      "# ADR Index",
      "",
      "| ADR | Title | Status |",
      "|-----|-------|--------|",
      "| ADR-0001 | Test ADR | accepted |",
      "",
    ].join("\n"),
    "utf-8",
  );
  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);
  writeFileSync(join(specsDir, "system.md"), "# System\n", "utf-8");
  writeFileSync(join(specsDir, "patterns.md"), "# Patterns\n", "utf-8");
  mkdirp(join(root, ".opencode", "skills"));
  mkdirp(join(root, ".opencode", "commands", "agentdev"));
  writeFileSync(join(root, "README.md"), "# Test Repo\n", "utf-8");
}

describe("pre-commit Delta Guard hook (REQ-0136-004)", () => {
  beforeAll(() => mkdirp(TEMP_ROOT));
  afterAll(() => {
    if (existsSync(TEMP_ROOT)) rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

  it("blocks commit on a STRICT violation (frontmatter id ≠ filename)", () => {
    const fx = join(TEMP_ROOT, "block-strict");
    mkdirp(fx);
    copyScripts(fx);
    initGitRepo(fx);
    buildBase(fx);
    // REQ file whose frontmatter id does NOT match its filename (IR-001 strict).
    writeFileSync(
      join(fx, "docs", "requirements", "REQ-0002.md"),
      [
        "---",
        "id: REQ-9999",
        "title: Mismatched id",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "---",
        "",
        "Bad frontmatter.",
        "",
      ].join("\n"),
      "utf-8",
    );
    sh(fx, "git add -A && git commit -q -m init --no-gpg-sign >/dev/null 2>&1 || true");
    // Stage a change to trigger the hook, then run pre-commit directly.
    writeFileSync(
      join(fx, "docs", "requirements", "REQ-0002.md"),
      [
        "---",
        "id: REQ-9999",
        "title: Mismatched id v2",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "---",
        "",
        "Bad frontmatter staged.",
        "",
      ].join("\n"),
      "utf-8",
    );
    sh(fx, "git add -A");
    const res = sh(fx, "DEVFLOW_SKIP_HOOKS= ./.githooks/pre-commit");
    expect(res.code).toBe(1);
  });

  it("allows commit when only heuristic (non-strict) findings exist", () => {
    const fx = join(TEMP_ROOT, "allow-heuristic");
    mkdirp(fx);
    copyScripts(fx);
    initGitRepo(fx);
    buildBase(fx);
    // IR-044 heuristic finding only (Step number in requirement row).
    writeFileSync(
      join(fx, "docs", "requirements", "REQ-0001.md"),
      [
        "---",
        "id: REQ-0001",
        "title: Test REQ",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "---",
        "",
        "## 要件",
        "",
        "| ID | 要件 |",
        "|---|---|",
        "| REQ-0001-001 | Step 4-2 で判定すること |",
        "",
      ].join("\n"),
      "utf-8",
    );
    sh(fx, "git add -A");
    const res = sh(fx, "DEVFLOW_SKIP_HOOKS= ./.githooks/pre-commit");
    expect(res.code).toBe(0);
  });

  it("allows commit for clean staged files", () => {
    const fx = join(TEMP_ROOT, "clean");
    mkdirp(fx);
    copyScripts(fx);
    initGitRepo(fx);
    buildBase(fx);
    sh(fx, "git add -A");
    const res = sh(fx, "DEVFLOW_SKIP_HOOKS= ./.githooks/pre-commit");
    expect(res.code).toBe(0);
  });

  it("skips (exit 0) when DEVFLOW_SKIP_HOOKS is set", () => {
    const fx = join(TEMP_ROOT, "skip");
    mkdirp(fx);
    copyScripts(fx);
    initGitRepo(fx);
    buildBase(fx);
    writeFileSync(
      join(fx, "docs", "requirements", "REQ-0002.md"),
      [
        "---",
        "id: REQ-9999",
        "title: Mismatched",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "---",
        "",
        "Bad.",
        "",
      ].join("\n"),
      "utf-8",
    );
    sh(fx, "git add -A");
    const res = sh(fx, "DEVFLOW_SKIP_HOOKS=1 ./.githooks/pre-commit");
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("skipped");
  });

  it("skips (exit 0) when there are no staged files", () => {
    const fx = join(TEMP_ROOT, "no-staged");
    mkdirp(fx);
    copyScripts(fx);
    initGitRepo(fx);
    buildBase(fx);
    sh(fx, "git add -A && git commit -q -m init --no-gpg-sign >/dev/null 2>&1 || true");
    const res = sh(fx, "DEVFLOW_SKIP_HOOKS= ./.githooks/pre-commit");
    expect(res.code).toBe(0);
  });
});
