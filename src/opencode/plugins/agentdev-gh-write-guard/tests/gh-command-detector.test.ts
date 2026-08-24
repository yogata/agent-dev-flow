// gh WRITE 迂回検出器の契約テスト。
//
// 正規経路迂回（生 gh WRITE）の検出・拒否と読み取り系の許容を固定する。
// 禁止範囲の詳細は Design custom-tool-contracts.md「迂回防止」が所有する。


import { describe, expect, test } from "bun:test";
import {
  detectGhWriteCommand,
  formatBlockReason,
} from "../lib/gh-command-detector.ts";

describe("生 gh WRITE の検出（拒否）", () => {
  test.each([
    ["gh issue create --title x --body y", "gh issue WRITE"],
    ["gh issue edit 5 --body y", "gh issue WRITE"],
    ["gh issue close 5", "gh issue WRITE"],
    ["gh issue comment 5 --body y", "gh issue WRITE"],
    ["gh issue reopen 5", "gh issue WRITE"],
    ["gh issue delete 5", "gh issue WRITE"],
    ["gh pr create --fill", "gh pr WRITE"],
    ["gh pr merge 7 --squash", "gh pr WRITE"],
    ["gh pr close 7", "gh pr WRITE"],
    ["gh pr ready 7", "gh pr WRITE"],
    ["gh pr review 7 --approve", "gh pr WRITE"],
    ["gh pr edit 7 --title x", "gh pr WRITE"],
    ["gh api repos/o/r/issues -X POST -f title=x", "gh api WRITE method"],
    ["gh api repos/o/r/issues/5 --method PATCH -f body=y", "gh api WRITE method"],
    ["gh api repos/o/r/issues/5 --method=DELETE", "gh api WRITE method"],
    ["gh label create foo", "gh label WRITE"],
    ["gh release create v1", "gh release WRITE"],
    ["gh repo edit --description x", "gh repo WRITE"],
    ["gh workflow run ci.yml", "gh workflow trigger"],
    ["gh gist create f.txt", "gh gist WRITE"],
    ["gh milestone create m", "gh milestone WRITE"],
    ["gh project create x", "gh project WRITE"],
  ])("%s を block する", (command, rule) => {
    const verdict = detectGhWriteCommand(command);
    expect(verdict.kind).toBe("block");
    if (verdict.kind === "block") expect(verdict.rule).toBe(rule);
  });

  test.each([
    "echo 'gh issue create --title x' | gh issue view 5",
    "cd /d && gh pr merge 7 --squash",
  ])("複合コマンド中の gh WRITE も block する（%s）", (command) => {
    expect(detectGhWriteCommand(command).kind).toBe("block");
  });

  test("複数行コマンドの2行目の gh WRITE を block する", () => {
    const command = "echo hello\ngit status\ngh issue comment 5 --body y";
    expect(detectGhWriteCommand(command).kind).toBe("block");
  });

  test("セミコロン区切りの後続 gh WRITE を block する", () => {
    const command = "git add .; gh pr merge 7";
    expect(detectGhWriteCommand(command).kind).toBe("block");
  });

  test("ブロック理由に rule と該当行を含む", () => {
    const verdict = detectGhWriteCommand("gh issue close 5");
    expect(verdict.kind).toBe("block");
    if (verdict.kind === "block") {
      const reason = formatBlockReason(verdict);
      expect(reason).toContain("gh issue WRITE");
      expect(reason).toContain("gh issue close 5");
    }
  });
});

describe("読み取り系の許容（Design 所有の禁止範囲）", () => {
  test.each([
    "gh issue view 5",
    "gh issue list --state open",
    "gh issue status",
    "gh pr view 7 --json title",
    "gh pr list",
    "gh pr diff 7",
    "gh pr checks 7",
    "gh pr status",
    "gh api repos/o/r/issues/5",
    "gh api repos/o/r/issues/5 --method GET",
    "gh api repos/o/r/issues/5 -X GET",
    "gh label list",
    "gh release view v1",
    "gh release list",
    "gh repo view",
    "gh auth status",
    "gh run list",
    "gh run view 123",
    "gh workflow view ci.yml",
    "gh search issues 'text'",
    "git status",
    "git log --oneline -5",
    "echo hello",
    "bun test src/",
    "powershell -Command Get-Location",
  ])("%s は許容する", (command) => {
    expect(detectGhWriteCommand(command).kind).toBe("allow");
  });
});
