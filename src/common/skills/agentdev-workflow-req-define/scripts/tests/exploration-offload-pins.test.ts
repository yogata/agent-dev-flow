// req-define における探索・前処理委譲と構造化サマリ受領契約の構造照合テスト。
//
// 変更対象配布物（command / workflow skill / capability references）について以下を検証する:
// 1. 複数読込・検索を伴う探索・影響調査・前処理の読取専用探索サブエージェントへの委譲、
//    判断主体の直接実行範囲限定（対象パス確定単一ファイルの限定的確認のみ）、
//    全件存在確認・完全列挙の維持・調査優先対象ヒント扱い。
// 2. 探索サマリ 7 項目と生本文全文・大量検索結果の持ち込み禁止、取得不能・未確認の成功扱い禁止。
// 3. 配布物ゼロ汚染・中立語・非複製（KB 数値上限の再定義、要件 ID、ホスト固有ツール名を含まないこと）。
// 4. 判断主体の保持と単独工程独立完了の固定文言維持。

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

function resolveRepoRoot(fromDir: string): string {
  let current = fromDir;
  for (;;) {
    if (existsSync(join(current, "AGENTS.md")) && existsSync(join(current, "src", "common"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`repoRoot not found from ${fromDir}`);
    }
    current = parent;
  }
}

const repoRoot = resolveRepoRoot(import.meta.dir);

function readCommon(rel: string): string {
  return readFileSync(join(repoRoot, "src", "common", ...rel.split("/")), "utf8");
}

const reqDefineCommand = readCommon("commands/agentdev/req-define.md");
const reqDefineSkill = readCommon("skills/agentdev-workflow-req-define/SKILL.md");
const inputAndDialogue = readCommon("skills/agentdev-workflow-req-define/references/input-and-dialogue.md");
const requirementDev = readCommon("skills/agentdev-workflow-req-define/references/requirement-development.md");
const detailedGates = readCommon("skills/agentdev-req-analysis/references/req-define-detailed-gates.md");
const scopeRefinement = readCommon("skills/agentdev-req-analysis/references/investigation-scope-refinement.md");
const wallMethodology = readCommon("skills/agentdev-req-analysis/references/wall-methodology.md");

const targetFiles: Array<{ name: string; content: string }> = [
  { name: "req-define.md", content: reqDefineCommand },
  { name: "agentdev-workflow-req-define/SKILL.md", content: reqDefineSkill },
  { name: "input-and-dialogue.md", content: inputAndDialogue },
  { name: "requirement-development.md", content: requirementDev },
  { name: "req-define-detailed-gates.md", content: detailedGates },
  { name: "investigation-scope-refinement.md", content: scopeRefinement },
  { name: "wall-methodology.md", content: wallMethodology },
];

describe("req-define 探索・前処理委譲の責務境界", () => {
  test("command と workflow skill が探索・前処理の委譲と単一ファイル限定確認を規定する", () => {
    for (const doc of [reqDefineCommand, reqDefineSkill]) {
      expect(doc).toContain("読取専用の探索サブエージェントへ委譲");
      expect(doc).toContain("対象パスが確定している単一ファイルの限定的確認");
      expect(doc).toContain("全件の存在確認を機械処理として維持");
      expect(doc).toContain("完全列挙をキーワード検索で代替せず");
      expect(doc).toContain("調査優先対象をヒントとして扱う");
    }
  });

  test("references 群も探索サブエージェントへの委譲と単一ファイル限定確認を規定する", () => {
    for (const doc of [inputAndDialogue, requirementDev, detailedGates, wallMethodology]) {
      expect(doc).toContain("読取専用の探索サブエージェント");
      expect(doc).toContain("対象パスが確定している単一ファイルの限定的確認");
    }
    expect(scopeRefinement).toContain("読取専用の探索サブエージェント");
    expect(scopeRefinement).toContain("対象パスが確定している単一ファイルの限定的確認");
    expect(scopeRefinement).toContain("実ファイル完全列挙と全件存在確認");
  });
});

describe("探索サマリ返却契約と生本文持ち込み禁止", () => {
  const summaryFields = [
    "判定要約",
    "関連ファイルパス",
    "正規所有責務",
    "制約と矛盾点",
    "変更候補",
    "未確認事項",
    "副作用なしの旨",
  ];

  test("command / workflow skill / references が 7 項目と禁止事項を明記する", () => {
    for (const doc of [reqDefineCommand, reqDefineSkill, requirementDev, detailedGates, scopeRefinement]) {
      for (const field of summaryFields) {
        expect(doc).toContain(field);
      }
      expect(doc).toContain("生の本文全文や大量の検索結果");
      expect(doc).toContain("取得不能");
      expect(doc).toContain("成功として扱わない");
    }
  });
});

describe("判断主体の保持と単独工程独立完了", () => {
  test("壁打ち・Decision受理・draft確定保存の保持と独立完了文言が維持される", () => {
    expect(reqDefineCommand).toContain("要件確定のみの単独工程の独立完了");
    expect(reqDefineCommand).toContain("壁打ち対話、要件の人間判断、Decision 受理判断、最終的な `req-draft` の確定と保存を保持");
    expect(reqDefineSkill).toContain("要件確定のみの単独工程の独立完了");
    expect(reqDefineSkill).toContain("壁打ち対話、要件の人間判断、Decision 受理判断、最終的な `req-draft` の確定と保存は判断主体が保持");
  });
});

describe("配布物ゼロ汚染・中立語・KB上限非複製", () => {
  test("変更対象配布物に要件ID・KB上限再定義・ホスト固有ツール名が含まれない", () => {
    const reqIdPattern = /\bREQ-\d{3,4}-\d{3}\b/;
    const kbLimitPattern = /\d+(?:\s*[〜~\-]\s*\d+)?\s*KB/i;
    const hostToolPattern = /\b(?:session_read|full_session)\b/;

    for (const { content } of targetFiles) {
      expect(content).not.toMatch(reqIdPattern);
      expect(content).not.toMatch(kbLimitPattern);
      expect(content).not.toMatch(hostToolPattern);
    }
  });
});
