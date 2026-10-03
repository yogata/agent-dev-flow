// 取りまとめ反映ランナーへの制御された失敗注入による回帰テスト。
// 注入対象は I/O 境界（ReflectIo の fixture 実装）のみであり、部分成功の発生、
// 読み戻し突合 → 不足分再試行、重複防止、中断・担当交代を挟む未反映保持、
// 進捗表示失敗と稼働処理の分離、回復用ローカル記録の境界を、実行経路のロジック
// （reflectWithRecovery 本体）を実際に駆動して確認する。

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  assertRecoveryRecordBound,
  classifyFailure,
  classifyOutcome,
  planFromRecoveryRecord,
  reflectKey,
  reconcileAgainstReadback,
  signedComment,
  type OperationResult,
  type ReflectPlan,
  type ReflectReadback,
  type ReflectRecoveryRecord,
} from "../lib/reconcile.ts";
import { reflectWithRecovery, type ReflectIo } from "../lib/runner.ts";

// ---------- fixture（GitHub 状態を保持する I/O 境界） ----------

class FixtureGh implements ReflectIo {
  bodies = new Map<number, string>();
  comments = new Map<number, string[]>();
  epicBodies = new Map<number, string>();

  /** 本文書込みを初回のみ失敗させる（応答失敗の注入） */
  failBodyOnce = false;
  private bodyWriteAttempts = 0;
  /** Epic 本文書込みを握り潰す（成功応答しても反映されない注入。Epic のみ未反映を発生させる） */
  swallowEpicWrite = false;
  /** コメント書込みを実行した直後に throw する（実体は成功している応答失敗の注入） */
  failCommentAfterWrite = false;
  commentWriteAttempts = 0;

  async readIssueBody(issueNumber: number): Promise<string> {
    const body = this.bodies.get(issueNumber);
    if (body === undefined) throw new Error(`fixture: issue ${issueNumber} の本文が未設定`);
    return body;
  }

  async updateIssueBody(issueNumber: number, body: string): Promise<void> {
    this.bodyWriteAttempts += 1;
    if (this.failBodyOnce && this.bodyWriteAttempts === 1) {
      throw new Error("fixture 注入: issue_update 初回失敗");
    }
    this.bodies.set(issueNumber, body);
  }

  async listComments(issueNumber: number): Promise<string[]> {
    return this.comments.get(issueNumber) ?? [];
  }

  async createComment(issueNumber: number, body: string): Promise<void> {
    this.commentWriteAttempts += 1;
    const list = this.comments.get(issueNumber) ?? [];
    this.comments.set(issueNumber, [...list, body]);
    if (this.failCommentAfterWrite) {
      throw new Error("fixture 注入: comment_create 応答失敗（実体は反映済み）");
    }
  }

  async readEpicBody(issueNumber: number): Promise<string> {
    const body = this.epicBodies.get(issueNumber);
    if (body === undefined) throw new Error(`fixture: epic ${issueNumber} の本文が未設定`);
    return body;
  }

  async updateEpicBody(issueNumber: number, body: string): Promise<void> {
    if (this.swallowEpicWrite) {
      // 成功応答を返すが反映しない（Epic 書込みが握り潰される注入）
      return;
    }
    this.epicBodies.set(issueNumber, body);
  }
}

// ---------- 共通データ ----------

const CHILD_ISSUE = 4001;
const EPIC_ISSUE = 4000;

const INITIAL_BODY = "## 進行状況\n\n- 初期本文\n";
const CHILD_BODY = "## 進行状況\n\n- 正規状態: 実行継続中（active）\n- 開始日時: 2026-10-04 05:25 JST\n- 終了日時: N/A\n";
const CHILD_COMMENT = "停止: 検証失敗のため。再開条件: 修正後の再検証。\n";
const EPIC_BODY_AFTER = "| Wave | Issue | 前提 | 状態 |\n|---|---|---|---|\n| 1 | #4001 | - | pending |\n";

function makePlan(): ReflectPlan {
  return {
    ops: [
      {
        key: reflectKey({ kind: "issue-comment", issueNumber: CHILD_ISSUE, content: CHILD_COMMENT }),
        kind: "issue-comment",
        issueNumber: CHILD_ISSUE,
        content: CHILD_COMMENT,
      },
      {
        key: reflectKey({ kind: "issue-body", issueNumber: CHILD_ISSUE, content: CHILD_BODY }),
        kind: "issue-body",
        issueNumber: CHILD_ISSUE,
        content: CHILD_BODY,
      },
      {
        key: reflectKey({ kind: "epic-table", issueNumber: EPIC_ISSUE, content: EPIC_BODY_AFTER }),
        kind: "epic-table",
        issueNumber: EPIC_ISSUE,
        content: EPIC_BODY_AFTER,
      },
    ],
  };
}

// ---------- テスト ----------

