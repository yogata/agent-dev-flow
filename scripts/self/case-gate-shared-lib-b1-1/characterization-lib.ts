// B1-1（Issue #4014・委譲 DEL-4014-1）変更前特性化の共通実行ロジック。
//
// 3工程入口 script（prepare_definition_pr / accept_definition_checks /
// close_mechanical_steps）と B1-1 の CLI 利用側 4 skill の公開 CLI について、
// 変更前の挙動（通常起動・失敗分岐・--validate-input の stdout/stderr JSON 構造と
// 終了コード）を決定的な条件で実行し、正規化した結果を golden として記録するための
// ロジックを提供する。record-golden.ts（golden 生成）、compare-evidence.ts
//（変更後の evidence 比較）、characterization.test.ts（golden 比較テスト）から
// 共有利用される。本体 script のロジックは一切再実装しない（CLI 起動のみ）。

import * as fs from "node:fs";
import * as path from "node:path";

/** リポジトリルート（本ファイルから3階層上）。 */
export const REPO_ROOT = path.resolve(import.meta.dir, "../../..");

/** 特性化実行用の一時 fixture ディレクトリ（repo root 相対）。実行内で作成・削除する。 */
export const TMP_DIR = ".agentdev/tmp/del4014-char";

/** 検証証跡退避ディレクトリ（repo root 相対）。実行内で作成・削除する。 */
export const EVIDENCE_DIR = ".agentdev/tmp/del4014-evidence";

