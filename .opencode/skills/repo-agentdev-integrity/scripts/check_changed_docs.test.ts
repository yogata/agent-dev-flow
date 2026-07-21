/**
 * check_changed_docs.test.ts - Regression test for Targeted Docs Guard.
 *
 * REQ-0158 Phase 5 / Epic #1472 Wave 3 / Issue #1475 TS-004.
 *
 * Verifies:
 *   - TargetedDocsReport JSON output carries all 11 required fields and does
 *     NOT carry the removed doc_inputs_check_required field.
 *   - JSON output, text output, and the in-source interface stay consistent.
 *   - Wave 2 Phase 3 behavior: --files + empty files_checked => FAILURE,
 *     --base-ref + empty files_checked => WARNING.
 *   - CLI contract: --help, required flags, invalid workflow values.
 *
 * The script under test calls process.exit() directly, so we spawn it as a
 * subprocess (mirrors scripts/check_integrity.test.ts pattern).
 */
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_changed_docs.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `changed-docs-test-${crypto.randomUUID().slice(0, 8)}`;
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
    "check_changed_docs.ts",
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

function copyScripts(fixtureRoot: string): void {
  const dest = join(
    fixtureRoot,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "scripts",
  );
  mkdirp(dest);
  copyFileSync(SCRIPT_FILE, join(dest, "check_changed_docs.ts"));
  copyFileSync(CLI_UTILS_FILE, join(dest, "cli_utils.ts"));
}

// Required TargetedDocsReport fields (REQ-0158 Phase 2 / AG-002 / Epic #1515 OU-005 TS-013).
// doc_inputs_check_required is intentionally absent (extensions_check_required
// is its successor). docInputsCheckRequired (camelCase, REQ-0158 「check_changed_docs.ts
// report フィールド」節) は別フィールドとして必須。
const REQUIRED_FIELDS = [
  "workflow",
  "files_checked",
  "coupled_files_checked",
  "failures",
  "warnings",
  "doc_map_update_required",
  "spec_readme_update_required",
  "requirements_readme_update_required",
  "full_docs_check_recommended",
  "extensions_check_required",
  "docInputsCheckRequired",
  "declared_files_check",
] as const;

const FORBIDDEN_FIELDS = ["doc_inputs_check_required"] as const;

// Minimal fixture: one REQ and one SPEC. No failures triggered by content.
function buildMinimalFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "REQ-0001.md"),
    [
      "---",
      "id: REQ-0001",
      "title: fixture requirement",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "## Body",
      "",
      "Fixture content for regression test.",
      "",
    ].join("\n"),
    "utf-8",
  );

  const specsDir = join(root, "docs", "specs");
  mkdirp(specsDir);
  writeFileSync(
    join(specsDir, "fixture-spec.md"),
    [
      "---",
      "title: fixture spec",
      "status: accepted",
      "---",
      "",
      "# Fixture spec",
      "",
      "Fixture content for regression test.",
      "",
    ].join("\n"),
    "utf-8",
  );
}

// Initialize the fixture as a git repository so --base-ref HEAD produces an
// empty diff. Required by the "empty base-ref diff -> WARNING" regression.
function initGitFixture(root: string): void {
  execSync("git init -q", { cwd: root });
  execSync('git config user.email "test@example.com"', { cwd: root });
  execSync('git config user.name "test"', { cwd: root });
  execSync("git add -A", { cwd: root });
  execSync('git commit -q -m "init fixture" --no-verify', { cwd: root });
}

