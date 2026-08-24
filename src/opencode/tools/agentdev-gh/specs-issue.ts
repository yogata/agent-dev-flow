// Issue 系操作（5 操作）のスペック実装。
//
// 各スペックは操作ごとの差分（入力検証、runner 要求の組立て、応答解釈、
// 読み戻し照合）のみを所有する。fail-closed の制御順序は engine.ts が所有する。
// runner への要求・応答の接合形状（payload フィールド）は本ファイルと
// runner 実装（GitHub I/O 移管の後続 Issue）間の契約である。


import {
  issueNumber,
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

function issueReadRequest(number: number): GhRunnerRequest {
  return { operation: "issue_read", args: { number } };
}

async function readIssue(
  runner: GhRunner,
  number: number,
): Promise<Record<string, unknown> | null> {
  const reply = await runner.run(issueReadRequest(number));
  if (!reply.ok || !isRecord(reply.payload)) return null;
  if (positiveInt(reply.payload.number) !== number) return null;
  return reply.payload;
}

function validateIssueBase(
  raw: unknown,
  requiredKeys: readonly string[],
): Record<string, unknown> | null {
  if (!isRecord(raw) || raw.operation === undefined) return null;
  for (const key of requiredKeys) {
    const value = raw[key];
    if (typeof value !== "string" || value.length === 0) return null;
  }
  return raw;
}

// ---------------------------------------------------------------------------
// issue_create
// ---------------------------------------------------------------------------

const issueCreateSpec: OperationSpec = {
  operation: "issue_create",
  validate(raw): GhToolRequest | null {
    const rec = validateIssueBase(raw, ["title", "body"]);
    if (rec === null) return null;
    const title = str(rec.title);
    const body = str(rec.body);
    if (title === null || body === null) return null;
    if (!Array.isArray(rec.labels)) return null;
    if (!rec.labels.every((l) => typeof l === "string")) return null;
    return {
      operation: "issue_create",
      title,
      body,
      labels: rec.labels,
    };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_create" }>;
    return { operation: "issue_create", args: { title: r.title, body: r.body, labels: r.labels } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !/^https:\/\//.test(url)) return null;
    return { operation: "issue_create", number: issueNumber(number), url };
  },
  async verify(runner, request, success) {
    const req = request as Extract<GhToolRequest, { operation: "issue_create" }>;
    const created = success as Extract<GhToolSuccess, { operation: "issue_create" }>;
    const issue = await readIssue(runner, created.number);
    if (issue === null) return false;
    return str(issue.state) === "open" && str(issue.title) === req.title;
  },
};

// ---------------------------------------------------------------------------
// issue_read
// ---------------------------------------------------------------------------

function parseIssueRead(payload: unknown, number: number): GhToolSuccess | null {
  if (!isRecord(payload)) return null;
  const title = str(payload.title);
  const body = str(payload.body);
  const state = str(payload.state);
  if (title === null || body === null) return null;
  if (state !== "open" && state !== "closed") return null;
  if (positiveInt(payload.number) !== number) return null;
  return { operation: "issue_read", number: issueNumber(number), title, body, state };
}

const issueReadSpec: OperationSpec = {
  operation: "issue_read",
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const number = positiveInt(raw.number);
    if (number === null) return null;
    return { operation: "issue_read", number: issueNumber(number) };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_read" }>;
    return issueReadRequest(r.number);
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    return parseIssueRead(payload, number);
  },
  async verify(runner, _request, success) {
    const read = success as Extract<GhToolSuccess, { operation: "issue_read" }>;
    const issue = await readIssue(runner, read.number);
    return issue !== null && str(issue.title) === read.title && str(issue.state) === read.state;
  },
};

// ---------------------------------------------------------------------------
// issue_update
// ---------------------------------------------------------------------------

const issueUpdateSpec: OperationSpec = {
  operation: "issue_update",
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const number = positiveInt(raw.number);
    if (number === null) return null;
    const title = str(raw.title);
    const body = str(raw.body);
    if (title === "" || body === "") return null;
    const request: GhToolRequest = { operation: "issue_update", number: issueNumber(number) };
    if (title === null) {
      if (body === null) return null;
      return { ...request, body };
    }
    if (body === null) return { ...request, title };
    return { ...request, title, body };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_update" }>;
    return { operation: "issue_update", args: { number: r.number, title: r.title, body: r.body } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !/^https:\/\//.test(url)) return null;
    return { operation: "issue_update", number: issueNumber(number), url };
  },
  async verify(runner, request, _success) {
    const req = request as Extract<GhToolRequest, { operation: "issue_update" }>;
    const issue = await readIssue(runner, req.number);
    if (issue === null) return false;
    if (req.title !== undefined && str(issue.title) !== req.title) return false;
    if (req.body !== undefined && str(issue.body) !== req.body) return false;
    return true;
  },
};

// ---------------------------------------------------------------------------
// issue_comment
// ---------------------------------------------------------------------------

const issueCommentSpec: OperationSpec = {
  operation: "issue_comment",
  validate(raw): GhToolRequest | null {
    const rec = validateIssueBase(raw, ["body"]);
    if (rec === null) return null;
    const body = str(rec.body);
    const number = positiveInt(rec.number);
    if (body === null || number === null) return null;
    return { operation: "issue_comment", number: issueNumber(number), body };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_comment" }>;
    return { operation: "issue_comment", args: { number: r.number, body: r.body } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !/^https:\/\//.test(url)) return null;
    return { operation: "issue_comment", number: issueNumber(number), url };
  },
  async verify(runner, _request, success) {
    const commented = success as Extract<GhToolSuccess, { operation: "issue_comment" }>;
    const issue = await readIssue(runner, commented.number);
    return issue !== null && str(issue.state) === "open";
  },
};

// ---------------------------------------------------------------------------
// issue_close
// ---------------------------------------------------------------------------

const issueCloseSpec: OperationSpec = {
  operation: "issue_close",
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const number = positiveInt(raw.number);
    if (number === null) return null;
    const reason = str(raw.reason);
    if (reason === null) return { operation: "issue_close", number: issueNumber(number) };
    if (reason !== "completed" && reason !== "not_planned") return null;
    return { operation: "issue_close", number: issueNumber(number), reason };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_close" }>;
    return { operation: "issue_close", args: { number: r.number, reason: r.reason } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    if (str(payload.state) !== "closed") return null;
    return { operation: "issue_close", number: issueNumber(number), state: "closed" };
  },
  async verify(runner, success) {
    const closed = success as Extract<GhToolSuccess, { operation: "issue_close" }>;
    const issue = await readIssue(runner, closed.number);
    return issue !== null && str(issue.state) === "closed";
  },
};

/** Issue 系操作のスペック一覧。 */
export const ISSUE_OPERATION_SPECS: readonly OperationSpec[] = [
  issueCreateSpec,
  issueReadSpec,
  issueUpdateSpec,
  issueCommentSpec,
  issueCloseSpec,
];
