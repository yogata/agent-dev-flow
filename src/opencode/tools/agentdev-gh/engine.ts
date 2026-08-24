// agentdev-gh Custom Tool の fail-closed 実行ゲート（決定6）。
//
// 全操作に共通する実行制御を所有する:
//   1. preflight  : 設定解釈（config-uninterpretable）とパス解決（path-unresolvable）。
//                   いずれか失敗すれば対象副作用を実行しない。
//   2. 実行       : 操作スペックの execute を呼ぶ。例外・異常終了は enforcement-crashed。
//   3. VERIFY     : 読み戻し照合。失敗・未了は verification-incomplete とし成功扱いとしない。
//
// Tool は実行機構であり、副作用の実行権限の所有者を変更しない。
// 権限の判断・承認は Workflow / 利用者側に留まり、本 Tool は操作の実行と検証のみを担う。


import {
  GH_TOOL_OPERATION_CATALOG,
  type CapabilityContingency,
  type GhToolFailure,
  type GhToolOperation,
  type GhToolRequest,
  type GhToolResult,
  type GhToolSuccess,
  type OperationCatalogEntry,
} from "./contracts.ts";
import type { GhRunner, GhRunnerRequest } from "./runner.ts";

// ---------------------------------------------------------------------------
// 設定解釈（fail-closed 1: 設定を解釈できない場合は実行しない）
// ---------------------------------------------------------------------------

/** 正規化済み Tool 設定。 */
export interface GhToolConfig {
  /** 対象リポジトリ（owner/name 形式）。 */
  readonly repo: string;
  /** API base URL。省略時は GitHub 公開 API。 */
  readonly apiBaseUrl: string | null;
}

export type ConfigResult =
  | { readonly ok: true; readonly config: GhToolConfig }
  | { readonly ok: false; readonly detail: string };

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/** 設定の解釈。不正な設定は失敗し、操作を実行しない。 */
export function interpretGhToolConfig(raw: unknown): ConfigResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, detail: "config must be an object" };
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.repo !== "string" || !REPO_PATTERN.test(obj.repo)) {
    return { ok: false, detail: `config.repo must be owner/name, got: ${String(obj.repo)}` };
  }
  let apiBaseUrl: string | null = null;
  if (obj.apiBaseUrl !== undefined) {
    if (typeof obj.apiBaseUrl !== "string" || !/^https:\/\//.test(obj.apiBaseUrl)) {
      return { ok: false, detail: "config.apiBaseUrl must be an https:// URL when present" };
    }
    apiBaseUrl = obj.apiBaseUrl;
  }
  return { ok: true, config: { repo: obj.repo, apiBaseUrl } };
}

// ---------------------------------------------------------------------------
// パス解決（fail-closed 2: 対象パスを安全に解決できない場合は実行しない）
// ---------------------------------------------------------------------------

/** Tool が使用する一時領域等の解決済みパス。 */
export interface GhToolPaths {
  /** 実装詳細（一時ファイル等）が使用する一時ディレクトリ。 */
  readonly tempDir: string;
}

export type PathsResult =
  | { readonly ok: true; readonly paths: GhToolPaths }
  | { readonly ok: false; readonly detail: string };

/** パス探査境界（OS の一時ディレクトリ解説等の注入点。テストは失敗を注入できる）。 */
export interface PathProber {
  tempDir(): string | null;
}

/** パス解決。解決不能は失敗し、操作を実行しない。 */
export function resolveToolPaths(prober: PathProber): PathsResult {
  const tempDir = prober.tempDir();
  if (tempDir === null || tempDir.length === 0) {
    return { ok: false, detail: "temp dir cannot be resolved safely" };
  }
  return { ok: true, paths: { tempDir } };
}

// ---------------------------------------------------------------------------
// 実行環境
// ---------------------------------------------------------------------------

/** fail-closed 前提が成立した実行環境。 */
export interface GhToolEnv {
  readonly runner: GhRunner;
  readonly config: GhToolConfig;
  readonly paths: GhToolPaths;
}

export type EnvResult =
  | { readonly ok: true; readonly env: GhToolEnv }
  | { readonly ok: false; readonly failure: GhToolFailure };

const CATALOG_BY_OPERATION: ReadonlyMap<GhToolOperation, OperationCatalogEntry> = new Map(
  GH_TOOL_OPERATION_CATALOG.map((e) => [e.operation, e]),
);

