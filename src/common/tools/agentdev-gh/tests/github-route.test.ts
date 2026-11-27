//
// GitHub 実行経路の設定読み取り（github-route.ts）のテスト。
//
// 解析は純粋関数として全規則を表で検証し、resolver は OS 一時配下の
// 一時ディレクトリで検証する（実ネットワークも実 gh も使わない・sleep なし）。
// 一時ディレクトリは毎テスト後に除去する。

import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  GITHUB_ROUTE_CONFIG_RELATIVE_PATH,
  GITHUB_ROUTE_HOSTS,
  parseGithubRouteConfig,
  resolveGithubRoute,
} from "../github-route.ts";

const createdTempDirs = new Set<string>();

function makeTempRoot(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "github-route-test-"));
  createdTempDirs.add(dir);
  return dir;
}

function writeConfig(root: string, content: string): string {
  const configDir = path.join(root, ".agentdev", "config");
  fs.mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, "github-route.json");
  fs.writeFileSync(configPath, content, "utf-8");
  return configPath;
}

afterEach(() => {
  for (const dir of createdTempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  createdTempDirs.clear();
});

describe("GITHUB_ROUTE_HOSTS と設定パスの定数", () => {
  test("対象ホストは固定順（codex, antigravity）", () => {
    expect([...GITHUB_ROUTE_HOSTS]).toEqual(["codex", "antigravity"]);
  });

  test("設定ファイルの相対パスは導入先リポジトリ基準", () => {
    expect(GITHUB_ROUTE_CONFIG_RELATIVE_PATH).toBe(".agentdev/config/github-route.json");
  });
});

describe("parseGithubRouteConfig の受理", () => {
  test("空オブジェクトは両ホスト plugin", () => {
    const r = parseGithubRouteConfig("{}");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.routes).toEqual({ codex: "plugin", antigravity: "plugin" });
    }
  });

  test("片ホストのみの記録は欠落側を plugin に補完する", () => {
    const r = parseGithubRouteConfig('{"codex":"gh"}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.routes).toEqual({ codex: "gh", antigravity: "plugin" });
    }
  });

  test("両ホストの記録をそのまま返す（キー順に依存しない）", () => {
    const r = parseGithubRouteConfig('{"antigravity":"gh","codex":"plugin"}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.routes).toEqual({ codex: "plugin", antigravity: "gh" });
    }
  });

  test("先頭の UTF-8 BOM は許容する", () => {
    const r = parseGithubRouteConfig('\uFEFF{"codex":"gh","antigravity":"gh"}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.routes).toEqual({ codex: "gh", antigravity: "gh" });
    }
  });
});

describe("parseGithubRouteConfig の拒否", () => {
  function expectInvalid(text: string, detailPart: string): void {
    const r = parseGithubRouteConfig(text);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.kind).toBe("config-invalid");
      expect(r.detail).toContain(detailPart);
    }
  }

  test("不正な JSON", () => {
    expectInvalid("{invalid", "not valid JSON");
  });

  test("空と空白のみ", () => {
    expectInvalid("", "empty");
    expectInvalid("   \n\t  ", "empty");
  });

  test("オブジェクト以外（配列・null・プリミティブ）", () => {
    expectInvalid("[]", "must be a JSON object");
    expectInvalid("null", "must be a JSON object");
    expectInvalid('"plugin"', "must be a JSON object");
    expectInvalid("5", "must be a JSON object");
  });

  test("未知のキー", () => {
    expectInvalid('{"codex":"gh","gemini":"gh"}', "unknown key: gemini");
  });

  test("値が plugin / gh 以外", () => {
    expectInvalid('{"codex":"cli"}', "invalid value for codex");
    expectInvalid('{"antigravity":"Plugin"}', "invalid value for antigravity");
    expectInvalid('{"codex":true}', "invalid value for codex");
    expectInvalid('{"antigravity":null}', "invalid value for antigravity");
    expectInvalid('{"codex":1}', "invalid value for codex");
  });

  test("重複キーは最後の値で確定させず拒否する（切替スクリプトと同一規則）", () => {
    expectInvalid('{"codex":"gh","codex":"plugin"}', "duplicate key: codex");
    expectInvalid('{"antigravity":"plugin","antigravity":"gh"}', "duplicate key: antigravity");
    expectInvalid('{"codex":"gh","codex":"gh"}', "duplicate key: codex");
  });

  test("エスケープ表記を含む重複キーも復号して検出する", () => {
    expectInvalid('{"\\u0063odex":"gh","codex":"plugin"}', "duplicate key: codex");
  });
});

describe("resolveGithubRoute", () => {
  test("設定ファイル不在は plugin 扱いの成功", async () => {
    const root = makeTempRoot();
    const r = await resolveGithubRoute(root, "codex");
    expect(r).toEqual({ ok: true, route: "plugin" });
  });

  test("ホストキーの欠落は plugin、記録のあるホストはその値", async () => {
    const root = makeTempRoot();
    writeConfig(root, '{"codex":"gh"}');
    const codex = await resolveGithubRoute(root, "codex");
    expect(codex).toEqual({ ok: true, route: "gh" });
    const antigravity = await resolveGithubRoute(root, "antigravity");
    expect(antigravity).toEqual({ ok: true, route: "plugin" });
  });

  test("各ホストは独立に解決される", async () => {
    const root = makeTempRoot();
    writeConfig(root, '{"codex":"gh","antigravity":"plugin"}');
    expect(await resolveGithubRoute(root, "codex")).toEqual({ ok: true, route: "gh" });
    expect(await resolveGithubRoute(root, "antigravity")).toEqual({ ok: true, route: "plugin" });
  });

  test("不正な内容は config-invalid（既定経路へ代替しない）", async () => {
    const root = makeTempRoot();
    writeConfig(root, "{invalid");
    const r = await resolveGithubRoute(root, "codex");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe("config-invalid");
  });

  test("重複キーの設定ファイルは config-invalid", async () => {
    const root = makeTempRoot();
    writeConfig(root, '{"codex":"gh","codex":"plugin"}');
    const r = await resolveGithubRoute(root, "codex");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.kind).toBe("config-invalid");
      expect(r.detail).toContain("duplicate key: codex");
    }
  });

  test("ファイルの代わりにディレクトリがある等の読取失敗は config-unreadable", async () => {
    const root = makeTempRoot();
    const configDir = path.join(root, ".agentdev", "config");
    fs.mkdirSync(path.join(configDir, "github-route.json"), { recursive: true });
    const r = await resolveGithubRoute(root, "codex");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.kind).toBe("config-unreadable");
      expect(r.detail).toContain("github-route.json");
    }
  });
});
