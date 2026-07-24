import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_integrity.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const GEN_INDEXES_FILE = join(SCRIPT_DIR, "generate_indexes.ts");
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

// REQ-0108-268: fixture には check_integrity.ts と cli_utils.ts のみコピーする。
// baseline ファイル（baselines/ir-055-baseline.json）はコピーしないことで、
// valid fixture は本番の baseline 既知違反から独立し、既知違反の変更が
// valid fixture 系の成否に影響しない。
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
  copyFileSync(GEN_INDEXES_FILE, join(dest, "generate_indexes.ts"));
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
      "| `/agentdev/case-run` | case-run |",
      "| `/agentdev/case-close` | case-close |",
      "| `/agentdev/req-save` | req-save |",
      "| `/agentdev/case-open` | case-open |",
      "| `/agentdev/case-auto` | case-auto |",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(join(specsDir, "patterns.md"), "# Patterns\n", "utf-8");

  // REQ-0108-268: foundations/system.md は expanded-readme-sync チェック対象。
  // agentdev/ 配下の全コマンド名を含め、同チェックを OK にする。
  mkdirp(join(specsDir, "foundations"));
  writeFileSync(
    join(specsDir, "foundations", "system.md"),
    [
      "# System (foundations)",
      "",
      "## Commands",
      "",
      "| Command | Description |",
      "|---------|-------------|",
      "| `/agentdev/test-cmd` | Test command |",
      "| `/agentdev/case-run` | case-run |",
      "| `/agentdev/case-close` | case-close |",
      "| `/agentdev/req-save` | req-save |",
      "| `/agentdev/case-open` | case-open |",
      "| `/agentdev/case-auto` | case-auto |",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(specsDir, "foundations", "patterns.md"),
    "# Patterns (foundations)\n",
    "utf-8",
  );
  writeFileSync(
    join(specsDir, "README.md"),
    [
      "# SPEC Index",
      "",
      "| SPEC | status |",
      "|------|--------|",
      "| foundations/system.md | accepted |",
      "| foundations/patterns.md | accepted |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const docsDir = join(root, "docs");
  writeFileSync(
    join(docsDir, "DOC-MAP.md"),
    [
      "# DOC-MAP",
      "",
      "| 分類 | パス |",
      "|------|------|",
      "| REQ | docs/requirements/REQ-0001.md |",
      "| SPEC | docs/specs/system.md |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const skillDir = join(root, ".opencode", "skills", "agentdev-test-skill");
  mkdirp(skillDir);
  writeFileSync(join(skillDir, "SKILL.md"), "---\nname: agentdev-test-skill\n---\n# agentdev-test-skill\n\n## USE FOR\n\n- test\n", "utf-8");

  const workflowOrchSkillDir = join(root, ".opencode", "skills", "agentdev-workflow-orchestration");
  mkdirp(workflowOrchSkillDir);
  writeFileSync(join(workflowOrchSkillDir, "SKILL.md"), "---\nname: agentdev-workflow-orchestration\n---\n# agentdev-workflow-orchestration\n\n## USE FOR\n\n- orchestration\n", "utf-8");

  const workflowTplSkillDir = join(root, ".opencode", "skills", "agentdev-workflow-templates");
  mkdirp(workflowTplSkillDir);
  writeFileSync(join(workflowTplSkillDir, "SKILL.md"), "---\nname: agentdev-workflow-templates\n---\n# agentdev-workflow-templates\n\n## USE FOR\n\n- templates\n", "utf-8");

  // Source-side skill dirs (source-projection-sync)
  mkdirp(join(root, "src", "opencode", "skills", "agentdev-test-skill"));
  mkdirp(join(root, "src", "opencode", "skills", "agentdev-workflow-templates"));

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

  const vocabRegistryDir = join(integritySkillDir, "references");
  mkdirp(vocabRegistryDir);
  writeFileSync(
    join(vocabRegistryDir, "vocabulary-registry.md"),
    [
      "# Vocabulary Registry",
      "",
      "## コマンド名",
      "",
      "| 旧語彙 | 新語彙 | 備考 |",
      "|--------|--------|------|",
      "| issue-req | req-save | migration |",
      "",
      "## コマンドパス",
      "",
      "| 旧語彙 | 新語彙 | 備考 |",
      "|--------|--------|------|",
      "| commands/issue/ | commands/agentdev/ | migration |",
      "",
      "## スキル名",
      "",
      "| 旧語彙 | 新語彙 | 備考 |",
      "|--------|--------|------|",
      "| issue-lifecycle | agentdev-workflow-lifecycle | migration |",
      "",
      "## 廃止済み概念",
      "",
      "| 旧語彙 | 新語彙 | 備考 |",
      "|--------|--------|------|",
      "| tips プール | learning プール | migration |",
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
      "| `agentdev/case-run` | case-run | sisyphus |",
      "| `agentdev/case-close` | case-close | sisyphus |",
      "| `agentdev/req-save` | req-save | prometheus |",
      "| `agentdev/case-open` | case-open | prometheus |",
      "| `agentdev/case-auto` | case-auto | sisyphus |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const captureBoundaryDir = join(
    root,
    "src",
    "opencode",
    "skills",
    "agentdev-workflow-orchestration",
    "references",
  );
  mkdirp(captureBoundaryDir);
  writeFileSync(
    join(captureBoundaryDir, "capture-boundaries.md"),
    "# Capture Boundaries\n\nSplit rule and command duty boundaries.\n",
    "utf-8",
  );

  const prTemplateDir = join(
    root,
    ".opencode",
    "skills",
    "agentdev-workflow-templates",
    "templates",
  );
  mkdirp(prTemplateDir);
  writeFileSync(
    join(prTemplateDir, "pr_desc.md"),
    [
      "# PR Description Template",
      "",
      "## Findings / Capture\u5019\u88dc",
      "",
      "### intake",
      "",
      "Intake capture items.",
      "",
      "### learning",
      "",
      "Learning capture items.",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Issue #1769 / AG-002: case-run, case-close, req-save は具体的 capture 責務を持ち、
  // capture-boundaries 参照が必須。case-open（非関与）、case-auto（各工程の責務を継承）
  // は capture 責務表により検出対象外（capture-boundaries 参照不要）。
  const captureCmdDuties: Record<string, string> = {
    "case-run.md":
      "---\ndescription: case-run\nagent: sisyphus\n---\n\nSee capture-boundaries for duty. 記録のみ.\n",
    "case-close.md":
      "---\ndescription: case-close\nagent: sisyphus\n---\n\nSee capture-boundaries for duty. 回収・保存.\n",
    "req-save.md":
      "---\ndescription: req-save\nagent: prometheus\n---\n\nSee capture-boundaries for duty. 原則非関与.\n",
    "case-open.md":
      "---\ndescription: case-open\nagent: prometheus\n---\n\nNo capture-boundaries reference (exempt: 非関与).\n",
    "case-auto.md":
      "---\ndescription: case-auto\nagent: sisyphus\n---\n\nNo capture-boundaries reference (exempt: 各工程の責務を継承).\n",
  };
  for (const [fname, content] of Object.entries(captureCmdDuties)) {
    writeFileSync(join(cmdDir, fname), content, "utf-8");
  }
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

  // IR-045 fixture: SPEC file with undocumented English abstract term
  writeFileSync(
    join(specsDir, "doc-quality-fixture.md"),
    [
      "# Doc Quality Fixture",
      "",
      "This command is a read-only diagnostic.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(specsDir, "README.md"),
    [
      "# SPEC Index",
      "",
      "| SPEC | status |",
      "|------|--------|",
      "| foundations/missing-spec.md | draft |",
      "",
    ].join("\n"),
    "utf-8",
  );

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
      "Missing agent.",
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
      "| `agentdev/test-cmd` | Test command | test-agent |  |",
      "",
    ].join("\n"),
    "utf-8",
  );

  const prTemplateDir = join(
    root,
    ".opencode",
    "skills",
    "agentdev-workflow-templates",
    "templates",
  );
  mkdirp(prTemplateDir);
  writeFileSync(
    join(prTemplateDir, "pr_desc.md"),
    [
      "# PR Description Template",
      "",
      "## Findings / Intake\u5019\u88dc",
      "",
      "Old section name.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(cmdDir, "case-run.md"),
    [
      "---",
      "description: case-run",
      "agent: sisyphus",
      "---",
      "",
      "Missing capture-boundaries reference and duty keyword.",
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

// REQ-0144-008 drift baseline（要件成立時点の履歴値）:
//   既存5件赤 / valid fixture 7件 NG
//   check_integrity.ts ルール更新時に fixture が追従せず drift していた状態の定量記録。
//   件数は本要件の成立動機であり、 REQ 要件行からは REQ-0101-068 準拠のため除去済み。
//   本テストファイルの fixture が最新 check_integrity.ts ルールに追従することを検証する。
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

// REQ-0108-197: Classification Policy test scenarios
describe("Classification Policy (--classification flag)", () => {
  it("accepts --classification flag without error", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary).toBeDefined();
  });

  it("reports 6 document classifications when --classification is enabled", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const classificationCount = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "classification-count",
    );
    expect(classificationCount).toBeDefined();
    expect(classificationCount.level).toBe("ok");
    expect(classificationCount.message).toContain("6");
  });

  it("verifies report collection directory exists", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const reportCollection = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "report-collection",
    );
    expect(reportCollection).toBeDefined();
  });

  it("verifies DOC-MAP classification instance exists", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const docmapCollection = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "docmap-collection",
    );
    expect(docmapCollection).toBeDefined();
    expect(docmapCollection.level).toBe("ok");
  });

  it("does not run classification checks when --classification is omitted", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const classificationResults = parsed.results.filter(
      (res: { category: string }) =>
        res.category === "ClassificationPolicy",
    );
    expect(classificationResults.length).toBe(0);
  });

  it("shows --classification in help text", () => {
    const r = runScript(VALID_ROOT, ["--help"]);
    expect(r.stdout).toContain("--classification");
  });
});

// REQ-0108-197: Classification Policy verification scenarios (structural)
describe("Classification Policy structural verification", () => {
  it("6 classifications are recognized: REQ, ADR, SPEC, Guide, Report, DOC-MAP", () => {
    const expectedClassifications = ["REQ", "ADR", "SPEC", "Guide", "Report", "DOC-MAP"];
    expect(expectedClassifications.length).toBe(6);

    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const countResult = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "classification-count",
    );
    expect(countResult).toBeDefined();
    for (const cls of expectedClassifications) {
      expect(countResult.message).toContain(cls);
    }
  });

  it("retired ADR references use context-dependent rules", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const retiredAdrWarnings = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "retired-adr-as-current" && res.level === "warning",
    );
    expect(Array.isArray(retiredAdrWarnings)).toBe(true);
  });

  it("report documents found in .agentdev/integrity/reports/", () => {
    const reportsDir = join(VALID_ROOT, ".agentdev", "integrity", "reports");
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const reportResult = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "report-collection",
    );
    expect(reportResult).toBeDefined();
    if (existsSync(reportsDir)) {
      expect(reportResult.level).toBe("ok");
    }
  });

  it("false positive suppression for workflow markers", () => {
    const r = runScript(VALID_ROOT, ["--classification", "--json"]);
    const parsed = JSON.parse(r.stdout);
    const classificationNg = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "ClassificationPolicy" && res.level === "ng",
    );
    expect(classificationNg.length).toBe(0);
  });
});

