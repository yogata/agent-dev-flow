//
// 用途別入口・機械確認可能な結果・開始終了時照合のテスト。
// - TS-003: 対象全件の列挙と全文取得の維持（REQ-053-032/041）
// - TS-006: 用途決定と結果の機械確認（REQ-053-047）
// - TS-007: 開始・終了時照合（REQ-053-046）
// - TS-009: 処理量削減と時間短縮（実規則実行数の削減と実測時間）
// - TS-010: 書込み前検査の位置づけ（最終実ファイル確認の代替にならない）

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { invalidateConfigCache } from "../lib/config.ts";
import type { KernelRuleDescriptor } from "../lib/engine-bundle.ts";
import { composeRuleDescriptors } from "../lib/rules.ts";
import type { InspectEnvironment } from "../lib/inspect.ts";
import { acceptForProgress, resolveInspectionPurpose, runDisplay, runInspection, type InspectionRunResult } from "../lib/runs.ts";

const CLEAN = "# 見出し\n\nこれは正常な文章である。\n";
const VIOLATING = "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73が混入している。\n";

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-runs-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
  return root;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeEach(() => {
  invalidateConfigCache();
});

/** 検査の実行中に一時停止できる規則を追加する env（開始・終了時照合の試験用）。 */
function envWithPause(gate: Promise<void>, entered: { value: boolean }): InspectEnvironment {
  const pauseRule = {
    linter: (context: unknown) => {
      const paragraph = (context as { Syntax: Record<string, unknown> }).Syntax.Paragraph as symbol;
      return {
        [paragraph]: async () => {
          entered.value = true;
          await gate;
        },
      };
    },
  } as unknown as KernelRuleDescriptor["rule"];
  return {
    composeRules: (engineResult) => {
      if (!engineResult.ok) throw new Error(engineResult.detail);
      const base = composeRuleDescriptors(engineResult.engine);
      const descriptors: KernelRuleDescriptor[] = [...base.rules, { ruleId: "test-pause", rule: pauseRule, options: {} }];
      return { rules: descriptors, hardRuleIds: base.hardRuleIds, prhRulePaths: base.prhRulePaths };
    },
  };
}

describe("用途決定の決定性（TS-006、REQ-053-047）", () => {
  test("正規契約から用途が決定的に選択される", () => {
    expect(resolveInspectionPurpose({ workflow: "case-run" })).toBe("final");
    expect(resolveInspectionPurpose({ workflow: "docs-check" })).toBe("final");
    expect(resolveInspectionPurpose({ workflow: "case-close" })).toBe("final");
    expect(resolveInspectionPurpose({ workflow: "case-close", requiresIndependentInspection: true })).toBe("independent");
    expect(resolveInspectionPurpose({ workflow: "case-run", requiresIndependentInspection: true })).toBe("independent");
    expect(resolveInspectionPurpose({ workflow: "manual-display" })).toBe("display");
    expect(resolveInspectionPurpose({ workflow: "pre-write-hook" })).toBe("pre-write");
  });
});

describe("通常最終検査の再利用と集約（TS-006/TS-009）", () => {
  test("初回は全件実検査、同一入力の2回目は全件再利用で結果が一致する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN, "docs/v.md": VIOLATING, "docs/c.md": CLEAN });
    const first = await runInspection(root, "final", { maxWorkers: 0 });
    expect(first.completion).toBe("completed");
    expect(first.ruleExecutions.actual).toBe(3);
    expect(first.ruleExecutions.reused).toBe(0);
    expect(first.hardCount).toBeGreaterThan(0);
    expect(first.ok).toBe(false);
    expect(acceptForProgress(first).accepted).toBe(false);

    const second = await runInspection(root, "final", { maxWorkers: 0 });
    expect(second.completion).toBe("completed");
    expect(second.ruleExecutions.actual).toBe(0);
    expect(second.ruleExecutions.reused).toBe(3);
    // 集約結果（指摘本文・ファイル・位置・重大度・合否）は再利用なし実行と一致する
    expect(second.files).toEqual(first.files);
    expect(second.ok).toBe(false);
  });

  test("必須独立検査は保存結果を利用せず対象全件の規則を実行する（TS-005、REQ-053-045）", async () => {
    const root = makeProject({ "docs/a.md": CLEAN, "docs/v.md": VIOLATING });
    const independent = await runInspection(root, "independent", { maxWorkers: 0 });
    expect(independent.completion).toBe("completed");
    expect(independent.ruleExecutions.actual).toBe(2);
    expect(independent.ruleExecutions.reused).toBe(0);
    // final で保存した後の independent も再利用ゼロ
    await runInspection(root, "final", { maxWorkers: 0 });
    const independent2 = await runInspection(root, "independent", { maxWorkers: 0 });
    expect(independent2.ruleExecutions.actual).toBe(2);
    expect(independent2.ruleExecutions.reused).toBe(0);
    expect(independent2.ruleExecutions.actual + independent2.ruleExecutions.reused).toBe(independent2.targetScope.count);
    // 独立要求を満たす結果は進行が許可される（合格条件）
    expect(acceptForProgress(independent2).accepted).toBe(false); // 違反があるため不合格ではある
    const cleanRoot = makeProject({ "docs/a.md": CLEAN, "docs/b.md": "# 見出し\n\n短い文。\n" });
    const cleanIndependent = await runInspection(cleanRoot, "independent", { maxWorkers: 0 });
    expect(acceptForProgress(cleanIndependent).accepted).toBe(true);
  });

  test("結果から用途・対象範囲・対象状態・完了状態・合否・実規則実行数と再利用数が機械的に確認できる（TS-006）", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    const run = await runInspection(root, "final", { maxWorkers: 0 });
    expect(run.schemaVersion).toBe(1);
    expect(run.purpose).toBe("final");
    expect(run.startedInspection).toBe(true);
    expect(run.targetScope.count).toBe(1);
    expect(run.targetScope.targets).toContain("docs/a.md");
    expect(run.targetState.snapshotsMatched).toBe(true);
    expect(run.targetState.startSnapshot).not.toBe("");
    expect(run.targetState.endSnapshot).not.toBe("");
    expect(run.completion).toBe("completed");
    expect(run.ok).toBe(true);
    expect(run.hardCount).toBe(0);
    expect(run.ruleExecutions).toEqual({ actual: 1, reused: 0 });
  });
});

