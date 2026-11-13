// PR 系操作（6 操作）のスペック実装。
//
// 各スペックは操作ごとの差分（操作固有の入力検査、runner 要求の組立て、応答解釈、
// 読み戻し照合）のみを所有する。操作名称・必須・型・enum 値域の定型入力検査は
// 正本 operation-catalog.ts の validateOperationInput を消費する（B3-5c 一元化）。
// fail-closed の制御順序は engine.ts が所有する。


import {
  normalizeHeadRef,
  prNumber,
  type GhToolRequest,
  type GhToolSuccess,
} from "./contracts.ts";
import type { GhRunner, GhRunnerRequest } from "./runner.ts";
import type { OperationSpec, ValidateOutcome } from "./engine.ts";
import { validateOperationInput } from "./operation-catalog.ts";

/**
 * pr_create 読戻し照合の body 正規化。改行コード（CRLF→LF）と末尾改行は
 * 物理表現の差異として吸収し、正規化後の論理値で比較する（Design
 * 「対象操作の境界」節の pr_create 読戻し照合条項。head の物理表現正規化と
 * 同一の規律）。
 */
function normalizeCreateBody(v: string): string {
  return v.replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function positiveInt(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
}

// 出力 URL: GitHub 実装は https URL、Local 実装（Case ファイル）は絶対パスを識別子として返す（GitHub 実装と差し替え可能な Local 実装契約条項）。
function isAcceptedUrl(v: string): boolean {
  return /^https:\/\//.test(v) || v.startsWith("/") || /^[A-Za-z]:[\\/]/.test(v);
}

function parseMergeable(v: unknown): "MERGEABLE" | "CONFLICTING" | "UNKNOWN" | null {
  if (v === "MERGEABLE" || v === "CONFLICTING" || v === "UNKNOWN") return v;
  return null;
}

function prReadRequest(number: number): GhRunnerRequest {
  return { operation: "pr_read", args: { number } };
}

async function readPr(
  runner: GhRunner,
  number: number,
): Promise<Record<string, unknown> | null> {
  const reply = await runner.run(prReadRequest(number));
  if (!reply.ok || !isRecord(reply.payload)) return null;
  if (positiveInt(reply.payload.number) !== number) return null;
  return reply.payload;
}

function parsePrState(v: unknown): "open" | "closed" | "merged" | null {
  if (v === "open" || v === "closed" || v === "merged") return v;
  return null;
}

// ---------------------------------------------------------------------------
// pr_create
// ---------------------------------------------------------------------------

const prCreateSpec: OperationSpec = {
  operation: "pr_create",
  validate(raw): ValidateOutcome {
    const declared = validateOperationInput("pr_create", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    // 対象識別（number）は公開契約上は任意。Local 実装は runner 境界で必須検証する
    // （実行時検証が公開スキーマより厳密であることを許容する入力契約条項）。
    const request: {
      operation: "pr_create";
      title: string;
      body: string;
      base: string;
      head: string;
      number?: number;
    } = {
      operation: "pr_create",
      title: record.title as string,
      body: record.body as string,
      base: record.base as string,
      head: record.head as string,
    };
    if (record.number !== undefined) request.number = record.number as number;
    return { ok: true, request };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_create" }>;
    return {
      operation: "pr_create",
      args: {
        title: r.title,
        body: r.body,
        base: r.base,
        head: r.head,
        ...(r.number !== undefined ? { number: r.number } : {}),
      },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !isAcceptedUrl(url)) return null;
    return { operation: "pr_create", number: prNumber(number), url };
  },
  async verify(runner, request, success) {
    const req = request as Extract<GhToolRequest, { operation: "pr_create" }>;
    const created = success as Extract<GhToolSuccess, { operation: "pr_create" }>;
    const pr = await readPr(runner, created.number);
    if (pr === null) return false;
    // 読戻し照合: base・head・body の3項目の一致を必須とし、いずれか1項目の
    // 不一致も成功確認を拒否する。head の物理表現（短縮形式 / owner:branch）は
    // 正規化後の論理値で比較する。runner が取得情報（base・head・createBody）を
    // 返さない場合は検証未了として成功を返さない（fail-closed）。
    const base = str(pr.base);
    const head = str(pr.head);
    const createBody = str(pr.createBody);
    if (base === null || head === null || createBody === null) return false;
    return (
      base === req.base &&
      normalizeHeadRef(head) === normalizeHeadRef(req.head) &&
      normalizeCreateBody(createBody) === normalizeCreateBody(req.body) &&
      str(pr.title) === req.title &&
      str(pr.state) === "open"
    );
  },
};

// ---------------------------------------------------------------------------
// pr_read
// ---------------------------------------------------------------------------

const prReadSpec: OperationSpec = {
  operation: "pr_read",
  validate(raw): ValidateOutcome {
    const declared = validateOperationInput("pr_read", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return { ok: true, request: { operation: "pr_read", number: prNumber(record.number as number) } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_read" }>;
    return prReadRequest(r.number);
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const title = str(payload.title);
    const state = parsePrState(payload.state);
    const mergeable = parseMergeable(payload.mergeable);
    const body = str(payload.body);
    if (typeof payload.isDraft !== "boolean") return null;
    if (number === null || title === null || state === null || mergeable === null) return null;
    if (body === null) return null;
    return {
      operation: "pr_read",
      number: prNumber(number),
      title,
      body,
      state,
      mergeable,
      isDraft: payload.isDraft,
    };
  },
  async verify(runner, _request, success) {
    const read = success as Extract<GhToolSuccess, { operation: "pr_read" }>;
    const pr = await readPr(runner, read.number);
    return pr !== null && str(pr.title) === read.title && parsePrState(pr.state) === read.state;
  },
};

// ---------------------------------------------------------------------------
// pr_merge
// ---------------------------------------------------------------------------

const prMergeSpec: OperationSpec = {
  operation: "pr_merge",
  validate(raw): ValidateOutcome {
    const declared = validateOperationInput("pr_merge", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    const request: {
      operation: "pr_merge";
      number: ReturnType<typeof prNumber>;
      method: "merge" | "squash" | "rebase";
      commitHash?: string;
    } = {
      operation: "pr_merge",
      number: prNumber(record.number as number),
      method: record.method as "merge" | "squash" | "rebase",
    };
    // commitHash は任意フィールド（ローカル版の取り込み確認情報）。
    // 指定時は非空文字列のみ受理し、GitHub 版 runner は値をマージ動作に使用しない。
    if (record.commitHash !== undefined) request.commitHash = record.commitHash as string;
    return { ok: true, request };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_merge" }>;
    return {
      operation: "pr_merge",
      args: {
        number: r.number,
        method: r.method,
        ...(r.commitHash !== undefined ? { commitHash: r.commitHash } : {}),
      },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    if (payload.merged !== true) return null;
    return { operation: "pr_merge", number: prNumber(number), merged: true };
  },
  async verify(runner, _request, success) {
    const merged = success as Extract<GhToolSuccess, { operation: "pr_merge" }>;
    const pr = await readPr(runner, merged.number);
    return pr !== null && parsePrState(pr.state) === "merged";
  },
};

// ---------------------------------------------------------------------------
// pr_changed_files
// ---------------------------------------------------------------------------

const prChangedFilesSpec: OperationSpec = {
  operation: "pr_changed_files",
  validate(raw): ValidateOutcome {
    const declared = validateOperationInput("pr_changed_files", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return {
      ok: true,
      request: { operation: "pr_changed_files", number: prNumber(record.number as number) },
    };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_changed_files" }>;
    return { operation: "pr_changed_files", args: { number: r.number } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    if (!Array.isArray(payload.files)) return null;
    if (!payload.files.every((f) => typeof f === "string" && f.length > 0)) return null;
    return { operation: "pr_changed_files", number: prNumber(number), files: payload.files };
  },
  async verify(runner, success) {
    const changed = success as Extract<GhToolSuccess, { operation: "pr_changed_files" }>;
    const pr = await readPr(runner, changed.number);
    return pr !== null;
  },
};

// ---------------------------------------------------------------------------
// pr_mergeable
// ---------------------------------------------------------------------------

const prMergeableSpec: OperationSpec = {
  operation: "pr_mergeable",
  validate(raw): ValidateOutcome {
    const declared = validateOperationInput("pr_mergeable", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return {
      ok: true,
      request: { operation: "pr_mergeable", number: prNumber(record.number as number) },
    };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_mergeable" }>;
    return { operation: "pr_mergeable", args: { number: r.number } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const mergeable = parseMergeable(payload.mergeable);
    if (number === null || mergeable === null) return null;
    return { operation: "pr_mergeable", number: prNumber(number), mergeable };
  },
  async verify(_runner, request, success) {
    // 時間変動 READ 値のため、直後の再読取との一致確認は行わない。
    // 単一読取の正規化結果（UNKNOWN を含む）と要求番号の一致のみを確認する。
    const req = request as Extract<GhToolRequest, { operation: "pr_mergeable" }>;
    const result = success as Extract<GhToolSuccess, { operation: "pr_mergeable" }>;
    return result.number === req.number;
  },
};

// ---------------------------------------------------------------------------
// pr_update（title と body の項目単位部分更新）
// ---------------------------------------------------------------------------

const prUpdateSpec: OperationSpec = {
  operation: "pr_update",
  validate(raw): ValidateOutcome {
    const declared = validateOperationInput("pr_update", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    if (record.title === undefined && record.body === undefined) {
      return {
        ok: false,
        error: {
          code: "empty-update",
          field: "title",
          detail: "specify at least one of title, body",
        },
      };
    }
    const request = {
      operation: "pr_update",
      number: prNumber(record.number as number),
    } as {
      operation: "pr_update";
      number: ReturnType<typeof prNumber>;
      title?: string;
      body?: string;
    };
    if (record.title !== undefined) request.title = record.title as string;
    if (record.body !== undefined) request.body = record.body as string;
    return { ok: true, request };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_update" }>;
    return {
      operation: "pr_update",
      args: { number: r.number, title: r.title, body: r.body },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !isAcceptedUrl(url)) return null;
    return { operation: "pr_update", number: prNumber(number), url };
  },
  async verify(runner, request, _success) {
    const req = request as Extract<GhToolRequest, { operation: "pr_update" }>;
    const pr = await readPr(runner, req.number);
    if (pr === null) return false;
    if (req.title !== undefined && str(pr.title) !== req.title) return false;
    if (req.body !== undefined && str(pr.body) !== req.body) return false;
    return true;
  },
};

/** PR 系操作のスペック一覧。 */
export const PR_OPERATION_SPECS: readonly OperationSpec[] = [
  prCreateSpec,
  prReadSpec,
  prMergeSpec,
  prChangedFilesSpec,
  prMergeableSpec,
  prUpdateSpec,
];
