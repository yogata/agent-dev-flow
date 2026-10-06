// ADF-COVERS(verification): REQ-032-038
/**
 * Full-route regression for the case-auto progression/termination control
 * (per-completion-condition child/Epic separation and old-contract dispatch
 * suppression, REQ-032-038 and the case-auto Design "old contract suppression
 * and progression/termination gate connection" section).
 *
 * The test drives the deterministic determination consumed by the live route:
 * `src/common/skills/agentdev-workflow-case-auto/scripts/src/wave-gate.ts` is
 * referenced by the case-auto stage-3 runtime control contract
 * (input-resolution-and-orchestration.md), the stop-propagation route
 * (stop-and-decision-resolution.md), and the completion-report route
 * (conflict-resolution-and-reporting.md). The false-positive scenario
 * (FP-10) asserts that a new dispatch under the old contract is rejected
 * while an agreed change is unreflected; the false-negative scenario (FN-1)
 * asserts that a satisfied child is never blocked solely by an unmet parent
 * cross obligation; and the Epic scenarios assert that the Epic/Root stays
 * open until the parent cross obligations hold while satisfied children
 * complete through the very same gate functions.
 *
 * The route connection itself is pinned by reading the three case-auto
 * reference bodies and asserting the module/function references, so the tests
 * fail if the live route stops consuming this determination.
 */

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import {
  canCloseEpic,
  canCompleteChild,
  canDispatchNewExecution,
  isDependencySatisfied,
  isWaveConverged,
  type ChildExecutionRecord,
} from "../src/wave-gate";

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(import.meta.dir);

/** 条件を満たした子 Issue の標本。 */
function satisfiedChild(issue: string): ChildExecutionRecord {
  return {
    issue,
    status: "outcome-determined",
    outcome: "pass",
    ownRequiredConditionsMet: true,
  };
}

// ---------------------------------------------------------------------------
// 実経路接続の参照関係確認（テストが実経路から利用される判定処理に接続）
// ---------------------------------------------------------------------------

describe("実経路接続の参照関係", () => {
  function readReference(fileName: string): string {
    return fs.readFileSync(
      path.join(
        REPO_ROOT,
        "src",
        "common",
        "skills",
        "agentdev-workflow-case-auto",
        "references",
        fileName,
      ),
      "utf-8",
    );
  }

  test("stage 3 runtime 制御契約が wave gate の決定的判定を実行手順として参照する", () => {
    const orchestration = readReference("input-resolution-and-orchestration.md");
    expect(orchestration).toContain("scripts/src/wave-gate.ts");
    expect(orchestration).toContain("isWaveConverged");
    expect(orchestration).toContain("isDependencySatisfied");
    expect(orchestration).toContain("canCompleteChild");
    expect(orchestration).toContain("canCloseEpic");
    expect(orchestration).toContain("canDispatchNewExecution");
    expect(orchestration).toContain("dispatch 入口での旧実行契約抑止");
    expect(orchestration).toContain("子完了と親横断義務の分離");
  });

  test("停止伝播経路が義務投影不完全・検証不能申告の停止伝播で判定処理を消費する", () => {
    const stop = readReference("stop-and-decision-resolution.md");
    expect(stop).toContain("義務投影不完全・検証不能申告の停止伝播");
    expect(stop).toContain("canCompleteChild");
    expect(stop).toContain("isDependencySatisfied");
    expect(stop).toContain("scripts/src/wave-gate.ts");
  });

  test("完了報告経路が誤完了拒否判定を同じ経路で消費する", () => {
    const reporting = readReference("conflict-resolution-and-reporting.md");
    expect(reporting).toContain("完了報告経路での必須未達・親横断義務の取り扱い");
    expect(reporting).toContain("canCompleteChild");
    expect(reporting).toContain("canCloseEpic");
    expect(reporting).toContain("scripts/src/wave-gate.ts");
  });
});

// ---------------------------------------------------------------------------
// 偽陽性シナリオ（FP-10）: 旧実行契約による新規 dispatch の抑止
// ---------------------------------------------------------------------------

