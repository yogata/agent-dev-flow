//
// Codex 向け接続領域の横断構造テスト。
//
// 正本参照境界（src/codex/ は src/common/ 正本のみを参照し、他ホスト接続領域
// を参照しない）を検証する。
//

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

describe("正本参照境界", () => {
  test("src/codex/ 配下の .ts は他ホスト接続領域を参照しない", () => {
    const root = path.resolve(import.meta.dir, "..", "..", "..");
    const codexRoot = path.join(root, "src", "codex");
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (entry.name.endsWith(".ts")) {
          const content = fs.readFileSync(full, "utf8");
          if (/from\s+["'][^"']*src\/(opencode|senpi|antigravity)\//.test(content)) {
            offenders.push(path.relative(root, full));
          }
        }
      }
    };
    walk(codexRoot);
    expect(offenders).toEqual([]);
  });

  test("src/codex/ 配下の .ts は src/common/ または node: と bun:test のみを参照する", () => {
    const root = path.resolve(import.meta.dir, "..", "..", "..");
    const codexRoot = path.join(root, "src", "codex");
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (entry.name.endsWith(".ts")) {
          const content = fs.readFileSync(full, "utf8");
          const importMatches = [...content.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1] ?? "");
          for (const spec of importMatches) {
            const isRelative = spec.startsWith(".");
            const resolvedIntoCommon = isRelative && path.resolve(path.dirname(full), spec).replaceAll("\\", "/").includes("/src/common/");
            const isBuiltin = spec.startsWith("node:") || spec === "bun:test";
            if (!resolvedIntoCommon && !isBuiltin && !isRelative) {
              offenders.push(`${path.relative(root, full)} -> ${spec}`);
            }
          }
        }
      }
    };
    walk(codexRoot);
    expect(offenders).toEqual([]);
  });
});
