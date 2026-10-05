// agentdev-textlint-guard 上限付きワーカープール（REQ-053-048）。
//
// 初回・失効対象・独立検査に必要な規則実行を上限付きワーカーで CPU 並列実行する。
// 単なる非同期呼出しの一括待機ではなく、ワーカープロセス（Bun Worker）ごとの実行である。
// ワーカーはプロセス内で永続化し、エンジン初期化負担（vendor bundle の load）を
// 複数 run と複数ゲート間で償却する。上限はプロセス全体で単一所有し、複数ゲート
// 同時実行でも合計のワーカー数が上限を超えない。
// ワーカー異常・タイムアウト時は該当対象をメイン側の逐次実行へ戻し、未検査対象を
// 欠落させない。逐次実行は既存の共通基盤入口（inspectText）を使うため、
// ワーカー経路と逐次経路の判定は同一である。
// 上限（既定 4）は複数ゲート同時実行時のメモリと初期化負担を見込んだ初期値であり、
// AGENTDEV_TEXTLINT_WORKER_LIMIT（0 = 並列なし）で上書きできる。

import { inspectText, type InspectTextResult, type PreparedInspectionContext } from "../inspect.ts";
import type { FileInspectionResult } from "../results.ts";
import type { WorkerJobMessage, WorkerResultMessage } from "./lint-worker.ts";

export interface ParallelLintJob {
  readonly rel: string;
  readonly text: string;
}

export interface ParallelLintOptions {
  /** 同時実行ワーカー数の上限。0 で逐次実行。 */
  readonly maxWorkers?: number;
  /** 1 ジョブのタイムアウト（ミリ秒）。超過時は逐次実行へ戻す。 */
  readonly timeoutMs?: number;
}

const DEFAULT_JOB_TIMEOUT_MS = 120_000;

/** ワーカー上限の決定（CPU 規模に応じ、複数ゲート同時実行を見込んだ上限 4 で抑制）。 */
export function resolveWorkerLimit(): number {
  const override = process.env.AGENTDEV_TEXTLINT_WORKER_LIMIT;
  if (override !== undefined && override.length > 0) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  const cores = typeof navigator !== "undefined" && navigator.hardwareConcurrency > 0 ? navigator.hardwareConcurrency : 2;
  return Math.min(Math.max(cores - 1, 2), 4);
}

/** 逐次フォールバックが必要な job の解決マーカー（結果欠落を作らないための内部合図）。 */
const SEQUENTIAL_RETRY = "sequential-retry" as const;
type RetryMarker = typeof SEQUENTIAL_RETRY;

interface SharedJob {
  readonly id: number;
  readonly root: string;
  readonly rel: string;
  readonly text: string;
  /** worker への割当済み。pump が同じ job を複数 lane に再配布しないための排他印。 */
  dispatched: boolean;
  resolve: ((result: InspectTextResult | RetryMarker) => void) | null;
  timer: ReturnType<typeof setTimeout> | null;
}

interface SharedLane {
  readonly worker: Worker;
  busy: boolean;
  closed: boolean;
  currentJobId: number | null;
}

interface PoolState {
  readonly lanes: SharedLane[];
  readonly jobs: Map<number, SharedJob>;
  limit: number;
  nextId: number;
}

const pool: PoolState = { lanes: [], jobs: new Map(), limit: 0, nextId: 1 };

function workerUrl(): URL {
  return new URL("./lint-worker.ts", import.meta.url);
}

/** テスト用: 共有ワーカープールを破棄する（テスト間の上限変更・残留 worker を初期化する）。 */
export function disposeWorkerPool(): void {
  for (const lane of pool.lanes) {
    try {
      lane.worker.terminate();
    } catch {
      // 終了済み worker の terminate 失敗は無視
    }
  }
  pool.lanes.length = 0;
  pool.jobs.clear();
  pool.limit = 0;
}

function resolveEffectiveLimit(): number {
  const override = process.env.AGENTDEV_TEXTLINT_WORKER_LIMIT;
  if (override !== undefined && override.length > 0) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return resolveWorkerLimit();
}

function createLane(): SharedLane | null {
  let worker: Worker;
  try {
    worker = new Worker(workerUrl());
  } catch {
    return null;
  }
  const lane: SharedLane = { worker, busy: false, closed: false, currentJobId: null };
  pool.lanes.push(lane);
  worker.onmessage = (event: MessageEvent) => {
    const payload = (event as MessageEvent<WorkerResultMessage>).data;
    if (payload === null || typeof payload !== "object" || payload.kind !== "result") return;
    const job = pool.jobs.get(payload.id);
    if (job === undefined || job.resolve === null) return;
    if (lane.currentJobId !== payload.id) return;
    lane.currentJobId = null;
    lane.busy = false;
    if (job.timer !== null) clearTimeout(job.timer);
    pool.jobs.delete(payload.id);
    const resolve = job.resolve;
    job.resolve = null;
    if (payload.ok) {
      resolve({ ok: true, result: payload.result as FileInspectionResult });
    } else if (payload.failureKind === "context") {
      // ワーカー側の初期化失敗は実検査が行われていないため逐次へ戻す（欠落させない）
      resolve(SEQUENTIAL_RETRY);
    } else {
      // 検査実行の異常終了は検査不能として呼出側へ伝える（fail-closed）
      resolve({ ok: false, detail: payload.detail });
    }
    pump();
  };
  worker.onerror = () => {
    closeLane(lane);
    pump();
  };
  return lane;
}

