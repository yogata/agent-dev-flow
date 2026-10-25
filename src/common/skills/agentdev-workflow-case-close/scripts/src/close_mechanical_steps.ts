//
// case-close 機械工程の script 入口（機械工程の script 呼び出し契約節に基づく
// 工程別 script。契約の正は case-close Design「機械工程の script 呼び出し契約」節）。
//
// mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の
// 解析と状態更新、完了条件チェックボックス評価の機械的抽出（受入評価の母集団
// 導出と final-acceptance.ts の evaluateFinalAcceptance への接続を兼ねる）、
// 契約状態記録の commit 済み検証と未追跡残存検査、
// AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約（fail 全件の
// 由来分類と機械受理基準の記録完備の検証を含む）、worktree/branch
// クリーンアップを1 script の呼び出しに束ねる。受入評価の拒否・未確定と機械
// 受理基準の拒否は報告 JSON（diff.acceptanceEvaluation、
// diff.integrityMachineAcceptance と isCloseOperationPermitted）を通じて既存の
// 終了操作（STEP-5 の issue_close、E1〜E6 の Epic 終了・Wave クローズ）の実行
// 抑制として消費される。GitHub I/O（pr_merge、issue_close、Issue 本文更新）
// は行わない（読み取り系 gh pr view のみ）。意味判断（警告の重要度評価、Design
// 確定判断、未達判定の確定、完了条件単位の判定入力の組み立て）はモデルが担当する。
//
// 入力: `--input` に機械工程入力 JSON ファイル。出力: stdout に報告 JSON
// （実行結果・差分・警告・提案本文の4要素）。終了コード: 成功 0、要判断 2、
// 失敗 1。script は処理を省略せず、失敗時は途中結果とともに非 0 で終了する。
// 対象品質ゲート（traceability check、full integrity suite、AUTOGEN 再生成差分
// 検出、textlint 最終検査）の省略は入力検証で拒否し、ゲート実行体は起動前に
// 配布先での存在検査を行う（欠落時は正規の代替経路の案内を報告へ含めて
// fail-closed で停止する）。
//

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import {
  countChildStatuses,
  parseStatusCell,
  readChildStatus,
  replaceChildStatus,
  type PersistedStatus,
} from "../../../agentdev-epic-tracker/scripts/lib/tracking-table.ts";
import {
  evaluateFinalAcceptance,
  type ConditionPopulation,
  type ConditionVerdict,
  type CrossObligation,
  type FinalAcceptanceResult,
  type SubjectKind,
} from "./final-acceptance.ts";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts --input <input.json>
  --input  機械工程入力 JSON（phase、worktree_root、PR番号、品質ゲート実行仕様等）`;

export interface CommandSpec {
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/** script が外部処理を呼び出す経路。単体テストでは偽 runner を注入する。 */
export interface MechanicalRunner {
  run(spec: CommandSpec): CommandResult;
  readTextFile(absolutePath: string): string;
  sleep(ms: number): void;
  exists(absolutePath: string): boolean;
}

export interface GateCommandSpec {
  name: string;
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

/** full integrity suite の fail 1件あたりの由来分類記録（fail 単位の1:1対応。受理由件5・7）。 */
export interface IntegrityFailureOrigin {
  /** fail が発生した gate 名（integrityGates の GateCommandSpec.name と突合する）。 */
  gate: string;
  /** fail の識別子（テスト名、checker 名等の provenance。同一 gate 内で一意）。 */
  failureId: string;
  /** 由来分類。機械受理基準の4分類。pre-existing は baseline 再現確認記録、execution-form は規律適合再実行結果の採用記録を実体として必須とする。 */
  origin: "changed" | "pre-existing" | "execution-form" | "unknown";
  /** pre-existing 分類の baseline 再現確認（ワークツリー変更ゼロの baseline commit での同一 fail 再現確認。detached worktree 標準手順）。 */
  baselineReproduction?: {
    baselineCommit: string;
    method: "detached-worktree";
    sameFailureReproduced: boolean;
  };
  /** execution-form 分類の規律適合再実行結果の採用記録。当該実行結果を合格の根拠にせず、規律適合後の再実行結果を採用したことを示す実体。 */
  conformanceReexecution?: {
    /** 適合再実行の証跡所在（stdout/stderr 退避先等）。 */
    evidencePath: string;
    /** 適合再実行の終了コード（検証コマンド自体の生値。変換禁止）。 */
    exitCode: number;
    /** 適合再実行で fail が解消したか。解消しない場合は改めて由来分類し直すため、false は受理されない。 */
    resolvedAfterConformingRerun: boolean;
  };
  /** 既知欠陥登録（機械受理基準の記録一式の登録。PR 本文検証差分セクション）の所在参照。空参照は未登録として拒否する。 */
  registrationRef: string;
}

/** 1分割実行の実行記録（受理由件2・4・8・10の記録実体）。 */
export interface IntegritySuiteRunRecord {
  /** 分割の識別子（分割①②③等。一意）。 */
  split: string;
  /** 起動コマンド（./ prefix 付きパス指定）。 */
  command: string;
  /** 実行 cwd。 */
  cwd: string;
  /** 件数サマリー（Ran N tests across M files 等。受理由件4）。 */
  testCountSummary: string;
  /** 検証コマンド自体の終了コード（生値。変換禁止。受理由件8）。 */
  exitCode: number;
  /** 検査範囲（./ prefix 付き対象指定。環境差を含む実施範囲。受理由件10）。 */
  scope: string;
}

/**
 * full integrity suite の機械受理基準（QG-4 最終受入規範の受理由件10項目）に対応する
 * 検証結果記録の入力契約。boolean 申告ではなく記録実体を保持し、機械側は実体の
 * 存在・形式・件数突合を検証する（fail 全件の由来分類、分類レコードの形式、
 * 観測 fail 件数との1:1突合、正規ランナー構成、正規形実行、環境ラベル、baseline
 * 基準、ランナー版）。fail が 0 件の場合は省略可能。
 */
export interface IntegrityMachineAcceptanceRecord {
  /** fail 全件の由来分類（受理由件5）。fail 単位のレコード（1 fail = 1 レコード）。 */
  failureOrigins: readonly IntegrityFailureOrigin[];
  /** gate ごとの観測 fail 件数（件数突合の基準実体。受理由件4・5）。 */
  observedFailCounts: readonly { gate: string; failCount: number }[];
  /** 正規ランナー構成確認の記録実体（受理由件1。確認結果と判定した正規ランナー）。 */
  runnerConstitution: { confirmedRunner: string; basis: string };
  /** 正規形実行の記録実体（受理由件2。分割ごとに1レコード）。 */
  suiteRunRecords: readonly IntegritySuiteRunRecord[];
  /** 環境ラベルの記録実体（受理由件3。実行環境・junction 伝播状態・依存パッケージ状態の3要素）。 */
  environmentLabel: { runtime: string; junctionPropagation: string; dependencies: string };
  /** 由来判定の基準 baseline commit の明示（受理由件6。remediation 開始前の baseline commit）。 */
  baselineReferenceCommit: string;
  /** 実行ランナー版の記録（受理由件9）。 */
  runnerVersion: string;
}

/** 機械受理基準の検証で検出した違反。 */
export interface MachineAcceptanceViolation {
  code: string;
  gate?: string;
  failureId?: string;
  expected?: number;
  actual?: number;
}

/** 機械受理判定の入力となる gate 実行結果（実際の実行から取得した実体）。 */
export interface IntegrityGateResult {
  name: string;
  exitCode: number;
}

/**
 * 契約状態記録・未追跡残存検査の入力契約。
 * 正規契約から導出した状態記録パスの範囲導出は意味判断としてモデルが担当し、
 * 本 script は与えられた範囲の commit 済み検証と、リポジトリ全体の未追跡残存の
 * 承認一覧突合を決定的に実行する。承認一覧は既存の ng-baseline 系承認一覧機構
 * （category/check/file/evidence/count/provenance/reason の恒久承認記録）と同一の
 * 物理実体から、当該実行の対象エントリが渡される。script が承認を自動追加することはない。
 */
export interface ContractStateCheck {
  /** 正規契約から導出した、当該 Case 実行に関連する git 管理契約の状態記録パス（repoRoot 相対）。 */
  contractStatePaths: readonly string[];
  /** 未追跡残存の承認一覧エントリ（repoRoot 相対のパスまたはディレクトリ接頭辞）。 */
  approvalEntries: readonly string[];
  /** 帰属が機械判定できない検出の人間確認済み記録（path と確認根拠 basis の実体）。 */
  humanConfirmedPaths?: readonly { path: string; basis: string }[];
}

/** 契約状態記録・未追跡残存検査の判定結果（報告 JSON の diff.contractStateResidue 実体）。 */
export interface ContractStateResidueEvaluation {
  /** 導出済み状態記録パスすべてが commit 済み（porcelain 出力なし）であること。 */
  committed: boolean;
  /** 未コミットの契約状態記録（porcelain 出力のパス。検出時は完了扱いにしない）。 */
  uncommittedStateRecords: readonly string[];
  /** 承認一覧に基づく承認済み検出（承認記録として報告にとどめる）。 */
  approvedAllowances: readonly { path: string; entry: string }[];
  /** 人間確認済みの検出（確認根拠 basis 付きで記録）。 */
  humanConfirmed: readonly { path: string; basis: string }[];
  /** 帰属が機械判定できない検出（人間確認事項。確認なしに完了判定へ進めない）。 */
  humanConfirmationItems: readonly string[];
  /** リポジトリ全体の未追跡かつ gitignore 管理対象外の検出総数。 */
  untrackedTotal: number;
}

export interface CloseMechanicalInput {
  phase: "pre-merge" | "post-merge";
  worktreeRoot: string;
  repoRoot: string;
  branch: string;
  prNumber: number;
  issueBodyPath?: string;
  epicBodyPath?: string;
  epicChildStatusUpdates?: readonly { issue: number; status: PersistedStatus }[];
  mergeablePolling?: { intervalSeconds: number; maxAttempts: number };
  generateIndexesGate?: GateCommandSpec;
  autogenDerivedPaths?: readonly string[];
  traceabilityGate?: GateCommandSpec;
  integrityGates?: readonly GateCommandSpec[];
  integrityMachineAcceptance?: IntegrityMachineAcceptanceRecord;
  textlintGate?: GateCommandSpec;
  cleanup?: { removeWorktree: boolean; removeBranch: string | null };
  acceptanceSubjectKind?: SubjectKind;
  acceptanceVerdicts?: readonly ConditionVerdict[];
  acceptanceCrossObligations?: readonly CrossObligation[];
  acceptanceEmptyBasis?: string;
  /** pre-merge（完了判定工程）で必須の契約状態記録・未追跡残存検査の入力。 */
  contractStateCheck?: ContractStateCheck;
}

export interface StepRecord {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: Record<string, unknown>;
}

export interface CloseMechanicalReport {
  result: {
    phase: "pre-merge" | "post-merge";
    exitCategory: "success" | "needs-judgment" | "failure";
    steps: readonly StepRecord[];
  };
  diff: Record<string, unknown>;
  warnings: readonly string[];
  proposal: Record<string, string>;
}

/** pre-merge 段階で必須の品質ゲート（省略禁止）。 */
export const REQUIRED_GATES_PRE_MERGE = [
  "generate_indexes",
  "traceability-check",
  "full-integrity-suite",
  "textlint-final-check",
] as const;

/** post-merge 段階で必須のステップ（品質ゲートはマージ前に完了済み）。 */
export const REQUIRED_STEPS_POST_MERGE = [
  "post-merge-local-state-check",
  "cleanup-worktree-branch",
] as const;

/**
 * 欠落時に報告 JSON で案内する正規の代替経路（REQ 行の語彙）。
 * 代替経路の履行なしに検査を省略して成功扱いとしないため、欠落時は fail-closed
 * で停止し案内のみを行う。
 */
export const GATE_ALTERNATIVE_ROUTES: readonly string[] = [
  "evidence-preservation（証跡化）: ゲート実行体の欠落を検出事項として証跡化する（本報告 JSON の step detail と warnings、呼出側の検証差分記録への記録）",
  "manual-equivalent-procedure（手動相当手順）: 手動相当の手順で同等の検査を実施し、実行証跡（終了コード、標準出力・標準エラー）を記録する",
  "contrastive-no-worse-proof（対照実行による悪化ゼロ件の機械証明）: baseline 対照の対照実行で既知 fail の悪化ゼロ件を機械証明する",
];

/**
 * 既知 flag の値契約（配布下位検査の契約由来）。未知 flag は検証対象外とする。
 * case-open・case-ready の機械工程 script と同一前提の入力検証（--req の許容書式は
 * traceability checker 契約と同じ REQ-{NNNN}-{MMM} 形式、桁数を固定しない）。
 */
export interface KnownArgContract {
  flag: string;
  values?: readonly string[];
  pattern?: RegExp;
  nonEmpty?: boolean;
}

export const KNOWN_GATE_ARG_CONTRACTS: readonly KnownArgContract[] = [
  { flag: "--req", pattern: /^(REQ-\d{3,4}-\d{3})(,REQ-\d{3,4}-\d{3})*$/ },
  { flag: "--profile", values: ["source", "link"] },
  { flag: "--fail-level", values: ["strict", "warning"] },
  { flag: "--workflow", pattern: /^[a-z][a-z0-9-]*$/ },
  { flag: "--root", nonEmpty: true },
  { flag: "--input", nonEmpty: true },
  { flag: "--artifact", nonEmpty: true },
  { flag: "--evidence", nonEmpty: true },
  { flag: "--revision", nonEmpty: true },
  { flag: "--files", nonEmpty: true },
  { flag: "--base-ref", nonEmpty: true },
];

/** 報告 JSON に記録する意味のある flag の値を抽出する（--flag value / --flag=value の両形式）。 */
export function extractFlagValue(args: readonly string[], flag: string): string | null {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === undefined) continue;
    if (arg === flag && args[i + 1] !== undefined) {
      return args[i + 1] ?? null;
    }
    if (arg.startsWith(`${flag}=`)) {
      return arg.slice(flag.length + 1);
    }
  }
  return null;
}

/**
 * 既知 gate 入力の事前検証。高価な検査の開始前に必須引数・対象・パス・許容値を
 * 検証し、不正値は検査を開始せず MechanicalInputError で拒否する。未知 flag は
 * 検証対象外とし、任意コマンドの汎用解釈器を作らない。
 */
export function preValidateGateSpec(spec: GateCommandSpec): void {
  for (const contract of KNOWN_GATE_ARG_CONTRACTS) {
    const value = extractFlagValue(spec.args, contract.flag);
    if (value === null) continue;
    if (contract.nonEmpty === true && value.trim().length === 0) {
      fail(`${contract.flag} requires a non-empty value`);
    }
    if (contract.values && !contract.values.includes(value)) {
      fail(`${contract.flag} must be one of: ${contract.values.join(", ")} (got: ${value})`);
    }
    if (contract.pattern && !contract.pattern.test(value)) {
      fail(`${contract.flag} value does not match the subordinate command contract: ${value}`);
    }
  }
}

const GATE_SCRIPT_EXTENSIONS = [".ts", ".mts", ".mjs", ".js", ".cjs"];

/**
 * ゲート実行体ファイル（スクリプトパス）の解決。command と args[0] のうち
 * パス区切りまたはスクリプト拡張子をもつ最初の要素を gate cwd 基準で解決する。
 * 実行体ファイルを特定できない場合は null（存在検査対象なし。command 自体の
 * 解決は実行基盤の責務で、ENOENT 等の実行時失敗は既存の実行経路が扱う）。
 */
export function resolveGateExecutablePath(spec: GateCommandSpec): string | null {
  const candidates = [spec.command, spec.args[0]];
  for (const candidate of candidates) {
    if (typeof candidate !== "string" || candidate.length === 0) continue;
    const hasSeparator = /[\\/]/.test(candidate);
    const hasScriptExtension = GATE_SCRIPT_EXTENSIONS.some((ext) => candidate.toLowerCase().endsWith(ext));
    if (hasSeparator || hasScriptExtension) {
      return path.resolve(spec.cwd, candidate);
    }
  }
  return null;
}

export interface GateAvailabilityRecord {
  gate: string;
  available: boolean;
  resolvedExecutable: string | null;
  alternativeRoutes: readonly string[];
}

/**
 * 必須ゲート実行体の配布先での存在検査。欠落時は fail-closed の対象として
 * 検出し、正規の代替経路の案内を報告へ含める。
 */
export function evaluateGateAvailability(
  gates: readonly GateCommandSpec[],
  exists: (absolutePath: string) => boolean,
): { records: readonly GateAvailabilityRecord[]; missing: readonly string[] } {
  const records = gates.map((gate) => {
    const executable = resolveGateExecutablePath(gate);
    const available = executable === null || exists(executable);
    return {
      gate: gate.name,
      available,
      resolvedExecutable: executable,
      alternativeRoutes: available ? [] : GATE_ALTERNATIVE_ROUTES,
    };
  });
  return {
    records,
    missing: records.filter((record) => !record.available).map((record) => record.gate),
  };
}

/** 入力・契約違反。CLI 入口はこのエラーを標準エラー出力と終了コード 1 へ変換する。 */
export class MechanicalInputError extends Error {}

function fail(message: string): never {
  throw new MechanicalInputError(message);
}

function parseArgs(argv: readonly string[]): { input: string } {
  let input: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" && argv[i + 1] !== undefined) {
      input = argv[++i] ?? null;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${USAGE}\n`);
      process.exit(0);
    } else {
      fail(`unknown argument: ${arg}\n${USAGE}`);
    }
  }
  if (input === null) fail(`--input is required\n${USAGE}`);
  return { input };
}