function addSupersededFixtures(root: string): void {
  const specsDir = join(root, "docs", "specs");
  writeFileSync(
    join(specsDir, "superseded-valid.md"),
    [
      "---",
      "title: superseded valid spec",
      "status: superseded",
      "superseded_by: SPEC-0451",
      "---",
      "",
      "# Superseded valid",
      "",
      "Fixture content for superseded_by valid test.",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(specsDir, "superseded-invalid.md"),
    [
      "---",
      "title: superseded invalid spec",
      "status: superseded",
      "---",
      "",
      "# Superseded invalid",
      "",
      "Missing superseded_by frontmatter.",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(specsDir, "unknown-status.md"),
    [
      "---",
      "title: unknown status spec",
      "status: foobar",
      "---",
      "",
      "# Unknown status",
      "",
      "Invalid status value.",
      "",
    ].join("\n"),
    "utf-8",
  );
}

const FIXTURE_ROOT = join(TEMP_ROOT, "fixture");
const GIT_FIXTURE_ROOT = join(TEMP_ROOT, "git-fixture");

beforeAll(() => {
  mkdirp(FIXTURE_ROOT);
  mkdirp(GIT_FIXTURE_ROOT);
  buildMinimalFixture(FIXTURE_ROOT);
  buildMinimalFixture(GIT_FIXTURE_ROOT);
  addSupersededFixtures(FIXTURE_ROOT);
  copyScripts(FIXTURE_ROOT);
  copyScripts(GIT_FIXTURE_ROOT);
  initGitFixture(GIT_FIXTURE_ROOT);
});

afterAll(() => {
  if (existsSync(TEMP_ROOT)) {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  }
});

// ─── TS-004: TargetedDocsReport JSON schema (AG-002) ──────────────────────────

describe("TS-004 / AG-002: TargetedDocsReport JSON schema", () => {
  it("JSON output contains all 11 required fields", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    for (const field of REQUIRED_FIELDS) {
      expect(parsed).toHaveProperty(field);
    }
  });

  it("JSON output does NOT contain doc_inputs_check_required", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    for (const field of FORBIDDEN_FIELDS) {
      expect(parsed).not.toHaveProperty(field);
    }
  });

  it("workflow field reflects the --workflow argument", () => {
    for (const wf of ["req-save", "spec-save", "case-run", "case-close", "docs-check"]) {
      const r = runScript(FIXTURE_ROOT, [
        "--workflow",
        wf,
        "--files",
        "docs/specs/fixture-spec.md",
        "--json",
      ]);
      // exitCode differs by workflow (some emit strict failures when coupled
      // files are missing). We only assert the workflow echo here.
      const parsed = JSON.parse(r.stdout);
      expect(parsed.workflow).toBe(wf);
    }
  });

  it("files_checked includes the supplied file when it matches the profile", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.files_checked).toContain("docs/specs/fixture-spec.md");
  });

  it("failures array entries carry the documented sub-fields", () => {
    // Drive a deterministic failure via --files pointing at a non-existent
    // path under a workflow whose appliesTo accepts it. That yields the
    // TARGET-EMPTY failure with the documented schema.
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "docs-check",
      "--files",
      "docs/specs/does-not-exist.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.failures.length).toBeGreaterThan(0);
    const f = parsed.failures[0];
    expect(f).toHaveProperty("rule_id");
    expect(f).toHaveProperty("severity");
    expect(f).toHaveProperty("file");
    expect(f).toHaveProperty("line");
    expect(f).toHaveProperty("message");
    expect(f).toHaveProperty("expected");
  });

  it("declared_files_check is null when --declared-files is not supplied", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.declared_files_check).toBeNull();
  });

  it("declared_files_check is populated when --declared-files is supplied", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--declared-files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.declared_files_check).not.toBeNull();
    expect(parsed.declared_files_check).toHaveProperty("declared");
    expect(parsed.declared_files_check).toHaveProperty("missing");
    expect(parsed.declared_files_check).toHaveProperty("extra");
  });
});

// ─── TS-004: text output consistency ──────────────────────────────────────────

describe("TS-004: text output reports every required field name", () => {
  const TEXT_TOKEN_BY_FIELD: Record<string, string> = {
    workflow: "workflow:",
    files_checked: "files checked:",
    coupled_files_checked: "coupled files checked:",
    failures: "failures:",
    warnings: "warnings:",
    doc_map_update_required: "doc_map_update_required:",
    spec_readme_update_required: "spec_readme_update_required:",
    requirements_readme_update_required: "requirements_readme_update_required:",
    full_docs_check_recommended: "full_docs_check_recommended:",
    extensions_check_required: "extensions_check_required:",
    docInputsCheckRequired: "docInputsCheckRequired:",
  };

  it("text output mentions every required field via its stable token", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
    ]);
    expect(r.exitCode).toBe(0);
    for (const field of REQUIRED_FIELDS) {
      if (field === "declared_files_check") continue;
      const token = TEXT_TOKEN_BY_FIELD[field];
      expect(token).toBeDefined();
      expect(r.stdout).toContain(token);
    }
  });

  it("text output and JSON output agree on workflow value", () => {
    const args = ["--workflow", "spec-save", "--files", "docs/specs/fixture-spec.md"];
    const jsonRun = runScript(FIXTURE_ROOT, [...args, "--json"]);
    const textRun = runScript(FIXTURE_ROOT, args);
    const parsed = JSON.parse(jsonRun.stdout);
    expect(textRun.stdout).toContain(`workflow: ${parsed.workflow}`);
  });

  it("text output mentions declared_files_check section when populated", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--declared-files",
      "docs/specs/fixture-spec.md",
    ]);
    expect(r.stdout).toContain("declared_files_check");
  });
});

