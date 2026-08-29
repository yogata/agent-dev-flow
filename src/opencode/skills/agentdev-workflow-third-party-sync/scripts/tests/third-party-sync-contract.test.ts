// Contract tests for the third-party-sync entry. The acquisition Custom Tool
// is implemented by a parallel sibling branch and is intentionally NOT imported
// here; end-to-end verification runs in the follow-up integration wave.
import { test, expect, describe } from "bun:test";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

const skillDir = join(import.meta.dir, "..", "..");
const repoRoot = join(import.meta.dir, "..", "..", "..", "..", "..", "..");
const commandPath = join(repoRoot, "src", "opencode", "commands", "agentdev", "third-party-sync.md");
const skillPath = join(skillDir, "SKILL.md");

const command = readFileSync(commandPath, "utf8");
const skill = readFileSync(skillPath, "utf8");
const skillName = "agentdev-workflow-third-party-sync";

function frontmatterBlock(content: string): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  expect(match).not.toBeNull();
  return match![1];
}

describe("command definition (QCTRL-CMD structure)", () => {
  test("command file exists under src/opencode/commands/agentdev/", () => {
    expect(existsSync(commandPath)).toBe(true);
  });

  test("frontmatter allows description only (no forbidden fields)", () => {
    const fm = frontmatterBlock(command);
    expect(fm).toMatch(/^description:/m);
    for (const forbidden of ["agent:", "pattern:", "workflow_route:", "branch_type:", "labels:"]) {
      expect(fm).not.toContain(forbidden);
    }
  });

  test("command delegates workflow body to the Workflow Skill", () => {
    expect(command).toContain("`agentdev-workflow-third-party-sync`");
    expect(command).toContain("workflow");
  });

  test("command states dry-run shows plan only and never acquires", () => {
    expect(command).toContain("計画表示のみ");
    expect(command).toContain("取得を実行しない");
  });

  test("command states the normalized placement path", () => {
    expect(command).toContain(".opencode/skills/<name>/SKILL.md");
  });

  test("command forbids new scripts/ public entrypoints", () => {
    expect(command).toContain("scripts/ 直下の公開入口");
  });
});

describe("workflow skill (QCTRL-SKILL structure)", () => {
  test("SKILL.md exists and frontmatter name matches directory name", () => {
    expect(existsSync(skillPath)).toBe(true);
    const fm = frontmatterBlock(skill);
    const nameLine = fm.split(/\r?\n/).find((l) => l.startsWith("name:"));
    expect(nameLine).toBeDefined();
    expect(nameLine).toBe(`name: ${skillName}`);
  });

  test("frontmatter name has no backticks (YAML scalar)", () => {
    const fm = frontmatterBlock(skill);
    expect(fm).not.toContain("name: `");
  });

  test("description declares USE FOR / DO NOT USE FOR triggers", () => {
    const fm = frontmatterBlock(skill);
    expect(fm).toContain("USE FOR:");
    expect(fm).toContain("DO NOT USE FOR:");
  });

  test("STEP-1..4 match the Design (commands/third-party-sync.md) workflow steps", () => {
    for (const step of ["STEP-1", "STEP-2", "STEP-3", "STEP-4"]) {
      expect(skill).toContain(step);
    }
    expect(skill).toContain("入力解決・skills.yaml 読込と検証");
    expect(skill).toContain("対象選択");
    expect(skill).toContain("取得実行");
    expect(skill).toContain("結果検証・報告");
  });

  test("STEP-1 validates name constraints and forbids revision/type items", () => {
    expect(skill).toContain("kebab-case");
    expect(skill).toContain("`agentdev-`、`repo-` 接頭辞は拒否");
    expect(skill).toContain("revision 項目、type 項目を持たない");
  });

  test("STEP-2 pre-checks unmanaged conflicts without overwriting", () => {
    expect(skill).toContain("管理外衝突の事前判定");
    expect(skill).toContain("上書きしない");
  });

  test("STEP-3 delegates acquisition to the dedicated Custom Tool contract", () => {
    expect(skill).toContain("third-party Skill 取得専用 Custom Tool");
    expect(skill).toContain("「third-party Skill 取得」");
  });

  test("STEP-3 dry-run shows the plan only (target list, placement, source form, conflict status)", () => {
    expect(skill).toContain("計画表示のみ");
    expect(skill).toContain("対象一覧、配置先、source 形式");
    expect(skill).toContain("管理外衝突の事前判定結果");
  });

  test("STEP-4 reports failure without treating it as success", () => {
    expect(skill).toContain("失敗を成功扱いとしない");
    expect(skill).toContain("開始前状態");
  });

  test("normalized placement path matches the Design profile", () => {
    expect(skill).toContain(".opencode/skills/<name>/SKILL.md");
  });
});

describe("scripts/ public entrypoint boundary (completion criterion 1)", () => {
  test("no third-party public entrypoint under scripts/", () => {
    const scriptsDir = join(repoRoot, "scripts");
    expect(existsSync(scriptsDir)).toBe(true);
    const hits = readdirSync(scriptsDir).filter((n) => n.toLowerCase().includes("third-party"));
    expect(hits).toEqual([]);
  });
});