/** 入力 JSON を検証する。必須品質ゲートの欠落（省略）は失敗とする。 */
export function validateInput(value: unknown): CloseMechanicalInput {
  if (typeof value !== "object" || value === null) fail("input must be a JSON object");
  const v = value as Record<string, unknown>;
  if (v.phase !== "pre-merge" && v.phase !== "post-merge") {
    fail('phase must be "pre-merge" or "post-merge"');
  }
  for (const field of ["worktreeRoot", "repoRoot", "branch"] as const) {
    if (typeof v[field] !== "string" || (v[field] as string).length === 0) {
      fail(`input.${field} is required`);
    }
  }
  if (typeof v.prNumber !== "number") fail("input.prNumber is required");
  const input = v as unknown as CloseMechanicalInput;
  if (input.phase === "pre-merge") {
    const missing: string[] = [];
    if (v.generateIndexesGate == null) missing.push("generate_indexes");
    if (v.traceabilityGate == null) missing.push("traceability-check");
    if (!Array.isArray(v.integrityGates) || v.integrityGates.length === 0) {
      missing.push("full-integrity-suite");
    }
    if (v.textlintGate == null) missing.push("textlint-final-check");
    if (typeof v.issueBodyPath !== "string" || (v.issueBodyPath as string).length === 0) {
      missing.push("issue-body-extraction");
    }
    if (v.contractStateCheck == null) {
      missing.push("contract-state-residue-check");
    }
    if (missing.length > 0) {
      fail(
        `required quality gates are missing from input (omission forbidden): ${missing.join(", ")}`,
      );
    }
  }
  const residue = v.contractStateCheck;
  if (residue != null) {
    if (typeof residue !== "object" || Array.isArray(residue)) {
      fail("input.contractStateCheck must be an object");
    }
    const check = residue as ContractStateCheck;
    const isPathList = (value: unknown) =>
      Array.isArray(value) && value.every((p) => typeof p === "string" && p.trim().length > 0);
    if (!isPathList(check.contractStatePaths)) {
      fail("input.contractStateCheck.contractStatePaths must be an array of non-empty strings");
    }
    if (!isPathList(check.approvalEntries)) {
      fail("input.contractStateCheck.approvalEntries must be an array of non-empty strings");
    }
    if (check.humanConfirmedPaths !== undefined) {
      const isConfirmedEntry = (entry: unknown) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as { path?: unknown }).path === "string" &&
        ((entry as { path: string }).path).trim().length > 0 &&
        typeof (entry as { basis?: unknown }).basis === "string" &&
        ((entry as { basis: string }).basis).trim().length > 0;
      if (!Array.isArray(check.humanConfirmedPaths) || !check.humanConfirmedPaths.every(isConfirmedEntry)) {
        fail(
          "input.contractStateCheck.humanConfirmedPaths must be an array of { path, basis } entries",
        );
      }
    }
  }
  return input;
}

