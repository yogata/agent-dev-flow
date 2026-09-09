// ADF-COVERS(verification): REQ-053-026, REQ-053-029, REQ-053-032
//
// 対象解決のテスト。標準対象（docs/**/*.md）、追加対象の加算、対象外の除外、
// 対象全件の列挙を検証する。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { GuardConfig } from "../lib/config.ts";
import { enumerateTargetFiles, globToRegExp, isTargetPath } from "../lib/targets.ts";

const defaultConfig: GuardConfig = { additionalTargets: [] };

function makeProject(files: string[]): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-tgt-"));
  for (const rel of files) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, "x", "utf8");
  }
  return root;
}

describe("globToRegExp", () => {
  test("** はディレクトリ区切りをまたぐ", () => {
    const re = globToRegExp("docs/**/*.md");
    expect(re.test("docs/a.md")).toBe(true);
    expect(re.test("docs/x/y/z.md")).toBe(true);
    expect(re.test("docs/a.txt")).toBe(false);
    expect(re.test("src/a.md")).toBe(false);
  });

  test("* は区切りをまたがない", () => {
    const re = globToRegExp("docs/*/a.md");
    expect(re.test("docs/x/a.md")).toBe(true);
    expect(re.test("docs/x/y/a.md")).toBe(false);
  });

  test("正規表現メタ文字はエスケープされる", () => {
    const re = globToRegExp("docs/(v1)/a.md");
    expect(re.test("docs/(v1)/a.md")).toBe(true);
    expect(re.test("docs/xv1y/a.md")).toBe(false);
  });
});

describe("isTargetPath", () => {
  test("標準対象は docs 配下の .md のみ", () => {
    expect(isTargetPath("docs/a.md", defaultConfig)).toBe(true);
    expect(isTargetPath("docs/x/y.md", defaultConfig)).toBe(true);
    expect(isTargetPath("docs/a.txt", defaultConfig)).toBe(false);
    expect(isTargetPath("src/a.md", defaultConfig)).toBe(false);
    expect(isTargetPath("README.md", defaultConfig)).toBe(false);
  });

  test("追加対象は標準対象へ加算し、標準対象を無効化しない", () => {
    const config: GuardConfig = { additionalTargets: ["notes/**/*.md", "README.md"] };
    expect(isTargetPath("notes/2026/a.md", config)).toBe(true);
    expect(isTargetPath("README.md", config)).toBe(true);
    expect(isTargetPath("docs/a.md", config)).toBe(true);
    expect(isTargetPath("notes/a.txt", config)).toBe(false);
  });
});

describe("enumerateTargetFiles（最終検査の全件列挙）", () => {
  test("標準 + 追加の和集合を列挙する", () => {
    const root = makeProject([
      "docs/a.md",
      "docs/sub/b.md",
      "docs/c.txt",
      "notes/n.md",
      "src/opencode/skills/s.md",
      "other/o.md",
    ]);
    const config: GuardConfig = { additionalTargets: ["notes/**/*.md", "src/opencode/skills/**/*.md"] };
    const targets = enumerateTargetFiles(root, config);
    expect(targets).toEqual([
      "docs/a.md",
      "docs/sub/b.md",
      "notes/n.md",
      "src/opencode/skills/s.md",
    ]);
  });

  test(".git と node_modules は走査しない", () => {
    const root = makeProject(["docs/keep.md"]);
    fs.mkdirSync(path.join(root, "node_modules", "docs"), { recursive: true });
    fs.writeFileSync(path.join(root, "node_modules", "docs", "x.md"), "x", "utf8");
    const targets = enumerateTargetFiles(root, defaultConfig);
    expect(targets).toEqual(["docs/keep.md"]);
  });
});
