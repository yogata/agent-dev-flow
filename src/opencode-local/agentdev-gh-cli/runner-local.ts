// agentdev-gh Custom Tool の Local 実現（GhRunner、REQ-011-006 / DEC-004）。
//
// 同一の操作契約（contracts.ts の12操作）を、GitHub Issue/PR の代わりに
// ローカルIssue（`.agentdev/issues/issue-{NNNN}.md`、単一採番空間）の
// 読み書きへ読み替える。Workflow は GitHub 実装（runner-cli.ts）と本実装の
// 差を認識しない。
//
// 読み替え規則（正本: docs/designs/local/local-case-file.md、操作用定義: case-schema/）:
//   - Issue 番号 = ローカルIssue番号（4 桁ゼロ埋め、欠番再利用なし、role ごとに採番を分けない）
//   - frontmatter = 共通メタデータ（id/title/role/status/created_at/updated_at/closed_at/labels）
//   - role: tracking は追跡Issue 6状態、role: case は Case 実行 6状態（role 条件付きスキーマ）
//   - Issue state = status の非終端 → open、終端 → closed（role ごとの終端判定）
//   - PR 系操作（pr_*）の対象は role: case のローカルIssueに限る
//   - issue_comment は role により読み替え先セクションを分岐する
//     （tracking: `## 検討経過`、case: `## 作業ログ`）
//   - 出力 URL = ローカルIssueファイルの絶対パス（GitHub 実装の URL に代わる一意識別子）
//   - 本文の内容Routing（テンプレート展開等）は本 Tool の責務外（REQ-011-020）
//
// 物理写像（role/kind/状態と frontmatter/ラベルの対応）の機械適用は
// Tool 本体の tracking-schema.ts が所有する写像表に従う。


import * as fs from "node:fs";
import * as path from "node:path";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "../../opencode/tools/agentdev-gh/runner.ts";
import {
  LOCAL_TRACKING_LABEL_VALUES,
  LOCAL_TRACKING_STATUS_VALUES,
  parseTrackingKind,
  parseTrackingState,
  REOPEN_TRACKING_STATE,
  TRACKING_KINDS,
  type CloseReason,
  type IssueRole,
  type TrackingKind,
  type TrackingState,
} from "../../opencode/tools/agentdev-gh/tracking-schema.ts";

const ISSUE_FILE_PREFIX = "issue-";
const ISSUE_FILE_SUFFIX = ".md";
const FRONTMATTER_DELIMITER = "---";

const HEADING_WORKLOG = "## 作業ログ";
const HEADING_DISCUSSION = "## 検討経過";
const HEADING_MERGE_CHECK = "## マージ前確認";
const HEADING_MERGE_RESULT = "## マージ結果";
const HEADINGS_BEFORE_WORKLOG = [HEADING_MERGE_CHECK, "## Design確定候補", "## Findings / Capture候補"];
const PR_TITLE_PREFIX = "### PR title: ";

const CASE_NON_TERMINAL_STATUSES = ["open", "running", "blocked", "review"] as const;
const CASE_TERMINAL_STATUSES = ["closed", "cancelled"] as const;
const CASE_STATUS_VALUES = [...CASE_NON_TERMINAL_STATUSES, ...CASE_TERMINAL_STATUSES] as const;
const CASE_LABEL_VALUES = ["feature", "bugfix", "maintenance", "docs", "refactor", "chore", "epic"] as const;

export interface LocalRunnerOptions {
  /** ローカルIssueの配置ディレクトリ（`.agentdev/issues`）。 */
  readonly issuesDir: string;
  /** 日時の注入点（テスト用）。省略時は実行時刻。 */
  readonly now?: () => Date;
}

/** ローカルIssueの共通メタデータ（frontmatter）。 */
export interface LocalIssueFrontmatter {
  readonly id: string;
  readonly title: string;
  readonly role: IssueRole;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly closed_at: string;
  readonly labels: readonly string[];
}