// ─── Wave 2 Phase 3 regression: empty files_checked branching ────────────────

describe("Wave 2 Phase 3 regression: --files + empty files_checked => FAILURE", () => {
  it("exits with non-zero (FAILURE) when --files yields empty files_checked", () => {
    // docs-check profile appliesTo returns true for any path, but the file
    // does not exist on disk, so resolveChangedFiles filters it out and
    // files_checked becomes empty.
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "docs-check",
      "--files",
      "docs/specs/does-not-exist.md",
      "--json",
    ]);
    expect(r.exitCode).not.toBe(0);
  });

  it("emits a TARGET-EMPTY failure with severity strict", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "docs-check",
      "--files",
      "docs/specs/does-not-exist.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    const target = parsed.failures.find(
      (f: { rule_id: string }) => f.rule_id === "TARGET-EMPTY",
    );
    expect(target).toBeDefined();
    expect(target.severity).toBe("strict");
  });

  it("does NOT promote the empty-files case to warnings", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "docs-check",
      "--files",
      "docs/specs/does-not-exist.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    // No warning message should mention --base-ref only phrasing.
    const baseRefWarnings = (parsed.warnings as string[]).filter((w) =>
      w.includes("--base-ref"),
    );
    expect(baseRefWarnings.length).toBe(0);
  });

  it("does NOT classify the case as 'sufficiency of target selection' (command-side responsibility)", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "docs-check",
      "--files",
      "docs/specs/does-not-exist.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    const target = parsed.failures.find(
      (f: { rule_id: string }) => f.rule_id === "TARGET-EMPTY",
    );
    expect(target).toBeDefined();
    // Message must describe "target file not detected", not "sufficiency of
    // target selection" (AG-003 acceptance criterion).
    expect(target.message).toContain("対象ファイルが検出されませんでした");
    expect(target.message).not.toContain("十分性");
  });

  it("--files with non-matching profile also yields FAILURE (file exists but appliesTo rejects)", () => {
    // req-save profile only matches docs/requirements/REQ-*.md. A spec file
    // exists on disk but is filtered out by appliesTo, leaving files_checked
    // empty under --files. Expected: FAILURE.
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "req-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    expect(r.exitCode).not.toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.files_checked.length).toBe(0);
    const target = parsed.failures.find(
      (f: { rule_id: string }) => f.rule_id === "TARGET-EMPTY",
    );
    expect(target).toBeDefined();
  });
});

describe("Wave 2 Phase 3 regression: --base-ref + empty files_checked => WARNING", () => {
  it("exits with code 0 (WARNING, not FAILURE) when --base-ref yields empty diff", () => {
    // GIT_FIXTURE_ROOT has one commit and HEAD...HEAD is empty.
    const r = runScript(GIT_FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--base-ref",
      "HEAD",
      "--json",
    ]);
    expect(r.exitCode).toBe(0);
  });

  it("adds a warning message describing the empty base-ref case", () => {
    const r = runScript(GIT_FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--base-ref",
      "HEAD",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.warnings.length).toBeGreaterThan(0);
    const msg = parsed.warnings.find((w: string) =>
      w.includes("--base-ref"),
    );
    expect(msg).toBeDefined();
    expect(msg).toContain("対象ファイルが検出されませんでした");
  });

  it("does NOT emit a TARGET-EMPTY failure for the empty base-ref case", () => {
    const r = runScript(GIT_FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--base-ref",
      "HEAD",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    const target = parsed.failures.find(
      (f: { rule_id: string }) => f.rule_id === "TARGET-EMPTY",
    );
    expect(target).toBeUndefined();
  });

  it("does NOT classify the case as 'sufficiency of target selection'", () => {
    const r = runScript(GIT_FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--base-ref",
      "HEAD",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    for (const w of parsed.warnings as string[]) {
      expect(w).not.toContain("十分性");
    }
  });
});

// ─── CLI contract ─────────────────────────────────────────────────────────────

describe("CLI contract", () => {
  it("--help exits 0 and prints usage banner", () => {
    const r = runScript(FIXTURE_ROOT, ["--help"]);
    expect(r.exitCode).toBe(0);
    expect(r.stderr.toLowerCase()).toContain("usage:");
    expect(r.stderr).toContain("--workflow");
    expect(r.stderr).toContain("--files");
    expect(r.stderr).toContain("--base-ref");
  });

  it("missing --workflow exits with EXIT_ERROR (2)", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    expect(r.exitCode).toBe(2);
  });

  it("invalid --workflow value exits with EXIT_ERROR (2)", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "bogus-workflow",
      "--files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    expect(r.exitCode).toBe(2);
  });

  it("missing both --files and --base-ref exits with EXIT_ERROR (2)", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--json",
    ]);
    expect(r.exitCode).toBe(2);
  });

  it("accepts --fail-level warning (loose mode) without error", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--fail-level",
      "warning",
      "--json",
    ]);
    // No exception thrown -> parsed JSON -> exit 0 (no strict failures).
    expect(r.exitCode).toBe(0);
  });
});

