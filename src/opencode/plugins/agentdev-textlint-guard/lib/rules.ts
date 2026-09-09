// ADF-COVERS(implementation): REQ-010-068, REQ-053-004, REQ-053-024, REQ-053-025, REQ-053-034, REQ-053-037
// agentdev-textlint-guard 共通実行基盤: 規則構成と用語。
//
// 標準構成は textlint-rule-preset-ja-technical-writing、
// @textlint-ja/textlint-rule-preset-ai-writing、textlint-rule-prh を含める。
// プリセットは kernel 記述子へフラット化（preset/<rule> の ruleId）し、
// 規則ごとに severity を与える。ヒューリスティックな規則を一律に拒否対象と
// しない（拒否対象は誤検出確認済みの決定的規則に限定。助言対象の規則は
// severity を warning に下げ、検査不合格の根拠にしない）。
//
// prh は標準辞書（rules/default-prh.yml）に、プロジェクトが所有する native な
// prh 形式の用語辞書を追加合成する（prh 規則は複数 rulePaths を merge する）。
// 用語の接続によって標準規則または標準対象を無効化しない。一般の textlint 設定に
// 含まれる ignore や規則の無効化設定を標準構成の上書きとして取り込まない。

import * as path from "node:path";
import type { EngineBundleModule, KernelRuleDescriptor } from "./engine-bundle.ts";

export const PRH_DICTIONARY_RELATIVE_PATH = "rules/default-prh.yml";

/** 拒否対象（hard / severity error）とする規則の初期構成。 */
const HARD_RULE_IDS: ReadonlySet<string> = new Set([
  // 決定的な文字品質違反（文字クラス判定、誤検出なし）
  "preset-ja-technical-writing/no-hankaku-kana",
  "preset-ja-technical-writing/no-invalid-control-character",
  "preset-ja-technical-writing/no-nfd",
  "preset-ja-technical-writing/no-zero-width-spaces",
  // 固定置換による禁止表現（標準辞書は既存の禁止表現区分から移管した完全一致検出語。
  // 辞書登録された語は決定的に検出する）
  "prh",
]);

/**
 * corpus 校正（2026-09-09 実測、正式初期判定前の corpus 校正段階）で確定した
 * 規則別 option。プリセット既定 rulesConfig を上書きする。
 * 実測根拠と誤検出確認は docs/reports/ 配下の校正実行記録を参照する。
 * ここでの option 調整は規則の無効化ではなく、採用規則機構が提供する option に
 * よる対象調整である（severity は校正で変更しない）。
 */
const CALIBRATED_RULE_OPTIONS: Readonly<Record<string, Record<string, unknown>>> = {
  // 漢字連続: 既定 max 6 は本 corpus の正規複合名詞（「現行成果物体系」「限定的親判断解決」等、
  // 7〜10字連続の実測約1,900件は題名・ルール名・手順名等の正規名詞）を大量に指摘する。
  // max 10 へ緩和し、11字以上の実在する読みにくい長連続（実測37件相当）のみ助言対象とする。
  "preset-ja-technical-writing/max-kanji-continuous-len": { max: 10 },
  // 「- **用語**: 説明」形式の定義リストは本 corpus の慣行表記として確立しているため
  // 太字リスト項目の検出を抑止する（実測1,825件は全件この形式）。
  // 絵文字リスト項目の検出は維持する。
  "preset-ai-writing/no-ai-list-formatting": { disableBoldListItems: true },
  // 「**重要**」「**注意**」等の info プレフィックス太字は配布物の注意喚起慣行として
  // 確立しているため検出を抑止する（実測22件は全件この形式）。
  // 絵文字+太字の組み合わせ検出は維持する。
  "preset-ai-writing/no-ai-emphasis-patterns": { disableInfoPatterns: true },
};

/** corpus 校正で確定した規則別 option を規則記述子の既定 options へ上書き合成する。 */
function applyCalibration(descriptor: KernelRuleDescriptor): KernelRuleDescriptor {
  const calibrated = CALIBRATED_RULE_OPTIONS[descriptor.ruleId];
  if (calibrated === undefined) return descriptor;
  return { ...descriptor, options: { ...(descriptor.options ?? {}), ...calibrated } };
}

export interface RuleCompositionOptions {
  /**
   * プロジェクトが所有する prh 形式の用語辞書（絶対パス）。標準辞書へ追加合成され、
   * 標準辞書を置き換えない（プロジェクト辞書には標準規則・標準対象の無効化手段がない）。
   */
  readonly prhRulePaths?: readonly string[];
}