/**
 * 完了条件チェックボックスの機械的抽出（評価はモデルが担当する）。
 * 入力契約は LF 正規化済みの本文であり、CRLF は呼び出し側が
 * issueBodyPath 読取直後に LF へ正規化して渡す。
 */
export function extractCompletionCheckboxes(
  issueBody: string,
): { total: number; checked: number; items: readonly { text: string; checked: boolean }[] } {
  const items: { text: string; checked: boolean }[] = [];
  for (const line of issueBody.split("\n")) {
    const match = line.match(/^\s*-\s+\[([ xX])\]\s+(.*)$/);
    if (!match) continue;
    items.push({ text: (match[2] ?? "").trim(), checked: match[1] !== " " });
  }
  return { total: items.length, checked: items.filter((i) => i.checked).length, items };
}

/**
 * 完了条件チェックボックス抽出の結果から受入評価の母集団を導出する
 * （抽出フェーズが母集団導出を兼ねる。case-close Design「機械工程の script
 * 呼び出し契約」節）。抽出失敗は extractionSucceeded: false とし、空の抽出を
 * 「条件なし」へ変換しない（0 件抽出は emptyBasis を根拠に主張される）。
 * 完了条件チェックボックスはすべて必須完了条件であるため、総数を必須数として
 * 扱う。
 */
