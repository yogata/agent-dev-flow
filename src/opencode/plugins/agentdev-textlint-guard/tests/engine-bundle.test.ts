// ADF-COVERS(verification): REQ-053-033, REQ-053-034, REQ-053-037, REQ-010-071
//
// 依存配布のテスト（TS-009 の package 単位側面）。
// vendored engine bundle は package の node_modules に依存せず、コミット済みの
// JSON エンベロープから data: URL import で読み込まれる。bundle に配布境界検査の
// 検出パターン（ID / docs パス / GitHub URL）が出現しないことを検証する。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  bundlePathFor,
  invalidateEngineCache,
  loadEngine,
  loadEngineViaTempFile,
} from "../lib/engine-bundle.ts";
import { composeRuleDescriptors, describeEngineVersions } from "../lib/rules.ts";

const pluginDir = path.resolve(import.meta.dir, "..");

describe("vendored engine bundle（配布前解決済み依存）", () => {
  test("bundle ファイルはコミット済み配布物として存在する", () => {
    const p = bundlePathFor(pluginDir);
    expect(fs.existsSync(p)).toBe(true);
    const stat = fs.statSync(p);
    expect(stat.size).toBeGreaterThan(100_000);
  });

  test("node_modules を使わず data: URL import で起動する（空キャッシュ・オフライン相当）", async () => {
    invalidateEngineCache();
    const result = await loadEngine(pluginDir);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { engine } = result;
    expect(engine.ENGINE_BUNDLE_SCHEMA).toBe(1);
    expect(typeof engine.TextlintKernel).toBe("function");
    expect(engine.markdownPlugin).toBeDefined();
    for (const key of ["preset-ja-technical-writing", "preset-ai-writing", "prh"]) {
      expect(engine.ruleModules[key]).toBeDefined();
    }
    // lockfile 固定版の埋め込み検証（REQ-053-034）
    expect(engine.versions["@textlint/kernel"]).toBe("14.8.4");
    expect(engine.versions["textlint-rule-preset-ja-technical-writing"]).toBe("12.0.2");
    expect(engine.versions["@textlint-ja/textlint-rule-preset-ai-writing"]).toBe("1.7.0");
    expect(engine.versions["textlint-rule-prh"]).toBe("6.1.0");
    expect(describeEngineVersions(engine)).toContain("@textlint/kernel@14.8.4");
  });

  test("代替経路（一時ファイル import）でも同じモジュール形状を得る", async () => {
    const result = await loadEngineViaTempFile(pluginDir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.engine.versions["@textlint/kernel"]).toBe("14.8.4");
    }
  });

  test("bundle 成果物に配布境界の検出パターンが出現しない", () => {
    const text = fs.readFileSync(bundlePathFor(pluginDir), "utf8");
    const idPattern = /\b([A-Z]{2,})-(\d{1,})\b/g;
    const hits = text.match(idPattern);
    expect(hits).toBeNull();
    expect(/docs[\\/](?:adr|requirements|specs|decisions)[\\/]/.test(text)).toBe(false);
    expect(/github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/(?:blob|raw)\//i.test(text)).toBe(false);
    expect(/raw\.githubusercontent\.com\//i.test(text)).toBe(false);
  });

  test("エンベロープは strict UTF-8（NUL / 不正バイトを含まない）", () => {
    const bytes = fs.readFileSync(bundlePathFor(pluginDir));
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    expect(text).not.toContain("\u0000");
    expect(() => JSON.parse(text)).not.toThrow();
  });
});

describe("規則合成（既定構成）", () => {
  test("標準 prh 辞書が接続され、拒否対象は決定的規則に限定される", async () => {
    const engine = await loadEngine(pluginDir);
    expect(engine.ok).toBe(true);
    if (!engine.ok) return;
    const composition = composeRuleDescriptors(engine.engine);
    // prh は既定辞書パスへ接続される
    expect(composition.prhRulePaths).toEqual([path.join(pluginDir, "rules", "default-prh.yml")]);
    // 拒否対象（hard）は意思決定記録の限定列挙のみ
    expect([...composition.hardRuleIds].sort()).toEqual(
      [
        "preset-ja-technical-writing/no-hankaku-kana",
        "preset-ja-technical-writing/no-invalid-control-character",
        "preset-ja-technical-writing/no-nfd",
        "preset-ja-technical-writing/no-zero-width-spaces",
        "prh",
      ].sort(),
    );
    // ヒューリスティックな規則は助言対象（severity warning）
    const advice = composition.rules.filter((r) => r.options?.severity === "warning").map((r) => r.ruleId);
    for (const heuristic of [
      "preset-ja-technical-writing/sentence-length",
      "preset-ja-technical-writing/no-mix-dearu-desumasu",
      "preset-ja-technical-writing/ja-no-weak-phrase",
      "preset-ai-writing/no-ai-hype-expressions",
      "preset-ai-writing/no-ai-emphasis-patterns",
    ]) {
      expect(advice).toContain(heuristic);
      expect(composition.hardRuleIds).not.toContain(heuristic);
    }
    // 標準 prh 辞書は旧 IR-060 forbidden 区分から移管した完全一致検出語を持ち、
    // YAML として解析できる（検出挙動は standard-dictionary.test.ts が検証する）
    const dict = fs.readFileSync(path.join(pluginDir, "rules", "default-prh.yml"), "utf8");
    expect(dict).toContain("pattern: 而非");
    expect(dict).toContain("pattern: 監査証跠");
    expect(dict).toContain("pattern: /source-of-trought/");
    expect(dict.startsWith("# ADF 標準 prh 辞書")).toBe(true);
  });
});
