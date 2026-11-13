// Issue 系・Comment 系操作のスペック実装。
//
// 各スペックは操作ごとの差分（入力検証、前提検証、runner 要求の組立て、応答解釈、
// 読み戻し照合）のみを所有する。fail-closed の制御順序は engine.ts が所有する。
// runner への要求・応答の接合形状（payload フィールド）は本ファイルと
// runner 実装間の契約である。issue_update / issue_reopen の応答 payload は
// 実行前状態（before）を運び、VERIFY の追跡軸保持照合の基準とする。
// issue_read の応答 payload は updatedAt（対象 Issue の版。GitHub REST の
// updated_at、ローカル版 frontmatter の updated_at）を運び、issue_close の
// 終了前提検証（判定対象版の照合）の基準とする。GitHub 版と Local 版の
// 両 runner へ同時に反映する内部契約である。
//
// issue_close の前提検証（precondition）は、対象が Case Issue（case role）である
// 場合に、case-close 機械工程が生成した機械受理の終了判定記録を呼出元の申告に
// よらず自ら読み取り検証する（Design custom-tool-contracts「issue_close の終了前提
// （Case Issue）」節）。検証不成立時は終了の副作用を実行せず
// 構造化失敗を返す（fail-closed）。追跡Issue（tracking role）には適用しない。


