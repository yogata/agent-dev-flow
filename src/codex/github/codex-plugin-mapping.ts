// Codex ホスト接続領域の GitHub プラグイン対応付け。
//
// Codex が提供する GitHub プラグイン（OpenAI curated）の tool face は
// GitHub hosted MCP server（github/github-mcp-server v2）である。本ファイルは
// agentdev_gh の 20 操作をその tool face へ対応付ける純粋な PluginMapping
// （transport を持たない）を公開する。tool face に対応する tool が存在しない
// 操作は supported: false とし、plan は空配列を返す（fail-closed。transport
// 呼出しは発生しない）。応答の解釈は gh CLI 実装（runner-cli.ts）と同一の
// runner 応答形状（操作スペックの parseSuccess が受理する形状）へ正規化する。

import type { GhToolOperation } from "../../common/tools/agentdev-gh/contracts.ts";
import type { PluginCall, PluginMapping } from "../../common/tools/agentdev-gh/plugin-runner.ts";
import type {
  GhRunnerFailureClass,
  GhRunnerReply,
  GhRunnerRequest,
} from "../../common/tools/agentdev-gh/runner.ts";
import {
  buildTrackingLabels,
  deriveCloseReason,
  deriveRole,
  TRACKING_ROLE_LABEL,
} from "../../common/tools/agentdev-gh/tracking-schema.ts";

/** Codex GitHub プラグイン対応付けの生成 context。owner/name 形式のリポジトリ。 */
export interface CodexPluginMappingContext {
  readonly repo: string;
}

/** tool face の 1 操作分の対応。操作ごとに CODEX_PLUGIN_CAPABILITIES へ並べる。 */
export interface CodexPluginCapability {
  readonly operation: GhToolOperation;
  readonly supported: boolean;
  readonly tools: readonly string[];
  readonly evidence: string;
}

/**
 * 20 操作と GitHub hosted MCP server v2 の tool face の対応表。
 * tool face に該当 tool の無い操作は supported: false、tools: [] とする
 * （fail-closed。呼出し側は成功扱いにせず停止する）。
 */
export const CODEX_PLUGIN_CAPABILITIES: readonly CodexPluginCapability[] = [
  { operation: "issue_create", supported: true, tools: ["issue_write"], evidence: "issue_write (method create) accepts title/body/labels with explicit owner/repo" },
  { operation: "issue_read", supported: true, tools: ["issue_read"], evidence: "issue_read (method get) returns a single issue by issue_number" },
  { operation: "issue_update", supported: true, tools: ["issue_read", "issue_write"], evidence: "issue_write (method update) accepts title/body/labels; labels are built from the pre-read reply with role preservation" },
  { operation: "issue_close", supported: true, tools: ["issue_write"], evidence: "issue_write (method update) accepts state/state_reason" },
  { operation: "pr_create", supported: true, tools: ["create_pull_request"], evidence: "create_pull_request accepts title/body/head/base with explicit owner/repo" },
  { operation: "pr_read", supported: true, tools: ["pull_request_read"], evidence: "pull_request_read (method get) returns a single pull request by pullNumber" },
  { operation: "pr_merge", supported: true, tools: ["merge_pull_request"], evidence: "merge_pull_request accepts merge_method (merge/squash/rebase)" },
  { operation: "pr_changed_files", supported: true, tools: ["pull_request_read"], evidence: "pull_request_read (method get_files) lists changed files with page/perPage" },
  { operation: "pr_mergeable", supported: true, tools: ["pull_request_read"], evidence: "pull_request_read (method get) exposes mergeable (true/false/null) for observation" },
  { operation: "pr_update", supported: true, tools: ["update_pull_request"], evidence: "update_pull_request accepts title/body by pullNumber" },
  { operation: "issue_list", supported: true, tools: ["list_issues"], evidence: "list_issues filters by state/labels with perPage=100; the search axis stays unmapped (empty plan)" },
  { operation: "issue_reopen", supported: true, tools: ["issue_read", "issue_write"], evidence: "issue_write (method update) accepts state open" },
  { operation: "comment_create", supported: true, tools: ["add_issue_comment"], evidence: "add_issue_comment accepts body by issue_number" },
  { operation: "comment_list", supported: true, tools: ["issue_read"], evidence: "issue_read (method get_comments) lists comments with page/perPage" },
  { operation: "comment_update", supported: true, tools: ["update_issue_comment"], evidence: "update_issue_comment accepts body by comment_id" },
  { operation: "comment_delete", supported: false, tools: [], evidence: "the tool face has no comment deletion tool (no delete_issue_comment)" },
  { operation: "release_create", supported: false, tools: [], evidence: "the tool face has no release creation tool" },
  { operation: "release_list", supported: true, tools: ["list_releases"], evidence: "list_releases lists releases with page/perPage" },
  { operation: "release_read", supported: true, tools: ["get_release_by_tag"], evidence: "get_release_by_tag returns a release by tag" },
  { operation: "release_publish", supported: false, tools: [], evidence: "the tool face has no release publish (draft flip) tool" },
];

