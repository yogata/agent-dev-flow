// agentdev-textlint-guard 共通実行基盤: 文章検査（両入口の共通判定点）。
//
// pre-write 検査も最終検査も、このモジュールの inspectText / inspectFile を経由する。
// 同一の全文、パス、規則、設定に対して同一の判定（正規化済み結果）を返すことが
// 両入口の同一性契約の実装本体である。検査異常終了は検査不能として失敗を返す
// （fail-closed、呼出側は副作用を拒否する）。
// プロジェクト固有用語辞書の発見もここで行い、規則合成へ追加合成する。

import * as fs from "node:fs";
import * as path from "node:path";
import type { GuardConfig, GuardConfigResult } from "./config.ts";
import { formatConfigError, loadGuardConfig } from "./config.ts";
import { loadEngine, type EngineBundleModule, type EngineLoadResult, type TextlintKernelLike } from "./engine-bundle.ts";
import {
  computeFileIdentityKey,
  computeInspectionConditions,
  type ComputeConditionsInput,
  type InspectionConditionsResult,
} from "./identity.ts";
import { loadStoredFileResult, storeFileResult } from "./result-store.ts";
import { composeRuleDescriptors, type RuleComposition } from "./rules.ts";
import { discoverProjectPrh, formatProjectPrhError } from "./terminology.ts";
import {
  classifySeverity,
  extractExcerpt,
  type FileInspectionResult,
  type InspectionFinding,
  summarizeOutcome,
  type InspectionOutcome,
} from "./results.ts";

export interface InspectEnvironment {
  /** 設定の読込み（既定: 対象プロジェクトルートの固定パス）。 */
  readonly loadConfig?: (root: string) => GuardConfigResult;
  /** エンジン読込み（既定: vendored bundle）。 */
  readonly loadEngineFn?: () => Promise<EngineLoadResult>;
  /** 規則合成（既定: composeRuleDescriptors）。テストで差し替え可能。 */
  readonly composeRules?: (engineResult: EngineLoadResult) => RuleComposition;
  /** 検査条件の計算（既定: computeInspectionConditions）。テストで差し替え可能。 */
  readonly computeConditions?: (input: ComputeConditionsInput) => InspectionConditionsResult;
  readonly pluginDir?: string;
}

export type InspectPrepared =
  | {
      readonly ok: true;
      readonly config: GuardConfig;
      readonly kernel: TextlintKernelLike;
      readonly composition: RuleComposition;
      readonly markdownPlugin: unknown;
      readonly engine: EngineBundleModule;
    }
  | { readonly ok: false; readonly detail: string };

/** 設定読込み + エンジン読込み + 規則合成までの共通前処理。 */
export async function prepareInspection(root: string, env: InspectEnvironment = {}): Promise<InspectPrepared> {
  const configResult = (env.loadConfig ?? loadGuardConfig)(root);
  if (!configResult.ok) {
    return { ok: false, detail: formatConfigError(configResult) };
  }
  const projectPrh = discoverProjectPrh(root);
  if (!projectPrh.ok) {
    return { ok: false, detail: formatProjectPrhError(projectPrh) };
  }
  const engineResult = await (env.loadEngineFn ?? (() => loadEngine(env.pluginDir)))();
  if (!engineResult.ok) {
    return { ok: false, detail: `agentdev-textlint-guard: ${engineResult.detail}; blocked per fail-closed` };
  }
  try {
    const composition =
      env.composeRules !== undefined
        ? env.composeRules(engineResult)
        : composeRuleDescriptors(
            engineResult.engine,
            projectPrh.path === null ? {} : { prhRulePaths: [projectPrh.path] },
          );
    return {
      ok: true,
      config: configResult.config,
      kernel: new engineResult.engine.TextlintKernel(),
      composition,
      markdownPlugin: engineResult.engine.markdownPlugin,
      engine: engineResult.engine,
    };
  } catch (e) {
    return {
      ok: false,
      detail: `agentdev-textlint-guard: rule composition failed (${e instanceof Error ? e.message : String(e)}); blocked per fail-closed`,
    };
  }
}

export type InspectTextResult =
  | { readonly ok: true; readonly result: FileInspectionResult }
  | { readonly ok: false; readonly detail: string };