import {
  issueNumber,
  type CommentSummary,
  type GhToolRequest,
  type GhToolSuccess,
  type IssueListItem,
} from "./contracts.ts";
import type { GhRunner, GhRunnerRequest } from "./runner.ts";
import type { InputContractError, OperationDeps, OperationSpec, PreconditionFailure, ValidateOutcome } from "./engine.ts";
import { verifyCloseAcceptanceForClose } from "./close-acceptance.ts";
import { validateOperationInput } from "./operation-catalog.ts";
import {
  deriveCloseReason,
  deriveRole,
  parseIssueRole,
  stripTrackingLabels,
  TRACKING_ROLE_LABEL,
  type CloseReason,
  type IssueRole,
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

function parseCloseReason(v: unknown): CloseReason | null {
  return v === "completed" || v === "not_planned" ? v : null;
}

// ---------------------------------------------------------------------------
// 操作単位の入力定義（Design「入力契約」）。操作名称・必須・型・enum 値域の
// 定型検査（契約外フィールドと必須欠落の構造化エラー特定を含む）は正本
// operation-catalog.ts の validateOperationInput が単一実装で提供する
// （B3-5c 一元化）。本ファイルの各 validate は定型検査を消費した後、
// 操作固有の差分検査（空更新等）と要求の組立てのみを所有する。
// ---------------------------------------------------------------------------

function invalidOutcome(error: InputContractError): ValidateOutcome {
  return { ok: false, error };
}

/** issue_read / issue_list 共通の追跡Issueメタデータ導出（応答の自己整合の部品）。 */
function parseTrackingMeta(rec: Record<string, unknown>): {
  role: IssueRole;
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
  const reasonAbsent = rec.closeReason === undefined || rec.closeReason === null;
  const explicitReason = reasonAbsent ? null : parseCloseReason(rec.closeReason);
  if (!reasonAbsent && explicitReason === null) return null;
  return {
    role,
    closeReason: deriveCloseReason(labels, state, str(rec.stateReason)) ?? explicitReason,
  };
}

/** 実行応答 payload 内の実行前状態（before）。issue_update / issue_reopen の照合基準。 */
function beforeMeta(payload: unknown): {
  role: IssueRole;
  labels: string[];
} | null {
  if (!isRecord(payload) || !isRecord(payload.before)) return null;
  const meta = parseTrackingMeta(payload.before);
  if (meta === null) return null;
  const labels = stringArray(payload.before.labels);
  if (labels === null) return null;
  return { role: meta.role, labels };
}

// 出力 URL: GitHub 実装は https URL、Local 実装（Case ファイル）は絶対パスを識別子として返す（GitHub 実装と差し替え可能な Local 実装契約条項）。
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
    const declared = validateOperationInput("issue_create", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    const request: {
      operation: "issue_create";
      title: string;
      body: string;
      labels: string[];
      role?: "tracking" | "case";
    } = {
      operation: "issue_create",
      title: record.title as string,
      body: record.body as string,
      labels: [...(record.labels as string[])],
    };
    if (record.role !== undefined) {
      request.role = record.role as "tracking" | "case";
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
  const updatedAt = str(payload.updatedAt);
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
    closeReason: meta.closeReason,
    ...(updatedAt !== null ? { updatedAt } : {}),
  };
}

const issueReadSpec: OperationSpec = {
  operation: "issue_read",
  validate(raw): ValidateOutcome {
    const declared = validateOperationInput("issue_read", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return { ok: true, request: { operation: "issue_read", number: issueNumber(record.number as number) } };
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
    const declared = validateOperationInput("issue_update", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    if (
      record.title === undefined && record.body === undefined &&
      record.labels === undefined
    ) {
      return invalidOutcome({
        code: "empty-update",
        field: "title",
        detail: "specify at least one of title, body, labels",
      });
    }
    const request = {
      operation: "issue_update",
      number: issueNumber(record.number as number),
    } as {
      operation: "issue_update";
      number: ReturnType<typeof issueNumber>;
      title?: string;
      body?: string;
      labels?: string[];
    };
    if (record.title !== undefined) request.title = record.title as string;
    if (record.body !== undefined) request.body = record.body as string;
    if (record.labels !== undefined) request.labels = [...(record.labels as string[])];
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
    // 部分更新不変条件: 要求対象外の追跡軸（role）の維持を実行前状態（before）と
    // 一致で照合する。labels 要求に role 物理ラベルを含む場合は role 変更要求として
    // role = tracking の反映を要求する（labels 要求に追跡軸が含まれるため追跡軸は
    // 要求対象内）。通常ラベルは要求包含のみ確認し、確認時点での第三者による
    // 追加を不変条件違反として失敗扱いにしない。
    const before = beforeMeta(payload);
    if (before === null) return false;
    const after = parseTrackingMeta(issue);
    if (after === null) return false;
    const roleRequested =
      req.labels !== undefined && req.labels.includes(TRACKING_ROLE_LABEL);
    if (roleRequested) {
      if (after.role !== "tracking") return false;
    } else if (after.role !== before.role) {
      return false;
    }
    if (req.labels !== undefined) {
      const current = stringArray(issue.labels);
      if (current === null) return false;
      const kept = stripTrackingLabels(current);
      const requestedNormal = req.labels.filter((l) => l !== TRACKING_ROLE_LABEL);
      if (!requestedNormal.every((l) => kept.includes(l))) return false;
    }
    return true;
  },
};

// ---------------------------------------------------------------------------
// issue_close
// ---------------------------------------------------------------------------

const issueCloseSpec: OperationSpec = {
  operation: "issue_close",
  async precondition(runner, request, deps: OperationDeps): Promise<PreconditionFailure | null> {
    const req = request as Extract<GhToolRequest, { operation: "issue_close" }>;
    const reply = await runner.run({ operation: "issue_read", args: { number: req.number } });
    if (!reply.ok) {
      return {
        kind: reply.failureClass,
        retryable: true,
        detail: `issue_close precondition could not read the target issue ${req.number}: ${reply.error}`,
      };
    }
    const issue = isRecord(reply.payload) ? reply.payload : null;
    if (issue === null || positiveInt(issue.number) !== req.number) {
      return {
        kind: "operation-failed",
        retryable: true,
        detail: `issue_close precondition could not read the target issue ${req.number}`,
      };
    }
    const meta = parseTrackingMeta(issue);
    if (meta === null) {
      return {
        kind: "operation-failed",
        retryable: true,
        detail: `issue_close precondition could not interpret the tracking metadata of issue ${req.number}`,
      };
    }
    // 追跡Issue（tracking role）の終了には終了前提を適用しない。
    if (meta.role !== "case") return null;
    const currentRevision = str(issue.updatedAt);
    if (currentRevision === null || currentRevision.length === 0) {
      return {
        kind: "verification-incomplete",
        retryable: false,
        detail:
          `issue_close precondition could not read the current revision (updatedAt) of case issue ${req.number}; ` +
          `the acceptance record cannot be bound to the target version`,
      };
    }
    const outcome = verifyCloseAcceptanceForClose(
      deps.closeAcceptanceIo,
      deps.cwd ?? process.cwd(),
      req.number,
      currentRevision,
    );
    if (outcome.ok) return null;
    return { kind: outcome.kind, retryable: false, detail: outcome.detail };
  },
  validate(raw): ValidateOutcome {
    const declared = validateOperationInput("issue_close", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    const number = issueNumber(record.number as number);
    if (record.reason === undefined) {
      return { ok: true, request: { operation: "issue_close", number } };
    }
    return {
      ok: true,
      request: { operation: "issue_close", number, reason: record.reason as "completed" | "not_planned" },
    };
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
    const declared = validateOperationInput("issue_list", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    const request = { operation: "issue_list" } as {
      operation: "issue_list";
      role?: IssueRole;
      state?: "open" | "closed";
      labels?: string[];
      search?: string;
    };
    if (record.role !== undefined) request.role = record.role as IssueRole;
    if (record.state !== undefined) request.state = record.state as "open" | "closed";
    if (record.labels !== undefined) request.labels = [...(record.labels as string[])];
    if (record.search !== undefined) request.search = record.search as string;
    return { ok: true, request };
  },
  buildRequest(request): GhRunnerRequest {
    const r = request as Extract<GhToolRequest, { operation: "issue_list" }>;
    return {
      operation: "issue_list",
      args: {
        role: r.role,
        state: r.state,
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
    const declared = validateOperationInput("issue_reopen", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return { ok: true, request: { operation: "issue_reopen", number: issueNumber(record.number as number) } };
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
    // 再オープン遷移: role と通常ラベルを保持する。追跡状態の再オープン遷移は
    // 本文の状態保持節の更新として呼出側が行い、Tool は状態ラベルの再付与による
    // 遷移を機械適用しない。Case Issue には追跡状態遷移を適用しない。
    // open 済み追跡Issueへの再実行は冪等に成功する。
    const before = beforeMeta(payload);
    if (before === null) return false;
    const after = parseTrackingMeta(issue);
    if (after === null) return false;
    if (after.role !== before.role) return false;
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
    const declared = validateOperationInput("comment_create", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return {
      ok: true,
      request: {
        operation: "comment_create",
        number: issueNumber(record.number as number),
        body: record.body as string,
      },
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
    const declared = validateOperationInput("comment_list", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return { ok: true, request: { operation: "comment_list", number: issueNumber(record.number as number) } };
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
    const declared = validateOperationInput("comment_update", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return {
      ok: true,
      request: { operation: "comment_update", commentId: record.commentId as string, body: record.body as string },
    };
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
    const declared = validateOperationInput("comment_delete", raw);
    if (declared !== null) return declared;
    const record = raw as Record<string, unknown>;
    return { ok: true, request: { operation: "comment_delete", commentId: record.commentId as string } };
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
