/**
 * check_test_impact.test.ts — Test impact detection gate regression test.
 *
 * Issue #1995 / OU-004 / REQ-019 / TS-004.
 *
 * Verifies:
 *   - stale candidate detection: test references changed Design, test not in PR changes → finding
 *   - updated test suppression: test references changed Design, test in PR changes → no finding
 *   - REQ-ID reference detection: REQ-NNN reference triggers when REQ file changes
 *   - silent-pass warning: Design changed but no test references → warning
 *   - CLI contract: --help, required flags, JSON output schema
 *
 * Mirrors check_changed_docs.test.ts subprocess-spawn pattern (script calls process.exit()).
 */
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync, copyFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_test_impact.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `test-impact-${crypto.randomUUID().slice(0, 8)}`;
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
    "check_test_impact.ts",
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

function setupTempRepo(): void {
  mkdirp(TEMP_ROOT);
  // script は cli_utils.ts と共に TEMP_ROOT 内の所定パスへ配置する
  const scriptDest = join(
    TEMP_ROOT,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "scripts",
    "check_test_impact.ts",
  );
  mkdirp(join(scriptDest, ".."));
  copyFileSync(SCRIPT_FILE, scriptDest);
  copyFileSync(CLI_UTILS_FILE, join(scriptDest, "..", "cli_utils.ts"));
  // git init（--base-ref テスト用）。worktree ではなく main repo 形式で十分
  execSync("git init -q", { cwd: TEMP_ROOT });
  execSync('git config user.email "t@t"', { cwd: TEMP_ROOT });
  execSync('git config user.name "t"', { cwd: TEMP_ROOT });
  execSync("git add -A", { cwd: TEMP_ROOT });
  execSync('git commit -q -m "init"', { cwd: TEMP_ROOT });
}

function writeFile(rel: string, content: string): void {
  const abs = join(TEMP_ROOT, rel);
  mkdirp(join(abs, ".."));
  writeFileSync(abs, content, "utf-8");
}

function commitAll(message: string): void {
  execSync("git add -A", { cwd: TEMP_ROOT });
  execSync(`git commit -q -m "${message}"`, { cwd: TEMP_ROOT });
}

function currentBranch(): string {
  return execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: TEMP_ROOT,
    encoding: "utf-8",
  }).trim();
}

function headRef(): string {
  return "HEAD";
}

beforeAll(() => {
  setupTempRepo();
});

