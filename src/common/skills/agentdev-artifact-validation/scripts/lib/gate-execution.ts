//
// ゲート機械処理の共有 lib（case-open / case-ready / case-close の機械工程入口が
// 共有する正規所有1点）。
//
// agentdev-artifact-validation が正規所有する（skill Design「現在の動作」「境界」節）。
// 利用側は supported lib interface（利用側 skill scripts/lib/ 配下の再エクスポート
// shim）経由で利用し、本 lib の内部パスを直接参照しない。
//
// 本 lib が所有するのは反復可能な機械処理に限る: ゲート実行体のパス解決と可用性
// 検査、既知 gate 引数契約の検査、--validate-input 相当の入力検査実行の共通部分、
// 実行証跡の構築、既知入力型からの gate spec 固定生成。工程固有のゲート選択・
// 順序・実行条件・結果解釈は各工程の Design と各入口 script が所有し続ける
// （各 command Design「機械工程の script 呼び出し契約」節）。
// 本 lib は検証操作の副作用を持たない（exists 確認と純粋関数のみ。git・ゲート実行・
// ファイル書込みは行わない）。横断的な共通基盤（構成層の新設）ではなく、
// 配布 skill 配下の共有 lib 単一所有である。
//

import * as path from "node:path";

/** 1回の外部処理呼び出しの仕様。 */
export interface CommandSpec {
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

/** 外部処理呼び出しの結果。 */
export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/** 品質ゲート実行仕様（入力 JSON から requireGateSpec で検証して組み立てる）。 */
export interface GateCommandSpec {
  name: string;
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

/**
 * 1回の検査実行から保存する実行証跡。標準出力・標準エラーは全文を保持し、
 * 末尾抜粋や集計要約で原結果を代替しない。実行条件は実行コマンド・引数・
 * 作業ディレクトリ・指定された実行上限と対応付けて記録する。
 */
export interface GateExecutionEvidence {
  executedCommand: {
    command: string;
    args: readonly string[];
    cwd: string;
    timeoutMs?: number;
  };
  exitCode: number;
  stdout: string;
  stderr: string;
  /** 検査対象の版（実行時点の HEAD。取得できない場合は空文字）。 */
  targetRevision: string;
  /** 既知パス引数（--root、--input、--artifact、--files）から解決できた検査対象パス。 */
  targetPaths: readonly string[];
}

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

const GATE_SCRIPT_EXTENSIONS = [".ts", ".mts", ".mjs", ".js", ".cjs"];

/**
 * ゲート実行体ファイル（スクリプトパス）の解決。command と args[0] のうち
 * パス区切りまたはスクリプト拡張子をもつ最初の要素を gate cwd 基準で解決する。
 * 実行体ファイルを特定できない場合は null（存在検査対象なし。command 自体の
 * 解決は実行基盤の責務で、ENOENT 等の実行時失敗は既存の実行経路が扱う）。
 */
export function resolveGateExecutablePath(spec: GateCommandSpec): string | null {
  const candidates: readonly (string | undefined)[] = [spec.command, spec.args[0]];
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

/** 入力・契約違反の検出を呼出元へ通知する（MechanicalInputError を throw する）。 */
export function fail(message: string): never {
  throw new MechanicalInputError(message);
}

/**
 * 既知 flag の値契約（配布下位検査の契約由来）。未知 flag は検証対象外とする。
 * --req の受理パターンは呼出側が正規所有する REQ 行ID 契約（definition-traceability-gate
 * の REQ_ROW_ID_LIST_PATTERN）から注入する。本 lib は当該契約の正を再定義しない。
 */
export interface KnownArgContract {
  flag: string;
  values?: readonly string[];
  pattern?: RegExp;
  nonEmpty?: boolean;
}

/** 既知 gate 引数契約の正規構成（1点実装。--req の pattern のみ呼出側が注入する）。 */
export function buildKnownGateArgContracts(reqRowIdListPattern: RegExp): readonly KnownArgContract[] {
  return [
    { flag: "--req", pattern: reqRowIdListPattern },
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
}

/** 検査対象パスとして解決対象とする既知パス引数。 */
const PATH_FLAG_CONTRACTS = ["--root", "--input", "--artifact", "--files"] as const;

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
 * 検証し、不正値は検査を開始せず MechanicalInputError で拒否する。形状検査だけでなく
 * 下位引数の値（--req の範囲構文、許容集合外の値等）も拒否する。未知 flag は
 * 検証対象外とし、任意コマンドの汎用解釈器を作らない。
 */
export function preValidateGateSpecWithContracts(spec: GateCommandSpec, contracts: readonly KnownArgContract[]): void {
  for (const contract of contracts) {
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

/**
 * 検証専用経路（--validate-input）の共通実行部。入力検証は入口側が完了させた後、
 * 既知 gate 引数契約の事前検査（preValidateGateSpec）とゲート実行体の存在確認
 * （evaluateGateAvailability の exists 確認）のみを行い、報告 JSON（ok、mode、script、
 * inputValidation、gatePreValidation、gateAvailability、sideEffects の固定キー順）を
 * 組み立てる。worktree 作成・ゲート実行・git/gh 操作・管理対象ファイルの変更は
 * 行わない（check モードの非破壊契約）。
 */
export function runGatePreValidation(
  scriptName: string,
  gates: readonly GateCommandSpec[],
  contracts: readonly KnownArgContract[],
  exists: (absolutePath: string) => boolean,
): { ok: boolean; report: Record<string, unknown> } {
  for (const gate of gates) {
    preValidateGateSpecWithContracts(gate, contracts);
  }
  const availability = evaluateGateAvailability(gates, exists);
  const report = {
    ok: availability.missing.length === 0,
    mode: "validate-input",
    script: scriptName,
    inputValidation: "pass",
    gatePreValidation: "pass",
    gateAvailability: availability,
    sideEffects: "none",
  };
  return { ok: availability.missing.length === 0, report };
}

/**
 * CLI 入口の引数解析（3入口で同一の解析規則）。--input に検査入力 JSON ファイルを
 * 受け取り、--validate-input で検証専用経路を有効化する。--help / -h は usage を
 * 標準出力へ書いて終了コード 0 で終了する。未知引数と --input 未指定は
 * MechanicalInputError で拒否する。
 */
export function parseGateCliArgs(argv: readonly string[], usage: string): { input: string; validateOnly: boolean } {
  let input: string | null = null;
  let validateOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" && argv[i + 1] !== undefined) {
      input = argv[++i] ?? null;
    } else if (arg === "--validate-input") {
      validateOnly = true;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${usage}\n`);
      process.exit(0);
    } else {
      fail(`unknown argument: ${arg}\n${usage}`);
    }
  }
  if (input === null) fail(`--input is required\n${usage}`);
  return { input, validateOnly };
}

/** 入力 JSON の品質ゲート実行仕様フィールドを検証して GateCommandSpec に組み立てる。 */
export function requireGateSpec(value: unknown, field: string): GateCommandSpec {
  if (typeof value !== "object" || value === null) {
    fail(`input.${field} is required (quality gate omission is not allowed)`);
  }
  const v = value as Record<string, unknown>;
  if (typeof v.command !== "string" || !Array.isArray(v.args) || typeof v.cwd !== "string") {
    fail(`input.${field} must contain command (string), args (string[]), cwd (string)`);
  }
  return {
    name: typeof v.name === "string" ? v.name : field,
    command: v.command,
    args: v.args as readonly string[],
    cwd: v.cwd,
    timeoutMs: typeof v.timeoutMs === "number" ? v.timeoutMs : undefined,
  };
}

/** 既知の下位検査の呼出形態（実体パスの解決は呼び出し側手順が行う）。 */
export interface KnownGateInvocation {
  command: string;
  scriptArgs: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

export interface KnownWorkflowGateInput extends KnownGateInvocation {
  workflow: string;
  /** 下位 checker 契約が定める --workflow 値の許容集合。 */
  allowedWorkflowValues: readonly string[];
  root: string;
}

export interface KnownTraceabilityGateInput extends KnownGateInvocation {
  root: string;
  reqIds: readonly string[];
}

export interface KnownOverlapGateInput extends KnownGateInvocation {
  inputPath: string;
  root: string;
}

function toGateSpec(
  name: string,
  invocation: KnownGateInvocation,
  trailingArgs: readonly string[],
): GateCommandSpec {
  return {
    name,
    command: invocation.command,
    args: [...invocation.scriptArgs, ...trailingArgs],
    cwd: invocation.cwd,
    ...(invocation.timeoutMs !== undefined ? { timeoutMs: invocation.timeoutMs } : {}),
  };
}

/**
 * REQ 行ID の検証と producer 固有の追加制約の適用の上で、カンマ連結リストへ
 * 組み立てる。ID の形式妥当性検査（isAcceptedId）は呼出側が正規所有する REQ 行ID
 * 契約（definition-traceability-gate の isReqRowId）を注入する。本 lib は当該契約の
 * 正を再定義しない。producer pattern が与えられない場合は形式妥当性のみ検証する。
 */
export function requireReqIdList(
  reqIds: readonly string[],
  isAcceptedId: (id: string) => boolean,
  producerPattern?: RegExp | null,
): string {
  for (const id of reqIds) {
    if (!isAcceptedId(id)) {
      fail(`invalid requirement row id: ${id}`);
    }
    if (producerPattern != null && !producerPattern.test(id)) {
      fail(`requirement row id violates the configured producer pattern: ${id}`);
    }
  }
  return reqIds.join(",");
}

/** workflow 値付き integrity gate（check_changed_docs 等の下位契約）を既知入力型から固定生成する。 */
export function buildKnownWorkflowIntegrityGateSpec(input: KnownWorkflowGateInput): GateCommandSpec {
  if (!input.allowedWorkflowValues.includes(input.workflow)) {
    fail(`workflow value is rejected by the subordinate checker contract (allowed: ${input.allowedWorkflowValues.join(", ")}): ${input.workflow}`);
  }
  return toGateSpec("integrity-check", input, ["--workflow", input.workflow, "--root", input.root]);
}

/** traceability check の gate spec を既知入力型と下位契約から固定生成する。 */
export function buildKnownTraceabilityCheckSpec(
  input: KnownTraceabilityGateInput,
  isAcceptedId: (id: string) => boolean,
  producerPattern?: RegExp | null,
): GateCommandSpec {
  return toGateSpec("traceability-check", input, ["--root", input.root, "--req", requireReqIdList(input.reqIds, isAcceptedId, producerPattern)]);
}

/** overlap 突合（共有単一実装）の gate spec を既知入力型と下位契約から固定生成する。 */
export function buildKnownOverlapCheckSpec(input: KnownOverlapGateInput): GateCommandSpec {
  return toGateSpec("overlap-cross-check", input, ["--input", input.inputPath, "--root", input.root]);
}

/** generate_indexes の gate spec を既知入力型から固定生成する。 */
export function buildKnownGenerateIndexesSpec(input: KnownGateInvocation): GateCommandSpec {
  return toGateSpec("generate_indexes", input, []);
}

/** check_integrity の gate spec を既知入力型から固定生成する。 */
export function buildKnownCheckIntegritySpec(input: KnownGateInvocation): GateCommandSpec {
  return toGateSpec("check_integrity", input, []);
}

function resolveTargetPaths(args: readonly string[]): string[] {
  const found: string[] = [];
  for (const flag of PATH_FLAG_CONTRACTS) {
    const value = extractFlagValue(args, flag);
    if (value !== null && value.trim().length > 0) {
      found.push(value);
    }
  }
  return found;
}

/** 1回の検査実行から実行証跡を構築する（終了コード取得のための再実行を不要にする）。 */
export function buildGateEvidence(
  spec: GateCommandSpec,
  result: CommandResult,
  targetRevision: string,
): GateExecutionEvidence {
  return {
    executedCommand: {
      command: spec.command,
      args: spec.args,
      cwd: spec.cwd,
      ...(spec.timeoutMs !== undefined ? { timeoutMs: spec.timeoutMs } : {}),
    },
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    targetRevision,
    targetPaths: resolveTargetPaths(spec.args),
  };
}