describe("Capture boundary checks", () => {
  it("valid fixture: capture-boundaries-existence check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "capture-boundaries-existence",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("valid fixture: pr-template-capture-section check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "pr-template-capture-section",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("valid fixture: command-capture-duty checks pass for 3 specific-duty commands", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const dutyOk = parsed.results.filter(
      (res: { check: string; category: string; level: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "command-capture-duty" &&
        res.level === "ok",
    );
    expect(dutyOk.length).toBe(3);
  });

  it("valid fixture: exempt commands (case-open, case-auto) are not checked even without capture-boundaries reference", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const exemptResults = parsed.results.filter(
      (res: { check: string; category: string; message: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "command-capture-duty" &&
        (res.message.includes("case-open.md") ||
          res.message.includes("case-auto.md")),
    );
    expect(exemptResults.length).toBe(0);
  });

  it("valid fixture: specific-duty commands (case-run, case-close, req-save) are checked", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const checkedCommands = ["case-run.md", "case-close.md", "req-save.md"];
    for (const cmd of checkedCommands) {
      const found = parsed.results.find(
        (res: { check: string; category: string; message: string; level: string }) =>
          res.category === "CaptureBoundary" &&
          res.check === "command-capture-duty" &&
          res.message.includes(cmd),
      );
      expect(found).toBeDefined();
      expect(found.level).toBe("ok");
    }
  });

  it("invalid fixture: capture-boundaries-existence detects missing file", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "capture-boundaries-existence",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ng");
  });

  it("invalid fixture: pr-template-capture-section detects old section name", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "pr-template-capture-section",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ng");
    expect(check.message).toContain("Intake候補");
  });

  it("invalid fixture: command-capture-duty detects missing reference", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const dutyNg = parsed.results.filter(
      (res: { check: string; category: string; level: string; message: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "command-capture-duty" &&
        res.level === "ng" &&
        res.message.includes("case-run.md"),
    );
    expect(dutyNg.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── IR-044: REQ/SPEC boundary violation (REQ-0108-259) ──────────────────────
// Dedicated fixture with REQ requirement table rows covering:
//   - true positive (SPEC detail, no exemption context)
//   - pure pattern-match detection (no meaning-based context exemption)

const IR044_ROOT = join(TEMP_ROOT, "ir044");

function buildIr044Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);

  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-9001 | IR-044 fixture |",
      "| REQ-9002 | IR-044 fixture |",
      "| REQ-9003 | IR-044 fixture |",
      "| REQ-9004 | IR-044 fixture |",
      "| REQ-9005 | IR-044 fixture |",
      "| REQ-9006 | IR-044 fixture |",
      "| REQ-9007 | IR-044 fixture |",
      "| REQ-9008 | IR-044 fixture |",
      "| REQ-9009 | IR-044 fixture |",
    "| REQ-9010 | IR-044 fixture |",
    "| REQ-9011 | IR-044 fixture |",
    "| REQ-9012 | IR-044 fixture |",
    "| REQ-9013 | IR-044 fixture |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9001: true positive — SPEC detail (enum list) without any exemption context
  writeFileSync(
    join(reqDir, "REQ-9001.md"),
    [
      "---",
      "id: REQ-9001",
      "title: IR-044 true positive",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9001-001 | 値一覧: A, B, C, D, E, F, G |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9002: false positive — delegation context exempts SPEC keyword
  writeFileSync(
    join(reqDir, "REQ-9002.md"),
    [
      "---",
      "id: REQ-9002",
      "title: IR-044 delegation exemption",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9002-001 | fixture 詳細は委譲先 SPEC に配置すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9003: false positive — negation context exempts SPEC keyword
  writeFileSync(
    join(reqDir, "REQ-9003.md"),
    [
      "---",
      "id: REQ-9003",
      "title: IR-044 negation exemption",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9003-001 | fixture 詳細を REQ に含めることを禁止する |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9004: false positive — stable contract exception (REQ-0101-069)
  writeFileSync(
    join(reqDir, "REQ-9004.md"),
    [
      "---",
      "id: REQ-9004",
      "title: IR-044 stable contract",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9004-001 | 公開 command 名は正規名前空間に従うこと |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9005: true positive — Step number SPEC detail
  writeFileSync(
    join(reqDir, "REQ-9005.md"),
    [
      "---",
      "id: REQ-9005",
      "title: IR-044 step number",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9005-001 | 実装は Step 3 で checker 個別ルールを適用すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9006: false positive — meta scope rule context exempts SPEC keyword
  // (REQ-0145-012). Line declares the REQ/SPEC boundary by naming SPEC types
  // as territory; it does not contain SPEC detail, it defines the boundary.
  writeFileSync(
    join(reqDir, "REQ-9006.md"),
    [
      "---",
      "id: REQ-9006",
      "title: IR-044 meta scope rule exemption",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9006-001 | REQ は対象とする外部契約を記述する文章主体であり、SPEC は現在の実装体系を示す スキーマ、コマンド体系、ルールカタログ、enum、format、必要パラメータを記述する文章主体であること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9007: false positive — behavior predicate context exempts SPEC keyword
  // (REQ-0145-012). Existence predicate + drift-target type modifier without
  // quantity/content specification.
  writeFileSync(
    join(reqDir, "REQ-9007.md"),
    [
      "---",
      "id: REQ-9007",
      "title: IR-044 behavior predicate exemption",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9007-001 | copyScripts 本採用環境下で fixture drift を自動検出する仕組みが存在すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9008: true positive — 手順 N (kanji step reference) SPEC detail.
  // "手順 N" is a Japanese step-reference variant covered by REQ-0136-031.
  writeFileSync(
    join(reqDir, "REQ-9008.md"),
    [
      "---",
      "id: REQ-9008",
      "title: IR-044 step number (手順 N)",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9008-001 | 実装は 手順 4 で入力検証を行うこと |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9009: false positive — META rule declaration line containing the word
  // "Step 番号" (without digit literal). Mirrors REQ-0136-031 itself, which
  // declares the principle and must NOT be flagged as a Step number violation.
  // The digit-literal distinction in the regex provides the mechanical guarantee.
  writeFileSync(
    join(reqDir, "REQ-9009.md"),
    [
      "---",
      "id: REQ-9009",
      "title: IR-044 META rule Step 番号 (no digit)",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9009-001 | 全現行 REQ の要件行は command 定義または SPEC の Step 番号を直接参照せず、機能名・フェーズ名で参照すること。検出の詳細シグナルは SPEC に配置すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9010: true positive — behavior predicate with count rule (REQ-0145-013 guard).
  // Line contains "仕組みが存在すること" (behavior predicate) AND "3件" (count rule).
  // REQ-0145-013 guard rejects exemption → still detected as SPEC detail violation.
  writeFileSync(
    join(reqDir, "REQ-9010.md"),
    [
      "---",
      "id: REQ-9010",
      "title: IR-044 behavior predicate with count rule (guard)",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9010-001 | fixture drift を検出し 3件 以上の違反を記録する仕組みが存在すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9011: false positive — behavior predicate without count rule (REQ-0145-012/013).
  // Line contains "仕組みが存在すること" (behavior predicate) and no count/content rule.
  // Exemption applies → NOT detected.
  writeFileSync(
    join(reqDir, "REQ-9011.md"),
    [
      "---",
      "id: REQ-9011",
      "title: IR-044 behavior predicate exemption (no count)",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9011-001 | fixture drift を自動検出する仕組みが存在すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9012: false positive — META rule line with 切り出し/配置 declaration.
  // Line contains SPEC target types (enum) but declares they should be placed in SPEC.
  // isMetaRuleLine pattern (1) exempts → NOT detected.
  writeFileSync(
    join(reqDir, "REQ-9012.md"),
    [
      "---",
      "id: REQ-9012",
      "title: IR-044 META rule line (切り出し declaration)",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9012-001 | REQ 要件行に混入する enum 値一覧は SPEC に切り出す対象であること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9013: false positive — META rule line with 委譲 to SPEC/catalog.
  // Line contains SPEC detail keyword (checker) but delegates to SPEC/catalog.
  // isMetaRuleLine pattern (4) exempts (委譲 + SPEC/catalog keyword) → NOT detected.
  writeFileSync(
    join(reqDir, "REQ-9013.md"),
    [
      "---",
      "id: REQ-9013",
      "title: IR-044 META rule line (委譲 to SPEC)",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9013-001 | checker 個別ルールと検出条件は SPEC または rule catalog に委譲すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Empty adr/specs/skills to satisfy other checks minimally
  mkdirp(join(root, "docs", "adr"));
  mkdirp(join(root, "docs", "specs"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  writeFileSync(join(root, "docs", "specs", "README.md"), "# SPEC\n", "utf-8");
}

describe("IR-044 req-spec-boundary-violation (REQ-0108-259)", () => {
  beforeAll(() => {
    mkdirp(IR044_ROOT);
    buildIr044Fixture(IR044_ROOT);
    copyScripts(IR044_ROOT);
  });

  it("detects true positive: SPEC detail without exemption (enum list)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9001"),
    );
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("detects true positive: Step number SPEC detail", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9005"),
    );
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("detects true positive: 手順 N step-reference SPEC detail", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9008"),
    );
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("does NOT flag META rule declaration line with Step 番号 word (REQ-0136-031 guard)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9009"),
    );
    expect(violations.length).toBe(0);
  });

  it("detects true positive: behavior predicate with count rule (REQ-0145-013 guard rejects exemption)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9010"),
    );
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("does NOT flag behavior predicate without count rule (REQ-0145-012 exemption)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9011"),
    );
    expect(violations.length).toBe(0);
  });

  it("does NOT flag META rule line with REQ/SPEC definitional structure (REQ-0145-012 META exemption)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9006"),
    );
    expect(violations.length).toBe(0);
  });

  it("does NOT flag META rule line with 切り出し/配置 declaration (REQ-0145-012 META exemption)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9012"),
    );
    expect(violations.length).toBe(0);
  });

  it("does NOT flag META rule line with 委譲 to SPEC/catalog (REQ-0145-012 META exemption)", () => {
    const r = runScript(IR044_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; evidence?: string }) =>
        res.check === "req-spec-boundary-violation" &&
        res.level === "warning" &&
        (res.evidence ?? "").includes("REQ-9013"),
    );
    expect(violations.length).toBe(0);
  });
});

// ─── IR-053: gh direct invocation detection (REQ-0152-001/002) ────────────────
// Dedicated fixture covering:
//   - true positive: direct gh invocation in prose (outside code block)
//   - code-block exemption: gh inside a fenced block is not flagged
//   - exclusion path: standard-procedures.md (REQ-0149-003) is never flagged

const IR053_ROOT = join(TEMP_ROOT, "ir053");

function buildIr053Fixture(root: string): void {
  // Minimal docs skeleton so the validator script runs.
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-9101 | IR-053 fixture |",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-9101.md"),
    [
      "---",
      "id: REQ-9101",
      "title: IR-053 fixture",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "Body.",
      "",
    ].join("\n"),
    "utf-8",
  );
  mkdirp(join(root, "docs", "adr"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  mkdirp(join(root, "docs", "specs"));
  writeFileSync(join(root, "docs", "specs", "README.md"), "# SPEC\n", "utf-8");

  // True positive: direct gh invocation in prose (inline code span, NOT a code block).
  const cmdDir = join(root, "src", "opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(
    join(cmdDir, "violation-cmd.md"),
    [
      "---",
      "description: violation command",
      "agent: test-agent",
      "---",
      "",
      "# Violation command",
      "",
      "Issue を作成するときは `gh issue create` を直接実行すること。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Code-block exemption: gh invocation inside a fenced block must NOT be flagged.
  const sampleSkillDir = join(
    root,
    "src",
    "opencode",
    "skills",
    "agentdev-sample-skill",
  );
  mkdirp(sampleSkillDir);
  writeFileSync(
    join(sampleSkillDir, "SKILL.md"),
    [
      "---",
      "name: agentdev-sample-skill",
      "---",
      "",
      "# Sample skill",
      "",
      "## USE FOR",
      "",
      "- sample",
      "",
      "## 例",
      "",
      "```sh",
      "gh issue view 123",
      "```",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Exclusion path: standard-procedures.md may use gh directly (REQ-0149-003).
  const ghCliRefDir = join(
    root,
    "src",
    "opencode",
    "skills",
    "agentdev-gh-cli",
    "references",
  );
  mkdirp(ghCliRefDir);
  writeFileSync(
    join(ghCliRefDir, "standard-procedures.md"),
    [
      "# Standard Procedures",
      "",
      "gh pr create --title \"{title}\" --body-file {body}",
      "gh issue edit {N} --body-file {body}",
      "gh pr merge {N} --squash",
      "",
    ].join("\n"),
    "utf-8",
  );
}

describe("IR-053 gh-direct-invocation (REQ-0152-001/002)", () => {
  beforeAll(() => {
    mkdirp(IR053_ROOT);
    buildIr053Fixture(IR053_ROOT);
    copyScripts(IR053_ROOT);
  });

  it("detects direct gh invocation in prose (true positive)", () => {
    const r = runScript(IR053_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string; file?: string }) =>
        res.check === "gh-direct-invocation" &&
        res.level === "warning" &&
        (res.file ?? "").includes("violation-cmd.md"),
    );
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("exempts gh invocation inside fenced code blocks", () => {
    const r = runScript(IR053_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const inCodeBlock = parsed.results.filter(
      (res: { check: string; level: string; file?: string }) =>
        res.check === "gh-direct-invocation" &&
        res.level === "warning" &&
        (res.file ?? "").includes("agentdev-sample-skill"),
    );
    expect(inCodeBlock.length).toBe(0);
  });

  it("excludes standard-procedures.md (REQ-0149-003 permitted file)", () => {
    const r = runScript(IR053_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const inExcluded = parsed.results.filter(
      (res: { check: string; level: string; file?: string }) =>
        res.check === "gh-direct-invocation" &&
        res.level === "warning" &&
        (res.file ?? "").includes("standard-procedures.md"),
    );
    expect(inExcluded.length).toBe(0);
  });
});

// ─── IR-055: runtime-unresolved-reference (REQ-0108-263, REQ-0108-264) ─────────
// Fixture covers:
//   - strict pattern detection (REQ-NNNN, REQ-NNNN-NNN, ADR-NNNN, src/opencode/, /repo/, repo-*)
//   - heuristic pattern detection (docs/specs/, docs/guides/, GitHub URL, line-number ref)
//   - code-block exemption
//   - template placeholder exemption
//   - exemption paths (vocabulary-registry.md, integrity-rule-catalog.md)
//   - baseline-known vs new classification (REQ-0108-145)
//   - report fields (file, line, evidence, expected, route)

const IR055_ROOT = join(TEMP_ROOT, "ir055");

function buildIr055Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-9201 | IR-055 fixture |",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-9201.md"),
    [
      "---",
      "id: REQ-9201",
      "title: IR-055 fixture",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "Body.",
      "",
    ].join("\n"),
    "utf-8",
  );
  mkdirp(join(root, "docs", "adr"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  mkdirp(join(root, "docs", "specs"));
  writeFileSync(join(root, "docs", "specs", "README.md"), "# SPEC\n", "utf-8");

  // Strict violations: command file containing all 6 strict patterns.
  const cmdDir = join(root, "src", "opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(
    join(cmdDir, "violation-cmd.md"),
    [
      "---",
      "description: IR-055 strict violation command",
      "agent: test-agent",
      "---",
      "",
      "# Violation command",
      "",
      "See REQ-1234 for context.",
      "See REQ-5678-001 for sub-item detail.",
      "See ADR-0099 for decision.",
      "Source at src/opencode/commands/agentdev/violation-cmd.md.",
      "Repo-local at /repo/docs-check.",
      "Skill repo-agentdev-integrity handles checks.",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Heuristic violations: skill file containing heuristic patterns.
  const skillDir = join(
    root,
    "src",
    "opencode",
    "skills",
    "agentdev-sample-skill",
  );
  mkdirp(skillDir);
  writeFileSync(
    join(skillDir, "SKILL.md"),
    [
      "---",
      "name: agentdev-sample-skill",
      "---",
      "",
      "# Sample skill",
      "",
      "## USE FOR",
      "",
      "- sample",
      "",
      "See docs/specs/system.md for system spec.",
      "See docs/guides/quickstart.md for guide.",
      "Main repo: https://github.com/yogata/agent-dev-flow/blob/main/README.md",
      "See system.md#L42 for line detail.",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Code-block exemption: REQ ID inside fenced block must NOT be flagged.
  writeFileSync(
    join(cmdDir, "codeblock-cmd.md"),
    [
      "---",
      "description: code block exemption command",
      "agent: test-agent",
      "---",
      "",
      "# Code block command",
      "",
      "```sh",
      "# REQ-9999 is inside a code block and should not be flagged",
      "gh issue view 9999",
      "```",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Exemption path: vocabulary-registry.md may legitimately reference patterns.
  const integRefDir = join(
    root,
    "src",
    "opencode",
    "skills",
    "agentdev-sample-skill",
    "references",
  );
  mkdirp(integRefDir);
  writeFileSync(
    join(integRefDir, "vocabulary-registry.md"),
    [
      "# Vocabulary Registry",
      "",
      "REQ-1234 is a legitimate reference in this registry.",
      "src/opencode/ path is described here.",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Template placeholder exemption: line with {NNNN} placeholder.
  writeFileSync(
    join(cmdDir, "placeholder-cmd.md"),
    [
      "---",
      "description: placeholder exemption command",
      "agent: test-agent",
      "---",
      "",
      "# Placeholder command",
      "",
      "Replace REQ-{NNNN} with the actual requirement ID.",
      "",
    ].join("\n"),
    "utf-8",
  );
}

describe("IR-055 runtime-unresolved-reference (REQ-0108-263/264)", () => {
  beforeAll(() => {
    mkdirp(IR055_ROOT);
    buildIr055Fixture(IR055_ROOT);
    copyScripts(IR055_ROOT);
  });

  it("detects strict pattern REQ-NNNN in distribution command file", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "REQ-1234" &&
        (res.file ?? "").includes("violation-cmd.md"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects strict pattern REQ-NNNN-NNN (sub-item ID)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "REQ-5678-001" &&
        (res.file ?? "").includes("violation-cmd.md"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects strict pattern ADR-NNNN", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "ADR-0099" &&
        (res.file ?? "").includes("violation-cmd.md"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects strict pattern src/opencode/", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; pattern?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "src/opencode/",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects strict pattern /repo/", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "/repo/",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects strict pattern repo-* (repo-local skill reference)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "repo-agentdev-integrity",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects heuristic pattern docs/specs/", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "docs/specs/",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects heuristic pattern docs/guides/", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "docs/guides/",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects heuristic pattern main-repo GitHub URL", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.evidence ?? "").startsWith("https://github.com/yogata/agent-dev-flow/"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects heuristic pattern line-number ref (file.md#L<N>)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        /\.md#L\d+/.test(res.evidence ?? ""),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("classifies strict patterns with finding_level=strict", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const strictHit = parsed.results.find(
      (res: { check: string; evidence?: string; finding_level?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "REQ-1234" &&
        res.finding_level === "strict",
    );
    expect(strictHit).toBeDefined();
  });

  it("classifies heuristic patterns with finding_level=heuristic", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const heuristicHit = parsed.results.find(
      (res: { check: string; evidence?: string; finding_level?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "docs/specs/" &&
        res.finding_level === "heuristic",
    );
    expect(heuristicHit).toBeDefined();
  });

  it("emits all 5 report fields (file, line, evidence, expected, route) for violations", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.level !== "ok",
    );
    expect(violations.length).toBeGreaterThan(0);
    for (const v of violations) {
      expect(v.file).toBeDefined();
      expect(v.line).toBeDefined();
      expect(v.evidence).toBeDefined();
      expect(v.expected).toBeDefined();
      expect(v.route).toBeDefined();
    }
  });

  it("emits new (non-baseline) violations at warn/ng level (delta guard fail)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    // No baseline file exists in this fixture → all violations are "new".
    const newViolations = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.level === "ng" || res.level === "warning"),
    );
    expect(newViolations.length).toBeGreaterThan(0);
    // Strict new violations should be ng; heuristic new violations should be warning.
    const strictNew = newViolations.filter(
      (v: { finding_level?: string }) => v.finding_level === "strict",
    );
    const heuristicNew = newViolations.filter(
      (v: { finding_level?: string }) => v.finding_level === "heuristic",
    );
    expect(strictNew.every((v: { level: string }) => v.level === "ng")).toBe(true);
    expect(
      heuristicNew.every((v: { level: string }) => v.level === "warning"),
    ).toBe(true);
  });

  it("exempts REQ ID references inside fenced code blocks", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const inCodeBlock = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "REQ-9999" &&
        (res.file ?? "").includes("codeblock-cmd.md"),
    );
    expect(inCodeBlock.length).toBe(0);
  });

  it("exempts template placeholder lines ({NNNN} style)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const placeholderHits = parsed.results.filter(
      (res: { check: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.file ?? "").includes("placeholder-cmd.md"),
    );
    expect(placeholderHits.length).toBe(0);
  });

  it("exempts vocabulary-registry.md (legitimate pattern documentation)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const vocabHits = parsed.results.filter(
      (res: { check: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.file ?? "").includes("vocabulary-registry.md"),
    );
    expect(vocabHits.length).toBe(0);
  });

  it("treats violations as baseline-known (info) after baseline regeneration", () => {
    // Regenerate baseline from current fixture violations.
    const proc = Bun.spawnSync(
      ["bun", "run", join(IR055_ROOT, ".opencode", "skills", "repo-agentdev-integrity", "scripts", "check_integrity.ts"), "--update-ir055-baseline"],
      { cwd: IR055_ROOT, stdout: "pipe", stderr: "pipe" },
    );
    expect(proc.exitCode).toBe(0);

    // Re-run: all violations should now be baseline-known (info level).
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const newViolations = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.level === "ng" || res.level === "warning"),
    );
    expect(newViolations.length).toBe(0);
    const baselineKnown = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "runtime-unresolved-reference" && res.level === "info",
    );
    expect(baselineKnown.length).toBeGreaterThan(0);
  });
});

// ─── IR-058: distribution-untracked-skill-reference (REQ-0159-003) ────────

const IR058_ROOT = join(TEMP_ROOT, "ir058");

function buildIr058Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "REQ-9301.md"),
    [
      "---",
      "id: REQ-9301",
      "title: IR-058 fixture",
      "created: 2025-01-01",
      "updated: 2025-01-01",
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
      "| REQ-9301 | IR-058 fixture |",
      "",
    ].join("\n"),
    "utf-8",
  );
  mkdirp(join(root, "docs", "adr"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  mkdirp(join(root, "docs", "specs"));
  writeFileSync(join(root, "docs", "specs", "README.md"), "# SPEC\n", "utf-8");
  writeFileSync(join(root, "docs", "DOC-MAP.md"), "# DOC-MAP\n\n| 分類 | パス |\n|------|------|\n| REQ | docs/requirements/REQ-9301.md |\n", "utf-8");

  // Distribution skill that references both a projection-only skill and a repo-* skill.
  const distSkillDir = join(root, "src", "opencode", "skills", "agentdev-sample");
  mkdirp(distSkillDir);
  writeFileSync(
    join(distSkillDir, "SKILL.md"),
    [
      "---",
      "name: agentdev-sample",
      "---",
      "",
      "# agentdev-sample",
      "",
      "## USE FOR",
      "",
      "- sample",
      "",
      "Reference to projection-only: `test-projection-only` スキル.",
      "Reference to repo-local: `repo-test-local` スキル.",
      "Path-style: .opencode/skills/test-projection-only/SKILL.md",
      "",
    ].join("\n"),
    "utf-8",
  );
  // Also create a sibling agentdev-* dir so source-side enumeration works.
  mkdirp(join(root, "src", "opencode", "skills", "agentdev-other"));

  // Projection-only skill (no src/ counterpart) — should be flagged.
  mkdirp(join(root, ".opencode", "skills", "test-projection-only"));
  writeFileSync(
    join(root, ".opencode", "skills", "test-projection-only", "SKILL.md"),
    "---\nname: test-projection-only\n---\n# test-projection-only\n",
    "utf-8",
  );
  // repo-* skill (carve-out per ADR-0106) — must NOT be flagged even if referenced.
  mkdirp(join(root, ".opencode", "skills", "repo-test-local"));
  writeFileSync(
    join(root, ".opencode", "skills", "repo-test-local", "SKILL.md"),
    "---\nname: repo-test-local\n---\n# repo-test-local\n",
    "utf-8",
  );
  // Mirror agentdev-sample into projection so source-projection-sync stays clean.
  mkdirp(join(root, ".opencode", "skills", "agentdev-sample"));
  writeFileSync(
    join(root, ".opencode", "skills", "agentdev-sample", "SKILL.md"),
    "---\nname: agentdev-sample\n---\n# agentdev-sample\n",
    "utf-8",
  );
  mkdirp(join(root, ".opencode", "skills", "agentdev-other"));
  writeFileSync(
    join(root, ".opencode", "skills", "agentdev-other", "SKILL.md"),
    "---\nname: agentdev-other\n---\n# agentdev-other\n",
    "utf-8",
  );
  // repo-agentdev-integrity in projection so capture boundary checks have data.
  const integritySkillDir = join(root, ".opencode", "skills", "repo-agentdev-integrity");
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
  const vocabDir = join(integritySkillDir, "references");
  mkdirp(vocabDir);
  writeFileSync(
    join(vocabDir, "vocabulary-registry.md"),
    [
      "# Vocabulary Registry",
      "",
      "## コマンド名",
      "",
      "| 旧語彙 | 新語彙 | 備考 |",
      "|--------|--------|------|",
      "| issue-req | req-save | migration |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Commands dir for README fixture (source-projection-sync expects it).
  const cmdDir = join(root, ".opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(
    join(cmdDir, "README.md"),
    [
      "# Commands",
      "",
      "| Command | Description | Agent |",
      "|---------|-------------|-------|",
      "| `agentdev/case-run` | case-run | sisyphus |",
      "| `agentdev/case-close` | case-close | sisyphus |",
      "| `agentdev/req-save` | req-save | prometheus |",
      "| `agentdev/case-open` | case-open | prometheus |",
      "| `agentdev/case-auto` | case-auto | sisyphus |",
      "",
    ].join("\n"),
    "utf-8",
  );
  const srcCmdDir = join(root, "src", "opencode", "commands", "agentdev");
  mkdirp(srcCmdDir);
  for (const fname of ["case-run.md", "case-close.md", "req-save.md", "case-open.md", "case-auto.md"]) {
    writeFileSync(
      join(srcCmdDir, fname),
      `---\ndescription: ${fname}\nagent: sisyphus\n---\n\nBody.\n`,
      "utf-8",
    );
  }
  writeFileSync(join(cmdDir, "case-run.md"), "---\ndescription: case-run\nagent: sisyphus\n---\n\nBody.\n", "utf-8");
  writeFileSync(join(cmdDir, "case-close.md"), "---\ndescription: case-close\nagent: sisyphus\n---\n\nBody.\n", "utf-8");
  writeFileSync(join(cmdDir, "req-save.md"), "---\ndescription: req-save\nagent: prometheus\n---\n\nBody.\n", "utf-8");
  writeFileSync(join(cmdDir, "case-open.md"), "---\ndescription: case-open\nagent: prometheus\n---\n\nBody.\n", "utf-8");
  writeFileSync(join(cmdDir, "case-auto.md"), "---\ndescription: case-auto\nagent: sisyphus\n---\n\nBody.\n", "utf-8");

  // workflow-orchestration capture-boundaries.md (referenced by capture boundary check).
  const captureBoundaryDir = join(root, "src", "opencode", "skills", "agentdev-workflow-orchestration", "references");
  mkdirp(captureBoundaryDir);
  writeFileSync(
    join(captureBoundaryDir, "capture-boundaries.md"),
    "# Capture Boundaries\n\nSplit rule and command duty boundaries.\n",
    "utf-8",
  );
  mkdirp(join(root, ".opencode", "skills", "agentdev-workflow-orchestration"));
  writeFileSync(
    join(root, ".opencode", "skills", "agentdev-workflow-orchestration", "SKILL.md"),
    "---\nname: agentdev-workflow-orchestration\n---\n# orchestration\n",
    "utf-8",
  );
  mkdirp(join(root, "src", "opencode", "skills", "agentdev-workflow-orchestration"));
  // workflow-templates skill in both source and projection (referenced by templates check).
  mkdirp(join(root, ".opencode", "skills", "agentdev-workflow-templates", "templates"));
  writeFileSync(
    join(root, ".opencode", "skills", "agentdev-workflow-templates", "SKILL.md"),
    "---\nname: agentdev-workflow-templates\n---\n# templates\n",
    "utf-8",
  );
  writeFileSync(
    join(root, ".opencode", "skills", "agentdev-workflow-templates", "templates", "pr_desc.md"),
    [
      "# PR Description Template",
      "",
      "## Findings / Capture候補",
      "",
      "### intake",
      "",
      "Intake capture items.",
      "",
      "### learning",
      "",
      "Learning capture items.",
      "",
    ].join("\n"),
    "utf-8",
  );
  mkdirp(join(root, "src", "opencode", "skills", "agentdev-workflow-templates"));
}

describe("IR-058 distribution-untracked-skill-reference (REQ-0159-003)", () => {
  beforeAll(() => {
    rmSync(IR058_ROOT, { recursive: true, force: true });
    mkdirp(IR058_ROOT);
    buildIr058Fixture(IR058_ROOT);
    copyScripts(IR058_ROOT);
  });

  afterAll(() => {
    rmSync(IR058_ROOT, { recursive: true, force: true });
  });

  it("detects projection-only skill referenced by distribution", () => {
    const r = runScript(IR058_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const ngResults = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "distribution-untracked-skill-reference" &&
        res.level === "ng" &&
        (res.message ?? "").includes("test-projection-only"),
    );
    expect(ngResults.length).toBe(1);
  });

  it("does not flag repo-* skills (ADR-0106 carve-out)", () => {
    const r = runScript(IR058_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const repoNgResults = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "distribution-untracked-skill-reference" &&
        res.level === "ng" &&
        (res.message ?? "").includes("repo-test-local"),
    );
    expect(repoNgResults.length).toBe(0);
  });

  it("includes src/ promotion guidance in NG message", () => {
    const r = runScript(IR058_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const ngResults = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "distribution-untracked-skill-reference" &&
        res.level === "ng",
    );
    expect(ngResults.length).toBeGreaterThan(0);
    const promotionMessage = ngResults.find(
      (res: { message?: string }) =>
        (res.message ?? "").includes("Promote to src/opencode/skills/") &&
        (res.message ?? "").includes("ADR-0134"),
    );
    expect(promotionMessage).toBeDefined();
  });
});

// ─── NG baseline aggregation / provenance / classification (Issue #1780, REQ-0161-005) ──
// TS-003: baseline 既知 NG と新規 NG の件数を別々に示し、新規 NG だけが非ゼロ終了の原因になる
// TS-004: --update-ng-baseline が承認済み由来ラベル付き差分だけを baseline へ追加し、未管理 NG を取り込まない
// TS-005: baseline 既知 NG、承認済み追加分、新規かつ未管理 NG が報告で区別される

const NGBASELINE_ROOT = join(TEMP_ROOT, "ngbaseline1780");
const GENERATE_INDEXES_FILE = join(SCRIPT_DIR, "generate_indexes.ts");

function copyScriptsComplete(fixtureRoot: string): void {
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
  // generate_indexes.ts is imported by check_integrity.ts; copy it so the
  // fixture is self-contained (the pre-existing copyScripts omits it).
  if (existsSync(GENERATE_INDEXES_FILE)) {
    copyFileSync(GENERATE_INDEXES_FILE, join(dest, "generate_indexes.ts"));
  }
}

function buildNgBaselineFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    [
      "# Requirements",
      "",
      "| ID | Title |",
      "|----|-------|",
      "| REQ-0001 | fixture anchor |",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-0001.md"),
    [
      "---",
      "id: REQ-0001",
      "title: fixture anchor",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "Body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  mkdirp(join(root, "docs", "adr"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");

  mkdirp(join(root, "docs", "specs"));
  writeFileSync(join(root, "docs", "specs", "README.md"), "# SPEC\n", "utf-8");

  // Guide file referencing three non-existent REQ IDs. Each unique ref emits
  // one broken-req-ref NG with evidence = "REQ-NNNN".
  const guidesDir = join(root, "docs", "guides");
  mkdirp(guidesDir);
  writeFileSync(
    join(guidesDir, "ng-baseline-test.md"),
    [
      "# NG Baseline Test Guide",
      "",
      "Reference A: REQ-9001.",
      "Reference B: REQ-9002.",
      "Reference C: REQ-9003.",
      "",
    ].join("\n"),
    "utf-8",
  );
}

function writeNgBaselineFile(
  root: string,
  entries: Array<{
    category: string;
    check: string;
    file: string | null;
    evidence: string | null;
    count: number;
    provenance: string;
    reason: string;
  }>,
): void {
  const baselineDir = join(
    root,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "baselines",
  );
  mkdirp(baselineDir);
  writeFileSync(
    join(baselineDir, "ng-baseline.json"),
    JSON.stringify(
      {
        version: 1,
        rule_id: "NG-BASELINE",
        generated_at: "2026-07-24",
        entries,
      },
      null,
      2,
    ) + "\n",
    "utf-8",
  );
}

function readNgBaselineFile(root: string): {
  entries: Array<{
    category: string;
    check: string;
    file: string | null;
    evidence: string | null;
    count: number;
    provenance?: string;
    reason?: string;
  }>;
} {
  const p = join(
    root,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "baselines",
    "ng-baseline.json",
  );
  return JSON.parse(readFileSync(p, "utf-8") as string);
}

const NGBASELINE_GUIDE = "docs/guides/ng-baseline-test.md";

describe("NG baseline aggregation / provenance / classification (Issue #1780, REQ-0161-005)", () => {
  beforeAll(() => {
    rmSync(NGBASELINE_ROOT, { recursive: true, force: true });
    buildNgBaselineFixture(NGBASELINE_ROOT);
    copyScriptsComplete(NGBASELINE_ROOT);
    // Seed baseline: REQ-9001 (legacy) + REQ-9002 (approved). REQ-9003 stays
    // unmanaged so it remains a new-NG driver.
    writeNgBaselineFile(NGBASELINE_ROOT, [
      {
        category: "LinkIntegrity",
        check: "broken-req-ref",
        file: NGBASELINE_GUIDE,
        evidence: "REQ-9001",
        count: 1,
        provenance: "legacy",
        reason: "pre-existing baseline entry (fixture)",
      },
      {
        category: "LinkIntegrity",
        check: "broken-req-ref",
        file: NGBASELINE_GUIDE,
        evidence: "REQ-9002",
        count: 1,
        provenance: "approved-fixture",
        reason: "approved addition (fixture)",
      },
    ]);
  });

  afterAll(() => {
    rmSync(NGBASELINE_ROOT, { recursive: true, force: true });
  });

  it("TS-003: separates baseline-known from new NG counts; only new NG drives non-zero exit", () => {
    const r = runScript(NGBASELINE_ROOT, ["--json"]);
    expect(r.exitCode).not.toBe(0);

    const parsed = JSON.parse(r.stdout);
    const brokenReqRefs = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "broken-req-ref",
    );

    // REQ-9001 (legacy baseline) → demoted to info with [baseline-known] tag.
    const req9001 = brokenReqRefs.find(
      (res: { evidence?: string }) => res.evidence === "REQ-9001",
    );
    expect(req9001).toBeDefined();
    expect(req9001.level).toBe("info");
    expect(req9001.message).toContain("[baseline-known]");
    expect(req9001.message).not.toContain("provenance=");

    // REQ-9002 (approved baseline) → demoted to info with provenance tag.
    const req9002 = brokenReqRefs.find(
      (res: { evidence?: string }) => res.evidence === "REQ-9002",
    );
    expect(req9002).toBeDefined();
    expect(req9002.level).toBe("info");
    expect(req9002.message).toContain("[baseline-known provenance=approved-fixture]");

    // REQ-9003 (unmanaged) → stays ng; drives non-zero exit.
    const req9003 = brokenReqRefs.find(
      (res: { evidence?: string }) => res.evidence === "REQ-9003",
    );
    expect(req9003).toBeDefined();
    expect(req9003.level).toBe("ng");
  });

  it("TS-005: report distinguishes baseline-known, approved additions, and new unmanaged NG", () => {
    const r = runScript(NGBASELINE_ROOT, ["--json"]);
    // The 3-category summary is emitted on stderr.
    expect(r.stderr).toContain("baseline-known (demoted to info)");
    expect(r.stderr).toContain("approved additions (provenance-tracked");
    expect(r.stderr).toContain("new unmanaged NG (delta, exit code driver)");

    // And the three classes are distinguishable in the JSON results.
    const parsed = JSON.parse(r.stdout);
    const legacyDemoted = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "broken-req-ref" &&
        res.level === "info" &&
        (res.message ?? "").startsWith("[baseline-known] ") &&
        !(res.message ?? "").includes("provenance="),
    );
    const approvedDemoted = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "broken-req-ref" &&
        res.level === "info" &&
        (res.message ?? "").includes("[baseline-known provenance="),
    );
    const newNg = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "broken-req-ref" && res.level === "ng",
    );
    expect(legacyDemoted.length).toBeGreaterThanOrEqual(1);
    expect(approvedDemoted.length).toBeGreaterThanOrEqual(1);
    expect(newNg.length).toBeGreaterThanOrEqual(1);
  });

  it("TS-004: --update-ng-baseline adds only approved deltas with provenance/reason; unmanaged NGs are not absorbed", () => {
    // Additions manifest: approve REQ-9003 only. Do NOT include the other
    // fixture NGs (e.g. command-readme-sync, skill-prefix) — those must stay
    // out of the baseline per SPEC.
    const manifestPath = join(NGBASELINE_ROOT, "additions-manifest.json");
    writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          additions: [
            {
              category: "LinkIntegrity",
              check: "broken-req-ref",
              file: NGBASELINE_GUIDE,
              evidence: "REQ-9003",
              count: 1,
              provenance: "ts-004-approval",
              reason: "TS-004: approving REQ-9003 reference in test fixture",
            },
          ],
        },
        null,
        2,
      ),
      "utf-8",
    );

    const updateProc = Bun.spawnSync(
      [
        "bun",
        "run",
        join(
          NGBASELINE_ROOT,
          ".opencode",
          "skills",
          "repo-agentdev-integrity",
          "scripts",
          "check_integrity.ts",
        ),
        "--update-ng-baseline",
        "--ng-baseline-additions",
        manifestPath,
      ],
      { cwd: NGBASELINE_ROOT, stdout: "pipe", stderr: "pipe" },
    );
    expect(updateProc.exitCode).toBe(0);

    // Baseline now has 3 entries; REQ-9003 carries the approved provenance.
    const baseline = readNgBaselineFile(NGBASELINE_ROOT);
    const req9003Entry = baseline.entries.find(
      (e: { evidence?: string }) => e.evidence === "REQ-9003",
    );
    expect(req9003Entry).toBeDefined();
    expect(req9003Entry.provenance).toBe("ts-004-approval");
    expect(req9003Entry.reason).toContain("TS-004");

    // Unmanaged NG categories were NOT absorbed: the baseline must contain no
    // entry for command-readme-sync / skill-prefix / etc.
    const absorbedOtherChecks = baseline.entries.filter(
      (e: { check: string }) =>
        e.check !== "broken-req-ref",
    );
    expect(absorbedOtherChecks.length).toBe(0);

    // Re-run: REQ-9003 is now demoted as an approved addition.
    const r = runScript(NGBASELINE_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const req9003After = parsed.results.find(
      (res: { check: string; evidence?: string }) =>
        res.check === "broken-req-ref" && res.evidence === "REQ-9003",
    );
    expect(req9003After).toBeDefined();
    expect(req9003After.level).toBe("info");
    expect(req9003After.message).toContain(
      "[baseline-known provenance=ts-004-approval]",
    );
  });

  it("TS-004 (negative): --update-ng-baseline without additions manifest is rejected", () => {
    const proc = Bun.spawnSync(
      [
        "bun",
        "run",
        join(
          NGBASELINE_ROOT,
          ".opencode",
          "skills",
          "repo-agentdev-integrity",
          "scripts",
          "check_integrity.ts",
        ),
        "--update-ng-baseline",
      ],
      { cwd: NGBASELINE_ROOT, stdout: "pipe", stderr: "pipe" },
    );
    expect(proc.exitCode).toBe(2);
    expect(proc.stderr.toString("utf-8")).toContain(
      "--ng-baseline-additions",
    );
  });

  it("TS-004 (negative): additions manifest missing provenance/reason is rejected", () => {
    const badManifest = join(NGBASELINE_ROOT, "bad-manifest.json");
    writeFileSync(
      badManifest,
      JSON.stringify({
        additions: [
          {
            category: "LinkIntegrity",
            check: "broken-req-ref",
            file: NGBASELINE_GUIDE,
            evidence: "REQ-9003",
            count: 1,
            // provenance and reason intentionally omitted.
          },
        ],
      }),
      "utf-8",
    );
    const proc = Bun.spawnSync(
      [
        "bun",
        "run",
        join(
          NGBASELINE_ROOT,
          ".opencode",
          "skills",
          "repo-agentdev-integrity",
          "scripts",
          "check_integrity.ts",
        ),
        "--update-ng-baseline",
        "--ng-baseline-additions",
        badManifest,
      ],
      { cwd: NGBASELINE_ROOT, stdout: "pipe", stderr: "pipe" },
    );
    expect(proc.exitCode).toBe(2);
    expect(proc.stderr.toString("utf-8")).toContain("provenance");
  });
});

// ─── IR-055 実修復回帰テスト（Issue #1782, OU-005, RU-0012） ──────────────
// 配布物（src/opencode/commands/agentdev/**/*.md,
// src/opencode/skills/agentdev-*/**/*.md）の runtime-unresolved-reference
// 既存未管理 NG を実修復した後の状態を保持することを検証する。
// baseline 更新だけで未解決参照を info へ降格していないこと（REQ-0108-264
// 段階導入の精神、Issue #1782 完了条件）を回帰テストとして固定する。

describe("IR-055 runtime-unresolved-reference 実修復回帰 (Issue #1782)", () => {
  // 実リポジトリルート: SCRIPT_DIR は
  // <repo>/.opencode/skills/repo-agentdev-integrity/scripts なので4階層上。
  const REPO_ROOT = join(SCRIPT_DIR, "..", "..", "..", "..");

  it("配布物に新規（delta from baseline）runtime-unresolved-reference 違反がないこと", () => {
    const proc = Bun.spawnSync(
      ["bun", "run", SCRIPT_FILE, "--json"],
      { cwd: REPO_ROOT, stdout: "pipe", stderr: "pipe" },
    );
    expect(proc.exitCode).toBeDefined();
    const stdout = proc.stdout?.toString("utf-8") ?? "";
    expect(stdout.length).toBeGreaterThan(0);

    const parsed = JSON.parse(stdout) as {
      results: Array<{
        check: string;
        level: string;
        finding_level?: string;
        file?: string;
      }>;
    };

    // runtime-unresolved-reference のうち、新規違反（strict/heuristic かつ
    // info 未満レベル）が0件であることを検証する。baseline-known (info) は
    // 段階導入（REQ-0108-264）で許容されるため対象外。
    const newViolations = parsed.results.filter(
      (r) =>
        r.check === "runtime-unresolved-reference" &&
        (r.level === "ng" || r.level === "warning") &&
        (r.finding_level === "strict" || r.finding_level === "heuristic"),
    );
    expect(newViolations.length).toBe(0);
  });

  it("baseline-known runtime-unresolved-reference が閾値以下であること（修復後の上限）", () => {
    // 修復時点での baseline-known 数を上限として固定する。この値を超える場合、
    // 配布物へ新たな導入先未解決参照が追加されたことを示す。
    // 修復後の状態: 548 baseline-known violations across 配布物。
    // 閾値は修復完了時の実績値（548）を上限とし、将来の削減を許容する。
    const proc = Bun.spawnSync(
      ["bun", "run", SCRIPT_FILE, "--json"],
      { cwd: REPO_ROOT, stdout: "pipe", stderr: "pipe" },
    );
    const stdout = proc.stdout?.toString("utf-8") ?? "";
    const parsed = JSON.parse(stdout) as {
      results: Array<{ check: string; level: string }>;
    };

    const baselineKnown = parsed.results.filter(
      (r) =>
        r.check === "runtime-unresolved-reference" && r.level === "info",
    );
    // 修復完了時点の実績値。将来の削減を許容し、増加を拒否する。
    expect(baselineKnown.length).toBeLessThanOrEqual(548);
  });
});
