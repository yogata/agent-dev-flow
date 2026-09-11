// vendored engine bundle 再生成時の焼き付き絶対パス検出・無害化自己検査のテスト。
// 検出対象パターンを fixture で実際に検出することを検証する（サイレント pass 禁止）。
// 対象 REQ なし（maintenance・Issue #2775 TS-001 ネガティブテスト）。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  guardEmbeddedAbsolutePaths,
  searchEmbeddedAbsolutePaths,
} from "../build/absolute-path-guard.ts";
import { bundlePathFor } from "../lib/engine-bundle.ts";

const pluginDir = path.resolve(import.meta.dir, "..");

const WIN_BUILD_ROOT = "C:\\Users\\dev\\wt\\src\\opencode\\plugins\\agentdev-textlint-guard";
const POSIX_BUILD_ROOT = "/home/dev/wt/src/opencode/plugins/agentdev-textlint-guard";

describe("焼き付き絶対パス検出（ネガティブテスト）", () => {
  test("Windows エスケープ形（JS 文字列リテラル内の 2連バックスラッシュ）を検出する", () => {
    // 実 bundle で観測された焼き付き形を再現する fixture
    const winAbsPath =
      WIN_BUILD_ROOT + "\\node_modules\\kuromoji\\src\\kuromoji.js";
    const embeddedText = winAbsPath.replaceAll("\\", "\\\\");
    const fixtureCode = `var p=CD.resolve("${embeddedText}");return mb.default;`;
    const hits = searchEmbeddedAbsolutePaths(fixtureCode);
    expect(hits.length).toBe(1);
    expect(hits[0]?.decoded).toBe(winAbsPath);
  });

  test("Windows スラッシュ正規形を検出する", () => {
    const winFwdRoot = "C:/Users/dev/wt/src/opencode/plugins/agentdev-textlint-guard";
    const fixtureCode = `var p=CD.resolve("${winFwdRoot}/node_modules/x/y.js");`;
    const hits = searchEmbeddedAbsolutePaths(fixtureCode);
    expect(hits.length).toBe(1);
    expect(hits[0]?.decoded).toBe(winFwdRoot + "/node_modules/x/y.js");
  });

  test("POSIX 絶対パス（/Users /home /tmp）を検出する", () => {
    const fixtureCode =
      `var a="${POSIX_BUILD_ROOT}/node_modules/kuromoji/dict";` +
      `var b="/Users/dev/wt/node_modules/other.js";` +
      `var c="/tmp/build-cache/entry.mjs";`;
    const hits = searchEmbeddedAbsolutePaths(fixtureCode);
    expect(hits.length).toBe(3);
  });

  test("URL・正規表現リテラルを含むクリーンコードを誤検出しない", () => {
    const fixtureCode = [
      'var u="https://github.com/textlint/textlint/blob/master/docs/faq/x.md";',
      'var v="s://textlint.org/docs/plugin.html`);let z=new F$;";',
      'var w="p://www.jtf.jp/jp/style_guide/jtfstylechecker.html";',
      "var r=/p:/(\\s|\\u00A0)/g;",
      "var q=/([\\u3001-\\u30fc])/g,message:'n:/まず最初に/g';",
      'var n="see the home page for details";',
    ].join("");
    expect(searchEmbeddedAbsolutePaths(fixtureCode)).toEqual([]);
  });
});

describe("焼き付き絶対パス無害化（buildRoot 配下は相対化・配下外は unresolved）", () => {
  test("buildRoot 配下の Windows エスケープ形を相対パスへ無害化する", () => {
    const winAbsPath =
      WIN_BUILD_ROOT + "\\node_modules\\kuromoji\\src\\kuromoji.js";
    const embeddedText = winAbsPath.replaceAll("\\", "\\\\");
    const fixtureCode = `var p=CD.resolve("${embeddedText}");`;
    const guard = guardEmbeddedAbsolutePaths(fixtureCode, WIN_BUILD_ROOT);
    expect(guard.unresolved).toEqual([]);
    expect(guard.sanitized.length).toBe(1);
    expect(guard.sanitized[0]?.to).toBe("node_modules/kuromoji/src/kuromoji.js");
    expect(guard.code).toBe('var p=CD.resolve("node_modules/kuromoji/src/kuromoji.js");');
    // 無害化後コードに焼き付きが残存しない（二重検査）
    expect(searchEmbeddedAbsolutePaths(guard.code)).toEqual([]);
  });

  test("同一焼き付きパスの複数出現をすべて無害化する", () => {
    const abs = POSIX_BUILD_ROOT + "/node_modules/kuromoji/dict";
    const fixtureCode = `var a="${abs}";var b=fs.existsSync("${abs}");`;
    const guard = guardEmbeddedAbsolutePaths(fixtureCode, POSIX_BUILD_ROOT);
    expect(guard.unresolved).toEqual([]);
    expect(guard.code).toBe('var a="node_modules/kuromoji/dict";var b=fs.existsSync("node_modules/kuromoji/dict");');
  });

  test("buildRoot 配下外のパスは unresolved になり無害化しない", () => {
    // D: ドライブの焼き付き形（テキスト上 2連バックスラッシュ）。buildRoot（C:）配下外は無害化不能。
    const foreignEmbedded = "D:\\\\elsewhere\\\\build-cache\\\\entry.js";
    const fixtureCode = `var c="/tmp/build-cache/entry.mjs";var d="${foreignEmbedded}";`;
    const guard = guardEmbeddedAbsolutePaths(fixtureCode, WIN_BUILD_ROOT);
    expect(guard.sanitized).toEqual([]);
    expect(guard.unresolved.length).toBe(2);
  });

  test("無害化不能パスと無害化可能パスの混在で可能側のみ無害化する", () => {
    const abs = POSIX_BUILD_ROOT + "/node_modules/kuromoji/dict";
    const fixtureCode = `var a="${abs}";var c="/tmp/cache/x.mjs";`;
    const guard = guardEmbeddedAbsolutePaths(fixtureCode, POSIX_BUILD_ROOT);
    expect(guard.sanitized.length).toBe(1);
    expect(guard.unresolved.length).toBe(1);
    expect(guard.code).toContain("node_modules/kuromoji/dict");
    expect(guard.code).toContain("/tmp/cache/x.mjs");
  });
});

describe("実 vendored bundle の焼き付き残存検査", () => {
  test("コミット済み bundle コードに焼き付き絶対パスが残存しない", () => {
    const envelope = JSON.parse(fs.readFileSync(bundlePathFor(pluginDir), "utf8")) as {
      codeBase64?: unknown;
    };
    expect(typeof envelope.codeBase64).toBe("string");
    const code = Buffer.from(envelope.codeBase64 as string, "base64").toString("utf8");
    expect(searchEmbeddedAbsolutePaths(code)).toEqual([]);
  });
});