// ---------------------------------------------------------------------------
// 内部: REST 応答（MCP tool 応答の素の JSON）の正規化部品
// ---------------------------------------------------------------------------

/** 一覧系の安全ページ運用（gh CLI 実装の 100 件/ページに揃える）。 */
const LIST_PER_PAGE = 100;
/** 静的 2 ページ plan のページ数（cursor ページングの tool は 1 呼出しで満杯判定）。 */
const STATIC_LIST_PAGES = 2;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function positiveInt(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
}

function stringArrayOf(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((l): l is string => typeof l === "string") : [];
}

function failReply(
  error: string,
  failureClass: GhRunnerFailureClass = "operation-failed",
): GhRunnerReply {
  return { ok: false, error, exitCode: null, failureClass };
}

function splitRepo(slug: string): { owner: string; repo: string } | null {
  const i = slug.indexOf("/");
  if (i <= 0 || i === slug.length - 1) return null;
  return { owner: slug.slice(0, i), repo: slug.slice(i + 1) };
}

/** GitHub REST の labels（{name} オブジェクト配列）をラベル名配列へ写像する。 */
function labelNames(rec: Record<string, unknown>): string[] | null {
  if (!Array.isArray(rec.labels)) return null;
  const names: string[] = [];
  for (const l of rec.labels) {
    if (!isRecord(l)) return null;
    const name = str(l.name);
    if (name === null) return null;
    names.push(name);
  }
  return names;
}

function normalizeIssueState(v: unknown): "open" | "closed" | null {
  const s = str(v);
  if (s === "open") return "open";
  if (s === "closed") return "closed";
  return null;
}

/** REST Issue 応答から追跡Issueメタデータ（labels・role・closeReason）を導出する。 */
function trackingMeta(rec: Record<string, unknown>): {
  labels: string[];
  role: "tracking" | "case";
  closeReason: "completed" | "not_planned" | null;
} | null {
  const state = normalizeIssueState(rec.state);
  const labels = labelNames(rec);
  if (state === null || labels === null) return null;
  const reason = str(rec.state_reason);
  return {
    labels,
    role: deriveRole(labels),
    closeReason: deriveCloseReason(labels, state, reason === "completed" || reason === "not_planned" ? reason : null),
  };
}

/** 実行前状態（before）。issue_update / issue_reopen の runner 応答に含める照合基準。 */
function beforeFrom(rec: Record<string, unknown>): Record<string, unknown> | null {
  const state = normalizeIssueState(rec.state);
  const meta = trackingMeta(rec);
  if (state === null || meta === null) return null;
  return { state, labels: meta.labels, role: meta.role, closeReason: meta.closeReason };
}

function mergeableFrom(v: unknown): "MERGEABLE" | "CONFLICTING" | "UNKNOWN" {
  if (v === true) return "MERGEABLE";
  if (v === false) return "CONFLICTING";
  return "UNKNOWN";
}

/**
 * REST Pull Request 応答を gh CLI 実装（gh pr view --json）と同一の runner 応答
 * 形状へ正規化する。merged と closed の合成（REST は merged 後 state=closed を
 * 返す）と base.ref / head.ref の取出しをここで行う。base・head・createBody は
 * pr_create の読戻し照合（VERIFY）に必要な取得情報である。
 */
