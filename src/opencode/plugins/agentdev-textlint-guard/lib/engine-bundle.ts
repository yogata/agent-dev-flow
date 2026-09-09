// ADF-COVERS(implementation): REQ-053-033, REQ-053-034, REQ-010-071
// agentdev-textlint-guard 共通実行基盤: 配布前解決済み依存（vendored engine bundle）の読込み。
//
// 依存は配布前に解決した成果物として供給する（導入系スクリプトはネットワーク取得を
// 行わない）。本モジュールは package の node_modules に依存せず、コミット済みの
// vendor/textlint-engine.bundle.json（base64 エンベロープで同梱した依存成果物）から
// textlint 実行エンジンを data: URL import で読み込む。clone、ソース ZIP、archive、
// release archive、self-sync の全経路で追加操作なしに動作する。
//
// bundle の生成は build/build-engine.ts（bun run build:engine）。版は package.json と
// bun.lock で固定され、bundle に埋め込まれた versions で検証可能である。

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

export const BUNDLE_RELATIVE_PATH = "vendor/textlint-engine.bundle.json";
export const ENGINE_BUNDLE_SCHEMA = 1;

/** textlint kernel（本 Plugin が消費する操作のみを宣言）。 */
export interface TextlintKernelLike {
  lintText(
    text: string,
    options: {
      readonly ext: string;
      readonly filePath?: string;
      readonly configBaseDir?: string;
      readonly plugins: readonly KernelPluginDescriptor[];
      readonly rules: readonly KernelRuleDescriptor[];
    },
  ): Promise<TextlintLintResult>;
}

export interface KernelPluginDescriptor {
  readonly pluginId: string;
  readonly plugin: unknown;
}

export interface KernelRuleDescriptor {
  readonly ruleId: string;
  readonly rule: unknown;
  readonly options?: Record<string, unknown>;
}

export interface TextlintLintResult {
  readonly filePath?: string;
  readonly messages: readonly TextlintMessage[];
}

export interface TextlintMessage {
  readonly type?: string;
  readonly ruleId: string;
  readonly message: string;
  readonly line: number;
  readonly column: number;
  readonly index?: number;
  readonly range?: readonly [number, number];
  readonly severity: number;
  readonly fix?: { readonly range: readonly [number, number]; readonly text: string } | null;
}

/** bundle が提供する依存成果物の公開面。 */
export interface EngineBundleModule {
  readonly ENGINE_BUNDLE_SCHEMA: number;
  /** 依存パッケージ名 → 固定版（bun.lock 由来）。 */
  readonly versions: Readonly<Record<string, string>>;
  readonly TextlintKernel: new () => TextlintKernelLike;
  readonly markdownPlugin: unknown;
  /** 規則モジュール（プリセットは { rules, rulesConfig } 形状）。 */
  readonly ruleModules: Readonly<Record<string, unknown>>;
}

export type EngineLoadResult =
  | { readonly ok: true; readonly engine: EngineBundleModule }
  | { readonly ok: false; readonly detail: string };

let loaded: EngineBundleModule | null = null;

function codeFromEnvelope(codeBase64: string): string {
  return Buffer.from(codeBase64, "base64").toString("utf8");
}

/** vendor bundle の絶対パス解決（既定は本モジュール位置基準）。 */
export function bundlePathFor(pluginDir?: string): string {
  if (pluginDir !== undefined) return path.join(pluginDir, ...BUNDLE_RELATIVE_PATH.split("/"));
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  return path.resolve(here, "..", ...BUNDLE_RELATIVE_PATH.split("/"));
}

/** エンジンの読込み（module-level キャッシュ）。失敗は検査不能として呼出側で拒否する。 */
export async function loadEngine(pluginDir?: string): Promise<EngineLoadResult> {
  if (loaded !== null) return { ok: true, engine: loaded };
  const bundlePath = bundlePathFor(pluginDir);
  let raw: string;
  try {
    raw = fs.readFileSync(bundlePath, "utf8");
  } catch (e) {
    return {
      ok: false,
      detail: `cannot read the vendored engine bundle (${bundlePath}): ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  let envelope: unknown;
  try {
    envelope = JSON.parse(raw);
  } catch (e) {
    return {
      ok: false,
      detail: `vendored engine bundle is not valid JSON (${bundlePath}): ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  const shape = envelope as { schema?: unknown; codeBase64?: unknown } | null;
  if (
    typeof shape !== "object" ||
    shape === null ||
    shape.schema !== ENGINE_BUNDLE_SCHEMA ||
    typeof shape.codeBase64 !== "string" ||
    shape.codeBase64.length === 0
  ) {
    return { ok: false, detail: `vendored engine bundle has an unexpected envelope shape (${bundlePath})` };
  }
  let mod: EngineBundleModule;
  try {
    // data: URL import は Windows Bun で長い URL を解決できない（NameTooLong）ため、
    // blob: URL（インメモリ）で読み込む（package の node_modules に依存しない）。
    const blobUrl = URL.createObjectURL(new Blob([codeFromEnvelope(shape.codeBase64)], { type: "text/javascript" }));
    try {
      mod = (await import(blobUrl)) as EngineBundleModule;
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (e) {
    return {
      ok: false,
      detail: `cannot execute the vendored engine bundle (${bundlePath}): ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (
    mod.ENGINE_BUNDLE_SCHEMA !== ENGINE_BUNDLE_SCHEMA ||
    typeof mod.TextlintKernel !== "function" ||
    typeof mod.ruleModules !== "object" ||
    mod.ruleModules === null
  ) {
    return { ok: false, detail: `vendored engine bundle exposes an unexpected module shape (${bundlePath})` };
  }
  loaded = mod;
  return { ok: true, engine: mod };
}

/** テスト用: エンジンキャッシュの無効化。 */
export function invalidateEngineCache(): void {
  loaded = null;
}

/** 代替経路（一時ファイル import）。blob: URL import を利用できない実行基盤向け。テスト専用。 */
export async function loadEngineViaTempFile(pluginDir: string): Promise<EngineLoadResult> {
  const bundlePath = bundlePathFor(pluginDir);
  let code: string;
  try {
    const envelope = JSON.parse(fs.readFileSync(bundlePath, "utf8")) as { codeBase64?: unknown };
    if (typeof envelope.codeBase64 !== "string") throw new Error("missing codeBase64");
    code = codeFromEnvelope(envelope.codeBase64);
  } catch (e) {
    return { ok: false, detail: `cannot decode bundle via temp file: ${e instanceof Error ? e.message : String(e)}` };
  }
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentdev-textlint-engine-"));
  try {
    const tmpFile = path.join(tmpDir, "engine.mjs");
    fs.writeFileSync(tmpFile, code, "utf8");
    const mod = (await import(pathToFileURL(tmpFile).href)) as EngineBundleModule;
    return { ok: true, engine: mod };
  } catch (e) {
    return { ok: false, detail: `temp-file engine load failed: ${e instanceof Error ? e.message : String(e)}` };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
