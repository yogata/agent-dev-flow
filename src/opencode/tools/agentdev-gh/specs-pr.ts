// PR 系操作（5 操作）のスペック実装。
//
// 各スペックは操作ごとの差分（入力検証、runner 要求の組立て、応答解釈、
// 読み戻し照合）のみを所有する。fail-closed の制御順序は engine.ts が所有する。


import {
  prNumber,
  type GhToolRequest,
  type GhToolSuccess,
} from "./contracts.ts";
import type { GhRunner, GhRunnerRequest } from "./runner.ts";
import type { OperationSpec } from "./engine.ts";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function positiveInt(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
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
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const title = str(raw.title);
    const body = str(raw.body);
    const base = str(raw.base);
    const head = str(raw.head);
    if (title === null || body === null || base === null || head === null) return null;
    if (title.length === 0 || base.length === 0 || head.length === 0) return null;
    const request: GhToolRequest = { operation: "pr_create", title, body, base, head };
    if (raw.draft !== undefined && typeof raw.draft !== "boolean") return null;
    if (raw.draft === true) return { ...request, draft: true };
    return request;
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_create" }>;
    return {
      operation: "pr_create",
      args: { title: r.title, body: r.body, base: r.base, head: r.head, draft: r.draft },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !/^https:\/\//.test(url)) return null;
    return { operation: "pr_create", number: prNumber(number), url };
  },
  async verify(runner, request, success) {
    const req = request as Extract<GhToolRequest, { operation: "pr_create" }>;
    const created = success as Extract<GhToolSuccess, { operation: "pr_create" }>;
    const pr = await readPr(runner, created.number);
    if (pr === null) return false;
    return str(pr.title) === req.title && str(pr.state) === "open";
  },
};

// ---------------------------------------------------------------------------
// pr_read
// ---------------------------------------------------------------------------

const prReadSpec: OperationSpec = {
  operation: "pr_read",
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const number = positiveInt(raw.number);
    if (number === null) return null;
    return { operation: "pr_read", number: prNumber(number) };
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
    if (number === null || title === null || state === null || mergeable === null) return null;
    return { operation: "pr_read", number: prNumber(number), title, state, mergeable };
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
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const number = positiveInt(raw.number);
    if (number === null) return null;
    const method = str(raw.method);
    if (method !== "merge" && method !== "squash" && method !== "rebase") return null;
    return { operation: "pr_merge", number: prNumber(number), method };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "pr_merge" }>;
    return { operation: "pr_merge", args: { number: r.number, method: r.method } };
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
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const number = positiveInt(raw.number);
    if (number === null) return null;
    return { operation: "pr_changed_files", number: prNumber(number) };
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
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const number = positiveInt(raw.number);
    if (number === null) return null;
    return { operation: "pr_mergeable", number: prNumber(number) };
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
  async verify(runner, success) {
    const result = success as Extract<GhToolSuccess, { operation: "pr_mergeable" }>;
    const pr = await readPr(runner, result.number);
    return pr !== null && parseMergeable(pr.mergeable) === result.mergeable;
  },
};

/** PR 系操作のスペック一覧。 */
export const PR_OPERATION_SPECS: readonly OperationSpec[] = [
  prCreateSpec,
  prReadSpec,
  prMergeSpec,
  prChangedFilesSpec,
  prMergeableSpec,
];