export function deriveAcceptancePopulation(
  extraction: { total: number } | null,
  emptyBasis?: string,
): ConditionPopulation {
  if (extraction === null) {
    return {
      extractionSucceeded: false,
      contractConditionCount: null,
      contractRequiredCount: null,
    };
  }
  return {
    extractionSucceeded: true,
    contractConditionCount: extraction.total,
    contractRequiredCount: extraction.total,
    emptyBasis: extraction.total === 0 ? emptyBasis : undefined,
  };
}

/** repoRoot 相対パスの正規化（区切り統一・先頭 ./ と末尾 / の除去）。 */
function normalizeRelPath(value: string): string {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/+$/, "");
}

function isUnderPath(candidate: string, base: string): boolean {
  return candidate === base || candidate.startsWith(`${base}/`);
}

/**
 * 契約状態記録・未追跡残存検査の決定的判定。
 * stateRecordStatus は `git status --porcelain -- <状態記録パス群>`（repoRoot 実行）の
 * stdout、untrackedListing は `git ls-files --others --exclude-standard`（repoRoot 実行）の
 * stdout である。検出は (1) 状態記録パス配下＝当該 Case 由来の未コミット記録、
 * (2) 承認一覧一致＝承認済み、(3) 人間確認済み記録一致、(4) それ以外＝帰属が機械判定
 * できない検出（人間確認事項）に分類する。検査の承認を自動追加しない。
 */
export function evaluateContractStateResidue(
  check: ContractStateCheck,
  stateRecordStatus: string,
  untrackedListing: string,
): ContractStateResidueEvaluation {
  const statePaths = check.contractStatePaths.map(normalizeRelPath).filter((p) => p.length > 0);
  const approvalEntries = check.approvalEntries.map(normalizeRelPath).filter((p) => p.length > 0);
  const confirmedBasis = new Map<string, string>();
  for (const entry of check.humanConfirmedPaths ?? []) {
    confirmedBasis.set(normalizeRelPath(entry.path), entry.basis);
  }
  const uncommittedStateRecords: string[] = [];
  for (const line of stateRecordStatus.split("\n")) {
    if (line.trim().length === 0) continue;
    const recordPath = normalizeRelPath(line.trim().slice(3));
    if (recordPath.length > 0) uncommittedStateRecords.push(recordPath);
  }
  const approvedAllowances: { path: string; entry: string }[] = [];
  const humanConfirmed: { path: string; basis: string }[] = [];
  const humanConfirmationItems: string[] = [];
  let untrackedTotal = 0;
  for (const line of untrackedListing.split("\n")) {
    const detection = normalizeRelPath(line);
    if (detection.length === 0) continue;
    untrackedTotal += 1;
    if (statePaths.some((p) => isUnderPath(detection, p))) continue;
    const approval = approvalEntries.find((entry) => isUnderPath(detection, entry));
    if (approval !== undefined) {
      approvedAllowances.push({ path: detection, entry: approval });
      continue;
    }
    const basis = confirmedBasis.get(detection);
    if (basis !== undefined) {
      humanConfirmed.push({ path: detection, basis });
      continue;
    }
    humanConfirmationItems.push(detection);
  }
  return {
    committed: uncommittedStateRecords.length === 0,
    uncommittedStateRecords,
    approvedAllowances,
    humanConfirmed,
    humanConfirmationItems,
    untrackedTotal,
  };
}

/** 報告 JSON に含める受入評価の結果（母集団・判定・拒否理由）。 */
export interface AcceptanceEvaluationReport {
  determined: boolean;
  population: ConditionPopulation;
  closeAllowed?: boolean;
  populationState?: string;
  violations?: unknown;
  blockingUnmet?: readonly string[];
  blockingCrossObligations?: readonly string[];
}

/**
 * full integrity suite の fail に対する機械受理基準（QG-4 最終受入規範の受理由件10項目）
 * の記録完備を検証する。boolean や申告フラグに依存せず、記録実体の存在・形式・件数突合を
 * 検証する。規範が合格として認める結果（記録実体完備・由来不明 0・既知欠陥登録済みで
 * pre-existing 分類済み fail を含む）を合格として扱い、機械受理基準の記録欠落、由来不明
 * fail の残存、未登録の既知欠陥を合格の根拠にする結果を fail-closed で拒否する。
 * 検証ランナーの非ゼロ終了コードを成功へ変換せず、分類記録の検証は終了コードの変換では
 * なく独立の判定層として重ねる。
 */
