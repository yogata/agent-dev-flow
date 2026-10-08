// agentdev-textlint-guard 共通実行基盤: ファイル単位結果の同一性判定。
//
// 同一性の構成要素: 本文、パス、有効な規則と設定、実際のエンジンと依存成果物、
// 標準・プロジェクト辞書と再帰的な間接依存、結果正規化の版。
// 更新時刻とサイズは本文同一性の判定に使わない（本文は内容 SHA256 で判定する）。
// どれか1つでも条件を追跡できない場合は trackable: false を返し、呼出側は
// 再利用せず実検査する。
//
// プロジェクト・worktree 間の誤流用防止のため、同一性キーには
// プロジェクトルートの解決済み絶対パスを含める。worktree が異なればキーも異なる。
//
// 規則構成の同一性は既存の配置位置非依存の規則構成ハッシュ手順
// （textlint-quality-runtime.md「規則校正と移行検証」節）を再利用する:
// - prh rulePaths は plugin dir 相対（標準辞書）/ プロジェクトルート相対（プロジェクト辞書）へ
//   正規化し、区切りを / に揃え、配列を辞書順ソートする
// - rules は ruleId 辞書順ソートし、ruleId と canonical JSON(options) の行を改行連結する
// - 連結結果の末尾へ prh 標準辞書内容の SHA256、prh rulePaths 数、依存版一覧、
//   拒否対象規則 ID の辞書順連結を改行で付与し、全体の SHA256 を規則構成ハッシュとする

import * as fs from "node:fs";
import * as path from "node:path";
import type { GuardConfig } from "./config.ts";
import {
  BUNDLE_RELATIVE_PATH,
  KUROMOJI_DICT_RELATIVE_PATH,
  bundlePathFor,
  kuromojiDictPathFor,
  type EngineBundleModule,
} from "./engine-bundle.ts";
import { canonicalJson, compareStrings, sha256FileHex, sha256Hex } from "./hash.ts";
import { PRH_DICTIONARY_RELATIVE_PATH, defaultPrhDictionaryPath, type RuleComposition } from "./rules.ts";

/** 結果正規化の版。結果の保存・照合・集約の正規化手順を変えるときは上げる。 */
export const RESULT_NORMALIZATION_VERSION = 2;

/** 追跡可能な検査条件（同一性判定の入力）。trackable: true で判別する。 */
export interface InspectionConditions {
  readonly trackable: true;
  /** 規則構成ハッシュ（配置位置非依存、規則・severity・option・辞書参照・依存版を含む）。 */
  readonly ruleCompositionHash: string;
  /** 有効な追加対象設定（正規化済み、辞書順ソート）。標準対象は機構固定なので含まない。 */
  readonly additionalTargets: readonly string[];
  /** 実際のエンジンと依存成果物（engine bundle と kuromoji 辞書の内容ハッシュ）。 */
  readonly engineArtifactsHash: string;
  /** 標準 prh 辞書内容の SHA256。 */
  readonly standardPrhDictionaryHash: string;
  /** プロジェクト用語辞書内容の SHA256（不在は null）。 */
  readonly projectPrhDictionaryHash: string | null;
  /** 結果正規化の版。 */
  readonly resultNormalizationVersion: number;
  /** 検査条件識別子（条件全体の SHA256）。 */
  readonly conditionsHash: string;
}

/** 検査条件の計算結果。追跡不能（trackable: false）のとき呼出側は再利用を禁止する。 */
export type InspectionConditionsResult = InspectionConditions | { readonly trackable: false; readonly detail: string };

export interface ComputeConditionsInput {
  readonly root: string;
  readonly config: GuardConfig;
  readonly composition: RuleComposition;
  readonly engine: EngineBundleModule;
  readonly pluginDir?: string;
}

/** prh rulePaths を配置位置非依存へ正規化する（標準辞書は plugin dir 相対、他は root 相対）。 */
export function normalizePrhRulePaths(
  rulePaths: readonly string[],
  pluginDir: string,
  root: string,
): string[] {
  const standardAbs = path.resolve(defaultPrhDictionaryPath(pluginDir));
  return rulePaths
    .map((p) => {
      if (path.resolve(p) === standardAbs) return PRH_DICTIONARY_RELATIVE_PATH;
      const rel = path.relative(path.resolve(root), path.resolve(p));
      return rel.split(path.sep).join("/");
    })
    .sort(compareStrings);
}