afterAll(() => {
  if (existsSync(TEMP_ROOT)) rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe("check_test_impact.ts CLI contract", () => {
  it("prints help and exits 0 with --help", () => {
    const r = runScript(TEMP_ROOT, ["--help"]);
    expect(r.exitCode).toBe(0);
    expect(r.stderr.toLowerCase()).toContain("usage:");
    expect(r.stderr.toLowerCase()).toContain("description:");
  });

  it("exits 2 when neither --files nor --base-ref is given", () => {
    const r = runScript(TEMP_ROOT, []);
    expect(r.exitCode).toBe(2);
    expect(r.stderr.toLowerCase()).toContain("--files");
  });

  it("exits 2 on unknown argument", () => {
    const r = runScript(TEMP_ROOT, ["--unknown-flag"]);
    expect(r.exitCode).toBe(2);
    expect(r.stderr.toLowerCase()).toContain("unknown argument");
  });
});

describe("check_test_impact.ts stale candidate detection (TS-004)", () => {
  it("detects stale test that references changed Design and is not updated in same PR", () => {
    // Scenario: WP-1..WP-5相当のリファクタリングで Design が変更され、
    // 参照テストが同一 PR で未更新 → 陳腐化候補として検出
    // Setup: main に Design v1 と参照 test を用意 → branch で Design v2 のみ変更
    execSync(`git checkout -q main`, { cwd: TEMP_ROOT });
    writeFile(
      "docs/designs/integrity/sample-gate.md",
      "---\ntitle: Sample Gate\nstatus: draft\n---\n# Sample Gate\n",
    );
    writeFile(
      "src/scripts/sample.test.ts",
      [
        'import { describe, it, expect } from "bun:test";',
        "// このテストは docs/designs/integrity/sample-gate.md を参照する",
        'describe("sample", () => {',
        '  it("passes", () => { expect(1).toBe(1); });',
        "});",
        "",
      ].join("\n"),
    );
    commitAll("add sample-gate Design and its test on main");
    const branch = "test-stale-detection";
    execSync(`git checkout -q -b ${branch}`, { cwd: TEMP_ROOT });
    // branch 側で Design のみ変更（test は更新しない）
    writeFile(
      "docs/designs/integrity/sample-gate.md",
      "---\ntitle: Sample Gate\nstatus: draft\nupdated: 2026-08-09\n---\n# Sample Gate (revised)\nnew content\n",
    );
    execSync("git add -A", { cwd: TEMP_ROOT });
    execSync('git commit -q -m "revise sample-gate Design only"', { cwd: TEMP_ROOT });

    // Design のみが変更された状態で gate を実行
    const r = runScript(TEMP_ROOT, ["--base-ref", "main", "--json"]);
    expect(r.exitCode).toBe(0);
    const report = JSON.parse(r.stdout);
    expect(report.spec_changes.length).toBeGreaterThanOrEqual(1);
    expect(report.spec_changes).toContain("docs/designs/integrity/sample-gate.md");
    // src/scripts/sample.test.ts は Design を参照するが同一 PR で未変更 → 陳腐化候補
    const stale = report.stale_candidates.find(
      (f: any) => f.test_path === "src/scripts/sample.test.ts",
    );
    expect(stale).toBeDefined();
    expect(stale.reference_kind).toBe("full-path");
    expect(stale.spec_path).toBe("docs/designs/integrity/sample-gate.md");

    // main に戻しておく
    execSync(`git checkout -q main`, { cwd: TEMP_ROOT });
    execSync(`git branch -q -D ${branch}`, { cwd: TEMP_ROOT });
  });

  it("suppresses finding when test referencing changed Design is also updated in same PR", () => {
    const branch = "test-update-suppression";
    execSync(`git checkout -q -b ${branch}`, { cwd: TEMP_ROOT });
    // Design と test を同 PR で変更
    writeFile(
      "docs/designs/integrity/updated-gate.md",
      "---\ntitle: Updated Gate\nstatus: draft\n---\n# Updated Gate\n",
    );
    writeFile(
      "src/scripts/updated.test.ts",
      [
        'import { describe, it, expect } from "bun:test";',
        "// docs/designs/integrity/updated-gate.md 参照",
        'describe("updated", () => { it("ok", () => {}); });',
        "",
      ].join("\n"),
    );
    commitAll("add Design and update test in same PR");

    const r = runScript(TEMP_ROOT, ["--base-ref", "main", "--json"]);
    expect(r.exitCode).toBe(0);
    const report = JSON.parse(r.stdout);
    // updated.test.ts は同一 PR で変更済みのため stale_candidates に含まれない
    const stale = report.stale_candidates.find(
      (f: any) => f.test_path === "src/scripts/updated.test.ts",
    );
    expect(stale).toBeUndefined();

    execSync(`git checkout -q main`, { cwd: TEMP_ROOT });
    execSync(`git branch -q -D ${branch}`, { cwd: TEMP_ROOT });
  });

  it("detects REQ-ID reference when REQ file changes", () => {
    const branch = "test-req-id-detection";
    // 事前に REQ ファイルと参照テストを main へ用意
    execSync(`git checkout -q main`, { cwd: TEMP_ROOT });
    writeFile(
      "docs/requirements/REQ-999.md",
      "---\nid: REQ-999\ntitle: Sample\n---\n# Sample REQ\n",
    );
    writeFile(
      "src/scripts/req999.test.ts",
      [
        "// REQ-999 を参照する regression test",
        'import { describe, it, expect } from "bun:test";',
        'describe("req999", () => { it("ok", () => {}); });',
        "",
      ].join("\n"),
    );
    commitAll("add REQ-999 and its test on main");
    execSync(`git checkout -q -b ${branch}`, { cwd: TEMP_ROOT });
    // REQ-999 のみ変更（test は更新しない）
    writeFile(
      "docs/requirements/REQ-999.md",
      "---\nid: REQ-999\ntitle: Sample\nupdated: 2026-08-09\n---\n# Sample REQ (revised)\n",
    );
    commitAll("revise REQ-999 only");

    const r = runScript(TEMP_ROOT, ["--base-ref", "main", "--json"]);
    expect(r.exitCode).toBe(0);
    const report = JSON.parse(r.stdout);
    expect(report.spec_changes).toContain("docs/requirements/REQ-999.md");
    const stale = report.stale_candidates.find(
      (f: any) => f.test_path === "src/scripts/req999.test.ts",
    );
    expect(stale).toBeDefined();
    expect(stale.reference_kind).toBe("req-id");

    execSync(`git checkout -q main`, { cwd: TEMP_ROOT });
    execSync(`git branch -q -D ${branch}`, { cwd: TEMP_ROOT });
  });

  it("emits silent-pass warning when Design changes but no test references found", () => {
    const branch = "test-silent-pass";
    execSync(`git checkout -q -b ${branch}`, { cwd: TEMP_ROOT });
    // 参照テストの無い Design を追加
    writeFile(
      "docs/designs/integrity/orphan-gate.md",
      "---\ntitle: Orphan Gate\nstatus: draft\n---\n# Orphan Gate\n",
    );
    commitAll("add orphan-gate Design");
    const r = runScript(TEMP_ROOT, ["--base-ref", "main", "--json"]);
    expect(r.exitCode).toBe(0);
    const report = JSON.parse(r.stdout);
    expect(report.spec_changes.length).toBeGreaterThanOrEqual(1);
    expect(report.warnings.length).toBeGreaterThanOrEqual(1);
    expect(report.warnings[0]).toMatch(/参照を検出できなかった/);

    execSync(`git checkout -q main`, { cwd: TEMP_ROOT });
    execSync(`git branch -q -D ${branch}`, { cwd: TEMP_ROOT });
  });

  it("emits empty report when no Design changes in PR", () => {
    const branch = "test-no-spec-change";
    execSync(`git checkout -q -b ${branch}`, { cwd: TEMP_ROOT });
    // Design 以外のファイルのみ変更
    writeFile("src/scripts/unrelated.ts", "export const x = 1;\n");
    commitAll("add non-SPEC file");
    const r = runScript(TEMP_ROOT, ["--base-ref", "main", "--json"]);
    expect(r.exitCode).toBe(0);
    const report = JSON.parse(r.stdout);
    expect(report.spec_changes.length).toBe(0);
    expect(report.stale_candidates.length).toBe(0);

    execSync(`git checkout -q main`, { cwd: TEMP_ROOT });
    execSync(`git branch -q -D ${branch}`, { cwd: TEMP_ROOT });
  });

  it("JSON output contains required schema fields", () => {
    const branch = "test-schema";
    execSync(`git checkout -q -b ${branch}`, { cwd: TEMP_ROOT });
    writeFile(
      "docs/designs/integrity/schema-gate.md",
      "---\ntitle: Schema Gate\nstatus: draft\n---\n# Schema Gate\n",
    );
    writeFile(
      "src/scripts/schema.test.ts",
      '// docs/designs/integrity/schema-gate.md\nimport { describe, it, expect } from "bun:test";\ndescribe("s", () => { it("ok", () => {}); });\n',
    );
    commitAll("schema-gate");
    const r = runScript(TEMP_ROOT, ["--base-ref", "main", "--json"]);
    expect(r.exitCode).toBe(0);
    const report = JSON.parse(r.stdout);
    // TestImpactReport schema 必須フィールド
    expect(report).toHaveProperty("base_ref");
    expect(report).toHaveProperty("files_declared");
    expect(report).toHaveProperty("spec_changes");
    expect(report).toHaveProperty("tests_scanned");
    expect(report).toHaveProperty("stale_candidates");
    expect(report).toHaveProperty("warnings");
    expect(Array.isArray(report.spec_changes)).toBe(true);
    expect(Array.isArray(report.stale_candidates)).toBe(true);
    expect(Array.isArray(report.warnings)).toBe(true);
    expect(typeof report.tests_scanned).toBe("number");

    execSync(`git checkout -q main`, { cwd: TEMP_ROOT });
    execSync(`git branch -q -D ${branch}`, { cwd: TEMP_ROOT });
  });
});