/**
 * 全文を検査する（pre-write は完成予定全文、最終検査は実ファイル全文）。
 * path はルート相対（/ 区切り）。検査対象外の拡張子は検査せずに空結果を返す
 * （呼出側の対象判定と二重になるため、ここでも安全側で拡張子を確認する）。
 */
export async function inspectText(
  prepared: InspectPrepared,
  root: string,
  rootRelativePath: string,
  text: string,
): Promise<InspectTextResult> {
  if (!prepared.ok) return { ok: false, detail: prepared.detail };
  if (!rootRelativePath.endsWith(".md")) {
    return { ok: true, result: { path: rootRelativePath, findings: [], hardCount: 0 } };
  }
  try {
    const lintResult = await prepared.kernel.lintText(text, {
      ext: ".md",
      filePath: path.join(root, ...rootRelativePath.split("/")),
      plugins: [{ pluginId: "markdown", plugin: prepared.markdownPlugin }],
      rules: prepared.composition.rules,
    });
    // 拒否対象の判定は規則構成の hardRuleIds（意思決定記録の限定列挙）を正とする。
    // kernel の severity は、RuleError を介さない plain object report で規則が
    // severity を返さない場合 options.severity を無視して error 固定となるため
    // （例: preset-ai-writing/ai-tech-writing-guideline）、数値だけでは
    // 助言対象の規則が拒否対象へ昇格してしまう。
    const hardRuleIds = new Set(prepared.composition.hardRuleIds);
    const requirementRowLines = new Set(
      text
        .split(/\r?\n/)
        .flatMap((line, index) => (/^\s*\|\s*REQ-\d{3}-\d{3}\s*\|/.test(line) ? [index + 1] : [])),
    );
    const findings = lintResult.messages
      .filter((message) => !(message.ruleId === "prh" && requirementRowLines.has(message.line ?? 0)))
      .map((m): InspectionFinding => {
        const range = normalizeRange(m.range, m.fix?.range ?? null);
        const numeric = classifySeverity(m.severity);
        return {
          path: rootRelativePath,
          line: m.line,
          column: m.column,
          ruleId: m.ruleId,
          message: m.message,
          excerpt: extractExcerpt(text, range),
          replacement: m.fix?.text ?? null,
          severity: hardRuleIds.has(m.ruleId) ? "hard" : numeric === "hard" ? "advice" : numeric,
        };
      });
    findings.sort((a, b) => a.line - b.line || a.column - b.column || a.ruleId.localeCompare(b.ruleId));
    return {
      ok: true,
      result: { path: rootRelativePath, findings, hardCount: findings.filter((f) => f.severity === "hard").length },
    };
  } catch (e) {
    return {
      ok: false,
      detail: `agentdev-textlint-guard: lint execution crashed on ${rootRelativePath} (${e instanceof Error ? e.message : String(e)}); blocked per fail-closed`,
    };
  }
}

function normalizeRange(
  range: readonly [number, number] | null | undefined,
  fixRange: readonly [number, number] | null | undefined,
): [number, number] | null {
  const candidate = range ?? fixRange;
  if (candidate === null || candidate === undefined) return null;
  const [start, end] = candidate;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return [start, end];
}

export type InspectFilesOutcome =
  | { readonly ok: true; readonly outcome: InspectionOutcome }
  | { readonly ok: false; readonly detail: string };

/** 検査準備結果と検査条件（同一性判定の入力）を保持する context。 */
export interface PreparedInspectionContext {
  readonly root: string;
  readonly prepared: Extract<InspectPrepared, { readonly ok: true }>;
  readonly conditions: InspectionConditionsResult;
  /**
   * 終了時照合用: 開始時と同一手順で設定と検査条件を再計算する
   * （検査中の辞書・規則・設定・依存成果物の変更を検知する）。
   */
  readonly recomputeSnapshotInputs: () => { config: GuardConfig; conditionsHash: string };
}

export type PrepareContextResult =
  | { readonly ok: true; readonly context: PreparedInspectionContext }
  | { readonly ok: false; readonly detail: string };

/**
 * prepareInspection + 検査条件の計算。エンジン・規則の準備に失敗した場合は
 * 検査不能（fail-closed）、検査条件の計算に失敗した場合は conditions に
 * trackable: false を保持して実検査のみで完結させる（再利用せず実検査する）。
 */