export function evaluateIntegrityMachineAcceptance(
  record: IntegrityMachineAcceptanceRecord | undefined,
  gateResults: readonly IntegrityGateResult[],
): { accepted: boolean; violations: readonly MachineAcceptanceViolation[] } {
  const failedGates = gateResults.filter((g) => g.exitCode !== 0);
  const recordMissing =
    typeof record !== "object" ||
    record === null ||
    !Array.isArray(record.failureOrigins) ||
    !Array.isArray(record.observedFailCounts) ||
    !Array.isArray(record.suiteRunRecords);
  if (recordMissing) {
    if (failedGates.length > 0) {
      return { accepted: false, violations: [{ code: "machine-acceptance-record-missing" }] };
    }
    return { accepted: true, violations: [] };
  }
  const violations: MachineAcceptanceViolation[] = [];
  const executedGateNames = new Set(gateResults.map((g) => g.name));
  const failedGateNames = new Set(failedGates.map((g) => g.name));

  // 観測 fail 件数（件数突合の基準実体。受理由件4）の形式検証。
  const failCountByGate = new Map<string, number>();
  for (const observed of record.observedFailCounts) {
    const valid =
      typeof observed === "object" &&
      observed !== null &&
      typeof observed.gate === "string" &&
      observed.gate.length > 0 &&
      typeof observed.failCount === "number" &&
      Number.isInteger(observed.failCount) &&
      observed.failCount >= 0;
    if (!valid) {
      violations.push({
        code: "observed-fail-count-invalid",
        gate: typeof (observed as { gate?: unknown })?.gate === "string" ? (observed as { gate: string }).gate : undefined,
      });
      continue;
    }
    if (failCountByGate.has(observed.gate)) {
      violations.push({ code: "observed-fail-count-duplicate", gate: observed.gate });
      continue;
    }
    failCountByGate.set(observed.gate, observed.failCount);
  }

  // gate 実行結果との実体突合: 非ゼロ終了 gate は観測 fail 件数を必要とし、
  // ゼロ終了 gate への fail 件数付与は矛盾として拒否する。
  for (const gate of failedGates) {
    const failCount = failCountByGate.get(gate.name);
    if (failCount === undefined || failCount < 1) {
      violations.push({ code: "uncovered-failure-origin", gate: gate.name });
    }
  }
  for (const [gate, failCount] of failCountByGate) {
    if (!executedGateNames.has(gate)) {
      violations.push({ code: "observed-fail-count-for-unexecuted-gate", gate });
    } else if (!failedGateNames.has(gate) && failCount > 0) {
      violations.push({
        code: "fail-count-conflicts-with-passing-gate",
        gate,
        expected: 0,
        actual: failCount,
      });
    }
  }

  // fail 単位の分類完備（受理由件5）。1 gate 内の fail 全件に1:1の分類レコードを
  // 要求し、由来不明・未分類の fail 残存は拒否する。
  const originCountByGate = new Map<string, number>();
  const seenOrigins = new Set<string>();
  for (const origin of record.failureOrigins) {
    if (typeof origin !== "object" || origin === null || typeof origin.gate !== "string" || origin.gate.length === 0) {
      violations.push({ code: "failure-origin-record-invalid" });
      continue;
    }
    originCountByGate.set(origin.gate, (originCountByGate.get(origin.gate) ?? 0) + 1);
    const key = `${origin.gate}::${String(origin.failureId)}`;
    if (
      typeof origin.failureId !== "string" ||
      origin.failureId.length === 0 ||
      seenOrigins.has(key)
    ) {
      violations.push({
        code: seenOrigins.has(key) ? "duplicate-failure-origin" : "failure-origin-record-invalid",
        gate: origin.gate,
        failureId: typeof origin.failureId === "string" ? origin.failureId : undefined,
      });
      if (seenOrigins.has(key)) continue;
    }
    seenOrigins.add(key);
    if (!executedGateNames.has(origin.gate)) {
      violations.push({ code: "failure-origin-for-unexecuted-gate", gate: origin.gate });
    } else if (!failedGateNames.has(origin.gate)) {
      violations.push({
        code: "failure-origin-conflicts-with-passing-gate",
        gate: origin.gate,
        failureId: origin.failureId,
      });
    }
    if (
      origin.origin !== "changed" &&
      origin.origin !== "pre-existing" &&
      origin.origin !== "execution-form" &&
      origin.origin !== "unknown"
    ) {
      violations.push({
        code: "failure-origin-classification-invalid",
        gate: origin.gate,
        failureId: origin.failureId,
      });
    }
    if (origin.origin === "unknown") {
      violations.push({ code: "unknown-origin-failure-remains", failureId: origin.failureId });
    }
    if (origin.origin === "pre-existing") {
      const reproduction = origin.baselineReproduction;
      if (
        typeof reproduction !== "object" ||
        reproduction === null ||
        reproduction.method !== "detached-worktree" ||
        reproduction.sameFailureReproduced !== true ||
        typeof reproduction.baselineCommit !== "string" ||
        reproduction.baselineCommit.length === 0
      ) {
        violations.push({
          code: "pre-existing-baseline-reproduction-missing",
          failureId: origin.failureId,
        });
      }
    }
    if (origin.origin === "execution-form") {
      const reexecution = origin.conformanceReexecution;
      if (
        typeof reexecution !== "object" ||
        reexecution === null ||
        typeof reexecution.evidencePath !== "string" ||
        reexecution.evidencePath.length === 0 ||
        typeof reexecution.exitCode !== "number" ||
        reexecution.resolvedAfterConformingRerun !== true
      ) {
        violations.push({
          code: "execution-form-reexecution-not-adopted",
          failureId: origin.failureId,
        });
      }
    }
    if (typeof origin.registrationRef !== "string" || origin.registrationRef.length === 0) {
      violations.push({ code: "unregistered-known-defect", failureId: origin.failureId });
    }
  }

  // 件数突合（受理由件4・5）: fail 総数と分類レコード数の gate 単位の一致。
  const reconciledGates = new Set([...failCountByGate.keys(), ...originCountByGate.keys()]);
  for (const gate of reconciledGates) {
    const observed = failCountByGate.get(gate);
    const classified = originCountByGate.get(gate) ?? 0;
    if (observed !== undefined && observed !== classified) {
      violations.push({
        code: "failure-origin-count-mismatch",
        gate,
        expected: observed,
        actual: classified,
      });
    }
  }

  // 記録実体の存在・形式検証（受理由件1・2・3・6・9・10。boolean 申告ではなく実体）。
  const constitution = record.runnerConstitution;
  if (
    typeof constitution !== "object" ||
    constitution === null ||
    typeof constitution.confirmedRunner !== "string" ||
    constitution.confirmedRunner.length === 0 ||
    typeof constitution.basis !== "string" ||
    constitution.basis.length === 0
  ) {
    violations.push({ code: "record-missing:runner-constitution" });
  }
  if (record.suiteRunRecords.length === 0) {
    violations.push({ code: "record-missing:standard-form-execution" });
  }
  const seenSplits = new Set<string>();
  for (const run of record.suiteRunRecords) {
    const valid =
      typeof run === "object" &&
      run !== null &&
      typeof run.split === "string" &&
      run.split.length > 0 &&
      !seenSplits.has(run.split) &&
      typeof run.command === "string" &&
      run.command.length > 0 &&
      typeof run.cwd === "string" &&
      run.cwd.length > 0 &&
      typeof run.testCountSummary === "string" &&
      run.testCountSummary.length > 0 &&
      typeof run.exitCode === "number" &&
      typeof run.scope === "string" &&
      run.scope.length > 0;
    if (!valid) {
      violations.push({
        code: seenSplits.has(String((run as IntegritySuiteRunRecord | null)?.split))
          ? "duplicate-suite-run-record"
          : "suite-run-record-invalid",
      });
      continue;
    }
    seenSplits.add(run.split);
  }
  const label = record.environmentLabel;
  if (
    typeof label !== "object" ||
    label === null ||
    typeof label.runtime !== "string" ||
    label.runtime.length === 0 ||
    typeof label.junctionPropagation !== "string" ||
    label.junctionPropagation.length === 0 ||
    typeof label.dependencies !== "string" ||
    label.dependencies.length === 0
  ) {
    violations.push({ code: "record-missing:environment-label" });
  }
  if (typeof record.baselineReferenceCommit !== "string" || record.baselineReferenceCommit.length === 0) {
    violations.push({ code: "record-missing:baseline-reference-commit" });
  }
  if (typeof record.runnerVersion !== "string" || record.runnerVersion.length === 0) {
    violations.push({ code: "record-missing:runner-version" });
  }
  return { accepted: violations.length === 0, violations };
}

