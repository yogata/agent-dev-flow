//
// TS-008: 並列実行の堅牢性（REQ-053-048）。
// - ワーカー並列実行の結果は逐次実行と一致する（上限内の CPU 並列実行）
// - ワーカー異常・タイムアウト時に未検査対象を欠落させない
// - 複数ゲート同時実行で完結性が維持される
// - 上限は AGENTDEV_TEXTLINT_WORKER_LIMIT と resolveWorkerLimit で管理する

import { describe, expect, test, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { invalidateConfigCache } from "../lib/config.ts";
import { prepareInspectionContext } from "../lib/inspect.ts";
import { runInspection } from "../lib/runs.ts";
import { lintTargetsInParallel, lintTargetsSequentially, resolveWorkerLimit } from "../lib/workers/pool.ts";

const CLEAN = "# 見出し\n\nこれは正常な文章である。\n";
const VIOLATING = "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73が混入している。\n";

function makeProject(count: number, heavy: boolean = false): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-par-"));
  const abs = path.join(root, "docs");
  fs.mkdirSync(abs, { recursive: true });
  for (let i = 0; i < count; i += 1) {
    const violation = i % 3 === 0 ? VIOLATING : "";
    const body = heavy ? HEAVY_BODY : CLEAN;
    fs.writeFileSync(path.join(abs, `f${i}.md`), violation.length > 0 ? `${body}\n${violation}` : body, "utf8");
  }
  return root;
}

/** 実 corpus に近い重み（数十段落）の文書。並列短縮の計測は小文書では配布オーバーヘッドが支配的になるため使用する。 */
const HEAVY_BODY = `# 計測用文書\n\n${Array.from({ length: 40 }, (_, i) => `段落${i + 1}である。これは計測用の本文であり、正常な文章として規則構成の実行量を確保するために繰り返される。短めの文を複数並べ、実 corpus の規則実行コストに近づける。`).join("\n\n")}\n`;

beforeEach(() => {
  invalidateConfigCache();
});

describe("ワーカー並列実行と逐次実行の一致（TS-008、TS-001 の逐次/並列比較）", () => {
  test("上限内の CPU 並列実行は逐次実行と同一の結果を返す", async () => {
    const root = makeProject(9);
    const context = await prepareInspectionContext(root);
    expect(context.ok).toBe(true);
    if (!context.ok) return;
    const jobs = [...context.context.prepared.config.additionalTargets, "docs/**"].length >= 0
      ? fs.readdirSync(path.join(root, "docs")).map((n) => ({ rel: `docs/${n}`, text: fs.readFileSync(path.join(root, "docs", n), "utf8") }))
      : [];
    const sequential = await lintTargetsSequentially(context.context, jobs);
    const parallel = await lintTargetsInParallel(context.context, jobs, { timeoutMs: 120_000 });
    expect(parallel.size).toBe(jobs.length);
    for (const job of jobs) {
      const seqResult = sequential.get(job.rel);
      const parResult = parallel.get(job.rel);
      expect(parResult).toBeDefined();
      expect(seqResult).toBeDefined();
      if (parResult === undefined || seqResult === undefined) return;
      expect(parResult.ok).toBe(seqResult.ok);
      if (parResult.ok && seqResult.ok) {
        expect(parResult.result).toEqual(seqResult.result);
      }
    }
  });
});

describe("ワーカー異常・タイムアウト時の未検査対象の欠落防止（TS-008）", () => {
  test("タイムアウトした対象は逐次実行へ戻され、未検査対象が欠落しない", async () => {
    const root = makeProject(4);
    const context = await prepareInspectionContext(root);
    expect(context.ok).toBe(true);
    if (!context.ok) return;
    const jobs = fs
      .readdirSync(path.join(root, "docs"))
      .map((n) => {
        const text = fs.readFileSync(path.join(root, "docs", n), "utf8");
        return { rel: `docs/${n}`, text, expectedHard: text.includes(VIOLATING) ? 1 : 0 };
      });
    // タイムアウト 1ms は全ワーカー job をタイムアウトさせる。逐次フォールバックで完結する。
    const results = await lintTargetsInParallel(context.context, jobs, { timeoutMs: 1 });
    expect(results.size).toBe(jobs.length);
    for (const job of jobs) {
      const result = results.get(job.rel);
      expect(result).toBeDefined();
      if (result === undefined) continue;
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(result.result.hardCount).toBe(job.expectedHard);
    }
  });
});