describe("FP-10: dispatch 入口での旧実行契約抑止", () => {
  test("合意変更が未反映・読み戻し未確認の場合は旧実行契約による新規 dispatch を拒否する", () => {
    const unconfirmed = canDispatchNewExecution({ contractReflectionConfirmed: false });
    expect(unconfirmed.allowed).toBe(false);

    const unverified = canDispatchNewExecution({});
    expect(unverified.allowed).toBe(false);
  });

  test("影響する合意変更が下流消費成果物へ反映され読み戻しが確認されれば dispatch を許可する", () => {
    const result = canDispatchNewExecution({ contractReflectionConfirmed: true });
    expect(result.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 偽陰性シナリオ（FN-1）と子完了の判定
// ---------------------------------------------------------------------------

describe("FN-1: 子完了と親横断義務の分離", () => {
  test("条件を満たした子 Issue は親横断義務の未完了だけを理由に終了禁止されない", () => {
    // canCompleteChild の入力には親横断義務が存在しない（構造的に分離）。
    // 条件を満たした子は親の状態に関わらず完了を許可される。
    const result = canCompleteChild(satisfiedChild("#3447"));
    expect(result.allowed).toBe(true);
  });

  test("子が負う必須条件が未成立の場合は完了を拒否する", () => {
    const unmet = canCompleteChild({
      issue: "#3001",
      status: "outcome-determined",
      outcome: "pass",
      ownRequiredConditionsMet: false,
    });
    expect(unmet.allowed).toBe(false);

    const undetermined = canCompleteChild({
      issue: "#3002",
      status: "active",
    });
    expect(undetermined.allowed).toBe(false);
  });

  test("義務投影不完全・検証不能申告の子は完了伝播を阻止される（停止伝播）", () => {
    const incompleteProjection = canCompleteChild({
      ...satisfiedChild("#3003"),
      obligationDefect: "incomplete-projection",
    });
    expect(incompleteProjection.allowed).toBe(false);

    const unverifiable = canCompleteChild({
      ...satisfiedChild("#3004"),
      obligationDefect: "unverifiable-verdict",
    });
    expect(unverifiable.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 依存充足ゲート（スロット型キュー投入）
// ---------------------------------------------------------------------------

describe("依存充足ゲート（スロット型キュー投入の依存充足判定）", () => {
  test("収束は全子の実行結果確定を要求し、未処理・実行中・状態不明を残さない", () => {
    expect(
      isWaveConverged([satisfiedChild("#1"), satisfiedChild("#2")]),
    ).toBe(true);

    const blocked: ChildExecutionRecord = {
      issue: "#3",
      status: "outcome-determined",
      outcome: "blocked",
    };
    // blocked / failed の確定も収束には該当し得る。
    expect(isWaveConverged([satisfiedChild("#1"), blocked])).toBe(true);
    expect(
      isWaveConverged([satisfiedChild("#1"), { issue: "#4", status: "active" }]),
    ).toBe(false);
    expect(
      isWaveConverged([
        satisfiedChild("#1"),
        { issue: "#5", status: "state-unknown" },
      ]),
    ).toBe(false);
  });

  test("依存充足は依存先の完了のみを条件とし、無関係の子の未処理・実行中（非収束）を前提としない", () => {
    // Wave 収束（全子の結果確定）が未達でも、依存先が完了していれば依存充足は成立する
    // （完了即次投入のスロット型キュー。Wave 収束前提の撤廃）。
    const result = isDependencySatisfied({
      dependencyProviders: [satisfiedChild("#dep1"), satisfiedChild("#dep2")],
    });
    expect(result.satisfied).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  test("必須依存がない子は依存充足が直ちに成立する", () => {
    const result = isDependencySatisfied({ dependencyProviders: [] });
    expect(result.satisfied).toBe(true);
  });

  test("blocked / failed / delegation-unavailable の依存先は依存充足とはみなさない", () => {
    for (const outcome of ["blocked", "failed", "delegation-unavailable"] as const) {
      const result = isDependencySatisfied({
        dependencyProviders: [
          {
            issue: "#dep-x",
            status: "outcome-determined",
            outcome,
          },
        ],
      });
      expect(result.satisfied).toBe(false);
      expect(result.blockers).toContain("dependency-not-satisfied:#dep-x");
    }
  });

  test("未完了・実行中・状態不明の依存先は依存充足しない", () => {
    const pending = isDependencySatisfied({
      dependencyProviders: [{ issue: "#dep-p", status: "pending" }],
    });
    expect(pending.satisfied).toBe(false);

    const active = isDependencySatisfied({
      dependencyProviders: [{ issue: "#dep-a", status: "active" }],
    });
    expect(active.satisfied).toBe(false);

    const unknown = isDependencySatisfied({
      dependencyProviders: [{ issue: "#dep-u", status: "state-unknown" }],
    });
    expect(unknown.satisfied).toBe(false);
  });

  test("義務投影不完全・検証不能申告の依存先は依存充足しない（停止伝播）", () => {
    const incompleteProjection = isDependencySatisfied({
      dependencyProviders: [
        { ...satisfiedChild("#dep-d"), obligationDefect: "incomplete-projection" },
      ],
    });
    expect(incompleteProjection.satisfied).toBe(false);

    const unverifiable = isDependencySatisfied({
      dependencyProviders: [
        { ...satisfiedChild("#dep-v"), obligationDefect: "unverifiable-verdict" },
      ],
    });
    expect(unverifiable.satisfied).toBe(false);
  });

  test("必須条件未達で完了した依存先は依存充足しない", () => {
    const unmet = isDependencySatisfied({
      dependencyProviders: [
        {
          issue: "#dep-m",
          status: "outcome-determined",
          outcome: "pass",
          ownRequiredConditionsMet: false,
        },
      ],
    });
    expect(unmet.satisfied).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Epic 系: Epic/Root は親の横断義務が成立するまで終了しない
// ---------------------------------------------------------------------------

describe("Epic 系の最終終了判定", () => {
  test("条件を満たした子は完了し、Epic は親横断義務の未完了だけを理由に終了拒否される", () => {
    const children = [satisfiedChild("#3442"), satisfiedChild("#3443")];
    const result = canCloseEpic({
      children,
      crossObligations: [
        { obligationId: "epic-cross-verification", satisfied: false },
      ],
    });
    expect(result.allowed).toBe(false);
    expect(result.blockers).toContain(
      "cross-obligation-unmet:epic-cross-verification",
    );
    // 条件を満たした子自体は blocker にならない（子完了と親横断義務の分離）。
    expect(result.blockers.filter((b) => b.startsWith("child-not-complete:"))).toEqual([]);
  });

  test("親横断義務が成立すれば Epic は終了できる", () => {
    const result = canCloseEpic({
      children: [satisfiedChild("#3442"), satisfiedChild("#3443")],
      crossObligations: [
        { obligationId: "epic-cross-verification", satisfied: true },
      ],
    });
    expect(result.allowed).toBe(true);
  });

  test("未完了子または申告子が残る Epic は横断義務が成立していても終了しない", () => {
    const withPending = canCloseEpic({
      children: [satisfiedChild("#1"), { issue: "#2", status: "pending" }],
      crossObligations: [{ obligationId: "X", satisfied: true }],
    });
    expect(withPending.allowed).toBe(false);
    expect(withPending.blockers).toContain("child-not-complete:#2");

    const withDefect = canCloseEpic({
      children: [
        satisfiedChild("#1"),
        { ...satisfiedChild("#2"), obligationDefect: "unverifiable-verdict" },
      ],
      crossObligations: [{ obligationId: "X", satisfied: true }],
    });
    expect(withDefect.allowed).toBe(false);
    expect(withDefect.blockers).toContain("child-not-complete:#2");
  });

  test("全子完了と親横断義務成立の両方を満たすときのみ Epic が終了する", () => {
    const result = canCloseEpic({
      children: [satisfiedChild("#1"), satisfiedChild("#2"), satisfiedChild("#3")],
      crossObligations: [
        { obligationId: "X-1", satisfied: true },
        { obligationId: "X-2", satisfied: true },
      ],
    });
    expect(result.allowed).toBe(true);
    expect(result.blockers).toEqual([]);
  });
});
