// agentdev_third_party Custom Tool の fail-closed 実行ゲート。
//
// 全操作に共通する実行制御を所有する:
//   1. preflight  : 宣言ファイルの解釈（config-uninterpretable）と配置先・
//                   staging のパス解決（path-unresolvable）。
//                   いずれか失敗すれば取得を実行しない。
//   2. 計画       : 対象 Skill 名（省略時は全件）を宣言へ照合し、source URL
//                   判定と管理外衝突検出を行う。dry-run はここで完了する。
//   3. 実行       : 対象ごとに検証済み配置（acquisition.ts）を実行する。
//   4. VERIFY     : acquisition.ts 内の読み戻し検証（verifyPlacement）を必須とし、
//                   通過した対象のみ成功として集約する。
//
// 1つでも失敗・拒否が残る場合、操作全体を成功扱いにしない
// （失敗を成功扱いとしない、Design「third-party Skill 取得」操作契約）。
//
// Tool は実行機構であり、副作用の実行権限の所有者を変更しない。
// 権限の判断・承認は Workflow / 利用者側に留まり、本 Tool は取得の実行と
// 検証のみを担う。


import * as path from "node:path";
import {
  type PlannedTarget,
  type TargetResult,
  type TpFailure,
  type TpFailureKind,
  type TpRequest,
  type TpResult,
  type TpSuccess,
  type UnmanagedConflict,
  TP_TOOL_OPERATION_CATALOG,
} from "./contracts.ts";
import { loadDeclaration } from "./declaration.ts";
import {
  acquireTarget,
  planTarget,
  type AcquisitionEnv,
  type ExistingClassification,
  type PlanOutcome,
} from "./acquisition.ts";
import type { SourceFetcher } from "./transport.ts";

/** Tool の実行環境（preflight を通過した正規化済み設定）。 */
export interface TpToolEnv {
  readonly acquisition: AcquisitionEnv;
  readonly declarationPath: string;
}

export type EnvResult =
  | { readonly ok: true; readonly env: TpToolEnv }
  | { readonly ok: false; readonly failure: TpFailure };

function failure(kind: TpFailureKind, retryable: boolean, detail: string): TpFailure {
  const entry = TP_TOOL_OPERATION_CATALOG[0];
  return {
    kind,
    retryable,
    detail,
    contingency: entry?.contingency ?? { fallbacks: [], canContinue: false },
  };
}

/** パス探査境界（テストは解決失敗を注入できる）。 */
export interface TpPathProber {
  /** 配置先ルートが解決可能か。解決不能は null を返す。 */
  skillsRoot(candidates: readonly string[]): string | null;
  /** 一時領域の解決。解決不能は null を返す。 */
  stagingRoot(): string | null;
}

/** 環境構築（preflight）。宣言はここでは読まない（入力検証は操作実行時）。 */
export function buildTpToolEnv(
  rawConfig: unknown,
  prober: TpPathProber,
  fetcher: SourceFetcher,
): EnvResult {
  if (typeof rawConfig !== "object" || rawConfig === null) {
    return {
      ok: false,
      failure: failure("config-uninterpretable", false, "config must be an object"),
    };
  }
  const obj = rawConfig as Record<string, unknown>;
  const rawDeclarationPath = obj.declarationPath;
  const rawSkillsRoot = obj.skillsRoot;
  if (typeof rawDeclarationPath !== "string" || rawDeclarationPath.length === 0) {
    return {
      ok: false,
      failure: failure("config-uninterpretable", false, "config.declarationPath must be a non-empty string"),
    };
  }
  if (typeof rawSkillsRoot !== "string" || rawSkillsRoot.length === 0) {
    return {
      ok: false,
      failure: failure("config-uninterpretable", false, "config.skillsRoot must be a non-empty string"),
    };
  }
  const stagingRoot = prober.stagingRoot();
  if (stagingRoot === null || stagingRoot.length === 0) {
    return {
      ok: false,
      failure: failure("path-unresolvable", false, "staging root cannot be resolved safely"),
    };
  }
  const skillsRoot = prober.skillsRoot([rawSkillsRoot]);
  if (skillsRoot === null || skillsRoot.length === 0) {
    return {
      ok: false,
      failure: failure("path-unresolvable", false, "skills root cannot be resolved safely"),
    };
  }
  return {
    ok: true,
    env: {
      declarationPath: rawDeclarationPath,
      acquisition: {
        fetcher,
        skillsRoot,
        stagingRoot,
        now: () => new Date(),
      },
    },
  };
}