describe("複数ゲート同時実行（TS-008）", () => {
  test("複数の runInspection の同時実行はそれぞれ完結し、結果が一致する", async () => {
    const root1 = makeProject(4);
    const root2 = makeProject(4);
    const [run1a, run2a] = await Promise.all([
      runInspection(root1, "final", { maxWorkers: 2 }),
      runInspection(root2, "final", { maxWorkers: 2 }),
    ]);
    expect(run1a.completion).toBe("completed");
    expect(run2a.completion).toBe("completed");
    expect(run1a.ruleExecutions.actual).toBe(4);
    expect(run2a.ruleExecutions.actual).toBe(4);
    const [run1b, run2b] = await Promise.all([
      runInspection(root1, "final", { maxWorkers: 2 }),
      runInspection(root2, "final", { maxWorkers: 2 }),
    ]);
    expect(run1b.ruleExecutions.reused).toBe(4);
    expect(run2b.ruleExecutions.reused).toBe(4);
    // 同時実行後の再利用結果は初回実行の結果と一致する（混線なし）
    expect(run1b.files).toEqual(run1a.files);
    expect(run2b.files).toEqual(run2a.files);
  });
});

describe("ワーカー上限の決定（TS-008）", () => {
  test("上限は CPU 規模に応じ、複数ゲート同時実行を見込んだ抑制値を返す", () => {
    const limit = resolveWorkerLimit();
    expect(limit).toBeGreaterThanOrEqual(2);
    expect(limit).toBeLessThanOrEqual(4);
    // 環境変数の上書き（0 = 逐次）
    process.env.AGENTDEV_TEXTLINT_WORKER_LIMIT = "0";
    expect(resolveWorkerLimit()).toBe(0);
    process.env.AGENTDEV_TEXTLINT_WORKER_LIMIT = "8";
    expect(resolveWorkerLimit()).toBe(8);
    delete process.env.AGENTDEV_TEXTLINT_WORKER_LIMIT;
  });
});

describe("全件実計算の並列短縮（TS-009）", () => {
  test(
    "全件実計算（再利用なし）のワーカー並列は逐次より短縮する（固定入力・複数回測定）",
    async () => {
      const root = makeProject(60, true);
      const sequential = await measure(root, 2, 0);
      const parallel = await measure(root, 2, undefined);
      console.log(
        `[TS-009] all-recompute sequential(min=${sequential.min}ms median=${sequential.median}ms) parallel(min=${parallel.min}ms median=${parallel.median}ms)`,
      );
      // 短縮の確認（複数回測定の最小値比較。未測定の短縮倍率は保証しない）
      expect(parallel.min).toBeLessThan(sequential.min);
      // 品質の一致（測定変動だけを短縮成功としない）
      expect(parallel.run.hardCount).toBe(sequential.run.hardCount);
      expect(parallel.run.ruleExecutions.actual).toBe(60);
    },
    { timeout: 60_000 },
  );
});

async function measure(
  root: string,
  times: number,
  maxWorkers: number | undefined,
): Promise<{ readonly min: number; readonly median: number; readonly run: Awaited<ReturnType<typeof runInspection>> }> {
  const durations: number[] = [];
  let last: Awaited<ReturnType<typeof runInspection>> | null = null;
  for (let i = 0; i < times; i += 1) {
    const startedAt = performance.now();
    const run = await runInspection(root, "independent", maxWorkers === undefined ? {} : { maxWorkers });
    durations.push(performance.now() - startedAt);
    last = run;
    expect(run.completion).toBe("completed");
  }
  durations.sort((a, b) => a - b);
  const middle = Math.floor(durations.length / 2);
  return {
    min: durations[0]!,
    median: durations.length % 2 === 1 ? durations[middle]! : (durations[middle - 1]! + durations[middle]!) / 2,
    run: last!,
  };
}
