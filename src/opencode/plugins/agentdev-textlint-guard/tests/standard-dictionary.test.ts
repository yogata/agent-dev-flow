// ADF-COVERS(verification): REQ-010-068, REQ-010-071, REQ-053-007
//
// 標準 prh 辞書（旧 IR-060 forbidden 区分から移管した完全一致検出語）の回帰テスト。
// REQ-010-068 の5分類（正常例、違反例、境界例、許容例、過去再現例）を担う。
// 移管の経緯と移管対象外判断（定位、一致性、測可能性、単独根、要件doc）は
// 移管 PR（Issue #2727）の本文が追跡先である。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { prepareInspection, inspectText } from "../lib/inspect.ts";

// 対象プロジェクトの設定や用語辞書の有無に依存せず標準辞書単体の挙動を固定するため、
// 設定なしの一時プロジェクトで検査する。
function makeIsolatedProject(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "adftl-stdict-"));
}

async function prhHits(root: string, text: string) {
  const prepared = await prepareInspection(root);
  expect(prepared.ok).toBe(true);
  if (!prepared.ok) throw new Error("prepareInspection failed");
  const r = await inspectText(prepared, root, "docs/a.md", text);
  expect(r.ok).toBe(true);
  if (!r.ok) throw new Error("inspectText failed");
  return r.result.findings.filter((f) => f.ruleId === "prh");
}

describe("標準 prh 辞書（旧 IR-060 forbidden 移管語、REQ-010-068 5分類）", () => {
  test("正常例: 標準辞書対象外の通常の日本語文章を検出しない", async () => {
    const root = makeIsolatedProject();
    const hits = await prhHits(root, "# 見出し\n\n現行成果物の整合性を確認し、進捗を報告する。\n");
    expect(hits).toHaveLength(0);
  });

  test("違反例: 移管語を散文で検出し、修正指針（replacement）を返す", async () => {
    const root = makeIsolatedProject();
    const cases: Array<[string, string]> = [
      ["A 而非 B である。", "〜ではなく"],
      ["统一された運用を行う。", "統一"],
      ["この路径の候选を選ぶ。", "候補"],
      ["破綾を避ける。", "破綻"],
      ["進捰を確認する。", "進捗"],
      ["自己完束している。", "自己完結"],
    ];
    for (const [text, expected] of cases) {
      const hits = await prhHits(root, `# 見出し\n\n${text}\n`);
      const hard = hits.find((f) => f.severity === "hard" && f.replacement === expected);
      expect(hard).toBeDefined();
      if (hard !== undefined) {
        expect(hard.message).toContain(expected);
        expect(hard.replacement).toBe(expected);
      }
    }
  });

  test("境界例: 日本語正字と部分語を誤検出しない", async () => {
    const root = makeIsolatedProject();
    const cases = [
      // 统一（簡体字 统）と日本語 統一 は別字である
      "命名規則を統一する。",
      // 成果成果物（重複表現）と正当な 単独の 成果物 は区別される
      "成果物を提出する。",
      // 監査証跡（正）は監査証跠（誤変換）と区別される
      "監査証跡を保持する。",
      // source-of-truth（正）は source-of-trought（誤記）と区別される
      "REQ ファイルが source of truth である。",
    ];
    for (const text of cases) {
      const hits = await prhHits(root, `# 見出し\n\n${text}\n`);
      expect(hits).toHaveLength(0);
    }
  });

  test("許容例: inline code と fenced code 内の移管語を検出対象外とする", async () => {
    const root = makeIsolatedProject();
    const inline = "# 見出し\n\n`统一` を inline code で例示する。\n";
    const fenced = "# 見出し\n\n```\n统一\n```\n";
    for (const text of [inline, fenced]) {
      const hits = await prhHits(root, text);
      expect(hits).toHaveLength(0);
    }
  });

  test("過去再現例: 過去に発生した誤変換・誤記の再現を検出する", async () => {
    const root = makeIsolatedProject();
    // 移管 PR（Issue #2727）の修正対象として実在した誤変換・誤記の再現
    const mojibake = "# 見出し\n\ncommit message に却下理由を含める（監査証跠の補強）。\n";
    const typo = "# 見出し\n\n- source-of-trought priority 遵守\n";
    const mojibakeHits = await prhHits(root, mojibake);
    expect(mojibakeHits.some((f) => f.severity === "hard" && f.replacement === "監査証跡")).toBe(true);
    const typoHits = await prhHits(root, typo);
    expect(typoHits.some((f) => f.severity === "hard" && f.replacement === "唯一の情報源（SSoT）")).toBe(true);
  });
});