/**
 * 報告 JSON から終了操作（issue_close、Epic 終了、Wave クローズ）の実行可否を
 * 決定的に判定する。既存終了経路（case-close STEP-5、E1〜E6）が消費する gate
 * であり、受入評価の拒否・未確定は終了操作の前提を満たさない。
 */
export function isCloseOperationPermitted(
  report: CloseMechanicalReport,
): { permitted: boolean; reason?: string } {
  const evaluation = report.diff.acceptanceEvaluation as
    | AcceptanceEvaluationReport
    | undefined;
  if (evaluation === undefined || evaluation.determined !== true) {
    return { permitted: false, reason: "acceptance-evaluation-undetermined" };
  }
  if (evaluation.closeAllowed !== true) {
    return { permitted: false, reason: "acceptance-denied" };
  }
  if (report.result.exitCategory === "failure") {
    return { permitted: false, reason: "mechanical-failure" };
  }
  return { permitted: true };
}

/**
 * 実行構成表から現在 Wave を特定する（投入順序に依存しない決定的導出）。
 * 現在 Wave は非終端（pending）行を含む最小 Wave 番号。全行が終端状態の場合は
 * null（反復完遂）。
 */
export function deriveCurrentWave(
  body: string,
): { currentWave: number | null; waves: readonly { wave: number; total: number; terminal: number }[] } {
  const rowLinePattern = /^\|\s*(\d+)\s*\|\s*#\d+\s*\|/;
  const waveStats = new Map<number, { total: number; terminal: number }>();
  for (const line of body.split("\n")) {
    const match = line.match(rowLinePattern);
    if (!match) continue;
    const wave = Number(match[1]);
    const cells = line.split("|");
    const statusIndex = cells.length - 2;
    const parsed = parseStatusCell(cells[statusIndex] ?? "");
    if (!parsed) continue;
    const stat = waveStats.get(wave) ?? { total: 0, terminal: 0 };
    stat.total += 1;
    if (parsed.status !== "pending") stat.terminal += 1;
    waveStats.set(wave, stat);
  }
  const waves = [...waveStats.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([wave, stat]) => ({ wave, total: stat.total, terminal: stat.terminal }));
  const current = waves.find((w) => w.terminal < w.total);
  return { currentWave: current ? current.wave : null, waves };
}

/** Epic 実行構成表の子状態更新を適用した本文候補を生成する（書込みはモデルが行う）。 */
export function applyEpicChildStatusUpdates(
  body: string,
  updates: readonly { issue: number; status: PersistedStatus }[],
): { body: string; applied: readonly number[]; skipped: readonly { issue: number; reason: string }[] } {
  let current = body;
  const applied: number[] = [];
  const skipped: { issue: number; reason: string }[] = [];
  for (const update of updates) {
    const existing = readChildStatus(current, update.issue);
    if (existing === null) {
      skipped.push({ issue: update.issue, reason: "row-not-found" });
      continue;
    }
    if (existing.status !== "pending") {
      skipped.push({ issue: update.issue, reason: `already-${existing.status}` });
      continue;
    }
    const replaced = replaceChildStatus(current, update.issue, update.status);
    if (replaced === null) {
      skipped.push({ issue: update.issue, reason: "replace-failed" });
      continue;
    }
    current = replaced;
    applied.push(update.issue);
  }
  return { body: current, applied, skipped };
}

/** 報告 JSON を組み立てる（実行結果・差分・警告・提案本文の4要素）。 */
export function assembleReport(
  phase: CloseMechanicalInput["phase"],
  steps: readonly StepRecord[],
  diff: Record<string, unknown>,
  warnings: readonly string[],
  proposal: Record<string, string>,
): CloseMechanicalReport {
  const hasFail = steps.some((step) => step.status === "fail");
  const hasWarn = steps.some((step) => step.status === "warn");
  return {
    result: {
      phase,
      exitCategory: hasFail ? "failure" : hasWarn ? "needs-judgment" : "success",
      steps,
    },
    diff,
    warnings,
    proposal,
  };
}

/** 報告から終了コードを決定する（成功 0、要判断 2、失敗 1）。 */
export function decideExitCode(report: CloseMechanicalReport): number {
  if (report.result.exitCategory === "failure") return 1;
  if (report.result.exitCategory === "needs-judgment") return 2;
  return 0;
}

function runSpec(runner: MechanicalRunner, spec: GateCommandSpec): CommandResult {
  return runner.run({ command: spec.command, args: spec.args, cwd: spec.cwd, timeoutMs: spec.timeoutMs });
}

function runAcceptanceEvaluation(
  input: CloseMechanicalInput,
  population: ConditionPopulation,
  steps: StepRecord[],
): AcceptanceEvaluationReport {
  if (input.acceptanceVerdicts === undefined) {
    // 判定入力未提供時は受入評価は未確定（未確定は終了操作の前提を満たさない）。
    return { determined: false, population };
  }
  const evaluation = evaluateFinalAcceptance({
    subjectKind: input.acceptanceSubjectKind ?? "child-issue",
    population,
    verdicts: input.acceptanceVerdicts,
    crossObligations: input.acceptanceCrossObligations,
  });
  steps.push({
    name: "final-acceptance-evaluation",
    status: evaluation.closeAllowed ? "pass" : "fail",
    detail: {
      subjectKind: input.acceptanceSubjectKind ?? "child-issue",
      closeAllowed: evaluation.closeAllowed,
      populationState: evaluation.populationState,
      violations: evaluation.violations,
      blockingUnmet: evaluation.blockingUnmet,
      blockingCrossObligations: evaluation.blockingCrossObligations,
    },
  });
  return {
    determined: true,
    population,
    closeAllowed: evaluation.closeAllowed,
    populationState: evaluation.populationState,
    violations: evaluation.violations,
    blockingUnmet: evaluation.blockingUnmet,
    blockingCrossObligations: evaluation.blockingCrossObligations,
  };
}

