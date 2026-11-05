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
  type SubjectKind,
} from "./final-acceptance.ts";
import {
  evaluateDeletionConfirmationFromLedgerText,
  type DeletionTargetObservation,
  type UserDeletionConfirmation,
} from "./deletion-confirmation.ts";
import {
  reclaimCloseAcceptanceRecord,
  reclaimLedger,
  type CloseAcceptanceReclamationResult,
  type LedgerReclamationResult,
  type ReclamationConfirmation,
  type ReclamationIo,
} from "./verification-resource-reclamation.ts";
import { REQ_ROW_ID_LIST_PATTERN } from "../../../agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts";
import {
  readLedger,
  resolveLedgerPath,
  resolveMainRepoRoot,
  type LedgerIo,
  type LedgerReadResult,
  type VerificationResourceEntry,
  type VerificationResourceOwnership,
} from "./verification-resources-ledger.ts";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts --input <input.json> [--validate-input]
  --input           機械工程入力 JSON（phase、worktree_root、PR番号、品質ゲート実行仕様等）
  --validate-input  検証専用経路。入力 JSON の契約検証・既知 gate 引数契約検査・ゲート実行体の
                    存在確認のみを行い（worktree 作成・ゲート実行・git/gh 操作・管理対象ファイル
                    変更なし）、報告 JSON を stdout へ出力する（合格 0 / 不合格 1）`;

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
  /** 台帳・終了判定記録の書出し（pre-merge 照合で使用）。未提供時は照合が成立しない。 */
  writeTextFile?(absolutePath: string, content: string): void;
  mkdirRecursive?(absolutePath: string): void;
  removeFile?(absolutePath: string): void;
  /** メインrepo root 解決（worktree 非依存。メインrepo の .git 絶対パスを返す）。 */
  gitCommonDir?(): string;
  /** 回収実行面（台帳回収・終了判定記録回収）で使用するファイル削除。未提供時は回収ステップを fail で報告する。 */
  deleteFile?(absolutePath: string): void;
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

/** 終了操作完了後の回収指定（post-merge のみ。pre-merge では入力検証で拒否する）。 */
export interface ReclamationSection {
  /** 台帳（追跡記録）自体の終了時回収。指定時のみ実行する。 */
  ledger?: {
    mainRepoRoot: string;
    caseId: string;
    confirmation: ReclamationConfirmation;
  };
  /** 終了判定記録（.agentdev/close-acceptance/）の終了後回収。指定時のみ実行する。 */
  closeAcceptanceRecord?: {
    recordPath: string;
    terminalOperationCompleted: boolean;
  };
}

export interface CloseMechanicalInput {
  phase: "pre-merge" | "post-merge";
  worktreeRoot: string;
  repoRoot: string;
  branch: string;
  prNumber: number;
  /** Fresh issue_read revision (`updated_at`/Local frontmatter `updated_at`), never a git commit. */
  issueUpdatedAt?: string;
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
  /** pre-merge（完了判定工程）で必須の検証用一時資材照合の入力（case-close 実行契約の照合規定）。 */
  verificationResourceCheck?: VerificationResourceCheck;
  /**
   * 一時資材回収の削除確認チェック（削除実行の確認境界の判定材料）。
   * ledgerPath はメインrepo root 基準の台帳ファイル絶対パス。省略時は
   * deletion-confirmation-check step を実行しない（削除対象の存在検出は
   * 照合・完了拒否の本体側が所有する）。
   */
  deletionConfirmationCheck?: {
    ledgerPath: string;
    confirmations: readonly UserDeletionConfirmation[];
    observations: readonly DeletionTargetObservation[];
  };
  /** post-merge での検証用一時資材の台帳回収・終了判定記録回収。pre-merge では指定できない。 */
  reclamation?: ReclamationSection;
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
  { flag: "--req", pattern: REQ_ROW_ID_LIST_PATTERN },
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

function parseArgs(argv: readonly string[]): { input: string; validateOnly: boolean } {
  let input: string | null = null;
  let validateOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" && argv[i + 1] !== undefined) {
      input = argv[++i] ?? null;
    } else if (arg === "--validate-input") {
      validateOnly = true;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${USAGE}\n`);
      process.exit(0);
    } else {
      fail(`unknown argument: ${arg}\n${USAGE}`);
    }
  }
  if (input === null) fail(`--input is required\n${USAGE}`);
  return { input, validateOnly };
}

/**
 * 検証専用経路（--validate-input）の実行。入力検証（validateInput）と既知 gate
 * 引数契約の事前検査（preValidateGateSpec）とゲート実行体の存在確認
 * （evaluateGateAvailability の exists 確認）のみを行い、worktree 作成・
 * ゲート実行・git/gh 操作・管理対象ファイルの変更を行わない（check モードの
 * 非破壊契約）。検証不合格（入力検証・引数契約の失敗を含む）は既存の
 * error: stderr + 終了コード 1 契約で失敗する。検証合格時は報告 JSON
 * （ok: true）を stdout へ出力して終了コード 0 を返す。
 */