/** 要求の解釈。不正な要求は取得を実行しない。 */
export function validateAcquireRequest(raw: unknown): { ok: true; request: TpRequest } | { ok: false; detail: string } {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, detail: "request must be an object with an operation field" };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.operation !== "acquire") {
    return { ok: false, detail: `unknown operation: ${String(obj.operation)} (supported: acquire)` };
  }
  if (obj.skill !== undefined && typeof obj.skill !== "string") {
    return { ok: false, detail: "skill must be a string when present" };
  }
  if (obj.dryRun !== undefined && typeof obj.dryRun !== "boolean") {
    return { ok: false, detail: "dryRun must be a boolean when present" };
  }
  const request: TpRequest = {
    operation: "acquire",
    ...(typeof obj.skill === "string" ? { skill: obj.skill } : {}),
    ...(obj.dryRun === true ? { dryRun: true } : {}),
  };
  return { ok: true, request };
}

interface PlannedEntry {
  readonly name: string;
  readonly source: string;
  readonly plan: PlanOutcome;
}

async function resolveTargets(
  env: TpToolEnv,
  request: TpRequest,
  declared: ReadonlyMap<string, string>,
): Promise<{ ok: true; entries: readonly PlannedEntry[] } | { ok: false; failure: TpFailure }> {
  const entries: PlannedEntry[] = [];
  const selected: Array<[string, string]> =
    request.skill !== undefined
      ? declared.has(request.skill)
        ? [[request.skill, declared.get(request.skill) as string]]
        : []
      : [...declared.entries()];

  if (request.skill !== undefined && !declared.has(request.skill)) {
    return {
      ok: false,
      failure: failure("operation-failed", false, `skill is not declared in the declaration file: ${request.skill}`),
    };
  }

  for (const [name, source] of selected) {
    const plan = await planTarget(env.acquisition, name, source);
    entries.push({ name, source, plan });
  }
  return { ok: true, entries };
}

/**
 * fail-closed 実行ゲート。precepts の順序を通る:
 * 宣言読込 → 対象計画（dry-run 完了点）→ 検証済み取得 → 成功集約。
 * 1つでも失敗が残る場合 ok:false を返す（失敗を成功扱いにしない）。
 */
