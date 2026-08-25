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
  type IssueCommentSummary,
  type IssueListItem,
} from "./contracts.ts";
import type { GhRunner, GhRunnerRequest } from "./runner.ts";
import type { OperationSpec } from "./engine.ts";
import {
  deriveKind,
  deriveRole,
  deriveTrackingState,
  parseIssueRole,
  parseTrackingKind,
  parseTrackingState,
  stripTrackingLabels,
  type CloseReason,
  type IssueRole,
  type TrackingKind,
  type TrackingState,
} from "./tracking-schema.ts";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function positiveInt(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
}

function stringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  return v.every((l) => typeof l === "string") ? [...v] : null;
}

function parseRole(v: unknown): IssueRole | null {
  return parseIssueRole(v);
}

function parseKind(v: unknown): TrackingKind | null {
  return parseTrackingKind(v);
}

function parseState(v: unknown): TrackingState | null {
  return parseTrackingState(v);
}

function parseCloseReason(v: unknown): CloseReason | null {
  return v === "completed" || v === "not_planned" ? v : null;
}

/** issue_read / issue_list 共通の追跡Issueメタデータ導出（応答の自己整合の部品）。 */
function parseTrackingMeta(rec: Record<string, unknown>): {
  role: IssueRole;
  kind: TrackingKind | null;
  trackingState: TrackingState | null;
  closeReason: CloseReason | null;
} | null {
  const labels = stringArray(rec.labels);
  if (labels === null) return null;
  const state = str(rec.state);
  if (state !== "open" && state !== "closed") return null;
  const roleAbsent = rec.role === undefined || rec.role === null;
  const explicitRole = roleAbsent ? null : parseRole(rec.role);
  if (!roleAbsent && explicitRole === null) return null;
  const role = explicitRole ?? deriveRole(labels);
  const kindAbsent = rec.kind === undefined || rec.kind === null;
  const explicitKind = kindAbsent ? null : parseKind(rec.kind);
  if (!kindAbsent && explicitKind === null) return null;
  const stateAbsent = rec.trackingState === undefined || rec.trackingState === null;
  const explicitState = stateAbsent ? null : parseState(rec.trackingState);
  if (!stateAbsent && explicitState === null) return null;
  const reasonAbsent = rec.closeReason === undefined || rec.closeReason === null;
  const explicitReason = reasonAbsent ? null : parseCloseReason(rec.closeReason);
  if (!reasonAbsent && explicitReason === null) return null;
  const derived = deriveTrackingState(labels, state, str(rec.stateReason));
  if (role !== "tracking") {
    return { role: "case", kind: null, trackingState: null, closeReason: null };
  }
  return {
    role,
    kind: explicitKind ?? deriveKind(labels),
    trackingState: explicitState ?? derived.trackingState,
    closeReason: derived.closeReason ?? explicitReason,
  };
}

