// 一括実行面（cli.ts）のテスト。実行面の正は Design
// third-party-skill-management「一括実行面（cli.ts）」および
// 「宣言ファイルの配置と解決（2候補）」。
//
// 実取得を伴う経路は network access を要するため本テストでは扱わず、
// 引数解き、2候補解決、宣言不在時の fail-closed 案内、宣言不在でない
// 環境での dry-run（network access なし）を検証する。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { parseCliArgs } from "../cli.ts";
import { resolveDeclarationPath } from "../declaration.ts";

const CLI_PATH = path.resolve(import.meta.dir, "..", "cli.ts");

function makeTempWorktree(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tp-cli-"));
}

function rmrf(p: string): void {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* swallow */
  }
}

describe("parseCliArgs", () => {
  test("引数なしは全宣言一括の実行解釈になる", () => {
    const result = parseCliArgs([]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.args).toEqual({ dryRun: false });
  });

  test("--dry-run と name を解釈する", () => {
    const result = parseCliArgs(["--dry-run", "my-skill"]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.args).toEqual({ dryRun: true, skill: "my-skill" });
  });

  test.each([
    ["name が2つ", ["a", "b"]],
    ["未知の option", ["--unknown"]],
  ])("異常系: %s", (_label, argv) => {
    const result = parseCliArgs(argv as string[]);
    expect(result.ok).toBe(false);
  });
});

describe("resolveDeclarationPath（2候補解決）", () => {
  test("両候補がある場合は本体管理を優先する", () => {
    const root = makeTempWorktree();
    try {
      const first = path.join(root, "src", "third-party");
      const second = path.join(root, ".agentdev", "third-party");
      fs.mkdirSync(first, { recursive: true });
      fs.mkdirSync(second, { recursive: true });
      fs.writeFileSync(path.join(first, "skills.yaml"), "skills: []\n");
      fs.writeFileSync(path.join(second, "skills.yaml"), "skills: []\n");
      expect(resolveDeclarationPath(root)).toBe(path.join(first, "skills.yaml"));
    } finally {
      rmrf(root);
    }
  });

  test("本体管理が不在の場合は consumer 管理へフォールバックする", () => {
    const root = makeTempWorktree();
    try {
      const second = path.join(root, ".agentdev", "third-party");
      fs.mkdirSync(second, { recursive: true });
      fs.writeFileSync(path.join(second, "skills.yaml"), "skills: []\n");
      expect(resolveDeclarationPath(root)).toBe(path.join(second, "skills.yaml"));
    } finally {
      rmrf(root);
    }
  });

  test("両候補とも不在の場合は consumer 管理候補を返す（読込時に fail-closed）", () => {
    const root = makeTempWorktree();
    try {
      expect(resolveDeclarationPath(root)).toBe(
        path.join(root, ".agentdev", "third-party", "skills.yaml"),
      );
    } finally {
      rmrf(root);
    }
  });
});

describe("CLI 実行（bun 生成）", () => {
  test("宣言不在環境では取得を実行せず案内を表示して失敗する（fail-closed）", () => {
    const root = makeTempWorktree();
    try {
      const r = spawnSync(process.execPath, [CLI_PATH, "--dry-run"], {
        cwd: root,
        encoding: "utf-8",
      });
      expect(r.status).toBe(1);
      expect(r.stderr).toContain(".agentdev/third-party/skills.yaml");
      expect(r.stderr).toContain("src/third-party/skills.yaml");
    } finally {
      rmrf(root);
    }
  }, 60000);

  test("consumer 管理宣言の環境では dry-run が取得計画を表示して成功する", () => {
    const root = makeTempWorktree();
    try {
      const declDir = path.join(root, ".agentdev", "third-party");
      fs.mkdirSync(declDir, { recursive: true });
      fs.writeFileSync(
        path.join(declDir, "skills.yaml"),
        [
          'schema_version: "1.0"',
          "skills:",
          "  - name: plan-only-skill",
          "    source: https://github.com/owner/repo/tree/0000000000000000000000000000000000000000/skills/plan-only-skill",
          "",
        ].join("\n"),
      );
      const r = spawnSync(process.execPath, [CLI_PATH, "--dry-run"], {
        cwd: root,
        encoding: "utf-8",
      });
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("plan-only-skill");
      expect(r.stdout).toContain("dry-run complete");
    } finally {
      rmrf(root);
    }
  }, 60000);
});