function contingencyOf(operation: GhToolOperation): CapabilityContingency {
  return CATALOG_BY_OPERATION.get(operation)?.contingency ?? {
    fallbacks: [],
    canContinue: false,
  };
}

function fail(
  operation: GhToolOperation,
  kind: GhToolFailure["kind"],
  retryable: boolean,
  detail: string,
): GhToolResult {
  return {
    ok: false,
    failure: { kind, retryable, detail, contingency: contingencyOf(operation) },
  };
}

/** 環境構築（preflight）。設定・パスのいずれかが解釈不能なら runner は一切呼ばれない。 */
export function buildGhToolEnv(
  rawConfig: unknown,
  prober: PathProber,
  runner: GhRunner,
): EnvResult {
  const config = interpretGhToolConfig(rawConfig);
  if (!config.ok) {
    return {
      ok: false,
      failure: {
        kind: "config-uninterpretable",
        retryable: false,
        detail: config.detail,
        contingency: { fallbacks: [], canContinue: false },
      },
    };
  }
  const paths = resolveToolPaths(prober);
  if (!paths.ok) {
    return {
      ok: false,
      failure: {
        kind: "path-unresolvable",
        retryable: false,
        detail: paths.detail,
        contingency: { fallbacks: [], canContinue: false },
      },
    };
  }
  return { ok: true, env: { runner, config: config.config, paths: paths.paths } };
}

// ---------------------------------------------------------------------------
// 操作スペック（各操作の入力検証・実行・応答解釈・読み戻し照合）
// ---------------------------------------------------------------------------

/** 操作ごとの差分実装。specs-issue.ts / specs-pr.ts が10操作分を定義する。 */
export interface OperationSpec {
  readonly operation: GhToolOperation;
  /** 未検証の要求（unknown）を構造化入力へ解釈する。失敗は invalid-input。 */
  readonly validate: (raw: unknown) => GhToolRequest | null;
  /** runner への構造化要求の組立て。 */
  readonly buildRequest: (request: GhToolRequest) => GhRunnerRequest;
  /** 実行応答の解釈。失敗は operation-failed。 */
  readonly parseSuccess: (payload: unknown) => GhToolSuccess | null;
  /**
   * 読み戻し照合（VERIFY）。true のみ成功扱い。例外は engine が
   * verification-incomplete へ分類する。要求（request）は照合値の参照用。
   */
  readonly verify: (
    runner: GhRunner,
    request: GhToolRequest,
    success: GhToolSuccess,
  ) => Promise<boolean>;
}

async function callRunner(
  runner: GhRunner,
  request: GhRunnerRequest,
): Promise<{ readonly ok: true; readonly payload: unknown } | { readonly ok: false; readonly error: string }> {
  try {
    const reply = await runner.run(request);
    if (reply.ok) return { ok: true, payload: reply.payload };
    return { ok: false, error: reply.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * fail-closed 実行ゲート。全操作がこの順序を通る:
 * preflight（環境構築時）→ 入力解釈 → 実行 → 読み戻し照合 → 成功。
 * いずれかの段階が失敗すれば成功を返さない。
 */
export async function executeOperation(
  env: GhToolEnv,
  spec: OperationSpec,
  rawRequest: unknown,
): Promise<GhToolResult> {
  const request = spec.validate(rawRequest);
  if (request === null) {
    return fail(spec.operation, "invalid-input", true, "request does not match the operation contract");
  }
  const run = await callRunner(env.runner, spec.buildRequest(request));
  if (!run.ok) {
    return fail(spec.operation, "enforcement-crashed", true, `operation execution failed: ${run.error}`);
  }
  const success = spec.parseSuccess(run.payload);
  if (success === null) {
    return fail(spec.operation, "operation-failed", true, "operation reply does not match the success contract");
  }
  let verified: boolean;
  try {
    verified = await spec.verify(env.runner, request, success);
  } catch (e) {
    return fail(
      spec.operation,
      "verification-incomplete",
      false,
      `verification threw: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  if (!verified) {
    return fail(
      spec.operation,
      "verification-incomplete",
      false,
      "verification read-back did not confirm the operation result",
    );
  }
  return { ok: true, success };
}