describe("対象全件の列挙と全文取得の維持（TS-003、REQ-053-032/041）", () => {
  test("外部編集・追加・削除・対象設定変更が現在の全件結果に反映される", async () => {
    const root = makeProject({ "docs/a.md": CLEAN, "docs/b.md": CLEAN });
    await runInspection(root, "final", { maxWorkers: 0 });
    // 外部編集: 本文変更で失効し、再検査される（変更一覧ではなく現在入力を根拠にする）
    fs.writeFileSync(path.join(root, "docs", "b.md"), VIOLATING, "utf8");
    const afterEdit = await runInspection(root, "final", { maxWorkers: 0 });
    expect(afterEdit.ruleExecutions.actual).toBe(1);
    expect(afterEdit.ruleExecutions.reused).toBe(1);
    expect(afterEdit.hardCount).toBeGreaterThan(0);
    // 追加: 新対象は列挙に入る
    fs.writeFileSync(path.join(root, "docs", "c.md"), VIOLATING, "utf8");
    const afterAdd = await runInspection(root, "final", { maxWorkers: 0 });
    expect(afterAdd.targetScope.count).toBe(3);
    expect(afterAdd.ruleExecutions.actual).toBe(1);
    expect(afterAdd.ruleExecutions.reused).toBe(2);
    // 削除: 対象から消える
    fs.rmSync(path.join(root, "docs", "c.md"));
    const afterRemove = await runInspection(root, "final", { maxWorkers: 0 });
    expect(afterRemove.targetScope.count).toBe(2);
    expect(afterRemove.targetScope.targets).not.toContain("docs/c.md");
  });

  test("対象解決 0 件は未完了・受理拒否である（fail-closed 維持）", async () => {
    const root = makeProject({ "README.md": CLEAN });
    const run = await runInspection(root, "final", { maxWorkers: 0 });
    expect(run.completion).toBe("incomplete");
    expect(run.targetScope.count).toBe(0);
    expect(acceptForProgress(run).accepted).toBe(false);
    expect(run.detail).toContain("0 target file(s)");
  });
});

