// ADF-COVERS(verification): REQ-053-025, REQ-053-027, REQ-053-029, REQ-053-030
//
// 設定読込みのテスト。設定なし・正常・不正（構文/型/バージョン/許可項目/ルート内パス）、
// hook ごとの変更検知（修復後の次回操作からの反映）を検証する。

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  configPathFor,
  formatConfigError,
  invalidateConfigCache,
  loadGuardConfig,
  parseConfigYaml,
  validateTargetGlob,
} from "../lib/config.ts";

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-cfg-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
  return root;
}

function writeConfig(root: string, content: string): void {
  const abs = configPathFor(root);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

beforeEach(() => {
  invalidateConfigCache();
});

describe("parseConfigYaml（スキーマ検証）", () => {
  test("version と additional_targets ブロック配列を受け入れる", () => {
    const parsed = parseConfigYaml("version: 1\nadditional_targets:\n  - notes/**/*.md\n  - 'spec docs/**'\n");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.additionalTargets).toEqual(["notes/**/*.md", "spec docs/**"]);
  });

  test("空配列のフロー形式を受け入れる", () => {
    const parsed = parseConfigYaml("version: 1\nadditional_targets: []\n");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.additionalTargets).toEqual([]);
  });

  test("バージョン不一致は設定エラー", () => {
    const parsed = parseConfigYaml("version: 2\nadditional_targets: []\n");
    expect(parsed.ok).toBe(false);
  });

  test("未知キーは設定エラー（許可項目のみ）", () => {
    const parsed = parseConfigYaml("version: 1\nseverity: error\n");
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.detail).toContain("severity");
  });

  test("ネストした構文は設定エラー", () => {
    const parsed = parseConfigYaml("version: 1\nadditional_targets:\n  - a: b\n");
    expect(parsed.ok).toBe(false);
  });

  test("配列項目が文字列でない場合は設定エラー", () => {
    const parsed = parseConfigYaml("version: 1\nadditional_targets:\n  - 123\n");
    expect(parsed.ok).toBe(false);
  });

  test("空ファイルは設定エラー", () => {
    const parsed = parseConfigYaml("\n# comment only\n");
    expect(parsed.ok).toBe(false);
  });

  test("解釈不能な構文は設定エラー", () => {
    const parsed = parseConfigYaml("version: 1\nadditional_targets:\n  - a.md\n!!! garbage\n");
    expect(parsed.ok).toBe(false);
  });

  test("additional_targets へのスカラー指定は設定エラー（型違い）", () => {
    const parsed = parseConfigYaml("version: 1\nadditional_targets: docs/**/*.md\n");
    expect(parsed.ok).toBe(false);
  });

  test("標準対象の無効化・削除を意図する項目は未知キーとして拒否される", () => {
    for (const key of ["targets", "standard_targets", "disable_targets", "exclude_targets"]) {
      const parsed = parseConfigYaml(`version: 1\n${key}:\n  - docs/**/*.md\n`);
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.detail).toContain("unknown config key");
    }
  });
});

describe("validateTargetGlob（ルート内パスの妥当性）", () => {
  test("ルート相対 glob を許可する", () => {
    expect(validateTargetGlob("docs-extra/**/*.md")).toEqual({ ok: true, glob: "docs-extra/**/*.md" });
  });

  test("ルート外・絶対パス・バックスラッシュを拒否する", () => {
    expect(validateTargetGlob("../outside/**/*.md").ok).toBe(false);
    expect(validateTargetGlob("/abs/**/*.md").ok).toBe(false);
    expect(validateTargetGlob("C:/abs/**/*.md").ok).toBe(false);
    expect(validateTargetGlob("notes\\**\\*.md").ok).toBe(false);
    expect(validateTargetGlob("").ok).toBe(false);
  });
});

describe("loadGuardConfig（ファイル読込みとキャッシュ）", () => {
  test("設定なしは標準対象だけの正常状態", () => {
    const root = makeProject();
    const result = loadGuardConfig(root);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.additionalTargets).toEqual([]);
      expect(result.present).toBe(false);
    }
  });

  test("正常設定の additional_targets を返す", () => {
    const root = makeProject();
    writeConfig(root, "version: 1\nadditional_targets:\n  - notes/**/*.md\n");
    const result = loadGuardConfig(root);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config.additionalTargets).toEqual(["notes/**/*.md"]);
  });

  test("不正設定は原因と設定パスを含むエラーを返す", () => {
    const root = makeProject();
    writeConfig(root, "version: 1\nadditional_targets:\n  - ../outside/**/*.md\n");
    const result = loadGuardConfig(root);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.detail).toContain(configPathFor(root));
      expect(result.detail).toContain("outside");
      const formatted = formatConfigError(result);
      expect(formatted).toContain("external editor");
      expect(formatted).toContain("blocked");
    }
  });

  test("設定ディレクトリがディレクトリである場合はエラー", () => {
    const root = makeProject();
    fs.mkdirSync(configPathFor(root), { recursive: true });
    const result = loadGuardConfig(root);
    expect(result.ok).toBe(false);
  });

  test("hook ごとの変更検知: 修復後の次回読込みで反映（再起動なし）", () => {
    const root = makeProject();
    writeConfig(root, "version: 99\n");
    expect(loadGuardConfig(root).ok).toBe(false);
    writeConfig(root, "version: 1\nadditional_targets:\n  - notes/**/*.md\n");
    const repaired = loadGuardConfig(root);
    expect(repaired.ok).toBe(true);
    if (repaired.ok) expect(repaired.config.additionalTargets).toEqual(["notes/**/*.md"]);
  });

  test("設定削除で標準対象だけの正常状態へ戻る", () => {
    const root = makeProject();
    writeConfig(root, "version: 1\nadditional_targets: []\n");
    expect(loadGuardConfig(root).ok).toBe(true);
    fs.rmSync(configPathFor(root));
    const result = loadGuardConfig(root);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.present).toBe(false);
  });
});