function prFromRest(rec: Record<string, unknown>): Record<string, unknown> | null {
  const number = positiveInt(rec.number);
  const title = str(rec.title);
  const body = str(rec.body) ?? "";
  const state = str(rec.state);
  const base = isRecord(rec.base) ? str(rec.base.ref) : null;
  const head = isRecord(rec.head) ? str(rec.head.ref) : null;
  if (number === null || title === null || state === null || base === null || head === null) {
    return null;
  }
  if (state !== "open" && state !== "closed") return null;
  const isDraft = rec.draft;
  if (typeof isDraft !== "boolean") return null;
  const normalizedState = rec.merged === true ? "merged" : state;
  return {
    number,
    title,
    body,
    state: normalizedState,
    mergeable: mergeableFrom(rec.mergeable),
    isDraft,
    base,
    head,
    createBody: body,
  };
}

/** GitHub Release API の応答要素を操作契約の正規化形へ写像する（gh CLI 実装と同一）。 */
function releaseItemFrom(rec: Record<string, unknown>): Record<string, unknown> | null {
  const tagName = str(rec.tag_name);
  const url = str(rec.html_url);
  if (typeof rec.draft !== "boolean" || typeof rec.prerelease !== "boolean") return null;
  const title = str(rec.name) ?? "";
  const publishedAt = str(rec.published_at);
  if (tagName === null || tagName.length === 0 || url === null) return null;
  return {
    tagName,
    title,
    body: str(rec.body) ?? "",
    draft: rec.draft,
    prerelease: rec.prerelease,
    publishedAt,
    url,
  };
}

/** コメント応答要素を公開識別子（commentId = 数値 id の文字列化）へ写像する。 */
function commentItemFrom(rec: Record<string, unknown>): Record<string, unknown> | null {
  const id = rec.id;
  const body = str(rec.body);
  if (typeof id !== "number" || body === null) return null;
  return {
    commentId: String(id),
    body,
    createdAt: str(rec.created_at),
    updatedAt: str(rec.updated_at),
    url: str(rec.html_url),
  };
}

