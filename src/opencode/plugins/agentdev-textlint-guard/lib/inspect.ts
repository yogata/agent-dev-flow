// ADF-COVERS(implementation): REQ-053-004, REQ-053-024, REQ-053-025, REQ-053-026, REQ-053-027, REQ-053-028, REQ-053-031, REQ-053-032, REQ-053-034
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
import { loadEngine, type EngineLoadResult, type TextlintKernelLike } from "./engine-bundle.ts";
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
  readonly pluginDir?: string;
}

export type InspectPrepared =
  | {
      readonly ok: true;
      readonly config: GuardConfig;
      readonly kernel: TextlintKernelLike;
      readonly composition: RuleComposition;
      readonly markdownPlugin: unknown;
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
    const findings = lintResult.messages.map((m): InspectionFinding => {
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
