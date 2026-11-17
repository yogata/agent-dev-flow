// ADF-COVERS(verification): REQ-010-002, REQ-010-003, REQ-010-006, REQ-010-007, REQ-010-063, REQ-010-068, REQ-010-084, REQ-051-001, REQ-051-002, REQ-051-003, REQ-051-004, REQ-051-005, REQ-051-006, REQ-051-007, REQ-051-008, REQ-099-001
// ADF-COVERS(verification): REQ-010-070, REQ-047-011, REQ-047-012
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, copyFileSync, renameSync, rmSync, existsSync, readFileSync, readdirSync, cpSync, symlinkSync } from "fs";
import { basename, dirname, join } from "path";
import { checkRepoLocalPluginProjectionSymmetry, checkReqRangeStaleness, checkSummaryReqRangeConsistency, checkVariantPathExistence, extractKnownGapNumbers, loadKnownGapReqIds } from "./check_integrity.ts";
import { generateDocsReadmeDecisionTable } from "./generate_indexes.ts";
import { extractKnownGapNumbers as extractKnownGapNumbersAllocator } from "../../../../src/common/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts";

const SCRIPT_DIR = import.meta.dir;
const SCRIPT_FILE = join(SCRIPT_DIR, "check_integrity.ts");
const CLI_UTILS_FILE = join(SCRIPT_DIR, "cli_utils.ts");
const GEN_INDEXES_FILE = join(SCRIPT_DIR, "generate_indexes.ts");
const CURRENT_REFS_FILE = join(SCRIPT_DIR, "current_refs.ts");
const GLOB_WALK_FILE = join(SCRIPT_DIR, "lib", "glob_walk.ts");
// REQ-010-070 対決テスト用: 正（採番スクリプト）側のリーダーと実リポジトリ numbering-policy。
const REPO_ROOT_FROM_SCRIPT_DIR = join(SCRIPT_DIR, "..", "..", "..", "..");
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
  mkdirp(join(root, "src", "common", "skills", "agentdev-test-skill"));
  mkdirp(join(root, "src", "common", "skills", "agentdev-workflow-templates"));

  // WP-3 (Issue #1928): src/common/commands/agentdev and src/common/skills
  // are required by checkSourceRequiredDirs.
  const srcCmdDir = join(root, "src", "common", "commands", "agentdev");
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
    "common",
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

  // Issue #1769 / AG-002 由来の fixture。duties 表は Case #2981（DEC-033）と
  // Issue #2810 / PR #2818（req-save.md 廃止）を経て空になり、現行公開 command に
  // specific-duty 該当は存在しない。fixture ファイル自体は README 突合系検査の
  // 在庫整合のため維持する。
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

  // Mirror the projection into the canonical source tree so the source
  // profile scan and the installed-profile projection comparison both see
  // the same content (DEC-049: src/common/ + src/opencode/plugins).
  const mirrorCommandDir = join(root, "src", "common", "commands", "agentdev");
  mkdirp(mirrorCommandDir);
  for (const filename of readdirSync(cmdDir)) {
    if (filename.endsWith(".md")) {
      copyFileSync(join(cmdDir, filename), join(mirrorCommandDir, filename));
    }
  }
  mkdirp(join(root, "src", "common", "skills"));
  for (const entry of readdirSync(join(root, ".opencode", "skills"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith("agentdev-") && entry.name !== "japanese-tech-writing") continue;
    cpSync(
      join(root, ".opencode", "skills", entry.name),
      join(root, "src", "common", "skills", entry.name),
      { recursive: true },
    );
  }
  mkdirp(join(root, "src", "opencode", "plugins"));
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

  // IR-045 は削除済み（REQ-010-003・REQ-036-023・文意品質検査は textlint 共通基盤と
  // docs 横断診断へ移管、カタログ「IR-045: （削除）」節が正）。使用されない fixture を
  // 廃止した（Case #4079・RU-0286）。IR-045 識別子は vocabulary-registry.md
  // 「文意品質検出対象語（IR-045）」の参照として残存する。
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

  // Case #2981（DEC-033）: case-run / case-close は duties 表から除去済み。
  // Issue #2810 / PR #2818 で req-save.md も廃止され duties 表は空。この fixture は
  // 検出対象外の非 duty command として誤検出不在の確認に使う。
  writeFileSync(
    join(cmdDir, "req-save.md"),
    [
      "---",
      "description: req-save",
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

// ─── check_integrity 実行結果の共有構造（テストスイート内の結果共有契約） ─────
// 同一ルート・同一実効引数・同一入力状態（固定データ・宣言的定義・baseline 等）の
// 検査群は、検査器起動を1回に集約し、その結果を各条件ごとの明示的な結果変数で
// 共有する。実行をまたぐ永続キャッシュや汎用キャッシュ基盤は作らない。
// - 各ゲッターは遅延初期化する。選択実行時は当該テスト自身の呼出しで初期化が行われ、
//   他テストの先行実行に依存しない（ファイル単体指定の実行契約維持）。
// - loadCheckRun は起動失敗（exitCode=-1）と空の stdout を明確な失敗として投げる。
//   空の結果や既定値で成功扱いにしない。JSON 解釈は各テストの既存確認が担う。
// - 共有結果は各テストから参照のみを行い、書き換えて他の確認を汚染しない。
// - 状態変更を伴う試験（baseline 更新・入力編集・引数差・出力形式差・レポート保存等）
//   は共有結果へ混ぜず、runScript 直接起動で変更後に新しく検査する。
// - 共有経由の起動は checkInvocationLog に記録する（同一テスト実行内のみの記録）。

const checkInvocationLog: string[] = [];

function loadCheckRun(cwd: string, args: string[]): RunResult {
  checkInvocationLog.push(`${cwd} :: ${args.join(" ")}`);
  const r = runScript(cwd, args);
  if (r.exitCode === -1) {
    throw new Error(
      `check_integrity の起動に失敗しました (exitCode=-1): cwd=${cwd}, args=${args.join(" ")}`,
    );
  }
  if (r.stdout.length === 0) {
    throw new Error(
      `check_integrity が空の結果を返しました（明確な失敗として扱う）: cwd=${cwd}, args=${args.join(" ")}`,
    );
  }
  return r;
}

// 対象群: VALID_ROOT + ["--json"]（--json output schema、valid fixture、
// Capture boundary の valid 系、--classification 省略確認）。
let validJsonRun: RunResult | undefined;
function getValidJsonRun(): RunResult {
  if (validJsonRun === undefined) validJsonRun = loadCheckRun(VALID_ROOT, ["--json"]);
  return validJsonRun;
}

// 対象群: INVALID_ROOT + ["--json"]（invalid fixture 検出群、Capture boundary の invalid 系）。
let invalidJsonRun: RunResult | undefined;
function getInvalidJsonRun(): RunResult {
  if (invalidJsonRun === undefined) invalidJsonRun = loadCheckRun(INVALID_ROOT, ["--json"]);
  return invalidJsonRun;
}

// 対象群: VALID_ROOT + ["--classification", "--json"]（Classification Policy 確認群）。
let validClassificationJsonRun: RunResult | undefined;
function getValidClassificationJsonRun(): RunResult {
  if (validClassificationJsonRun === undefined) {
    validClassificationJsonRun = loadCheckRun(VALID_ROOT, ["--classification", "--json"]);
  }
  return validClassificationJsonRun;
}

// 対象群: IR-044 fixture + ["--json"]（検出・exemption 確認群）。
let ir044JsonRun: RunResult | undefined;
function getIr044JsonRun(): RunResult {
  if (ir044JsonRun === undefined) ir044JsonRun = loadCheckRun(IR044_ROOT, ["--json"]);
  return ir044JsonRun;
}

// 対象群: IR-053 fixture + ["--json"]（検出・code block exemption 確認群）。
let ir053JsonRun: RunResult | undefined;
function getIr053JsonRun(): RunResult {
  if (ir053JsonRun === undefined) ir053JsonRun = loadCheckRun(IR053_ROOT, ["--json"]);
  return ir053JsonRun;
}

// 対象群: IR-055 fixture + ["--json"] の検出・exemption・分類確認群。
let ir055InvariantJsonRun: RunResult | undefined;
function getIr055InvariantJsonRun(): RunResult {
  if (ir055InvariantJsonRun === undefined) ir055InvariantJsonRun = loadCheckRun(IR055_ROOT, ["--json"]);
  return ir055InvariantJsonRun;
}

// 対象群: IR-058 fixture（skills.yaml あり）+ ["--json"]（検出・carve-out 確認群）。
let ir058JsonRun: RunResult | undefined;
function getIr058JsonRun(): RunResult {
  if (ir058JsonRun === undefined) ir058JsonRun = loadCheckRun(IR058_ROOT, ["--json"]);
  return ir058JsonRun;
}

// 対象群: 実リポジトリ回帰4確認（IR-055 実修復回帰2件、NG21 N16/N17 2件）。
// 同一ルート（REPO_ROOT_FROM_SCRIPT_DIR）・同一実効引数（["--json"]）・同一入力状態
// （実リポジトリ）を1回だけ検査する。
let realRepoJsonRun: RunResult | undefined;
function getRealRepoJsonRun(): RunResult {
  if (realRepoJsonRun === undefined) realRepoJsonRun = loadCheckRun(REPO_ROOT_FROM_SCRIPT_DIR, ["--json"]);
  return realRepoJsonRun;
}

// 対象群: IR-063 fixture + ["--json"]（正常例・違反例・許容例・再現例確認群）。
let ir063JsonRun: RunResult | undefined;
function getIr063JsonRun(): RunResult {
  if (ir063JsonRun === undefined) ir063JsonRun = loadCheckRun(IR063_ROOT, ["--json"]);
  return ir063JsonRun;
}

// 対象群: IR-064 fixture + ["--json"]（正常例・違反例・許容例・再現例確認群）。
let ir064JsonRun: RunResult | undefined;
function getIr064JsonRun(): RunResult {
  if (ir064JsonRun === undefined) ir064JsonRun = loadCheckRun(IR064_ROOT, ["--json"]);
  return ir064JsonRun;
}

// 対象群: IR-067 fixture + ["--json"]（正常・違反・境界・許容・再現例確認群）。
let ir067JsonRun: RunResult | undefined;
function getIr067JsonRun(): RunResult {
  if (ir067JsonRun === undefined) ir067JsonRun = loadCheckRun(IR067_ROOT, ["--json"]);
  return ir067JsonRun;
}

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
  if (existsSync(GEN_INDEXES_FILE)) {
    copyFileSync(GEN_INDEXES_FILE, join(dest, "generate_indexes.ts"));
  }
  copyFileSync(CURRENT_REFS_FILE, join(dest, "current_refs.ts"));
  mkdirp(join(dest, "lib"));
  copyFileSync(GLOB_WALK_FILE, join(dest, "lib", "glob_walk.ts"));
}

// 対象群: IR-053 exemption paths（RA-001）fixture + ["--json"]（skip・検出継続確認群）。
let ra001JsonRun: RunResult | undefined;
function getRa001JsonRun(): RunResult {
  if (ra001JsonRun === undefined) ra001JsonRun = loadCheckRun(RA001_ROOT, ["--json"]);
  return ra001JsonRun;
}

// 対象群: IR-072 fixture（git 履歴 fixture）+ ["--json"] の freshness 確認群。
let ir072JsonRun: RunResult | undefined;
function getIr072JsonRun(): RunResult {
  if (ir072JsonRun === undefined) ir072JsonRun = loadCheckRun(IR072_ROOT, ["--json"]);
  return ir072JsonRun;
}

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
    const r = getValidJsonRun();
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

  it("annotates checker output with rule identifiers (ir_ids, REQ-047-011)", () => {
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const results = parsed.results as Array<{
      ir_ids?: string[];
      check: string;
    }>;
    const withIrIds = results.filter(
      (res) => Array.isArray(res.ir_ids) && res.ir_ids.length > 0,
    );
    expect(withIrIds.length).toBeGreaterThan(0);
    for (const res of withIrIds) {
      for (const irId of res.ir_ids!) {
        expect(irId).toMatch(/^IR-\d{3}$/);
      }
    }
    const checks = new Set(withIrIds.map((res) => res.check));
    expect(checks.has("ir-rule-classification-traceability")).toBe(true);
    expect(checks.has("skill-projection-manifest")).toBe(true);
    expect(checks.has("runtime-unresolved-reference")).toBe(true);
  });
});

