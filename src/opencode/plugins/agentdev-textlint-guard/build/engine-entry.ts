// vendored engine bundle のビルド入口（build/build-engine.ts から Bun.build される）。
// kernel、Markdown plugin、採用規則モジュールを1ファイルへ束ねる。
// 版情報（versions）は build-engine.ts が define 注入で埋め込む（bun.lock 固定版）。
//
// このファイル単体では実行しない（bun run build:engine を使用）。

export const ENGINE_BUNDLE_SCHEMA = 1;
import { TextlintKernel } from "@textlint/kernel";
import markdownPluginRaw from "@textlint/textlint-plugin-markdown";
import jaTechnicalWriting from "textlint-rule-preset-ja-technical-writing";
import aiWriting from "@textlint-ja/textlint-rule-preset-ai-writing";
import prh from "textlint-rule-prh";

export { TextlintKernel };
export const markdownPlugin = unwrapCjs(markdownPluginRaw);

// bundler の CJS interop は { default: module.exports } 形で包むことがあるため、
// 既定エクスポートだけを持つラッパーは中身を取り出して正規化する。
function unwrapCjs(mod: unknown): unknown {
  if (typeof mod === "object" && mod !== null && "default" in mod) {
    const keys = Object.keys(mod);
    if (keys.length === 1) return (mod as { default: unknown }).default;
  }
  return mod;
}

export const ruleModules: Readonly<Record<string, unknown>> = {
  "preset-ja-technical-writing": unwrapCjs(jaTechnicalWriting),
  "preset-ai-writing": unwrapCjs(aiWriting),
  prh: unwrapCjs(prh),
};

// build-engine.ts が globalThis.__ADF_ENGINE_VERSIONS__ を define で注入する。
// 未注入（単体実行）の場合は空であり、正規の配布物では必ず埋め込まれる。
export const versions: Readonly<Record<string, string>> =
  ((globalThis as { __ADF_ENGINE_VERSIONS__?: Record<string, string> }).__ADF_ENGINE_VERSIONS__) ?? {};