describe("開始・終了時照合（TS-007、REQ-053-046）", () => {
  test("検査中の本文変更は未完了として工程の受理を拒否する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN, "docs/b.md": CLEAN });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const entered = { value: false };
    const runPromise = runInspection(root, "final", { env: envWithPause(gate, entered), maxWorkers: 0 });
    while (!entered.value) await sleep(5);
    fs.writeFileSync(path.join(root, "docs", "a.md"), VIOLATING, "utf8");
    release();
    const run = await runPromise;
    expect(run.completion).toBe("incomplete");
    expect(run.targetState.snapshotsMatched).toBe(false);
    expect(acceptForProgress(run).accepted).toBe(false);
    // 変更後の正常な再検査で受理できる
    const rerun = await runInspection(root, "final", { maxWorkers: 0 });
    expect(rerun.completion).toBe("completed");
    expect(rerun.targetState.snapshotsMatched).toBe(true);
    expect(rerun.ok).toBe(false);
    expect(rerun.hardCount).toBeGreaterThan(0);
  });

  test("検査中の対象追加は未完了として受理を拒否する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const entered = { value: false };
    const runPromise = runInspection(root, "final", { env: envWithPause(gate, entered), maxWorkers: 0 });
    while (!entered.value) await sleep(5);
    fs.writeFileSync(path.join(root, "docs", "added.md"), CLEAN, "utf8");
    release();
    const run = await runPromise;
    expect(run.completion).toBe("incomplete");
    expect(run.targetState.snapshotsMatched).toBe(false);
    expect(acceptForProgress(run).accepted).toBe(false);
  });

  test("検査中の対象削除は未完了として受理を拒否する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN, "docs/b.md": CLEAN });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const entered = { value: false };
    const runPromise = runInspection(root, "final", { env: envWithPause(gate, entered), maxWorkers: 0 });
    while (!entered.value) await sleep(5);
    fs.rmSync(path.join(root, "docs", "b.md"));
    release();
    const run = await runPromise;
    expect(run.completion).toBe("incomplete");
    expect(run.targetState.snapshotsMatched).toBe(false);
    expect(acceptForProgress(run).accepted).toBe(false);
  });

  test("検査中の検査条件（プロジェクト辞書）の変更は未完了として受理を拒否する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const entered = { value: false };
    const runPromise = runInspection(root, "final", { env: envWithPause(gate, entered), maxWorkers: 0 });
    while (!entered.value) await sleep(5);
    const prhAbs = path.join(root, ".agentdev", "config", "plugins", "agentdev-textlint-guard-prh.yml");
    fs.mkdirSync(path.dirname(prhAbs), { recursive: true });
    fs.writeFileSync(prhAbs, "version: 1\nrules:\n  - expected: AgentDevFlow\n", "utf8");
    release();
    const run = await runPromise;
    expect(run.completion).toBe("incomplete");
    expect(run.targetState.snapshotsMatched).toBe(false);
    expect(acceptForProgress(run).accepted).toBe(false);
  });

  test("検査中の設定（additional_targets）の変更は未完了として受理を拒否する", async () => {
    const root = makeProject({ "docs/a.md": CLEAN, "notes/n.md": CLEAN });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const entered = { value: false };
    const runPromise = runInspection(root, "final", { env: envWithPause(gate, entered), maxWorkers: 0 });
    while (!entered.value) await sleep(5);
    const configAbs = path.join(root, ".agentdev", "config", "plugins", "agentdev-textlint-guard.yaml");
    fs.mkdirSync(path.dirname(configAbs), { recursive: true });
    fs.writeFileSync(configAbs, "version: 1\nadditional_targets:\n  - notes/**/*.md\n", "utf8");
    release();
    const run = await runPromise;
    expect(run.completion).toBe("incomplete");
    expect(run.targetState.snapshotsMatched).toBe(false);
    expect(acceptForProgress(run).accepted).toBe(false);
  });
});

describe("結果表示の入口（TS-010、REQ-053-047 後段）", () => {
  test("display は検査を起動せず、再表示・再解析だけで検査起動扱いにならない", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    // 直近 run が存在しない場合
    const empty = await runDisplay(root);
    expect(empty.purpose).toBe("display");
    expect(empty.startedInspection).toBe(false);
    expect(acceptForProgress(empty).accepted).toBe(false);
    // final 実行後の display は直近の結果を読み戻す
    const run = await runInspection(root, "final", { maxWorkers: 0 });
    const shown = await runDisplay(root);
    expect(shown.startedInspection).toBe(false);
    expect(shown.completion).toBe(run.completion);
    expect(shown.ok).toBe(run.ok);
    expect(shown.targetScope).toEqual(run.targetScope);
    expect(shown.ruleExecutions).toEqual(run.ruleExecutions);
    // display の結果は進行判定に使えない
    expect(acceptForProgress(shown).accepted).toBe(false);
  });
});

