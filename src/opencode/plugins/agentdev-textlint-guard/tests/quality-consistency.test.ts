//
// TS-001: 品質一致の成立（REQ-053-041/048）。
// - 固定入力（同一対象集合・同一規則・同一辞書）で、再利用なし実行と再利用あり実行、
//   逐次実行とワーカー並列実行をそれぞれ複数回実行して比較する
// - 合格条件: 指摘本文、ファイル、位置、重大度、合否が全比較で一致し、集約結果の並び順が安定する
// - 29規則と対象範囲が維持され、正常完了した不合格結果の再利用も確認できる

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { invalidateConfigCache } from "../lib/config.ts";
import { inspectAllTargetFiles } from "../lib/inspect.ts";
import { runInspection } from "../lib/runs.ts";
import { composeRuleDescriptors } from "../lib/rules.ts";

const CLEAN = "# 見出し\n\nこれは正常な文章である。\n";
const VIOLATING = "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73が混入している。\n";
const ADVICE = "# 見出し\n\nこれは重要かもしれません。とても長い文章がここに続いており、一文の長さが助言対象の規則に触れるくらいに長くなっている。\n";

function makeCorpusRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-cons-"));
  const docs = path.join(root, "docs", "sub");
  fs.mkdirSync(docs, { recursive: true });
  fs.writeFileSync(path.join(root, "docs", "clean.md"), CLEAN, "utf8");
  fs.writeFileSync(path.join(root, "docs", "violation.md"), VIOLATING, "utf8");
  fs.writeFileSync(path.join(docs, "advice.md"), ADVICE, "utf8");
  fs.writeFileSync(path.join(docs, "clean2.md"), "# 見出し\n\n短い文。別の文。\n", "utf8");
  return root;
}

beforeEach(() => {
  invalidateConfigCache();
});

/** 比較用の正規化（指摘本文、ファイル、位置、重大度、合否。並び順は集約順そのまま）。 */
function normalized(run: Awaited<ReturnType<typeof runInspection>>) {
  return run.files.map((f) => ({
    path: f.path,
    hardCount: f.hardCount,
    findings: f.findings.map((m) => ({
      path: m.path,
      line: m.line,
      column: m.column,
      ruleId: m.ruleId,
      message: m.message,
      severity: m.severity,
    })),
  }));
}

describe("規則と対象範囲の維持（TS-001）", () => {
  test("規則構成は 29 規則（並列化・再利用化に伴う削減・変更を行わない）", async () => {
    const engine = await import("../lib/engine-bundle.ts").then(({ loadEngine }) => loadEngine());
    expect(engine.ok).toBe(true);
    if (!engine.ok) return;
    const composition = composeRuleDescriptors(engine.engine);
    expect(composition.rules).toHaveLength(29);
    expect(composition.hardRuleIds).toHaveLength(5);
  });
});

describe("再利用なし/あり・逐次/並列の品質一致（TS-001）", () => {
  test("複数回の比較で指摘本文・ファイル・位置・重大度・合否が一致し、並び順が安定する", async () => {
    const root = makeCorpusRoot();
    // 再利用なし逐次（基準: 既存の inspectAllTargetFiles = 再利用なし逐次実行）
    const baseline = await inspectAllTargetFiles(root);
    expect(baseline.ok).toBe(true);
    if (!baseline.ok) return;
    const baselineFiles = baseline.outcome.files;
    expect(baselineFiles.map((f) => f.path)).toEqual([...baselineFiles.map((f) => f.path)].sort());

    // 再利用なし逐次実行（independent × 2回）
    const noReuse1 = await runInspection(root, "independent", { maxWorkers: 0 });
    const noReuse2 = await runInspection(root, "independent", { maxWorkers: 0 });
    // 再利用あり逐次実行（final × 2回: 初回実検査 + 2回目全件再利用）
    const reuse1 = await runInspection(root, "final", { maxWorkers: 0 });
    const reuse2 = await runInspection(root, "final", { maxWorkers: 0 });
    // ワーカー並列実行（再利用なし / あり）
    const parallelNoReuse = await runInspection(root, "independent", {});
    const parallelReuse = await runInspection(root, "final", {});

    const runs = [noReuse1, noReuse2, reuse1, reuse2, parallelNoReuse, parallelReuse];
    for (const run of runs) {
      expect(run.completion).toBe("completed");
      // 合否と指摘内容の一致
      expect(normalized(run)).toEqual(
        baselineFiles.map((f) => ({
          path: f.path,
          hardCount: f.hardCount,
          findings: f.findings.map((m) => ({
            path: m.path,
            line: m.line,
            column: m.column,
            ruleId: m.ruleId,
            message: m.message,
            severity: m.severity,
          })),
        })),
      );
      // 対象集合と対象順序（並び順の安定性）
      expect(run.targetScope.targets).toEqual([...baselineFiles.map((f) => f.path)]);
    }
    // 再利用あり実行の実規則実行数（2回目は全件再利用、並列実行も同様）
    expect(reuse2.ruleExecutions.reused).toBe(reuse2.targetScope.count);
    expect(parallelReuse.ruleExecutions.reused).toBe(parallelReuse.targetScope.count);
    // 再利用なし実行の実規則実行数
    expect(noReuse2.ruleExecutions.actual).toBe(noReuse2.targetScope.count);
    expect(parallelNoReuse.ruleExecutions.actual).toBe(parallelNoReuse.targetScope.count);
  });

  test("正常完了した不合格結果も再利用対象である（TS-001/REQ-053-043）", async () => {
    const root = makeCorpusRoot();
    const first = await runInspection(root, "final", { maxWorkers: 0 });
    expect(first.hardCount).toBeGreaterThan(0);
    const second = await runInspection(root, "final", { maxWorkers: 0 });
    expect(second.hardCount).toBe(first.hardCount);
    expect(second.ruleExecutions.reused).toBe(second.targetScope.count);
    expect(second.ok).toBe(false);
    // 再利用された不合格の findings は実検査結果と同一
    expect(second.files).toEqual(first.files);
  });
});
