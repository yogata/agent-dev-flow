// TS-009 工程適合試験（REQ-099-015、REQ-099-016 の既存契約照合）。
//
// case-run（単一 Issue 実行への収斂・委譲1件・result 4状態・前置/最終 gate）、
// case-auto（orchestration stage・stage 内並列・stage 間 fan-in・Wave 反復）、
// および実行担当サブエージェントの adapter 契約（3点ゲート・成果物未確認の
// 成功禁止）の workflow skill 定義が既存契約の必須要素を保持していることを
// 構造照合で検証する。TS-001 委譲結果返却サマリ契約（八項目・UTF-8 上限目安
// 3〜4 KB・詳細退避・4状態非変更・雛形バイト数測定）の pin を含む。
// 本 Issue（Wave 3）では live な case 全体の再実行ではなく、
// 工程契約の適合確認を対象とする。

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// repoRoot 解決は import.meta.dir からの固定階層上昇を用いない。
// main root と worktree（.worktrees/{N}-{type}/ 配下）ではテストファイルから
// repoRoot までの階層数が異なるため、固定階層上昇は環境依存になり
// 片方の環境でだけ green/false fail を生む。上位方向へ repoRoot 特徴
// （AGENTS.md と src/common を伴う階層）を探索する階層数非固定の探索とする。
function resolveRepoRoot(fromDir: string): string {
  let current = fromDir;
  for (;;) {
    if (existsSync(join(current, "AGENTS.md")) && existsSync(join(current, "src", "common"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`repoRoot not found from ${fromDir} (AGENTS.md + src/common traversal exhausted)`);
    }
    current = parent;
  }
}

const repoRoot = resolveRepoRoot(import.meta.dir);
const caseRunSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-run", "SKILL.md"), "utf8");
const caseAutoSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-auto", "SKILL.md"), "utf8");
const caseCloseSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-close", "SKILL.md"), "utf8");
const backlogAutoSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-backlog-auto", "SKILL.md"), "utf8");
const adapterSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-case-run-execution-adapter", "SKILL.md"), "utf8");
const delegationReference = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-case-run-execution-adapter", "references", "harness-delegation.md"), "utf8");
const ghToolReadme = readFileSync(join(repoRoot, "src", "common", "tools", "agentdev-gh", "README.md"), "utf8");

describe("TS-009 case-run 工程契約（委譲1件・result 4状態・成果物検証つき成功）", () => {
  test("result 契約の 4 状態と委譲 1 件の収斂を保持する", () => {
    for (const state of ["completed-pr", "blocked", "failed", "delegation-unavailable"]) {
      expect(caseRunSkill).toContain(state);
    }
    expect(caseRunSkill).toContain("STEP-S6");
    expect(caseRunSkill).toContain("最終 gate");
  });

  test("成果物未確認の成功を禁止する（completed の SSoT は PR 本文、verify-only closure の例外契約を明示）", () => {
    expect(caseRunSkill).toContain("completed の SSoT は PR 本文");
    expect(caseRunSkill).toContain("verify-only closure");
  });

  test("実装実行は委譲内（実行担当サブエージェント）であり case-run 本体は実行しない", () => {
    expect(caseRunSkill).toContain("実装実行そのもの");
  });
});

describe("TS-009 case-auto 工程契約（stage 内並列・stage 間 fan-in・同期逐次 fallback 禁止）", () => {
  test("orchestration stage モデルと stage 間 fan-in 契約を保持する", () => {
    expect(caseAutoSkill).toContain("stage 3");
    expect(caseAutoSkill).toContain("fan-in");
    expect(caseAutoSkill).toContain("収束済みとしない");
  });

  test("同期逐次実行への切替を禁止し、並列起動不能時は直列化で完了を装わず停止する", () => {
    expect(caseAutoSkill).toContain("同期逐次実行");
    expect(caseAutoSkill).toContain("直列化で完了を装わず停止");
  });
});

describe("TS-009 adapter 委譲契約（3点ゲート・成果物検証）", () => {
  test("委譲結果受領の最終ゲート（4状態 result 必須・状態別必須欄）を保持する", () => {
    for (const element of ["4状態 result", "commit hash", "PR URL"]) {
      expect(adapterSkill).toContain(element);
    }
    expect(adapterSkill).toContain("3点ゲート");
  });

  test("3点の欠ける委譲応答を completed-pr として扱わない（成果物未確認の成功禁止）", () => {
    expect(adapterSkill).toContain("として扱わない。実装・検証の要約は3点検査の通過を代替しない");
  });

  test("副作用操作は読み戻し検証（VERIFY）を通過した場合のみ成功を返す（Tool 操作契約の維持）", () => {
    expect(ghToolReadme).toContain("副作用操作（side-effect）は読み戻し照合（VERIFY）を通過した場合のみ成功を返す");
  });
});

describe("TS-001 委譲結果返却サマリ契約（八項目・3〜4 KB 上限・詳細退避）", () => {
  const summaryItems = [
    "ステータス",
    "判定要約",
    "変更ファイルパス一覧",
    "コミット SHA",
    "Issue/PR 番号",
    "pass/fail 件数",
    "未達事項",
    "詳細成果物パス",
  ];

  test("adapter 返却契約に八項目・UTF-8 上限目安 3〜4 KB・詳細退避・4状態非変更を保持する", () => {
    for (const item of summaryItems) {
      expect(adapterSkill).toContain(item);
    }
    expect(adapterSkill).toContain("最終返却本文のサマリ上限");
    expect(adapterSkill).toContain("3〜4 KB");
    expect(adapterSkill).toContain("退避先のパス/URL 参照のみを含める");
    for (const state of ["completed-pr", "blocked", "failed", "delegation-unavailable"]) {
      expect(adapterSkill).toContain(state);
    }
    expect(adapterSkill).toContain("実行未試行のため実行担当のサマリ返却対象外");
    expect(adapterSkill).toContain("サマリの `completed` から PR 完了やゲート合格を導出しない");
  });

  test("4 workflow の受領側契約に返却サマリ上限と退避先参照を保持する", () => {
    expect(caseRunSkill).toContain("委譲応答の返却サマリ上限");
    for (const skill of [caseRunSkill, caseAutoSkill, caseCloseSkill, backlogAutoSkill]) {
      for (const item of summaryItems) {
        expect(skill).toContain(item);
      }
      expect(skill).toContain("3〜4 KB");
      expect(skill).toContain("退避先");
    }
    expect(caseAutoSkill).toContain("必要なゲート判定は退避先の原文・証拠を参照して行う");
    expect(caseCloseSkill).toContain("完了判定（QG-4）はサマリ本文を根拠とせず");
    expect(backlogAutoSkill).toContain("完遂判定は既存の突合手続（義務スナップショット・対応表）で行う");
  });

  test("返却サマリ雛形の八項目構造を保持し、雛形本文の UTF-8 バイト数が上限目安 3〜4 KB 以内である", () => {
    expect(delegationReference).toContain("返却サマリ雛形");
    for (const item of summaryItems) {
      expect(delegationReference).toContain(item);
    }
    expect(delegationReference).toContain("雛形本文に展開しない");
    const templateStart = delegationReference.indexOf("## 委譲結果サマリ");
    expect(templateStart).toBeGreaterThanOrEqual(0);
    const templateEnd = delegationReference.indexOf("```", templateStart);
    expect(templateEnd).toBeGreaterThan(templateStart);
    const templateBody = delegationReference.slice(templateStart, templateEnd);
    const bytes = Buffer.byteLength(templateBody, "utf8");
    expect(bytes).toBeLessThanOrEqual(4096);
  });
});
