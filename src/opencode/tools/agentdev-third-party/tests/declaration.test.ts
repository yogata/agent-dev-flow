// 宣言ファイル（skills.yaml）読込のテスト。スキーマの正は Design
// third-party-skill-management「宣言ファイル（skills.yaml）」。


import { describe, expect, test } from "bun:test";
import { parseDeclaration, validateSkillName } from "../declaration.ts";

describe("正常系", () => {
  test("name/source のリストを読み込む", () => {
    const result = parseDeclaration(
      [
        "# comment",
        "skills:",
        "  - name: my-skill",
        "    source: https://github.com/owner/repo/tree/main/skills/my-skill",
        "  - name: doc-skill",
        '    source: "https://github.com/owner/repo/blob/main/SKILL.md"',
        "",
      ].join("\n"),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.skills).toEqual([
      { name: "my-skill", source: "https://github.com/owner/repo/tree/main/skills/my-skill" },
      { name: "doc-skill", source: "https://github.com/owner/repo/blob/main/SKILL.md" },
    ]);
  });

  test("skills: のみの空宣言を読み込む", () => {
    const result = parseDeclaration("skills:\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.skills).toEqual([]);
  });
});

describe("異常系（fail-closed）", () => {
  test.each([
    ["skills: セクションなし", "foo: bar"],
    ["name 欠落", "skills:\n  - source: https://example.com/x"],
    ["source 欠落", "skills:\n  - name: my-skill"],
    ["http source", "skills:\n  - name: my-skill\n    source: http://example.com/x"],
    ["重複 name", "skills:\n  - name: a-skill\n    source: https://example.com/a\n  - name: a-skill\n    source: https://example.com/b"],
    ["サポート外の行", "skills:\n  extra: value"],
    ["大文字 name", "skills:\n  - name: MySkill\n    source: https://example.com/x"],
  ])("%s は失敗する", (_label, text) => {
    const result = parseDeclaration(text);
    expect(result.ok).toBe(false);
  });
});

describe("予約接頭辞", () => {
  test.each(["agentdev-gh", "repo-agentdev-integrity"])("%s は拒否される", (name) => {
    expect(validateSkillName(name)).not.toBeNull();
  });

  test.each(["my-skill", "doc-writing", "a1-b2"])("%s は許容される", (name) => {
    expect(validateSkillName(name)).toBeNull();
  });
});
