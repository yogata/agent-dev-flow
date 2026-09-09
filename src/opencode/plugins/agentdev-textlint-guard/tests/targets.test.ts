// ADF-COVERS(verification): REQ-053-026, REQ-053-029, REQ-053-032, REQ-053-039
//
// 対象解決のテスト。標準対象（docs/**/*.md）、追加対象の加算、機構固定の既定除外、
// 加算設定の既定除外への優先、対象外の除外、対象全件の列挙、pre-write hook 入口
// （isTargetPath）と gate 入口（enumerateTargetFiles）の同一対象解決を検証する。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { GuardConfig } from "../lib/config.ts";
import {
  DEFAULT_EXCLUSIONS,
  enumerateTargetFiles,
  globToRegExp,
  isExcludedByDefault,
  isTargetPath,
} from "../lib/targets.ts";

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

describe("機構固定の既定除外（REQ-053-039）", () => {
  test("既定除外パターンは Design 正規の3種に固定されている", () => {
    expect([...DEFAULT_EXCLUSIONS]).toEqual([
      "**/node_modules/**",
      "docs/requirements/retired/**",
      "docs/reports/**",
    ]);
  });

  test("node_modules と歴史記録サブツリーは標準対象から除外される", () => {
    expect(isTargetPath("node_modules/docs/x.md", defaultConfig)).toBe(false);
    expect(isTargetPath("src/opencode/plugins/x/node_modules/y.md", defaultConfig)).toBe(false);
    expect(isTargetPath("docs/requirements/retired/REQ-001.md", defaultConfig)).toBe(false);
    expect(isTargetPath("docs/reports/audit.md", defaultConfig)).toBe(false);
    expect(isTargetPath("docs/reports/sub/a.md", defaultConfig)).toBe(false);
    expect(isTargetPath("docs/requirements/REQ-001.md", defaultConfig)).toBe(true);
    expect(isTargetPath("docs/designs/a.md", defaultConfig)).toBe(true);
  });

  test("node_modules は加算設定でも再包含されない（依存成果物の機構固定除外）", () => {
    const config: GuardConfig = { additionalTargets: ["src/opencode/plugins/**/README.md"] };
    expect(isTargetPath("src/opencode/plugins/x/README.md", config)).toBe(true);
    expect(isTargetPath("src/opencode/plugins/x/node_modules/dep/README.md", config)).toBe(false);
  });

  test("isExcludedByDefault はパターン一致のみを返す（拡張子絞り込みは isTargetPath 側）", () => {
    expect(isExcludedByDefault("docs/reports/a.md")).toBe(true);
    expect(isExcludedByDefault("docs/reports/a.txt")).toBe(true);
    expect(isExcludedByDefault("docs/designs/a.md")).toBe(false);
  });
});

describe("加算優先（追加対象は既定除外に優先する、REQ-053-039）", () => {
  test("docs/reports 配下も additional_targets へ加算すると再包含される", () => {
    const config: GuardConfig = { additionalTargets: ["docs/reports/**/*.md"] };
    expect(isTargetPath("docs/reports/audit.md", config)).toBe(true);
    expect(isTargetPath("docs/requirements/retired/REQ-001.md", config)).toBe(false);
    expect(isTargetPath("docs/a.md", config)).toBe(true);
  });

  test("列挙でも加算設定の再包含が効く", () => {
    const root = makeProject([
      "docs/keep.md",
      "docs/reports/audit.md",
      "docs/requirements/retired/REQ-001.md",
    ]);
    const config: GuardConfig = { additionalTargets: ["docs/reports/**/*.md"] };
    expect(enumerateTargetFiles(root, config)).toEqual(["docs/keep.md", "docs/reports/audit.md"]);
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

  test("既定除外（node_modules・retired・reports）は列挙から除外される", () => {
    const root = makeProject([
      "docs/keep.md",
      "docs/reports/audit.md",
      "docs/requirements/retired/REQ-001.md",
      "docs/requirements/current.md",
    ]);
    fs.mkdirSync(path.join(root, "node_modules", "docs"), { recursive: true });
    fs.writeFileSync(path.join(root, "node_modules", "docs", "x.md"), "x", "utf8");
    expect(enumerateTargetFiles(root, defaultConfig)).toEqual([
      "docs/keep.md",
      "docs/requirements/current.md",
    ]);
  });
});

describe("両入口の同一対象解決（pre-write hook 入口と gate 入口）", () => {
  test("全実ファイルについて isTargetPath（hook 入口）と enumerateTargetFiles（gate 入口）の判定が一致する", () => {
    const root = makeProject([
      "docs/a.md",
      "docs/sub/b.md",
      "docs/reports/audit.md",
      "docs/requirements/retired/REQ-001.md",
      "notes/n.md",
      "README.md",
      "src/opencode/plugins/x/README.md",
      "src/opencode/plugins/x/node_modules/dep/README.md",
    ]);
    fs.mkdirSync(path.join(root, "node_modules", "docs"), { recursive: true });
    fs.writeFileSync(path.join(root, "node_modules", "docs", "x.md"), "x", "utf8");
    const config: GuardConfig = {
      additionalTargets: ["notes/**/*.md", "src/opencode/plugins/**/README.md"],
    };
    const enumerated = new Set(enumerateTargetFiles(root, config));
    for (const rel of listAllMarkdownFiles(root)) {
      expect(isTargetPath(rel, config)).toBe(enumerated.has(rel));
    }
  });
});

function listAllMarkdownFiles(root: string): string[] {
  const out: string[] = [];
  const visit = (rel: string): void => {
    const abs = rel.length === 0 ? root : path.join(root, ...rel.split("/"));
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      const childRel = rel.length === 0 ? entry.name : `${rel}/${entry.name}`;
      if (entry.isDirectory()) visit(childRel);
      else if (entry.isFile() && childRel.endsWith(".md")) out.push(childRel);
    }
  };
  visit("");
  return out.sort();
}