/** 規則構成ハッシュ（配置位置非依存）。標準辞書内容の読込み失敗は例外として伝播する。 */
export function computeRuleCompositionHash(
  root: string,
  composition: RuleComposition,
  engine: EngineBundleModule,
  pluginDir?: string,
): string {
  const resolvedPluginDir =
    pluginDir ?? path.resolve(path.dirname(defaultPrhDictionaryPath()), "..");
  const normalizedPaths = normalizePrhRulePaths(composition.prhRulePaths, resolvedPluginDir, root);
  const prhDescriptor = composition.rules.find((d) => d.ruleId === "prh");
  const prhOptions =
    prhDescriptor === undefined
      ? {}
      : { ...(prhDescriptor.options ?? {}), rulePaths: normalizedPaths };
  const lines = [...composition.rules]
    .sort((a, b) => compareStrings(a.ruleId, b.ruleId))
    .map((d) => `${d.ruleId}\t${canonicalJson(d.ruleId === "prh" ? prhOptions : (d.options ?? {}))}`);
  const standardDictHash = sha256FileHex(defaultPrhDictionaryPath(pluginDir));
  const versions = Object.entries(engine.versions)
    .sort(([a], [b]) => compareStrings(a, b))
    .map(([name, version]) => `${name}@${version}`)
    .join(",");
  const hardRuleIds = [...composition.hardRuleIds].sort(compareStrings).join(",");
  const tail = [
    standardDictHash,
    String(normalizedPaths.length),
    versions,
    hardRuleIds,
  ];
  return sha256Hex(`${lines.join("\n")}\n${tail.join("\n")}`);
}

/** engine bundle と kuromoji 辞書の内容ハッシュ（実際の依存成果物を代表する）。 */
function computeEngineArtifactsHash(pluginDir?: string): string {
  const bundleHash = sha256FileHex(bundlePathFor(pluginDir));
  const dictDir = kuromojiDictPathFor(pluginDir);
  const dictFiles: string[] = [];
  for (const entry of fs.readdirSync(dictDir, { recursive: true, withFileTypes: true })) {
    if (entry.isFile()) {
      dictFiles.push(entry.name);
    }
  }
  dictFiles.sort(compareStrings);
  const dictHashes = dictFiles.map((rel) => {
    const abs = path.join(dictDir, ...rel.split(/[\\/]/));
    return `${rel}\t${sha256FileHex(abs)}`;
  });
  return sha256Hex([BUNDLE_RELATIVE_PATH, bundleHash, KUROMOJI_DICT_RELATIVE_PATH, dictHashes.join("\n")].join("\n"));
}

function projectPrhHash(root: string): string | null {
  const candidate = path.join(root, ".agentdev", "config", "plugins", "agentdev-textlint-guard-prh.yml");
  let stat: fs.Stats;
  try {
    stat = fs.statSync(candidate);
  } catch {
    return null;
  }
  if (!stat.isFile()) return null;
  return sha256FileHex(candidate);
}

/**
 * 検査条件の計算。構成要素のいずれかを読めない・計算できない場合は
 * trackable: false を返す（条件を追跡できない場合は再利用せず実検査する）。
 */
export function computeInspectionConditions(input: ComputeConditionsInput): InspectionConditionsResult {
  const { root, config, composition, engine, pluginDir } = input;
  try {
    const ruleCompositionHash = computeRuleCompositionHash(root, composition, engine, pluginDir);
    const engineArtifactsHash = computeEngineArtifactsHash(pluginDir);
    const standardPrhDictionaryHash = sha256FileHex(defaultPrhDictionaryPath(pluginDir));
    const base = {
      trackable: true as const,
      ruleCompositionHash,
      additionalTargets: [...config.additionalTargets].sort(compareStrings),
      engineArtifactsHash,
      standardPrhDictionaryHash,
      projectPrhDictionaryHash: projectPrhHash(root),
      resultNormalizationVersion: RESULT_NORMALIZATION_VERSION,
    };
    const conditions: InspectionConditions = {
      ...base,
      conditionsHash: sha256Hex(canonicalJson(base)),
    };
    return conditions;
  } catch (e) {
    return {
      trackable: false,
      detail: `agentdev-textlint-guard: inspection conditions are untrackable, stored results will not be reused (${e instanceof Error ? e.message : String(e)})`,
    };
  }
}

/** プロジェクトルートの同一性キー用正規化（解決済み絶対パス。worktree 間の誤流用を防ぐ）。 */
export function normalizeRootKey(root: string): string {
  return path.resolve(root);
}

/**
 * ファイル単位結果の同一性キー。本文（内容 SHA256）、パス、検査条件、プロジェクト識別、
 * 結果正規化の版を含む。更新時刻とサイズは入力に含まない。
 */
export function computeFileIdentityKey(
  root: string,
  rootRelativePath: string,
  text: string,
  conditionsHash: string,
): string {
  return sha256Hex(
    [normalizeRootKey(root), rootRelativePath, sha256Hex(text), conditionsHash, String(RESULT_NORMALIZATION_VERSION)].join("\n"),
  );
}