/** コメント応答の issue_url（…/issues/{N}）から親 Issue/PR 番号を導出する。 */
function parentNumberFromUrl(v: unknown): number | null {
  const s = str(v);
  if (s === null) return null;
  const m = /\/issues\/(\d+)$/.exec(s);
  if (m === null) return null;
  const n = Number.parseInt(m[1] ?? "", 10);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

function numericCommentId(v: unknown): number | null {
  const s = str(v);
  if (s === null || !/^\d+$/.test(s)) return null;
  const n = Number.parseInt(s, 10);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

// ---------------------------------------------------------------------------
// 対応付け本体（plan は tool face の呼出しを、interpret は runner 応答形状への
// 正規化を所有する。interpret は gh CLI 実装と同一の payload 形状を返す）
// ---------------------------------------------------------------------------

const CAPABILITY_BY_OPERATION: ReadonlyMap<GhToolOperation, CodexPluginCapability> = new Map(
  CODEX_PLUGIN_CAPABILITIES.map((c) => [c.operation, c]),
);

/**
 * Codex GitHub プラグイン対応付けを構築する。plan は context.repo（owner/name）
 * を閉じ込め、全 tool 呼出しへ明示的な owner/repo 引数を注入する。repo が
 * owner/name で解釈できない場合は全操作が空 plan となり transport は呼ばれない
 * （fail-closed）。
 */
export function createCodexPluginMapping(
  context: CodexPluginMappingContext,
): PluginMapping {
  const base = splitRepo(context.repo);
  const withBase = (args: Record<string, unknown>): Record<string, unknown> | null =>
    base === null ? null : { owner: base.owner, repo: base.repo, ...args };

  const planOf = (request: GhRunnerRequest): readonly PluginCall[] => {
    const args = request.args;
    switch (request.operation) {
      case "issue_create": {
        const labels = stringArrayOf(args.labels);
        const created = withBase({
          method: "create",
          title: args.title,
          body: args.body,
          labels: args.role === "tracking" ? buildTrackingLabels(labels) : labels,
        });
        return created === null ? [] : [{ tool: "issue_write", args: created }];
      }
      case "issue_read": {
        const read = withBase({ method: "get", issue_number: args.number });
        return read === null ? [] : [{ tool: "issue_read", args: read }];
      }
      case "issue_update": {
        // 更新呼出しの引数（labels の role 保持計算）は現状読取の応答に依存する
        // ため、plan は現状読取のみを返し、更新呼出しは nextCall で組み立てる。
        const read = withBase({ method: "get", issue_number: args.number });
        return read === null ? [] : [{ tool: "issue_read", args: read }];
      }
      case "issue_close": {
        const update = withBase({
          method: "update",
          issue_number: args.number,
          state: "closed",
          state_reason: str(args.reason) ?? "completed",
        });
        return update === null ? [] : [{ tool: "issue_write", args: update }];
      }
      case "issue_reopen": {
        const read = withBase({ method: "get", issue_number: args.number });
        const update = withBase({ method: "update", issue_number: args.number, state: "open" });
        if (read === null || update === null) return [];
        return [
          { tool: "issue_read", args: read },
          { tool: "issue_write", args: update },
        ];
      }
      case "issue_list": {
        // search 軸は tool face の自然言語検索と意味が異なるため対応しない
        // （空 plan で停止し、暗黙の意味変化を起こさない）。
        const search = str(args.search);
        if (search !== null && search.length > 0) return [];
        const state = args.state === "open" || args.state === "closed" ? args.state : null;
        const labels = stringArrayOf(args.labels);
        const serverLabels = args.role === "tracking" ? [TRACKING_ROLE_LABEL, ...labels] : labels;
        const list: Record<string, unknown> = { perPage: LIST_PER_PAGE };
        if (state !== null) list.state = state;
        if (serverLabels.length > 0) list.labels = serverLabels;
        const call = withBase(list);
        return call === null ? [] : [{ tool: "list_issues", args: call }];
      }
      case "pr_create": {
        const created = withBase({
          title: args.title,
          body: args.body,
          head: args.head,
          base: args.base,
        });
        return created === null ? [] : [{ tool: "create_pull_request", args: created }];
      }
      case "pr_read":
      case "pr_mergeable": {
        const read = withBase({ method: "get", pullNumber: args.number });
        return read === null ? [] : [{ tool: "pull_request_read", args: read }];
      }
      case "pr_merge": {
        const merged = withBase({
          pullNumber: args.number,
          merge_method: str(args.method) ?? "merge",
        });
        return merged === null ? [] : [{ tool: "merge_pull_request", args: merged }];
      }
      case "pr_changed_files": {
        const calls: PluginCall[] = [];
        for (let page = 1; page <= STATIC_LIST_PAGES; page++) {
          const read = withBase({ method: "get_files", pullNumber: args.number, page, perPage: LIST_PER_PAGE });
          if (read === null) return [];
          calls.push({ tool: "pull_request_read", args: read });
        }
        return calls;
      }
      case "pr_update": {
        const patch: Record<string, unknown> = { pullNumber: args.number };
        if (args.title !== undefined && args.title !== null) patch.title = args.title;
        if (args.body !== undefined && args.body !== null) patch.body = args.body;
        const update = withBase(patch);
        return update === null ? [] : [{ tool: "update_pull_request", args: update }];
      }
      case "comment_create": {
        const created = withBase({ issue_number: args.number, body: args.body });
        return created === null ? [] : [{ tool: "add_issue_comment", args: created }];
      }
      case "comment_list": {
        const calls: PluginCall[] = [];
        for (let page = 1; page <= STATIC_LIST_PAGES; page++) {
          const read = withBase({ method: "get_comments", issue_number: args.number, page, perPage: LIST_PER_PAGE });
          if (read === null) return [];
          calls.push({ tool: "issue_read", args: read });
        }
        return calls;
      }
      case "comment_update": {
        const id = numericCommentId(args.commentId);
        if (id === null) return [];
        const update = withBase({ comment_id: id, body: args.body });
        return update === null ? [] : [{ tool: "update_issue_comment", args: update }];
      }
      case "release_list": {
        const calls: PluginCall[] = [];
        for (let page = 1; page <= STATIC_LIST_PAGES; page++) {
          const list = withBase({ page, perPage: LIST_PER_PAGE });
          if (list === null) return [];
          calls.push({ tool: "list_releases", args: list });
        }
        return calls;
      }
      case "release_read": {
        const read = withBase({ tag: args.tagName });
        return read === null ? [] : [{ tool: "get_release_by_tag", args: read }];
      }
      default:
        return [];
    }
  };

  /**
   * issue_update の更新呼出し（plan の現状読取が 1 応答済みのときだけ組み立てる）。
   * labels 要求は gh CLI 実装と同一の role 保持計算で物理ラベルへ落とす:
   * 要求に追跡軸ラベルを含む場合は role 変更要求として buildTrackingLabels し、
   * 含まない場合は現状 role を復元する（部分更新不変条件）。
   */
  const issueUpdateCallOf = (
    request: GhRunnerRequest,
    payloads: readonly unknown[],
  ): PluginCall | null => {
    if (request.operation !== "issue_update" || payloads.length !== 1) return null;
    const current = payloads[0];
    if (!isRecord(current)) return null;
    const args = request.args;
    const patch: Record<string, unknown> = { method: "update", issue_number: args.number };
    if (args.title !== undefined && args.title !== null) patch.title = args.title;
    if (args.body !== undefined && args.body !== null) patch.body = args.body;
    if (Array.isArray(args.labels)) {
      const labelsRequested = stringArrayOf(args.labels);
      const currentLabels = labelNames(current);
      if (currentLabels === null) return null;
      const roleRequested = labelsRequested.includes(TRACKING_ROLE_LABEL)
        ? "tracking"
        : deriveRole(currentLabels);
      patch.labels = roleRequested === "tracking"
        ? buildTrackingLabels(labelsRequested)
        : [...labelsRequested];
    }
    const update = withBase(patch);
    return update === null ? null : { tool: "issue_write", args: update };
  };

  return {
    supports: (operation) => CAPABILITY_BY_OPERATION.get(operation)?.supported ?? false,
    plan: planOf,
    nextCall: issueUpdateCallOf,
    interpret: (request, payloads) => interpretOf(request, payloads),
  };
}

/**
 * tool 応答（実行順）を runner 応答へ解釈する。payload 形状は gh CLI 実装と
 * 同一であり、各操作スペックの parseSuccess と engine の VERIFY がそのまま
 * 受理する。応答の構造が契約を満たさない場合は失敗 reply を返す（fail-closed）。
 */
function interpretOf(request: GhRunnerRequest, payloads: readonly unknown[]): GhRunnerReply {
  switch (request.operation) {
    case "issue_create":
      return interpretNumberUrlReply(payloads[0], "issue create reply missing number/html_url");
    case "pr_create":
      return interpretNumberUrlReply(payloads[0], "pr create reply missing number/html_url");
    case "pr_update":
      return interpretNumberUrlReply(payloads[0], "pr update reply missing html_url");
    case "issue_read":
      return interpretIssueRead(request, payloads[0]);
    case "issue_update":
      return interpretIssueMutation(request, payloads, "open", "issue update reply missing html_url");
    case "issue_reopen":
      return interpretIssueMutation(request, payloads, "open", "issue reopen reply is not open");
    case "issue_close":
      return interpretIssueClose(request, payloads[0]);
    case "issue_list":
      return interpretIssueList(request, payloads);
    case "pr_read":
    case "pr_mergeable":
      return interpretPrView(request, payloads[0]);
    case "pr_merge":
      return interpretPrMerge(request, payloads[0]);
    case "pr_changed_files":
      return interpretPrChangedFiles(request, payloads);
    case "comment_create":
      return interpretCommentCreated(request, payloads[0], "comment create reply missing id/html_url");
    case "comment_update":
      return interpretCommentUpdated(request, payloads[0]);
    case "comment_list":
      return interpretCommentList(request, payloads);
    case "release_list":
      return interpretReleaseList(request, payloads);
    case "release_read":
      return interpretReleaseRead(request, payloads[0]);
    default:
      return failReply(`host GitHub plugin does not provide the operation: ${request.operation}`);
  }
}

/** { number, url } 形（html_url 由来）の runner 応答への解釈。 */
function interpretNumberUrlReply(payload: unknown, error: string): GhRunnerReply {
  if (!isRecord(payload)) return failReply(error);
  const number = positiveInt(payload.number);
  const url = str(payload.html_url);
  if (number === null || url === null) return failReply(error);
  return { ok: true, payload: { number, url } };
}

/** issue_read の正規化（gh CLI 実装と同一: labels・role・closeReason・updatedAt）。 */
function interpretIssueRead(request: GhRunnerRequest, payload: unknown): GhRunnerReply {
  if (!isRecord(payload)) return failReply("issue reply is not an object");
  const number = positiveInt(request.args.number);
  const title = str(payload.title);
  const body = str(payload.body);
  const updatedAt = str(payload.updated_at);
  const state = normalizeIssueState(payload.state);
  const meta = trackingMeta(payload);
  if (number === null || title === null || body === null || state === null || updatedAt === null) {
    return failReply("issue reply missing state/title/body/updated_at");
  }
  if (meta === null) return failReply("issue reply missing labels");
  return {
    ok: true,
    payload: {
      number,
      title,
      body,
      state,
      labels: meta.labels,
      role: meta.role,
      closeReason: meta.closeReason,
      updatedAt,
    },
  };
}

/**
 * 現状読取（GET）→ 更新（MCP tool）の 2 応答を { number, state, before } 形へ
 * 解釈する。before は engine の VERIFY 追跡軸保持照合の基準である。
 */
function interpretIssueMutation(
  request: GhRunnerRequest,
  payloads: readonly unknown[],
  expectedState: "open",
  updateError: string,
): GhRunnerReply {
  if (payloads.length < 2) {
    return failReply("issue mutation could not build the write call from the pre-read reply");
  }
  if (!isRecord(payloads[0])) return failReply("issue reply is not an object");
  const before = beforeFrom(payloads[0]);
  if (before === null) return failReply("issue mutation cannot read current labels");
  if (!isRecord(payloads[1])) return failReply(updateError);
  const url = str(payloads[1].html_url);
  const state = normalizeIssueState(payloads[1].state);
  const number = positiveInt(request.args.number);
  if (url === null) return failReply(updateError);
  if (state !== expectedState) return failReply(updateError);
  if (request.operation === "issue_update") {
    if (number === null) return failReply(updateError);
    return { ok: true, payload: { number, url, before } };
  }
  return { ok: true, payload: { number, state: "open", before } };
}

function interpretIssueClose(request: GhRunnerRequest, payload: unknown): GhRunnerReply {
  if (!isRecord(payload)) return failReply("issue close reply is not an object");
  const state = normalizeIssueState(payload.state);
  const number = positiveInt(request.args.number);
  if (state !== "closed" || number === null) return failReply("issue close reply is not closed");
  return { ok: true, payload: { number, state: "closed" } };
}

/**
 * 一覧応答（配列ページの実行順並び）を 1 つの正規化一覧へ統合する。
 * 最終ページが満杯（perPage と同数）の場合は不完全一覧を成功扱いにしない
 * （fail-closed。gh CLI 実装の安全ページ上限条項と同一の規律）。
 */
function collectPages(payloads: readonly unknown[], error: string): Record<string, unknown>[] | GhRunnerReply {
  const collected: Record<string, unknown>[] = [];
  for (const payload of payloads) {
    if (!Array.isArray(payload)) return failReply(error);
    collected.push(...(payload.filter((e) => isRecord(e)) as Record<string, unknown>[]));
  }
  const last = payloads[payloads.length - 1];
  if (Array.isArray(last) && last.length >= LIST_PER_PAGE) {
    return failReply(
      `reached the mapping page limit (${payloads.length} pages of ${LIST_PER_PAGE}); narrow the filters and retry`,
    );
  }
  return collected;
}

function interpretIssueList(request: GhRunnerRequest, payloads: readonly unknown[]): GhRunnerReply {
  const collected = collectPages(payloads, "issues list reply is not an array");
  if (!Array.isArray(collected)) return collected;
  const role = request.args.role === "tracking" || request.args.role === "case" ? request.args.role : null;
  const wanted = stringArrayOf(request.args.labels);
  const issues: Record<string, unknown>[] = [];
  for (const rec of collected) {
    if (isRecord(rec.pull_request)) continue;
    const number = positiveInt(rec.number);
    const title = str(rec.title);
    const url = str(rec.html_url);
    const state = normalizeIssueState(rec.state);
    if (number === null || title === null || url === null || state === null) continue;
    const meta = trackingMeta(rec);
    if (meta === null) continue;
    if (role !== null && meta.role !== role) continue;
    if (wanted.length > 0 && !wanted.every((l) => meta.labels.includes(l))) continue;
    issues.push({
      number,
      title,
      url,
      state,
      labels: meta.labels,
      role: meta.role,
      closeReason: meta.closeReason,
    });
  }
  issues.sort((a, b) => (a.number as number) - (b.number as number));
  return { ok: true, payload: { issues } };
}

/** pr_read / pr_mergeable 共通（gh pr view --json と同一の応答形状）。 */
function interpretPrView(request: GhRunnerRequest, payload: unknown): GhRunnerReply {
  if (!isRecord(payload)) return failReply("pr view reply is not an object");
  const pr = prFromRest(payload);
  if (pr === null) return failReply("pr view reply missing number/title/state/base/head/isDraft");
  const number = positiveInt(request.args.number);
  if (number === null || pr.number !== number) return failReply("pr view reply is not the requested pull request");
  return { ok: true, payload: pr };
}

function interpretPrMerge(request: GhRunnerRequest, payload: unknown): GhRunnerReply {
  if (!isRecord(payload)) return failReply("pr merge reply is not an object");
  const number = positiveInt(request.args.number);
  if (number === null) return failReply("pr merge requires number");
  if (payload.merged !== true) {
    return failReply(str(payload.message) ?? "pr merge reply is not merged");
  }
  return { ok: true, payload: { number, merged: true } };
}

function interpretPrChangedFiles(request: GhRunnerRequest, payloads: readonly unknown[]): GhRunnerReply {
  const collected = collectPages(payloads, "pr files reply is not an array");
  if (!Array.isArray(collected)) return collected;
  const files: string[] = [];
  for (const rec of collected) {
    const path = str(rec.filename);
    if (path === null || path.length === 0) return failReply("files entry missing filename");
    files.push(path);
  }
  const number = positiveInt(request.args.number);
  if (number === null) return failReply("pr_changed_files requires number");
  return { ok: true, payload: { number, files } };
}

function interpretCommentCreated(
  request: GhRunnerRequest,
  payload: unknown,
  error: string,
): GhRunnerReply {
  if (!isRecord(payload)) return failReply(error);
  const id = payload.id;
  const url = str(payload.html_url);
  const number = positiveInt(request.args.number);
  if (typeof id !== "number" || url === null || number === null) return failReply(error);
  return { ok: true, payload: { commentId: String(id), url } };
}

/** コメント更新の正規化。number は engine の VERIFY が親対象特定に使う取得情報。 */
function interpretCommentUpdated(request: GhRunnerRequest, payload: unknown): GhRunnerReply {
  if (!isRecord(payload)) return failReply("comment update reply missing html_url/issue_url");
  const url = str(payload.html_url);
  const number = parentNumberFromUrl(payload.issue_url);
  if (url === null || number === null) return failReply("comment update reply missing html_url/issue_url");
  const requested = str(request.args.commentId);
  const commentId = typeof payload.id === "number" ? String(payload.id) : requested;
  if (commentId === null || commentId.length === 0) {
    return failReply("comment update reply missing comment id");
  }
  return { ok: true, payload: { commentId, url, number } };
}

function interpretCommentList(request: GhRunnerRequest, payloads: readonly unknown[]): GhRunnerReply {
  const collected = collectPages(payloads, "comments reply is not an array");
  if (!Array.isArray(collected)) return collected;
  const comments: Record<string, unknown>[] = [];
  for (const rec of collected) {
    const item = commentItemFrom(rec);
    if (item === null) return failReply("comment reply missing id/body");
    comments.push(item);
  }
  const number = positiveInt(request.args.number);
  if (number === null) return failReply("comment_list requires number");
  return { ok: true, payload: { number, comments } };
}

function interpretReleaseList(_request: GhRunnerRequest, payloads: readonly unknown[]): GhRunnerReply {
  const collected = collectPages(payloads, "releases reply is not an array");
  if (!Array.isArray(collected)) return collected;
  const releases: Record<string, unknown>[] = [];
  for (const rec of collected) {
    const item = releaseItemFrom(rec);
    if (item === null) {
      return failReply("release entry missing tag_name/html_url or draft/prerelease flags");
    }
    releases.push(item);
  }
  return { ok: true, payload: { releases } };
}

function interpretReleaseRead(request: GhRunnerRequest, payload: unknown): GhRunnerReply {
  if (!isRecord(payload)) return failReply("release reply is not an object");
  const item = releaseItemFrom(payload);
  if (item === null) return failReply("release reply missing tag_name/html_url or draft/prerelease flags");
  const tagName = str(request.args.tagName);
  if (tagName === null || item.tagName !== tagName) {
    return failReply(`no release found for tag ${tagName ?? ""}`);
  }
  return { ok: true, payload: item };
}
