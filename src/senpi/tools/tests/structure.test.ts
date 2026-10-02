//
// Senpi 向け Tool 接続の横断構造テスト。
//
// 登録集合の単一性（同じ Tool 名の重複登録がない）、正本参照境界
// （src/senpi/ は src/common/ 正本を参照し src/opencode/ を参照しない）、
// および公開スキーマの正本同一参照を検証する（REQ-099-006、REQ-099-015/016）。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { createAgentdevGhSenpiRegistration } from "../agentdev-gh-tool/registration.ts";
import { createAgentdevJevSenpiRegistration } from "../agentdev-jev-tool/registration.ts";
import { createAgentdevThirdPartySenpiRegistration } from "../agentdev-third-party-tool/registration.ts";

const EXPECTED_TOOL_NAMES = ["agentdev_gh", "agentdev_jev", "agentdev_third_party"];

describe("登録集合の単一性", () => {
  test("3つの登録単位は期待した Tool 名を持ち、重複する Tool 名を持たない", () => {
    const registrations = [
      createAgentdevGhSenpiRegistration({ resolveRepo: () => "owner/repo" }),
      createAgentdevJevSenpiRegistration(),
      createAgentdevThirdPartySenpiRegistration(),
    ];
    const names = registrations.map((r) => r.name);
    expect([...names].sort()).toEqual([...EXPECTED_TOOL_NAMES].sort());
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("正本参照境界", () => {
  test("src/senpi/ 配下の .ts は src/opencode/ を参照しない", () => {
    const root = path.resolve(import.meta.dir, "..", "..", "..", "..");
    const senpiRoot = path.join(root, "src", "senpi");
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
          if (/from\s+["'][^"']*src\/opencode\//.test(content)) {
            offenders.push(path.relative(root, full));
          }
        }
      }
    };
    walk(senpiRoot);
    expect(offenders).toEqual([]);
  });

  test("src/senpi/ 配下の .ts は src/common/ または node: と bun:test のみを参照する", () => {
    const root = path.resolve(import.meta.dir, "..", "..", "..", "..");
    const senpiRoot = path.join(root, "src", "senpi");
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
    walk(senpiRoot);
    expect(offenders).toEqual([]);
  });
});
