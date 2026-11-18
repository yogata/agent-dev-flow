import { expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const cli = resolve(import.meta.dir, "../cli.ts");

function inGitFixture(run: (root: string) => void): void {
  const temp = resolve(".agentdev/tmp");
  mkdirSync(temp, { recursive: true });
  const root = mkdtempSync(join(temp, "untracked-residue-"));
  try {
    execFileSync("git", ["init", "--quiet"], { cwd: root });
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("実 Git の未追跡検査は管理対象と無視対象を除き、未追跡パスを報告する", () => {
  inGitFixture((root) => {
    writeFileSync(join(root, ".gitignore"), "ignored.txt\n");
    writeFileSync(join(root, "tracked.txt"), "tracked");
    execFileSync("git", ["add", "--", ".gitignore", "tracked.txt"], { cwd: root });
    writeFileSync(join(root, "ignored.txt"), "ignored");
    writeFileSync(join(root, "未追跡.txt"), "untracked");

    const result = spawnSync(process.execPath, [cli, "--root", root, "--rule", "IR-001", "--json"], { encoding: "utf8" });

    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout).builtinViolations).toEqual([
      expect.objectContaining({ ruleId: "untracked-residue", filePath: "未追跡.txt" }),
    ]);
  });
});

test("Git インデックスが読めなければ検査は実行エラーで終了する", () => {
  inGitFixture((root) => {
    writeFileSync(join(root, ".git", "index"), "invalid index\n");

    const result = spawnSync(process.execPath, [cli, "--root", root, "--rule", "IR-001", "--json"], { encoding: "utf8" });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("git ls-files");
  });
});