/** 機械工程を実行し、報告 JSON を返す（省略なし。失敗時は fail step を含める）。 */
export function runCloseMechanicalSteps(
  input: CloseMechanicalInput,
  runner: MechanicalRunner,
): CloseMechanicalReport {
  const steps: StepRecord[] = [];
  const warnings: string[] = [];
  const diff: Record<string, unknown> = {};
  const proposal: Record<string, string> = {};
  const worktreeCwd = path.resolve(input.repoRoot, input.worktreeRoot);

  if (input.phase === "pre-merge") {
    for (const spec of [...(input.integrityGates ?? []), input.generateIndexesGate, input.traceabilityGate, input.textlintGate]) {
      if (spec != null) preValidateGateSpec(spec);
    }
    const availability = evaluateGateAvailability(
      [...(input.integrityGates ?? []), input.generateIndexesGate, input.traceabilityGate, input.textlintGate].filter(
        (spec): spec is GateCommandSpec => spec != null,
      ),
      (absolutePath) => runner.exists(absolutePath),
    );
    steps.push({
      name: "gate-availability",
      status: availability.missing.length > 0 ? "fail" : "pass",
      detail: { gates: availability.records },
    });
    if (availability.missing.length > 0) {
      warnings.push(
        `required gate executable is missing in the deployment environment (omission and success are not allowed): ${availability.missing.join(", ")}. alternative routes: ${GATE_ALTERNATIVE_ROUTES.join(" / ")}`,
      );
      return assembleReport(input.phase, steps, diff, warnings, proposal);
    }
    const polling = input.mergeablePolling ?? { intervalSeconds: 10, maxAttempts: 30 };
    let mergeable = "UNKNOWN";
    let attempts = 0;
    for (; attempts < polling.maxAttempts; attempts++) {
      const view = runner.run({
        command: "gh",
        args: ["pr", "view", String(input.prNumber), "--json", "mergeable,mergeStateStatus,state"],
        cwd: input.repoRoot,
      });
      if (view.exitCode !== 0) {
        steps.push({ name: "mergeable-polling", status: "fail", detail: { error: view.stderr.trim() } });
        return assembleReport(input.phase, steps, diff, warnings, proposal);
      }
      const parsed = JSON.parse(view.stdout) as { mergeable?: string };
      mergeable = parsed.mergeable ?? "UNKNOWN";
      if (mergeable === "MERGEABLE") break;
      if (mergeable === "CONFLICTING") break;
      runner.sleep(polling.intervalSeconds * 1000);
    }
    steps.push({
      name: "mergeable-polling",
      status: mergeable === "MERGEABLE" ? "pass" : "warn",
      detail: { mergeable, attempts: attempts + 1 },
    });
    if (mergeable !== "MERGEABLE") {
      warnings.push(`mergeable state is ${mergeable} after polling (要判断)`);
    }

    const status = runner.run({ command: "git", args: ["status", "--porcelain"], cwd: worktreeCwd });
    const branch = runner.run({ command: "git", args: ["branch", "--show-current"], cwd: worktreeCwd });
    const dirty = status.stdout.trim().length > 0;
    const branchOk = branch.stdout.trim() === input.branch;
    steps.push({
      name: "pre-merge-local-state-check",
      status: dirty || !branchOk ? "fail" : "pass",
      detail: { worktreeDirty: dirty, currentBranch: branch.stdout.trim(), expectedBranch: input.branch },
    });
    if (dirty) warnings.push("worktree has uncommitted changes before squash merge");
    if (!branchOk) warnings.push("worktree is not on the expected branch");

    let extraction: ReturnType<typeof extractCompletionCheckboxes> | null = null;
    if (input.issueBodyPath) {
      // CRLF→LF 正規化の前置。Windows CRLF 既定環境で issueBodyPath ファイルが
      // CRLF で書き出されても checkbox 認識が欠落しないようにするため、
      // 読取直後（checkbox 抽出前）のこの位置で入力契約を満たす。
      const body = runner.readTextFile(input.issueBodyPath).replace(/\r\n/g, "\n");
      extraction = extractCompletionCheckboxes(body);
      steps.push({
        name: "completion-checkbox-extraction",
        status: "pass",
        detail: { total: extraction.total, checked: extraction.checked },
      });
      proposal.completion_checkboxes = JSON.stringify(extraction.items, null, 2);
    } else {
      steps.push({
        name: "completion-checkbox-extraction",
        status: "fail",
        detail: { reason: "issueBodyPath is required for machine extraction" },
      });
    }

    // 抽出フェーズが受入評価の母集団導出を兼ねる。抽出失敗は
    // extractionSucceeded: false の母集団になり、受入評価で fail-closed に
    // 拒否される（空の抽出を「条件なし」へ変換しない）。
    const acceptancePopulation = deriveAcceptancePopulation(
      extraction,
      input.acceptanceEmptyBasis,
    );
    diff.acceptanceEvaluation = runAcceptanceEvaluation(
      input,
      acceptancePopulation,
      steps,
    );

    // 契約状態記録・未追跡残存検査（完了判定工程）。検証範囲は
    // 正規契約から導出した全状態記録パスとリポジトリ全体の未追跡対象であり、
    // 変更ファイルのみの確認では代替しない。未コミット・帰属不能残存の検出時は
    // 完了扱いとせず、帰属不能検出は完了判定の前に人間確認事項として報告する
    // （確認なしに完了判定へ進めない。fail-closed）。
    const residueInput = input.contractStateCheck
      ?? fail("input.contractStateCheck is required for pre-merge completion determination");
    const stateRecordStatus = residueInput.contractStatePaths.length > 0
      ? runner.run({
        command: "git",
        args: ["status", "--porcelain", "--", ...residueInput.contractStatePaths],
        cwd: input.repoRoot,
      })
      : { exitCode: 0, stdout: "", stderr: "" };
    const untrackedListing = runner.run({
      command: "git",
      args: ["ls-files", "--others", "--exclude-standard"],
      cwd: input.repoRoot,
    });
    const gitCheckOk = stateRecordStatus.exitCode === 0 && untrackedListing.exitCode === 0;
    const residue = evaluateContractStateResidue(
      residueInput,
      stateRecordStatus.stdout,
      untrackedListing.stdout,
    );
    const residueFailed = !gitCheckOk || !residue.committed || residue.humanConfirmationItems.length > 0;
    steps.push({
      name: "contract-state-residue-check",
      status: residueFailed ? "fail" : "pass",
      detail: {
        repoRoot: input.repoRoot,
        gitCheckOk,
        evaluatedStateRecordPathCount: residueInput.contractStatePaths.length,
        committed: residue.committed,
        uncommittedStateRecords: residue.uncommittedStateRecords,
        untrackedTotal: residue.untrackedTotal,
        approvedAllowances: residue.approvedAllowances,
        humanConfirmed: residue.humanConfirmed,
        humanConfirmationItems: residue.humanConfirmationItems,
      },
    });
    diff.contractStateResidue = { ...residue };
    if (!residue.committed) {
      warnings.push(
        `contract state records have uncommitted changes before completion judgment: ${residue.uncommittedStateRecords.join(", ")}`,
      );
    }
    if (residue.humanConfirmationItems.length > 0) {
      warnings.push(
        `untracked residue with undeterminable attribution requires human confirmation before completion judgment: ${residue.humanConfirmationItems.join(", ")}`,
      );
    }

    if (input.generateIndexesGate) {
      const gen = runSpec(runner, input.generateIndexesGate);
      const derivedPaths = input.autogenDerivedPaths ?? [];
      let diffOutput = "";
      if (gen.exitCode === 0) {
        const gitDiff = runner.run({
          command: "git",
          args: ["diff", "--stat", "--", ...derivedPaths],
          cwd: worktreeCwd,
        });
        diffOutput = gitDiff.stdout.trim();
        if (diffOutput.length > 0) {
          runner.run({ command: "git", args: ["checkout", "--", ...derivedPaths], cwd: worktreeCwd });
          warnings.push("AUTOGEN derived files differ after regeneration (restore applied). Regenerate and include in the PR before merge");
        }
      }
      steps.push({
        name: "autogen-regeneration-diff",
        status: gen.exitCode === 0 ? (diffOutput.length > 0 ? "warn" : "pass") : "fail",
        detail: { exitCode: gen.exitCode, diffStat: diffOutput },
      });
      diff.autogenRegeneration = { exitCode: gen.exitCode, diffStat: diffOutput };
    }

    if (input.traceabilityGate) {
      const check = runSpec(runner, input.traceabilityGate);
      let summary = "";
      if (check.exitCode === 0) {
        try {
          const parsed = JSON.parse(check.stdout) as { summary?: { pass?: number; fail?: number } };
          summary = `pass=${parsed.summary?.pass ?? "?"} fail=${parsed.summary?.fail ?? "?"}`;
        } catch {
          summary = "report parse failed";
        }
      }
      steps.push({
        name: "traceability-check",
        status: check.exitCode === 0 ? "pass" : "fail",
        detail: { exitCode: check.exitCode, summary },
      });
    }

    const integrityResults: Record<string, { exitCode: number; stdout: string }> = {};
    const gateResults: IntegrityGateResult[] = [];
    for (const gate of input.integrityGates ?? []) {
      const result = runSpec(runner, gate);
      integrityResults[gate.name] = { exitCode: result.exitCode, stdout: result.stdout };
      gateResults.push({ name: gate.name, exitCode: result.exitCode });
    }
    // 分類記録の検証は終了コードの変換ではなく独立の判定層。機械受理基準を満たす
    // 記録実体で分類済み fail が残る場合は規範の判定に従い受理し、記録欠落・由来不明
    // fail の残存・未登録の既知欠陥は fail-closed で拒否する。非ゼロ終了コードは
    // 各 gate の記録として変換せず保持する。
    const machineAcceptance = evaluateIntegrityMachineAcceptance(
      input.integrityMachineAcceptance,
      gateResults,
    );
    steps.push({
      name: "full-integrity-suite",
      status: machineAcceptance.accepted ? "pass" : "fail",
      detail: {
        ...integrityResults,
        machineAcceptance: {
          accepted: machineAcceptance.accepted,
          violations: machineAcceptance.violations,
          failedGateNames: gateResults.filter((g) => g.exitCode !== 0).map((g) => g.name),
        },
      },
    });
    diff.integrityMachineAcceptance = {
      accepted: machineAcceptance.accepted,
      violations: machineAcceptance.violations,
      failedGateNames: gateResults.filter((g) => g.exitCode !== 0).map((g) => g.name),
      observedFailCounts: input.integrityMachineAcceptance?.observedFailCounts ?? [],
      failureOrigins: input.integrityMachineAcceptance?.failureOrigins ?? [],
    };

    if (input.textlintGate) {
      const lint = runSpec(runner, input.textlintGate);
      steps.push({
        name: "textlint-final-check",
        status: lint.exitCode === 0 ? "pass" : "fail",
        detail: { exitCode: lint.exitCode, stderrTail: lint.stderr.trim().slice(-400) },
      });
    }

    if (input.epicBodyPath && input.epicChildStatusUpdates) {
      const epicBody = runner.readTextFile(input.epicBodyPath);
      const waveInfo = deriveCurrentWave(epicBody);
      const applied = applyEpicChildStatusUpdates(epicBody, input.epicChildStatusUpdates);
      steps.push({
        name: "epic-table-analysis",
        status: applied.skipped.length > 0 ? "warn" : "pass",
        detail: {
          currentWave: waveInfo.currentWave,
          waves: waveInfo.waves,
          applied: applied.applied,
          skipped: applied.skipped,
          terminalCounts: countChildStatuses(epicBody),
        },
      });
      proposal.epic_body = applied.body;
      if (applied.skipped.length > 0) {
        warnings.push(
          `epic child status update skipped: ${applied.skipped.map((s) => `#${s.issue}(${s.reason})`).join(", ")}`,
        );
      }
    }
  } else {
    const removed = runner.run({
      command: "git",
      args: ["worktree", "remove", worktreeCwd],
      cwd: input.repoRoot,
    });
    let branchDeleted: CommandResult | null = null;
    if (input.cleanup?.removeBranch) {
      branchDeleted = runner.run({
        command: "git",
        args: ["branch", "-d", input.cleanup.removeBranch],
        cwd: input.repoRoot,
      });
    }
    const branchGone = runner.run({
      command: "git",
      args: ["branch", "--list", input.branch],
      cwd: input.repoRoot,
    });
    const cleanupOk =
      (input.cleanup?.removeWorktree === false || removed.exitCode === 0) &&
      (branchDeleted === null || branchDeleted.exitCode === 0) &&
      branchGone.stdout.trim().length === 0;
    steps.push({
      name: "post-merge-local-state-check",
      status: "pass",
      detail: { postMerge: true, repoRoot: input.repoRoot },
    });
    steps.push({
      name: "cleanup-worktree-branch",
      status: cleanupOk ? "pass" : "warn",
      detail: {
        worktreeRemoveExitCode: removed.exitCode,
        branchDeleteExitCode: branchDeleted?.exitCode ?? null,
        branchListOutput: branchGone.stdout.trim(),
      },
    });
    if (!cleanupOk) warnings.push("worktree/branch cleanup did not fully complete (要判断)");
  }

  return assembleReport(input.phase, steps, diff, warnings, proposal);
}