export interface RuleComposition {
  readonly rules: readonly KernelRuleDescriptor[];
  /** 拒否対象規則 ID の一覧（証跡・検証用）。 */
  readonly hardRuleIds: readonly string[];
  readonly prhRulePaths: readonly string[];
}

interface PresetModule {
  readonly rules: Record<string, unknown>;
  rulesConfig?: Record<string, unknown>;
}

function asPresetModule(mod: unknown, key: string): PresetModule {
  if (typeof mod !== "object" || mod === null) {
    throw new Error(`rule module ${key} is not a preset module`);
  }
  const preset = mod as { rules?: unknown; rulesConfig?: unknown };
  if (typeof preset.rules !== "object" || preset.rules === null) {
    throw new Error(`rule module ${key} has no rules map`);
  }
  const result: PresetModule = { rules: preset.rules as Record<string, unknown> };
  if (typeof preset.rulesConfig === "object" && preset.rulesConfig !== null) {
    result.rulesConfig = preset.rulesConfig as Record<string, unknown>;
  }
  return result;
}

/** プリセットを kernel 規則記述子へフラット化する（プリセット既定 options は保持する）。 */
function flattenPreset(presetId: string, module: unknown): KernelRuleDescriptor[] {
  const preset = asPresetModule(module, presetId);
  return Object.entries(preset.rules).map(([name, rule]) => {
    const ruleId = `${presetId}/${name}`;
    const defaults = preset.rulesConfig?.[name];
    const options =
      defaults === true || defaults === undefined || defaults === null
        ? {}
        : { ...(defaults as Record<string, unknown>) };
    return { ruleId, rule, options };
  });
}

/** prh 辞書の既定パス解決（本モジュール位置基準）。 */
export function defaultPrhDictionaryPath(pluginDir?: string): string {
  if (pluginDir !== undefined) return path.join(pluginDir, ...PRH_DICTIONARY_RELATIVE_PATH.split("/"));
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  return path.resolve(here, "..", ...PRH_DICTIONARY_RELATIVE_PATH.split("/"));
}

/**
 * 規則構成の合成。hardRuleIds に含まれる規則は severity: error（明示）、
 * それ以外は severity: warning（助言対象）。プリセット既定 options は保持し、
 * severity のみ上書きする。
 */
export function composeRuleDescriptors(
  engine: EngineBundleModule,
  options: RuleCompositionOptions = {},
): RuleComposition {
  const descriptors: KernelRuleDescriptor[] = [];
  const prhRulePaths = [defaultPrhDictionaryPath(), ...(options.prhRulePaths ?? [])];

  const jaPreset = engine.ruleModules["preset-ja-technical-writing"];
  if (jaPreset === undefined) throw new Error("engine bundle is missing preset-ja-technical-writing");
  for (const d of flattenPreset("preset-ja-technical-writing", jaPreset)) {
    descriptors.push(withSeverity(applyCalibration(d), HARD_RULE_IDS.has(d.ruleId)));
  }

  const aiPreset = engine.ruleModules["preset-ai-writing"];
  if (aiPreset === undefined) throw new Error("engine bundle is missing preset-ai-writing");
  for (const d of flattenPreset("preset-ai-writing", aiPreset)) {
    descriptors.push(withSeverity(applyCalibration(d), HARD_RULE_IDS.has(d.ruleId)));
  }

  const prh = engine.ruleModules["prh"];
  if (prh === undefined) throw new Error("engine bundle is missing prh");
  descriptors.push({
    ruleId: "prh",
    rule: prh,
    options: { rulePaths: prhRulePaths, severity: "error" },
  });

  return {
    rules: descriptors,
    hardRuleIds: descriptors.filter((d) => d.options?.severity === "error").map((d) => d.ruleId),
    prhRulePaths,
  };
}

function withSeverity(descriptor: KernelRuleDescriptor, hard: boolean): KernelRuleDescriptor {
  const options = { ...(descriptor.options ?? {}), severity: hard ? "error" : "warning" } as Record<string, unknown>;
  // プリセット既定が severity を持つ場合も本基盤の構成が所有して上書きする
  // （標準規則の個別設定は共通構成が所有する）。
  return { ...descriptor, options };
}

/** 固定版の報告（REQ 追跡用: lockfile 固定の検証可能性）。 */
export function describeEngineVersions(engine: EngineBundleModule): string {
  return Object.entries(engine.versions)
    .map(([name, version]) => `${name}@${version}`)
    .join(", ");
}