export interface CliOutcome {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/** bun で script を起動する（cwd は常にリポジトリルート。REQ-060 の実行形態）。 */
export function runBun(args: readonly string[], cwd: string = REPO_ROOT): CliOutcome {
  const result = Bun.spawnSync(["bun", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const decoder = new TextDecoder();
  return {
    exitCode: result.exitCode,
    stdout: decoder.decode(result.stdout),
    stderr: decoder.decode(result.stderr),
  };
}

/** 出力の正規化: 絶対パスの置換・改行統一・区切り統一（決定的比較のため）。
 * REPO_ROOT は環境ごとに実名の大小文字・区切り数（\ と /、単一/二重）が変動するため、
 * セグメント境界を [/]+ の柔軟パターン（大小文字非依存）で置換する。 */
export function normalizeOutput(text: string): string {
  const repoRootPosix = REPO_ROOT.replace(/\\/g, "/");
  const rootPattern = new RegExp(
    repoRootPosix
      .split("/")
      .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("[/\\\\]+"),
    "gi",
  );
  return text
    .replace(rootPattern, "<REPO_ROOT>")
    .replaceAll(/\\/g, "/")
    .replaceAll("\r\n", "\n");
}

/** 一時 fixture ディレクトリを作成し、ゲート実行体 fixture を配置する。 */
export function ensureFixtures(): { gatePath: string; missingGatePath: string } {
  fs.rmSync(path.join(REPO_ROOT, TMP_DIR), { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_ROOT, TMP_DIR), { recursive: true });
  const gatePath = `${TMP_DIR}/fixture-gate.ts`;
  const missingGatePath = `${TMP_DIR}/missing-gate.ts`;
  fs.writeFileSync(path.join(REPO_ROOT, gatePath), "// availability fixture (never executed)\n", "utf-8");
  return { gatePath, missingGatePath };
}

/** 一時 fixture ディレクトリを削除する（後片付け。evidence 退避は比較完了まで保持する）。 */
export function cleanupFixtures(): void {
  fs.rmSync(path.join(REPO_ROOT, TMP_DIR), { recursive: true, force: true });
}

function writeJsonFile(relativePath: string, value: unknown): void {
  const absolute = path.join(REPO_ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
}

export function writeInputFixture(name: string, value: unknown): string {
  const relative = `${TMP_DIR}/${name}`;
  writeJsonFile(relative, value);
  return relative;
}

function gateSpec(name: string, command: string, args: readonly string[]): Record<string, unknown> {
  return { name, command, args: [...args], cwd: REPO_ROOT };
}

/** 入力 fixture の組立（repoRoot は実絶対パス。正規化は出力側で行う）。 */
export function buildInputFixtures(gatePath: string, missingGatePath: string): Record<string, string> {
  const good = gatePath;
  const bad = missingGatePath;

  const prepareValid = writeInputFixture("prepare-valid.json", {
    repoRoot: REPO_ROOT,
    worktreeRoot: ".worktrees/del4014-char-nonexistent",
    branch: "definition/issue-4014-char",
    baseRef: "origin/main",
    rootCaseId: "#4014",
    definitionEdits: [
      { path: "docs/char-target.md", oldText: "| REQ-NNNN-010 | old |\n", newText: "| REQ-NNNN-010 | old |\n| REQ-NNNN-011 | new |\n" },
    ],
    requiresIndexRegeneration: true,
    stagePaths: ["docs/char-target.md"],
    commitMessage: "docs(definition): characterization",
    traceabilityReqIds: ["REQ-000-001"],
    generateIndexesGate: gateSpec("generate_indexes", "bun", [good]),
    checkIntegrityGate: gateSpec("check_integrity", "bun", [good]),
    traceabilityGate: gateSpec("traceability-check", "bun", [good, "--req", "REQ-000-001"]),
  });

  const prepareMissing = writeInputFixture("prepare-missing-gate.json", {
    repoRoot: REPO_ROOT,
    worktreeRoot: ".worktrees/del4014-char-nonexistent",
    branch: "definition/issue-4014-char",
    baseRef: "origin/main",
    rootCaseId: "#4014",
    definitionEdits: [
      { path: "docs/char-target.md", oldText: "| REQ-NNNN-010 | old |\n", newText: "| REQ-NNNN-010 | old |\n| REQ-NNNN-011 | new |\n" },
    ],
    requiresIndexRegeneration: true,
    stagePaths: ["docs/char-target.md"],
    commitMessage: "docs(definition): characterization",
    traceabilityReqIds: ["REQ-000-001"],
    generateIndexesGate: gateSpec("generate_indexes", "bun", [good]),
    checkIntegrityGate: gateSpec("check_integrity", "bun", [bad]),
    traceabilityGate: gateSpec("traceability-check", "bun", [good, "--req", "REQ-000-001"]),
  });

  const prepareStagePathsEmpty = writeInputFixture("prepare-empty-stagepaths.json", {
    repoRoot: REPO_ROOT,
    worktreeRoot: ".worktrees/del4014-char-nonexistent",
    branch: "definition/issue-4014-char",
    baseRef: "origin/main",
    rootCaseId: "#4014",
    definitionEdits: [
      { path: "docs/char-target.md", oldText: "| REQ-NNNN-010 | old |\n", newText: "| REQ-NNNN-010 | old |\n| REQ-NNNN-011 | new |\n" },
    ],
    requiresIndexRegeneration: true,
    stagePaths: [],
    commitMessage: "docs(definition): characterization",
    traceabilityReqIds: ["REQ-000-001"],
    generateIndexesGate: gateSpec("generate_indexes", "bun", [good]),
    checkIntegrityGate: gateSpec("check_integrity", "bun", [good]),
    traceabilityGate: gateSpec("traceability-check", "bun", [good, "--req", "REQ-000-001"]),
  });

  const acceptValid = writeInputFixture("accept-valid.json", {
    phase: "acceptance-checks",
    repoRoot: REPO_ROOT,
    branch: "definition/issue-4014-char",
    prNumber: 4014,
    integrityGates: [gateSpec("check_integrity", "bun", [good])],
    traceabilityGate: gateSpec("traceability-check", "bun", [good, "--req", "REQ-000-001"]),
    overlapGate: gateSpec("overlap-cross-check", "bun", [good]),
    generateIndexesGate: gateSpec("generate_indexes", "bun", [good]),
  });

  const acceptMissing = writeInputFixture("accept-missing-gate.json", {
    phase: "acceptance-checks",
    repoRoot: REPO_ROOT,
    branch: "definition/issue-4014-char",
    prNumber: 4014,
    integrityGates: [gateSpec("check_integrity", "bun", [bad])],
    traceabilityGate: gateSpec("traceability-check", "bun", [good, "--req", "REQ-000-001"]),
    overlapGate: gateSpec("overlap-cross-check", "bun", [good]),
    generateIndexesGate: gateSpec("generate_indexes", "bun", [good]),
  });

  const acceptBadPhase = writeInputFixture("accept-bad-phase.json", {
    phase: "unknown-phase",
    repoRoot: REPO_ROOT,
    branch: "definition/issue-4014-char",
    prNumber: 4014,
  });

  const closeValid = writeInputFixture("close-valid.json", {
    phase: "pre-merge",
    worktreeRoot: ".worktrees/del4014-char-nonexistent",
    repoRoot: REPO_ROOT,
    branch: "feature/issue-4014-char",
    prNumber: 0,
    generateIndexesGate: gateSpec("generate_indexes", "bun", [good]),
    traceabilityGate: gateSpec("traceability-check", "bun", [good, "--req", "REQ-000-001"]),
    integrityGates: [gateSpec("full-integrity-suite", "bun", [good])],
    textlintGate: gateSpec("textlint-final-check", "bun", [good]),
    issueBodyPath: `${TMP_DIR}/issue-body.md`,
    issueUpdatedAt: "2026-11-11T00:00:00.000Z",
    issueNumber: 4014,
    contractStateCheck: { contractStatePaths: ["docs/char-target.md"], approvalEntries: ["- 特性化用の契約状態行"] },
  });

  const closeMissing = writeInputFixture("close-missing-gate.json", {
    phase: "pre-merge",
    worktreeRoot: ".worktrees/del4014-char-nonexistent",
    repoRoot: REPO_ROOT,
    branch: "feature/issue-4014-char",
    prNumber: 0,
    generateIndexesGate: gateSpec("generate_indexes", "bun", [good]),
    traceabilityGate: gateSpec("traceability-check", "bun", [good, "--req", "REQ-000-001"]),
    integrityGates: [gateSpec("full-integrity-suite", "bun", [bad])],
    textlintGate: gateSpec("textlint-final-check", "bun", [good]),
    issueBodyPath: `${TMP_DIR}/issue-body.md`,
    issueUpdatedAt: "2026-11-11T00:00:00.000Z",
    issueNumber: 4014,
    contractStateCheck: { contractStatePaths: ["docs/char-target.md"], approvalEntries: ["- 特性化用の契約状態行"] },
  });

  const closeBadPhase = writeInputFixture("close-bad-phase.json", {
    phase: "unknown-phase",
    repoRoot: REPO_ROOT,
    branch: "feature/issue-4014-char",
    prNumber: 0,
  });

  fs.writeFileSync(path.join(REPO_ROOT, `${TMP_DIR}/issue-body.md`), "- [ ] characterization condition\n", "utf-8");
  writeInputFixture("invalid-json.json.txt", { broken: true });
  fs.writeFileSync(path.join(REPO_ROOT, `${TMP_DIR}/invalid-json.json`), '{"broken":', "utf-8");

  return {
    prepareValid,
    prepareMissing,
    prepareStagePathsEmpty,
    acceptValid,
    acceptMissing,
    acceptBadPhase,
    closeValid,
    closeMissing,
    closeBadPhase,
    invalidJson: `${TMP_DIR}/invalid-json.json`,
  };
}

export const PREPARE_SCRIPT = "./src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts";
export const ACCEPT_SCRIPT = "./src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts";
export const CLOSE_SCRIPT = "./src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts";

export interface CliCase {
  id: string;
  args: readonly string[];
  /** close の通常起動は provisional 記録書出し（メインリポジトリ副作用）があるため CLI 実行から除外する。 */
  note?: string;
}

/** 3入口の CLI 特性化条件一式（決定的なものに限定）。 */
export function buildCliCases(inputs: Record<string, string>): Record<string, readonly CliCase[]> {
  return {
    prepare_definition_pr: [
      { id: "p-1-validate-input-valid", args: ["--input", inputs.prepareValid, "--validate-input"] },
      { id: "p-2-validate-input-missing-gate", args: ["--input", inputs.prepareMissing, "--validate-input"] },
      { id: "p-3-validate-input-empty-stagepaths", args: ["--input", inputs.prepareStagePathsEmpty, "--validate-input"] },
      { id: "p-4-invalid-json", args: ["--input", inputs.invalidJson] },
      { id: "p-5-no-args", args: [] },
      { id: "p-6-unknown-arg", args: ["--bogus"] },
      { id: "p-7-help", args: ["--help"] },
      { id: "p-8-run-missing-gate", args: ["--input", inputs.prepareMissing], note: "usual run fails on gate availability before any worktree/git side effect" },
      { id: "p-9-run-input-file-missing", args: ["--input", `${TMP_DIR}/no-such-input.json`] },
    ],
    accept_definition_checks: [
      { id: "a-1-validate-input-valid", args: ["--input", inputs.acceptValid, "--validate-input"] },
      { id: "a-2-validate-input-missing-gate", args: ["--input", inputs.acceptMissing, "--validate-input"] },
      { id: "a-3-validate-input-bad-phase", args: ["--input", inputs.acceptBadPhase, "--validate-input"] },
      { id: "a-4-invalid-json", args: ["--input", inputs.invalidJson] },
      { id: "a-5-no-args", args: [] },
      { id: "a-6-unknown-arg", args: ["--bogus"] },
      { id: "a-7-help", args: ["--help"] },
      { id: "a-8-run-missing-gate", args: ["--input", inputs.acceptMissing], note: "usual run fails on gate availability before any git side effect" },
      { id: "a-9-run-input-file-missing", args: ["--input", `${TMP_DIR}/no-such-input.json`] },
    ],
    close_mechanical_steps: [
      { id: "c-1-validate-input-valid", args: ["--input", inputs.closeValid, "--validate-input"] },
      { id: "c-2-validate-input-missing-gate", args: ["--input", inputs.closeMissing, "--validate-input"] },
      { id: "c-3-validate-input-bad-phase", args: ["--input", inputs.closeBadPhase, "--validate-input"] },
      { id: "c-4-invalid-json", args: ["--input", inputs.invalidJson] },
      { id: "c-5-no-args", args: [] },
      { id: "c-6-unknown-arg", args: ["--bogus"] },
      { id: "c-7-help", args: ["--help"] },
      { id: "c-9-run-input-file-missing", args: ["--input", `${TMP_DIR}/no-such-input.json`] },
    ],
  };
}

export const SCRIPT_BY_ENTRY: Record<string, string> = {
  prepare_definition_pr: PREPARE_SCRIPT,
  accept_definition_checks: ACCEPT_SCRIPT,
  close_mechanical_steps: CLOSE_SCRIPT,
};

/** golden 生成: 3入口の全 CLI 条件を同一条件で実行し、正規化した結果を返す。 */
export function recordGateEntryOutcomes(): Record<string, Record<string, CliOutcome>> {
  const { gatePath, missingGatePath } = ensureFixtures();
  const inputs = buildInputFixtures(gatePath, missingGatePath);
  const cases = buildCliCases(inputs);
  const outcomes: Record<string, Record<string, CliOutcome>> = {};
  for (const [entry, entryCases] of Object.entries(cases)) {
    outcomes[entry] = {};
    for (const cliCase of entryCases) {
      const result = runBun([SCRIPT_BY_ENTRY[entry], ...cliCase.args]);
      outcomes[entry][cliCase.id] = {
        exitCode: result.exitCode,
        stdout: normalizeOutput(result.stdout),
        stderr: normalizeOutput(result.stderr),
      };
    }
  }
  return outcomes;
}

// ---------------------------------------------------------------------------
// B1-1 の CLI 利用側 4 skill の公開 CLI 特性化条件（TS-002）
// ---------------------------------------------------------------------------

export interface CliSkillCase {
  id: string;
  /** golden/evidence への記録対象にするか。データ依存の有効系は pin のみで evidence 比較対象外。 */
  compare: boolean;
  args: readonly string[];
}

/** B1-1 利用側 4 skill の代表 CLI 条件（有効入力・無効入力・ゲート不能）。 */
export function buildCliSkillCases(tmpDir: string = TMP_DIR): Record<string, readonly CliSkillCase[]> {
  return {
    "agentdev-traceability": [
      { id: "check-valid-req117-011", compare: false, args: ["./src/common/skills/agentdev-traceability/scripts/src/check.ts", "--root", ".", "--req", "REQ-117-011"] },
      { id: "check-invalid-unknown-req", compare: true, args: ["./src/common/skills/agentdev-traceability/scripts/src/check.ts", "--root", ".", "--req", "REQ-999-999"] },
      { id: "check-gate-unavailable-missing-root", compare: true, args: ["./src/common/skills/agentdev-traceability/scripts/src/check.ts", "--root", `${tmpDir}/missing-root-dir`] },
      { id: "coverage-valid-req117-011", compare: false, args: ["./src/common/skills/agentdev-traceability/scripts/src/coverage.ts", "--root", ".", "--req", "REQ-117-011"] },
      { id: "coverage-invalid-no-target", compare: true, args: ["./src/common/skills/agentdev-traceability/scripts/src/coverage.ts", "--root", "."] },
      { id: "coverage-gate-unavailable-missing-root", compare: true, args: ["./src/common/skills/agentdev-traceability/scripts/src/coverage.ts", "--root", `${tmpDir}/missing-root-dir`, "--req", "REQ-000-001"] },
    ],
    "agentdev-adopted-conventions": [
      { id: "resolve-valid-root", compare: false, args: ["./src/common/skills/agentdev-adopted-conventions/scripts/src/resolve.ts", "--root", "."] },
      { id: "resolve-invalid-missing-root", compare: true, args: ["./src/common/skills/agentdev-adopted-conventions/scripts/src/resolve.ts", "--root", `${tmpDir}/missing-root-dir`] },
      { id: "evaluate-valid-root", compare: false, args: ["./src/common/skills/agentdev-adopted-conventions/scripts/src/evaluate.ts", "--root", "."] },
      { id: "evaluate-invalid-bad-exclude", compare: true, args: ["./src/common/skills/agentdev-adopted-conventions/scripts/src/evaluate.ts", "--root", ".", "--exclude", "bad-format"] },
    ],
    "agentdev-artifact-semantics": [
      { id: "classify-valid-agents-md", compare: false, args: ["./src/common/skills/agentdev-artifact-semantics/scripts/src/classify.ts", "--root", ".", "--files", "AGENTS.md"] },
      { id: "classify-invalid-missing-files-flag", compare: true, args: ["./src/common/skills/agentdev-artifact-semantics/scripts/src/classify.ts", "--root", "."] },
      { id: "classify-gate-unavailable-missing-file", compare: true, args: ["./src/common/skills/agentdev-artifact-semantics/scripts/src/classify.ts", "--root", ".", "--files", `${tmpDir}/missing-file.md`] },
    ],
    "agentdev-phase-theme-collaboration": [
      { id: "themes-valid-empty-themes", compare: false, args: ["./src/common/skills/agentdev-phase-theme-collaboration/scripts/src/themes.ts", "--themes-file", ".agentdev/phase/themes.md"] },
      { id: "themes-invalid-missing-flag", compare: true, args: ["./src/common/skills/agentdev-phase-theme-collaboration/scripts/src/themes.ts"] },
      { id: "themes-gate-unavailable-missing-file", compare: true, args: ["./src/common/skills/agentdev-phase-theme-collaboration/scripts/src/themes.ts", "--themes-file", `${tmpDir}/missing-themes.md`] },
      { id: "received-valid-empty-dir", compare: false, args: ["./src/common/skills/agentdev-phase-theme-collaboration/scripts/src/received.ts", "--dir", ".agentdev/phase/received"] },
      { id: "received-gate-unavailable-missing-dir", compare: true, args: ["./src/common/skills/agentdev-phase-theme-collaboration/scripts/src/received.ts", "--dir", `${tmpDir}/missing-received-dir`] },
    ],
  };
}

/** 4 CLI の実行結果（evidence 退避・変更前後比較の対象）。 */
export function runCliSkillOutcomes(): Record<string, Record<string, CliOutcome>> {
  const outcomes: Record<string, Record<string, CliOutcome>> = {};
  for (const [skill, cases] of Object.entries(buildCliSkillCases())) {
    outcomes[skill] = {};
    for (const cliCase of cases) {
      const result = runBun(cliCase.args);
      outcomes[skill][cliCase.id] = {
        exitCode: result.exitCode,
        stdout: normalizeOutput(result.stdout),
        stderr: normalizeOutput(result.stderr),
      };
    }
  }
  return outcomes;
}

/** 4 CLI の変更前 baseline を evidence ディレクトリへ UTF-8 明示で退避する。 */
export function persistCliSkillBaseline(): string {
  const outcomes = runCliSkillOutcomes();
  const relative = `${EVIDENCE_DIR}/cli-skill-baseline.json`;
  writeJsonFile(relative, {
    recordedPurpose: "B1-1 (Issue #4014) TS-002 pre-change baseline for B1-1 CLI consumer skills",
    recordedAt: new Date().toISOString(),
    outcomes,
  });
  return relative;
}

/** evidence baseline との比較（変更後実行用）。compare: true の条件のみ比較する。 */
export function compareCliSkillBaseline(): { compared: number; differences: string[]; baselinePath: string } {
  const baselinePath = path.join(REPO_ROOT, EVIDENCE_DIR, "cli-skill-baseline.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8")) as {
    outcomes: Record<string, Record<string, CliOutcome>>;
  };
  const current = runCliSkillOutcomes();
  const cases = buildCliSkillCases();
  const differences: string[] = [];
  let compared = 0;
  for (const [skill, entryCases] of Object.entries(cases)) {
    for (const cliCase of entryCases) {
      if (!cliCase.compare) continue;
      compared += 1;
      const before = baseline.outcomes[skill]?.[cliCase.id];
      const after = current[skill]?.[cliCase.id];
      if (before === undefined || after === undefined) {
        differences.push(`${skill}/${cliCase.id}: missing outcome (before=${before !== undefined}, after=${after !== undefined})`);
        continue;
      }
      if (before.exitCode !== after.exitCode) {
        differences.push(`${skill}/${cliCase.id}: exitCode ${before.exitCode} -> ${after.exitCode}`);
      }
      if (before.stdout !== after.stdout) {
        differences.push(`${skill}/${cliCase.id}: stdout differs`);
      }
      if (before.stderr !== after.stderr) {
        differences.push(`${skill}/${cliCase.id}: stderr differs`);
      }
    }
  }
  return { compared, differences, baselinePath: `${EVIDENCE_DIR}/cli-skill-baseline.json` };
}