function closeLane(lane: SharedLane): void {
  if (lane.closed) return;
  lane.closed = true;
  if (lane.currentJobId !== null) {
    const job = pool.jobs.get(lane.currentJobId);
    if (job !== undefined && job.resolve !== null) {
      if (job.timer !== null) clearTimeout(job.timer);
      pool.jobs.delete(job.id);
      const resolve = job.resolve;
      job.resolve = null;
      resolve(SEQUENTIAL_RETRY);
    }
    lane.currentJobId = null;
  }
  lane.busy = false;
  try {
    lane.worker.terminate();
  } catch {
    // 終了済み worker の terminate 失敗は無視
  }
  const index = pool.lanes.indexOf(lane);
  if (index >= 0) pool.lanes.splice(index, 1);
}

function pump(): void {
  if (pool.limit <= 0) return;
  while (pool.jobs.size > 0) {
    const idle = pool.lanes.find((l) => !l.closed && !l.busy);
    let lane: SharedLane | undefined = idle;
    if (lane === undefined) {
      if (pool.lanes.length >= pool.limit) return;
      const created = createLane();
      if (created === null) {
        // ワーカー不可環境: 残り job を逐次フォールバックへ返す（欠落させない）
        for (const job of [...pool.jobs.values()]) {
          if (job.resolve !== null) {
            if (job.timer !== null) clearTimeout(job.timer);
            const resolve = job.resolve;
            job.resolve = null;
            resolve(SEQUENTIAL_RETRY);
          }
        }
        pool.jobs.clear();
        return;
      }
      lane = created;
    }
    let nextJob: SharedJob | undefined;
    for (const job of pool.jobs.values()) {
      if (job.resolve !== null && !job.dispatched) {
        nextJob = job;
        break;
      }
    }
    if (nextJob === undefined || lane === undefined) return;
    nextJob.dispatched = true;
    lane.busy = true;
    lane.currentJobId = nextJob.id;
    const message: WorkerJobMessage = {
      kind: "lint",
      id: nextJob.id,
      root: nextJob.root,
      rel: nextJob.rel,
      text: nextJob.text,
    };
    lane.worker.postMessage(message);
  }
}

/**
 * 実検査対象の規則実行をワーカー並列で実行する。戻り値は全対象をキーとする結果写像
 * （未検査対象の欠落なし。ワーカー異常・タイムアウト対象は逐次実行で完結済み）。
 * context はメイン側の検査準備結果であり、逐次フォールバックと結果形状の単一情報源である。
 */
export async function lintTargetsInParallel(
  context: PreparedInspectionContext,
  jobs: readonly ParallelLintJob[],
  options: ParallelLintOptions = {},
): Promise<Map<string, InspectTextResult>> {
  const results = new Map<string, InspectTextResult>();
  if (jobs.length === 0) return results;
  const requested = options.maxWorkers ?? resolveEffectiveLimit();
  if (requested <= 0 || jobs.length === 1) {
    return lintTargetsSequentially(context, jobs, results);
  }
  pool.limit = Math.max(pool.limit, requested);
  const timeoutMs = options.timeoutMs ?? DEFAULT_JOB_TIMEOUT_MS;

  const promises = jobs.map(
    (job) =>
      new Promise<InspectTextResult | RetryMarker>((resolve) => {
        const sharedJob: SharedJob = {
          id: pool.nextId,
          root: context.root,
          rel: job.rel,
          text: job.text,
          dispatched: false,
          resolve,
          timer: null,
        };
        pool.nextId += 1;
        pool.jobs.set(sharedJob.id, sharedJob);
        sharedJob.timer = setTimeout(() => {
          // タイムアウト: 当該 job を逐次フォールバックへ戻す。抱えていた lane は
          // 応答しない可能性があるため破棄し、後続 job は新 lane で継続する。
          const laneIndex = pool.lanes.findIndex((l) => l.currentJobId === sharedJob.id);
          if (laneIndex >= 0) closeLane(pool.lanes[laneIndex]!);
          if (sharedJob.resolve !== null) {
            const resolveJob = sharedJob.resolve;
            sharedJob.resolve = null;
            pool.jobs.delete(sharedJob.id);
            resolveJob(SEQUENTIAL_RETRY);
          }
          pump();
        }, timeoutMs);
      }),
  );

  pump();
  const values = await Promise.all(promises);

  const sequentialTargets: ParallelLintJob[] = [];
  for (let i = 0; i < jobs.length; i += 1) {
    const job = jobs[i]!;
    const value = values[i]!;
    if (value === SEQUENTIAL_RETRY) {
      sequentialTargets.push(job);
      continue;
    }
    results.set(job.rel, value);
  }
  if (sequentialTargets.length > 0) {
    const sequentialResults = await lintTargetsSequentially(context, sequentialTargets);
    for (const [rel, result] of sequentialResults) results.set(rel, result);
  }
  return results;
}

/** 逐次実行（フォールバック経路。判定は共通基盤入口と同一）。 */
export async function lintTargetsSequentially(
  context: PreparedInspectionContext,
  jobs: readonly ParallelLintJob[],
  results: Map<string, InspectTextResult> = new Map(),
): Promise<Map<string, InspectTextResult>> {
  for (const job of jobs) {
    results.set(job.rel, await inspectText(context.prepared, context.root, job.rel, job.text));
  }
  return results;
}