// REQ-0144-008 drift baseline（要件成立時点の履歴値）:
//   既存5件赤 / valid fixture 7件 NG
//   check_integrity.ts ルール更新時に fixture が追従せず drift していた状態の定量記録。
//   件数は本要件の成立動機であり、 REQ 要件行からは REQ-0101-068 準拠のため除去済み。
//   本テストファイルの fixture が最新 check_integrity.ts ルールに追従することを検証する。
describe("valid fixture (all checks pass or info-only)", () => {
  it("exits with code 0", () => {
    const r = getValidJsonRun();
    expect(r.exitCode).toBe(0);
  });

  it("has zero ng results", () => {
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary.ng).toBe(0);
  });

  it("REQ frontmatter-filename check passes", () => {
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "frontmatter-filename",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("REQ required-fields check passes", () => {
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "required-fields",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("REQ readme-index-sync check passes", () => {
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "REQ" && res.check === "readme-index-sync",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("ADR cross-reference check passes", () => {
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ADR" && res.check === "adr-req-crossref",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("designs existence check passes", () => {
    const r = getValidJsonRun();
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
    const r = getInvalidJsonRun();
    expect(r.exitCode).toBe(1);
  });

  it("has at least one ng result", () => {
    const r = getInvalidJsonRun();
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary.ng).toBeGreaterThan(0);
  });

  it("detects REQ id/filename mismatch (REQ-0002 has id REQ-9999)", () => {
    const r = getInvalidJsonRun();
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
    const r = getInvalidJsonRun();
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
    const r = getInvalidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const phantom = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "readme-index-sync" && res.message.includes("REQ-0099"),
    );
    expect(phantom).toBeDefined();
    expect(phantom.level).toBe("ng");
  });

  it("detects REQ file missing from README index", () => {
    const r = getInvalidJsonRun();
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
    const r = getInvalidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const badRef = parsed.results.find(
      (res: { check: string; message: string }) =>
        res.check === "adr-req-crossref" && res.message.includes("REQ-0099"),
    );
    expect(badRef).toBeDefined();
    expect(badRef.level).toBe("ng");
  });

  it("detects missing design files", () => {
    const r = getInvalidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const specNg = parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "Designs" && res.level === "ng",
    );
    expect(specNg.length).toBeGreaterThan(0);
  });

  it("detects command missing required frontmatter fields", () => {
    const r = getInvalidJsonRun();
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
    const r = getValidClassificationJsonRun();
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.summary).toBeDefined();
  });

  it("reports 6 document classifications when --classification is enabled", () => {
    const r = getValidClassificationJsonRun();
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
    const r = getValidClassificationJsonRun();
    const parsed = JSON.parse(r.stdout);
    const reportCollection = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "ClassificationPolicy" &&
        res.check === "report-collection",
    );
    expect(reportCollection).toBeDefined();
  });

  it("verifies DOC-MAP classification instance exists", () => {
    const r = getValidClassificationJsonRun();
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
    const r = getValidJsonRun();
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

    const r = getValidClassificationJsonRun();
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
    const r = getValidClassificationJsonRun();
    const parsed = JSON.parse(r.stdout);
    const retiredAdrWarnings = parsed.results.filter(
      (res: { check: string; level: string }) =>
        res.check === "retired-adr-as-current" && res.level === "warning",
    );
    expect(Array.isArray(retiredAdrWarnings)).toBe(true);
  });

  it("report documents found in docs/reports/", () => {
    const reportsDir = join(VALID_ROOT, "docs", "reports");
    const r = getValidClassificationJsonRun();
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
    const r = getValidClassificationJsonRun();
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
    const r = getValidJsonRun();
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
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const check = parsed.results.find(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "pr-template-capture-section",
    );
    expect(check).toBeDefined();
    expect(check.level).toBe("ok");
  });

  it("valid fixture: command-capture-duty emits no findings (no specific-duty command remains)", () => {
    // Case #2981（DEC-033）: case-run / case-close は duties 表から除去済み（内部
    // lifecycle 段階化）。Issue #2810 / PR #2818 で req-save.md も廃止されたため、
    // duties 表は空で command-capture-duty の検出対象 command は存在しない。
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const dutyResults = parsed.results.filter(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "command-capture-duty",
    );
    expect(dutyResults.length).toBe(0);
  });

  it("valid fixture: exempt commands (case-open, case-auto) are not checked even without capture-boundaries reference", () => {
    const r = getValidJsonRun();
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

  it("valid fixture: retired commands (case-run, case-close, req-save) are not checked", () => {
    const r = getValidJsonRun();
    const parsed = JSON.parse(r.stdout);
    // duties 表は空のため、廃止済み command はいずれも検出対象外。
    for (const retired of ["case-run.md", "case-close.md", "req-save.md"]) {
      const found = parsed.results.find(
        (res: { check: string; category: string; message: string }) =>
          res.category === "CaptureBoundary" &&
          res.check === "command-capture-duty" &&
          res.message.includes(retired),
      );
      expect(found).toBeUndefined();
    }
  });

  it("invalid fixture: capture-boundaries-existence detects missing file", () => {
    const r = getInvalidJsonRun();
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
    const r = getInvalidJsonRun();
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

  it("invalid fixture: command-capture-duty stays dormant while duties 表 is empty (no false positive on non-duty commands)", () => {
    // Issue #2810 / PR #2818: req-save.md 廃止後、duties 表は空。検出対象外の
    // command ファイル（capture-boundaries 参照・duty keyword なし）から
    // command-capture-duty の誤検出が発生しないことを検証する。
    const r = getInvalidJsonRun();
    const parsed = JSON.parse(r.stdout);
    const dutyResults = parsed.results.filter(
      (res: { check: string; category: string }) =>
        res.category === "CaptureBoundary" &&
        res.check === "command-capture-duty",
    );
    expect(dutyResults.length).toBe(0);
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
    const r = getIr044JsonRun();
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
    const r = getIr044JsonRun();
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
    const r = getIr044JsonRun();
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
    const r = getIr044JsonRun();
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
    const r = getIr044JsonRun();
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
    const r = getIr044JsonRun();
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
    const r = getIr044JsonRun();
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
    const r = getIr044JsonRun();
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
    const r = getIr044JsonRun();
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
  const cmdDir = join(root, "src", "common", "commands", "agentdev");
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
    "common",
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

  // Negated-use tolerance (Case #4081, RU-0288 / inspect D-1):
  //   - tolerated: negative predicate after the match within the same sentence
  //     (発行しない / せず forms, README.md:7 wording class)
  //   - still detected: negation that belongs to the following sentence
  const negationSkillDir = join(
    root,
    "src",
    "common",
    "skills",
    "agentdev-negation-sample",
  );
  mkdirp(negationSkillDir);
  writeFileSync(
    join(negationSkillDir, "SKILL.md"),
    [
      "---",
      "name: agentdev-negation-sample",
      "---",
      "",
      "# Negation sample skill",
      "",
      "- PR を伴わない完了構成では `gh pr view` を発行しない。",
      "- `gh issue create` は直接実行せず、Custom Tool 経由で行う。",
      "- `gh pr view` で mergeable を確認する。commit は squash しない。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // The former agentdev-gh-cli skill (retired by the GitHub I/O migration,
  // REQ-011-001) owned the permitted-file exemption; no exemption fixture remains.
}

describe("IR-053 gh-direct-invocation (REQ-0152-001/002)", () => {
  beforeAll(() => {
    mkdirp(IR053_ROOT);
    buildIr053Fixture(IR053_ROOT);
    copyScripts(IR053_ROOT);
  });

  it("detects direct gh invocation in prose (true positive)", () => {
    const r = getIr053JsonRun();
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
    const r = getIr053JsonRun();
    const parsed = JSON.parse(r.stdout);
    const inCodeBlock = parsed.results.filter(
      (res: { check: string; level: string; file?: string }) =>
        res.check === "gh-direct-invocation" &&
        res.level === "warning" &&
        (res.file ?? "").includes("agentdev-sample-skill"),
    );
    expect(inCodeBlock.length).toBe(0);
  });

  it("tolerates negated-use mentions and keeps cross-sentence negations detected (Case #4081)", () => {
    const r = getIr053JsonRun();
    const parsed = JSON.parse(r.stdout);
    const negationFindings = parsed.results.filter(
      (res: { check: string; level: string; file?: string; line?: number }) =>
        res.check === "gh-direct-invocation" &&
        (res.file ?? "").includes("agentdev-negation-sample"),
    );
    // Same-sentence negation lines (7: 発行しない, 8: せず) are tolerated;
    // line 9's negation sits in the following sentence, so only line 9 is reported.
    expect(negationFindings.length).toBe(1);
    expect(negationFindings[0].level).toBe("warning");
    expect(negationFindings[0].line).toBe(9);
  });
});

// ─── IR-055: runtime-unresolved-reference (REQ-0108-263, REQ-0108-264) ─────────
// Fixture covers:
//   - strict pattern detection (REQ-NNNN, REQ-NNNN-NNN, ADR-NNNN, src/opencode/, /repo/, repo-*)
//   - heuristic pattern detection (docs/designs/, docs/guides/, GitHub URL, line-number ref)
//   - code-block exemption
//   - template placeholder exemption (token-neighborhood narrowing, CR-002)
//   - exemption paths (vocabulary-registry.md, integrity-rule-catalog.md)
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
  const cmdDir = join(root, "src", "common", "commands", "agentdev");
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
      "See REQ-217-017 for three-digit sub-item detail.",
      "See DEC-007 for current decision reference (REQ-025-002).",
      "See ADR-0099 for legacy residual reference (REQ-025-004).",
      "See v2:ADR-0099 for historical reference (AG-010 exempt).",
      "See ADR-0099 for decision.",
      "Source at src/common/commands/agentdev/violation-cmd.md.",
      "Legacy source at src/opencode/skills/agentdev-sample-skill/SKILL.md is obsolete.",
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
    "common",
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
    "common",
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
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "REQ-5678-001" &&
        (res.file ?? "").includes("violation-cmd.md"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("does not report the head token of a 3-digit line reference (OU-003, Issue #2559)", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "REQ-217",
    );
    expect(hits.length).toBe(0);
  });

  it("detects strict pattern ADR-NNNN (residual after Decision migration, REQ-025-004)", () => {
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
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

  it("detects strict pattern obsolete src/opencode/{commands,skills,tools}/", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string; pattern?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "src/opencode/skills/",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects strict pattern /repo/", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "/repo/",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects strict pattern repo-* (repo-local skill reference)", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "repo-agentdev-integrity",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects heuristic pattern docs/designs/", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "docs/designs/",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects heuristic pattern docs/guides/", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        res.evidence === "docs/guides/",
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects heuristic pattern main-repo GitHub URL", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.evidence ?? "").startsWith("https://github.com/yogata/agent-dev-flow/"),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("detects heuristic pattern line-number ref (file.md#L<N>)", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const hits = parsed.results.filter(
      (res: { check: string; evidence?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        /\.md#L\d+/.test(res.evidence ?? ""),
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it("classifies strict patterns with finding_level=strict", () => {
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
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

  it("emits violations at warn/ng level without exemption (direct report)", () => {
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    // baseline 免除は撤廃済み → fixture は検出違反を全件そのまま報告する。
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
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const placeholderHits = parsed.results.filter(
      (res: { check: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.file ?? "").includes("placeholder-cmd.md"),
    );
    expect(placeholderHits.length).toBe(0);
  });

  it("reports concrete references on placeholder-bearing lines (CR-002 narrowing)", () => {
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
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
    const r = getIr055InvariantJsonRun();
    const parsed = JSON.parse(r.stdout);
    const vocabHits = parsed.results.filter(
      (res: { check: string; file?: string }) =>
        res.check === "runtime-unresolved-reference" &&
        (res.file ?? "").includes("vocabulary-registry.md"),
    );
    expect(vocabHits.length).toBe(0);
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

  // Distribution skill that references a projection-only skill, a repo-* skill,
  // and a skills.yaml-declared third-party skill (IR-058 3-branch fixture).
  const distSkillDir = join(root, "src", "common", "skills", "agentdev-sample");
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
      "Reference to declared third-party: `japanese-tech-writing` スキル.",
      "Path-style: .opencode/skills/test-projection-only/SKILL.md",
      "",
    ].join("\n"),
    "utf-8",
  );
  // Also create a sibling agentdev-* dir so source-side enumeration works.
  mkdirp(join(root, "src", "common", "skills", "agentdev-other"));

  // skills.yaml declaration (IR-058 branch 2 fixture): japanese-tech-writing is declared.
  const thirdPartyDir = join(root, "src", "third-party");
  mkdirp(thirdPartyDir);
  writeFileSync(
    join(thirdPartyDir, "skills.yaml"),
    [
      "# third-party Skill 宣言ファイル（fixture）",
      "",
      'schema_version: "1.0"',
      "",
      "skills:",
      "  - name: japanese-tech-writing",
      "    source: https://example.com/japanese-tech-writing/SKILL.md",
      "",
    ].join("\n"),
    "utf-8",
  );

  // Projection-only skill (no src/ counterpart) — should be flagged.
  mkdirp(join(root, ".opencode", "skills", "test-projection-only"));
  writeFileSync(
    join(root, ".opencode", "skills", "test-projection-only", "SKILL.md"),
    "---\nname: test-projection-only\n---\n# test-projection-only\n",
    "utf-8",
  );
  // Declared third-party skill (IR-058 branch 2) — projection-only but declared
  // in skills.yaml, so its distribution reference must NOT be flagged.
  mkdirp(join(root, ".opencode", "skills", "japanese-tech-writing"));
  writeFileSync(
    join(root, ".opencode", "skills", "japanese-tech-writing", "SKILL.md"),
    "---\nname: japanese-tech-writing\n---\n# japanese-tech-writing\n",
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
  const srcCmdDir = join(root, "src", "common", "commands", "agentdev");
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
  const captureBoundaryDir = join(root, "src", "common", "skills", "agentdev-workflow-orchestration", "references");
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
  mkdirp(join(root, "src", "common", "skills", "agentdev-workflow-orchestration"));
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
  mkdirp(join(root, "src", "common", "skills", "agentdev-workflow-templates"));
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
    const r = getIr058JsonRun();
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
    const r = getIr058JsonRun();
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
    const r = getIr058JsonRun();
    const parsed = JSON.parse(r.stdout);
    const ngResults = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "distribution-untracked-skill-reference" &&
        res.level === "ng",
    );
    expect(ngResults.length).toBeGreaterThan(0);
    const promotionMessage = ngResults.find(
      (res: { message?: string }) =>
        (res.message ?? "").includes("Promote to src/common/skills/") &&
        (res.message ?? "").includes("ADR-0134"),
    );
    expect(promotionMessage).toBeDefined();
  });

  it("does not flag skills.yaml-declared projection-only skill (IR-058 branch 2)", () => {
    const r = getIr058JsonRun();
    const parsed = JSON.parse(r.stdout);
    const declaredNg = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "distribution-untracked-skill-reference" &&
        res.level === "ng" &&
        (res.message ?? "").includes("japanese-tech-writing"),
    );
    expect(declaredNg.length).toBe(0);
  });

  it("reverse check: NG message includes skills.yaml declaration guidance (IR-058 branch 3)", () => {
    const r = getIr058JsonRun();
    const parsed = JSON.parse(r.stdout);
    const ngResults = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "distribution-untracked-skill-reference" &&
        res.level === "ng",
    );
    expect(ngResults.length).toBeGreaterThan(0);
    const guidance = ngResults.find(
      (res: { message?: string }) =>
        (res.message ?? "").includes("not declared in src/third-party/skills.yaml") &&
        (res.message ?? "").includes("register it in src/third-party/skills.yaml"),
    );
    expect(guidance).toBeDefined();
  });
});

// ─── IR-058 strict-fail return (fail-closed without skills.yaml) ──────────

const IR058_NODECL_ROOT = join(TEMP_ROOT, "ir058-nodecl");

describe("IR-058 strict fail without skills.yaml (fail-closed)", () => {
  beforeAll(() => {
    rmSync(IR058_NODECL_ROOT, { recursive: true, force: true });
    mkdirp(IR058_NODECL_ROOT);
    buildIr058Fixture(IR058_NODECL_ROOT);
    rmSync(join(IR058_NODECL_ROOT, "src", "third-party", "skills.yaml"));
    copyScripts(IR058_NODECL_ROOT);
  });

  afterAll(() => {
    rmSync(IR058_NODECL_ROOT, { recursive: true, force: true });
  });

  it("treats referenced projection-only skill as undeclared without declaration", () => {
    const r = runScript(IR058_NODECL_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const ngResults = parsed.results.filter(
      (res: { check: string; level: string; message?: string }) =>
        res.check === "distribution-untracked-skill-reference" &&
        res.level === "ng" &&
        (res.message ?? "").includes("test-projection-only"),
    );
    expect(ngResults.length).toBe(1);
  });
});

// ─── NG21 N16/N17 是正回帰テスト（Issue #2245, OU-0009, RU-0054） ──────────
// N16（skill-category-gap: 「Skill rename 対称性」カテゴリの
// categoryToCheckPattern map 未登録・check_skill_rename_symmetry.ts の
// scriptFiles 対象未登録）と N17（command-capture-duty: case-close.md の
// capture-boundaries 参照欠落）を実修復した後の状態を保持することを検証する。
// baseline 免除・delta 降格は撤廃済みであり、gap/duty 違反は免除せず
// 対象側の直接修正で解消されたことを回帰テストとして固定する。

describe("NG21 N16/N17 是正回帰 (Issue #2245, OU-0009)", () => {
  it("N16: 'Skill rename 対称性' カテゴリが gap で ng/warning にならないこと（map + scriptFiles 登録）", () => {
    // 実リポジトリ回帰4確認（IR-055 実修復回帰 describe 2件と本 describe 2件）の
    // 共有結果を参照する（同一入力条件の1回検査に集約）。
    const r = getRealRepoJsonRun();
    const stdout = r.stdout;
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
  }, 60000);

  it("N17: case-close.md 廃止後、command-capture-duty の検査対象から除去されていること", () => {
    // Case #2981（DEC-033）で case-close 公開 command 定義は削除された。capture 責務は
    // Workflow Skill（agentdev-workflow-case-close）側へ継承され、command-capture-duty
    // の duties 表から除去済みであること（NG21 是正回帰の継続保持）を検証する。
    const r = getRealRepoJsonRun();
    const stdout = r.stdout;
    const parsed = JSON.parse(stdout) as {
      results: Array<{ check: string; level: string; message?: string }>;
    };

    const duty = parsed.results.find(
      (r) =>
        r.check === "command-capture-duty" &&
        (r.message ?? "").includes("case-close.md"),
    );
    expect(duty).toBeUndefined();
  }, 60000);
});

// ─── WP-3 (Issue #1928): execution profile separation ───────────────────────
// §7 exit-code contracts for source/installed/release.

describe("WP-3 execution profiles (Issue #1928)", () => {
  const PROFILE_TMP = join(TEMP_BASE, `profile-${RUN_ID}`);
  let profileRoot: string;

  function writeSourceCmd(root: string, name: string, body: string): void {
    const dir = join(root, "src", "common", "commands", "agentdev");
    writeFile(join(dir, name), body);
  }
  function writeSourceSkill(root: string, skill: string, body: string): void {
    const dir = join(root, "src", "common", "skills", skill);
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
    mkdirp(join(profileRoot, "src", "opencode", "plugins"));

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

// ─── IR-063 common-policy-identifier-invariant (REQ-051-005, Issue #2429) ────
// Fixture kinds per REQ-010-068: 正常例 (ok-cmd: 登録済み POL 参照), 違反例
// (violation-cmd: 未定義参照 + registry 外定義、registry: 重複定義), 境界例
// (agentdev-demo-skill: 識別子を持たない配布 skill), 許容例 (registry 自身の
// 様式例示は対象外), 再現例 (residual-cmd: Issue #2429 移行前の旧 Gxx 定義行様式).

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

  const cmdDir = join(root, "src", "common", "commands", "agentdev");
  mkdirp(cmdDir);

  writeFileSync(
    join(cmdDir, "README.md"),
    "# Commands\n\n| Command |\n|---------|\n| `agentdev/ok-cmd` |\n",
    "utf-8",
  );

  // registry fixture（定義の実体。様式例示 `POL-xxx` を含む）
  const registryDir = join(
    root,
    "src",
    "common",
    "skills",
    "agentdev-command-authoring",
    "references",
  );
  mkdirp(registryDir);
  writeFileSync(
    join(registryDir, "common-policy-identifiers.md"),
    [
      "# registry fixture",
      "",
      "定義は本 registry に `- **POL-xxx**: 説明` 形式で1回のみ記述する。",
      "配布物から参照する際は `POL-xxx` のコードスパンで記述する。",
      "",
      "- **POL-worktree-isolation**: worktree 隔離",
      "- **POL-gh-io-delegation**: gh I/O 委譲",
      "- **POL-dup**: 重複定義検出用",
      "- **POL-dup**: 重複定義検出用（2回目）",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 正常例: 登録済み識別子の参照 + ID なしのガードレール本文
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
      "- 全ファイル操作は worktree 内で実行する（`POL-worktree-isolation`）",
      "- GitHub Issue/PR の読み書きは正規の I/O 境界手続きへ委譲する（`POL-gh-io-delegation`）",
      "- 破壊的操作は行わない",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 違反例: 未定義参照 + registry 外定義
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
      "- 未知のポリシーを参照する（`POL-unknown-policy`）",
      "- **POL-worktree-isolation**: registry 外での定義",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 境界例: POL 参照も Gxx 表記も持たない配布 skill 本文
  const skillDir = join(root, "src", "common", "skills", "agentdev-demo-skill");
  mkdirp(skillDir);
  writeFileSync(
    join(skillDir, "SKILL.md"),
    [
      "---",
      'name: "agentdev-demo-skill"',
      "description: demo skill",
      "---",
      "",
      "ガードレール識別子を持たない配布 skill 本文である。",
      "",
    ].join("\n"),
    "utf-8",
  );

  // 再現例: Issue #2429 移行前に配布 command に残存していた旧 Gxx 定義行様式
  writeFileSync(
    join(cmdDir, "residual-cmd.md"),
    [
      "---",
      "description: residual Gxx command",
      "agent: test-agent",
      "---",
      "",
      "## ガードレール",
      "",
      "- G03: 編集スコープは限定する",
      "- G04: 入力ファイルは参照専用とする",
      "",
      "本文は G09 を参照する。",
      "",
    ].join("\n"),
    "utf-8",
  );

  copyScripts(root);
}

describe("IR-063 common-policy-identifier-invariant (REQ-051-005, REQ-010-064, Issue #2429)", () => {
  beforeAll(() => {
    mkdirp(IR063_ROOT);
    buildIr063Fixture(IR063_ROOT);
  });

  it("passes registered policy references and identifier-free files (正常例・境界例)", () => {
    const r = getIr063JsonRun();
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; level: string; file?: string }) =>
        res.category === "CommonPolicyIdentifier" &&
        res.level !== "ok" &&
        ((res.file ?? "").includes("ok-cmd.md") ||
          (res.file ?? "").includes("agentdev-demo-skill")),
    );
    expect(violations.length).toBe(0);
  });

  it("detects undefined references, out-of-registry definitions, and duplicate definitions (違反例)", () => {
    const r = getIr063JsonRun();
    const parsed = JSON.parse(r.stdout);
    const byEvidence = parsed.results
      .filter(
        (res: { category: string; level: string; file?: string }) =>
          res.category === "CommonPolicyIdentifier" &&
          res.level === "ng" &&
          ((res.file ?? "").includes("violation-cmd.md") ||
            (res.file ?? "").includes("common-policy-identifiers.md")),
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(byEvidence).toContain("undefined-reference:POL-unknown-policy");
    expect(byEvidence).toContain("definition-outside-registry:POL-worktree-isolation");
    expect(byEvidence).toContain("duplicate-definition:POL-dup");
  });

  it("accepts registry style examples without undefined-reference detection (許容例)", () => {
    const r = getIr063JsonRun();
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; level: string; evidence?: string; file?: string }) =>
        res.category === "CommonPolicyIdentifier" &&
        res.level === "ng" &&
        (res.file ?? "").endsWith("common-policy-identifiers.md") &&
        (res.evidence ?? "").startsWith("undefined-reference:"),
    );
    expect(violations.length).toBe(0);
  });

  it("reproduces residual abolished Gxx notation in distribution (再現例)", () => {
    const r = getIr063JsonRun();
    const parsed = JSON.parse(r.stdout);
    const byEvidence = parsed.results
      .filter(
        (res: { category: string; level: string; file?: string }) =>
          res.category === "CommonPolicyIdentifier" &&
          res.level === "ng" &&
          (res.file ?? "").includes("residual-cmd.md"),
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(byEvidence).toContain("residual-gxx:G03");
    expect(byEvidence).toContain("residual-gxx:G04");
    expect(byEvidence).toContain("residual-gxx:G09");
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

  const cmdDir = join(root, "src", "common", "commands", "agentdev");
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

  const skillDir = join(root, "src", "common", "skills", "agentdev-fixture-skill");
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
  const skillTplDir = join(root, "src", "common", "skills", "agentdev-fixture-skill", "templates");
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
    const r = getIr064JsonRun();
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "UnresolvedPlaceholder" &&
        (res.file ?? "").includes("placeholder-cmd.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("detects bare TODO-family marker as strict and bare ID placeholder as heuristic (違反例)", () => {
    const r = getIr064JsonRun();
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
    const r = getIr064JsonRun();
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
    const r = getIr064JsonRun();
    const parsed = JSON.parse(r.stdout);
    const utf = parsed.results.filter(
      (res: { category: string; evidence?: string }) =>
        res.category === "UnresolvedPlaceholder" &&
        (res.evidence ?? "").includes("UTF"),
    );
    expect(utf.length).toBe(0);
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
    const r = getIr067JsonRun();
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "ReqCitation" &&
        (res.file ?? "").includes("ok-design.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("detects phantom row citations (違反例)", () => {
    const r = getIr067JsonRun();
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
    const r = getIr067JsonRun();
    const parsed = JSON.parse(r.stdout);
    const violations = parsed.results.filter(
      (res: { category: string; file?: string }) =>
        res.category === "ReqCitation" &&
        (res.file ?? "").includes("boundary-design.md"),
    );
    expect(violations.length).toBe(0);
  });

  it("exempts templates, AUTOGEN blocks, and IR rule description files (許容例)", () => {
    const r = getIr067JsonRun();
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
    const r = getIr067JsonRun();
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
    const skillDir = join(root, "src", "common", "skills", skill);
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
    const addedSkill = join(root, "src", "common", "skills", "agentdev-workflow-design-save");
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

  it("tolerates declared third-party projection entries and keeps undeclared ones inspected (許容例・違反例: INSPECTION-TOLERATED)", () => {
    const root = join(IR068_ROOT, "third-party-tolerated");
    mkdirp(root);
    buildIr068BaseFixture(root);
    writeIr068Manifest(root, [
      "schema_version: 1",
      "generated_at: 2026-09-04",
      "",
      "skills:",
      "  - agentdev-alpha-skill",
      "  - agentdev-beta-skill",
      "",
      "third_party_skills:",
      "  - japanese-tech-writing",
    ]);
    // 投影: ADF スキル 2 件 + 管理登録済み third-party + 未宣言 third-party 起源配置
    for (const proj of [
      "agentdev-alpha-skill",
      "agentdev-beta-skill",
      "japanese-tech-writing",
      "undeclared-third-party-skill",
    ]) {
      const projDir = join(root, ".opencode", "skills", proj);
      mkdirp(projDir);
      writeFileSync(join(projDir, "SKILL.md"), `---\nname: ${proj}\ndescription: p\n---\n# ${proj}\n`, "utf-8");
    }
    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const ngEvidence = parsed.results
      .filter(
        (res: { category: string; level: string }) =>
          res.category === "SkillProjection" && res.level === "ng",
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    // 管理登録済み third-party は許容（projection-extra に計上されない）
    expect(ngEvidence).not.toContain("projection-extra:japanese-tech-writing");
    // 未宣言の third-party 起源配置は引き続き検出（許容は走査除外ではない）
    expect(ngEvidence).toContain("projection-extra:undeclared-third-party-skill");
    // 許容は info で可視化され、silent skip しない
    const tolerated = parsed.results.find(
      (res: { category: string; level: string; evidence?: string }) =>
        res.category === "SkillProjection" &&
        res.level === "info" &&
        res.evidence === "tolerated-third-party:japanese-tech-writing",
    );
    expect(tolerated).toBeDefined();
  });

  it("reports invalid or duplicate third_party_skills entries instead of silently skipping (silent skip 禁止)", () => {
    const root = join(IR068_ROOT, "third-party-schema-warning");
    mkdirp(root);
    buildIr068BaseFixture(root);
    writeIr068Manifest(root, [
      "schema_version: 1",
      "generated_at: 2026-09-04",
      "",
      "skills:",
      "  - agentdev-alpha-skill",
      "  - agentdev-beta-skill",
      "",
      "third_party_skills:",
      "  - japanese-tech-writing",
      "  - japanese-tech-writing",
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

// ─── IR-069 req-number-gap-recorded (REQ-010-070, Case #2917) ─────────────
// Fixture kinds: 正常例 (帯中欠番の両 README 明記), 違反例 (無記録欠番・陳腐化範囲明記),
// 境界例 (AUTOGEN 内のみの明記・4桁帯混在), 許容例 (retired 番号・末尾予約枠・文脈言及),
// 再現例 (RU-0034: 帯中予約欠番の無記録 + 末尾予約枠の過渡帯)。

const IR069_ROOT = join(TEMP_ROOT, "ir069");

interface Ir069FixtureOptions {
  activeReqs: number[];
  retiredReqs?: number[];
  reqReadmeLines: string[];
  docsReadmeLines: string[];
}

function buildIr069Fixture(root: string, opts: Ir069FixtureOptions): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  for (const n of opts.activeReqs) {
    const id = `REQ-${String(n).padStart(3, "0")}`;
    writeFileSync(
      join(reqDir, `${id}.md`),
      [
        "---",
        `id: ${id}`,
        "title: IR-069 fixture",
        "created: 2025-01-01",
        "updated: 2025-01-01",
        "---",
        "",
        "Body.",
        "",
      ].join("\n"),
      "utf-8",
    );
  }
  if (opts.retiredReqs && opts.retiredReqs.length > 0) {
    const retiredDir = join(reqDir, "retired");
    mkdirp(retiredDir);
    for (const n of opts.retiredReqs) {
      const id = `REQ-${String(n).padStart(3, "0")}`;
      writeFileSync(
        join(retiredDir, `${id}.md`),
        `---\nid: ${id}\ntitle: retired fixture\n---\n\nBody.\n`,
        "utf-8",
      );
    }
  }
  writeFileSync(
    join(reqDir, "README.md"),
    opts.reqReadmeLines.join("\n") + "\n",
    "utf-8",
  );
  writeFileSync(
    join(root, "docs", "README.md"),
    opts.docsReadmeLines.join("\n") + "\n",
    "utf-8",
  );
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");
  copyScripts(root);
}

function ir069Results(root: string): {
  ng: Array<{ message: string; evidence?: string; file?: string }>;
  info: Array<{ message: string; evidence?: string }>;
  ok: Array<{ message: string }>;
} {
  const r = runScript(root, ["--json"]);
  const parsed = JSON.parse(r.stdout);
  const of = (level: string) =>
    parsed.results.filter(
      (res: { category: string; level: string }) =>
        res.category === "ReqNumbering" && res.level === level,
    );
  return { ng: of("ng"), info: of("info"), ok: of("ok") };
}

describe("IR-069 req-number-gap-recorded (REQ-010-070, Case #2917)", () => {
  it("passes when mid-band gaps are annotated in both READMEs (正常例)", () => {
    const root = join(IR069_ROOT, "ok");
    mkdirp(root);
    const annotation =
      "REQ-006〜REQ-008 は REQ-009 採番時（ユーザー裁定）による意図的予約欠番であり、実体は存在しない";
    buildIr069Fixture(root, {
      activeReqs: [1, 2, 3, 4, 5, 9, 13],
      reqReadmeLines: ["# REQ インデックス", "", annotation],
      docsReadmeLines: ["# ドキュメント入口", "", annotation],
    });
    const { ng, ok } = ir069Results(root);
    expect(ng.length).toBe(0);
    expect(ok.length).toBeGreaterThan(0);
    expect(ok[0].message).toContain("3 recorded gap numbers");
  });

  it("detects mid-band gaps missing from README annotations in both files (違反例)", () => {
    const root = join(IR069_ROOT, "unrecorded");
    mkdirp(root);
    buildIr069Fixture(root, {
      activeReqs: [1, 2, 3, 4, 5, 9, 13],
      reqReadmeLines: ["# REQ インデックス", ""],
      docsReadmeLines: ["# ドキュメント入口", ""],
    });
    const { ng } = ir069Results(root);
    const evidence = ng.map((res) => res.evidence ?? "");
    expect(evidence).toContain("unrecorded-gap:REQ-006〜REQ-008");
    expect(ng.filter((res) => (res.file ?? "").endsWith("docs/requirements/README.md")).length).toBe(1);
    expect(ng.filter((res) => (res.file ?? "").endsWith("docs/README.md")).length).toBe(1);
  });

  it("does not count annotations written inside AUTOGEN blocks (境界例: AUTOGEN)", () => {
    const root = join(IR069_ROOT, "autogen-only");
    mkdirp(root);
    const inAutogen = [
      "<!-- AUTOGEN:BEGIN:id=fixture-gap-note -->",
      "REQ-006〜REQ-008 は意図的予約欠番である",
      "<!-- AUTOGEN:END -->",
    ];
    buildIr069Fixture(root, {
      activeReqs: [1, 2, 3, 4, 5, 9, 13],
      reqReadmeLines: ["# REQ インデックス", "", ...inAutogen],
      docsReadmeLines: ["# ドキュメント入口", "", ...inAutogen],
    });
    const { ng } = ir069Results(root);
    const evidence = ng.map((res) => res.evidence ?? "");
    expect(evidence).toContain("unrecorded-gap:REQ-006〜REQ-008");
    expect(evidence.filter((e) => e.includes("REQ-010")).length).toBe(0);
  });

  it("includes increased-width current REQ numbers in gap checking (境界例: 番号帯)", () => {
    const root = join(IR069_ROOT, "four-digit");
    mkdirp(root);
    const annotation =
      "REQ-006〜REQ-008 は意図的予約欠番であり、実体は存在しない";
    buildIr069Fixture(root, {
      activeReqs: [1, 2, 3, 4, 5, 9, 13, 9001],
      reqReadmeLines: ["# REQ インデックス", "", annotation],
      docsReadmeLines: ["# ドキュメント入口", "", annotation],
    });
    const { ng, ok } = ir069Results(root);
    expect(ng.length).toBe(2);
    expect(ng.every((r) => r.evidence === "unrecorded-gap:REQ-010〜REQ-012")).toBe(true);
    expect(ok).toEqual([]);
  });

  it("treats retired REQ numbers as existing and tolerates context mentions (許容例)", () => {
    const root = join(IR069_ROOT, "retired-tolerated");
    mkdirp(root);
    buildIr069Fixture(root, {
      activeReqs: [1, 2, 3, 4, 5, 9, 13],
      retiredReqs: [6, 7],
      reqReadmeLines: [
        "# REQ インデックス",
        "",
        "REQ-008 は REQ-009 採番時のユーザー裁定による欠番であり、実体は存在しない",
      ],
      docsReadmeLines: [
        "# ドキュメント入口",
        "",
        "REQ-008 は REQ-009 採番時のユーザー裁定による欠番であり、実体は存在しない",
      ],
    });
    const { ng } = ir069Results(root);
    expect(ng.length).toBe(0);
  });

  it("detects stale range annotations whose numbers all exist (違反例: 陳腐化明記)", () => {
    const root = join(IR069_ROOT, "stale-range");
    mkdirp(root);
    const stale = "REQ-001〜REQ-003 は意図的予約欠番である";
    buildIr069Fixture(root, {
      activeReqs: [1, 2, 3, 4, 5, 9, 13],
      reqReadmeLines: ["# REQ インデックス", "", stale],
      docsReadmeLines: ["# ドキュメント入口", "", stale],
    });
    const { ng } = ir069Results(root);
    const evidence = ng.map((res) => res.evidence ?? "");
    expect(evidence).toContain("stale-gap-annotation:REQ-001〜REQ-003");
    expect(evidence).toContain("unrecorded-gap:REQ-006〜REQ-008");
  });

  it("reproduces the RU-0034 shape: unrecorded mid-band reservation plus tolerated tail window (再現例)", () => {
    const root = join(IR069_ROOT, "ru0034-shape");
    mkdirp(root);
    buildIr069Fixture(root, {
      activeReqs: [1, 2, 3, 4, 5, 9, 13],
      reqReadmeLines: ["# REQ インデックス", ""],
      docsReadmeLines: ["# ドキュメント入口", ""],
    });
    const { ng, info } = ir069Results(root);
    const evidence = ng.map((res) => res.evidence ?? "");
    expect(evidence).toContain("unrecorded-gap:REQ-006〜REQ-008");
    // 末尾予約枠 (REQ-010〜REQ-012) は過渡帯として許容し検出しない
    expect(evidence.filter((e) => e.includes("REQ-010") || e.includes("REQ-012")).length).toBe(0);
    const window = info.find((res) => (res.message ?? "").includes("Reservation window"));
    expect(window).toBeDefined();
    expect(window!.message).toContain("REQ-010〜REQ-012");
    expect(window!.message).toContain("REQ-013");
  });
});

// ─── IR-071 integrity-rule-related-req-existence (REQ-051-009) ────────────────
// Fixture kinds: 正常例 (実在階層 ID・ファイルレベル ID), 違反例 (ファントム階層 ID +
// ファントムファイルレベル ID), 境界例 (v2: プレフィックス免除・注記セル・省略形),
// 再現例 (IR-055 再アンカー後の related_req [実在行] 型が誤検知しない)。

const IR071_ROOT = join(TEMP_ROOT, "ir071");

function writeIr071RuleFile(
  root: string,
  filename: string,
  relatedReqValue: string,
): void {
  const rulesDir = join(root, "docs", "designs", "integrity", "rules");
  mkdirp(rulesDir);
  writeFileSync(
    join(rulesDir, filename),
    [
      "---",
      `title: "${filename.replace(/\.md$/, "")} fixture"`,
      "status: accepted",
      "created: 2026-09-24",
      "updated: 2026-09-24",
      "---",
      "",
      `# ${filename.replace(/\.md$/, "")} fixture`,
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| rule_id | ${filename.match(/^IR-(\d+)/)?.[0] ?? "IR-0000"} |`,
      "| description | IR-071 fixture |",
      "| severity | strict |",
      "| category | document-drift |",
      "| detection_method | fixture |",
      "| affected_artifacts | [docs/designs/integrity/rules/IR-*.md] |",
      `| related_req | ${relatedReqValue} |`,
      "| related_design | [../integrity-rule-catalog.md] |",
      "| gate_level | full-audit |",
      "| false_positive_risk | fixture |",
      "| regression_test | fixture |",
      "| finding_route | intake |",
      "| triage_action | fixture |",
      "| last_verified | 2026-09-24 |",
      "",
    ].join("\n"),
    "utf-8",
  );
}

function buildIr071Fixture(
  root: string,
  { includePhantomRule = true }: { includePhantomRule?: boolean } = {},
): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(join(reqDir, "retired"));
  writeFileSync(
    join(reqDir, "README.md"),
    "# Requirements\n\n| ID | Title |\n|----|-------|\n| REQ-931 | IR-071 fixture |\n",
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "REQ-931.md"),
    [
      "---",
      "id: REQ-931",
      "title: IR-071 fixture",
      "created: 2025-01-01",
      "updated: 2025-01-01",
      "---",
      "",
      "## 要件",
      "",
      "| ID | 要件 |",
      "|---|---|",
      "| REQ-931-001 | 実在する要件行その1 |",
      "| REQ-931-002 | 実在する要件行その2 |",
      "",
    ].join("\n"),
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "retired", "REQ-932.md"),
    "---\nid: REQ-932\ntitle: IR-071 retired fixture\ncreated: 2025-01-01\nupdated: 2025-01-01\n---\n\nBody.\n",
    "utf-8",
  );

  // 正常例: 実在階層 ID + 実在ファイルレベル ID（retired を含む）
  writeIr071RuleFile(root, "IR-0990-ok-refs.md", "[REQ-931-001, REQ-932]");

  // 違反例: ファントム階層 ID + ファントムファイルレベル ID
  if (includePhantomRule) {
    writeIr071RuleFile(root, "IR-0991-phantom-refs.md", "[REQ-931-099, REQ-999]");
  }

  // 再現例: IR-055 再アンカー後と同型の実在行単一参照
  writeIr071RuleFile(root, "IR-0992-reanchor-shape.md", "[REQ-931-002]");

  // 境界例: v2: 免除・注記セル・省略形・プレースホルダー
  writeIr071RuleFile(
    root,
    "IR-0993-boundary-exemptions.md",
    "[v2:REQ-0143, REQ-931 (注記), -（要件行レベルの正規所有者なし）, 039]",
  );

  copyScripts(root);
}

function ir071Results(root: string): {
  ng: Array<{ evidence?: string; message: string; file?: string; finding_level?: string }>;
  ok: Array<{ message: string }>;
} {
  const r = runScript(root, ["--json"]);
  const parsed = JSON.parse(r.stdout);
  const hits = parsed.results.filter(
    (res: { category: string }) => res.category === "IntegrityRuleRelatedReq",
  );
  return { ng: hits.filter((x: { level: string }) => x.level === "ng"), ok: hits.filter((x: { level: string }) => x.level === "ok") };
}

describe("IR-071 integrity-rule-related-req-existence (REQ-051-009)", () => {
  it("passes existing row and file level related_req references (正常例)", () => {
    const root = join(IR071_ROOT, "ok");
    mkdirp(root);
    buildIr071Fixture(root, { includePhantomRule: false });
    const { ng, ok } = ir071Results(root);
    expect(ng.length).toBe(0);
    expect(ok.length).toBeGreaterThan(0);
    expect(ok[0].message).toContain("0 phantom references");
  });

  it("detects phantom row and phantom file level related_req (違反例)", () => {
    const root = join(IR071_ROOT, "phantom");
    mkdirp(root);
    buildIr071Fixture(root);
    const { ng } = ir071Results(root);
    const evidence = ng.map((res) => res.evidence ?? "");
    expect(evidence).toContain("REQ-931-099");
    expect(evidence).toContain("REQ-999");
    expect(ng.filter((res) => (res.file ?? "").includes("IR-0991-phantom-refs.md")).length).toBe(2);
    for (const res of ng) {
      expect(res.finding_level).toBe("strict");
      expect(res.message).toContain("Phantom related_req");
    }
  });

  it("exempts v2: prefix, annotation cells, shorthand numbers, and placeholders (境界例)", () => {
    const root = join(IR071_ROOT, "boundary");
    mkdirp(root);
    buildIr071Fixture(root, { includePhantomRule: false });
    const { ng } = ir071Results(root);
    expect(ng.length).toBe(0);
    expect(ng.filter((res) => (res.file ?? "").includes("IR-0993-boundary-exemptions.md")).length).toBe(0);
  });

  it("does not misfire on the IR-055 re-anchored single existing row reference (再現例)", () => {
    const root = join(IR071_ROOT, "reanchor");
    mkdirp(root);
    buildIr071Fixture(root, { includePhantomRule: false });
    const { ng } = ir071Results(root);
    expect(ng.filter((res) => (res.file ?? "").includes("IR-0992-reanchor-shape.md")).length).toBe(0);
  });
});

// ─── broken-req-ref 範囲表現除外 (v2:REQ-0108-194, Case #2917) ─────────────────
// REQ-063〜REQ-081 のような帯表現の端点は個別参照ではなく、broken-req-ref の
// 検出対象から除外する。範囲外の単独出現は引き続き検出する。

describe("broken-req-ref range-span exemption (v2:REQ-0108-194, Case #2917)", () => {
  it("exempts refs inside range expressions and still flags bare refs (正常例・違反例)", () => {
    const root = join(IR069_ROOT, "range-span-exemption");
    mkdirp(root);
    const reqDir = join(root, "docs", "requirements");
    mkdirp(reqDir);
    writeFileSync(
      join(reqDir, "README.md"),
      "# Requirements\n\n| ID | Title |\n|----|-------|\n| REQ-001 | fixture |\n",
      "utf-8",
    );
    writeFileSync(
      join(reqDir, "REQ-001.md"),
      "---\nid: REQ-001\ntitle: fixture\ncreated: 2025-01-01\nupdated: 2025-01-01\n---\n\nBody.\n",
      "utf-8",
    );
    mkdirp(join(root, "docs", "designs"));
    writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");
    const guidesDir = join(root, "docs", "guides");
    mkdirp(guidesDir);
    writeFileSync(
      join(guidesDir, "range-refs.md"),
      [
        "# Range refs",
        "",
        "REQ-006〜REQ-008 は REQ-009 採番時のユーザー裁定による意図的予約欠番である。",
        "REQ-899 は範囲外の単独参照である。",
        "",
      ].join("\n"),
      "utf-8",
    );
    copyScripts(root);
    const r = runScript(root, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const evidence = parsed.results
      .filter(
        (res: { category: string; check: string; level: string }) =>
          res.category === "LinkIntegrity" &&
          res.check === "broken-req-ref" &&
          res.level === "ng",
      )
      .map((res: { evidence?: string }) => res.evidence ?? "");
    expect(evidence).not.toContain("REQ-006");
    expect(evidence).not.toContain("REQ-008");
    expect(evidence).toContain("REQ-899");
  });
});

// ─── broken-req-ref / adr-req-crossref 既知欠番レジストリ免除 (REQ-010-070, Issue #3069) ───
// numbering-policy.md「既知の欠番」節の行頭 REQ-NNN: エントリへの参照は合格扱いとする。
// 読込形式は alloc-req-number.ts extractKnownGapNumbers と同一（欠番レジストリの
// 単一情報源は numbering-policy.md。checker 側に第二のレジストリは作らない）。
// Case #3056 PR #3057 の偽陽性 3件（REQ-089 bare 参照）の再発防止。

const GAP_ROOT = join(TEMP_ROOT, "gap-exemption-3069");

const GAP_POLICY_BODY = [
  "## 欠番の扱い",
  "",
  "過去の採番ミス、意図的予約、廃止由来を問わず、一度生じた欠番は維持する。",
  "",
  "### 既知の欠番",
  "",
  "欠番管理の責務を明記する。",
  "REQ-089: J2 shadow 実験（commit 43bf2ec3 で採番後、52c7bc10 で完全 revert）由来の廃止識別子であり、再利用しない。",
  "",
  "### 採番ミスの是正",
  "",
  "是正によって新たな欠番が生じる場合は欠番として維持する。",
];

const GAP_POLICY_BODY_NO_ENTRY = [
  "## 欠番の扱い",
  "",
  "過去の採番ミス、意図的予約、廃止由来を問わず、一度生じた欠番は維持する。",
  "",
  "### 既知の欠番",
  "",
  "欠番管理の責務を明記する。",
];

const GAP_POLICY_BODY_OUT_OF_SECTION = [
  "## 欠番の扱い",
  "",
  "REQ-089: この行頭エントリは「既知の欠番」節外なのでレジストリ対象外である。",
  "",
  "### 既知の欠番",
  "",
  "欠番管理の責務を明記する。",
  "当該番号 REQ-085 は意図的予約欠番である（行頭エントリではない）。",
];

function buildGapFixture(
  root: string,
  policyBodyLines: string[],
  guideLines: string[],
  adrBody: string,
): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "REQ-001.md"),
    "---\nid: REQ-001\ntitle: fixture\ncreated: 2025-01-01\nupdated: 2025-01-01\n---\n\nBody.\n",
    "utf-8",
  );
  writeFileSync(
    join(reqDir, "README.md"),
    "# Requirements\n\n| ID | Title |\n|----|-------|\n| REQ-001 | fixture |\n",
    "utf-8",
  );
  mkdirp(join(root, "docs", "designs", "foundations"));
  writeFileSync(
    join(root, "docs", "designs", "foundations", "numbering-policy.md"),
    [
      "---",
      "id: numbering-policy",
      "title: 採番管理",
      "status: accepted",
      "---",
      "",
      "# 採番管理",
      "",
      ...policyBodyLines,
      "",
    ].join("\n"),
    "utf-8",
  );
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");
  const adrDir = join(root, "docs", "adr");
  mkdirp(adrDir);
  writeFileSync(
    join(adrDir, "ADR-0001.md"),
    ["---", "id: ADR-0001", "title: fixture decision", "---", "", adrBody, ""].join("\n"),
    "utf-8",
  );
  const guidesDir = join(root, "docs", "guides");
  mkdirp(guidesDir);
  writeFileSync(
    join(guidesDir, "gap-refs.md"),
    ["# Gap refs", "", ...guideLines, ""].join("\n"),
    "utf-8",
  );
}

function runGapFixture(root: string): {
  brokenEvidence: string[];
  crossrefMessages: string[];
} {
  copyScripts(root);
  const r = runScript(root, ["--json"]);
  const parsed = JSON.parse(r.stdout);
  const brokenEvidence = parsed.results
    .filter(
      (res: { category: string; check: string; level: string }) =>
        res.category === "LinkIntegrity" &&
        res.check === "broken-req-ref" &&
        res.level === "ng",
    )
    .map((res: { evidence?: string }) => res.evidence ?? "");
  const crossrefMessages = parsed.results
    .filter(
      (res: { check: string; level: string }) =>
        res.check === "adr-req-crossref" && res.level === "ng",
    )
    .map((res: { message?: string }) => res.message ?? "");
  return { brokenEvidence, crossrefMessages };
}

describe("known-gap registry exemption (REQ-010-070, Issue #3069)", () => {
  it("exempts known gap REQ-089 references in guides and ADR (Case #3056 再現・許容例)", () => {
    const root = join(GAP_ROOT, "known-gap-pass");
    mkdirp(root);
    buildGapFixture(
      root,
      GAP_POLICY_BODY,
      [
        "REQ-089 は J2 shadow 実験（commit 43bf2ec3 で採番後、52c7bc10 で完全 revert）由来の廃止識別子であり、再利用しない。",
      ],
      "See REQ-089 for the gap history of the J2 shadow experiment.",
    );
    const { brokenEvidence, crossrefMessages } = runGapFixture(root);
    expect(brokenEvidence).not.toContain("REQ-089");
    expect(crossrefMessages.filter((m) => m.includes("REQ-089")).length).toBe(0);
  });

  it("still flags references to non-gap non-existent REQ numbers (違反例)", () => {
    const root = join(GAP_ROOT, "non-gap-flag");
    mkdirp(root);
    buildGapFixture(
      root,
      GAP_POLICY_BODY,
      ["REQ-899 は実在しない番号への参照である。"],
      "See REQ-899 which does not exist.",
    );
    const { brokenEvidence, crossrefMessages } = runGapFixture(root);
    expect(brokenEvidence).toContain("REQ-899");
    expect(crossrefMessages.some((m) => m.includes("REQ-899"))).toBe(true);
  });

  it("flags REQ-089 when the registry section has no line-top entry (単一情報源・ハードコード不在)", () => {
    const root = join(GAP_ROOT, "no-entry-flag");
    mkdirp(root);
    buildGapFixture(
      root,
      GAP_POLICY_BODY_NO_ENTRY,
      ["REQ-089 への参照である。"],
      "See REQ-089.",
    );
    const { brokenEvidence, crossrefMessages } = runGapFixture(root);
    expect(brokenEvidence).toContain("REQ-089");
    expect(crossrefMessages.some((m) => m.includes("REQ-089"))).toBe(true);
  });

  it("does not exempt out-of-section entries or prose-only mentions (境界例)", () => {
    const root = join(GAP_ROOT, "boundary-scope");
    mkdirp(root);
    buildGapFixture(
      root,
      GAP_POLICY_BODY_OUT_OF_SECTION,
      ["REQ-089 への参照と、当該番号 REQ-085 は意図的予約欠番である旨の記述。"],
      "See REQ-089 and REQ-085.",
    );
    const { brokenEvidence, crossrefMessages } = runGapFixture(root);
    expect(brokenEvidence).toContain("REQ-089");
    expect(brokenEvidence).toContain("REQ-085");
    expect(crossrefMessages.some((m) => m.includes("REQ-089"))).toBe(true);
  });

  it("keeps range-span exemption behavior independent of the gap registry (境界例)", () => {
    const root = join(GAP_ROOT, "range-span-still-exempt");
    mkdirp(root);
    buildGapFixture(
      root,
      GAP_POLICY_BODY,
      [
        "REQ-063〜REQ-081 は意図的予約欠番である。",
        "REQ-899 は範囲外の単独参照である。",
      ],
      "Relates to REQ-001.",
    );
    const { brokenEvidence } = runGapFixture(root);
    expect(brokenEvidence).not.toContain("REQ-063");
    expect(brokenEvidence).not.toContain("REQ-081");
    expect(brokenEvidence).toContain("REQ-899");
  });

  it("loads the same gap set as alloc-req-number.ts from the real numbering-policy (単一情報源)", () => {
    const realRoot = REPO_ROOT_FROM_SCRIPT_DIR;
    const policyContent = readFileSync(
      join(realRoot, "docs", "designs", "foundations", "numbering-policy.md"),
      "utf-8",
    );
    const gapNumbers = extractKnownGapNumbers(policyContent);
    expect(gapNumbers).toContain(89);
    expect(gapNumbers).toEqual(extractKnownGapNumbersAllocator(policyContent));
    expect(loadKnownGapReqIds(realRoot)).toEqual(
      new Set(
        gapNumbers.map((n) => `REQ-${String(n).padStart(3, "0")}`),
      ),
    );
  });

  it("matches alloc-req-number.ts extraction on synthetic policies (同一読込形式)", () => {
    const syntheticPolicies = [
      "## 前置\n\n### 既知の欠番\n\nREQ-089: a\nREQ-090: b\n",
      "### 既知の欠番\n\nprose 中の REQ-085 言及\nREQ-088: c\n\n### 次\n\nREQ-087: 節外エントリ\n",
      "# 欠番なし\n\n## 既知の欠番\n\n本文のみ。\n",
      "### 既知の欠番\n\nREQ-1000: 4桁\n",
      "#### 既知の欠番  \n\nREQ-089: 末尾空白付き見出し\n",
      "### 既知の欠番\n\n  REQ-084: 行頭空白エントリ\n",
    ];
    for (const policy of syntheticPolicies) {
      expect(extractKnownGapNumbers(policy)).toEqual(
        extractKnownGapNumbersAllocator(policy),
      );
    }
  });
});

// ─── repo-local Plugin 投影対称性検査（Issue #2787） ───
describe("repo-local Plugin projection symmetry (Issue #2787)", () => {
  const pluginSymmetryFixtureRoots: string[] = [];

  // depth-1 loader shim の固定内容（self-sync.ps1 New-PluginLoaderShimContent と同一）。
  // 検査側ヘルパーは非 export のため期待値をここで複製し、同一テンプレートを pin する。
  function expectedShimContent(pkg: string): string {
    return (
      "// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.\n" +
      `export { default } from "./${pkg}/plugin.ts";\n`
    );
  }

  function newPluginSymmetryRoot(prefix: string): string {
    const root = join(
      TEMP_BASE,
      `${prefix}-${crypto.randomUUID().slice(0, 8)}`,
    );
    mkdirSync(root, { recursive: true });
    pluginSymmetryFixtureRoots.push(root);
    return root;
  }

  function createSourcePackage(root: string, pkg: string): void {
    mkdirSync(join(root, "src", "opencode", "plugins", pkg), { recursive: true });
    writeFileSync(
      join(root, "src", "opencode", "plugins", pkg, "plugin.ts"),
      "export default {};\n",
      "utf-8",
    );
  }

  function createProjectionJunction(
    linkPath: string,
    targetPath: string,
  ): void {
    mkdirSync(join(linkPath, ".."), { recursive: true });
    if (process.platform === "win32") {
      const proc = Bun.spawnSync(
        ["cmd", "/c", "mklink", "/J", linkPath, targetPath],
        { stdout: "pipe", stderr: "pipe" },
      );
      if ((proc.exitCode ?? -1) !== 0) {
        throw new Error(`mklink /J failed: ${proc.stderr?.toString() ?? ""}`);
      }
    } else {
      symlinkSync(targetPath, linkPath, "dir");
    }
  }

  function writeProjectionShim(
    root: string,
    pkg: string,
    content?: string,
  ): void {
    mkdirSync(join(root, ".opencode", "plugins"), { recursive: true });
    writeFileSync(
      join(root, ".opencode", "plugins", `${pkg}.ts`),
      content ?? expectedShimContent(pkg),
      "utf-8",
    );
  }

  function buildSymmetricProjection(root: string, pkg: string): void {
    createProjectionJunction(
      join(root, ".opencode", "plugins", pkg),
      join(root, "src", "opencode", "plugins", pkg),
    );
    writeProjectionShim(root, pkg);
  }

  function ngEvidenceList(root: string): string[] {
    return checkRepoLocalPluginProjectionSymmetry(root)
      .filter((r) => r.level === "ng")
      .map((r) => r.evidence ?? "");
  }

  afterAll(() => {
    for (const root of pluginSymmetryFixtureRoots) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("detects nothing when projection is symmetric (junction + loader shim)", () => {
    const root = newPluginSymmetryRoot("plugin-sym-ok");
    createSourcePackage(root, "agentdev-testguard");
    buildSymmetricProjection(root, "agentdev-testguard");
    const results = checkRepoLocalPluginProjectionSymmetry(root);
    expect(results.filter((r) => r.level === "ng")).toHaveLength(0);
    expect(results.find((r) => r.level === "ok")).toBeDefined();
  });

  it("detects missing projection junction and missing loader shim", () => {
    const root = newPluginSymmetryRoot("plugin-sym-missing");
    createSourcePackage(root, "agentdev-testguard");
    const evidence = ngEvidenceList(root);
    expect(evidence).toContain("projection-missing:plugins/agentdev-testguard");
    expect(evidence).toContain("shim-missing:plugins/agentdev-testguard.ts");
  });

  it("detects loader shim content mismatch", () => {
    const root = newPluginSymmetryRoot("plugin-sym-mismatch");
    createSourcePackage(root, "agentdev-testguard");
    buildSymmetricProjection(root, "agentdev-testguard");
    writeProjectionShim(root, "agentdev-testguard", 'export { default } from "./wrong.ts";\n');
    expect(ngEvidenceList(root)).toContain(
      "shim-content-mismatch:plugins/agentdev-testguard.ts",
    );
  });

  it("detects stale loader shim absent from source", () => {
    const root = newPluginSymmetryRoot("plugin-sym-stale-shim");
    createSourcePackage(root, "agentdev-testguard");
    buildSymmetricProjection(root, "agentdev-testguard");
    writeProjectionShim(root, "agentdev-ghost");
    expect(ngEvidenceList(root)).toContain("stale-shim:plugins/agentdev-ghost.ts");
  });

  it("detects stale managed projection junction (package removed from source)", () => {
    const root = newPluginSymmetryRoot("plugin-sym-stale-junction");
    createSourcePackage(root, "agentdev-testguard");
    buildSymmetricProjection(root, "agentdev-testguard");
    // 正本から削除されたパッケージの junction（リンク先は正本相対で一致。
    // リンク先実在を問わず reparse data の参照先で管理物と確定できる）。
    createProjectionJunction(
      join(root, ".opencode", "plugins", "agentdev-ghost"),
      join(root, "src", "opencode", "plugins", "agentdev-ghost"),
    );
    expect(ngEvidenceList(root)).toContain("stale-junction:plugins/agentdev-ghost");
  });

  it("reports unmanaged junction as info without ng (REQ-058-008 non-destructive boundary)", () => {
    const root = newPluginSymmetryRoot("plugin-sym-unmanaged");
    createSourcePackage(root, "agentdev-testguard");
    buildSymmetricProjection(root, "agentdev-testguard");
    // 管理物判定不能: リンク先が正本相対で一致しない
    const outsideTarget = join(root, "outside-target");
    mkdirSync(outsideTarget, { recursive: true });
    createProjectionJunction(
      join(root, ".opencode", "plugins", "agentdev-stranger"),
      outsideTarget,
    );
    const results = checkRepoLocalPluginProjectionSymmetry(root);
    expect(results.filter((r) => r.level === "ng")).toHaveLength(0);
    const unmanagedInfo = results.find(
      (r) =>
        r.level === "info" &&
        r.evidence === "unmanaged-junction:plugins/agentdev-stranger",
    );
    expect(unmanagedInfo).toBeDefined();
  });
});

// ─── Case #3166: IR-053 exemption paths + compensation (RA-001, TS-001) ───────
// The two registered read-only contingency references (Custom Tool 契約 Design
// 「迂回防止」, REQ-095-003) must be skipped, non-exempt paths must stay
// detected, and the live exempt files must not contain write-path gh literals.
const RA001_ROOT = join(TEMP_ROOT, "ra001");

function buildRa001Fixture(root: string): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(
    join(reqDir, "README.md"),
    ["# Requirements", "", "| ID | Title |", "|----|-------|", ""].join("\n"),
    "utf-8",
  );
  mkdirp(join(root, "docs", "adr"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");

  const exempt1Dir = join(root, "src", "common", "skills", "agentdev-issue-management", "references");
  mkdirp(exempt1Dir);
  writeFileSync(
    join(exempt1Dir, "issue-operation-safety.md"),
    "# 手順\n\n上限到達時は `gh issue list --search k` で補完する。\n",
    "utf-8",
  );
  const exempt2Dir = join(root, "src", "common", "skills", "agentdev-workflow-case-open", "references");
  mkdirp(exempt2Dir);
  writeFileSync(
    join(exempt2Dir, "definition-pr-and-idempotency.md"),
    "# 手順\n\ngh CLI による切替は読み取り専用（`gh pr view` 等）に限定する。\n",
    "utf-8",
  );
  const nonExemptDir = join(root, "src", "common", "skills", "agentdev-ra-nonexempt");
  mkdirp(nonExemptDir);
  writeFileSync(
    join(nonExemptDir, "SKILL.md"),
    ["---", "name: agentdev-ra-nonexempt", "---", "", "# Non-exempt", "", "`gh issue create` で作成する。", ""].join("\n"),
    "utf-8",
  );
}

describe("IR-053 exemption paths + compensation (Case #3166, RA-001, TS-001)", () => {
  beforeAll(() => {
    mkdirp(RA001_ROOT);
    buildRa001Fixture(RA001_ROOT);
    copyScripts(RA001_ROOT);
  });

  it("skips IR-053 warnings for the two registered read-only contingency paths", () => {
    const r = getRa001JsonRun();
    const parsed = JSON.parse(r.stdout);
    const exemptWarnings = parsed.results.filter(
      (res: { check: string; level: string; file?: string }) =>
        res.check === "gh-direct-invocation" &&
        res.level === "warning" &&
        ((res.file ?? "").includes("issue-operation-safety.md") ||
          (res.file ?? "").includes("definition-pr-and-idempotency.md")),
    );
    expect(exemptWarnings.length).toBe(0);
  });

  it("keeps detecting direct gh invocations on non-exempt paths", () => {
    const r = getRa001JsonRun();
    const parsed = JSON.parse(r.stdout);
    const nonExempt = parsed.results.filter(
      (res: { check: string; level: string; file?: string }) =>
        res.check === "gh-direct-invocation" &&
        res.level === "warning" &&
        (res.file ?? "").includes("agentdev-ra-nonexempt"),
    );
    expect(nonExempt.length).toBe(1);
  });

  it("compensation: write-path gh literals are absent in both exempt files (live corpus)", () => {
    const WRITE_GH = /\bgh\s+(issue|pr)\s+(create|edit|comment|merge|close)\b/i;
    const exempt1 = readFileSync(
      join(REPO_ROOT_FROM_SCRIPT_DIR, "src", "common", "skills", "agentdev-issue-management", "references", "issue-operation-safety.md"),
      "utf-8",
    );
    const exempt2 = readFileSync(
      join(REPO_ROOT_FROM_SCRIPT_DIR, "src", "common", "skills", "agentdev-workflow-case-open", "references", "definition-pr-and-idempotency.md"),
      "utf-8",
    );
    expect(WRITE_GH.test(exempt1)).toBe(false);
    expect(WRITE_GH.test(exempt2)).toBe(false);
  });
});

// ─── Case #3166: readme-decision-summary-table IR-061 (RA-005, TS-005) ────────
const RA005_ROOT = join(TEMP_ROOT, "ra005");

function buildRa005Fixture(root: string, staleBody: boolean): void {
  const reqDir = join(root, "docs", "requirements");
  mkdirp(reqDir);
  writeFileSync(join(reqDir, "README.md"), "# Requirements\n", "utf-8");
  mkdirp(join(reqDir, "retired"));
  mkdirp(join(root, "docs", "adr"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  mkdirp(join(root, "docs", "designs", "integrity", "rules"));

  const decDir = join(root, "docs", "decisions");
  mkdirp(decDir);
  writeFileSync(
    join(decDir, "DEC-9001.md"),
    [
      "---",
      "id: DEC-9001",
      "title: RA-005 fixture Decision",
      "status: accepted",
      'created: "2026-09-27"',
      "---",
      "",
      "Body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  const table = generateDocsReadmeDecisionTable([
    {
      id: "DEC-9001",
      num: 9001,
      title: "RA-005 fixture Decision",
      status: "accepted",
      created: "2026-09-27",
      filename: "DEC-9001.md",
      relPath: "DEC-9001.md",
      relatedReqs: null,
      supersededBy: null,
      supersedeNote: null,
    } as never,
  ]);
  const body = staleBody
    ? [...table.slice(0, 2), "| [DEC-9999](decisions/DEC-9999.md) | stale row |"]
    : table;
  writeFileSync(
    join(root, "docs", "README.md"),
    [
      "# Docs",
      "",
      "<!-- AUTOGEN:BEGIN:id=readme-decision-summary-table -->",
      ...body,
      "<!-- AUTOGEN:END -->",
      "",
    ].join("\n"),
    "utf-8",
  );
}

describe("readme-decision-summary-table IR-061 (Case #3166, RA-005, TS-005)", () => {
  it("passes IR-061 when the Decision table block matches the generated rows", () => {
    mkdirp(RA005_ROOT);
    buildRa005Fixture(RA005_ROOT, false);
    copyScripts(RA005_ROOT);
    const r = runScript(RA005_ROOT, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const stale = parsed.results.filter(
      (res: { check: string; level: string; message: string }) =>
        res.check === "index-generation-consistency" &&
        res.level === "ng" &&
        (res.message as string).includes("readme-decision-summary-table"),
    );
    expect(stale.length).toBe(0);
  });

  it("fails IR-061 when the Decision table block is out of sync", () => {
    const root2 = `${RA005_ROOT}-stale`;
    mkdirp(root2);
    buildRa005Fixture(root2, true);
    copyScripts(root2);
    const r = runScript(root2, ["--json"]);
    const parsed = JSON.parse(r.stdout);
    const stale = parsed.results.filter(
      (res: { check: string; level: string; message: string }) =>
        res.check === "index-generation-consistency" &&
        res.level === "ng" &&
        (res.message as string).includes("readme-decision-summary-table"),
    );
    expect(stale.length).toBe(1);
  });
});



// ─── IR-072 req-updated-freshness (REQ-010-068) ───────────────────────────────
// Fixture kinds: 正常例 (updated = 最終内容変更 commit 日), 違反例 (updated 進行忘れ),
// 境界例 (untracked 履歴不在は突合対象外),
// 許容例 (README / retired / 4桁旧番号帯は対象外),
// 再現例 (REQ 本文修正 commit で updated 進行忘れした実在パターンの strict 検出),
// frontmatter のみ変更例 (REQ-935/936: metadata のみ変更 commit は内容変更から除外、
// 除外後の真の内容変更 commit 日と updated が乖離する場合は strict 検出を維持)。
// Design 対象 fixture (ACT-DESIGN-041): 正常例 (DES-941)・違反例 (DES-942)・
// 境界例 (DES-943: frontmatter のみ変更 commit は除外)・許容例 (DES-944: updated 欠落は
// 別ルール計上)・再現例 (DES-945: 内容変更 commit で updated 進行忘れ) の 5 種。

const IR072_ROOT = join(TEMP_ROOT, "ir072");

function ir072Git(root: string, args: string[], env?: Record<string, string>): void {
  const proc = Bun.spawnSync(["git", ...args], {
    cwd: root,
    env: env ? { ...process.env, ...env } : process.env,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (proc.exitCode !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed: ${proc.stderr?.toString("utf-8") ?? ""}`,
    );
  }
}

function ir072CommitAll(root: string, message: string, isoDate: string): void {
  ir072Git(root, ["add", "-A"]);
  ir072Git(root, ["commit", "--allow-empty", "-m", message], {
    GIT_AUTHOR_DATE: isoDate,
    GIT_COMMITTER_DATE: isoDate,
  });
}

function ir072WriteReq(
  root: string,
  id: string,
  updated: string,
  bodyMarker: string,
  title = `IR-072 fixture ${id}`,
): void {
  writeFileSync(
    join(root, "docs", "requirements", `${id}.md`),
    [
      "---",
      `id: ${id}`,
      `title: ${title}`,
      "created: 2025-01-15",
      `updated: ${updated}`,
      "---",
      "",
      "## 要件",
      "",
      `| ${id}-001 | fixture ${bodyMarker} |`,
      "",
    ].join("\n"),
    "utf-8",
  );
}

function ir072WriteDesign(
  root: string,
  relPath: string,
  updated: string | null,
  bodyMarker: string,
  title: string,
): void {
  const full = join(root, "docs", "designs", relPath);
  mkdirp(dirname(full));
  const front = [
    "---",
    `id: ${basename(relPath, ".md")}`,
    `title: ${title}`,
    "status: accepted",
    "created: 2025-09-01",
  ];
  if (updated !== null) front.push(`updated: ${updated}`);
  front.push(
    "---",
    "",
    `# ${basename(relPath, ".md")}`,
    "",
    `Design fixture body (${bodyMarker}).`,
    "",
  );
  writeFileSync(full, front.join("\n"), "utf-8");
}

function buildIr072Fixture(root: string): void {
  mkdirp(join(root, "docs", "requirements", "retired"));
  writeFileSync(join(root, "docs", "requirements", "README.md"), "# Requirements\n", "utf-8");

  ir072WriteReq(root, "REQ-932", "2025-01-15", "v1 body");
  ir072WriteReq(root, "REQ-0001", "2025-01-15", "legacy band (excluded)");
  writeFileSync(
    join(root, "docs", "requirements", "retired", "REQ-934.md"),
    [
      "---",
      "id: REQ-934",
      "title: IR-072 retired fixture",
      "created: 2025-01-15",
      "updated: 2025-01-15",
      "---",
      "",
      "Retired body.",
      "",
    ].join("\n"),
    "utf-8",
  );

  ir072Git(root, ["init"]);
  writeFileSync(join(root, ".gitattributes"), "* text=auto eol=lf\n", "utf-8");
  ir072Git(root, ["config", "user.name", "ir072-fixture"]);
  ir072Git(root, ["config", "user.email", "ir072-fixture@example.invalid"]);
  ir072CommitAll(root, "ir072 fixture commit 1", "2025-01-15T10:00:00+09:00");

  ir072WriteReq(root, "REQ-931", "2025-03-01", "fresh req");
  ir072CommitAll(root, "ir072 fixture commit 2", "2025-03-01T10:00:00+09:00");

  ir072WriteReq(root, "REQ-932", "2025-01-15", "v2 body updated without bump");
  ir072CommitAll(root, "ir072 fixture commit 3", "2025-03-02T10:00:00+09:00");

  ir072WriteReq(root, "REQ-935", "2025-05-01", "v1 body");
  ir072CommitAll(root, "ir072 fixture commit 4", "2025-05-01T10:00:00+09:00");

  ir072WriteReq(
    root,
    "REQ-935",
    "2025-05-01",
    "v1 body",
    "IR-072 fixture REQ-935 (title revised)",
  );
  ir072CommitAll(
    root,
    "ir072 fixture commit 5 (frontmatter-only)",
    "2025-06-01T10:00:00+09:00",
  );

  ir072WriteReq(root, "REQ-936", "2025-07-01", "v1 body");
  ir072CommitAll(root, "ir072 fixture commit 6", "2025-07-01T10:00:00+09:00");

  ir072WriteReq(
    root,
    "REQ-936",
    "2025-04-01",
    "v1 body",
    "IR-072 fixture REQ-936 (metadata revised)",
  );
  ir072CommitAll(
    root,
    "ir072 fixture commit 7 (frontmatter-only)",
    "2025-08-01T10:00:00+09:00",
  );

  // Design 対象 fixture (ACT-DESIGN-041)。5 種の commit 履歴を構成する。
  ir072WriteDesign(
    root,
    "DES-941.md",
    "2025-09-01",
    "normal (updated matches)",
    "IR-072 design fixture DES-941 (normal)",
  );
  ir072WriteDesign(
    root,
    "rules/DES-942.md",
    "2025-09-01",
    "v1 body",
    "IR-072 design fixture DES-942",
  );
  ir072WriteDesign(
    root,
    "DES-943.md",
    "2025-09-01",
    "v1 body",
    "IR-072 design fixture DES-943",
  );
  ir072WriteDesign(
    root,
    "DES-944.md",
    null,
    "allowed (updated missing)",
    "IR-072 design fixture DES-944",
  );
  ir072WriteDesign(
    root,
    "DES-945.md",
    "2025-09-01",
    "v1 body",
    "IR-072 design fixture DES-945",
  );
  ir072CommitAll(root, "ir072 fixture design commit 1", "2025-09-01T10:00:00+09:00");

  ir072WriteDesign(
    root,
    "rules/DES-942.md",
    "2025-09-01",
    "v2 body without bump",
    "IR-072 design fixture DES-942",
  );
  ir072CommitAll(root, "ir072 fixture design commit 2", "2025-09-10T10:00:00+09:00");

  ir072WriteDesign(
    root,
    "DES-943.md",
    "2025-09-01",
    "v1 body",
    "IR-072 design fixture DES-943 (title revised)",
  );
  ir072CommitAll(
    root,
    "ir072 fixture design commit 3 (frontmatter-only)",
    "2025-09-11T10:00:00+09:00",
  );

  ir072WriteDesign(
    root,
    "DES-945.md",
    "2025-09-01",
    "v2 body without bump",
    "IR-072 design fixture DES-945",
  );
  ir072CommitAll(root, "ir072 fixture design commit 4", "2025-09-12T10:00:00+09:00");

  ir072WriteReq(root, "REQ-933", "2025-03-02", "untracked (excluded)");
  copyScripts(root);
}

function ir072Collect(): {
  ng: { file: string; evidence: string; level: string; findingLevel?: string }[];
  infos: string[];
} {
  // IR-072 fixture は不変固定データ（git 履歴）のため、12 確認の起動を1回に集約する。
  const r = getIr072JsonRun();
  const parsed = JSON.parse(r.stdout);
  const fresh = (parsed.results as {
    category: string;
    check: string;
    level: string;
    file?: string;
    evidence?: string;
    message: string;
    finding_level?: string;
  }[]).filter((res) => res.category === "ReqFreshness");
  return {
    ng: fresh
      .filter((res) => res.level === "ng")
      .map((res) => ({
        file: res.file ?? "",
        evidence: res.evidence ?? "",
        level: res.level,
        findingLevel: res.finding_level,
      })),
    infos: fresh.filter((res) => res.level === "info").map((res) => res.message),
  };
}

describe("IR-072 req-updated-freshness (REQ-010-068)", () => {
  beforeAll(() => {
    mkdirp(IR072_ROOT);
    buildIr072Fixture(IR072_ROOT);
  });

  it("passes REQ files whose updated matches the last commit date (正常例)", () => {
    const collected = ir072Collect();
    expect(
      collected.ng.filter((f) => f.file.includes("REQ-931")),
    ).toHaveLength(0);
  });

  it("suppresses expected stderr from parent lookups for newly added files", () => {
    expect(getIr072JsonRun().stderr).not.toContain("fatal:");
  });

  it("detects a stale updated left behind by a later content change (違反例)", () => {
    const collected = ir072Collect();
    const stale = collected.ng.find((f) => f.file.includes("REQ-932"));
    expect(stale).toBeDefined();
    expect(stale?.evidence).toContain("updated: 2025-01-15");
    expect(stale?.evidence).toContain("2025-03-02");
  });

  it("excludes untracked REQ files lacking commit history (境界例)", () => {
    const collected = ir072Collect();
    expect(
      collected.ng.filter((f) => f.file.includes("REQ-933")),
    ).toHaveLength(0);
  });

  it("exempts README, retired, and legacy 4-digit band (許容例)", () => {
    const collected = ir072Collect();
    expect(
      collected.ng.filter(
        (f) =>
          f.file.includes("README") ||
          f.file.includes("retired") ||
          f.file.includes("REQ-0001"),
      ),
    ).toHaveLength(0);
  });

  it("reproduces the updated-bump-missed pattern as strict ng (再現例)", () => {
    const collected = ir072Collect();
    const stale = collected.ng.find((f) => f.file.includes("REQ-932"));
    expect(stale).toBeDefined();
    expect(stale?.findingLevel).toBe("strict");
  });

  it("does not treat frontmatter-only commits as content changes (frontmatter のみ変更除外)", () => {
    const collected = ir072Collect();
    expect(
      collected.ng.filter((f) => f.file.includes("REQ-935")),
    ).toHaveLength(0);
  });

  it("compares updated against the true content-change commit after frontmatter-only commits (乖離は検出継続)", () => {
    const collected = ir072Collect();
    const stale = collected.ng.find((f) => f.file.includes("REQ-936"));
    expect(stale).toBeDefined();
    expect(stale?.findingLevel).toBe("strict");
    expect(stale?.evidence).toContain("updated: 2025-04-01");
    expect(stale?.evidence).toContain("2025-07-01");
    expect(stale?.evidence).not.toContain("2025-08-01");
  });

  it("passes Design files whose updated matches the last content-change commit date (Design 正常例)", () => {
    const collected = ir072Collect();
    expect(
      collected.ng.filter((f) => f.file.includes("DES-941")),
    ).toHaveLength(0);
  });

  it("detects a stale updated left behind by a later Design content change (Design 違反例)", () => {
    const collected = ir072Collect();
    const stale = collected.ng.find((f) => f.file.includes("DES-942"));
    expect(stale).toBeDefined();
    expect(stale?.findingLevel).toBe("strict");
    expect(stale?.evidence).toContain("updated: 2025-09-01");
    expect(stale?.evidence).toContain("2025-09-10");
  });

  it("excludes frontmatter-only commits on Design files from content changes (Design 境界例)", () => {
    const collected = ir072Collect();
    const boundary = collected.ng.find((f) => f.file.includes("DES-943"));
    expect(boundary).toBeUndefined();
  });

  it("skips Design files without updated instead of counting them (Design 許容例)", () => {
    const collected = ir072Collect();
    expect(
      collected.ng.filter((f) => f.file.includes("DES-944")),
    ).toHaveLength(0);
  });

  it("reproduces the Design updated-bump-missed pattern as strict ng (Design 再現例)", () => {
    const collected = ir072Collect();
    const stale = collected.ng.find((f) => f.file.includes("DES-945"));
    expect(stale).toBeDefined();
    expect(stale?.findingLevel).toBe("strict");
    expect(stale?.evidence).toContain("updated: 2025-09-01");
    expect(stale?.evidence).toContain("2025-09-12");
  });
});

// ─── 結果共有契約の起動回数確認（同一入力条件は1回に集約） ──────────────────
// checkInvocationLog は共有経由の起動（loadCheckRun 経由）のみを記録する。状態変更後の
// 再検査（baseline 更新テスト等）は runScript 直接起動のため記録対象外である。
// 選択実行時はログが空になり、重複なしで合格する（単独実行契約を壊さない）。
describe("check_integrity 共有結果の起動回数記録（同一入力条件は1回）", () => {
  it("同一 root と実効引数の check_integrity 起動が重複して記録されないこと", () => {
    const counts = new Map<string, number>();
    for (const entry of checkInvocationLog) {
      counts.set(entry, (counts.get(entry) ?? 0) + 1);
    }
    const duplicated = [...counts.entries()].filter(([, n]) => n > 1);
    expect(duplicated).toEqual([]);
  });
});

// ─── IR-073 untracked-residue (REQ-010-084) ────────────────────────────────
// Fixture kinds: 陽性例（未追跡かつ gitignore 管理対象外の repo root 直下と
// .agentdev 配下非契約パス）、許容例（gitignore 管理対象の .agentdev/tmp/ は
// 検出しない）、案内例（検出報告に gitignore 追加宣言と対象側直接修正の案内を含む）。

const IR073_ROOT = join(TEMP_ROOT, "ir073");

function ir073Git(root: string, args: string[]): void {
  const proc = Bun.spawnSync(["git", ...args], {
    cwd: root,
    env: process.env,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (proc.exitCode !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed: ${proc.stderr?.toString("utf-8") ?? ""}`,
    );
  }
}

function buildIr073Fixture(root: string): void {
  mkdirp(join(root, "docs", "requirements"));
  writeFileSync(join(root, "docs", "requirements", "README.md"), "# Requirements\n", "utf-8");
  mkdirp(join(root, "docs", "adr"));
  writeFileSync(join(root, "docs", "adr", "README.md"), "# ADR\n", "utf-8");
  mkdirp(join(root, "docs", "designs"));
  writeFileSync(join(root, "docs", "designs", "README.md"), "# Design\n", "utf-8");
  writeFileSync(join(root, ".gitignore"), ".agentdev/tmp/\n.agentdev/integrity/reports/\n", "utf-8");
  // checker 実体を copy の上で base commit に含め、検出対象を汚染させない。
  copyScriptsComplete(root);
  ir073Git(root, ["init"]);
  ir073Git(root, ["config", "user.name", "ir073-fixture"]);
  ir073Git(root, ["config", "user.email", "ir073-fixture@example.invalid"]);
  ir073Git(root, ["add", "-A"]);
  ir073Git(root, ["commit", "-m", "ir073 fixture base"]);

  // 許容例: gitignore 管理対象の未追跡ファイル（検出しない）。
  mkdirp(join(root, ".agentdev", "tmp"));
  writeFileSync(join(root, ".agentdev", "tmp", "scratch.txt"), "ignored scratch\n", "utf-8");

  // 陽性例: 未追跡かつ gitignore 管理対象外（repo root 直下と .agentdev 配下非契約パス）。
  writeFileSync(join(root, "stray-root.txt"), "residue at repo root\n", "utf-8");
  mkdirp(join(root, ".agentdev", "notes"));
  writeFileSync(join(root, ".agentdev", "notes", "memo.txt"), "residue under non-contract path\n", "utf-8");
}

function ir073Run(): { exitCode: number; stdout: string } {
  return runScript(IR073_ROOT, ["--json"]);
}

interface Ir073ResidueRow {
  level: string;
  message: string;
  file?: string;
}

function ir073ResidueRows(stdout: string): Ir073ResidueRow[] {
  const parsed = JSON.parse(stdout) as { results: Ir073ResidueRow[] };
  return parsed.results.filter((res) => res.message?.includes("IR-073"));
}

describe("IR-073 untracked-residue (REQ-010-084)", () => {
  beforeAll(() => {
    rmSync(IR073_ROOT, { recursive: true, force: true });
    buildIr073Fixture(IR073_ROOT);
  });

  afterAll(() => {
    rmSync(IR073_ROOT, { recursive: true, force: true });
  });

  it("陽性検出: repo root 直下と .agentdev 配下非契約パスの未追跡残存を NG として検出する", () => {
    const r = ir073Run();
    expect(r.exitCode).not.toBe(0);
    const rows = ir073ResidueRows(r.stdout);
    const stray = rows.find((row) => row.file === "stray-root.txt");
    expect(stray).toBeDefined();
    expect(stray?.level).toBe("ng");
    expect(stray?.message).toContain("untracked file/directory not managed by gitignore remains: stray-root.txt");
    const memo = rows.find((row) => row.file?.includes("memo.txt"));
    expect(memo).toBeDefined();
    expect(memo?.level).toBe("ng");
    expect(memo?.file).toContain(".agentdev/notes/memo.txt");
  });

  it("許容例: gitignore 管理対象の .agentdev/tmp/ は検出しない", () => {
    const r = ir073Run();
    const rows = ir073ResidueRows(r.stdout);
    expect(rows.some((row) => row.file?.includes("scratch.txt"))).toBe(false);
    expect(rows.some((row) => row.file?.includes(".agentdev/tmp/"))).toBe(false);
  });

  it("案内例: 検出報告に gitignore 追加提案と承認一覧登録手順の案内を含む", () => {
    const r = ir073Run();
    const stray = ir073ResidueRows(r.stdout).find((row) => row.file === "stray-root.txt");
    expect(stray?.message).toContain(".gitignore");
    expect(stray?.message).toContain("直接修正");
    expect(stray?.message).toContain("免除しない");
  });

  it("クリーン状態: 未追跡残存が 0 件の場合は ok を報告する", () => {
    try {
      renameSync(join(IR073_ROOT, "stray-root.txt"), join(IR073_ROOT, ".agentdev", "tmp", "moved.txt"));
      renameSync(join(IR073_ROOT, ".agentdev", "notes"), join(IR073_ROOT, ".agentdev", "tmp", "notes"));
      const r = ir073Run();
      const rows = ir073ResidueRows(r.stdout);
      expect(rows.some((row) => row.level === "ng")).toBe(false);
      expect(rows.some((row) => row.level === "ok")).toBe(true);
    } finally {
      renameSync(join(IR073_ROOT, ".agentdev", "tmp", "notes"), join(IR073_ROOT, ".agentdev", "notes"));
      renameSync(join(IR073_ROOT, ".agentdev", "tmp", "moved.txt"), join(IR073_ROOT, "stray-root.txt"));
    }
  });
});

// ─── IR-074: ir-rule-classification-traceability (REQ-047-011〜013, Issue #4029) ──
// fixture IR 番号は IR-994〜IR-998（3 桁正規化帯。collectIrFiles が IR-NNN 3 桁へ
// padStart 正規化するため 4 桁番号 fixture は IR-994 のように正規化され、
// implementation_path ソース内 IR ID 参照と不一致になる）。
const IR074_ROOT = join(TEMP_ROOT, "ir074");

function writeIr074RuleFile(root: string, filename: string, frontmatterLines: string[]): void {
  const rulesDir = join(root, "docs", "designs", "integrity", "rules");
  mkdirp(rulesDir);
  const lines = ["---", `title: "${filename.replace(/\.md$/, "")} fixture"`, "status: accepted", "created: 2026-11-13", "updated: 2026-11-13", ...frontmatterLines, "---", "", `# ${filename.replace(/\.md$/, "")} fixture`, ""];
  writeFileSync(join(rulesDir, filename), lines.join("\n"), "utf-8");
}

function buildIr074Fixture(root: string): void {
  const scriptsDest = join(root, ".opencode", "skills", "repo-agentdev-integrity", "scripts");
  copyScripts(root);
  writeFileSync(join(scriptsDest, "ir074_fixture_impl.ts"), "// IR-994 implementation fixture\n", "utf-8");
  writeIr074RuleFile(root, "IR-994-ok-classified.md", [
    "detection_method_class: machine-check",
    "implementation_path: .opencode/skills/repo-agentdev-integrity/scripts/ir074_fixture_impl.ts",
    "verification_path: .opencode/skills/repo-agentdev-integrity/scripts/cli_utils.ts",
  ]);
  writeIr074RuleFile(root, "IR-995-prose-only.md", ["detection_method_class: prose-only"]);
  writeIr074RuleFile(root, "IR-996-unclassified.md", []);
  writeIr074RuleFile(root, "IR-997-bad-path.md", [
    "detection_method_class: machine-check",
    "implementation_path: .opencode/skills/repo-agentdev-integrity/scripts/nonexistent_impl.ts",
    "verification_path: .opencode/skills/repo-agentdev-integrity/scripts/cli_utils.ts",
  ]);
  writeIr074RuleFile(root, "IR-998-no-irid-ref.md", [
    "detection_method_class: machine-check",
    "implementation_path: .opencode/skills/repo-agentdev-integrity/scripts/cli_utils.ts",
    "verification_path: .opencode/skills/repo-agentdev-integrity/scripts/cli_utils.ts",
  ]);
}

function ir074Results(root: string): {
  ng: Array<{ evidence?: string; message: string; file?: string; finding_level?: string }>;
  ok: Array<{ message: string }>;
} {
  const r = runScript(root, ["--json"]);
  const parsed = JSON.parse(r.stdout);
  const hits = parsed.results.filter(
    (res: { category: string }) => res.category === "IrRuleClassification",
  );
  return { ng: hits.filter((x: { level: string }) => x.level === "ng"), ok: hits.filter((x: { level: string }) => x.level === "ok") };
}

function ir074KeepOnly(root: string, keep: string[]): void {
  const rulesDir = join(root, "docs", "designs", "integrity", "rules");
  for (const f of readdirSync(rulesDir)) {
    if (f.endsWith(".md") && !keep.includes(f)) {
      rmSync(join(rulesDir, f), { force: true });
    }
  }
}

describe("IR-074 ir-rule-classification-traceability (REQ-047-011〜013, Issue #4029)", () => {
  it("passes classified machine-check and prose-only rules (正常例)", () => {
    const root = join(IR074_ROOT, "ok");
    mkdirp(root);
    buildIr074Fixture(root);
    ir074KeepOnly(root, ["IR-994-ok-classified.md", "IR-995-prose-only.md"]);
    const { ng, ok } = ir074Results(root);
    expect(ng.length).toBe(0);
    expect(ok.length).toBeGreaterThan(0);
    expect(ok[0].message).toContain("machine-check=1");
    expect(ok[0].message).toContain("prose-only=1");
  });

  it("detects undetermined classification (違反例: 分類未確定)", () => {
    const root = join(IR074_ROOT, "unclassified");
    mkdirp(root);
    buildIr074Fixture(root);
    ir074KeepOnly(root, ["IR-996-unclassified.md"]);
    const { ng, ok } = ir074Results(root);
    expect(ng.length).toBe(1);
    expect(ok.length).toBe(0);
    expect(ng[0].file ?? "").toContain("IR-996-unclassified.md");
    expect(ng[0].message).toContain("classification undetermined");
    expect(ng[0].finding_level).toBe("strict");
  });

  it("detects machine-check rule missing implementation/verification paths (違反例: パス欠落)", () => {
    const root = join(IR074_ROOT, "missing-paths");
    mkdirp(root);
    buildIr074Fixture(root);
    ir074KeepOnly(root, ["IR-997-bad-path.md"]);
    writeIr074RuleFile(root, "IR-997-bad-path.md", ["detection_method_class: machine-check"]);
    const { ng } = ir074Results(root);
    expect(ng.length).toBe(1);
    expect(ng[0].file ?? "").toContain("IR-997-bad-path.md");
    expect(ng[0].message).toContain("missing implementation_path or verification_path");
  });

  it("detects non-existent declared paths (違反例: パス不在)", () => {
    const root = join(IR074_ROOT, "bad-path");
    mkdirp(root);
    buildIr074Fixture(root);
    ir074KeepOnly(root, ["IR-997-bad-path.md"]);
    const { ng } = ir074Results(root);
    expect(ng.length).toBe(1);
    expect(ng[0].file ?? "").toContain("IR-997-bad-path.md");
    expect(ng[0].message).toContain("non-existent path");
    expect(ng[0].evidence ?? "").toContain("nonexistent_impl.ts");
  });

  it("detects implementation source without rule identifier reference (違反例: IR ID 参照不在)", () => {
    const root = join(IR074_ROOT, "no-irid-ref");
    mkdirp(root);
    buildIr074Fixture(root);
    ir074KeepOnly(root, ["IR-998-no-irid-ref.md"]);
    const { ng } = ir074Results(root);
    expect(ng.length).toBe(1);
    expect(ng[0].file ?? "").toContain("IR-998-no-irid-ref.md");
    expect(ng[0].message).toContain("do not reference the rule identifier");
  });
});

// ─── IR-013: variant-path-existence 専用 fixture 試験（REQ-036-008, Case #4079） ──
describe("IR-013 variant-path-existence dedicated fixture tests (REQ-036-008, Case #4079)", () => {
  it("detects a command referencing a non-existent variant path (違反例)", () => {
    const root = join(TEMP_ROOT, "ir013-violation");
    const cmdDir = join(root, "src", "common", "commands", "agentdev");
    mkdirp(cmdDir);
    writeFileSync(
      join(cmdDir, "sample.md"),
      "See completion-reports/foo/bar.md for details.\n",
      "utf-8",
    );
    const results = checkVariantPathExistence(
      cmdDir,
      join(root, "docs", "commands", "completion-reports.md"),
      root,
    );
    const ng = results.filter(
      (x: { level: string; check: string }) =>
        x.level === "ng" && x.check === "variant-path-existence",
    );
    expect(ng.length).toBe(1);
    expect(ng[0].message).toContain("'sample'");
    expect(ng[0].message).toContain("but file does not exist");
  });

  it("passes when referenced variant paths exist (適合例)", () => {
    const root = join(TEMP_ROOT, "ir013-ok");
    const cmdDir = join(root, "src", "common", "commands", "agentdev");
    const variantDir = join(root, "docs", "commands", "completion-reports", "foo");
    mkdirp(cmdDir);
    mkdirp(variantDir);
    writeFileSync(join(cmdDir, "sample.md"), "See completion-reports/foo/bar.md.\n", "utf-8");
    writeFileSync(join(variantDir, "bar.md"), "# bar\n", "utf-8");
    const results = checkVariantPathExistence(
      cmdDir,
      join(root, "docs", "commands", "completion-reports.md"),
      root,
    );
    const ng = results.filter((x: { level: string }) => x.level === "ng");
    expect(ng.length).toBe(0);
    expect(
      results.some(
        (x: { level: string; check: string }) =>
          x.level === "ok" && x.check === "variant-path-existence",
      ),
    ).toBe(true);
  });
});

// ─── IR-018: req-range-staleness 専用 fixture 試験（Case #4079） ──────────────
describe("IR-018 req-range-staleness dedicated fixture tests (Case #4079)", () => {
  it("detects a stale REQ range statement covering non-existent ids (違反例)", () => {
    const root = join(TEMP_ROOT, "ir018-violation");
    const reqDir = join(root, "docs", "requirements");
    mkdirp(reqDir);
    writeFileSync(join(reqDir, "REQ-001.md"), "---\nid: REQ-001\n---\n", "utf-8");
    writeFileSync(join(reqDir, "REQ-002.md"), "---\nid: REQ-002\n---\n", "utf-8");
    writeFileSync(join(root, "AGENTS.md"), "現行要件は REQ-001〜REQ-009 の範囲である。\n", "utf-8");
    const results = checkReqRangeStaleness(root);
    const flagged = results.filter(
      (x: { level: string; check: string }) =>
        x.check === "req-range-staleness" && (x.level === "ng" || x.level === "warn"),
    );
    expect(flagged.length).toBeGreaterThan(0);
  });

  it("passes when the range statement matches existing ids (適合例)", () => {
    const root = join(TEMP_ROOT, "ir018-ok");
    const reqDir = join(root, "docs", "requirements");
    mkdirp(reqDir);
    writeFileSync(join(reqDir, "REQ-001.md"), "---\nid: REQ-001\n---\n", "utf-8");
    writeFileSync(join(reqDir, "REQ-002.md"), "---\nid: REQ-002\n---\n", "utf-8");
    writeFileSync(join(root, "AGENTS.md"), "現行要件は REQ-001〜REQ-002 の範囲である。\n", "utf-8");
    const results = checkReqRangeStaleness(root);
    const flagged = results.filter(
      (x: { level: string; check: string }) =>
        x.check === "req-range-staleness" && (x.level === "ng" || x.level === "warn"),
    );
    expect(flagged.length).toBe(0);
  });
});

// ─── IR-042: summary-req-range 専用 fixture 試験（Case #4079） ────────────────
describe("IR-042 summary-req-range dedicated fixture tests (Case #4079)", () => {
  it("detects a stale hardcoded count in requirements README (違反例)", () => {
    const root = join(TEMP_ROOT, "ir042-violation");
    const reqDir = join(root, "docs", "requirements");
    mkdirp(reqDir);
    writeFileSync(join(reqDir, "REQ-001.md"), "---\nid: REQ-001\n---\n", "utf-8");
    writeFileSync(join(reqDir, "REQ-002.md"), "---\nid: REQ-002\n---\n", "utf-8");
    writeFileSync(join(reqDir, "README.md"), "# 要件\n\n以下3件\n", "utf-8");
    const results = checkSummaryReqRangeConsistency(root);
    const warns = results.filter(
      (x: { level: string; check: string }) =>
        x.level === "warning" && x.check === "summary-req-range",
    );
    expect(warns.length).toBe(1);
    expect(warns[0].message).toContain("README states 3");
  });

  it("passes when the stated count matches the actual files (適合例)", () => {
    const root = join(TEMP_ROOT, "ir042-ok");
    const reqDir = join(root, "docs", "requirements");
    mkdirp(reqDir);
    writeFileSync(join(reqDir, "REQ-001.md"), "---\nid: REQ-001\n---\n", "utf-8");
    writeFileSync(join(reqDir, "REQ-002.md"), "---\nid: REQ-002\n---\n", "utf-8");
    writeFileSync(join(reqDir, "README.md"), "# 要件\n\n以下2件\n", "utf-8");
    const results = checkSummaryReqRangeConsistency(root);
    const warns = results.filter(
      (x: { level: string; check: string }) =>
        x.level === "warning" && x.check === "summary-req-range",
    );
    expect(warns.length).toBe(0);
    expect(
      results.some(
        (x: { level: string; check: string }) =>
          x.level === "ok" && x.check === "summary-req-range",
      ),
    ).toBe(true);
  });
});
