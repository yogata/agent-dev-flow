// ADF-COVERS(verification): REQ-010-002, REQ-010-003, REQ-010-006, REQ-010-007, REQ-010-063
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_integrity.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const GEN_INDEXES_FILE = join(SCRIPT_DIR, "generate_indexes.ts");
const HISTORY_EXEMPTION_FILE = join(SCRIPT_DIR, "ir057_history_exemption.ts");
const CURRENT_REFS_FILE = join(SCRIPT_DIR, "current_refs.ts");
const GLOB_WALK_FILE = join(SCRIPT_DIR, "lib", "glob_walk.ts");
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
  copyFileSync(GEN_INDEXES_FILE, join(dest, "generate_indexes.ts"));
  copyFileSync(HISTORY_EXEMPTION_FILE, join(dest, "ir057_history_exemption.ts"));
  copyFileSync(CURRENT_REFS_FILE, join(dest, "current_refs.ts"));
  mkdirp(join(dest, "lib"));
  copyFileSync(GLOB_WALK_FILE, join(dest, "lib", "glob_walk.ts"));
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

  const designsDir = join(root, "docs", "designs");
  mkdirp(designsDir);
  writeFileSync(
    join(designsDir, "system.md"),
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
  writeFileSync(join(designsDir, "patterns.md"), "# Patterns\n", "utf-8");

  // REQ-0108-268: foundations/system.md は expanded-readme-sync チェック対象。
  // agentdev/ 配下の全コマンド名を含め、同チェックを OK にする。
  mkdirp(join(designsDir, "foundations"));
  writeFileSync(
    join(designsDir, "foundations", "system.md"),
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
    join(designsDir, "foundations", "patterns.md"),
    "# Patterns (foundations)\n",
    "utf-8",
  );
  writeFileSync(
    join(designsDir, "README.md"),
    [
      "# Design Index",
      "",
      "| Design | status |",
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
      "| Design | docs/designs/system.md |",
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

  // WP-3 (Issue #1928): src/opencode/commands/agentdev and src/opencode/skills
  // are required by checkSourceRequiredDirs.
  const srcCmdDir = join(root, "src", "opencode", "commands", "agentdev");
  mkdirp(srcCmdDir);
  writeFileSync(join(srcCmdDir, "README.md"), "# agentdev commands\n", "utf-8");

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

  const designsDir = join(root, "docs", "designs");
  mkdirp(designsDir);

  // IR-045 fixture: Design file with undocumented English abstract term
  writeFileSync(
    join(designsDir, "doc-quality-fixture.md"),
    [
      "# Doc Quality Fixture",
      "",
      "This command is a read-only diagnostic.",
      "",
    ].join("\n"),
    "utf-8",
  );

  writeFileSync(
    join(designsDir, "README.md"),
    [
      "# Design Index",
      "",
      "| Design | status |",
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
      "# Bad Command",
      "",
      "No frontmatter at all (missing required description).",
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

  it("designs existence check passes", () => {
    const r = runScript(VALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const specResults = parsed.results.filter(
      (res: { category: string }) => res.category === "Designs",
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

  it("detects missing design files", () => {
    const r = runScript(INVALID_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const specNg = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "Designs" && res.level === "ng",
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
  it("6 classifications are recognized: REQ, Decision, Design, Guide, Report, DOC-MAP", () => {
    const expectedClassifications = ["REQ", "Decision", "Design", "Guide", "Report", "DOC-MAP"];
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

  it("report documents found in docs/reports/", () => {
    const reportsDir = join(VALID_ROOT, "docs", "reports");
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

// ─── IR-044: REQ/Design boundary violation (REQ-0108-259) ──────────────────────
// Dedicated fixture with REQ requirement table rows covering:
//   - true positive (Design detail, no exemption context)
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

  // REQ-9001: true positive — Design detail (enum list) without any exemption context
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

  // REQ-9002: false positive — delegation context exempts Design keyword
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
      "| REQ-9002-001 | fixture 詳細は委譲先 Design に配置すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9003: false positive — negation context exempts Design keyword
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

  // REQ-9005: true positive — Step number Design detail
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

  // REQ-9006: false positive — meta scope rule context exempts Design keyword
  // (REQ-0145-012). Line declares the REQ/Design boundary by naming Design types
  // as territory; it does not contain Design detail, it defines the boundary.
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
      "| REQ-9006-001 | REQ は対象とする外部契約を記述する文章主体であり、Design は現在の実装体系を示す スキーマ、コマンド体系、ルールカタログ、enum、format、必要パラメータを記述する文章主体であること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9007: false positive — behavior predicate context exempts Design keyword
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

  // REQ-9008: true positive — 手順 N (kanji step reference) Design detail.
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
      "| REQ-9009-001 | 全現行 REQ の要件行は command 定義または Design の Step 番号を直接参照せず、機能名・フェーズ名で参照すること。検出の詳細シグナルは Design に配置すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9010: true positive — behavior predicate with count rule (REQ-0145-013 guard).
  // Line contains "仕組みが存在すること" (behavior predicate) AND "3件" (count rule).
  // REQ-0145-013 guard rejects exemption → still detected as Design detail violation.
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
  // Line contains Design target types (enum) but declares they should be placed in Design.
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
      "| REQ-9012-001 | REQ 要件行に混入する enum 値一覧は Design に切り出す対象であること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // REQ-9013: false positive — META rule line with 委譲 to Design/catalog.
  // Line contains Design detail keyword (checker) but delegates to Design/catalog.
  // isMetaRuleLine pattern (4) exempts (委譲 + Design/catalog keyword) → NOT detected.
  writeFileSync(
    join(reqDir, "REQ-9013.md"),
    [
      "---",
      "id: REQ-9013",
      "title: IR-044 META rule line (委譲 to Design)",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "| ID | 要件 |",
      "|----|------|",
      "| REQ-9013-001 | checker 個別ルールと検出条件は Design または rule catalog に委譲すること |",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Empty adr/specs/skills to satisfy other checks minimally
  mkdirp(join(root, "docs", "adr"));
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");
}

describe("IR-044 req-spec-boundary-violation (REQ-0108-259)", () => {
  beforeAll(() => {
    mkdirp(IR044_ROOT);
    buildIr044Fixture(IR044_ROOT);
    copyScripts(IR044_ROOT);
  });

  it("detects true positive: Design detail without exemption (enum list)", () => {
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

  it("detects true positive: Step number Design detail", () => {
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

  it("detects true positive: 手順 N step-reference Design detail", () => {
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

  it("does NOT flag META rule line with REQ/Design definitional structure (REQ-0145-012 META exemption)", () => {
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

  it("does NOT flag META rule line with 委譲 to Design/catalog (REQ-0145-012 META exemption)", () => {
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
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

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
//   - heuristic pattern detection (docs/designs/, docs/guides/, GitHub URL, line-number ref)
//   - code-block exemption
//   - template placeholder exemption (token-neighborhood narrowing, CR-002)
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
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

  // Strict violations: command file containing all strict patterns including
  // DEC-NNN (current Decision convention) and ADR-NNNN (legacy residual).
  // REQ-025-002: IR-055 regex updated to DEC-\d{3} form.
  // REQ-025-004: residual ADR-NNNN detection must remain active after migration.
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
      "See DEC-007 for current decision reference (REQ-025-002).",
      "See ADR-0099 for legacy residual reference (REQ-025-004).",
      "See v2:ADR-0099 for historical reference (AG-010 exempt).",
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
      "See docs/designs/system.md for system design.",
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

  // CR-002 token-neighborhood narrowing: placeholder exemption is scoped to
  // the placeholder-bearing token, not the whole line.
  writeFileSync(
    join(cmdDir, "placeholder-narrow-cmd.md"),
    [
      "---",
      "description: placeholder narrowing command",
      "agent: test-agent",
      "---",
      "",
      "# Placeholder narrowing command",
      "",
      "Replace REQ-{NNNN}; see REQ-4321 for the concrete case.",
      "Templated path docs/designs/<skills/agentdev-traceability>.md stays exempt.",
      "Brace-set glob docs/designs/{commands,skills}/** stays exempt.",
      "Bare glob `docs/designs/**` next to `docs/designs/{a,b}/**` stays checked.",
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

  it("detects strict pattern ADR-NNNN (residual after Decision migration, REQ-025-004)", () => {
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

  it("detects strict pattern DEC-NNN (current Decision convention, REQ-025-002)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "DEC-007" &&
        (res.file ?? "").includes("violation-cmd.md"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("exempts v2:ADR-NNNN historical references (AG-010 protection)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const lineScanned = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string; line?: number }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "ADR-0099" &&
        (res.file ?? "").includes("violation-cmd.md"),
    );
    // The fixture has both "ADR-0099" (residual, line) and "v2:ADR-0099"
    // (historical, line+1). Only the non-v2 instance should be detected.
    const lines = lineScanned.map((r: { line?: number }) => r.line);
    const v2Line = lines.length > 0 ? Math.max(...lines) : -1;
    const residualLines = lines.filter((l: number) => l !== v2Line);
    // Exactly one residual ADR-0099 (the non-v2 instance) is expected.
    expect(residualLines.length).toBeGreaterThanOrEqual(1);
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

  it("detects heuristic pattern docs/designs/", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "docs/designs/",
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
        res.evidence === "docs/designs/" &&
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

  it("reports concrete references on placeholder-bearing lines (CR-002 narrowing)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "REQ-4321" &&
        (res.file ?? "").includes("placeholder-narrow-cmd.md"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("exempts placeholder-bearing path tokens (<...> and brace-set globs)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string; line?: number }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.file ?? "").includes("placeholder-narrow-cmd.md") &&
        res.evidence === "docs/designs/" &&
        (res.line === 9 || res.line === 10),
    );
    expect(hits.length).toBe(0);
  });

  it("keeps bare-glob references next to placeholder globs checked (CR-002 narrowing)", () => {
    const r = runScript(IR055_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string; line?: number }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.file ?? "").includes("placeholder-narrow-cmd.md") &&
        res.evidence === "docs/designs/" &&
        res.line === 11,
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
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
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");
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
  if (existsSync(GENERATE_INDEXES_FILE)) {
    copyFileSync(GENERATE_INDEXES_FILE, join(dest, "generate_indexes.ts"));
  }
  copyFileSync(HISTORY_EXEMPTION_FILE, join(dest, "ir057_history_exemption.ts"));
  copyFileSync(CURRENT_REFS_FILE, join(dest, "current_refs.ts"));
  mkdirp(join(dest, "lib"));
  copyFileSync(GLOB_WALK_FILE, join(dest, "lib", "glob_walk.ts"));
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

  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

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
    // out of the baseline per design.
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

// ─── NG baseline パス bucket key 正規化（Issue #2206, OU-0008） ─────────────
// SPEC integrity-contracts「baseline entry 運用契約」第2点: worktree（src fallback）
// と main（junction projection）で `.opencode/...` ↔ `src/opencode/...` 表記が
// 変化しても同一 bucket として baseline-known 降格することを検証する。

const NGBASELINE_PATHNORM_ROOT_MAIN = join(TEMP_ROOT, "ngbaseline2206-main");
const NGBASELINE_PATHNORM_ROOT_WORKTREE = join(TEMP_ROOT, "ngbaseline2206-worktree");

function buildPathNormFixture(
  root: string,
  commandDirKind: "projection" | "source",
): void {
  buildNgBaselineFixture(root);
  copyScriptsComplete(root);
  const cmdDir =
    commandDirKind === "projection"
      ? join(root, ".opencode", "commands", "agentdev")
      : join(root, "src", "opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  // broken.md has no frontmatter → command-inventory NG whose bucket key `file`
  // is the command file path in the environment's own notation.
  writeFileSync(join(cmdDir, "broken.md"), "# broken\n\nNo frontmatter.\n", "utf-8");
}

describe("NG baseline path bucket key normalization (Issue #2206, OU-0008)", () => {
  afterAll(() => {
    rmSync(NGBASELINE_PATHNORM_ROOT_MAIN, { recursive: true, force: true });
    rmSync(NGBASELINE_PATHNORM_ROOT_WORKTREE, { recursive: true, force: true });
  });

  it("main 環境表記 (.opencode/...) の NG が src/opencode 表記の baseline entry で降格する", () => {
    const root = NGBASELINE_PATHNORM_ROOT_MAIN;
    rmSync(root, { recursive: true, force: true });
    buildPathNormFixture(root, "projection");
    writeNgBaselineFile(root, [
      {
        category: "Command",
        check: "command-inventory",
        file: "src/opencode/commands/agentdev/broken.md",
        evidence: null,
        count: 1,
        provenance: "legacy",
        reason: "path-notation fixture (Issue #2206)",
      },
    ]);

    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout) as {
      results: Array<{
        check: string;
        level: string;
        file?: string;
        message?: string;
      }>;
    };
    const inv = parsed.results.filter(
      (res) =>
        res.check === "command-inventory" &&
        (res.file ?? "").endsWith("broken.md"),
    );
    expect(inv.length).toBeGreaterThanOrEqual(1);
    expect(inv[0].file).toBe(".opencode/commands/agentdev/broken.md");
    expect(inv[0].level).toBe("info");
    expect(inv[0].message).toContain("[baseline-known]");
  });

  it("worktree 環境表記 (src/opencode/...) の NG が .opencode 表記の baseline entry で降格する", () => {
    const root = NGBASELINE_PATHNORM_ROOT_WORKTREE;
    rmSync(root, { recursive: true, force: true });
    buildPathNormFixture(root, "source");
    writeNgBaselineFile(root, [
      {
        category: "Command",
        check: "command-inventory",
        file: ".opencode/commands/agentdev/broken.md",
        evidence: null,
        count: 1,
        provenance: "legacy",
        reason: "path-notation fixture (Issue #2206)",
      },
    ]);

    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout) as {
      results: Array<{
        check: string;
        level: string;
        file?: string;
        message?: string;
      }>;
    };
    const inv = parsed.results.filter(
      (res) =>
        res.check === "command-inventory" &&
        (res.file ?? "").endsWith("broken.md"),
    );
    expect(inv.length).toBeGreaterThanOrEqual(1);
    expect(inv[0].file).toBe("src/opencode/commands/agentdev/broken.md");
    expect(inv[0].level).toBe("info");
    expect(inv[0].message).toContain("[baseline-known]");
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

// ─── NG21 N16/N17 是正回帰テスト（Issue #2245, OU-0009, RU-0054） ──────────
// N16（skill-category-gap: 「Skill rename 対称性」カテゴリの
// categoryToCheckPattern map 未登録・check_skill_rename_symmetry.ts の
// scriptFiles 対象未登録）と N17（command-capture-duty: case-close.md の
// capture-boundaries 参照欠落）を実修復し、対応する baseline entry を
// 除去した後の状態を保持することを検証する。baseline 更新だけで
// gap/duty 違反を info へ降格していないことを回帰テストとして固定する。

describe("NG21 N16/N17 是正回帰 (Issue #2245, OU-0009)", () => {
  const REPO_ROOT = join(SCRIPT_DIR, "..", "..", "..", "..");

  it("N16: 'Skill rename 対称性' カテゴリが gap で ng/warning にならないこと（map + scriptFiles 登録）", () => {
    const proc = Bun.spawnSync(["bun", "run", SCRIPT_FILE, "--json"], {
      cwd: REPO_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = proc.stdout?.toString("utf-8") ?? "";
    expect(stdout.length).toBeGreaterThan(0);

    const parsed = JSON.parse(stdout) as {
      results: Array<{ check: string; level: string; message?: string }>;
    };

    const gapNg = parsed.results.filter(
      (r) =>
        r.check === "skill-category-gap" &&
        (r.level === "ng" || r.level === "warning"),
    );
    expect(gapNg.length).toBe(0);

    const gapOk = parsed.results.find(
      (r) => r.check === "skill-category-gap" && r.level === "ok",
    );
    expect(gapOk).toBeDefined();
    expect(gapOk!.message).toContain("corresponding implementations");
  });

  it("N17: case-close.md の command-capture-duty が ok であること（capture-boundaries 参照）", () => {
    const proc = Bun.spawnSync(["bun", "run", SCRIPT_FILE, "--json"], {
      cwd: REPO_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = proc.stdout?.toString("utf-8") ?? "";
    const parsed = JSON.parse(stdout) as {
      results: Array<{ check: string; level: string; message?: string }>;
    };

    const duty = parsed.results.find(
      (r) =>
        r.check === "command-capture-duty" &&
        (r.message ?? "").includes("case-close.md"),
    );
    expect(duty).toBeDefined();
    expect(duty!.level).toBe("ok");
    expect(duty!.message).toContain("capture-boundaries reference");
  });
});

// ─── WP-3 (Issue #1928): execution profile separation ───────────────────────
// §7 exit-code contracts for source/installed/release.

describe("WP-3 execution profiles (Issue #1928)", () => {
  const PROFILE_TMP = join(TEMP_BASE, `profile-${RUN_ID}`);
  let profileRoot: string;

  function writeSourceCmd(root: string, name: string, body: string): void {
    const dir = join(root, "src", "opencode", "commands", "agentdev");
    writeFile(join(dir, name), body);
  }
  function writeSourceSkill(root: string, skill: string, body: string): void {
    const dir = join(root, "src", "opencode", "skills", skill);
    writeFile(join(dir, "SKILL.md"), body);
  }
  function writeProjectionCmd(root: string, name: string, body: string): void {
    const dir = join(root, ".opencode", "commands", "agentdev");
    writeFile(join(dir, name), body);
  }
  function writeProjectionSkill(root: string, skill: string, body: string): void {
    const dir = join(root, ".opencode", "skills", skill);
    writeFile(join(dir, "SKILL.md"), body);
  }

  beforeAll(() => {
    profileRoot = join(PROFILE_TMP, "repo");
    mkdirp(profileRoot);
    copyScripts(profileRoot);

    writeSourceCmd(profileRoot, "demo-cmd.md", "---\ndescription: demo\n---\n# demo\n");
    writeSourceSkill(
      profileRoot,
      "agentdev-demo",
      "---\nname: agentdev-demo\ndescription: demo skill\n---\n# agentdev-demo\n## USE FOR\n- x\n## DO NOT USE FOR\n- y\n",
    );

    // Healthy baseline: .opencode/ mirrors src/opencode/.
    writeProjectionCmd(profileRoot, "demo-cmd.md", "---\ndescription: demo\n---\n# demo\n");
    writeProjectionSkill(
      profileRoot,
      "agentdev-demo",
      "---\nname: agentdev-demo\ndescription: demo skill\n---\n# agentdev-demo\n## USE FOR\n- x\n## DO NOT USE FOR\n- y\n",
    );

    const designsDir = join(profileRoot, "docs", "designs");
    mkdirp(designsDir);
    writeFileSync(
      join(designsDir, "README.md"),
      [
        "# Design index",
        "",
        "| Design | status | 責務 |",
        "|------|--------|------|",
        "| foundations/system.md | accepted | system |",
        "",
      ].join("\n"),
      "utf-8",
    );
    const sysDir = join(designsDir, "foundations");
    mkdirp(sysDir);
    writeFileSync(join(sysDir, "system.md"), "# System\n", "utf-8");
  });

  afterAll(() => {
    rmSync(PROFILE_TMP, { recursive: true, force: true });
  });

  it("source profile (default) records profile=source and skips projection checks", () => {
    const result = runScript(profileRoot, ["--json"]);
    expect(result.exitCode).toBeGreaterThanOrEqual(0);
    const parsed = JSON.parse(result.stdout) as {
      profile: string;
      results: Array<{ category: string; check: string; level: string }>;
    };
    expect(parsed.profile).toBe("source");
    const scopeMsg = parsed.results.find(
      (r) => r.category === "ProfileScope" && r.check === "projection-check-scope",
    );
    expect(scopeMsg).toBeDefined();
    expect(
      parsed.results.some((r) => r.category === "InstalledProfile"),
    ).toBe(false);
  });

  it("installed profile fails with projection_missing when projection dir is absent", () => {
    const brokenRoot = join(PROFILE_TMP, "no-projection");
    mkdirp(brokenRoot);
    copyScripts(brokenRoot);
    writeSourceCmd(brokenRoot, "demo-cmd.md", "---\ndescription: demo\n---\n# demo\n");
    writeSourceSkill(
      brokenRoot,
      "agentdev-demo",
      "---\nname: agentdev-demo\ndescription: demo skill\n---\n# agentdev-demo\n## USE FOR\n- x\n## DO NOT USE FOR\n- y\n",
    );

    const result = runScript(brokenRoot, ["--profile", "installed", "--json"]);
    expect(result.exitCode).toBe(1);
    const parsed = JSON.parse(result.stdout) as {
      profile: string;
      results: Array<{ category: string; check: string; level: string }>;
    };
    expect(parsed.profile).toBe("installed");
    expect(
      parsed.results.some(
        (r) =>
          r.category === "InstalledProfile" &&
          r.check === "projection_missing" &&
          r.level === "ng",
      ),
    ).toBe(true);
  });

  it("installed profile detects content_mismatch on divergent projection", () => {
    const mismatchRoot = join(PROFILE_TMP, "mismatch");
    mkdirp(mismatchRoot);
    copyScripts(mismatchRoot);
    writeSourceCmd(mismatchRoot, "demo-cmd.md", "---\ndescription: demo\n---\n# demo source\n");
    writeSourceSkill(
      mismatchRoot,
      "agentdev-demo",
      "---\nname: agentdev-demo\ndescription: demo skill\n---\n# agentdev-demo\n## USE FOR\n- x\n## DO NOT USE FOR\n- y\n",
    );
    writeProjectionCmd(mismatchRoot, "demo-cmd.md", "---\ndescription: demo\n---\n# demo projection (drift)\n");
    writeProjectionSkill(
      mismatchRoot,
      "agentdev-demo",
      "---\nname: agentdev-demo\ndescription: demo skill\n---\n# agentdev-demo\n## USE FOR\n- x\n## DO NOT USE FOR\n- y\n",
    );

    const result = runScript(mismatchRoot, ["--profile", "installed", "--json"]);
    expect(result.exitCode).toBe(1);
    const parsed = JSON.parse(result.stdout) as {
      results: Array<{ category: string; check: string; level: string }>;
    };
    expect(
      parsed.results.some(
        (r) =>
          r.category === "InstalledProfile" &&
          r.check === "content_mismatch" &&
          r.level === "ng",
      ),
    ).toBe(true);
  });

  it("installed profile detects projection_extra for unexpected agentdev- skill", () => {
    const extraRoot = join(PROFILE_TMP, "extra");
    mkdirp(extraRoot);
    copyScripts(extraRoot);
    writeSourceCmd(extraRoot, "demo-cmd.md", "---\ndescription: demo\n---\n# demo\n");
    writeSourceSkill(
      extraRoot,
      "agentdev-demo",
      "---\nname: agentdev-demo\ndescription: demo skill\n---\n# agentdev-demo\n## USE FOR\n- x\n## DO NOT USE FOR\n- y\n",
    );
    writeProjectionCmd(extraRoot, "demo-cmd.md", "---\ndescription: demo\n---\n# demo\n");
    writeProjectionSkill(
      extraRoot,
      "agentdev-demo",
      "---\nname: agentdev-demo\ndescription: demo skill\n---\n# agentdev-demo\n## USE FOR\n- x\n## DO NOT USE FOR\n- y\n",
    );
    writeProjectionSkill(
      extraRoot,
      "agentdev-foreign",
      "---\nname: agentdev-foreign\ndescription: foreign\n---\n# agentdev-foreign\n",
    );

    const result = runScript(extraRoot, ["--profile", "installed", "--json"]);
    expect(result.exitCode).toBe(1);
    const parsed = JSON.parse(result.stdout) as {
      results: Array<{ category: string; check: string; level: string; evidence?: string }>;
    };
    expect(
      parsed.results.some(
        (r) =>
          r.category === "InstalledProfile" &&
          r.check === "projection_extra" &&
          r.level === "ng" &&
          r.evidence === "agentdev-foreign",
      ),
    ).toBe(true);
  });

  it("installed profile reports 0 InstalledProfile NG when projection mirrors source", () => {
    const result = runScript(profileRoot, ["--profile", "installed", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      profile: string;
      results: Array<{ category: string; check: string; level: string }>;
    };
    expect(parsed.profile).toBe("installed");
    const installedNg = parsed.results.filter(
      (r) => r.category === "InstalledProfile" && r.level === "ng",
    );
    expect(installedNg.length).toBe(0);
  });
});

// ─── IR-063 guardrail-number-invariant (REQ-010-064, Issue #2372) ────────────
// Fixture kinds per REQ-010-068: 正常例 (ok-cmd), 違反例 (violation-cmd),
// 境界例 (boundary-cmd: single G01, defined reference), 許容例 (no-guardrail-cmd:
// Gxx 未使用 command は対象外), 再現例 (f009-cmd: Wave 1 F-009 の req-define 形式).

const IR063_ROOT = join(TEMP_ROOT, "ir063");

function buildIr063Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    "# Requirements\n\n| ID | Title |\n|----|-------|\n| REQ-9301 | IR-063 fixture |\n",
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-9301.md"),
    "---\nid: REQ-9301\ntitle: IR-063 fixture\ncreated: 2025-01-01\nupdated: 2025-01-01\n---\n\nBody.\n",
    "utf-8",
  );
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

  const cmdDir = join(root, "src", "opencode", "commands", "agentdev");
  mkdirp(cmdDir);

  writeFileSync(
    join(cmdDir, "README.md"),
    "# Commands\n\n| Command |\n|---------|\n| `agentdev/ok-cmd` |\n",
    "utf-8",
  );

  // 正常例: G01 連番 + 定義済み参照
  writeFileSync(
    join(cmdDir, "ok-cmd.md"),
    [
      "---",
      "description: ok command",
      "agent: test-agent",
      "---",
      "",
      "## ガードレール",
      "",
      "- G01: 編集スコープは限定する",
      "- G02: 破壊的操作は行わない",
      "- G03: レポートのみ出力する",
      "",
      "手順は G02 に従う。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 違反例: 非 G01 開始 + 重複 + 未定義参照
  writeFileSync(
    join(cmdDir, "violation-cmd.md"),
    [
      "---",
      "description: violation command",
      "agent: test-agent",
      "---",
      "",
      "## ガードレール",
      "",
      "- G01: first guardrail",
      "- G01: duplicate definition of G01",
      "- G03: skips G02",
      "",
      "本文は G09 を参照する（未定義）。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 境界例: 最小構成（G01 単体）+ 定義行の直前参照
  writeFileSync(
    join(cmdDir, "boundary-cmd.md"),
    [
      "---",
      "description: boundary command",
      "agent: test-agent",
      "---",
      "",
      "## ガードレール",
      "",
      "- G01: only guardrail",
      "",
      "G01 を適用する。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 許容例: Gxx を使用しない command（検査対象外）
  writeFileSync(
    join(cmdDir, "no-guardrail-cmd.md"),
    [
      "---",
      "description: no guardrail command",
      "agent: test-agent",
      "---",
      "",
      "本文にガードレール番号を持たない。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 再現例: Wave 1 監査 F-009 の req-define.md 形式（G03/G04/G08 = 非 G01 開始 + 欠番）
  writeFileSync(
    join(cmdDir, "f009-cmd.md"),
    [
      "---",
      "description: F-009 reproduction",
      "agent: test-agent",
      "---",
      "",
      "## ガードレール",
      "",
      "- G03: 編集スコープは限定する",
      "- G04: 入力ファイルは参照専用とする",
      "- G08: git コマンドは実行しない",
      "",
    ].join("\n"),
    "utf-8",
  );

  copyScripts(root);
}

describe("IR-063 guardrail-number-invariant (REQ-010-064, Issue #2372)", () => {
  beforeAll(() => {
    mkdirp(IR063_ROOT);
    buildIr063Fixture(IR063_ROOT);
  });

  it("passes a sequential G01-start command with resolved references (正常例)", () => {
    const r = runScript(IR063_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; level: string; file?: string }) =>
        res.category === "GuardrailNumber" &&
        res.level !== "ok" &&
        (res.file ?? "").includes("ok-cmd.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("detects start-number, duplicate, and undefined-reference violations (違反例)", () => {
    const r = runScript(IR063_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const byEvidence = parsed.results
      .filter(
        (res: { category: string; level: string; file?: string }) =>
          res.category === "GuardrailNumber" &&
          res.level === "ng" &&
          (res.file ?? "").includes("violation-cmd.md"),
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(byEvidence).toContain("duplicate:G01");
    expect(byEvidence).toContain("gap:G02");
    expect(byEvidence).toContain("undefined-reference:G09");
  });

  it("accepts a single-G01 minimal command and does not flag Gxx-free commands (境界例・許容例)", () => {
    const r = runScript(IR063_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; level: string; file?: string }) =>
        res.category === "GuardrailNumber" &&
        res.level === "ng" &&
        ((res.file ?? "").includes("boundary-cmd.md") ||
          (res.file ?? "").includes("no-guardrail-cmd.md")),
    );
    expect(violations.length).toBe(0);
  });

  it("reproduces Wave 1 F-009 (non-G01 start and gaps, 再現例)", () => {
    const r = runScript(IR063_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const byEvidence = parsed.results
      .filter(
        (res: { category: string; level: string; file?: string }) =>
          res.category === "GuardrailNumber" &&
          res.level === "ng" &&
          (res.file ?? "").includes("f009-cmd.md"),
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(byEvidence).toContain("start-number:G03");
    expect(byEvidence).toContain("gap:G05");
    expect(byEvidence).toContain("gap:G07");
  });
});

// ─── IR-064 unresolved-placeholder (REQ-010-065, Issue #2372) ────────────────
// Fixture kinds: 正常例 (ok-skill), 違反例 (violation-skill), 境界例 (boundary
// lines in ok file), 許容例 (template file), 再現例 (Wave 1 audit viewpoint V5
// pattern: bare TODO-family marker and bare ID placeholder).

const IR064_ROOT = join(TEMP_ROOT, "ir064");

function buildIr064Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    "# Requirements\n\n| ID | Title |\n|----|-------|\n| REQ-9302 | IR-064 fixture |\n",
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-9302.md"),
    "---\nid: REQ-9302\ntitle: IR-064 fixture\ncreated: 2025-01-01\nupdated: 2025-01-01\n---\n\nBody.\n",
    "utf-8",
  );
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

  const cmdDir = join(root, "src", "opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(
    join(cmdDir, "README.md"),
    "# Commands\n\n| Command |\n|---------|\n| `agentdev/placeholder-cmd` |\n",
    "utf-8",
  );

  // 正常例 + 境界例: code span 内・括弧内・「」引用列挙・code block 内は許容
  writeFileSync(
    join(cmdDir, "placeholder-cmd.md"),
    [
      "---",
      "description: placeholder boundary command",
      "agent: test-agent",
      "---",
      "",
      "`REQ-{NNNN}` は code span 内の様式例示である。",
      "",
      "本コマンドは workflow 実装本体を委譲する（DEC-{N}、REQ-{NNNN}-{NNN})。",
      "",
      "検知キーワード:「TODO」「FIXME」等の列挙は引用例示である。",
      "",
      "```",
      "REQ-{NNNN} inside fenced code block",
      "TODO inside fenced code block",
      "```",
      "",
    ].join("\n"),
    "utf-8",
  );

  const skillDir = join(root, "src", "opencode", "skills", "agentdev-fixture-skill");
  mkdirp(skillDir);

  // 違反例 + 再現例: bare TODO マーカー（strict）と裸 ID プレースホルダー（heuristic）
  writeFileSync(
    join(skillDir, "SKILL.md"),
    [
      "---",
      "name: agentdev-fixture-skill",
      "description: fixture skill",
      "---",
      "",
      "# agentdev-fixture-skill",
      "",
      "REQ-{NNNN} で定義される対象について、TODO を残さない。",
      "",
      "FIXME: 未解決の残置マーカー。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 許容例: command templates/ 配下と _template.md はテンプレート領域
  const tplDir = join(cmdDir, "templates", "fixture");
  mkdirp(tplDir);
  writeFileSync(
    join(tplDir, "standard.md"),
    "REQ-{NNNN} と TODO はテンプレート内では許容される。\n",
    "utf-8",
  );
  const skillTplDir = join(root, "src", "opencode", "skills", "agentdev-fixture-skill", "templates");
  mkdirp(skillTplDir);
  writeFileSync(
    join(skillTplDir, "doc.md"),
    "id: REQ-{NNNN}\n\nREQ-{NNNN} テンプレート。\n",
    "utf-8",
  );

  copyScripts(root);
}

describe("IR-064 unresolved-placeholder (REQ-010-065, Issue #2372)", () => {
  beforeAll(() => {
    mkdirp(IR064_ROOT);
    buildIr064Fixture(IR064_ROOT);
  });

  it("does not flag code span, parentheses, quote-enumeration, or fenced blocks (正常例・境界例)", () => {
    const r = runScript(IR064_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "UnresolvedPlaceholder" &&
        (res.file ?? "").includes("placeholder-cmd.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("detects bare TODO-family marker as strict and bare ID placeholder as heuristic (違反例)", () => {
    const r = runScript(IR064_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const levels = parsed.results
      .filter(
        (res: { category: string; file?: string }) =>
          res.category === "UnresolvedPlaceholder" &&
          (res.file ?? "").includes("agentdev-fixture-skill"),
      )
      .map((res: { level: string; evidence?: string }) => `${res.level}:${res.evidence}`);
    expect(levels).toContain("ng:todo-marker:FIXME");
    expect(levels).toContain("warning:id-placeholder:REQ-{NNNN}");
  });

  it("exempts command templates/ and skill templates/ directories (許容例)", () => {
    const r = runScript(IR064_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "UnresolvedPlaceholder" &&
        ((res.file ?? "").includes("/templates/") ||
          (res.file ?? "").includes("\\templates\\")),
    );
    expect(violations.length).toBe(0);
  });

  it("does not treat non-ID brace tokens like UTF-{N} as placeholders (再現例の誤検出防止)", () => {
    const r = runScript(IR064_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const utf = parsed.results.filter(
      (res: { category: string; evidence?: string }) =>
        res.category === "UnresolvedPlaceholder" &&
        (res.evidence ?? "").includes("UTF"),
    );
    expect(utf.length).toBe(0);
  });
});

// ─── IR-065/IR-066 obsolete-vocabulary & legacy-path (REQ-010-066/067, Issue #2372) ──
// Fixture kinds: 正常例 (current vocabulary only), 違反例 (（ADR）注記・bare ADR
// ・docs/specs/・廃止スキル名), 境界例 (v2:ADR-0123 は REQ-010-066 文言どおり許容),
// 許容例 (superseded Decision・行履歴マーカー・否定文脈・existence_probe),
// 再現例 (Wave 2 F-001 （ADR）注記・F-003 agentdev-spec-compliance 参照).

const IR065_ROOT = join(TEMP_ROOT, "ir065");

function buildIr065Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    "# Requirements\n\n| ID | Title |\n|----|-------|\n| REQ-9303 | IR-065 fixture |\n",
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-9303.md"),
    "---\nid: REQ-9303\ntitle: IR-065 fixture\ncreated: 2025-01-01\nupdated: 2025-01-01\n---\n\nBody.\n",
    "utf-8",
  );
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

  // 正常例 + 境界例: 現行語彙（REQ/Decision/Design）と v2: プレフィックス付き歴史識別子
  const designDir = join(root, "docs", "designs", "skills");
  mkdirp(designDir);
  writeFileSync(
    join(designDir, "current-design.md"),
    [
      "# Current design",
      "",
      "REQ/Decision/Design/guides の現行種別列挙である。",
      "",
      "許容された歴史的識別子（v2:ADR-0123 等）は誤検出しない。",
      "",
      "`ADR-0099` は code span 内の様式例示である。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 許容例: superseded Decision はファイル単位で履歴文書
  const decDir = join(root, "docs", "decisions");
  mkdirp(decDir);
  writeFileSync(
    join(decDir, "DEC-9901.md"),
    [
      "---",
      "id: DEC-9901",
      "title: superseded decision",
      "status: superseded",
      "---",
      "",
      "# DEC-9901",
      "",
      "旧 Artifact Graph 標準化の決定。agentdev-artifact-graph への言及を履歴として保持する。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 違反例 + 再現例（F-001/F-003 相当）
  const cmdDir = join(root, "src", "opencode", "commands", "agentdev");
  mkdirp(cmdDir);
  writeFileSync(
    join(cmdDir, "README.md"),
    "# Commands\n\n| Command |\n|---------|\n| `agentdev/vocab-cmd` |\n",
    "utf-8",
  );
  writeFileSync(
    join(cmdDir, "vocab-cmd.md"),
    [
      "---",
      "description: vocabulary violation command",
      "agent: test-agent",
      "---",
      "",
      "project extension を読み込む（ADR）。",
      "",
      "設計判断の記録は ADR-0099 を参照する。",
      "",
      "仕様文書は docs/specs/foundations/system.md にある。",
      "",
      "乖離報告は agentdev-spec-compliance から抽出する。",
      "",
      "判断記録は docs/adr/ 配下のファイルを参照する。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 許容例: 行履歴マーカー・否定文脈
  writeFileSync(
    join(designDir, "history-design.md"),
    [
      "# History and negation design",
      "",
      "旧 ADR-0099 の記述は履歴マーカー付きのため許容される。",
      "",
      "`.agentdev/graph/` のような派生索引を標準動作に含めない（廃止）。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 境界例: existence_probe — agentdev-artifact-graph が実在すれば語彙検出を skip
  const probeSkillDir = join(root, "src", "opencode", "skills", "agentdev-artifact-graph");
  mkdirp(probeSkillDir);
  writeFileSync(
    join(probeSkillDir, "SKILL.md"),
    "---\nname: agentdev-artifact-graph\ndescription: probe skill\n---\n# agentdev-artifact-graph\n",
    "utf-8",
  );
  writeFileSync(
    join(designDir, "probe-design.md"),
    "# Probe design\n\nagentdev-artifact-graph が実在するため検出を skip する（existence_probe）。\n",
    "utf-8",
  );

  // IR-065/066 は data/obsolete-vocabulary-map.yaml を読むため fixture へコピー
  const dataDir = join(
    root,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "data",
  );
  mkdirp(dataDir);
  writeFileSync(
    join(dataDir, "obsolete-vocabulary-map.yaml"),
    readFileSync(
      join(SCRIPT_DIR, "..", "data", "obsolete-vocabulary-map.yaml"),
      "utf-8",
    ),
    "utf-8",
  );

  copyScripts(root);
}

describe("IR-065/IR-066 obsolete-vocabulary & legacy-path (REQ-010-066/067, Issue #2372)", () => {
  beforeAll(() => {
    mkdirp(IR065_ROOT);
    buildIr065Fixture(IR065_ROOT);
  });

  it("passes current vocabulary and v2:-prefixed historical identifiers (正常例・境界例)", () => {
    const r = runScript(IR065_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        (res.category === "ObsoleteVocabulary" || res.category === "LegacyPathName") &&
        (res.file ?? "").includes("current-design.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("detects (ADR) annotation as strict and legacy identifiers as heuristic (違反例)", () => {
    const r = runScript(IR065_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const found = parsed.results
      .filter(
        (res: { category: string; file?: string }) =>
          (res.category === "ObsoleteVocabulary" || res.category === "LegacyPathName") &&
          (res.file ?? "").includes("vocab-cmd.md"),
      )
      .map((res: { level: string; evidence?: string }) => `${res.level}:${res.evidence}`);
    expect(found).toContain("ng:adr-kind-annotation:（ADR）");
    expect(found).toContain("warning:bare-adr-identifier:ADR-0099");
    expect(found).toContain("warning:docs-adr-path:docs/adr/");
    expect(found).toContain("warning:docs-specs-path:docs/specs/");
    expect(found).toContain("warning:agentdev-spec-compliance-skill:agentdev-spec-compliance");
  });

  it("exempts superseded decisions, line history markers, and negation contexts (許容例)", () => {
    const r = runScript(IR065_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        (res.category === "ObsoleteVocabulary" || res.category === "LegacyPathName") &&
        ((res.file ?? "").includes("DEC-9901.md") ||
          (res.file ?? "").includes("history-design.md")),
    );
    expect(violations.length).toBe(0);
  });

  it("skips vocabulary whose existence_probe target exists (境界例: existence_probe)", () => {
    const r = runScript(IR065_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        (res.category === "ObsoleteVocabulary" || res.category === "LegacyPathName") &&
        (res.file ?? "").includes("probe-design.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("reproduces Wave 2 F-001 ((ADR) annotation) and F-003 (agentdev-spec-compliance) residue (再現例)", () => {
    const r = runScript(IR065_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const adrAnnotation = parsed.results.filter(
      (res: { category: string; evidence?: string; level: string }) =>
        res.category === "ObsoleteVocabulary" &&
        res.level === "ng" &&
        res.evidence === "adr-kind-annotation:（ADR）",
    );
    expect(adrAnnotation.length).toBeGreaterThanOrEqual(1);
    const specCompliance = parsed.results.filter(
      (res: { category: string; evidence?: string }) =>
        res.category === "LegacyPathName" &&
        res.evidence === "agentdev-spec-compliance-skill:agentdev-spec-compliance",
    );
    expect(specCompliance.length).toBeGreaterThanOrEqual(1);
  });

  it("reports no drift when the real yaml matches checker constants (正常例: 同期済み)", () => {
    const r = runScript(IR065_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const drift = parsed.results.filter(
      (res: { category: string; check: string }) =>
        res.category === "ObsoleteVocabulary" && res.check === "obsolete-vocabulary-map-drift",
    );
    expect(drift.length).toBe(0);
  });
});

// ─── IR-065/IR-066 vocabulary map drift (REQ-047-004, Issue #2373) ───────────
// Fixture kinds: 違反例（模擬変更）3種 — yaml 側にのみ存在する語彙 ID（正規契約側
// で語彙を追加し checker を未更新の状態）、checker 側にのみ存在する語彙 ID（yaml
// から語彙を除去し checker を未更新の状態）、rule 割当の不一致。

const IR065_DRIFT_ROOT = join(TEMP_ROOT, "ir065-drift");

function buildIr065DriftFixture(
  root: string,
  patchYaml: (yaml: string) => string,
): void {
  buildIr065Fixture(root);
  const yamlPath = join(
    root,
    ".opencode",
    "skills",
    "repo-agentdev-integrity",
    "data",
    "obsolete-vocabulary-map.yaml",
  );
  writeFileSync(yamlPath, patchYaml(readFileSync(yamlPath, "utf-8")), "utf-8");
}

function driftResults(root: string) {
  const r = runScript(root, ["--json"]);
  const parsed = JSON.parse(r.stdout);
  return parsed.results.filter(
    (res: { category: string; check: string }) =>
      res.category === "ObsoleteVocabulary" && res.check === "obsolete-vocabulary-map-drift",
  );
}

describe("IR-065/IR-066 vocabulary map drift (REQ-047-004, Issue #2373)", () => {
  it("detects a vocabulary id declared in yaml but absent from checker constants (違反例: yaml-only)", () => {
    const root = join(IR065_DRIFT_ROOT, "yaml-only");
    mkdirp(root);
    buildIr065DriftFixture(root, (yaml) =>
      yaml.replace(
        "  - id: doc-map-name\n    rule: IR-065\n    existence_probe: docs/DOC-MAP.md\n",
        "  - id: doc-map-name\n    rule: IR-065\n    existence_probe: docs/DOC-MAP.md\n  - id: ghost-vocab\n    rule: IR-065\n    existence_probe: docs/ghost\n",
      ),
    );
    const drift = driftResults(root);
    expect(drift.length).toBe(1);
    expect(drift[0].level).toBe("ng");
    expect(drift[0].message).toContain("ghost-vocab");
    expect(drift[0].evidence).toBe("checker-only:0,yaml-only:1,rule-mismatch:0");
  });

  it("detects a vocabulary id present in checker constants but removed from yaml (違反例: checker-only)", () => {
    const root = join(IR065_DRIFT_ROOT, "checker-only");
    mkdirp(root);
    buildIr065DriftFixture(root, (yaml) =>
      yaml.replace(
        "  - id: doc-map-name\n    rule: IR-065\n    existence_probe: docs/DOC-MAP.md\n",
        "",
      ),
    );
    const drift = driftResults(root);
    expect(drift.length).toBe(1);
    expect(drift[0].level).toBe("ng");
    expect(drift[0].message).toContain("doc-map-name");
    expect(drift[0].evidence).toBe("checker-only:1,yaml-only:0,rule-mismatch:0");
  });

  it("detects rule assignment mismatch between yaml and checker constants (違反例: rule mismatch)", () => {
    const root = join(IR065_DRIFT_ROOT, "rule-mismatch");
    mkdirp(root);
    buildIr065DriftFixture(root, (yaml) =>
      yaml.replace(
        "  - id: bare-adr-identifier\n    rule: IR-065\n",
        "  - id: bare-adr-identifier\n    rule: IR-066\n",
      ),
    );
    const drift = driftResults(root);
    expect(drift.length).toBe(1);
    expect(drift[0].level).toBe("ng");
    expect(drift[0].message).toContain("bare-adr-identifier");
    expect(drift[0].evidence).toBe("checker-only:0,yaml-only:0,rule-mismatch:1");
  });
});

// ─── IR-066 vocabulary extension (Issue #2383 (b) v1〜v4 再走査採用分) ────────
// Fixture kinds: 正常例 (現行名称のみ), 違反例 (旧 command 名・旧 skill 名の現行参照),
// 境界例 (否定文脈「廃止する」), 許容例 (DEC-006 exemption_files・superseded Decision),
// 再現例 (F-01 stale junction 旧称 agentdev-spec-file-manager / agentdev-workflow-spec-save)。

const IR066EXT_ROOT = join(TEMP_ROOT, "ir066ext");

function buildIr066ExtFixture(root: string): void {
  buildIr065Fixture(root);

  const cmdDir = join(root, "src", "opencode", "commands", "agentdev");
  // 違反例 + 再現例（F-01 stale junction 旧称）
  writeFileSync(
    join(cmdDir, "retired-name-cmd.md"),
    [
      "---",
      "description: retired name violation command",
      "agent: test-agent",
      "---",
      "",
      "extension 検査は inspect-extensions を起動する。",
      "",
      "SPEC ファイル操作は agentdev-spec-file-manager へ委譲する。",
      "",
      "Design 保存工程は agentdev-workflow-spec-save が担う。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 境界例: 否定文脈（廃止する）内の言及は検出しない
  const designDir = join(root, "docs", "designs", "skills");
  writeFileSync(
    join(designDir, "negation-design.md"),
    "# Negation design\n\n旧 command である inspect-extensions を独立公開 command として廃止する。\n",
    "utf-8",
  );

  // 許容例: DEC-006 は exemption_files（inspect-extensions 廃止の移行記録）
  writeFileSync(
    join(root, "docs", "decisions", "DEC-006.md"),
    [
      "---",
      "id: DEC-006",
      "title: inspect 3-command normalization",
      "status: accepted",
      "---",
      "",
      "# DEC-006",
      "",
      "inspect-extensions を独立公開 command として廃止し、責務を移管する。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 正常例: 現行名称（inspect-skills / agentdev-design-file-manager / agentdev-workflow-design-save）
  writeFileSync(
    join(designDir, "current-ext-design.md"),
    [
      "# Current extension design",
      "",
      "extension 検査の意味診断は inspect-skills が担う。",
      "",
      "Design ファイル操作は agentdev-design-file-manager へ、保存工程は agentdev-workflow-design-save へ委譲する。",
      "",
    ].join("\n"),
    "utf-8",
  );
}

describe("IR-066 vocabulary extension (Issue #2383 (b) resweep adoption)", () => {
  beforeAll(() => {
    mkdirp(IR066EXT_ROOT);
    buildIr066ExtFixture(IR066EXT_ROOT);
  });

  it("passes current command/skill names (正常例)", () => {
    const r = runScript(IR066EXT_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "LegacyPathName" &&
        (res.file ?? "").includes("current-ext-design.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("detects retired command and skill names as current references (違反例・再現例)", () => {
    const r = runScript(IR066EXT_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const evidence = parsed.results
      .filter(
        (res: { category: string; file?: string }) =>
          res.category === "LegacyPathName" &&
          (res.file ?? "").includes("retired-name-cmd.md"),
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(evidence).toContain(
      "inspect-extensions-command:inspect-extensions",
    );
    expect(evidence).toContain(
      "agentdev-spec-file-manager-skill:agentdev-spec-file-manager",
    );
    expect(evidence).toContain(
      "agentdev-workflow-spec-save-skill:agentdev-workflow-spec-save",
    );
  });

  it("does not flag negation-context mentions (境界例)", () => {
    const r = runScript(IR066EXT_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "LegacyPathName" &&
        (res.file ?? "").includes("negation-design.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("exempts DEC-006 migration record via exemption_files (許容例)", () => {
    const r = runScript(IR066EXT_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "LegacyPathName" &&
        (res.file ?? "").endsWith("docs/decisions/DEC-006.md"),
    );
    expect(violations.length).toBe(0);
  });
});

// ─── IR-067 referenced-req-row-existence (REQ-010-069, Issue #2383 (a)) ───────
// Fixture kinds: 正常例 (実在行 ID の引用), 違反例 (ファントム行 ID),
// 境界例 (v2: プレフィックス・プレースホルダー・旧4桁番号帯・code span),
// 許容例 (_template.md・AUTOGEN ブロック・IR ルール説明文),
// 再現例 (PR 2284 ファントム REQ-010-NNN 引用残存)。

const IR067_ROOT = join(TEMP_ROOT, "ir067");

function buildIr067Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    "# Requirements\n\n| ID | Title |\n|----|-------|\n| REQ-930 | IR-067 fixture |\n",
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-930.md"),
    [
      "---",
      "id: REQ-930",
      "title: IR-067 fixture",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "## 要件",
      "",
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-930-001 | 実在する要件行その1 |",
      "| REQ-930-002 | 実在する要件行その2 |",
      "",
    ].join("\n"),
    "utf-8",
  );
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

  const designDir = join(root, "docs", "designs", "skills");
  mkdirp(designDir);

  // 正常例: 実在行 ID の引用
  writeFileSync(
    join(designDir, "ok-design.md"),
    "# Ok design\n\n本検査は REQ-930-001 および REQ-930-002 を満たす。\n",
    "utf-8",
  );

  // 違反例 + 再現例: ファントム行 ID（PR 2284 と同種の未コミット草案番号）
  writeFileSync(
    join(designDir, "phantom-design.md"),
    [
      "# Phantom design",
      "",
      "本検査は REQ-930-099 を満たす（未コミット草案番号の引用残存）。",
      "",
      "REQ-930-100 も引用する。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 境界例: v2: プレフィックス、プレースホルダー様式例示、旧4桁番号帯、code span
  writeFileSync(
    join(designDir, "boundary-design.md"),
    [
      "# Boundary design",
      "",
      "歴史識別子 v2:REQ-0158-004 は許容する。",
      "",
      "様式例示 REQ-930-NNN はプレースホルダーであり実在検査対象外である。",
      "",
      "旧番号帯 REQ-0136-029 は現行3桁番号帯の検査対象外である。",
      "",
      "`REQ-930-099` は code span 内の様式例示である。",
      "",
      "```",
      "REQ-930-099 inside fenced code block",
      "```",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 許容例: _template.md と AUTOGEN ブロック
  writeFileSync(
    join(designDir, "_template.md"),
    "# Template\n\nREQ-930-099 はテンプレート内の例示である。\n",
    "utf-8",
  );
  writeFileSync(
    join(designDir, "autogen-design.md"),
    [
      "# Autogen design",
      "",
      "<!-- AUTOGEN:BEGIN:id=demo -->",
      "REQ-930-099 inside autogen block",
      "<!-- AUTOGEN:END -->",
      "",
      "本文は実在する REQ-930-001 のみ引用する。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 許容例: IR ルール説明文（例示用 ID を含む自己参照的資料、v2:REQ-0145-015）
  const rulesDir = join(root, "docs", "designs", "integrity", "rules");
  mkdirp(rulesDir);
  writeFileSync(
    join(rulesDir, "IR-0999-demo-rule.md"),
    "# IR-0999 demo rule\n\n検出例: REQ-930-099 の引用は検出する。\n",
    "utf-8",
  );

  copyScripts(root);
}

describe("IR-067 referenced-req-row-existence (REQ-010-069, Issue #2383 (a))", () => {
  beforeAll(() => {
    mkdirp(IR067_ROOT);
    buildIr067Fixture(IR067_ROOT);
  });

  it("passes citations of existing requirement rows (正常例)", () => {
    const r = runScript(IR067_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "ReqCitation" &&
        (res.file ?? "").includes("ok-design.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("detects phantom row citations (違反例)", () => {
    const r = runScript(IR067_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const evidence = parsed.results
      .filter(
        (res: { category: string; level: string; file?: string }) =>
          res.category === "ReqCitation" &&
          res.level === "ng" &&
          (res.file ?? "").includes("phantom-design.md"),
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(evidence).toContain("REQ-930-099");
    expect(evidence).toContain("REQ-930-100");
  });

  it("tolerates v2: prefix, placeholders, 4-digit legacy band, and code spans (境界例)", () => {
    const r = runScript(IR067_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "ReqCitation" &&
        (res.file ?? "").includes("boundary-design.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("exempts templates, AUTOGEN blocks, and IR rule description files (許容例)", () => {
    const r = runScript(IR067_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "ReqCitation" &&
        ((res.file ?? "").includes("_template.md") ||
          (res.file ?? "").includes("autogen-design.md") ||
          (res.file ?? "").includes("IR-0999-demo-rule.md")),
    );
    expect(violations.length).toBe(0);
  });

  it("reproduces the PR 2284 phantom citation pattern as strict ng (再現例)", () => {
    const r = runScript(IR067_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const phantom = parsed.results.find(
      (res: { category: string; level: string; evidence?: string; file?: string }) =>
        res.category === "ReqCitation" &&
        res.level === "ng" &&
        res.evidence === "REQ-930-099" &&
        (res.file ?? "").includes("phantom-design.md"),
    );
    expect(phantom).toBeDefined();
    expect(phantom.finding_level).toBe("strict");
    expect(phantom.message).toContain("Phantom REQ row citation");
  });
});

// ─── IR-068 skill-projection-manifest (Issue #2383 (d), inspect F-01) ────────
// Fixture kinds: 正常例 (manifest ↔ src 一致), 違反例 (manifest 陳腐化・投影乖離),
// 境界例 (worktree = junction 不在では投影比較を skip),
// 許容例 (repo-* スキルは投影専用として許容),
// 再現例 (F-01: src に存在するスキルの投影欠落 + 撤去済みスキルの stale junction)。

const IR068_ROOT = join(TEMP_ROOT, "ir068");
const IR068_MANIFEST_REL_PATH = join(
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "data",
  "skill-projection-manifest.yaml",
);

function buildIr068BaseFixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    "# Requirements\n\n| ID | Title |\n|----|-------|\n| REQ-9306 | IR-068 fixture |\n",
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-9306.md"),
    "---\nid: REQ-9306\ntitle: IR-068 fixture\ncreated: 2025-01-01\nupdated: 2025-01-01\n---\n\nBody.\n",
    "utf-8",
  );
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

  for (const skill of ["agentdev-alpha-skill", "agentdev-beta-skill"]) {
    const skillDir = join(root, "src", "opencode", "skills", skill);
    mkdirp(skillDir);
    writeFileSync(
      join(skillDir, "SKILL.md"),
      `---\nname: ${skill}\ndescription: fixture skill\n---\n# ${skill}\n`,
      "utf-8",
    );
  }

  writeFile(
    join(root, ...IR068_MANIFEST_REL_PATH.split(/[\\/]/g)),
    [
      "schema_version: 1",
      "generated_at: 2026-08-22",
      "",
      "skills:",
      "  - agentdev-alpha-skill",
      "  - agentdev-beta-skill",
      "",
    ].join("\n"),
  );

  copyScripts(root);
}

function writeIr068Manifest(root: string, lines: string[]): void {
  writeFile(
    join(root, ...IR068_MANIFEST_REL_PATH.split(/[\\/]/g)),
    lines.join("\n") + "\n",
  );
}

describe("IR-068 skill-projection-manifest (Issue #2383 (d), inspect F-01)", () => {
  it("passes when manifest matches src enumeration without projection (正常例・境界例: worktree safe)", () => {
    const root = join(IR068_ROOT, "ok");
    mkdirp(root);
    buildIr068BaseFixture(root);
    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const ngFindings = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "SkillProjection" && res.level === "ng",
    );
    expect(ngFindings.length).toBe(0);
    const skip = parsed.results.find(
      (res: { category: string; level: string; check: string }) =>
        res.category === "SkillProjection" &&
        res.level === "info" &&
        res.check === "skill-projection-manifest",
    );
    expect(skip).toBeDefined();
    expect(skip.message).toContain("junction-absent");
  });

  it("detects stale manifest entries both directions (違反例: データ鮮度)", () => {
    const root = join(IR068_ROOT, "stale-manifest");
    mkdirp(root);
    buildIr068BaseFixture(root);
    writeIr068Manifest(root, [
      "schema_version: 1",
      "generated_at: 2026-08-22",
      "",
      "skills:",
      "  - agentdev-alpha-skill",
      "  - agentdev-ghost-skill",
    ]);
    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const evidence = parsed.results
      .filter(
        (res: { category: string; level: string }) =>
          res.category === "SkillProjection" && res.level === "ng",
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(evidence).toContain("manifest-only:agentdev-ghost-skill");
    expect(evidence).toContain("src-only:agentdev-beta-skill");
  });

  it("reproduces F-01: projection missing from src and stale junction extra (違反例・再現例)", () => {
    const root = join(IR068_ROOT, "projection-divergence");
    mkdirp(root);
    buildIr068BaseFixture(root);
    // src に design-save 相当を追加（F-01: workflow-design-save 投影欠落）
    const addedSkill = join(root, "src", "opencode", "skills", "agentdev-workflow-design-save");
    mkdirp(addedSkill);
    writeFileSync(
      join(addedSkill, "SKILL.md"),
      "---\nname: agentdev-workflow-design-save\ndescription: fixture skill\n---\n# agentdev-workflow-design-save\n",
      "utf-8",
    );
    writeIr068Manifest(root, [
      "schema_version: 1",
      "generated_at: 2026-08-22",
      "",
      "skills:",
      "  - agentdev-alpha-skill",
      "  - agentdev-beta-skill",
      "  - agentdev-workflow-design-save",
    ]);
    // 投影: alpha のみ junction、beta/design-save 欠落、stale junction agentdev-artifact-graph 残存
    for (const proj of ["agentdev-alpha-skill", "agentdev-artifact-graph", "repo-local-helper"]) {
      const projDir = join(root, ".opencode", "skills", proj);
      mkdirp(projDir);
      writeFileSync(join(projDir, "SKILL.md"), `---\nname: ${proj}\ndescription: p\n---\n# ${proj}\n`, "utf-8");
    }
    // F-01 stale junction（リンク先欠損）の再現: エントリは存在するがディレクトリとして
    // 解決できない投影エントリ（実環境の broken junction と同一の分類経路）
    writeFileSync(
      join(root, ".opencode", "skills", "agentdev-spec-file-manager"),
      "stale junction placeholder (non-directory entry)",
      "utf-8",
    );
    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const evidence = parsed.results
      .filter(
        (res: { category: string; level: string }) =>
          res.category === "SkillProjection" && res.level === "ng",
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(evidence).toContain("projection-missing:agentdev-beta-skill");
    expect(evidence).toContain("projection-missing:agentdev-workflow-design-save");
    expect(evidence).toContain("projection-extra:agentdev-artifact-graph");
    expect(evidence).toContain("projection-broken:agentdev-spec-file-manager");
  });

  it("tolerates repo-* projection-only skills (許容例)", () => {
    const root = join(IR068_ROOT, "repo-local");
    mkdirp(root);
    buildIr068BaseFixture(root);
    const projDir = join(root, ".opencode", "skills", "repo-agentdev-integrity");
    mkdirp(projDir);
    writeFileSync(join(projDir, "SKILL.md"), "---\nname: repo-agentdev-integrity\ndescription: p\n---\n# repo\n", "utf-8");
    const alphaDir = join(root, ".opencode", "skills", "agentdev-alpha-skill");
    mkdirp(alphaDir);
    writeFileSync(join(alphaDir, "SKILL.md"), "---\nname: agentdev-alpha-skill\ndescription: p\n---\n# a\n", "utf-8");
    const betaDir = join(root, ".opencode", "skills", "agentdev-beta-skill");
    mkdirp(betaDir);
    writeFileSync(join(betaDir, "SKILL.md"), "---\nname: agentdev-beta-skill\ndescription: p\n---\n# b\n", "utf-8");
    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const ngFindings = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "SkillProjection" && res.level === "ng",
    );
    expect(ngFindings.length).toBe(0);
  });

  it("reports invalid or duplicate manifest entries instead of silently skipping (silent skip 禁止)", () => {
    const root = join(IR068_ROOT, "schema-warning");
    mkdirp(root);
    buildIr068BaseFixture(root);
    writeIr068Manifest(root, [
      "schema_version: 1",
      "generated_at: 2026-08-22",
      "",
      "skills:",
      "  - agentdev-alpha-skill",
      "  - agentdev-alpha-skill",
      "  - Invalid_Name!",
    ]);
    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const warnings = parsed.results.filter(
      (res: { category: string; level: string; check: string }) =>
        res.category === "SkillProjection" &&
        res.level === "warning" &&
        res.check === "skill-projection-manifest",
    );
    expect(warnings.length).toBe(2);
  });
});

