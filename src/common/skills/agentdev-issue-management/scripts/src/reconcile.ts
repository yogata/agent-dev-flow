// 取りまとめ経路の agentdev_gh 呼出側から実行する読み戻し突合 CLI。
// 反映計画（plan）と読み戻し結果（readback）の JSON を入力に、反映済み・未反映・
// 重複の突合と回復用ローカル記録の生成を行い、結果を stdout へ JSON 出力する。
// 本 CLI は GitHub I/O を行わない（副作用ゼロ。書込みと読み戻しは呼出側が
// Custom Tool `agentdev_gh` 正規経路で実施する）。手順の正は
// agentdev-issue-management の安全手順「取りまとめ反映の部分成功区別と読み戻し再試行」節。
//
// 使い方:
//   bun scripts/src/reconcile.ts --plan <plan.json> --readback <readback.json>
//
// plan JSON: { ops: [{ key?, kind, issueNumber, content }, ...] }（key 省略時は決定的生成）
// readback JSON: { bodies?: { "番号": 本文 }, comments?: { "番号": [コメント] }, epicBodies?: { "番号": 本文 } }
//
// 終了コード: complete で 0、partial / none（部分成功を成功扱いにしない）で 2、入力エラーで 1。

import { parseArgs } from "node:util";
import * as fs from "node:fs";
import {
  assertRecoveryRecordBound,
  reflectKey,
  reconcileAgainstReadback,
  type ReflectKind,
  type ReflectPlan,
  type ReflectReadback,
  type ReflectRecoveryRecord,
} from "../lib/reconcile.ts";

const KINDS: readonly ReflectKind[] = ["issue-body", "issue-comment", "epic-table"];

function fail(message: string): never {
  process.stdout.write(`${JSON.stringify({ ok: false, error: message })}\n`);
  process.exit(1);
}

function readJsonFile(label: string, pathValue: string): unknown {
  let raw: string;
  try {
    raw = fs.readFileSync(pathValue, "utf8");
  } catch (err) {
    return fail(`${label} の読み込みに失敗: ${err instanceof Error ? err.message : String(err)}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    return fail(`${label} の JSON 解析に失敗: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function parsePlan(raw: unknown): ReflectPlan {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return fail("plan はオブジェクトである必要がある");
  }
  const plan = raw as Record<string, unknown>;
  if (!Array.isArray(plan.ops)) {
    return fail("plan.ops は配列である必要がある");
  }
  const ops = plan.ops.map((rawOp, index) => {
    if (typeof rawOp !== "object" || rawOp === null || Array.isArray(rawOp)) {
      return fail(`plan.ops[${index}] はオブジェクトである必要がある`);
    }
    const op = rawOp as Record<string, unknown>;
    const kind = op.kind;
    if (typeof kind !== "string" || !KINDS.includes(kind as ReflectKind)) {
      return fail(`plan.ops[${index}].kind が不正: ${String(kind)}`);
    }
    const issueNumber = op.issueNumber;
    if (!Number.isInteger(issueNumber) || (issueNumber as number) <= 0) {
      return fail(`plan.ops[${index}].issueNumber が不正: ${String(issueNumber)}`);
    }
    if (typeof op.content !== "string") {
      return fail(`plan.ops[${index}].content は文字列である必要がある`);
    }
    const key =
      typeof op.key === "string" && op.key.length > 0
        ? op.key
        : reflectKey({
            kind: kind as ReflectKind,
            issueNumber: issueNumber as number,
            content: op.content as string,
          });
    return {
      key,
      kind: kind as ReflectKind,
      issueNumber: issueNumber as number,
      content: op.content as string,
    };
  });
  return { ops };
}

function parseReadback(raw: unknown): ReflectReadback {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return fail("readback はオブジェクトである必要がある");
  }
  const read = raw as Record<string, unknown>;
  const toNumberKeys = (value: unknown, label: string): Record<number, string> | undefined => {
    if (value === undefined) return undefined;
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return fail(`${label} はオブジェクトである必要がある`);
    }
    const out: Record<number, string> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const n = Number(k);
      if (!Number.isInteger(n) || n <= 0) {
        return fail(`${label} のキーが不正: ${k}`);
      }
      if (typeof v !== "string") {
        return fail(`${label}[${k}] は文字列である必要がある`);
      }
      out[n] = v;
    }
    return out;
  };
  const bodies = toNumberKeys(read.bodies, "readback.bodies");
  const epicBodies = toNumberKeys(read.epicBodies, "readback.epicBodies");
  let comments: Record<number, string[]> | undefined;
  if (read.comments !== undefined) {
    if (typeof read.comments !== "object" || read.comments === null || Array.isArray(read.comments)) {
      return fail("readback.comments はオブジェクトである必要がある");
    }
    comments = {};
    for (const [k, v] of Object.entries(read.comments as Record<string, unknown>)) {
      const n = Number(k);
      if (!Number.isInteger(n) || n <= 0) {
        return fail(`readback.comments のキーが不正: ${k}`);
      }
      if (!Array.isArray(v) || v.some((c) => typeof c !== "string")) {
        return fail(`readback.comments[${k}] は文字列配列である必要がある`);
      }
      comments[n] = v as string[];
    }
  }
  return { bodies: bodies ?? {}, comments: comments ?? {}, epicBodies: epicBodies ?? {} };
}

const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    plan: { type: "string" },
    readback: { type: "string" },
    recovery: { type: "string" },
  },
});
const planPath = args.plan;
const readbackPath = args.readback;
if (!planPath || !readbackPath) {
  fail("使い方: bun scripts/src/reconcile.ts --plan <plan.json> --readback <readback.json>");
}

const plan = parsePlan(readJsonFile("plan", planPath));
const readback = parseReadback(readJsonFile("readback", readbackPath));

const recoveryParam = args.recovery;
let priorRecovery: ReflectRecoveryRecord | null = null;
if (recoveryParam) {
  const raw = readJsonFile("recovery", recoveryParam);
  try {
    assertRecoveryRecordBound(raw);
  } catch (err) {
    fail(`回復記録の境界検証に失敗: ${err instanceof Error ? err.message : String(err)}`);
  }
  priorRecovery = raw as ReflectRecoveryRecord;
}

const report = reconcileAgainstReadback(plan, readback);

// 前回の回復記録（中断・担当交代前の未反映分）との突合が要求された場合は、
// 前回未反映分が今回も未反映のまま残っていないかを結果へ併記する（回復漏れの検出）
let recoveryResidual: string[] = [];
if (priorRecovery) {
  const confirmedKeys = new Set(report.confirmed.map((c) => c.key));
  recoveryResidual = priorRecovery.ops.filter((op) => !confirmedKeys.has(op.key)).map((op) => op.key);
}

process.stdout.write(
  `${JSON.stringify(
    {
      ok: report.status === "complete",
      status: report.status,
      confirmed: report.confirmed,
      pending: report.pending,
      duplicates: report.duplicates,
      recoveryRecord: report.recoveryRecord,
      priorRecoveryKeys: priorRecovery ? priorRecovery.ops.map((op) => op.key) : null,
      recoveryResidual,
    },
    null,
    2,
  )}\n`,
);
if (report.status !== "complete") process.exit(2);