// ─── Wave 1 / Wave 2 cross-cutting guard ──────────────────────────────────────

describe("Cross-cutting: doc_inputs_check_required must stay removed", () => {
  it("source file does not reference doc_inputs_check_required", () => {
    const fs = require("fs") as typeof import("fs");
    const content = fs.readFileSync(SCRIPT_FILE, "utf-8") as string;
    expect(content).not.toContain("doc_inputs_check_required");
  });

  it("JSON output key set is exactly the 11 required fields (no extras, no missing)", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/fixture-spec.md",
      "--json",
    ]);
    const parsed = JSON.parse(r.stdout);
    const actualKeys = new Set(Object.keys(parsed));
    const expectedKeys = new Set<string>(REQUIRED_FIELDS);
    // Symmetric difference must be empty.
    const missing = [...expectedKeys].filter((k) => !actualKeys.has(k));
    const extra = [...actualKeys].filter((k) => !expectedKeys.has(k));
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
  });
});

// ─── Issue #1671 TS-004: SPEC status superseded_by handling ─────────────────

describe("Issue #1671 TS-004: SPEC status superseded_by handling (ADR-0123, REQ-0101-076)", () => {
  it("superseded + superseded_by 設定済み → SPEC-STATUS failure なし (exit 0)", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/superseded-valid.md",
      "--json",
    ]);
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    const statusFailures = parsed.failures.filter(
      (f: { rule_id: string }) => f.rule_id === "SPEC-STATUS",
    );
    expect(statusFailures).toEqual([]);
  });

  it("superseded + superseded_by 未設定 → SPEC-STATUS strict failure (exit 非0)", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/superseded-invalid.md",
      "--json",
    ]);
    expect(r.exitCode).not.toBe(0);
    const parsed = JSON.parse(r.stdout);
    const target = parsed.failures.find(
      (f: { rule_id: string; severity: string }) =>
        f.rule_id === "SPEC-STATUS" && f.severity === "strict",
    );
    expect(target).toBeDefined();
    expect(target.message).toContain("superseded_by");
  });

  it("不正 status → SPEC-STATUS warning", () => {
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/unknown-status.md",
      "--json",
      "--fail-level",
      "warning",
    ]);
    const parsed = JSON.parse(r.stdout);
    const target = parsed.failures.find(
      (f: { rule_id: string; severity: string }) =>
        f.rule_id === "SPEC-STATUS" && f.severity === "warning",
    );
    expect(target).toBeDefined();
    expect(target.message).toContain("foobar");
  });

  it("status 欠落 → accepted 相当 → SPEC-STATUS failure なし", () => {
    const specsDir = join(FIXTURE_ROOT, "docs", "specs");
    writeFileSync(
      join(specsDir, "status-missing.md"),
      [
        "---",
        "title: status missing spec",
        "---",
        "",
        "# Status missing",
        "",
        "status frontmatter is absent (accepted equivalent).",
        "",
      ].join("\n"),
      "utf-8",
    );
    const r = runScript(FIXTURE_ROOT, [
      "--workflow",
      "spec-save",
      "--files",
      "docs/specs/status-missing.md",
      "--json",
    ]);
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    const statusFailures = parsed.failures.filter(
      (f: { rule_id: string }) => f.rule_id === "SPEC-STATUS",
    );
    expect(statusFailures).toEqual([]);
  });
});