// 出力 URL: GitHub 実装は https URL、Local 実装（Case ファイル）は絶対パスを識別子として返す（REQ-011-006）。
function isAcceptedUrl(v: string): boolean {
  return /^https:\/\//.test(v) || v.startsWith("/") || /^[A-Za-z]:[\\/]/.test(v);
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
    const request: GhToolRequest = {
      operation: "issue_create",
      title,
      body,
      labels: rec.labels,
    };
    if (rec.role !== undefined) {
      const role = parseRole(rec.role);
      if (role === null) return null;
      if (role !== "tracking" && rec.kind !== undefined) return null;
      (request as { role?: "tracking" | "case" }).role = role;
    }
    if (rec.kind !== undefined) {
      const kind = parseKind(rec.kind);
      if (kind === null) return null;
      (request as { kind?: TrackingKind }).kind = kind;
    }
    return request;
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_create" }>;
    return {
      operation: "issue_create",
      args: {
        title: r.title,
        body: r.body,
        labels: r.labels,
        role: r.role ?? "case",
        kind: r.kind,
      },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !isAcceptedUrl(url)) return null;
    return { operation: "issue_create", number: issueNumber(number), url };
  },
  async verify(runner, request, success) {
    const req = request as Extract<GhToolRequest, { operation: "issue_create" }>;
    const created = success as Extract<GhToolSuccess, { operation: "issue_create" }>;
    const issue = await readIssue(runner, created.number);
    if (issue === null) return false;
    if (str(issue.state) !== "open" || str(issue.title) !== req.title) return false;
    if (req.role === "tracking") {
      if (parseRole(issue.role) !== "tracking") return false;
      if (req.kind !== undefined && parseKind(issue.kind) !== req.kind) return false;
    }
    return true;
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
  const meta = parseTrackingMeta(payload);
  if (meta === null) return null;
  const labels = stringArray(payload.labels);
  if (labels === null) return null;
  return {
    operation: "issue_read",
    number: issueNumber(number),
    title,
    body,
    state,
    labels,
    role: meta.role,
    kind: meta.kind,
    trackingState: meta.trackingState,
    closeReason: meta.closeReason,
  };
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
    return (
      issue !== null &&
      str(issue.title) === read.title &&
      str(issue.state) === read.state &&
      parseRole(issue.role) === read.role
    );
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
    const labels = raw.labels === undefined ? null : stringArray(raw.labels);
    if (raw.labels !== undefined && labels === null) return null;
    const kind = raw.kind === undefined ? null : parseKind(raw.kind);
    if (raw.kind !== undefined && kind === null) return null;
    const trackingState =
      raw.trackingState === undefined ? null : parseState(raw.trackingState);
    if (raw.trackingState !== undefined && trackingState === null) return null;
    if (trackingState === "closed") return null;
    const request = {
      operation: "issue_update",
      number: issueNumber(number),
    } as {
      operation: "issue_update";
      number: ReturnType<typeof issueNumber>;
      title?: string;
      body?: string;
      labels?: string[];
      kind?: TrackingKind;
      trackingState?: Exclude<TrackingState, "closed">;
    };
    if (title !== null) request.title = title;
    if (body !== null) request.body = body;
    if (labels !== null) request.labels = labels;
    if (kind !== null) request.kind = kind;
    if (trackingState !== null) request.trackingState = trackingState;
    if (
      title === null && body === null && labels === null &&
      kind === null && trackingState === null
    ) {
      return null;
    }
    return request;
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_update" }>;
    return {
      operation: "issue_update",
      args: {
        number: r.number,
        title: r.title,
        body: r.body,
        labels: r.labels,
        kind: r.kind,
        trackingState: r.trackingState,
      },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    const url = str(payload.url);
    if (number === null || url === null || !isAcceptedUrl(url)) return null;
    return { operation: "issue_update", number: issueNumber(number), url };
  },
  async verify(runner, request, _success) {
    const req = request as Extract<GhToolRequest, { operation: "issue_update" }>;
    const issue = await readIssue(runner, req.number);
    if (issue === null) return false;
    if (req.title !== undefined && str(issue.title) !== req.title) return false;
    if (req.body !== undefined && str(issue.body) !== req.body) return false;
    if (req.kind !== undefined || req.trackingState !== undefined) {
      if (parseRole(issue.role) !== "tracking") return false;
      if (req.kind !== undefined && parseKind(issue.kind) !== req.kind) return false;
      if (
        req.trackingState !== undefined &&
        parseState(issue.trackingState) !== req.trackingState
      ) {
        return false;
      }
    }
    if (req.labels !== undefined) {
      const current = stringArray(issue.labels);
      if (current === null) return false;
      const kept = stripTrackingLabels(current).sort().join("\n");
      const wanted = [...req.labels].sort().join("\n");
      if (kept !== wanted) return false;
    }
    return true;
  },
};

// ---------------------------------------------------------------------------
// issue_comment（body あり: コメント追加 / body なし: コメント読取）
// ---------------------------------------------------------------------------

function parseCommentList(raw: unknown): IssueCommentSummary[] | null {
  if (!Array.isArray(raw)) return null;
  const comments: IssueCommentSummary[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) return null;
    const body = str(entry.body);
    if (body === null) return null;
    const createdAt = str(entry.createdAt);
    const url = str(entry.url);
    comments.push({ body, createdAt, url });
  }
  return comments;
}