function main(): void {
  try {
    const { input } = parseArgs(process.argv.slice(2));
    let raw: string;
    try {
      raw = fs.readFileSync(input, "utf-8");
    } catch (error) {
      fail(`cannot read input file: ${input} (${String(error)})`);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      fail(`input is not valid JSON: ${String(error)}`);
    }
    const validated = validateInput(parsed);
    const repoRootAbsolute = path.resolve(validated.repoRoot);
    const normalized: CloseMechanicalInput = { ...validated, repoRoot: repoRootAbsolute };
    const runner: MechanicalRunner = {
      exists(absolutePath) {
        return fs.existsSync(absolutePath);
      },
      run(spec) {
        const result = spawnSync(spec.command, [...spec.args], {
          cwd: spec.cwd,
          encoding: "utf-8",
          timeout: spec.timeoutMs,
          maxBuffer: 64 * 1024 * 1024,
        });
        return {
          exitCode: result.status ?? 1,
          stdout: result.stdout ?? "",
          stderr: result.stderr ?? "",
        };
      },
      readTextFile(absolutePath) {
        return fs.readFileSync(absolutePath, "utf-8");
      },
      sleep(ms) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
      },
    };
    const report = runCloseMechanicalSteps(normalized, runner);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exit(decideExitCode(report));
  } catch (error) {
    if (error instanceof MechanicalInputError) {
      process.stderr.write(`error: ${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}

const isDirectExecution = process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.path);
if (isDirectExecution) {
  main();
}
