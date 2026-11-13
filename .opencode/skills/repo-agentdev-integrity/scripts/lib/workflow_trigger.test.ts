// B3-5b 統合名簿の契約テスト（Issue #4034）。
//
// lib/workflow_trigger.ts 冒頭の統合名簿と実態の一致を機械検証する:
// - 削除対象: 両 checker が WORKFLOW_TRIGGER_ITEM 定数・対象集合導出・
//   frontmatter description 抽出をローカル二重保持していないこと
//   （同一検査の二重保守 0 件の静的検証）
// - 意図的に残す検査: 両 checker の検査段階（check 3 / AG-005）が実在すること
// - 正本資産の値と導出挙動の固定

import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  WORKFLOW_TRIGGER_ITEM,
  WORKFLOW_TRIGGER_ITEM_FULL_FORM,
  commandBoundWorkflowSkillName,
  listCommandBoundWorkflowSkills,
  parseSkillFrontMatterFields,
} from "./workflow_trigger.ts";

const SCRIPTS_DIR = path.resolve(__dirname, "..");

function readCheckerSource(fileName: string): string {
  return fs.readFileSync(path.join(SCRIPTS_DIR, fileName), "utf-8");
}

describe("正本資産の値と導出挙動", () => {
  test("AG-004 検出語と Design 権威形", () => {
    expect(WORKFLOW_TRIGGER_ITEM).toBe("単独起動");
    expect(WORKFLOW_TRIGGER_ITEM_FULL_FORM).toBe(
      "単独起動（対応する /agentdev/* コマンド経由で利用すること）",
    );
    expect(WORKFLOW_TRIGGER_ITEM_FULL_FORM.startsWith(WORKFLOW_TRIGGER_ITEM)).toBe(true);
  });

  test("commandBoundWorkflowSkillName 導出", () => {
    expect(commandBoundWorkflowSkillName("demo")).toBe("agentdev-workflow-demo");
  });

  test("listCommandBoundWorkflowSkills: .md を結び付け README.md と非 .md を除外", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "wf-trigger-lib-"));
    ROOTS.push(root);
    const cmdDir = path.join(root, "src", "common", "commands", "agentdev");
    fs.mkdirSync(cmdDir, { recursive: true });
    fs.writeFileSync(path.join(cmdDir, "demo.md"), "# demo");
    fs.writeFileSync(path.join(cmdDir, "README.md"), "# index");
    fs.writeFileSync(path.join(cmdDir, "notes.txt"), "n");
    expect(listCommandBoundWorkflowSkills(root)).toEqual(
      new Set(["agentdev-workflow-demo"]),
    );
    expect(listCommandBoundWorkflowSkills(path.join(root, "missing"))).toEqual(
      new Set(),
    );
  });

  test("parseSkillFrontMatterFields: 単一行抽出・trim・重複キー初出優先・frontmatter 不備は null", () => {
    const fields = parseSkillFrontMatterFields(
      '---\nname: agentdev-x\ndescription: "demo"。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。\ndescription: second\n---\n\nbody',
    );
    expect(fields?.name).toBe("agentdev-x");
    expect(fields?.description).toBe(
      '"demo"。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。',
    );
    expect(
      parseSkillFrontMatterFields("---\r\nname: crlf\r\ndescription: v\r\n---\r\n\r\nbody"),
    ).toEqual({ name: "crlf", description: "v" });
    expect(parseSkillFrontMatterFields("no frontmatter")).toBeNull();
    expect(parseSkillFrontMatterFields("---\nname: only-start\n")).toBeNull();
  });
});

describe("B3-5b 統合名簿と実態の一致", () => {
  test("削除対象: 両 checker は WORKFLOW_TRIGGER_ITEM をローカル二重保持しない", () => {
    for (const f of ["check_workflow_preventive.ts", "lint_skills.ts"]) {
      const src = readCheckerSource(f);
      expect(src).not.toMatch(/const WORKFLOW_TRIGGER_ITEM\s*=/);
      expect(src).toContain('from "./lib/workflow_trigger.ts"');
    }
  });

  test("削除対象: 旧ローカル導出・旧ローカル抽出の関数定義が残存しない", () => {
    expect(
      readCheckerSource("check_workflow_preventive.ts"),
    ).not.toMatch(/function extractFrontMatterDescription/);
    expect(
      readCheckerSource("lint_skills.ts"),
    ).not.toMatch(/function listCommandBoundWorkflowSkills/);
  });

  test("意図的に残す検査: 両 checker の検査段階が実在する", () => {
    const preventive = readCheckerSource("check_workflow_preventive.ts");
    expect(preventive).toContain('3: "workflow-soft-guard"');
    const lint = readCheckerSource("lint_skills.ts");
    expect(lint).toContain('"workflow trigger item"');
  });

  test("check_integrity は本不変式の検出語を所有しない（大規模検査器との責務境界）", () => {
    const integrity = readCheckerSource("check_integrity.ts");
    expect(integrity).not.toContain("WORKFLOW_TRIGGER_ITEM");
    expect(integrity).not.toContain("workflow-soft-guard");
    expect(integrity).not.toContain('"workflow trigger item"');
  });
});

// 実行時 fixture の回収（REQ-118-003）: 清掃失敗は握りつぶさずテスト失敗として伝達する。
const ROOTS: string[] = [];
afterAll(() => {
  const failures: string[] = [];
  for (const root of ROOTS) {
    try {
      fs.rmSync(root, { recursive: true, force: true });
    } catch (error) {
      failures.push(`${root}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `fixture cleanup failed (${failures.length}/${ROOTS.length} roots):\n${failures.join("\n")}`,
    );
  }
});
