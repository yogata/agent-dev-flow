// TS-009 工程適合試験（REQ-099-015、REQ-099-016 の既存契約照合）。
//
// case-run（単一 Issue 実行への収斂・委譲1件・result 4状態・前置/最終 gate）、
// case-auto（orchestration stage・stage 内並列・stage 間 fan-in・Wave 反復）、
// および実行担当サブエージェントの adapter 契約（3点ゲート・成果物未確認の
// 成功禁止）の workflow skill 定義が既存契約の必須要素を保持していることを
// 構造照合で検証する。本 Issue（Wave 3）では live な case 全体の再実行ではなく、
// 工程契約の適合確認を対象とする。

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..", "..", "..", "..", "..", "..", "..", "..");
const caseRunSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-run", "SKILL.md"), "utf8");
const caseAutoSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-workflow-case-auto", "SKILL.md"), "utf8");
const adapterSkill = readFileSync(join(repoRoot, "src", "common", "skills", "agentdev-case-run-execution-adapter", "SKILL.md"), "utf8");
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
  test("委譲結果受領の最終ゲート（4状態 result・commit hash・PR URL）を保持する", () => {
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
