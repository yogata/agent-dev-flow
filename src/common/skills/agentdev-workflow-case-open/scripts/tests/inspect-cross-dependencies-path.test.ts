import { describe, expect, test } from "bun:test";

import { resolvePathArgument } from "../lib/cross_dependency_types";

describe("パス引数の環境形式の検出と正規化", () => {
  test("Windows 形式の絶対パスはそのまま受理する", () => {
    expect(resolvePathArgument("C:/repo", "win32")).toEqual({ ok: true, value: "C:/repo", detectedFormat: "windows" });
    expect(resolvePathArgument("C:\\repo", "win32")).toEqual({ ok: true, value: "C:\\repo", detectedFormat: "windows" });
    expect(resolvePathArgument("d:\\work\\repo", "linux")).toEqual({ ok: true, value: "d:\\work\\repo", detectedFormat: "windows" });
  });

  test("Git Bash 形式の /c/... は Windows 環境でドライブ形式へ正規化する", () => {
    expect(resolvePathArgument("/c/work/agent-dev-flow", "win32")).toEqual({
      ok: true,
      value: "C:/work/agent-dev-flow",
      detectedFormat: "git-bash",
    });
    expect(resolvePathArgument("/C/repo", "win32")).toEqual({ ok: true, value: "C:/repo", detectedFormat: "git-bash" });
    expect(resolvePathArgument("/c", "win32")).toEqual({ ok: true, value: "C:/", detectedFormat: "git-bash" });
  });

  test("POSIX 絶対パスは非 Windows 環境でそのまま受理する", () => {
    expect(resolvePathArgument("/home/user/repo", "linux")).toEqual({
      ok: true,
      value: "/home/user/repo",
      detectedFormat: "posix",
    });
    expect(resolvePathArgument("/home/user/repo", "darwin")).toEqual({
      ok: true,
      value: "/home/user/repo",
      detectedFormat: "posix",
    });
  });

  test("相対パスは実行環境によらずそのまま受理する", () => {
    expect(resolvePathArgument("./worktrees/x", "win32")).toEqual({
      ok: true,
      value: "./worktrees/x",
      detectedFormat: "relative",
    });
    expect(resolvePathArgument("worktrees/x", "linux")).toEqual({
      ok: true,
      value: "worktrees/x",
      detectedFormat: "relative",
    });
  });

  test("Windows 環境で正規化不能な絶対パス形式は形式エラーとして報告する", () => {
    const result = resolvePathArgument("/home/user/repo", "win32");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("unrecognized absolute path format");
    }
    // Git Bash 形式のシグネチャに合わない /a/b 形式も正規化せず形式エラーとする
    const lowerDriveLike = resolvePathArgument("/averylongdirname/repo", "win32");
    expect(lowerDriveLike.ok).toBe(false);
  });

  test("空のパス引数は形式エラーとして報告する", () => {
    expect(resolvePathArgument("", "win32").ok).toBe(false);
    expect(resolvePathArgument("  ", "linux").ok).toBe(false);
  });

  test("前後の空白を除去した値を返す", () => {
    expect(resolvePathArgument("  C:/repo  ", "win32")).toEqual({ ok: true, value: "C:/repo", detectedFormat: "windows" });
    expect(resolvePathArgument(" /c/repo ", "win32")).toEqual({ ok: true, value: "C:/repo", detectedFormat: "git-bash" });
  });
});