export async function executeAcquire(env: TpToolEnv, rawRequest: unknown): Promise<TpResult> {
  const validated = validateAcquireRequest(rawRequest);
  if (!validated.ok) {
    return { ok: false, failure: failure("invalid-input", true, validated.detail) };
  }
  const request = validated.request;
  const dryRun = request.dryRun === true;

  const declaration = await loadDeclaration(env.declarationPath);
  if (!declaration.ok) {
    return { ok: false, failure: failure("config-uninterpretable", false, declaration.detail) };
  }
  const declared = new Map(declaration.skills.map((s) => [s.name, s.source]));

  const targets = await resolveTargets(env, request, declared);
  if (!targets.ok) {
    return { ok: false, failure: targets.failure };
  }

  const plannedTargets: PlannedTarget[] = [];
  const conflicts: UnmanagedConflict[] = [];
  for (const entry of targets.entries) {
    if (entry.plan.ok) {
      plannedTargets.push(entry.plan.target);
      if (entry.plan.target.existing === "unmanaged") {
        conflicts.push({
          name: entry.name,
          placementPath: entry.plan.target.placementPath,
          detail: `existing placement at ${entry.plan.target.placementPath} is not managed by this tool (missing provenance marker)`,
        });
      }
    }
  }

  if (dryRun) {
    const report = {
      operation: "acquire" as const,
      dryRun: true,
      targets: plannedTargets,
      results: plannedTargets.map<TargetResult>((t) => ({
        name: t.name,
        ok: true,
        action: "planned" as const,
        placementPath: t.placementPath,
        fileCount: 0,
        failure: null,
      })),
      conflicts,
      summary: {
        requested: plannedTargets.length,
        succeeded: 0,
        failed: 0,
        refused: conflicts.length,
      },
    };
    const success: TpSuccess = { operation: "acquire", report };
    return { ok: true, success };
  }

  const results: TargetResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let refused = 0;

  for (const entry of targets.entries) {
    if (!entry.plan.ok) {
      results.push({
        name: entry.name,
        ok: false,
        action: "failed",
        placementPath: path.join(env.acquisition.skillsRoot, entry.name),
        fileCount: 0,
        failure: entry.plan.detail,
      });
      failed++;
      continue;
    }
    if (entry.plan.target.existing === "unmanaged") {
      results.push({
        name: entry.name,
        ok: false,
        action: "refused-unmanaged",
        placementPath: entry.plan.target.placementPath,
        fileCount: 0,
        failure: "existing placement is not managed by this tool; overwrite was refused",
      });
      refused++;
      continue;
    }
    const existing: ExistingClassification = entry.plan.target.existing;
    const outcome = await acquireTarget(
      env.acquisition,
      entry.name,
      entry.source,
      entry.plan.resolved,
      existing,
    );
    if (outcome.ok) {
      results.push({
        name: entry.name,
        ok: true,
        action: outcome.action,
        placementPath: entry.plan.target.placementPath,
        fileCount: outcome.fileCount,
        failure: null,
      });
      succeeded++;
    } else {
      const action = outcome.reason === "refused-unmanaged" ? "refused-unmanaged" as const : "failed" as const;
      if (action === "refused-unmanaged") refused++; else failed++;
      results.push({
        name: entry.name,
        ok: false,
        action,
        placementPath: entry.plan.target.placementPath,
        fileCount: 0,
        failure: outcome.detail,
      });
    }
  }

  const anyFailure = failed > 0 || refused > 0;
  if (anyFailure) {
    const failureSummary = results
      .filter((r) => !r.ok)
      .map((r) => `${r.name}: ${r.failure ?? "unknown failure"}`)
      .join("; ");
    return {
      ok: false,
      failure: failure(
        "operation-failed",
        true,
        `acquisition incomplete: ${succeeded} succeeded, ${failed} failed, ${refused} refused (unmanaged conflict) [${failureSummary}]`,
      ),
      report: {
        operation: "acquire",
        dryRun: false,
        targets: plannedTargets,
        results,
        conflicts,
        summary: {
          requested: results.length,
          succeeded,
          failed,
          refused,
        },
      },
    };
  }

  const report = {
    operation: "acquire" as const,
    dryRun: false,
    targets: plannedTargets,
    results,
    conflicts,
    summary: {
      requested: results.length,
      succeeded,
      failed,
      refused,
    },
  };
  const success: TpSuccess = { operation: "acquire", report };
  return { ok: true, success };
}

/** staging root の既定解決（OS の一時ディレクトリ）。 */
export const defaultTpPathProber: TpPathProber = {
  skillsRoot: (candidates) => candidates.find((c) => path.isAbsolute(c)) ?? null,
  stagingRoot: () => path.join(fsTmpdir(), "agentdev-third-party"),
};

function fsTmpdir(): string {
  // Bun/Node 互換の OS 一時ディレクトリ解決（環境変数と既定値）。
  return process.env.TMPDIR ?? process.env.TEMP ?? process.env.TMP ?? "/tmp";
}
