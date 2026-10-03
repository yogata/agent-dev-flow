// 取りまとめ経路の反映実行ランナー。GitHub I/O をアダプタ注入で受け取り、
// 書込み → 読み戻し突合 → 不足分再試行 → 重複防止 → 回復記録生成の一連の
// 実行経路を所有する。アダプタは Custom Tool `agentdev_gh` の操作に対応し、
// 本ランナー自体は I/O を直接行わない（テストでは fixture アダプタに制御された
// 失敗注入を行い、実行経路のロジックを実経路のまま検証する）。

import {
  signedComment,
  type OperationResult,
  type ReflectOperation,
  type ReflectPlan,
  type ReflectReadback,
  type ReconciliationReport,
  reconcileAgainstReadback,
} from "./reconcile.ts";

/** Custom Tool `agentdev_gh` の読み取り・書込み操作に対応する I/O 境界 */
export interface ReflectIo {
  /** issue_read 相当: 本文の読み戻し */
  readIssueBody(issueNumber: number): Promise<string>;
  /** issue_update 相当: 本文の全文置換 */
  updateIssueBody(issueNumber: number, body: string): Promise<void>;
  /** comment_list 相当: コメント列の読み戻し */
  listComments(issueNumber: number): Promise<string[]>;
  /** comment_create 相当: コメント投稿 */
  createComment(issueNumber: number, body: string): Promise<void>;
  /** Epic Issue 本文の読み戻し（Epic 未反映の検出に使用する） */
  readEpicBody(issueNumber: number): Promise<string>;
  /** Epic Issue 本文の更新（Epic テーブル反映。書込みは per-Epic 単一書き手の直列化単位に従う） */
  updateEpicBody(issueNumber: number, body: string): Promise<void>;
}

export interface RunJournalEntry {
  key: string;
  action: "write" | "retry";
  /** 失敗時のエラー要因。成功時は null */
  error: string | null;
}

export interface ReflectRunResult {
  report: ReconciliationReport;
  journal: RunJournalEntry[];
}

/** 初回書込み + 読み戻し後の不足分再試行 1 回。再試行上限を超える反復は行わない */
const MAX_RETRY_ROUNDS = 1;

async function writeOp(op: ReflectOperation, io: ReflectIo): Promise<void> {
  switch (op.kind) {
    case "issue-body":
      return io.updateIssueBody(op.issueNumber, op.content);
    case "issue-comment":
      return io.createComment(op.issueNumber, signedComment(op));
    case "epic-table":
      return io.updateEpicBody(op.issueNumber, op.content);
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** plan に現れる対象の読み戻し結果を収集する */
async function readbackFromIo(plan: ReflectPlan, io: ReflectIo): Promise<ReflectReadback> {
  const bodyTargets = new Set<number>();
  const commentTargets = new Set<number>();
  const epicTargets = new Set<number>();
  for (const op of plan.ops) {
    if (op.kind === "issue-comment") commentTargets.add(op.issueNumber);
    else if (op.kind === "epic-table") epicTargets.add(op.issueNumber);
    else bodyTargets.add(op.issueNumber);
  }
  const bodies: Record<number, string> = {};
  const comments: Record<number, string[]> = {};
  const epicBodies: Record<number, string> = {};
  for (const n of bodyTargets) bodies[n] = await io.readIssueBody(n);
  for (const n of commentTargets) comments[n] = await io.listComments(n);
  for (const n of epicTargets) epicBodies[n] = await io.readEpicBody(n);
  return { bodies, comments, epicBodies };
}

async function reconcileWithIo(plan: ReflectPlan, io: ReflectIo): Promise<ReconciliationReport> {
  return reconcileAgainstReadback(plan, await readbackFromIo(plan, io));
}

/**
 * 反映計画を実行経路どおりに遂行する。
 *
 * 1. 各操作を直列に書き込む。operational 失敗が発生しても他の独立操作を打ち切らず、
 *    失敗を結果に記録して続行する（部分成功の区別の基盤。進捗表示失敗は稼働処理の
 *    終了根拠にならない）
 * 2. 読み戻し突合で反映済み・未反映・重複を確定する
 * 3. 未反映分のみを再試行する。読み戻しで反映済みと確認できた操作は再試行しないため、
 *    応答失敗でも実体が成功していた操作の重複投稿を防止する
 * 4. 再試行後に再突合し、それでも未反映な分の回復用ローカル記録を結果に含める
 */
export async function reflectWithRecovery(plan: ReflectPlan, io: ReflectIo): Promise<ReflectRunResult> {
  const journal: RunJournalEntry[] = [];

  for (const op of plan.ops) {
    try {
      await writeOp(op, io);
      journal.push({ key: op.key, action: "write", error: null });
    } catch (err) {
      journal.push({ key: op.key, action: "write", error: errorMessage(err) });
    }
  }

  let report = await reconcileWithIo(plan, io);

  for (let round = 0; round < MAX_RETRY_ROUNDS && report.pending.length > 0; round += 1) {
    const pendingKeys = new Set(report.pending.map((p) => p.key));
    const retryOps: ReflectOperation[] = plan.ops.filter((o) => pendingKeys.has(o.key));
    for (const op of retryOps) {
      try {
        await writeOp(op, io);
        journal.push({ key: op.key, action: "retry", error: null });
      } catch (err) {
        journal.push({ key: op.key, action: "retry", error: errorMessage(err) });
      }
    }
    report = await reconcileWithIo(plan, io);
  }

  return { report, journal };
}

/** 突合結果から再試行対象の操作（未反映分のみ）を抽出する。中断後の再開経路で使用する */
export function pendingOps(plan: ReflectPlan, report: ReconciliationReport): ReflectOperation[] {
  const pendingKeys = new Set(
    report.pending.map((p: OperationResult) => p.key),
  );
  return plan.ops.filter((o) => pendingKeys.has(o.key));
}