export async function prepareInspectionContext(root: string, env: InspectEnvironment = {}): Promise<PrepareContextResult> {
  const prepared = await prepareInspection(root, env);
  if (!prepared.ok) return { ok: false, detail: prepared.detail };
  const conditionsInput: ComputeConditionsInput = {
    root,
    config: prepared.config,
    composition: prepared.composition,
    engine: prepared.engine,
    ...(env.pluginDir !== undefined ? { pluginDir: env.pluginDir } : {}),
  };
  const loadConfig = env.loadConfig ?? loadGuardConfig;
  const computeConditions = (): InspectionConditionsResult =>
    env.computeConditions !== undefined ? env.computeConditions(conditionsInput) : computeInspectionConditions(conditionsInput);
  const context: PreparedInspectionContext = {
    root,
    prepared,
    conditions: computeConditions(),
    recomputeSnapshotInputs: () => {
      const configResult = loadConfig(root);
      const recomputed = computeConditions();
      return {
        config: configResult.ok ? configResult.config : prepared.config,
        conditionsHash: recomputed.trackable ? recomputed.conditionsHash : "untracked",
      };
    },
  };
  return { ok: true, context };
}

export interface ReuseAwareInspectOptions {
  /** 保存済み結果の再利用（独立検査では false）。 */
  readonly reuse: boolean;
  /** 実検査結果の保存（正常完了した合格・不合格のみ保存される）。 */
  readonly store: boolean;
}

export type InspectWithReuseResult =
  | { readonly ok: true; readonly result: FileInspectionResult; readonly reused: boolean }
  | { readonly ok: false; readonly detail: string };

/**
 * ファイル単位の検査（保存結果の再利用つき）。
 * 対象全件の列挙と全文取得は毎回必須であり、text は呼出側が
 * 実ファイルから読んで渡す。同一性が機械検証できた対象だけ規則実行を省略し、
 * 保存済みのファイル単位結果を再利用する。条件を追跡できない場合は再利用せず実検査する。
 */
export async function inspectFileWithReuse(
  context: PreparedInspectionContext,
  rootRelativePath: string,
  text: string,
  options: ReuseAwareInspectOptions,
): Promise<InspectWithReuseResult> {
  if (context.conditions.trackable && options.reuse) {
    const key = computeFileIdentityKey(context.root, rootRelativePath, text, context.conditions.conditionsHash);
    const stored = loadStoredFileResult(context.root, key, rootRelativePath);
    if (stored !== null) return { ok: true, result: stored, reused: true };
  }
  const inspected = await inspectText(context.prepared, context.root, rootRelativePath, text);
  if (!inspected.ok) return inspected;
  if (options.store && context.conditions.trackable) {
    const key = computeFileIdentityKey(context.root, rootRelativePath, text, context.conditions.conditionsHash);
    storeFileResult(context.root, key, rootRelativePath, inspected.result);
  }
  return { ok: true, result: inspected.result, reused: false };
}

/** 最終検査: 対象全件（標準 + 追加）の実ファイル全文を検査する。検査不能は不合格。 */
export async function inspectAllTargetFiles(root: string, env: InspectEnvironment = {}): Promise<InspectFilesOutcome> {
  const prepared = await prepareInspection(root, env);
  if (!prepared.ok) return { ok: false, detail: prepared.detail };
  const { enumerateTargetFiles } = await import("./targets.ts");
  const targets = enumerateTargetFiles(root, prepared.config);
  const fileResults: FileInspectionResult[] = [];
  for (const rel of targets) {
    const abs = path.join(root, ...rel.split("/"));
    let text: string;
    try {
      text = fs.readFileSync(abs, "utf8");
    } catch (e) {
      return {
        ok: false,
        detail: `agentdev-textlint-guard: cannot read target file ${rel} (${e instanceof Error ? e.message : String(e)}); final gate fails per fail-closed`,
      };
    }
    const r = await inspectText(prepared, root, rel, text);
    if (!r.ok) return { ok: false, detail: r.detail };
    fileResults.push(r.result);
  }
  return { ok: true, outcome: summarizeOutcome(fileResults) };
}
