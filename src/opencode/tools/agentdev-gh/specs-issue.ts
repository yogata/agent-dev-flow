// ADF-COVERS(implementation): REQ-011-022, REQ-011-025, REQ-011-026
// Issue 系・Comment 系操作のスペック実装。
//
// 各スペックは操作ごとの差分（入力検証、runner 要求の組立て、応答解釈、
// 読み戻し照合）のみを所有する。fail-closed の制御順序は engine.ts が所有する。
// runner への要求・応答の接合形状（payload フィールド）は本ファイルと
// runner 実装間の契約である。issue_update / issue_reopen の応答 payload は
// 実行前状態（before）を運び、VERIFY の追跡軸保持照合の基準とする。


import {
  issueNumber,
  type CommentSummary,
  type GhToolRequest,
  type GhToolSuccess,
  type IssueListItem,
} from "./contracts.ts";
import type { GhRunner, GhRunnerRequest } from "./runner.ts";
import type { InputContractError, OperationSpec, ValidateOutcome } from "./engine.ts";
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
import { REOPEN_TRACKING_STATE } from "./tracking-schema.ts";

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

// ---------------------------------------------------------------------------
// 操作単位の入力定義（Design「入力契約」）。契約外フィールドと必須欠落を
// 構造化エラーとして特定可能にする。
// ---------------------------------------------------------------------------

function invalidOutcome(error: InputContractError): ValidateOutcome {
  return { ok: false, error };
}

function unknownFieldOutcome(
  operation: string,
  field: string,
): ValidateOutcome {
  return invalidOutcome({
    code: "unknown-field",
    field,
    detail: `field '${field}' is not part of the ${operation} input contract`,
  });
}

function missingFieldOutcome(
  operation: string,
  field: string,
): ValidateOutcome {
  return invalidOutcome({
    code: "missing-field",
    field,
    detail: `required field '${field}' is missing for ${operation}`,
  });
}

function invalidFieldOutcome(
  field: string,
  detail: string,
): ValidateOutcome {
  return invalidOutcome({ code: "invalid-field", field, detail });
}

