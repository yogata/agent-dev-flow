// source URL 形式判定規則のテスト（Design third-party-skill-management
// 「Design で確定する実装判断」: GitHub blob/raw/tree URL 変種の扱い）。


import { describe, expect, test } from "bun:test";
import { resolveSourceUrl } from "../source-url.ts";

describe("単一ファイル型の判定", () => {
  test("blob URL の SKILL.md は raw URL へ正規化される", () => {
    const result = resolveSourceUrl(
      "https://github.com/owner/repo/blob/main/skills/my-skill/SKILL.md",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.profile).toBe("single-file");
    expect(result.source.owner).toBe("owner");
    expect(result.source.repo).toBe("repo");
    expect(result.source.ref).toBe("main");
    expect(result.source.rawUrl).toBe(
      "https://raw.githubusercontent.com/owner/repo/main/skills/my-skill/SKILL.md",
    );
  });

  test("raw URL の SKILL.md は単一ファイル型", () => {
    const result = resolveSourceUrl(
      "https://raw.githubusercontent.com/owner/repo/v1.2.0/path/SKILL.md",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.profile).toBe("single-file");
    expect(result.source.ref).toBe("v1.2.0");
    expect(result.source.rawUrl).toContain("/path/SKILL.md");
  });
});

describe("ディレクトリ型の判定", () => {
  test("tree URL はディレクトリ型", () => {
    const result = resolveSourceUrl(
      "https://github.com/owner/repo/tree/main/skills/my-skill",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.profile).toBe("directory");
    expect(result.source.dir).toBe("skills/my-skill");
  });

  test("tree URL 末尾スラッシュは正規化される", () => {
    const result = resolveSourceUrl(
      "https://github.com/owner/repo/tree/main/skills/my-skill/",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.dir).toBe("skills/my-skill");
  });
});

describe("拒否される source", () => {
  test("SKILL.md 以外の blob URL は拒否", () => {
    const result = resolveSourceUrl(
      "https://github.com/owner/repo/blob/main/skills/my-skill/README.md",
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.detail).toContain("blob source URL must reference SKILL.md");
  });

  test("SKILL.md 以外の raw URL は拒否（raw は一覧不能）", () => {
    const result = resolveSourceUrl(
      "https://raw.githubusercontent.com/owner/repo/main/skills/my-skill/references/guide.md",
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.detail).toContain("raw");
  });

  test("リポジトリルートの tree URL は拒否", () => {
    const result = resolveSourceUrl("https://github.com/owner/repo/tree/main");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.detail).toContain("Skill directory");
  });

  test("非対応ホストは拒否", () => {
    const result = resolveSourceUrl("https://gitlab.com/owner/repo/tree/main/skills/x");
    expect(result.ok).toBe(false);
  });

  test("http:// は拒否", () => {
    const result = resolveSourceUrl("http://github.com/owner/repo/tree/main/skills/x");
    expect(result.ok).toBe(false);
  });

  test("URL でない文字列は拒否", () => {
    const result = resolveSourceUrl("not-a-url");
    expect(result.ok).toBe(false);
  });

  test("git clone 形式（.git 末尾）は対応しない", () => {
    const result = resolveSourceUrl("https://github.com/owner/repo.git");
    expect(result.ok).toBe(false);
  });
});
