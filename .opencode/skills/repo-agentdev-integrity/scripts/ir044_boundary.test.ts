import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_integrity.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const GATE_FILTER_FILE = join(SCRIPT_DIR, "gate_filter.ts");
const CATALOG_PARSER_FILE = join(SCRIPT_DIR, "integrity_catalog_parser.ts");
const IMPACT_MAP_PARSER_FILE = join(SCRIPT_DIR, "req_impact_map_parser.ts");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `ir044-test-${crypto.randomUUID().slice(0, 8)}`;
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
}

// Minimal valid fixture. `extraReqRows` is appended to the REQ requirements
// table so tests can inject IR-044 target lines.
function buildFixture(root: string, extraReqRows: string[] = []): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  const reqRows = extraReqRows.length > 0
    ? "\n## 要件\n\n| ID | 要件 |\n|---|---|\n" + extraReqRows.join("\n") + "\n"
    : "";

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
      "Test requirement.",
      "",
      reqRows,
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
      "Relates to REQ-0001.",
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
  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(
    join(cmdDir, "README.md"),
    [
      "# Commands",
      "",
      "| Command | Description |",
      "|---------|-------------|",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(join(root, "README.md"), "# Test Repo\n", "utf-8");
}

function findingsOf(stdout: string, check: string): any[] {
  let report: any;
  try {
    report = JSON.parse(stdout);
  } catch {
    return [];
  }
  return (report.results || []).filter(
    (r: any) => r.check === check && r.level !== "ok" && r.level !== "info",
  );
}

describe("IR-044: REQ/SPEC boundary violation detection (REQ-0136-006)", () => {
  beforeAll(() => mkdirp(TEMP_ROOT));
  afterAll(() => {
    if (existsSync(TEMP_ROOT)) rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

  it("detects schema field signal", () => {
    const fx = join(TEMP_ROOT, "schema-field");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | frontmatter フィールドの型は string とすること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("schema field");
  });

  it("detects enum value list signal", () => {
    const fx = join(TEMP_ROOT, "enum-list");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | 対象の enum 値一覧を定義すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("enum value list");
  });

  it("detects fixture detail signal", () => {
    const fx = join(TEMP_ROOT, "fixture");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | テスト用 fixture を提供すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("fixture detail");
  });

  it("detects checker individual rule signal", () => {
    const fx = join(TEMP_ROOT, "checker-rule");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | checker 個別ルールとして正規表現を定義すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("checker individual rule");
  });

  it("detects false positive suppression signal", () => {
    const fx = join(TEMP_ROOT, "fp-suppression");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | false positive 抑制の除外パスを定義すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("false positive suppression");
  });

  it("detects Step number signal", () => {
    const fx = join(TEMP_ROOT, "step-number");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | Step 4-2 で判定結果を記録すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("Step number");
  });

  it("detects Phase number signal", () => {
    const fx = join(TEMP_ROOT, "phase-number");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | Phase 2 で検証を実施すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("Phase number");
  });

  it("detects internal algorithm signal", () => {
    const fx = join(TEMP_ROOT, "algorithm");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | 内部アルゴリズムはトポロジカルソートを使用すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("internal algorithm");
  });

  it("detects work history signal", () => {
    const fx = join(TEMP_ROOT, "work-history");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | 作業履歴: PR #123 で実装済みの機能であること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].message).toContain("work history");
  });

  it("exempts stable contract exception (REQ-0101-069)", () => {
    const fx = join(TEMP_ROOT, "stable-contract");
    mkdirp(fx);
    copyScripts(fx);
    // Mentions a SPEC-ish keyword but is a stable external contract summary.
    buildFixture(fx, [
      "| REQ-0001-001 | 公開 command 名として /agentdev/case-run を定義すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBe(0);
  });

  it("exempts negation context", () => {
    const fx = join(TEMP_ROOT, "negation");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | REQ は schema field を含まないこと |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBe(0);
  });

  it("reports ok when active REQs have no SPEC detail", () => {
    const fx = join(TEMP_ROOT, "clean-req");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | システムは利用者に完了報告を提示すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const okFindings = (() => {
      let report: any;
      try {
        report = JSON.parse(res.stdout);
      } catch {
        return [];
      }
      return (report.results || []).filter(
        (r: any) =>
          r.check === "req-spec-boundary-violation" && r.level === "ok",
      );
    })();
    expect(okFindings.length).toBe(1);
  });

  it("does not scan retired REQ files", () => {
    const fx = join(TEMP_ROOT, "retired-excluded");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx);
    const retiredDir = join(fx, "docs", "requirements", "retired");
    mkdirp(retiredDir);
    writeFileSync(
      join(retiredDir, "REQ-0050.md"),
      [
        "---",
        "id: REQ-0050",
        "title: Retired",
        "created: 2025-01-01",
        "updated: 2025-01-02",
        "---",
        "",
        "## 要件",
        "",
        "| ID | 要件 |",
        "|---|---|",
        "| REQ-0050-001 | internal algorithm は廃止済み |",
        "",
      ].join("\n"),
      "utf-8",
    );
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBe(0);
  });

  it("sets route to req-define and category canonical-conflict", () => {
    const fx = join(TEMP_ROOT, "route-meta");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | Step 1 で処理すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
    expect(f[0].route).toBe("req-define");
    expect(f[0].finding_category).toBe("canonical-conflict");
  });
});

describe("--strict-only exit code (REQ-0136-004/005)", () => {
  beforeAll(() => mkdirp(TEMP_ROOT));
  afterAll(() => {
    if (existsSync(TEMP_ROOT)) rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

  it("does NOT fail (exit 0) when only heuristic findings exist", () => {
    const fx = join(TEMP_ROOT, "heuristic-only");
    mkdirp(fx);
    copyScripts(fx);
    // IR-044 findings are heuristic (warning level). With --strict-only, exit 0.
    buildFixture(fx, [
      "| REQ-0001-001 | Step 4-2 で処理すること |",
    ]);
    const res = runScript(fx, ["--json", "--strict-only"]);
    expect(res.exitCode).toBe(0);
    // But heuristic findings should still be present in the report.
    const f = findingsOf(res.stdout, "req-spec-boundary-violation");
    expect(f.length).toBeGreaterThan(0);
  });

  it("DOES fail (exit 1) without --strict-only when heuristic findings exist", () => {
    const fx = join(TEMP_ROOT, "heuristic-no-strict-flag");
    mkdirp(fx);
    copyScripts(fx);
    buildFixture(fx, [
      "| REQ-0001-001 | Step 4-2 で処理すること |",
    ]);
    const res = runScript(fx, ["--json"]);
    expect(res.exitCode).toBe(1);
  });
});