const issueCommentSpec: OperationSpec = {
  operation: "issue_comment",
  validate(raw): GhToolRequest | null {
    const rec = validateIssueBase(raw, []);
    if (rec === null) return null;
    const number = positiveInt(rec.number);
    if (number === null) return null;
    if (rec.body === undefined) {
      return { operation: "issue_comment", number: issueNumber(number) };
    }
    const body = str(rec.body);
    if (body === null || body.length === 0) return null;
    return { operation: "issue_comment", number: issueNumber(number), body };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_comment" }>;
    return { operation: "issue_comment", args: { number: r.number, body: r.body } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    if (payload.comments === undefined) {
      const url = str(payload.url);
      if (url === null || !isAcceptedUrl(url)) return null;
      return { operation: "issue_comment", number: issueNumber(number), url, comments: [] };
    }
    const comments = parseCommentList(payload.comments);
    if (comments === null) return null;
    const url = str(payload.url);
    return {
      operation: "issue_comment",
      number: issueNumber(number),
      url: url !== null && isAcceptedUrl(url) ? url : "",
      comments,
    };
  },
  async verify(runner, request, success) {
    const req = request as Extract<GhToolRequest, { operation: "issue_comment" }>;
    const done = success as Extract<GhToolSuccess, { operation: "issue_comment" }>;
    const issue = await readIssue(runner, done.number);
    if (issue === null) return false;
    if (req.body === undefined) {
      return done.comments.every((c) => typeof c.body === "string");
    }
    return str(issue.state) === "open";
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

// ---------------------------------------------------------------------------
// issue_list（読み取り。絞り込みつき構造化一覧。応答の自己整合は parse で検証する）
// ---------------------------------------------------------------------------

const issueListSpec: OperationSpec = {
  operation: "issue_list",
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const request = { operation: "issue_list" } as {
      operation: "issue_list";
      role?: IssueRole;
      kind?: TrackingKind;
      state?: "open" | "closed";
      trackingState?: TrackingState;
      labels?: string[];
      search?: string;
    };
    if (raw.role !== undefined) {
      const role = parseRole(raw.role);
      if (role === null) return null;
      request.role = role;
    }
    if (raw.kind !== undefined) {
      const kind = parseKind(raw.kind);
      if (kind === null) return null;
      request.kind = kind;
    }
    if (raw.state !== undefined) {
      if (raw.state !== "open" && raw.state !== "closed") return null;
      request.state = raw.state;
    }
    if (raw.trackingState !== undefined) {
      const trackingState = parseState(raw.trackingState);
      if (trackingState === null) return null;
      request.trackingState = trackingState;
    }
    if (raw.labels !== undefined) {
      const labels = stringArray(raw.labels);
      if (labels === null) return null;
      request.labels = labels;
    }
    if (raw.search !== undefined) {
      const search = str(raw.search);
      if (search === null || search.length === 0) return null;
      request.search = search;
    }
    return request;
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_list" }>;
    return {
      operation: "issue_list",
      args: {
        role: r.role,
        kind: r.kind,
        state: r.state,
        trackingState: r.trackingState,
        labels: r.labels,
        search: r.search,
      },
    };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload) || !Array.isArray(payload.issues)) return null;
    const issues: IssueListItem[] = [];
    for (const entry of payload.issues) {
      if (!isRecord(entry)) return null;
      const number = positiveInt(entry.number);
      const title = str(entry.title);
      const url = str(entry.url);
      const state = str(entry.state);
      if (number === null || title === null || url === null || !isAcceptedUrl(url)) return null;
      if (state !== "open" && state !== "closed") return null;
      const meta = parseTrackingMeta(entry);
      if (meta === null) return null;
      const labels = stringArray(entry.labels);
      if (labels === null) return null;
      issues.push({
        number: issueNumber(number),
        title,
        url,
        state,
        labels,
        role: meta.role,
        kind: meta.kind,
        trackingState: meta.trackingState,
        closeReason: meta.closeReason,
      });
    }
    return { operation: "issue_list", issues };
  },
  async verify(_runner, _request, success) {
    const listed = success as Extract<GhToolSuccess, { operation: "issue_list" }>;
    const numbers = new Set(listed.issues.map((i) => i.number));
    return numbers.size === listed.issues.length;
  },
};

// ---------------------------------------------------------------------------
// issue_reopen（再オープン。読み戻しで state=open を確認する）
// ---------------------------------------------------------------------------

const issueReopenSpec: OperationSpec = {
  operation: "issue_reopen",
  validate(raw): GhToolRequest | null {
    if (!isRecord(raw)) return null;
    const number = positiveInt(raw.number);
    if (number === null) return null;
    return { operation: "issue_reopen", number: issueNumber(number) };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_reopen" }>;
    return { operation: "issue_reopen", args: { number: r.number } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    if (str(payload.state) !== "open") return null;
    return { operation: "issue_reopen", number: issueNumber(number), state: "open" };
  },
  async verify(runner, _request, success) {
    const reopened = success as Extract<GhToolSuccess, { operation: "issue_reopen" }>;
    const issue = await readIssue(runner, reopened.number);
    return issue !== null && str(issue.state) === "open";
  },
};

/** Issue 系操作のスペック一覧。 */
export const ISSUE_OPERATION_SPECS: readonly OperationSpec[] = [
  issueCreateSpec,
  issueReadSpec,
  issueUpdateSpec,
  issueCommentSpec,
  issueCloseSpec,
  issueListSpec,
  issueReopenSpec,
];