describe("acceptForProgress の受理判定（TS-006）", () => {
  test("不合格・未完了・欠落・不完全出力・不適切な用途の結果で進行が停止する", () => {
    const base: InspectionRunResult = {
      schemaVersion: 1,
      purpose: "final",
      startedInspection: true,
      targetScope: { count: 2, targets: ["docs/a.md", "docs/b.md"] },
      targetState: {
        conditionsTracked: true,
        startSnapshot: "s",
        endSnapshot: "s",
        snapshotsMatched: true,
      },
      completion: "completed",
      ok: true,
      hardCount: 0,
      ruleExecutions: { actual: 1, reused: 1 },
      files: [
        { path: "docs/a.md", findings: [], hardCount: 0 },
        { path: "docs/b.md", findings: [], hardCount: 0 },
      ],
    };
    expect(acceptForProgress(base).accepted).toBe(true);
    // 不合格
    const failing = { ...base, ok: false, hardCount: 2 };
    expect(acceptForProgress(failing).accepted).toBe(false);
    // 未完了
    const incomplete = { ...base, completion: "incomplete" as const, detail: "changed during run" };
    expect(acceptForProgress(incomplete).accepted).toBe(false);
    // 開始終了照合の不一致
    const mismatched = { ...base, targetState: { ...base.targetState, snapshotsMatched: false } };
    expect(acceptForProgress(mismatched).accepted).toBe(false);
    // 対象欠落
    const missing = { ...base, files: [base.files[0]!] };
    expect(acceptForProgress(missing).accepted).toBe(false);
    // 対象 0 件
    const zero = { ...base, targetScope: { count: 0, targets: [] }, files: [] };
    expect(acceptForProgress(zero).accepted).toBe(false);
    // 不適切な用途（display）
    const display = { ...base, purpose: "display" as const, startedInspection: false };
    expect(acceptForProgress(display).accepted).toBe(false);
    // 独立要求を満たさない結果（independent で再利用を含む）は進行しない
    const unqualifiedIndependent = {
      ...base,
      purpose: "independent" as const,
      ruleExecutions: { actual: 1, reused: 1 },
    };
    expect(acceptForProgress(unqualifiedIndependent).accepted).toBe(false);
    // 独立要求を満たす結果は進行が許可される
    const qualifiedIndependent = {
      ...base,
      purpose: "independent" as const,
      ruleExecutions: { actual: 2, reused: 0 },
    };
    expect(acceptForProgress(qualifiedIndependent).accepted).toBe(true);
  });
});

describe("書込み前検査の位置づけ（TS-010）", () => {
  test("最終検査は実ファイルを取得し、書込み前合格の単純継承で最終合格とならない", async () => {
    const root = makeProject({ "docs/a.md": CLEAN });
    // 書込み前検査で CLEAN を通過させたとしても（実際の guardOperation 相当の通過）、
    // 外部書込みによる違反は pre-write を経由しない変更として最終検査で検出される
    fs.writeFileSync(path.join(root, "docs", "b.md"), VIOLATING, "utf8");
    const run = await runInspection(root, "final", { maxWorkers: 0 });
    expect(run.ok).toBe(false);
    expect(run.hardCount).toBeGreaterThan(0);
    expect(acceptForProgress(run).accepted).toBe(false);
    // 逆に、pre-write で拒否された内容がディスクに反映されていなければ最終検査は通る
    const cleanRoot = makeProject({ "docs/a.md": CLEAN });
    const cleanRun = await runInspection(cleanRoot, "final", { maxWorkers: 0 });
    expect(cleanRun.ok).toBe(true);
    expect(acceptForProgress(cleanRun).accepted).toBe(true);
  });
});

describe("処理量削減と時間短縮（TS-009）", () => {
  test("通常再利用は実規則実行数を削減し、実測時間も短縮する（固定入力・複数回測定）", async () => {
    const files: Record<string, string> = {};
    for (let i = 0; i < 20; i += 1) {
      files[`docs/f${i}.md`] = CLEAN;
    }
    const root = makeProject(files);
    // 再利用なし（independent）の実測
    const cold = await measureRuns(root, "independent", 3);
    // 通常再利用（final 2回目以降）の実測
    await runInspection(root, "final", { maxWorkers: 0 });
    const warm = await measureRuns(root, "final", 3);
    // 記録（検証証跡: 計測条件はこのテスト内の固定入力 20 ファイル・逐次実行）
    console.log(
      `[TS-009] no-reuse(min=${cold.min}ms median=${cold.median}ms) reuse(min=${warm.min}ms median=${warm.median}ms)`,
    );
    // 規則実行数の削減は決定的に確認する
    const warmRun = await runInspection(root, "final", { maxWorkers: 0 });
    expect(warmRun.ruleExecutions.actual).toBe(0);
    expect(warmRun.ruleExecutions.reused).toBe(20);
    // 短縮の確認（測定変動を考慮し、複数回測定の最小値比較。未測定の短縮倍率は保証しない）
    expect(warm.min).toBeLessThan(cold.min);
  });
});

async function measureRuns(
  root: string,
  purpose: "final" | "independent",
  times: number,
): Promise<{ readonly min: number; readonly median: number }> {
  const durations: number[] = [];
  for (let i = 0; i < times; i += 1) {
    const startedAt = performance.now();
    const run = await runInspection(root, purpose, { maxWorkers: 0 });
    durations.push(performance.now() - startedAt);
    expect(run.completion).toBe("completed");
  }
  durations.sort((a, b) => a - b);
  const middle = Math.floor(durations.length / 2);
  return {
    min: durations[0]!,
    median: durations.length % 2 === 1 ? durations[middle]! : (durations[middle - 1]! + durations[middle]!) / 2,
  };
}