export function runValidateInputOnly(
  validated: CloseMechanicalInput,
  exists: (absolutePath: string) => boolean,
): { ok: boolean; report: Record<string, unknown> } {
  const gates = [
    validated.generateIndexesGate,
    validated.traceabilityGate,
    validated.textlintGate,
    ...(validated.integrityGates ?? []),
  ].filter((gate): gate is GateCommandSpec => gate != null);
  for (const gate of gates) {
    preValidateGateSpec(gate);
  }
  const availability = evaluateGateAvailability(gates, exists);
  const report = {
    ok: availability.missing.length === 0,
    mode: "validate-input",
    script: "close_mechanical_steps",
    inputValidation: "pass",
    gatePreValidation: "pass",
    gateAvailability: availability,
    sideEffects: "none",
  };
  return { ok: availability.missing.length === 0, report };
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
  if (v.reclamation != null) {
    if (input.phase === "pre-merge") {
      fail("input.reclamation is not allowed in pre-merge (reclamation runs only after the terminal operation)");
    }
    const reclamation = v.reclamation;
    if (typeof reclamation !== "object" || Array.isArray(reclamation)) {
      fail("input.reclamation must be an object");
    }
    const rec = reclamation as Record<string, unknown>;
    if (rec.ledger != null) {
      const ledger = rec.ledger;
      if (typeof ledger !== "object" || Array.isArray(ledger)) {
        fail("input.reclamation.ledger must be an object");
      }
      const l = ledger as Record<string, unknown>;
      for (const field of ["mainRepoRoot", "caseId"] as const) {
        if (typeof l[field] !== "string" || (l[field] as string).trim().length === 0) {
          fail(`input.reclamation.ledger.${field} is required`);
        }
      }
      const confirmation = l.confirmation;
      if (typeof confirmation !== "object" || confirmation === null || Array.isArray(confirmation)) {
        fail("input.reclamation.ledger.confirmation must be an object");
      }
      const c = confirmation as Record<string, unknown>;
      if (typeof c.confirmedBy !== "string" || (c.confirmedBy as string).trim().length === 0) {
        fail("input.reclamation.ledger.confirmation.confirmedBy is required");
      }
      if (typeof c.confirmedAt !== "string" || (c.confirmedAt as string).trim().length === 0) {
        fail("input.reclamation.ledger.confirmation.confirmedAt is required");
      }
      if (!Array.isArray(c.targetIds) || !c.targetIds.every((id) => typeof id === "string" && id.trim().length > 0)) {
        fail("input.reclamation.ledger.confirmation.targetIds must be an array of non-empty entry ids");
      }
    }
    if (rec.closeAcceptanceRecord != null) {
      const record = rec.closeAcceptanceRecord;
      if (typeof record !== "object" || Array.isArray(record)) {
        fail("input.reclamation.closeAcceptanceRecord must be an object");
      }
      const r = record as Record<string, unknown>;
      if (typeof r.recordPath !== "string" || (r.recordPath as string).trim().length === 0) {
        fail("input.reclamation.closeAcceptanceRecord.recordPath is required");
      }
      if (typeof r.terminalOperationCompleted !== "boolean") {
        fail("input.reclamation.closeAcceptanceRecord.terminalOperationCompleted must be a boolean");
      }
    }
  }
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
    if (!isNonEmptyString(v.issueUpdatedAt)) {
      missing.push("issue-updated-at");
    }
    if (v.contractStateCheck == null) {
      missing.push("contract-state-residue-check");
    }
    if (v.verificationResourceCheck == null) {
      missing.push("verification-resource-reconciliation");
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
  if (v.verificationResourceCheck != null) {
    validateVerificationResourceCheckInput(v.verificationResourceCheck);
  }
  const deletionConfirmationCheck = v.deletionConfirmationCheck;
  if (deletionConfirmationCheck !== undefined && deletionConfirmationCheck !== null) {
    if (typeof deletionConfirmationCheck !== "object" || Array.isArray(deletionConfirmationCheck)) {
      fail("input.deletionConfirmationCheck must be an object");
    }
    const check = deletionConfirmationCheck as {
      ledgerPath?: unknown;
      confirmations?: unknown;
      observations?: unknown;
    };
    if (typeof check.ledgerPath !== "string" || (check.ledgerPath as string).trim().length === 0) {
      fail("input.deletionConfirmationCheck.ledgerPath is required");
    }
    const isConfirmation = (value: unknown) =>
      typeof value === "object" &&
      value !== null &&
      typeof (value as { entryId?: unknown }).entryId === "string" &&
      ((value as { entryId: string }).entryId).trim().length > 0 &&
      ((value as { source?: unknown }).source === "user-explicit" ||
        (value as { source?: unknown }).source === "machine-issued") &&
      ((value as { purpose?: unknown }).purpose === "deletion" ||
        (value as { purpose?: unknown }).purpose === "residue-allowance") &&
      typeof (value as { confirmedAt?: unknown }).confirmedAt === "string" &&
      ((value as { confirmedAt: string }).confirmedAt).trim().length > 0 &&
      typeof (value as { identifiers?: unknown }).identifiers === "object" &&
      (value as { identifiers?: unknown }).identifiers !== null;
    if (!Array.isArray(check.confirmations) || !check.confirmations.every(isConfirmation)) {
      fail("input.deletionConfirmationCheck.confirmations must be an array of deletion confirmation records");
    }
    const isObservation = (value: unknown) =>
      typeof value === "object" &&
      value !== null &&
      typeof (value as { entryId?: unknown }).entryId === "string" &&
      ((value as { entryId: string }).entryId).trim().length > 0 &&
      typeof (value as { location?: unknown }).location === "string" &&
      ((value as { location: string }).location).trim().length > 0 &&
      typeof (value as { kind?: unknown }).kind === "string" &&
      ((value as { kind: string }).kind).trim().length > 0 &&
      typeof (value as { identifiers?: unknown }).identifiers === "object" &&
      (value as { identifiers?: unknown }).identifiers !== null &&
      typeof (value as { exists?: unknown }).exists === "boolean";
    if (!Array.isArray(check.observations) || !check.observations.every(isObservation)) {
      fail("input.deletionConfirmationCheck.observations must be an array of pre-deletion target observations");
    }
  }
  return input;
}

/**
 * 検証用一時資材照合入力の形式検証。検査コマンドの scope 宣言は固定必須集合の
 * 被覆を要求し（検査設定の省略禁止）、未知 scope・実行制限確認の実体欠落は
 * fail-closed で拒否する。
 */
function validateVerificationResourceCheckInput(value: unknown): void {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail("input.verificationResourceCheck must be an object");
  }
  const v = value as Record<string, unknown>;
  if (!isNonEmptyString(v.caseId)) fail("input.verificationResourceCheck.caseId is required");
  if (typeof v.issueNumber !== "number" || !Number.isInteger(v.issueNumber) || v.issueNumber < 1) {
    fail("input.verificationResourceCheck.issueNumber must be a positive integer");
  }
  const isIdentifierRecord = (identifiers: unknown) =>
    typeof identifiers === "object" &&
    identifiers !== null &&
    !Array.isArray(identifiers) &&
    Object.keys(identifiers as Record<string, unknown>).length > 0 &&
    Object.values(identifiers as Record<string, unknown>).every((entry) => typeof entry === "string");
  if (!Array.isArray(v.knownResidualEntries)) {
    fail("input.verificationResourceCheck.knownResidualEntries must be an array");
  }
  for (const entry of v.knownResidualEntries) {
    const e = entry as Record<string, unknown>;
    if (typeof entry !== "object" || entry === null || !isNonEmptyString(e.location)) {
      fail("input.verificationResourceCheck.knownResidualEntries[].location is required");
    }
    if (!isIdentifierRecord(e.identifiers)) {
      fail(
        "input.verificationResourceCheck.knownResidualEntries[].identifiers must be a non-empty object of string values",
      );
    }
  }
  if (!Array.isArray(v.deletionConfirmations)) {
    fail("input.verificationResourceCheck.deletionConfirmations must be an array");
  }
  for (const confirmation of v.deletionConfirmations) {
    const c = confirmation as Record<string, unknown>;
    if (typeof confirmation !== "object" || confirmation === null || !isNonEmptyString(c.entryId)) {
      fail("input.verificationResourceCheck.deletionConfirmations[].entryId is required");
    }
    if (!isIdentifierRecord(c.identifiers)) {
      fail(
        "input.verificationResourceCheck.deletionConfirmations[].identifiers must be a non-empty object of string values",
      );
    }
    if (!isNonEmptyString(c.confirmedBy) || !isNonEmptyString(c.confirmedAt)) {
      fail(
        "input.verificationResourceCheck.deletionConfirmations[].confirmedBy and .confirmedAt are required",
      );
    }
  }
  if (!Array.isArray(v.inspectionCommands) || v.inspectionCommands.length === 0) {
    fail("input.verificationResourceCheck.inspectionCommands must be a non-empty array");
  }
  const declaredScopes = new Set<string>();
  for (const command of v.inspectionCommands) {
    const c = command as Record<string, unknown>;
    if (typeof command !== "object" || command === null || !isNonEmptyString(c.scope)) {
      fail("input.verificationResourceCheck.inspectionCommands[].scope is required");
    }
    if (!(REQUIRED_INSPECTION_SCOPES as readonly string[]).includes(c.scope as string)) {
      fail(
        `input.verificationResourceCheck.inspectionCommands[].scope must be one of: ${REQUIRED_INSPECTION_SCOPES.join(", ")} (got: ${c.scope as string})`,
      );
    }
    if (!isNonEmptyString(c.command)) {
      fail("input.verificationResourceCheck.inspectionCommands[].command is required");
    }
    if (!Array.isArray(c.args) || c.args.length === 0) {
      fail("input.verificationResourceCheck.inspectionCommands[].args must be a non-empty array");
    }
    if (!isNonEmptyString(c.cwd)) {
      fail("input.verificationResourceCheck.inspectionCommands[].cwd is required");
    }
    declaredScopes.add(c.scope as string);
  }
  const missingScopes = REQUIRED_INSPECTION_SCOPES.filter((scope) => !declaredScopes.has(scope));
  if (missingScopes.length > 0) {
    fail(
      `input.verificationResourceCheck.inspectionCommands must cover all required inspection scopes (omission forbidden): missing ${missingScopes.join(", ")}`,
    );
  }
  if (v.inspectionArtifactPaths !== undefined) {
    const isPathList =
      Array.isArray(v.inspectionArtifactPaths) &&
      v.inspectionArtifactPaths.every((p) => typeof p === "string" && p.trim().length > 0);
    if (!isPathList) {
      fail("input.verificationResourceCheck.inspectionArtifactPaths must be an array of non-empty strings");
    }
  }
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

//
// 検証用一時資材の照合（close時）・完了拒否・終了判定記録書出し。
// 様式の正は検証用一時資材のライフサイクル Design「照合（close時）と全終了経路」
// 「検査対象の除外根拠」「検出範囲の宣言と未達の機械的接続」節と case-close
// Design「機械工程の script 呼び出し契約」節、case-close 実行契約の照合・
// 拒否・remote 判定・全終了経路規定。台帳（生成記録）モジュールは Wave-1 の
// verification-resources-ledger.ts を消費する。
//

/**
 * 観測手段 (a)〜(f) の検出範囲宣言（script 単一所有。入力側の検査設定の解除・
 * 未指定で対象外・作成物ゼロ扱いにできない）。
 */
export const DECLARED_DETECTION_SCOPES = [
  "dedicated-area-diff",
  "remote-worktree-branch-enumeration",
  "process-liveness-commandline",
  "os-temp-area-scan",
  "gitignored-temporary-output",
  "known-residual-list",
] as const;

/**
 * 台帳欠落時に照合不能として明示報告する entity 系スコープ（process・listen・remote）。
 * 台帳不在は空の観測集合の黙過ではなく検査不能として報告する（空状態の区別。正は
 * 検証用一時資材のライフサイクル Design「専用領域と作成経路の制限」節）。
 */
export const ENTITY_RECONCILIATION_SCOPES = [
  "process-liveness",
  "listen-port-check",
  "remote-absence-verification",
] as const;

/**
 * OS依存観測を検査コマンドとして呼出側が宣言する scope の固定必須集合。
 * 欠落は validateInput で拒否する（検査設定の省略禁止）。
 */
export const REQUIRED_INSPECTION_SCOPES = [
  "dedicated-area-listing",
  "os-temp-area-scan",
  "process-liveness",
  "listen-port-check",
  "remote-absence-verification",
] as const;

/** 機械検出も制限効果の独立観測もない作成経路を受入未達として扱う。 */
export const CREATION_ROUTES_REQUIRING_CONTROL_CONFIRMATION = ["arbitrary-path-creation"] as const;

/** 一時資材と正式成果物の役割分類値（ライフサイクル Design「正式成果物と一時資材の役割分類」節）。 */
export type ResourceRole = "official-artifact" | "test-run-generated" | "undetermined";

export interface KnownResidualEntry {
  /** 資材の所在（絶対パスまたは URL）。 */
  location: string;
  /** 識別情報（最低1項目）。 */
  identifiers: Record<string, string>;
  /** 由来メモ（導入時に既存した検証資材の識別）。 */
  note?: string;
}

export interface DeletionConfirmation {
  /** 台帳エントリ ID。 */
  entryId: string;
  /** 確認対象の識別情報（台帳エントリの識別情報を被覆する）。 */
  identifiers: Record<string, string>;
  confirmedBy: string;
  confirmedAt: string;
}

/** OS依存観測の検査コマンド仕様（scope 単位の JSON stdout 契約）。 */
export interface InspectionCommandSpec {
  scope: string;
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

export interface VerificationResourceCheck {
  /** 台帳解決の案件識別子（メインrepo root の .agentdev/tmp/verification-resources/{caseId}.json）。 */
  caseId: string;
  /** 評価単位の子 Issue 番号（子所有エントリの照合と終了判定記録の対象）。 */
  issueNumber: number;
  /** 導入時既知残存リスト（観測 (f)。記載資材は存在する限り拒否理由となる）。 */
  knownResidualEntries: readonly KnownResidualEntry[];
  /** 削除確認記録（回収済み記録で実物消失のエントリに対応する確認）。 */
  deletionConfirmations: readonly DeletionConfirmation[];
  /** OS依存観測の検査コマンド仕様（scope 固定必須集合の被覆が必須）。 */
  inspectionCommands: readonly InspectionCommandSpec[];
  /** 検査実行が作成記録付きで書き出す特定実体のパス集合（除外根拠1の機械確認対象）。 */
  inspectionArtifactPaths?: readonly string[];
}

export interface RemoteAbsenceJudgementInput {
  /** HTTP 404 応答の観測（単独では不存在判定の根拠にならない）。 */
  httpStatus404Observed: boolean;
  authenticationConfirmed: boolean;
  visibilityConfirmed: boolean;
  targetIdConfirmed: boolean;
  /** 認証・可視性・対象ID確認後に取得した、404 によらない確定的不存在根拠の記録参照。 */
  confirmedAbsenceEvidence?: string;
}

export interface ObservedTemporaryResource {
  path: string;
  source: "dedicated-area" | "os-temp-area" | "gitignored-output";
  /** 役割根拠（機械確認可能な記録の参照を持つ場合のみ有効。申告単独では除外根拠にしない）。 */
  roleBasis?: { role: ResourceRole; basis: string };
  /** 帰属根拠（本件と無関係の共有資材の判別根拠。帰属が確認できない場合は検査対象のまま拒否）。 */
  attributionBasis?: string;
}

export interface VerificationResourceObservation {
  exists(absolutePath: string): boolean;
  /** (b) remote列挙。 */
  remotes: readonly { name: string; url: string }[];
  /** (b) worktree列挙。 */
  worktrees: readonly string[];
  /** (b) branch列挙。 */
  branches: readonly string[];
  /** (c) プロセス生存観測結果（実物側網羅列挙の観測値。cwd・開始時刻は正規形の観測で取得できた場合に保持）。 */
  processes: Record<string, { alive: boolean; commandLine: string | null; cwd?: string; startedAt?: string }>;
  /** listenポート確認結果。 */
  listenPorts: Record<string, { listening: boolean }>;
  /** (b) remote不存在判定入力（URLごと。remote列挙に現れない台帳remoteの不存在判定に使用）。 */
  remoteAbsenceInputs: Record<string, RemoteAbsenceJudgementInput>;
  /** (a)(d)(e) 観測の実在物一覧。 */
  observedEntries: readonly ObservedTemporaryResource[];
  /** 検査不能・検査器異常の記録。 */
  inspectionFailures: readonly { scope: string; reason: string; exitCode?: number }[];
  /** 除外根拠の機械確認対象パス集合（台帳・終了判定記録自身、検査実行の作成記録付き特定実体）。 */
  excludedPaths: readonly { path: string; basis: string }[];
  /** 相対パス観測の絶対化基準。 */
  resolveBase: string;
}

export type DetectionFindingCode =
  | "ledger-missing"
  | "ledger-unavailable"
  | "residual-uncollected"
  | "residual-after-collection"
  | "deletion-confirmation-missing"
  | "identifier-mismatch"
  | "inspection-unavailable"
  | "remote-absence-undetermined"
  | "known-residual-still-present"
  | "unregistered-resource";

export interface ResourceReconciliationFinding {
  code: DetectionFindingCode;
  detail: string;
}

export interface VerificationResourceReconciliationEvaluation {
  ledgerState: "missing" | "present";
  entryCount: number;
  childEntryCount: number;
  findings: readonly ResourceReconciliationFinding[];
  uncollectedParentOrCommon: readonly { id: string; ownership: VerificationResourceOwnership }[];
  terminationUnitBlocked: boolean;
  permitted: boolean;
  excludedObservations: readonly { path: string; basis: string }[];
  knownResidualStillPresent: readonly string[];
}

export interface AcceptanceGap {
  code: "creation-route-without-detection-or-enforcement";
  route: string;
  detail: string;
}

export interface CloseAcceptanceRecord {
  issueNumber: number;
  /** GitHub/Local issue_read が返す対象 Issue の updated_at。git commit SHAではない。 */
  targetRevision: string;
  generatedAt: string;
  accepted: boolean;
}

export interface EntryPresenceObservation {
  presence: "present" | "absent" | "unavailable" | "undetermined";
  observedIdentifiers?: Record<string, string>;
  observationBasis: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 一時資材と正式成果物の役割分類。分類は役割根拠（機械確認可能な
 * 記録の参照を持つ roleBasis）で判定し、拡張子・testという名前・git追跡済みという
 * 事実単独では正式成果物（回収対象外）に分類しない。役割根拠のない候補は
 * undetermined（一時資材候補として検査対象）とする。
 */
export function classifyResourceRole(candidate: {
  fileName?: string;
  extension?: string;
  isGitTracked?: boolean;
  roleBasis?: { role: ResourceRole; basis: string };
}): { role: ResourceRole; basis: string | null } {
  const basis = candidate.roleBasis;
  if (
    basis !== undefined &&
    (basis.role === "official-artifact" || basis.role === "test-run-generated") &&
    basis.basis.trim().length > 0
  ) {
    return { role: basis.role, basis: basis.basis };
  }
  return { role: "undetermined", basis: null };
}

/**
 * remote 上の対象の不存在判定（case-close 実行契約の remote 判定規定）。HTTP 404 単独では
 * 不存在と判定せず、認証・可視性・対象IDの確認を要求する。確認後も確定的不存在根拠が
 * 得られない場合は undetermined（終了拒否）とする。
 */
export function evaluateRemoteAbsenceJudgement(
  input: RemoteAbsenceJudgementInput,
): { verdict: "confirmed-absent" | "undetermined"; basis: string } {
  if (!input.authenticationConfirmed || !input.visibilityConfirmed || !input.targetIdConfirmed) {
    return {
      verdict: "undetermined",
      basis: "authentication, visibility, or target-id confirmation is missing",
    };
  }
  const evidence =
    typeof input.confirmedAbsenceEvidence === "string" ? input.confirmedAbsenceEvidence.trim() : "";
  if (evidence.length === 0) {
    return {
      verdict: "undetermined",
      basis:
        "the target remains undetermined after authentication, visibility and target-id confirmation (an HTTP 404 alone does not establish absence)",
    };
  }
  return { verdict: "confirmed-absent", basis: evidence };
}

export function normalizeObservationPath(value: string): string {
  return value.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");
}

function isUnderNormalizedPath(candidate: string, base: string): boolean {
  return candidate === base || candidate.startsWith(`${base}/`);
}

function resolveObservationPath(value: string, base: string): string {
  const normalizedValue = value.replace(/\\/g, "/");
  const normalizedBase = base.replace(/\\/g, "/").replace(/\/+$/, "");
  if (path.isAbsolute(value) || normalizedValue === normalizedBase || normalizedValue.startsWith(`${normalizedBase}/`)) {
    return value;
  }
  if (/^<[^>]+>$/.test(normalizedBase)) return `${normalizedBase}/${normalizedValue.replace(/^\.\//, "")}`;
  return path.resolve(base, value);
}

const ABSOLUTE_URL_LOCATION_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//;
const SCP_LIKE_URL_LOCATION_PATTERN = /^git@[^:]+:/;

function isUrlLocation(location: string): boolean {
  return ABSOLUTE_URL_LOCATION_PATTERN.test(location) || SCP_LIKE_URL_LOCATION_PATTERN.test(location);
}

/** 台帳エントリの識別情報と観測識別情報の交差突合（観測に存在するキーのみ比較）。 */
export function evaluateIdentifierMatch(
  entryIdentifiers: Record<string, string>,
  observed: Record<string, string>,
): { matched: boolean; mismatchedKeys: readonly string[] } {
  const mismatchedKeys: string[] = [];
  for (const [key, expected] of Object.entries(entryIdentifiers)) {
    const actual = observed[key];
    if (actual === undefined) continue;
    if (actual !== expected) mismatchedKeys.push(key);
  }
  return { matched: mismatchedKeys.length === 0, mismatchedKeys };
}

/**
 * 台帳エントリの実物観測状態の導出。remote URL 形・パス形の location 判定に
 * identifiers ベースの PID・listen 観測を結合する。remote 不存在判定が
 * undetermined の場合は照合自体が成立しないため undetermined を優先する。
 */
export function deriveEntryPresence(
  entry: VerificationResourceEntry,
  observation: VerificationResourceObservation,
): EntryPresenceObservation {
  const observedIdentifiers: Record<string, string> = {};
  let presentEvidence = "";
  let missingEvidence = "";
  let unavailableEvidence = "";
  let remoteAbsenceUndetermined = false;

  const remoteMatch = observation.remotes.find((remote) => remote.url === entry.location);
  if (remoteMatch !== undefined) {
    presentEvidence = `remote enumeration contains the recorded URL: ${entry.location}`;
    observedIdentifiers.url = entry.location;
  } else if (isUrlLocation(entry.location)) {
    const absenceInput = observation.remoteAbsenceInputs[entry.location];
    const judgement = absenceInput === undefined
      ? {
          verdict: "undetermined" as const,
          basis: "no remote absence verification observation is provided for the recorded URL",
        }
      : evaluateRemoteAbsenceJudgement(absenceInput);
    if (judgement.verdict === "confirmed-absent") {
      missingEvidence = `remote absence confirmed after authentication, visibility and target-id verification: ${judgement.basis}`;
    } else {
      remoteAbsenceUndetermined = true;
      unavailableEvidence = `remote absence could not be determined after verification: ${judgement.basis}`;
    }
  } else if (observation.exists(entry.location)) {
    presentEvidence = `filesystem observation confirms the recorded location exists: ${entry.location}`;
    observedIdentifiers.path = entry.location;
  } else {
    const worktreeMatch = observation.worktrees.some(
      (worktree) => normalizeObservationPath(worktree) === normalizeObservationPath(entry.location),
    );
    if (worktreeMatch) {
      presentEvidence = `git worktree enumeration contains the recorded location: ${entry.location}`;
      observedIdentifiers.path = entry.location;
    } else {
      missingEvidence = `filesystem observation does not confirm the recorded location: ${entry.location}`;
    }
  }

  const pid = entry.identifiers.pid;
  if (pid !== undefined) {
    const processObservation = observation.processes[pid];
    if (processObservation === undefined) {
      unavailableEvidence = unavailableEvidence === ""
        ? `process liveness observation does not cover the recorded pid: ${pid}`
        : unavailableEvidence;
    } else if (processObservation.alive) {
      presentEvidence = presentEvidence === "" ? `the recorded pid is alive: ${pid}` : presentEvidence;
      observedIdentifiers.pid = pid;
      if (processObservation.commandLine !== null && processObservation.commandLine !== undefined) {
        observedIdentifiers.commandLine = processObservation.commandLine;
      }
      if (processObservation.cwd !== undefined) {
        observedIdentifiers.cwd = processObservation.cwd;
      }
      if (processObservation.startedAt !== undefined) {
        observedIdentifiers.startedAt = processObservation.startedAt;
      }
    } else {
      missingEvidence = missingEvidence === "" ? `the recorded pid is not alive: ${pid}` : missingEvidence;
    }
  }

  const listenPort = entry.identifiers.listenPort;
  if (listenPort !== undefined) {
    const portObservation = observation.listenPorts[listenPort];
    if (portObservation === undefined) {
      unavailableEvidence = unavailableEvidence === ""
        ? `listen port observation does not cover the recorded port: ${listenPort}`
        : unavailableEvidence;
    } else if (portObservation.listening) {
      presentEvidence = presentEvidence === "" ? `the recorded listen port is active: ${listenPort}` : presentEvidence;
      observedIdentifiers.listenPort = listenPort;
    } else {
      missingEvidence = missingEvidence === "" ? `the recorded listen port is not active: ${listenPort}` : missingEvidence;
    }
  }

  const branch = entry.identifiers.branch;
  if (branch !== undefined && presentEvidence === "") {
    const branchMatch = observation.branches.some((name) => name === branch);
    if (branchMatch) {
      presentEvidence = `branch enumeration contains the recorded branch: ${branch}`;
      observedIdentifiers.branch = branch;
    }
  }

  if (remoteAbsenceUndetermined) {
    return { presence: "undetermined", observationBasis: unavailableEvidence };
  }
  if (presentEvidence !== "") {
    return { presence: "present", observedIdentifiers, observationBasis: presentEvidence };
  }
  if (unavailableEvidence !== "" && missingEvidence !== "") {
    return {
      presence: "unavailable",
      observationBasis: `incomplete observation (${unavailableEvidence}; ${missingEvidence})`,
    };
  }
  if (unavailableEvidence !== "") {
    return { presence: "unavailable", observationBasis: unavailableEvidence };
  }
  if (missingEvidence !== "") {
    return { presence: "absent", observationBasis: missingEvidence };
  }
  return {
    presence: "unavailable",
    observationBasis: "no observation basis covers the recorded location or identifiers",
  };
}

/**
 * 削除確認記録が台帳エントリの識別情報を被覆し値一致する場合のみ有効な確認として
 * 受理する（同名別物・PID再利用の防止。確認済み識別情報との対応が確認の前提）。
 */
function deletionConfirmationCoversEntry(
  entry: VerificationResourceEntry,
  confirmation: DeletionConfirmation,
): boolean {
  return Object.entries(entry.identifiers).every(
    ([key, value]) => confirmation.identifiers[key] === value,
  );
}

/**
 * 観測実在物の未登録判定。除外根拠（台帳・終了判定記録自身、検査実行の作成記録付き
 * 特定実体、正式成果物の役割根拠、無関係共有資材の帰属根拠）と台帳・既知残存リストの
 * 突合を行い、根拠のない実在物を未登録として検出する。帰属が機械確認できない実体は
 * 検査対象のまま拒否する。
 */
export function evaluateUnregisteredObservations(
  observedEntries: readonly ObservedTemporaryResource[],
  entries: readonly VerificationResourceEntry[],
  knownResidualEntries: readonly KnownResidualEntry[],
  excludedPaths: readonly { path: string; basis: string }[],
  resolveBase: string,
): {
  findings: readonly ResourceReconciliationFinding[];
  excludedObservations: readonly { path: string; basis: string }[];
  knownResidualStillPresent: readonly string[];
  /** 正規化した既知残存リスト位置のうちパス突合で既に報告したもの（識別情報消費との重複報告防止に使用）。 */
  knownResidualReportedLocations: readonly string[];
} {
  const findings: ResourceReconciliationFinding[] = [];
  const excludedObservations: { path: string; basis: string }[] = [];
  const knownResidualStillPresent: string[] = [];
  const knownResidualReportedLocations: string[] = [];
  const normalizedExcluded = excludedPaths.map((entry) => ({
    ...entry,
    normalized: normalizeObservationPath(resolveObservationPath(entry.path, resolveBase)),
  }));
  const normalizedLedgerLocations = entries.map((entry) => ({
    id: entry.id,
    normalized: normalizeObservationPath(resolveObservationPath(entry.location, resolveBase)),
  }));
  const normalizedKnown = knownResidualEntries.map((entry) => ({
    ...entry,
    normalized: normalizeObservationPath(resolveObservationPath(entry.location, resolveBase)),
  }));
  for (const observed of observedEntries) {
    const normalized = normalizeObservationPath(resolveObservationPath(observed.path, resolveBase));
    const exclusion = normalizedExcluded.find((entry) =>
      isUnderNormalizedPath(normalized, entry.normalized),
    );
    if (exclusion !== undefined) {
      excludedObservations.push({ path: observed.path, basis: exclusion.basis });
      continue;
    }
    const registered = normalizedLedgerLocations.some((entry) => entry.normalized === normalized);
    if (registered) continue;
    const known = normalizedKnown.find((entry) => entry.normalized === normalized);
    if (known !== undefined) {
      knownResidualReportedLocations.push(known.normalized);
      knownResidualStillPresent.push(observed.path);
      findings.push({
        code: "known-residual-still-present",
        detail: `known residual list entry is still present: ${observed.path} (source: ${observed.source}${known.note !== undefined ? `, note: ${known.note}` : ""})`,
      });
      continue;
    }
    if (observed.roleBasis?.role === "official-artifact" && observed.roleBasis.basis.trim().length > 0) {
      excludedObservations.push({ path: observed.path, basis: "official-artifact-role-basis" });
      continue;
    }
    if (typeof observed.attributionBasis === "string" && observed.attributionBasis.trim().length > 0) {
      excludedObservations.push({ path: observed.path, basis: "unrelated-shared-resource-attribution" });
      continue;
    }
    findings.push({
      code: "unregistered-resource",
      detail: `no ledger record or exclusion basis for the observed temporary resource: ${observed.path} (source: ${observed.source})`,
    });
  }
  return { findings, excludedObservations, knownResidualStillPresent, knownResidualReportedLocations };
}

/**
 * 観測結果に現れた実体（process・listen・remote）の消費経路（実装完全化）。
 * 台帳記録分の実体照合は deriveEntryPresence が消費するため、本関数は台帳に現れない
 * キーの消費と、既知残存リストの識別情報（pid・listenPort・url・branch）の消費を行う。
 * 台帳・既知残存リストのどちらにも照合されない実在entityは未登録資材として検出する
 * （正は検証用一時資材のライフサイクル Design「実物側網羅列挙と未記録entityの検出対象性」
 * の記述。検出対象は正の存在証拠〔生存process・listen中ポート・不存在確認が成立しない
 * remote〕に限り、消滅済みの観測値は残存資材として報告しない）。
 */
export function evaluateObservationEntityConsumption(
  observation: Pick<
    VerificationResourceObservation,
    "processes" | "listenPorts" | "remoteAbsenceInputs" | "remotes" | "branches"
  >,
  entries: readonly VerificationResourceEntry[],
  knownResidualEntries: readonly KnownResidualEntry[],
  knownResidualReportedLocations: readonly string[],
): {
  findings: readonly ResourceReconciliationFinding[];
  knownResidualStillPresent: readonly string[];
} {
  const findings: ResourceReconciliationFinding[] = [];
  const knownResidualStillPresent: string[] = [];
  const reportedLocations = new Set(knownResidualReportedLocations);
  const ledgerPids = new Set(
    entries.map((entry) => entry.identifiers.pid).filter((pid): pid is string => pid !== undefined),
  );
  const ledgerListenPorts = new Set(
    entries
      .map((entry) => entry.identifiers.listenPort)
      .filter((listenPort): listenPort is string => listenPort !== undefined),
  );
  const ledgerUrls = new Set(entries.map((entry) => entry.location));
  const knownPids = new Set<string>();
  const knownListenPorts = new Set<string>();
  const knownUrls = new Set<string>();

  for (const known of knownResidualEntries) {
    if (reportedLocations.has(normalizeObservationPath(known.location))) continue;
    const observedIdentifiers: Record<string, string> = {};
    let survivalEvidence = "";
    const pid = known.identifiers.pid;
    if (pid !== undefined) {
      knownPids.add(pid);
      const processObservation = observation.processes[pid];
      if (processObservation !== undefined && processObservation.alive) {
        survivalEvidence = survivalEvidence === "" ? `the known residual pid is alive: ${pid}` : survivalEvidence;
        observedIdentifiers.pid = pid;
        if (processObservation.commandLine !== null && processObservation.commandLine !== undefined) {
          observedIdentifiers.commandLine = processObservation.commandLine;
        }
        if (processObservation.cwd !== undefined) {
          observedIdentifiers.cwd = processObservation.cwd;
        }
        if (processObservation.startedAt !== undefined) {
          observedIdentifiers.startedAt = processObservation.startedAt;
        }
      }
    }
    const listenPort = known.identifiers.listenPort;
    if (listenPort !== undefined) {
      knownListenPorts.add(listenPort);
      if (survivalEvidence === "") {
        const portObservation = observation.listenPorts[listenPort];
        if (portObservation !== undefined && portObservation.listening) {
          survivalEvidence = `the known residual listen port is active: ${listenPort}`;
          observedIdentifiers.listenPort = listenPort;
        }
      }
    }
    const knownUrl = known.identifiers.url ?? (isUrlLocation(known.location) ? known.location : undefined);
    if (knownUrl !== undefined) {
      knownUrls.add(knownUrl);
      if (survivalEvidence === "") {
        const remotePresent = observation.remotes.some((remote) => remote.url === knownUrl);
        const absenceInput = observation.remoteAbsenceInputs[knownUrl];
        if (remotePresent) {
          survivalEvidence = `the known residual remote is present in the remote enumeration: ${knownUrl}`;
          observedIdentifiers.url = knownUrl;
        } else if (
          absenceInput !== undefined &&
          evaluateRemoteAbsenceJudgement(absenceInput).verdict === "undetermined"
        ) {
          survivalEvidence = `the known residual remote remains undetermined after the absence verification: ${knownUrl}`;
          observedIdentifiers.url = knownUrl;
        }
      }
    }
    const branch = known.identifiers.branch;
    if (branch !== undefined && observation.branches.some((name) => name === branch)) {
      if (survivalEvidence === "") {
        survivalEvidence = `the known residual branch is present in the branch enumeration: ${branch}`;
      }
      observedIdentifiers.branch = branch;
    }
    if (survivalEvidence === "") continue;
    knownResidualStillPresent.push(known.location);
    findings.push({
      code: "known-residual-still-present",
      detail: `known residual list entry is still present by identifier observation: ${known.location} (${survivalEvidence})`,
    });
    const match = evaluateIdentifierMatch(known.identifiers, observedIdentifiers);
    if (!match.matched) {
      findings.push({
        code: "identifier-mismatch",
        detail: `known residual entry identifiers differ from the observation (location: ${known.location}, keys: ${match.mismatchedKeys.join(", ")})`,
      });
    }
  }

  for (const [pid, processObservation] of Object.entries(observation.processes)) {
    if (ledgerPids.has(pid) || knownPids.has(pid)) continue;
    if (!processObservation.alive) continue;
    const detailParts = [`pid ${pid}`];
    if (processObservation.commandLine !== null && processObservation.commandLine !== undefined) {
      detailParts.push(`commandLine: ${processObservation.commandLine}`);
    }
    if (processObservation.cwd !== undefined) {
      detailParts.push(`cwd: ${processObservation.cwd}`);
    }
    if (processObservation.startedAt !== undefined) {
      detailParts.push(`startedAt: ${processObservation.startedAt}`);
    }
    findings.push({
      code: "unregistered-resource",
      detail: `no ledger record or known residual entry covers the observed live process: ${detailParts.join(", ")}`,
    });
  }
  for (const [port, portObservation] of Object.entries(observation.listenPorts)) {
    if (ledgerListenPorts.has(port) || knownListenPorts.has(port)) continue;
    if (!portObservation.listening) continue;
    findings.push({
      code: "unregistered-resource",
      detail: `no ledger record or known residual entry covers the observed listening port: ${port}`,
    });
  }
  for (const [url, absenceInput] of Object.entries(observation.remoteAbsenceInputs)) {
    if (ledgerUrls.has(url) || knownUrls.has(url)) continue;
    const judgement = evaluateRemoteAbsenceJudgement(absenceInput);
    if (judgement.verdict === "confirmed-absent") continue;
    findings.push({
      code: "unregistered-resource",
      detail: `no ledger record or known residual entry covers the observed remote target and its absence could not be confirmed: ${url} (${judgement.basis})`,
    });
  }
  return { findings, knownResidualStillPresent };
}

/**
 * 検証用一時資材の照合判定（case-close 実行契約の照合・完了拒否規定）。子 Issue の終了判定は子所有の
 * 一時資材のみを照合対象とし、親・共通の未回収は終了単位の全体未完了
 * （terminationUnitBlocked）として報告する（Design 台帳節「評価単位」）。
 */
export function evaluateVerificationResourceReconciliation(
  ledger: LedgerReadResult,
  observation: VerificationResourceObservation,
  check: VerificationResourceCheck,
): VerificationResourceReconciliationEvaluation {
  const findings: ResourceReconciliationFinding[] = [];
  const uncollectedParentOrCommon: { id: string; ownership: VerificationResourceOwnership }[] = [];

  for (const failure of observation.inspectionFailures) {
    findings.push({
      code: "inspection-unavailable",
      detail: `inspection is unavailable for scope ${failure.scope}: ${failure.reason}${failure.exitCode !== undefined ? ` (exitCode: ${failure.exitCode})` : ""}`,
    });
  }

  if (ledger.state === "missing") {
    findings.push({
      code: "ledger-missing",
      detail:
        "the verification resources ledger is missing (a missing generation record is not treated as evidence of zero creations)",
    });
    for (const scope of ENTITY_RECONCILIATION_SCOPES) {
      findings.push({
        code: "inspection-unavailable",
        detail: `inspection is unavailable for scope ${scope}: the ledger is missing, so scope observations cannot be reconciled against generation records (explicit unavailability, not an empty observation set)`,
      });
    }
  }

  const childEntries = ledger.entries.filter(
    (entry) => entry.ownership === "child" && entry.childIssue === check.issueNumber,
  );
  for (const entry of ledger.entries) {
    if (entry.ownership === "child" && entry.childIssue === check.issueNumber) continue;
    if (entry.collectedAt === null) {
      uncollectedParentOrCommon.push({ id: entry.id, ownership: entry.ownership });
    }
  }

  for (const entry of childEntries) {
    const presence = deriveEntryPresence(entry, observation);
    if (presence.presence === "undetermined") {
      findings.push({
        code: "remote-absence-undetermined",
        detail: `${entry.id}: ${presence.observationBasis}`,
      });
      continue;
    }
    if (presence.presence === "unavailable") {
      findings.push({
        code: "inspection-unavailable",
        detail: `${entry.id}: ${presence.observationBasis}`,
      });
      continue;
    }
    if (presence.presence === "present") {
      const match = evaluateIdentifierMatch(entry.identifiers, presence.observedIdentifiers ?? {});
      if (!match.matched) {
        findings.push({
          code: "identifier-mismatch",
          detail: `${entry.id}: observed identifiers differ from the ledger record (keys: ${match.mismatchedKeys.join(", ")})`,
        });
      }
      if (entry.collectedAt === null) {
        findings.push({
          code: "residual-uncollected",
          detail: `${entry.id}: the resource is still present and collection is not confirmed (${presence.observationBasis})`,
        });
      } else {
        findings.push({
          code: "residual-after-collection",
          detail: `${entry.id}: the resource is still present although the ledger records it as collected`,
        });
      }
      continue;
    }
    if (entry.collectedAt === null) {
      findings.push({
        code: "residual-uncollected",
        detail: `${entry.id}: the resource is not observed and collection is not confirmed (${presence.observationBasis})`,
      });
    } else {
      const confirmation = check.deletionConfirmations.find((c) => c.entryId === entry.id);
      if (confirmation === undefined || !deletionConfirmationCoversEntry(entry, confirmation)) {
        findings.push({
          code: "deletion-confirmation-missing",
          detail: `${entry.id}: the resource is absent after a recorded collection, without a deletion confirmation matching the recorded identifiers`,
        });
      }
    }
  }

  const unregistered = evaluateUnregisteredObservations(
    observation.observedEntries,
    ledger.entries,
    check.knownResidualEntries,
    observation.excludedPaths,
    observation.resolveBase,
  );
  findings.push(...unregistered.findings);

  const entityConsumption = evaluateObservationEntityConsumption(
    observation,
    ledger.entries,
    check.knownResidualEntries,
    unregistered.knownResidualReportedLocations,
  );
  findings.push(...entityConsumption.findings);

  return {
    ledgerState: ledger.state,
    entryCount: ledger.entries.length,
    childEntryCount: childEntries.length,
    findings,
    uncollectedParentOrCommon,
    terminationUnitBlocked: uncollectedParentOrCommon.length > 0,
    permitted: findings.length === 0,
    excludedObservations: unregistered.excludedObservations,
    knownResidualStillPresent: [
      ...unregistered.knownResidualStillPresent,
      ...entityConsumption.knownResidualStillPresent,
    ],
  };
}

/**
 * 受入未達の集約判定（ライフサイクル Design「検出範囲の宣言と未達の機械的接続」節）。
 * 機械検出も実行制限も宣言された検出範囲に対して
 * 成立しない作成経路が残る場合、当該経路を受入未達として報告し、終了操作の許可判定は
 * 受入不成立として扱う。申告された集合だけの検査を成立扱いにしない。
 */
export function deriveAcceptanceGaps(): readonly AcceptanceGap[] {
  return CREATION_ROUTES_REQUIRING_CONTROL_CONFIRMATION.map((route) => ({
    code: "creation-route-without-detection-or-enforcement",
    route,
    detail: `the route lacks an independently executed observation of the external control's actual effect (declared detection scopes: ${DECLARED_DETECTION_SCOPES.join(", ")}); caller-provided route, basis, or confirmer strings are not effect evidence`,
  }));
}

/** 終了判定記録の保存場所（main repo root 固定・worktree 非依存）。 */
export function resolveCloseAcceptanceRecordPath(mainRepoRoot: string, issueNumber: number): string {
  const root = mainRepoRoot.replace(/[\\/]+$/, "");
  if (root.length === 0) throw new MechanicalInputError("mainRepoRoot is required");
  if (!Number.isInteger(issueNumber) || issueNumber < 1) {
    throw new MechanicalInputError("issueNumber must be a positive integer");
  }
  return path.join(root, ".agentdev", "close-acceptance", `issue-${String(issueNumber).padStart(4, "0")}.json`);
}

/**
 * pre-merge-local-state-check における機械自身の終了判定記録の特定実体除外
 * （検証用一時資材のライフサイクル Design「検査対象の除外根拠(1)」。
 * verification-resource-reconciliation の excludedPaths〔close-acceptance-record-itself〕と同一契約）。
 * 書出し元と同一の解決（resolveMainRepoRoot + resolveCloseAcceptanceRecordPath）で
 * 対象 Issue の記録パスを導出し、worktree 相対・`/` 正規化で返す（porcelain 表記との完全一致判定用）。
 * worktreeRoot==main root 構成（Epic 最終close等）でのみ porcelain に現れる自己出力による
 * dirty 循環を除去するものであり、解決不能な場合（対象 Issue 番号の不正・gitCommonDir 未提供・
 * 解決失敗・worktree 外の記録）は除外を適用しない（fail-closed。他の未コミット検出は緩めない）。
 */
function resolveSelfAcceptanceRecordForLocalStateCheck(
  input: CloseMechanicalInput,
  runner: MechanicalRunner,
  worktreeCwd: string,
): string | null {
  const issueNumber = input.verificationResourceCheck?.issueNumber;
  if (typeof issueNumber !== "number" || !Number.isInteger(issueNumber) || issueNumber < 1) {
    return null;
  }
  let recordPath: string;
  try {
    recordPath = resolveCloseAcceptanceRecordPath(resolveMainRepoRoot(requireRunnerLedgerIo(runner)), issueNumber);
  } catch {
    return null;
  }
  const relative = path.relative(worktreeCwd, recordPath).replace(/\\/g, "/");
  if (relative.length === 0 || relative === ".." || relative.startsWith("../")) {
    return null;
  }
  return relative;
}

/** porcelain 行（`XY <path>` 形）からパス部分を取り出す。 */
function porcelainEntryPath(line: string): string {
  return line.length > 3 ? line.slice(3) : "";
}

/** 終了判定記録の直列化（Design 様式: 対象Issue番号・判定対象版・判定生成時刻・判定内容）。 */
export function serializeCloseAcceptanceRecord(record: CloseAcceptanceRecord): string {
  return `${JSON.stringify(record, null, 2)}\n`;
}

interface CloseAcceptanceRecordWrite {
  path: string | null;
  record: CloseAcceptanceRecord | null;
  written: boolean;
  error: string | null;
}

function writeCloseAcceptanceRecord(
  input: CloseMechanicalInput,
  runner: MechanicalRunner,
  accepted: boolean,
): CloseAcceptanceRecordWrite {
  const issueNumber = input.verificationResourceCheck?.issueNumber;
  if (issueNumber === undefined) {
    return {
      path: null,
      record: null,
      written: false,
      error: "the verification resource check has no target Issue number",
    };
  }
  if (!isNonEmptyString(input.issueUpdatedAt)) {
    return {
      path: null,
      record: null,
      written: false,
      error: "the current Issue updated_at revision is missing",
    };
  }
  let record: CloseAcceptanceRecord | null = null;
  let recordPath: string | null = null;
  try {
    const ledgerIo = requireRunnerLedgerIo(runner);
    const mainRepoRoot = resolveMainRepoRoot(ledgerIo);
    recordPath = resolveCloseAcceptanceRecordPath(mainRepoRoot, issueNumber);
    record = {
      issueNumber,
      targetRevision: input.issueUpdatedAt,
      generatedAt: new Date().toISOString(),
      accepted,
    };
    ledgerIo.mkdirRecursive(path.dirname(recordPath));
    ledgerIo.writeTextFile(recordPath, serializeCloseAcceptanceRecord(record));
    return { path: recordPath, record, written: true, error: null };
  } catch (error) {
    let invalidationError: string | null = null;
    if (!accepted && recordPath !== null) {
      try {
        if (runner.exists(recordPath)) {
          if (runner.removeFile === undefined) {
            throw new MechanicalInputError("runner does not provide removeFile to invalidate an old acceptance record");
          }
          runner.removeFile(recordPath);
        }
      } catch (removeError) {
        invalidationError = `old acceptance record invalidation failed: ${String(removeError)}`;
      }
    }
    return {
      path: recordPath,
      record,
      written: false,
      error: [
        `close acceptance record ${accepted ? "finalization" : "invalidation"} failed: ${String(error)}`,
        invalidationError,
      ].filter((entry): entry is string => entry !== null).join("; "),
    };
  }
}

function isCloseAcceptanceReady(report: CloseMechanicalReport): boolean {
  if (report.result.phase !== "pre-merge" || report.result.exitCategory !== "success") return false;
  const evaluation = report.diff.acceptanceEvaluation as AcceptanceEvaluationReport | undefined;
  if (evaluation?.determined !== true || evaluation.closeAllowed !== true) return false;
  const reconciliation = report.diff.verificationResourceReconciliation as
    | { permitted?: boolean }
    | undefined;
  if (reconciliation?.permitted !== true) return false;
  const acceptanceGaps = report.diff.acceptanceGaps as readonly AcceptanceGap[] | undefined;
  return acceptanceGaps !== undefined && acceptanceGaps.length === 0;
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
  const reconciliation = report.diff.verificationResourceReconciliation as
    | { permitted?: boolean }
    | undefined;
  if (reconciliation === undefined || reconciliation.permitted !== true) {
    return { permitted: false, reason: "verification-resource-reconciliation-denied" };
  }
  const failedOtherGate = report.result.steps.some(
    (step) =>
      step.status === "fail" &&
      step.name !== "verification-resource-reconciliation" &&
      step.name !== "close-acceptance-record",
  );
  if (failedOtherGate) return { permitted: false, reason: "mechanical-failure" };
  const acceptanceGaps = report.diff.acceptanceGaps as readonly AcceptanceGap[] | undefined;
  if (acceptanceGaps === undefined || acceptanceGaps.length > 0) {
    return { permitted: false, reason: "acceptance-gap-remains" };
  }
  if (report.result.exitCategory !== "success") {
    return { permitted: false, reason: "mechanical-failure" };
  }
  const record = report.diff.closeAcceptanceRecord as
    | { accepted?: boolean; written?: boolean }
    | undefined;
  if (record?.accepted !== true || record.written !== true) {
    return { permitted: false, reason: "close-acceptance-record-not-accepted" };
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

function requireRunnerLedgerIo(runner: MechanicalRunner): LedgerIo {
  const writeTextFile = runner.writeTextFile;
  const mkdirRecursive = runner.mkdirRecursive;
  const gitCommonDir = runner.gitCommonDir;
  return {
    exists: (absolutePath) => runner.exists(absolutePath),
    readTextFile: (absolutePath) => runner.readTextFile(absolutePath),
    writeTextFile: (absolutePath, content) => {
      if (writeTextFile === undefined) {
        throw new MechanicalInputError(
          "runner does not provide writeTextFile for close acceptance record writing",
        );
      }
      writeTextFile(absolutePath, content);
    },
    mkdirRecursive: (absolutePath) => {
      if (mkdirRecursive === undefined) {
        throw new MechanicalInputError(
          "runner does not provide mkdirRecursive for close acceptance record writing",
        );
      }
      mkdirRecursive(absolutePath);
    },
    gitCommonDir: () => {
      if (gitCommonDir === undefined) {
        throw new MechanicalInputError("runner does not provide gitCommonDir for main repo root resolution");
      }
      return gitCommonDir();
    },
  };
}

function parseGitRemotesListing(text: string): { name: string; url: string }[] {
  const seen = new Set<string>();
  const result: { name: string; url: string }[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    const match = trimmed.match(/^(\S+)\t(\S+)/);
    if (!match) continue;
    const key = `${match[1]} ${match[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ name: match[1] ?? "", url: match[2] ?? "" });
  }
  return result;
}

function parseWorktreeListing(text: string): string[] {
  const result: string[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("worktree ")) {
      const value = trimmed.slice("worktree ".length).trim();
      if (value.length > 0) result.push(value);
    }
  }
  return result;
}

function parseBranchListing(text: string): string[] {
  return text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 検証用一時資材の照合を実行し、照合 step・報告 diff・受入未達を組み立てる。
 * 観測は申告（台帳）と独立に git 列挙・検査コマンドで実行し、観測の欠落・不一致を
 * findings として検出する（Design「専用領域と作成経路の制限」節の観測手段 (a)〜(f)）。
 * 終了判定記録は permitted / denied の双方で書き出す（機械受理前提の消費対象）。
 */
function executeVerificationResourceReconciliation(
  input: CloseMechanicalInput,
  check: VerificationResourceCheck,
  runner: MechanicalRunner,
  ledgerIo: LedgerIo,
): {
  step: StepRecord;
  diff: VerificationResourceReconciliationEvaluation;
  gaps: readonly AcceptanceGap[];
} {
  const earlyFindings: ResourceReconciliationFinding[] = [];
  const observationFailures: { scope: string; reason: string; exitCode?: number }[] = [];

  let mainRepoRoot: string | null;
  try {
    mainRepoRoot = resolveMainRepoRoot(ledgerIo);
  } catch (error) {
    mainRepoRoot = null;
    earlyFindings.push({
      code: "ledger-unavailable",
      detail: `main repo root resolution failed: ${String(error)}`,
    });
  }

  let ledger: LedgerReadResult = { state: "missing", entries: [] };
  let ledgerPath: string | null = null;
  if (earlyFindings.length === 0 && mainRepoRoot !== null) {
    try {
      ledgerPath = resolveLedgerPath(mainRepoRoot, check.caseId);
      ledger = readLedger(ledgerIo, ledgerPath);
    } catch (error) {
      earlyFindings.push({
        code: "ledger-unavailable",
        detail: `ledger read failed: ${String(error)}`,
      });
    }
  }

  const remotesResult = runner.run({ command: "git", args: ["remote", "-v"], cwd: input.repoRoot });
  if (remotesResult.exitCode !== 0) {
    observationFailures.push({
      scope: "remote-worktree-branch-enumeration",
      reason: `git remote listing failed: ${remotesResult.stderr.trim()}`,
      exitCode: remotesResult.exitCode,
    });
  }
  const worktreeResult = runner.run({
    command: "git",
    args: ["worktree", "list", "--porcelain"],
    cwd: input.repoRoot,
  });
  if (worktreeResult.exitCode !== 0) {
    observationFailures.push({
      scope: "remote-worktree-branch-enumeration",
      reason: `git worktree listing failed: ${worktreeResult.stderr.trim()}`,
      exitCode: worktreeResult.exitCode,
    });
  }
  const branchResult = runner.run({
    command: "git",
    args: ["branch", "--list", "--all", "--format=%(refname:short)"],
    cwd: input.repoRoot,
  });
  if (branchResult.exitCode !== 0) {
    observationFailures.push({
      scope: "remote-worktree-branch-enumeration",
      reason: `git branch listing failed: ${branchResult.stderr.trim()}`,
      exitCode: branchResult.exitCode,
    });
  }
  const gitignoredResult = runner.run({
    command: "git",
    args: ["ls-files", "--others", "-i", "--exclude-standard"],
    cwd: input.repoRoot,
  });
  if (gitignoredResult.exitCode !== 0) {
    observationFailures.push({
      scope: "gitignored-temporary-output",
      reason: `gitignore 対象一時出力の列挙 failed: ${gitignoredResult.stderr.trim()}`,
      exitCode: gitignoredResult.exitCode,
    });
  }

  const dedicatedEntries: string[] = [];
  const osTempMatches: string[] = [];
  const processes: Record<string, { alive: boolean; commandLine: string | null }> = {};
  const listenPorts: Record<string, { listening: boolean }> = {};
  const remoteAbsenceInputs: Record<string, RemoteAbsenceJudgementInput> = {};
  for (const spec of check.inspectionCommands) {
    const result = runner.run({
      command: spec.command,
      args: spec.args,
      cwd: spec.cwd,
      timeoutMs: spec.timeoutMs,
    });
    if (result.exitCode !== 0) {
      observationFailures.push({
        scope: spec.scope,
        reason: `inspection command failed: ${result.stderr.trim().slice(-200)}`,
        exitCode: result.exitCode,
      });
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(result.stdout);
    } catch (error) {
      observationFailures.push({
        scope: spec.scope,
        reason: `inspection output is not valid JSON: ${String(error)}`,
      });
      continue;
    }
    if (!isJsonObject(parsed)) {
      observationFailures.push({
        scope: spec.scope,
        reason: "inspection output does not match the declared JSON contract shape",
      });
      continue;
    }
    let shapeOk = false;
    if (spec.scope === "dedicated-area-listing" && Array.isArray(parsed.entries)) {
      for (const entry of parsed.entries) {
        if (isNonEmptyString(entry)) dedicatedEntries.push(entry);
      }
      shapeOk = true;
    } else if (spec.scope === "os-temp-area-scan" && Array.isArray(parsed.matches)) {
      for (const entry of parsed.matches) {
        if (isNonEmptyString(entry)) osTempMatches.push(entry);
      }
      shapeOk = true;
    } else if (spec.scope === "process-liveness") {
      for (const [pid, value] of Object.entries(parsed)) {
        if (isJsonObject(value) && typeof value.alive === "boolean") {
          processes[pid] = {
            alive: value.alive,
            commandLine: typeof value.commandLine === "string" ? value.commandLine : null,
            ...(typeof value.cwd === "string" ? { cwd: value.cwd } : {}),
            ...(typeof value.startedAt === "string" ? { startedAt: value.startedAt } : {}),
          };
        }
      }
      shapeOk = true;
    } else if (spec.scope === "listen-port-check") {
      for (const [port, value] of Object.entries(parsed)) {
        if (isJsonObject(value) && typeof value.listening === "boolean") {
          listenPorts[port] = { listening: value.listening };
        }
      }
      shapeOk = true;
    } else if (spec.scope === "remote-absence-verification") {
      let validRemoteObservations = true;
      for (const [url, value] of Object.entries(parsed)) {
        if (
          !isJsonObject(value) ||
          typeof value.httpStatus404Observed !== "boolean" ||
          typeof value.authenticationConfirmed !== "boolean" ||
          typeof value.visibilityConfirmed !== "boolean" ||
          typeof value.targetIdConfirmed !== "boolean" ||
          (value.confirmedAbsenceEvidence !== undefined && typeof value.confirmedAbsenceEvidence !== "string")
        ) {
          validRemoteObservations = false;
          continue;
        }
        remoteAbsenceInputs[url] = {
          httpStatus404Observed: value.httpStatus404Observed,
          authenticationConfirmed: value.authenticationConfirmed,
          visibilityConfirmed: value.visibilityConfirmed,
          targetIdConfirmed: value.targetIdConfirmed,
          ...(typeof value.confirmedAbsenceEvidence === "string"
            ? { confirmedAbsenceEvidence: value.confirmedAbsenceEvidence }
            : {}),
        };
      }
      shapeOk = validRemoteObservations;
    }
    if (!shapeOk) {
      observationFailures.push({
        scope: spec.scope,
        reason: "inspection output does not match the declared JSON contract shape",
      });
    }
  }

  const gitignoredOutputs =
    gitignoredResult.exitCode === 0
      ? gitignoredResult.stdout.split("\n").map((line) => line.trim()).filter((line) => line.length > 0)
      : [];
  // gitignore 対象出力は案件識別子の有無で除外せず、台帳・既知残存・明示除外根拠と突合する。
  const observedEntries: ObservedTemporaryResource[] = [
    ...dedicatedEntries.map((entry) => ({ path: entry, source: "dedicated-area" as const })),
    ...osTempMatches.map((entry) => ({ path: entry, source: "os-temp-area" as const })),
    ...gitignoredOutputs.map((entry) => ({ path: entry, source: "gitignored-output" as const })),
  ];

  const excludedPaths = [
    {
      path: path.join(mainRepoRoot ?? input.repoRoot, ".agentdev", "tmp", "verification-resources"),
      basis: "ledger-itself",
    },
    {
      path: path.join(mainRepoRoot ?? input.repoRoot, ".agentdev", "close-acceptance"),
      basis: "close-acceptance-record-itself",
    },
    ...(check.inspectionArtifactPaths ?? []).map((entry) => ({
      path: entry,
      basis: "inspection-execution-recorded-artifact",
    })),
  ];

  const evaluation =
    earlyFindings.length === 0
      ? evaluateVerificationResourceReconciliation(
          ledger,
          {
            exists: (absolutePath) => ledgerIo.exists(absolutePath),
            remotes: parseGitRemotesListing(remotesResult.stdout),
            worktrees: parseWorktreeListing(worktreeResult.stdout),
            branches: parseBranchListing(branchResult.stdout),
            processes,
            listenPorts,
            remoteAbsenceInputs,
            observedEntries,
            inspectionFailures: observationFailures,
            excludedPaths,
            resolveBase: input.repoRoot,
          },
          check,
        )
      : null;
  const gaps = deriveAcceptanceGaps();
  const mergedFindings: ResourceReconciliationFinding[] = [
    ...earlyFindings,
    ...(evaluation?.findings ?? []),
  ];

  const permitted = mergedFindings.length === 0;
  const step: StepRecord = {
    name: "verification-resource-reconciliation",
    status: permitted && gaps.length === 0 ? "pass" : "fail",
    detail: {
      ledgerState: ledger.state,
      ledgerPath,
      mainRepoRoot: mainRepoRoot ?? "",
      entryCount: ledger.entries.length,
      childEntryCount: evaluation?.childEntryCount ?? 0,
      findings: mergedFindings,
      permitted,
      gaps,
      declaredDetectionScopes: [...DECLARED_DETECTION_SCOPES],
    },
  };
  const diff = {
    ledgerState: ledger.state,
    entryCount: ledger.entries.length,
    childEntryCount: evaluation?.childEntryCount ?? 0,
    findings: mergedFindings,
    permitted,
    uncollectedParentOrCommon: evaluation?.uncollectedParentOrCommon ?? [],
    terminationUnitBlocked: evaluation?.terminationUnitBlocked ?? false,
    excludedObservations: evaluation?.excludedObservations ?? [],
    knownResidualStillPresent: evaluation?.knownResidualStillPresent ?? [],
  };
  return { step, diff, gaps };
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

interface ReclamationStepOutcome {
  status: "pass" | "warn" | "fail";
  detail: Record<string, unknown>;
  convergenceMaterial: string | null;
  warnings: readonly string[];
}

/** 回収実行面（台帳回収・終了判定記録回収）を runner 注入で実行する。 */
function runReclamation(section: ReclamationSection, runner: MechanicalRunner): ReclamationStepOutcome {
  if (runner.deleteFile === undefined) {
    return {
      status: "fail",
      detail: { error: "mechanical runner does not provide deleteFile; reclamation cannot execute (fail-closed)" },
      convergenceMaterial: null,
      warnings: [],
    };
  }
  const io: ReclamationIo = {
    exists: (absolutePath) => runner.exists(absolutePath),
    readTextFile: (absolutePath) => runner.readTextFile(absolutePath),
    writeTextFile: () => fail("ledger write is not available through the mechanical runner (read/delete only)"),
    mkdirRecursive: () => fail("ledger directory creation is not available through the mechanical runner (read/delete only)"),
    gitCommonDir: () => fail("git common dir resolution is not available through the mechanical runner"),
    deleteFile: (absolutePath) => runner.deleteFile?.(absolutePath),
  };
  const detail: Record<string, unknown> = {};
  const warnings: string[] = [];
  let status: "pass" | "warn" | "fail" = "pass";
  let convergenceMaterial: string | null = null;
  if (section.ledger != null) {
    const ledgerResult: LedgerReclamationResult = reclaimLedger(
      io,
      section.ledger.mainRepoRoot,
      section.ledger.caseId,
      section.ledger.confirmation,
    );
    detail.ledgerStatus = ledgerResult.status;
    detail.ledgerPath = ledgerResult.ledgerPath;
    detail.reclaimedEntryCount = ledgerResult.reclaimedEntryCount;
    if (ledgerResult.status === "uncollected-entries") {
      detail.uncollectedIds = ledgerResult.uncollectedIds;
      status = "fail";
      warnings.push(
        `ledger reclamation refused: uncollected entries remain (termination unit incomplete): ${ledgerResult.uncollectedIds.join(", ")}`,
      );
    } else if (ledgerResult.status === "ledger-missing") {
      status = "warn";
      warnings.push(
        `ledger reclamation found no ledger file (a missing ledger is a record gap, not a basis for zero creations): ${ledgerResult.ledgerPath}`,
      );
    } else if (ledgerResult.convergenceMaterial !== null) {
      convergenceMaterial = ledgerResult.convergenceMaterial;
    }
  }
  if (section.closeAcceptanceRecord != null) {
    const recordResult: CloseAcceptanceReclamationResult = reclaimCloseAcceptanceRecord(io, section.closeAcceptanceRecord);
    detail.closeAcceptanceRecordStatus = recordResult.status;
    detail.closeAcceptanceRecordPath = recordResult.recordPath;
    if (recordResult.status === "record-missing") {
      warnings.push(
        `close acceptance record was not found at reclamation time (idempotent): ${recordResult.recordPath}`,
      );
    }
  }
  return { status, detail, convergenceMaterial, warnings };
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
  let provisionalAcceptanceRecord: CloseAcceptanceRecordWrite | null = null;
  let acceptanceRecordStep: StepRecord | null = null;

  if (input.phase === "pre-merge" && input.reclamation != null) {
    fail("input.reclamation is not allowed in pre-merge (reclamation runs only after the terminal operation)");
  }

  if (input.phase === "pre-merge") {
    provisionalAcceptanceRecord = writeCloseAcceptanceRecord(input, runner, false);
    acceptanceRecordStep = {
      name: "close-acceptance-record",
      status: provisionalAcceptanceRecord.written ? "pass" : "fail",
      detail: {
        path: provisionalAcceptanceRecord.path,
        targetRevision: provisionalAcceptanceRecord.record?.targetRevision ?? null,
        accepted: false,
        written: provisionalAcceptanceRecord.written,
        error: provisionalAcceptanceRecord.error,
      },
    };
    steps.push(acceptanceRecordStep);
    diff.closeAcceptanceRecord = {
      path: provisionalAcceptanceRecord.path,
      issueNumber: provisionalAcceptanceRecord.record?.issueNumber ?? null,
      targetRevision: provisionalAcceptanceRecord.record?.targetRevision ?? null,
      generatedAt: provisionalAcceptanceRecord.record?.generatedAt ?? null,
      accepted: false,
      written: provisionalAcceptanceRecord.written,
    };
    if (!provisionalAcceptanceRecord.written) {
      warnings.push(provisionalAcceptanceRecord.error ?? "close acceptance record invalidation failed");
    }
  }

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
    const selfAcceptanceRecordPath = resolveSelfAcceptanceRecordForLocalStateCheck(input, runner, worktreeCwd);
    const retainedEntries: string[] = [];
    const excludedSelfRecordEntries: string[] = [];
    for (const entry of status.stdout
      .split("\n")
      .map((line) => line.replace(/\r$/, ""))
      .filter((line) => line.length > 0)) {
      if (selfAcceptanceRecordPath !== null && porcelainEntryPath(entry) === selfAcceptanceRecordPath) {
        excludedSelfRecordEntries.push(entry);
      } else {
        retainedEntries.push(entry);
      }
    }
    const dirty = retainedEntries.length > 0;
    const branchOk = branch.stdout.trim() === input.branch;
    steps.push({
      name: "pre-merge-local-state-check",
      status: dirty || !branchOk ? "fail" : "pass",
      detail: {
        worktreeDirty: dirty,
        currentBranch: branch.stdout.trim(),
        expectedBranch: input.branch,
        excludedSelfAcceptanceRecordPath: selfAcceptanceRecordPath,
        excludedSelfRecordEntries,
      },
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

    const verificationResourceCheck = input.verificationResourceCheck
      ?? fail("input.verificationResourceCheck is required for pre-merge completion determination");
    const reconciliation = executeVerificationResourceReconciliation(
      input,
      verificationResourceCheck,
      runner,
      requireRunnerLedgerIo(runner),
    );
    steps.push(reconciliation.step);
    diff.verificationResourceReconciliation = reconciliation.diff;
    diff.acceptanceGaps = reconciliation.gaps;
    if (!reconciliation.diff.permitted) {
      warnings.push("verification-resource reconciliation failed; close operation is denied");
    }
    if (reconciliation.gaps.length > 0) {
      warnings.push("creation routes remain without verified detection or enforcement; close operation is denied");
    }

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

    // 一時資材回収の削除確認（削除実行の確認境界）。台帳に未回収対象が残る場合、
    // 利用者の明示確認と削除実行直前の識別情報照合（所在・種別・識別情報の完全一致）
    // が成立しない対象の削除は拒否として報告し、回収済み対象に削除確認記録が
    // 欠落している場合は削除確認の不存在として完了拒否の材料にする。機械可読値
    // （実行担当生成の approval 等）だけの確認は利用者確認として成立しない。
    // 台帳不在（記録欠落）は作成物なしの根拠にせず照合本体に委ねる（空状態の区別）。
    const deletionCheck = input.deletionConfirmationCheck;
    if (deletionCheck !== undefined && deletionCheck !== null) {
      let deletionOutcome: { state: "missing" | "present"; evaluation: ReturnType<typeof evaluateDeletionConfirmationFromLedgerText>["evaluation"] };
      try {
        const ledgerText = runner.exists(deletionCheck.ledgerPath)
          ? runner.readTextFile(deletionCheck.ledgerPath)
          : null;
        deletionOutcome = evaluateDeletionConfirmationFromLedgerText(
          ledgerText,
          deletionCheck.confirmations,
          deletionCheck.observations,
        );
      } catch (error) {
        deletionOutcome = {
          state: "present",
          evaluation: {
            permitted: false,
            evaluatedCount: 0,
            confirmedIds: [],
            refusals: [
              {
                entryId: "(ledger)",
                code: "deletion-confirmation-record-missing",
                detail: `ledger could not be evaluated (fail-closed): ${String(error)}`,
              },
            ],
          },
        };
      }
      const deletionFailed =
        deletionOutcome.state === "present" && deletionOutcome.evaluation.permitted !== true;
      steps.push({
        name: "deletion-confirmation-check",
        status: deletionFailed ? "fail" : "pass",
        detail: {
          ledgerPath: deletionCheck.ledgerPath,
          state: deletionOutcome.state,
          permitted: deletionOutcome.evaluation.permitted,
          evaluatedCount: deletionOutcome.evaluation.evaluatedCount,
          confirmedIds: deletionOutcome.evaluation.confirmedIds,
          refusals: deletionOutcome.evaluation.refusals,
        },
      });
      diff.deletionConfirmation = {
        state: deletionOutcome.state,
        permitted: deletionOutcome.evaluation.permitted,
        evaluatedCount: deletionOutcome.evaluation.evaluatedCount,
        confirmedIds: deletionOutcome.evaluation.confirmedIds,
        refusals: deletionOutcome.evaluation.refusals,
      };
      if (deletionFailed) {
        warnings.push(
          `deletion confirmation boundary refused ${deletionOutcome.evaluation.refusals.length} target(s); deletion without explicit user confirmation and identifier matching is not executed: ${deletionOutcome.evaluation.refusals
            .map((refusal) => `${refusal.entryId}(${refusal.code})`)
            .join(", ")}`,
        );
      }
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
    if (input.reclamation != null) {
      const outcome = runReclamation(input.reclamation, runner);
      steps.push({
        name: "verification-resource-reclamation",
        status: outcome.status,
        detail: outcome.detail,
      });
      if (outcome.convergenceMaterial !== null) {
        proposal.verification_resource_final_record = outcome.convergenceMaterial;
      }
      for (const warning of outcome.warnings) warnings.push(warning);
      diff.reclamation = outcome.detail;
    }
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

  let report = assembleReport(input.phase, steps, diff, warnings, proposal);
  if (input.phase === "pre-merge" && provisionalAcceptanceRecord !== null && acceptanceRecordStep !== null) {
    let finalAcceptanceRecord = provisionalAcceptanceRecord;
    if (isCloseAcceptanceReady(report)) {
      const acceptedWrite = writeCloseAcceptanceRecord(input, runner, true);
      finalAcceptanceRecord = acceptedWrite.written
        ? acceptedWrite
        : writeCloseAcceptanceRecord(input, runner, false);
      acceptanceRecordStep.status = acceptedWrite.written ? "pass" : "fail";
      if (!acceptedWrite.written) {
        warnings.push(acceptedWrite.error ?? "close acceptance record finalization failed");
      }
    }
    const accepted = finalAcceptanceRecord.written && finalAcceptanceRecord.record?.accepted === true;
    acceptanceRecordStep.detail = {
      path: finalAcceptanceRecord.path,
      targetRevision: finalAcceptanceRecord.record?.targetRevision ?? input.issueUpdatedAt ?? null,
      generatedAt: finalAcceptanceRecord.record?.generatedAt ?? null,
      accepted,
      written: finalAcceptanceRecord.written,
      error: finalAcceptanceRecord.error,
    };
    diff.closeAcceptanceRecord = {
      path: finalAcceptanceRecord.path,
      issueNumber: finalAcceptanceRecord.record?.issueNumber ?? input.verificationResourceCheck?.issueNumber ?? null,
      targetRevision: finalAcceptanceRecord.record?.targetRevision ?? input.issueUpdatedAt ?? null,
      generatedAt: finalAcceptanceRecord.record?.generatedAt ?? null,
      accepted,
      written: finalAcceptanceRecord.written,
    };
    report = assembleReport(input.phase, steps, diff, warnings, proposal);
  }
  return report;
}

function main(): void {
  try {
    const { input, validateOnly } = parseArgs(process.argv.slice(2));
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
    if (validateOnly) {
      const outcome = runValidateInputOnly(validated, (absolutePath) => fs.existsSync(absolutePath));
      process.stdout.write(`${JSON.stringify(outcome.report, null, 2)}
`);
      process.exit(outcome.ok ? 0 : 1);
    }
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
      writeTextFile(absolutePath, content) {
        fs.writeFileSync(absolutePath, content, "utf-8");
      },
      mkdirRecursive(absolutePath) {
        fs.mkdirSync(absolutePath, { recursive: true });
      },
      removeFile(absolutePath) {
        fs.rmSync(absolutePath, { force: true });
      },
      gitCommonDir() {
        const result = spawnSync(
          "git",
          ["rev-parse", "--path-format=absolute", "--git-common-dir"],
          { cwd: repoRootAbsolute, encoding: "utf-8", timeout: 10000 },
        );
        if (result.status !== 0) {
          throw new MechanicalInputError(`cannot resolve main repository git common dir: ${result.stderr ?? ""}`);
        }
        return result.stdout ?? "";
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