let tmpRoot: string;

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "adf-reflect-test-"));
});

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("部分成功の区別（成功扱いにしない）", () => {
  test("初回書込み失敗の直後の突合では部分成功が pending として区別される", () => {
    const plan = makePlan();
    const readback: ReflectReadback = {
      // コメントのみ反映済み。本文と Epic は未反映（部分成功の突合場面）
      bodies: { [CHILD_ISSUE]: INITIAL_BODY },
      comments: { [CHILD_ISSUE]: [signedComment(plan.ops[0]!)] },
      epicBodies: {},
    };
    const report = reconcileAgainstReadback(plan, readback);
    expect(report.status).toBe("partial");
    expect(report.confirmed.map((c) => c.key)).toEqual([plan.ops[0]!.key]);
    expect(report.pending.map((p) => p.key)).toEqual([plan.ops[1]!.key, plan.ops[2]!.key]);
    expect(report.recoveryRecord?.ops.map((o) => o.key)).toEqual([plan.ops[1]!.key, plan.ops[2]!.key]);
  });

  test("本文成功・コメント失敗は partial となり成功扱いにならない", async () => {
    const plan = makePlan();
    const gh = new FixtureGh();
    gh.createComment = async (): Promise<void> => {
      throw new Error("fixture 注入: comment_create 恒常失敗");
    };
    gh.bodies.set(CHILD_ISSUE, INITIAL_BODY);
    gh.epicBodies.set(EPIC_ISSUE, EPIC_BODY_AFTER);
    const result = await reflectWithRecovery(plan, gh);
    expect(result.report.status).toBe("partial");
    expect(result.report.confirmed.map((c) => c.key).sort()).toEqual(
      [plan.ops[1]!.key, plan.ops[2]!.key].sort(),
    );
    expect(result.report.pending.map((p) => p.key)).toEqual([plan.ops[0]!.key]);
    expect(result.report.recoveryRecord?.ops.map((o) => o.key)).toEqual([plan.ops[0]!.key]);
  });

  test("Epic のみ未反映は partial となり成功扱いにならない", async () => {
    const plan = makePlan();
    const gh = new FixtureGh();
    gh.swallowEpicWrite = true;
    gh.epicBodies.set(EPIC_ISSUE, INITIAL_BODY); // 書込みが反映されていない旧 Epic 本文
    const result = await reflectWithRecovery(plan, gh);
    expect(result.report.status).toBe("partial");
    expect(result.report.pending.map((p) => p.key)).toEqual([plan.ops[2]!.key]);
    expect(result.report.recoveryRecord?.ops.map((o) => o.key)).toEqual([plan.ops[2]!.key]);
  });
});

describe("読み戻し突合 → 不足分再試行", () => {
  test("不足分のみが再試行され、反映済み分は再書込みされない", async () => {
    const plan = makePlan();
    const gh = new FixtureGh();
    gh.failBodyOnce = true;
    gh.bodies.set(CHILD_ISSUE, INITIAL_BODY);
    gh.epicBodies.set(EPIC_ISSUE, EPIC_BODY_AFTER);
    const result = await reflectWithRecovery(plan, gh);
    expect(result.report.status).toBe("complete");
    // 再試行（retry）は不足分（本文）のみ 1 件
    expect(result.journal.filter((j) => j.action === "retry")).toHaveLength(1);
    expect(result.journal.find((j) => j.action === "retry")?.key).toBe(plan.ops[1]!.key);
    expect(result.report.pending).toHaveLength(0);
    expect(result.report.recoveryRecord).toBeNull();
  });
});

describe("重複投稿・重複実行の防止", () => {
  test("応答失敗でも実体が反映済みのコメントを再投稿しない", async () => {
    const plan = makePlan();
    const gh = new FixtureGh();
    gh.failCommentAfterWrite = true;
    gh.bodies.set(CHILD_ISSUE, CHILD_BODY);
    gh.epicBodies.set(EPIC_ISSUE, EPIC_BODY_AFTER);
    const result = await reflectWithRecovery(plan, gh);
    expect(result.report.status).toBe("complete");
    // コメント書込みは初回 1 回のみ（読み戻し突合で反映済みと確認され再試行されない）
    expect(gh.commentWriteAttempts).toBe(1);
    expect(
      result.journal.filter((j) => j.key === plan.ops[0]!.key && j.action === "retry"),
    ).toHaveLength(0);
  });

  test("同一冪等キーの重複反映は duplicates として検出され再試行対象外になる", () => {
    const op = makePlan().ops[0]!;
    const plan: ReflectPlan = { ops: [op, { ...op }] };
    const report = reconcileAgainstReadback(plan, {
      bodies: {},
      comments: { [CHILD_ISSUE]: [signedComment(op), signedComment(op)] },
      epicBodies: {},
    });
    expect(report.status).toBe("partial");
    expect(report.duplicates).toHaveLength(2);
    expect(report.pending).toHaveLength(0);
    expect(report.recoveryRecord).toBeNull();
  });
});