/** role 条件付きスキーマの検証結果。 */
export interface LocalIssueValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/** role ごとの status 値域（role 条件付きスキーマの機械検証用）。 */
export function localStatusValues(role: IssueRole): readonly string[] {
  return role === "tracking" ? LOCAL_TRACKING_STATUS_VALUES : CASE_STATUS_VALUES;
}

/** role ごとの labels 値域（同上）。 */
export function localLabelValues(role: IssueRole): readonly string[] {
  return role === "tracking" ? LOCAL_TRACKING_LABEL_VALUES : CASE_LABEL_VALUES;
}

/** role ごとの終端 status。 */
export function localTerminalStatuses(role: IssueRole): readonly string[] {
  return role === "tracking" ? ["closed"] : CASE_TERMINAL_STATUSES;
}

/** role 条件付きスキーマの検証（共通メタデータ、status 値域、labels 値域、closed_at 条件）。 */
export function validateLocalIssue(
  fm: LocalIssueFrontmatter,
  fileName: string,
): LocalIssueValidation {
  const errors: string[] = [];
  const expectedId = `${ISSUE_FILE_PREFIX}${fileName.replace(ISSUE_FILE_PREFIX, "").replace(ISSUE_FILE_SUFFIX, "")}`;
  if (fm.id !== fileName.replace(ISSUE_FILE_SUFFIX, "") && fm.id !== expectedId) {
    errors.push(`id must match the file name (${fileName})`);
  }
  if (!new RegExp(`^${ISSUE_FILE_PREFIX}[0-9]{4}$`).test(fm.id)) {
    errors.push(`id must be ${ISSUE_FILE_PREFIX}{NNNN}: ${fm.id}`);
  }
  if (fm.title.length === 0) errors.push("title must not be empty");
  if (fm.role !== "tracking" && fm.role !== "case") {
    errors.push(`role must be tracking or case: ${fm.role}`);
    return { valid: false, errors };
  }
  if (!localStatusValues(fm.role).includes(fm.status)) {
    errors.push(`status '${fm.status}' is not in the ${fm.role} status values`);
  }
  const labelValues = localLabelValues(fm.role);
  for (const label of fm.labels) {
    if (!labelValues.includes(label)) {
      errors.push(`label '${label}' is not in the ${fm.role} label values`);
    }
  }
  if (fm.role === "tracking") {
    const kindLabels = fm.labels.filter((l) =>
      (TRACKING_KINDS as readonly string[]).includes(l),
    );
    if (kindLabels.length !== 1) {
      errors.push("tracking issues require exactly one kind label");
    }
  }
  const terminal = localTerminalStatuses(fm.role).includes(fm.status);
  if (terminal && fm.closed_at.length === 0) {
    errors.push("terminal status requires closed_at");
  }
  if (!terminal && fm.closed_at.length > 0) {
    errors.push("non-terminal status must not have closed_at");
  }
  return { valid: errors.length === 0, errors };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function toLf(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function issueFileName(number: number): string {
  return `${ISSUE_FILE_PREFIX}${String(number).padStart(4, "0")}${ISSUE_FILE_SUFFIX}`;
}

function parseIssueNumber(fileName: string): number | null {
  if (!fileName.startsWith(ISSUE_FILE_PREFIX) || !fileName.endsWith(ISSUE_FILE_SUFFIX)) return null;
  const digits = fileName.slice(ISSUE_FILE_PREFIX.length, -ISSUE_FILE_SUFFIX.length);
  if (!/^\d{4}$/.test(digits)) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function quoteYamlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function serializeFrontmatter(fm: LocalIssueFrontmatter): string {
  const labels = fm.labels.length > 0 ? `[${fm.labels.join(", ")}]` : "[]";
  return [
    FRONTMATTER_DELIMITER,
    `id: ${fm.id}`,
    `title: ${quoteYamlString(fm.title)}`,
    `role: ${fm.role}`,
    `status: ${fm.status}`,
    `created_at: ${quoteYamlString(fm.created_at)}`,
    `updated_at: ${quoteYamlString(fm.updated_at)}`,
    `closed_at: ${fm.closed_at.length > 0 ? quoteYamlString(fm.closed_at) : '""'}`,
    `labels: ${labels}`,
    FRONTMATTER_DELIMITER,
  ].join("\n");
}

interface ParsedIssue {
  readonly fm: LocalIssueFrontmatter;
  readonly bodyAfterFrontmatter: string;
  readonly raw: string;
}

function unquoteYamlString(v: string): string {
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return v;
}

function parseIssue(raw: string): ParsedIssue | null {
  const text = toLf(raw);
  const lines = text.split("\n");
  if (lines[0] !== FRONTMATTER_DELIMITER) return null;
  const end = lines.indexOf(FRONTMATTER_DELIMITER, 1);
  if (end < 0) return null;
  const fields = new Map<string, string>();
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    const colon = line.indexOf(": ");
    if (colon <= 0) continue;
    fields.set(line.slice(0, colon), line.slice(colon + 2).trim());
  }
  const id = fields.get("id");
  const title = fields.get("title");
  const role = fields.get("role");
  const status = fields.get("status");
  const created = fields.get("created_at");
  const updated = fields.get("updated_at");
  if (
    id === undefined || title === undefined || role === undefined ||
    status === undefined || created === undefined || updated === undefined
  ) {
    return null;
  }
  if (role !== "tracking" && role !== "case") return null;
  const labelsRaw = fields.get("labels") ?? "[]";
  const labelsInner = labelsRaw.replace(/^\[/, "").replace(/\]$/, "").trim();
  const labels = labelsInner.length > 0 ? labelsInner.split(",").map((s) => s.trim()) : [];
  return {
    fm: {
      id,
      title: unquoteYamlString(title),
      role,
      status,
      created_at: unquoteYamlString(created),
      updated_at: unquoteYamlString(updated),
      closed_at: unquoteYamlString(fields.get("closed_at") ?? '""'),
      labels,
    },
    bodyAfterFrontmatter: lines.slice(end + 1).join("\n"),
    raw: text,
  };
}

function isTerminal(role: IssueRole, status: string): boolean {
  return localTerminalStatuses(role).includes(status);
}

function isoNow(now: () => Date): string {
  return now().toISOString();
}

/** Local 実装の GhRunner。 */
export class LocalRunner implements GhRunner {
  private readonly issuesDir: string;
  private readonly now: () => Date;

  constructor(options: LocalRunnerOptions) {
    this.issuesDir = options.issuesDir;
    this.now = options.now ?? (() => new Date());
  }

  async run(request: GhRunnerRequest): Promise<GhRunnerReply> {
    try {
      return this.runSync(request);
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        exitCode: null,
      };
    }
  }

  private fail(error: string): GhRunnerReply {
    return { ok: false, error, exitCode: null };
  }

  private issuePath(number: number): string {
    return path.join(this.issuesDir, issueFileName(number));
  }

  private readIssue(number: number): { parsed: ParsedIssue; file: string } | null {
    const file = this.issuePath(number);
    if (!fs.existsSync(file)) return null;
    const parsed = parseIssue(fs.readFileSync(file, "utf8"));
    if (parsed === null) return null;
    const validation = validateLocalIssue(parsed.fm, path.basename(file));
    if (!validation.valid) {
      throw new Error(
        `local issue ${issueFileName(number)} violates the role-conditional schema: ${validation.errors.join("; ")}`,
      );
    }
    return { parsed, file };
  }

  private writeIssue(number: number, raw: string): void {
    fs.mkdirSync(this.issuesDir, { recursive: true });
    fs.writeFileSync(this.issuePath(number), toLf(raw), "utf8");
  }

  private requireNumber(args: Record<string, unknown>): number | null {
    const n = args.number;
    return typeof n === "number" && Number.isInteger(n) && n > 0 ? n : null;
  }

  private nextIssueNumber(): number {
    return this.latestIssueNumber() + 1;
  }

  private latestIssueNumber(role?: IssueRole): number {
    fs.mkdirSync(this.issuesDir, { recursive: true });
    let max = 0;
    for (const entry of fs.readdirSync(this.issuesDir)) {
      const n = parseIssueNumber(entry);
      if (n === null || n <= max) continue;
      if (role !== undefined) {
        const parsed = parseIssue(
          fs.readFileSync(path.join(this.issuesDir, entry), "utf8"),
        );
        if (parsed === null || parsed.fm.role !== role) continue;
      }
      max = n;
    }
    return max;
  }

  /** Issue 系の state 出力（role ごとの終端判定: 非終端 → open、終端 → closed）。 */
  private issueState(role: IssueRole, status: string): "open" | "closed" | null {
    if (!localStatusValues(role).includes(status)) return null;
    return isTerminal(role, status) ? "closed" : "open";
  }

  private trackingMetaOf(parsed: ParsedIssue): {
    kind: TrackingKind | null;
    trackingState: TrackingState | null;
    closeReason: CloseReason | null;
  } {
    if (parsed.fm.role !== "tracking") {
      return { kind: null, trackingState: null, closeReason: null };
    }
    const kind = parseTrackingKind(parsed.fm.labels.find((l) =>
      (TRACKING_KINDS as readonly string[]).includes(l),
    ));
    return { kind, trackingState: parsed.fm.status as TrackingState, closeReason: null };
  }

  private hasMergeResult(parsed: ParsedIssue): boolean {
    return parsed.raw.split("\n").some((l) => l.trim() === HEADING_MERGE_RESULT);
  }

  private mergeableOf(parsed: ParsedIssue): "MERGEABLE" | "CONFLICTING" | "UNKNOWN" {
    return parsed.fm.status === "review" ? "MERGEABLE" : "UNKNOWN";
  }

  private prTitle(parsed: ParsedIssue): string | null {
    const lines = parsed.raw.split("\n");
    let title: string | null = null;
    for (const line of lines) {
      if (line.startsWith(PR_TITLE_PREFIX)) {
        title = line.slice(PR_TITLE_PREFIX.length).trim();
      }
    }
    return title;
  }

  private runSync(request: GhRunnerRequest): GhRunnerReply {
    const args = isRecord(request.args) ? request.args : {};
    switch (request.operation) {
      case "issue_create":
        return this.issueCreate(args);
      case "issue_read":
        return this.issueRead(args);
      case "issue_update":
        return this.issueUpdate(args);
      case "issue_comment":
        return this.issueComment(args);
      case "issue_close":
        return this.issueClose(args);
      case "issue_list":
        return this.issueList(args);
      case "issue_reopen":
        return this.issueReopen(args);
      case "pr_create":
        return this.prCreate(args);
      case "pr_read":
        return this.prRead(args);
      case "pr_merge":
        return this.prMerge(args);
      case "pr_changed_files":
        return this.prChangedFiles(args);
      case "pr_mergeable":
        return this.prMergeable(args);
    }
  }

  // ---------------------------------------------------------------------
  // Issue 系
  // ---------------------------------------------------------------------

  private issueCreate(args: Record<string, unknown>): GhRunnerReply {
    const title = typeof args.title === "string" ? args.title : null;
    const body = typeof args.body === "string" ? args.body : null;
    if (title === null || body === null) return this.fail("issue_create requires title and body");
    const role: IssueRole = args.role === "tracking" ? "tracking" : "case";
    const kind = args.kind === undefined ? null : parseTrackingKind(args.kind);
    if (args.kind !== undefined && kind === null) {
      return this.fail("issue_create received an invalid kind");
    }
    const labels = Array.isArray(args.labels)
      ? args.labels.filter((l): l is string => typeof l === "string")
      : [];
    if (role === "tracking" && kind === null) {
      return this.fail("tracking issue_create requires a kind");
    }
    const labelValues = localLabelValues(role);
    for (const label of labels) {
      if (!labelValues.includes(label)) {
        return this.fail(`label '${label}' is not in the ${role} label values`);
      }
    }
    const finalLabels = role === "tracking" && kind !== null ? [kind] : labels;
    const number = this.nextIssueNumber();
    const timestamp = isoNow(this.now);
    const initialStatus = role === "tracking" ? "created" : "open";
    const fm: LocalIssueFrontmatter = {
      id: `${ISSUE_FILE_PREFIX}${String(number).padStart(4, "0")}`,
      title,
      role,
      status: initialStatus,
      created_at: timestamp,
      updated_at: timestamp,
      closed_at: "",
      labels: finalLabels,
    };
    this.writeIssue(number, `${serializeFrontmatter(fm)}\n${toLf(body)}`);
    return { ok: true, payload: { number, url: this.issuePath(number) } };
  }

  private issueRead(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_read requires number");
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    const state = this.issueState(c.parsed.fm.role, c.parsed.fm.status);
    if (state === null) return this.fail(`unknown issue status: ${c.parsed.fm.status}`);
    const meta = this.trackingMetaOf(c.parsed);
    return {
      ok: true,
      payload: {
        number,
        title: c.parsed.fm.title,
        body: c.parsed.raw,
        state,
        labels: c.parsed.fm.labels,
        role: c.parsed.fm.role,
        kind: meta.kind,
        trackingState: meta.trackingState,
        closeReason: meta.closeReason,
      },
    };
  }

  private issueUpdate(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_update requires number");
    const kind = args.kind === undefined ? null : parseTrackingKind(args.kind);
    if (args.kind !== undefined && kind === null) {
      return this.fail("issue_update received an invalid kind");
    }
    const trackingState =
      args.trackingState === undefined ? null : parseTrackingState(args.trackingState);
    if (
      args.trackingState !== undefined &&
      (trackingState === null || trackingState === "closed")
    ) {
      return this.fail("issue_update trackingState must be a non-terminal state");
    }
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    const fm = c.parsed.fm;

    if (typeof args.body === "string") {
      const replaced = parseIssue(toLf(args.body));
      if (replaced === null) {
        return this.fail("issue_update body must be the full local issue content");
      }
      const validation = validateLocalIssue(replaced.fm, issueFileName(number));
      if (!validation.valid) {
        return this.fail(`issue_update body violates the schema: ${validation.errors.join("; ")}`);
      }
      this.writeIssue(number, toLf(args.body));
      return { ok: true, payload: { number, url: this.issuePath(number) } };
    }

    if ((kind !== null || trackingState !== null) && fm.role !== "tracking") {
      return this.fail("issue_update kind/trackingState apply only to tracking issues");
    }

    const nextFm = {
      id: fm.id,
      title: fm.title,
      role: fm.role,
      status: fm.status,
      created_at: fm.created_at,
      updated_at: fm.updated_at,
      closed_at: fm.closed_at,
      labels: [...fm.labels],
    };
    let changed = false;
    if (typeof args.title === "string" && args.title.length > 0) {
      nextFm.title = args.title;
      changed = true;
    }
    if (kind !== null) {
      nextFm.labels = [kind];
      changed = true;
    }
    if (trackingState !== null) {
      nextFm.status = trackingState;
      changed = true;
    }
    if (Array.isArray(args.labels)) {
      const labels = args.labels.filter((l): l is string => typeof l === "string");
      const labelValues = localLabelValues(fm.role);
      for (const label of labels) {
        if (!labelValues.includes(label)) {
          return this.fail(`label '${label}' is not in the ${fm.role} label values`);
        }
      }
      if (fm.role === "tracking") {
        const currentKind = nextFm.labels.find((l) =>
          (TRACKING_KINDS as readonly string[]).includes(l),
        );
        nextFm.labels = currentKind !== undefined ? [currentKind, ...labels] : labels;
      } else {
        nextFm.labels = labels;
      }
      changed = true;
    }
    if (!changed) {
      return this.fail("issue_update requires title, body, labels, kind, or trackingState");
    }
    const validation = validateLocalIssue(nextFm, issueFileName(number));
    if (!validation.valid) {
      return this.fail(`issue_update violates the schema: ${validation.errors.join("; ")}`);
    }
    nextFm.updated_at = isoNow(this.now);
    this.writeIssue(
      number,
      `${serializeFrontmatter(nextFm)}\n${c.parsed.bodyAfterFrontmatter.replace(/^\n+/, "")}`,
    );
    return { ok: true, payload: { number, url: this.issuePath(number) } };
  }

  private issueComment(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_comment requires number");
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    if (args.body === undefined) {
      return { ok: true, payload: { number, comments: this.readComments(c.parsed) } };
    }
    const body = typeof args.body === "string" ? args.body : null;
    if (body === null) return this.fail("issue_comment requires a string body");
    const lines = c.parsed.raw.split("\n");
    if (c.parsed.fm.role === "tracking") {
      const entry = [
        "",
        `### ${isoNow(this.now)}`,
        "",
        toLf(body).replace(/^\n+/, "").replace(/\n+$/, ""),
        "",
      ].join("\n");
      if (!lines.some((l) => l.trim() === HEADING_DISCUSSION)) {
        lines.push("", HEADING_DISCUSSION, "");
      }
      this.writeIssue(number, `${lines.join("\n").replace(/\n+$/, "")}\n${entry}`);
      return { ok: true, payload: { number, url: this.issuePath(number) } };
    }
    let insertAt = lines.length;
    if (!lines.some((l) => l.trim() === HEADING_WORKLOG)) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;
        if (HEADINGS_BEFORE_WORKLOG.some((h) => line.trim() === h)) {
          insertAt = i;
          break;
        }
      }
      lines.splice(insertAt, 0, HEADING_WORKLOG, "");
    }
    const updated = `${lines.join("\n").replace(/\n+$/, "")}\n${toLf(body).replace(/^\n+/, "").replace(/\n+$/, "")}\n`;
    this.writeIssue(number, updated);
    return { ok: true, payload: { number, url: this.issuePath(number) } };
  }

  /** コメント読取（role 分岐: tracking は検討経過の日時エントリ、case は作業ログ全文）。 */
  private readComments(parsed: ParsedIssue): { body: string; createdAt: string | null; url: null }[] {
    const lines = parsed.raw.split("\n");
    if (parsed.fm.role === "tracking") {
      const comments: { body: string; createdAt: string | null; url: null }[] = [];
      let inSection = false;
      let current: { createdAt: string | null; bodyLines: string[] } | null = null;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === HEADING_DISCUSSION) {
          inSection = true;
          continue;
        }
        if (trimmed.startsWith("## ")) {
          if (trimmed !== HEADING_DISCUSSION) inSection = false;
          continue;
        }
        if (!inSection) continue;
        if (trimmed.startsWith("### ")) {
          if (current !== null && (current.createdAt !== null || current.bodyLines.length > 0)) {
            comments.push({
              body: current.bodyLines.join("\n").replace(/\n+$/, ""),
              createdAt: current.createdAt,
              url: null,
            });
          }
          current = { createdAt: trimmed.slice(4).trim() || null, bodyLines: [] };
          continue;
        }
        if (current !== null) current.bodyLines.push(line);
      }
      if (current !== null && (current.createdAt !== null || current.bodyLines.length > 0)) {
        comments.push({
          body: current.bodyLines.join("\n").replace(/\n+$/, ""),
          createdAt: current.createdAt,
          url: null,
        });
      }
      return comments;
    }
    const start = lines.findIndex((l) => l.trim() === HEADING_WORKLOG);
    if (start < 0) return [];
    const body: string[] = [];
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;
      if (line.trim().startsWith("## ")) break;
      body.push(line);
    }
    const text = body.join("\n").replace(/^\n+/, "").replace(/\n+$/, "");
    if (text.length === 0) return [];
    return [{ body: text, createdAt: null, url: null }];
  }

  private issueClose(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_close requires number");
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    const reason = typeof args.reason === "string" ? args.reason : "completed";
    const terminal =
      c.parsed.fm.role === "tracking"
        ? "closed"
        : reason === "not_planned"
          ? "cancelled"
          : "closed";
    const fm: LocalIssueFrontmatter = {
      ...c.parsed.fm,
      status: terminal,
      closed_at: isoNow(this.now),
      updated_at: isoNow(this.now),
    };
    const validation = validateLocalIssue(fm, issueFileName(number));
    if (!validation.valid) {
      return this.fail(`issue_close violates the schema: ${validation.errors.join("; ")}`);
    }
    this.writeIssue(
      number,
      `${serializeFrontmatter(fm)}\n${c.parsed.bodyAfterFrontmatter.replace(/^\n+/, "")}`,
    );
    return { ok: true, payload: { number, state: "closed" } };
  }

  private issueList(args: Record<string, unknown>): GhRunnerReply {
    const role = args.role === "tracking" || args.role === "case" ? args.role : null;
    const kind = args.kind === undefined ? null : parseTrackingKind(args.kind);
    if (args.kind !== undefined && kind === null) {
      return this.fail("issue_list received an invalid kind");
    }
    const state = args.state === "open" || args.state === "closed" ? args.state : null;
    const trackingState =
      args.trackingState === undefined ? null : parseTrackingState(args.trackingState);
    if (args.trackingState !== undefined && trackingState === null) {
      return this.fail("issue_list received an invalid trackingState");
    }
    const labels = Array.isArray(args.labels)
      ? args.labels.filter((l): l is string => typeof l === "string")
      : [];
    const search = typeof args.search === "string" && args.search.length > 0 ? args.search : null;

    fs.mkdirSync(this.issuesDir, { recursive: true });
    const issues: Record<string, unknown>[] = [];
    const entries = fs.readdirSync(this.issuesDir).sort();
    for (const entry of entries) {
      const n = parseIssueNumber(entry);
      if (n === null) continue;
      const parsed = parseIssue(fs.readFileSync(path.join(this.issuesDir, entry), "utf8"));
      if (parsed === null) continue;
      const validation = validateLocalIssue(parsed.fm, entry);
      if (!validation.valid) continue;
      const issueState = this.issueState(parsed.fm.role, parsed.fm.status);
      if (issueState === null) continue;
      const meta = this.trackingMetaOf(parsed);
      if (role !== null && parsed.fm.role !== role) continue;
      if (kind !== null && meta.kind !== kind) continue;
      if (state !== null && issueState !== state) continue;
      if (trackingState !== null && meta.trackingState !== trackingState) continue;
      if (labels.length > 0 && !labels.every((l) => parsed.fm.labels.includes(l))) continue;
      if (search !== null && !parsed.fm.title.includes(search)) continue;
      issues.push({
        number: n,
        title: parsed.fm.title,
        url: this.issuePath(n),
        state: issueState,
        labels: parsed.fm.labels,
        role: parsed.fm.role,
        kind: meta.kind,
        trackingState: meta.trackingState,
        closeReason: meta.closeReason,
      });
    }
    return { ok: true, payload: { issues } };
  }

  private issueReopen(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_reopen requires number");
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    if (c.parsed.fm.role !== "tracking") {
      return this.fail("issue_reopen applies only to tracking issues in the local implementation");
    }
    if (c.parsed.fm.status !== "closed") {
      return this.fail(`issue_reopen requires a closed tracking issue: ${c.parsed.fm.status}`);
    }
    const fm: LocalIssueFrontmatter = {
      ...c.parsed.fm,
      status: REOPEN_TRACKING_STATE,
      closed_at: "",
      updated_at: isoNow(this.now),
    };
    const validation = validateLocalIssue(fm, issueFileName(number));
    if (!validation.valid) {
      return this.fail(`issue_reopen violates the schema: ${validation.errors.join("; ")}`);
    }
    this.writeIssue(
      number,
      `${serializeFrontmatter(fm)}\n${c.parsed.bodyAfterFrontmatter.replace(/^\n+/, "")}`,
    );
    return { ok: true, payload: { number, state: "open" } };
  }

  // ---------------------------------------------------------------------
  // PR 系（対象は role: case のローカルIssueに限る）
  // ---------------------------------------------------------------------

  private requireCaseIssue(number: number): { parsed: ParsedIssue } | GhRunnerReply {
    const c = this.readIssue(number);
    if (c === null) {
      return this.fail(`local issue not found: ${issueFileName(number)}`);
    }
    if (c.parsed.fm.role !== "case") {
      return this.fail(
        `PR operations apply only to role: case local issues: ${issueFileName(number)}`,
      );
    }
    return { parsed: c.parsed };
  }

  private prCreate(args: Record<string, unknown>): GhRunnerReply {
    const title = typeof args.title === "string" ? args.title : null;
    const body = typeof args.body === "string" ? args.body : null;
    if (title === null || body === null) return this.fail("pr_create requires title and body");
    // 操作契約上 pr_create は番号を持たないため、ローカル版は最新の role: case ローカルIssueを対象とする。
    const number = this.requireNumber(args) ?? this.latestIssueNumber("case");
    if (number <= 0) return this.fail("pr_create requires an existing case issue");
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    const section = [
      "",
      HEADING_MERGE_CHECK,
      "",
      `${PR_TITLE_PREFIX}${title}`,
      "",
      toLf(body).replace(/\n+$/, ""),
      "",
    ].join("\n");
    this.writeIssue(number, `${target.parsed.raw.replace(/\n+$/, "")}\n${section}`);
    return { ok: true, payload: { number, url: this.issuePath(number) } };
  }

  private prRead(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_read requires number");
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    const title = this.prTitle(target.parsed);
    const state = this.hasMergeResult(target.parsed)
      ? "merged"
      : this.issueState("case", target.parsed.fm.status);
    if (title === null || state === null) {
      return this.fail(`local issue has no PR section: ${issueFileName(number)}`);
    }
    return {
      ok: true,
      payload: { number, title, state, mergeable: this.mergeableOf(target.parsed) },
    };
  }

  private prMerge(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_merge requires number");
    const method = typeof args.method === "string" ? args.method : "merge";
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    const timestamp = isoNow(this.now);
    const record = [
      "",
      HEADING_MERGE_RESULT,
      "",
      `- 操作: ローカル取り込み（merge 方式: ${method}）`,
      `- 実行日時: ${timestamp}`,
      `- 結果: PASS`,
      "",
    ].join("\n");
    if (this.hasMergeResult(target.parsed)) {
      return this.fail(`local issue already has a merge result: ${issueFileName(number)}`);
    }
    this.writeIssue(number, `${target.parsed.raw.replace(/\n+$/, "")}\n${record}`);
    return { ok: true, payload: { number, merged: true } };
  }

  private prChangedFiles(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_changed_files requires number");
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    // ローカル版に変更ファイル一覧は存在しない（Git worktree の実状態が正）。
    return { ok: true, payload: { number, files: [] } };
  }

  private prMergeable(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_mergeable requires number");
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    return { ok: true, payload: { number, mergeable: this.mergeableOf(target.parsed) } };
  }
}

/** Local 実装の GhRunner を構築する。 */
export function createLocalRunner(options: LocalRunnerOptions): GhRunner {
  return new LocalRunner(options);
}