/** 要求が操作の入力定義（許容フィールド一覧）に反していないか検査する。 */
function checkUnknownFields(
  raw: Record<string, unknown>,
  allowed: readonly string[],
): ValidateOutcome | null {
  for (const key of Object.keys(raw)) {
    if (!allowed.includes(key)) return unknownFieldOutcome(String(raw.operation), key);
  }
  return null;
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

/** 実行応答 payload 内の実行前状態（before）。issue_update / issue_reopen の照合基準。 */
function beforeMeta(payload: unknown): {
  role: IssueRole;
  kind: TrackingKind | null;
  trackingState: TrackingState | null;
  labels: string[];
} | null {
  if (!isRecord(payload) || !isRecord(payload.before)) return null;
  const meta = parseTrackingMeta(payload.before);
  if (meta === null) return null;
  const labels = stringArray(payload.before.labels);
  if (labels === null) return null;
  return { ...meta, labels };
}

// 出力 URL: GitHub 実装は https URL、Local 実装（Case ファイル）は絶対パスを識別子として返す（REQ-{NNNN}-{NNN}）。
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

// ---------------------------------------------------------------------------
// issue_create
// ---------------------------------------------------------------------------

const issueCreateSpec: OperationSpec = {
  operation: "issue_create",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("issue_create", "operation");
    const unknown = checkUnknownFields(raw, [
      "operation",
      "title",
      "body",
      "labels",
      "role",
      "kind",
    ]);
    if (unknown !== null) return unknown;
    const title = str(raw.title);
    if (raw.title === undefined) return missingFieldOutcome("issue_create", "title");
    if (title === null || title.length === 0) {
      return invalidFieldOutcome("title", "title must be a non-empty string");
    }
    if (raw.body === undefined) return missingFieldOutcome("issue_create", "body");
    const body = str(raw.body);
    if (body === null || body.length === 0) {
      return invalidFieldOutcome("body", "body must be a non-empty string");
    }
    if (raw.labels === undefined) return missingFieldOutcome("issue_create", "labels");
    if (!Array.isArray(raw.labels)) {
      return invalidFieldOutcome("labels", "labels must be an array of strings");
    }
    if (!raw.labels.every((l) => typeof l === "string")) {
      return invalidFieldOutcome("labels", "labels must be an array of strings");
    }
    const request: {
      operation: "issue_create";
      title: string;
      body: string;
      labels: string[];
      role?: "tracking" | "case";
      kind?: TrackingKind;
    } = { operation: "issue_create", title, body, labels: raw.labels };
    if (raw.role !== undefined) {
      const role = parseRole(raw.role);
      if (role === null) {
        return invalidFieldOutcome("role", "role must be 'tracking' or 'case'");
      }
      request.role = role;
    }
    if (raw.kind !== undefined) {
      if (request.role !== "tracking") {
        return invalidFieldOutcome("kind", "kind requires role 'tracking'");
      }
      const kind = parseKind(raw.kind);
      if (kind === null) {
        return invalidFieldOutcome("kind", "kind must be problem, idea, task, or risk");
      }
      request.kind = kind;
    }
    return { ok: true, request };
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
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("issue_read", "operation");
    const unknown = checkUnknownFields(raw, ["operation", "number"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingFieldOutcome("issue_read", "number");
    const number = positiveInt(raw.number);
    if (number === null) {
      return invalidFieldOutcome("number", "number must be a positive integer");
    }
    return { ok: true, request: { operation: "issue_read", number: issueNumber(number) } };
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
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("issue_update", "operation");
    const unknown = checkUnknownFields(raw, [
      "operation",
      "number",
      "title",
      "body",
      "labels",
      "kind",
      "trackingState",
    ]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingFieldOutcome("issue_update", "number");
    const number = positiveInt(raw.number);
    if (number === null) {
      return invalidFieldOutcome("number", "number must be a positive integer");
    }
    const title = raw.title === undefined ? null : str(raw.title);
    if (raw.title !== undefined && (title === null || title.length === 0)) {
      return invalidFieldOutcome("title", "title must be a non-empty string when present");
    }
    const body = raw.body === undefined ? null : str(raw.body);
    if (raw.body !== undefined && (body === null || body.length === 0)) {
      return invalidFieldOutcome("body", "body must be a non-empty string when present");
    }
    const labels = raw.labels === undefined ? null : stringArray(raw.labels);
    if (raw.labels !== undefined && labels === null) {
      return invalidFieldOutcome("labels", "labels must be an array of strings");
    }
    const kind = raw.kind === undefined ? null : parseKind(raw.kind);
    if (raw.kind !== undefined && kind === null) {
      return invalidFieldOutcome("kind", "kind must be problem, idea, task, or risk");
    }
    const trackingState =
      raw.trackingState === undefined ? null : parseState(raw.trackingState);
    if (raw.trackingState !== undefined && trackingState === null) {
      return invalidFieldOutcome(
        "trackingState",
        "trackingState must be a tracking state value",
      );
    }
    if (trackingState === "closed") {
      return invalidFieldOutcome(
        "trackingState",
        "issue_update accepts non-terminal tracking states only (use issue_close)",
      );
    }
    if (
      title === null && body === null && labels === null &&
      kind === null && trackingState === null
    ) {
      return invalidOutcome({
        code: "empty-update",
        field: "title",
        detail: "specify at least one of title, body, labels, kind, trackingState",
      });
    }
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
    return { ok: true, request };
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
  async verify(runner, request, _success, payload) {
    const req = request as Extract<GhToolRequest, { operation: "issue_update" }>;
    const issue = await readIssue(runner, req.number);
    if (issue === null) return false;
    if (req.title !== undefined && str(issue.title) !== req.title) return false;
    if (req.body !== undefined && str(issue.body) !== req.body) return false;
    // 部分更新不変条件: 要求対象外の追跡軸（role、kind、trackingState）の維持を
    // 実行前状態（before）と完全一致で照合する。通常ラベルは要求包含のみ確認し、
    // 確認時点での第三者による追加を不変条件違反として失敗扱いにしない。
    const before = beforeMeta(payload);
    if (before === null) return false;
    const after = parseTrackingMeta(issue);
    if (after === null) return false;
    if (after.role !== before.role) return false;
    const expectedKind = req.kind !== undefined ? req.kind : before.kind;
    if (after.kind !== expectedKind) return false;
    const expectedState =
      req.trackingState !== undefined ? req.trackingState : before.trackingState;
    if (after.trackingState !== expectedState) return false;
    if (req.labels !== undefined) {
      const current = stringArray(issue.labels);
      if (current === null) return false;
      const kept = stripTrackingLabels(current);
      if (!req.labels.every((l) => kept.includes(l))) return false;
    }
    return true;
  },
};

// ---------------------------------------------------------------------------
// issue_close
// ---------------------------------------------------------------------------

const issueCloseSpec: OperationSpec = {
  operation: "issue_close",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("issue_close", "operation");
    const unknown = checkUnknownFields(raw, ["operation", "number", "reason"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingFieldOutcome("issue_close", "number");
    const number = positiveInt(raw.number);
    if (number === null) {
      return invalidFieldOutcome("number", "number must be a positive integer");
    }
    if (raw.reason === undefined) {
      return { ok: true, request: { operation: "issue_close", number: issueNumber(number) } };
    }
    const reason = parseCloseReason(raw.reason);
    if (reason === null) {
      return invalidFieldOutcome("reason", "reason must be 'completed' or 'not_planned'");
    }
    return { ok: true, request: { operation: "issue_close", number: issueNumber(number), reason } };
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
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("issue_list", "operation");
    const unknown = checkUnknownFields(raw, [
      "operation",
      "role",
      "kind",
      "state",
      "trackingState",
      "labels",
      "search",
    ]);
    if (unknown !== null) return unknown;
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
      if (role === null) {
        return invalidFieldOutcome("role", "role must be 'tracking' or 'case'");
      }
      request.role = role;
    }
    if (raw.kind !== undefined) {
      const kind = parseKind(raw.kind);
      if (kind === null) {
        return invalidFieldOutcome("kind", "kind must be problem, idea, task, or risk");
      }
      request.kind = kind;
    }
    if (raw.state !== undefined) {
      if (raw.state !== "open" && raw.state !== "closed") {
        return invalidFieldOutcome("state", "state must be 'open' or 'closed'");
      }
      request.state = raw.state;
    }
    if (raw.trackingState !== undefined) {
      const trackingState = parseState(raw.trackingState);
      if (trackingState === null) {
        return invalidFieldOutcome(
          "trackingState",
          "trackingState must be a tracking state value",
        );
      }
      request.trackingState = trackingState;
    }
    if (raw.labels !== undefined) {
      const labels = stringArray(raw.labels);
      if (labels === null) {
        return invalidFieldOutcome("labels", "labels must be an array of strings");
      }
      request.labels = labels;
    }
    if (raw.search !== undefined) {
      const search = str(raw.search);
      if (search === null || search.length === 0) {
        return invalidFieldOutcome("search", "search must be a non-empty string");
      }
      request.search = search;
    }
    return { ok: true, request };
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
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("issue_reopen", "operation");
    const unknown = checkUnknownFields(raw, ["operation", "number"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingFieldOutcome("issue_reopen", "number");
    const number = positiveInt(raw.number);
    if (number === null) {
      return invalidFieldOutcome("number", "number must be a positive integer");
    }
    return { ok: true, request: { operation: "issue_reopen", number: issueNumber(number) } };
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
  async verify(runner, _request, success, payload) {
    const reopened = success as Extract<GhToolSuccess, { operation: "issue_reopen" }>;
    const issue = await readIssue(runner, reopened.number);
    if (issue === null) return false;
    if (str(issue.state) !== "open") return false;
    // 再オープン遷移: クローズ済み追跡Issueは in-discussion へ遷移し、kind と
    // 通常ラベルを保持する。Case Issue には追跡状態遷移を適用しない。
    // open 済み追跡Issueへの再実行は現状維持のまま冪等に成功する。
    const before = beforeMeta(payload);
    if (before === null) return false;
    const after = parseTrackingMeta(issue);
    if (after === null) return false;
    if (after.role !== before.role) return false;
    if (before.role !== "tracking") return true;
    const expected =
      before.trackingState === "closed" ? REOPEN_TRACKING_STATE : before.trackingState;
    if (after.trackingState !== expected) return false;
    if (after.kind !== before.kind) return false;
    const afterLabels = stringArray(issue.labels);
    if (afterLabels === null) return false;
    const beforeNormal = stripTrackingLabels(before.labels);
    const afterNormal = stripTrackingLabels(afterLabels);
    if (!beforeNormal.every((l) => afterNormal.includes(l))) return false;
    return true;
  },
};

// ---------------------------------------------------------------------------
// Comment 系（Comment は Issue と Pull Request の会話コメントの共通論理リソース）
// ---------------------------------------------------------------------------

function parseCommentSummaries(raw: unknown): CommentSummary[] | null {
  if (!Array.isArray(raw)) return null;
  const comments: CommentSummary[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) return null;
    const commentId = str(entry.commentId);
    if (commentId === null || commentId.length === 0) return null;
    const body = str(entry.body);
    if (body === null) return null;
    comments.push({
      commentId,
      body,
      createdAt: str(entry.createdAt),
      updatedAt: str(entry.updatedAt),
      url: str(entry.url),
    });
  }
  return comments;
}

async function listComments(
  runner: GhRunner,
  number: number,
): Promise<CommentSummary[] | null> {
  const reply = await runner.run({
    operation: "comment_list",
    args: { number },
  });
  if (!reply.ok || !isRecord(reply.payload)) return null;
  if (positiveInt(reply.payload.number) !== number) return null;
  return parseCommentSummaries(reply.payload.comments);
}

const commentCreateSpec: OperationSpec = {
  operation: "comment_create",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("comment_create", "operation");
    const unknown = checkUnknownFields(raw, ["operation", "number", "body"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingFieldOutcome("comment_create", "number");
    const number = positiveInt(raw.number);
    if (number === null) {
      return invalidFieldOutcome("number", "number must be a positive integer");
    }
    if (raw.body === undefined) return missingFieldOutcome("comment_create", "body");
    const body = str(raw.body);
    if (body === null || body.length === 0) {
      return invalidFieldOutcome("body", "body must be a non-empty string");
    }
    return {
      ok: true,
      request: { operation: "comment_create", number: issueNumber(number), body },
    };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "comment_create" }>;
    return { operation: "comment_create", args: { number: r.number, body: r.body } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const commentId = str(payload.commentId);
    const url = str(payload.url);
    if (commentId === null || commentId.length === 0) return null;
    if (url === null || !isAcceptedUrl(url)) return null;
    return { operation: "comment_create", commentId, url };
  },
  async verify(runner, request, success) {
    const req = request as Extract<GhToolRequest, { operation: "comment_create" }>;
    const done = success as Extract<GhToolSuccess, { operation: "comment_create" }>;
    // Comment WRITE は対象コメントの存在・本文で判定する（Issue/PR の open/closed
    // を成功証拠にしない）。
    const comments = await listComments(runner, req.number);
    if (comments === null) return false;
    const found = comments.find((c) => c.commentId === done.commentId);
    return found !== undefined && found.body === req.body;
  },
};

const commentListSpec: OperationSpec = {
  operation: "comment_list",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("comment_list", "operation");
    const unknown = checkUnknownFields(raw, ["operation", "number"]);
    if (unknown !== null) return unknown;
    if (raw.number === undefined) return missingFieldOutcome("comment_list", "number");
    const number = positiveInt(raw.number);
    if (number === null) {
      return invalidFieldOutcome("number", "number must be a positive integer");
    }
    return { ok: true, request: { operation: "comment_list", number: issueNumber(number) } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "comment_list" }>;
    return { operation: "comment_list", args: { number: r.number } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const number = positiveInt(payload.number);
    if (number === null) return null;
    const comments = parseCommentSummaries(payload.comments);
    if (comments === null) return null;
    return { operation: "comment_list", number: issueNumber(number), comments };
  },
  async verify(_runner, _request, success) {
    const listed = success as Extract<GhToolSuccess, { operation: "comment_list" }>;
    const ids = new Set(listed.comments.map((c) => c.commentId));
    return ids.size === listed.comments.length;
  },
};

const commentUpdateSpec: OperationSpec = {
  operation: "comment_update",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("comment_update", "operation");
    const unknown = checkUnknownFields(raw, ["operation", "commentId", "body"]);
    if (unknown !== null) return unknown;
    if (raw.commentId === undefined) {
      return missingFieldOutcome("comment_update", "commentId");
    }
    const commentId = str(raw.commentId);
    if (commentId === null || commentId.length === 0) {
      return invalidFieldOutcome("commentId", "commentId must be a non-empty string");
    }
    if (raw.body === undefined) return missingFieldOutcome("comment_update", "body");
    const body = str(raw.body);
    if (body === null || body.length === 0) {
      return invalidFieldOutcome("body", "body must be a non-empty string");
    }
    return { ok: true, request: { operation: "comment_update", commentId, body } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "comment_update" }>;
    return { operation: "comment_update", args: { commentId: r.commentId, body: r.body } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const commentId = str(payload.commentId);
    const url = str(payload.url);
    if (commentId === null || commentId.length === 0) return null;
    if (url === null || !isAcceptedUrl(url)) return null;
    return { operation: "comment_update", commentId, url };
  },
  async verify(runner, request, success, payload) {
    const req = request as Extract<GhToolRequest, { operation: "comment_update" }>;
    const done = success as Extract<GhToolSuccess, { operation: "comment_update" }>;
    if (!isRecord(payload)) return false;
    const number = positiveInt(payload.number);
    if (number === null) return false;
    const comments = await listComments(runner, number);
    if (comments === null) return false;
    const found = comments.find((c) => c.commentId === done.commentId);
    return found !== undefined && found.body === req.body;
  },
};

const commentDeleteSpec: OperationSpec = {
  operation: "comment_delete",
  validate(raw): ValidateOutcome {
    if (!isRecord(raw)) return missingFieldOutcome("comment_delete", "operation");
    const unknown = checkUnknownFields(raw, ["operation", "commentId"]);
    if (unknown !== null) return unknown;
    if (raw.commentId === undefined) {
      return missingFieldOutcome("comment_delete", "commentId");
    }
    const commentId = str(raw.commentId);
    if (commentId === null || commentId.length === 0) {
      return invalidFieldOutcome("commentId", "commentId must be a non-empty string");
    }
    return { ok: true, request: { operation: "comment_delete", commentId } };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "comment_delete" }>;
    return { operation: "comment_delete", args: { commentId: r.commentId } };
  },
  parseSuccess(payload): GhToolSuccess | null {
    if (!isRecord(payload)) return null;
    const commentId = str(payload.commentId);
    if (commentId === null || commentId.length === 0) return null;
    return { operation: "comment_delete", commentId };
  },
  async verify(runner, _request, success, payload) {
    const done = success as Extract<GhToolSuccess, { operation: "comment_delete" }>;
    if (!isRecord(payload)) return false;
    const number = positiveInt(payload.number);
    if (number === null) return false;
    const comments = await listComments(runner, number);
    if (comments === null) return false;
    return comments.every((c) => c.commentId !== done.commentId);
  },
};

/** Issue 系操作のスペック一覧。 */
export const ISSUE_OPERATION_SPECS: readonly OperationSpec[] = [
  issueCreateSpec,
  issueReadSpec,
  issueUpdateSpec,
  issueCloseSpec,
  issueListSpec,
  issueReopenSpec,
];

/** Comment 系操作のスペック一覧。 */
export const COMMENT_OPERATION_SPECS: readonly OperationSpec[] = [
  commentCreateSpec,
  commentListSpec,
  commentUpdateSpec,
  commentDeleteSpec,
];