describe("中断・担当交代を挟む未反映保持", () => {
  test("セッション1の回復記録からセッション2が不足分のみ回復し、未反映情報が失われない", async () => {
    const plan = makePlan();
    // --- セッション1: body が恒常失敗する実行環境 ---
    const gh1 = new FixtureGh();
    gh1.bodies.set(CHILD_ISSUE, INITIAL_BODY);
    gh1.epicBodies.set(EPIC_ISSUE, EPIC_BODY_AFTER);
    gh1.updateIssueBody = async (): Promise<void> => {
      throw new Error("fixture 注入: セッション1 で本文更新が恒常失敗");
    };
    const run1 = await reflectWithRecovery(plan, gh1);
    expect(run1.report.status).toBe("partial");
    const recovery = run1.report.recoveryRecord;
    expect(recovery).not.toBeNull();
    // 中断: 回復用ローカル記録を実行時作業領域へ保存（呼出側の永続化手順）
    const recordPath = path.join(tmpRoot, "reflect-recovery.json");
    fs.writeFileSync(recordPath, JSON.stringify(recovery), "utf8");

    // --- セッション2: 担当交代後の実行環境（コメントは既に反映済みの状態を引き継ぐ） ---
    const saved = JSON.parse(fs.readFileSync(recordPath, "utf8")) as unknown;
    expect(() => assertRecoveryRecordBound(saved)).not.toThrow();
    const resumePlan = planFromRecoveryRecord(saved as ReflectRecoveryRecord);
    // 未反映情報（本文内容）が記録から復元されている
    expect(resumePlan.ops.map((o) => o.key)).toEqual([plan.ops[1]!.key]);
    expect(resumePlan.ops[0]!.content).toBe(CHILD_BODY);

    const gh2 = new FixtureGh();
    gh2.bodies.set(CHILD_ISSUE, INITIAL_BODY);
    gh2.comments.set(CHILD_ISSUE, [signedComment(plan.ops[0]!)]); // セッション1 で反映済みのコメント
    gh2.epicBodies.set(EPIC_ISSUE, EPIC_BODY_AFTER);
    const run2 = await reflectWithRecovery(resumePlan, gh2);
    expect(run2.report.status).toBe("complete");
    // 反映済みコメントを再投稿しない（重複投稿防止が再開経路でも働く）
    expect(gh2.commentWriteAttempts).toBe(0);
  });
});

describe("進捗表示失敗と稼働処理の分離", () => {
  test("進捗表示失敗は稼働処理を強制終了しない", () => {
    const display = classifyFailure("progress-display");
    expect(display.haltOperational).toBe(false);
    const operational = classifyFailure("operational");
    expect(operational.haltOperational).toBe(true);
    // 未反映の重要条件に基づく新作業開始は常に不許可
    expect(display.allowNewWorkOnUnreflected).toBe(false);
    expect(operational.allowNewWorkOnUnreflected).toBe(false);
  });

  test("ある操作の失敗後も他の独立操作の遂行が打ち切られない", async () => {
    const plan = makePlan();
    const gh = new FixtureGh();
    gh.updateIssueBody = async (): Promise<void> => {
      throw new Error("fixture 注入: 本文更新が恒常失敗");
    };
    gh.bodies.set(CHILD_ISSUE, INITIAL_BODY);
    gh.epicBodies.set(EPIC_ISSUE, EPIC_BODY_AFTER);
    const result = await reflectWithRecovery(plan, gh);
    // body 失敗後もコメントと Epic の書込みが遂行されている
    expect(result.journal.filter((j) => j.action === "write")).toHaveLength(3);
    expect(gh.commentWriteAttempts).toBe(1);
  });
});

describe("更新回復用ローカル記録の境界", () => {
  test("許可外フィールド（作業定義・恒久状態語彙）を fail-closed で拒否する", () => {
    const base = {
      schemaVersion: 1,
      recordType: "adf-reflect-recovery",
      ops: [{ key: "r-body-1-aaaaaaaaaaaa", kind: "issue-body", issueNumber: 1, content: "x" }],
    };
    expect(() => assertRecoveryRecordBound(base)).not.toThrow();
    expect(() => assertRecoveryRecordBound({ ...base, acceptanceCriteria: "完了条件の写し" })).toThrow();
    expect(() => assertRecoveryRecordBound({ ...base, workflowState: "running" })).toThrow();
    expect(() =>
      assertRecoveryRecordBound({
        ...base,
        ops: [{ ...base.ops[0]!, verdict: "done" }],
      }),
    ).toThrow();
  });

  test("部分成功の分類単体契約を固定する", () => {
    const confirmed = (key: string): OperationResult => ({
      key,
      kind: "issue-body",
      issueNumber: 1,
      outcome: "confirmed",
    });
    const unconfirmed = (key: string): OperationResult => ({
      key,
      kind: "issue-body",
      issueNumber: 1,
      outcome: "unconfirmed",
    });
    expect(classifyOutcome([]).status).toBe("none");
    expect(classifyOutcome([confirmed("a")]).status).toBe("complete");
    expect(classifyOutcome([confirmed("a"), unconfirmed("b")]).status).toBe("partial");
    expect(classifyOutcome([unconfirmed("b")]).status).toBe("partial");
  });
});
