// agentdev-gh Custom Tool の Local 実現（GhRunner、REQ-011-006 / DEC-004）。
// ADF-COVERS(implementation): REQ-011-024, REQ-011-025, REQ-011-026, REQ-011-027, REQ-011-030
//
// 同一の操作契約（contracts.ts の16操作 + 温存中の issue_comment）を、GitHub Issue/PR
// の代わりにローカルIssue（`.agentdev/issues/issue-{NNNN}.md`、単一採番空間）の
// 読み書きへ読み替える。Workflow は GitHub 実装（runner-cli.ts）と本実装の
// 差を認識しない。
//
// 読み替え規則（正本: docs/designs/local/local-case-file.md、操作用定義: case-schema/）:
//   - Issue 番号 = ローカルIssue番号（4 桁ゼロ埋め、欠番再利用なし、role ごとに採番を分けない）
//   - frontmatter = 共通メタデータ（id/title/role/status/created_at/updated_at/closed_at/labels/comment_seq）
//   - role: tracking は追跡Issue 6状態、role: case は Case 実行 6状態（role 条件付きスキーマ）
//   - Issue state = status の非終端 → open、終端 → closed（role ごとの終端判定）
//   - PR 系操作（pr_*）の対象は role: case のローカルIssueに限る
//   - 論理 PR 本文 = `## マージ前確認` / `## Design確定候補` / `## Findings / Capture候補`
//     の3セクションの定義順直列化。PR タイトルの正は マージ前確認 内の PR タイトル行
//   - Comment 操作（comment_*）と issue_comment は role により読み替え先セクションを分岐する
//     （tracking: `## 検討経過`、case: `## 作業ログ`）
//   - コメント相当エントリは `### c{NN} {ISO 8601}` 見出し（更新時 `(updated {ISO 8601})`
//     接尾辞）を持ち、commentId の物理表現は `issue-{NNNN}-c{NN}`（公開型は文字列）。
//     採番の最高水位標は frontmatter `comment_seq`（初回コメント書込時に初期化、単調増加、
//     削除による欠番は再利用しない）。旧形式（`### {ISO 8601}` のみ）の既存エントリと
//     role: case の無区切り作業ログ内容（初回コメント操作時に c01 へ束ね）は、最初の
//     コメント書込操作の一部として冪等に新形式へ移行する
//   - コメント書込（新規採番・旧形式移行を含む）はファイル全体の原子的書込み
//     （一時ファイル書込み後にリネーム）で行う
//   - 出力 URL = ローカルIssueファイルの絶対パス（GitHub 実装の URL に代わる一意識別子）
//   - 本文の内容Routing（テンプレート展開等）は本 Tool の責務外（REQ-011-020）
//
// 物理写像（role/kind/状態と frontmatter/ラベルの対応）の機械適用は
// Tool 本体の tracking-schema.ts が所有する写像表に従う。


import * as fs from "node:fs";
import * as path from "node:path";
import type {
  GhRunner,
  GhRunnerFailureClass,
  GhRunnerReply,
  GhRunnerRequest,
} from "../../opencode/tools/agentdev-gh/runner.ts";
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
const HEADING_DESIGN_CANDIDATES = "## Design確定候補";
const HEADING_FINDINGS = "## Findings / Capture候補";
const HEADINGS_BEFORE_WORKLOG = [HEADING_MERGE_CHECK, HEADING_DESIGN_CANDIDATES, HEADING_FINDINGS];
const PR_BODY_SECTIONS = [HEADING_MERGE_CHECK, HEADING_DESIGN_CANDIDATES, HEADING_FINDINGS];
const PR_TITLE_PREFIX = "### PR title: ";

const CASE_NON_TERMINAL_STATUSES = ["open", "running", "blocked", "review"] as const;
const CASE_TERMINAL_STATUSES = ["closed", "cancelled"] as const;
const CASE_STATUS_VALUES = [...CASE_NON_TERMINAL_STATUSES, ...CASE_TERMINAL_STATUSES] as const;
const CASE_LABEL_VALUES = ["feature", "bugfix", "maintenance", "docs", "refactor", "chore", "epic"] as const;

const COMMENT_ENTRY_HEADING_RE = /^### c(\d{2,}) (\S+)(?: \(updated (\S+)\))?$/;
const LEGACY_COMMENT_ENTRY_RE = /^### (\S+)$/;
const COMMENT_ID_RE = /^issue-(\d{4})-c(\d{2,})$/;

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
  /** コメント採番の最高水位標（任意。初回コメント書込時に初期化し単調増加）。 */
  readonly comment_seq?: number;
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
  if (fm.comment_seq !== undefined && (!Number.isInteger(fm.comment_seq) || fm.comment_seq < 0)) {
    errors.push(`comment_seq must be a non-negative integer: ${String(fm.comment_seq)}`);
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
  const lines = [
    FRONTMATTER_DELIMITER,
    `id: ${fm.id}`,
    `title: ${quoteYamlString(fm.title)}`,
    `role: ${fm.role}`,
    `status: ${fm.status}`,
    `created_at: ${quoteYamlString(fm.created_at)}`,
    `updated_at: ${quoteYamlString(fm.updated_at)}`,
    `closed_at: ${fm.closed_at.length > 0 ? quoteYamlString(fm.closed_at) : '""'}`,
    `labels: ${labels}`,
  ];
  if (fm.comment_seq !== undefined) lines.push(`comment_seq: ${fm.comment_seq}`);
  lines.push(FRONTMATTER_DELIMITER);
  return lines.join("\n");
}

interface ParsedIssue {
  readonly fm: LocalIssueFrontmatter;
  readonly bodyAfterFrontmatter: string;
  readonly raw: string;
  /** frontmatter の閉じデリミタ（`---`）の行番号（0 基）。 */
  readonly fmEndLine: number;
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
  const commentSeqRaw = fields.get("comment_seq");
  const commentSeq =
    commentSeqRaw !== undefined && /^\d+$/.test(commentSeqRaw)
      ? Number.parseInt(commentSeqRaw, 10)
      : undefined;
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
      ...(commentSeq !== undefined ? { comment_seq: commentSeq } : {}),
    },
    bodyAfterFrontmatter: lines.slice(end + 1).join("\n"),
    raw: text,
    fmEndLine: end,
  };
}

function isTerminal(role: IssueRole, status: string): boolean {
  return localTerminalStatuses(role).includes(status);
}

/** 本文の `## ` レベル2見出し行の判定（`### ` レベル3は含まない）。 */
function isLevel2Heading(line: string): boolean {
  const t = line.trim();
  return t.startsWith("## ") && t !== "## ";
}

interface SectionSpan {
  readonly start: number;
  readonly end: number;
}

function sectionSpans(lines: readonly string[], heading: string): SectionSpan[] {
  const spans: SectionSpan[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.trim() !== heading) continue;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (isLevel2Heading(lines[j] ?? "")) {
        end = j;
        break;
      }
    }
    spans.push({ start: i, end });
  }
  return spans;
}

function lastSectionSpan(lines: readonly string[], heading: string): SectionSpan | null {
  const spans = sectionSpans(lines, heading);
  return spans.length > 0 ? spans[spans.length - 1]! : null;
}

/** セクション本文行（先頭・末尾の空行を除去したもの）。 */
function sectionContentLines(lines: readonly string[], span: SectionSpan): string[] {
  const content = lines.slice(span.start + 1, span.end);
  while (content.length > 0 && content[0] === "") content.shift();
  while (content.length > 0 && content[content.length - 1] === "") content.pop();
  return content;
}

/** コメント相当エントリの解析結果（行範囲で保持し、本文は byte 保存で復元する）。 */
interface CommentEntrySpan {
  /** c{NN} の採番。旧形式（未採番）は null。 */
  readonly seq: number | null;
  readonly createdAt: string;
  /** 更新日時（`(updated ...)` 接尾辞から。未更新は null）。 */
  readonly updatedAt: string | null;
  readonly legacy: boolean;
  readonly headingIdx: number;
  readonly bodyStart: number;
  readonly bodyEnd: number;
}

interface CommentSectionAnalysis {
  readonly entries: readonly CommentEntrySpan[];
  /** 最初のエントリより前の無区切り領域 [preludeStart, preludeEnd)。 */
  readonly preludeStart: number;
  readonly preludeEnd: number;
  readonly preludeNonEmpty: boolean;
}

function parseCommentEntries(lines: readonly string[], span: SectionSpan): CommentSectionAnalysis {
  const entries: CommentEntrySpan[] = [];
  let preludeStart = span.start + 1;
  let preludeEnd = span.end;
  let current: CommentEntrySpan | null = null;
  for (let i = span.start + 1; i < span.end; i++) {
    const line = lines[i] ?? "";
    const m = COMMENT_ENTRY_HEADING_RE.exec(line);
    const legacyMatch = m === null ? LEGACY_COMMENT_ENTRY_RE.exec(line) : null;
    if (m !== null || legacyMatch !== null) {
      if (current !== null) {
        entries.push({ ...current, bodyEnd: i });
      } else {
        preludeEnd = i;
      }
      const seq = m !== null ? Number.parseInt(m[1] ?? "", 10) : null;
      current = {
        seq,
        createdAt: m !== null ? (m[2] ?? "") : (legacyMatch?.[1] ?? ""),
        updatedAt: m?.[3] ?? null,
        legacy: m === null,
        headingIdx: i,
        bodyStart: i + 1,
        bodyEnd: span.end,
      };
    }
  }
  if (current !== null) entries.push(current);
  const preludeNonEmpty = lines
    .slice(preludeStart, preludeEnd)
    .some((l) => l.trim().length > 0);
  return { entries, preludeStart, preludeEnd, preludeNonEmpty };
}

/**
 * エントリ本文。書込規約（本文行 + 区切り空行 1 行）に従い末尾の空行 1 行を除いて
 * 復元する。旧形式エントリは旧書式の区切り空行（見出し直後・本文末尾）を全て
 * 除いて正規化する（移行後の本文と一致させるため）。
 */
function commentBodyOf(lines: readonly string[], entry: CommentEntrySpan): string {
  const body = lines.slice(entry.bodyStart, entry.bodyEnd);
  if (body.length > 0 && body[body.length - 1] === "") body.pop();
  if (entry.legacy) {
    while (body.length > 0 && body[0] === "") body.shift();
    while (body.length > 0 && body[body.length - 1] === "") body.pop();
  }
  return body.join("\n");
}

/** 束ね対象の無区切り領域の本文行（セクション見出し直後と末尾の書式空行を除く）。 */
function bundledPreludeLines(lines: readonly string[], analysis: CommentSectionAnalysis): string[] {
  const body = lines.slice(analysis.preludeStart, analysis.preludeEnd);
  while (body.length > 0 && body[0] === "") body.shift();
  while (body.length > 0 && body[body.length - 1] === "") body.pop();
  return body;
}

function commentSeqLabel(seq: number): string {
  return String(seq).padStart(2, "0");
}

function commentIdOf(number: number, seq: number): string {
  return `issue-${String(number).padStart(4, "0")}-c${commentSeqLabel(seq)}`;
}

function commentEntryHeading(seq: number, createdAt: string, updatedAt: string | null): string {
  const base = `### c${commentSeqLabel(seq)} ${createdAt}`;
  return updatedAt === null ? base : `${base} (updated ${updatedAt})`;
}

function parseCommentId(commentId: string): { number: number; seq: number } | null {
  const m = COMMENT_ID_RE.exec(commentId);
  if (m === null) return null;
  const n = Number.parseInt(m[1] ?? "", 10);
  const seq = Number.parseInt(m[2] ?? "", 10);
  if (!(n > 0) || !(seq > 0)) return null;
  return { number: n, seq };
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
        failureClass: "enforcement-crashed",
      };
    }
  }

  private fail(
    error: string,
    exitCode: number | null = null,
    failureClass: GhRunnerFailureClass = "operation-failed",
  ): GhRunnerReply {
    return { ok: false, error, exitCode, failureClass };
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
    // 原子的書込み: 同じディレクトリへの一時ファイル書込み後にリネームで置換する。
    // リネーム失敗時は一時ファイルを残さず、失敗を上位へ伝播する。
    fs.mkdirSync(this.issuesDir, { recursive: true });
    const target = this.issuePath(number);
    const tmp = path.join(this.issuesDir, `${issueFileName(number)}.tmp`);
    fs.writeFileSync(tmp, toLf(raw), "utf8");
    try {
      fs.renameSync(tmp, target);
    } catch (e) {
      fs.rmSync(tmp, { force: true });
      throw e;
    }
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

  /** 実行前状態（before）。issue_update / issue_reopen の応答へ含め、VERIFY の照合基準とする。 */
  private beforeFrom(parsed: ParsedIssue): Record<string, unknown> {
    const state = this.issueState(parsed.fm.role, parsed.fm.status);
    const meta = this.trackingMetaOf(parsed);
    return {
      state: state ?? "open",
      labels: [...parsed.fm.labels],
      role: parsed.fm.role,
      kind: meta.kind,
      trackingState: meta.trackingState,
      closeReason: meta.closeReason,
    };
  }

  private hasMergeResult(parsed: ParsedIssue): boolean {
    return parsed.raw.split("\n").some((l) => l.trim() === HEADING_MERGE_RESULT);
  }

  private mergeableOf(parsed: ParsedIssue): "MERGEABLE" | "CONFLICTING" | "UNKNOWN" {
    return parsed.fm.status === "review" ? "MERGEABLE" : "UNKNOWN";
  }

  /** PR タイトル行の正統一: 最後の マージ前確認 セクション内の PR タイトル行のみを正とする。 */
  private prTitleOfLines(lines: readonly string[]): { lineIdx: number; title: string } | null {
    const span = lastSectionSpan(lines, HEADING_MERGE_CHECK);
    if (span === null) return null;
    let found: { lineIdx: number; title: string } | null = null;
    for (let i = span.start + 1; i < span.end; i++) {
      const line = lines[i] ?? "";
      if (line.startsWith(PR_TITLE_PREFIX)) {
        found = { lineIdx: i, title: line.slice(PR_TITLE_PREFIX.length).trim() };
      }
    }
    return found;
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
      case "pr_update":
        return this.prUpdate(args);
      case "comment_create":
        return this.commentCreate(args);
      case "comment_list":
        return this.commentList(args);
      case "comment_update":
        return this.commentUpdate(args);
      case "comment_delete":
        return this.commentDelete(args);
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
      return { ok: true, payload: { number, url: this.issuePath(number), before: this.beforeFrom(c.parsed) } };
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
    return {
      ok: true,
      payload: { number, url: this.issuePath(number), before: this.beforeFrom(c.parsed) },
    };
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
    if (number === null) return this.fail("issue_reopen requires number", 0, "invalid-input");
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    if (c.parsed.fm.role !== "tracking") {
      // 受理条件差（ローカルIssue共通スキーマ Design）: role: case は終端状態からの
      // 遷移を定義しないため、reopen を拒否する。
      return this.fail("issue_reopen applies only to tracking issues in the local implementation");
    }
    if (c.parsed.fm.status !== "closed") {
      // open 済み追跡Issueへの再オープンは要求的状態の確認をもって冪等に成功させる。
      return {
        ok: true,
        payload: { number, state: "open", before: this.beforeFrom(c.parsed) },
      };
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
    return {
      ok: true,
      payload: { number, state: "open", before: this.beforeFrom(c.parsed) },
    };
  }

  // ---------------------------------------------------------------------
  // Comment 系（role 分岐のコメント相当セクション上の c{NN} エントリ CRUD。
  // commentId の物理表現は issue-{NNNN}-c{NN}）
  // ---------------------------------------------------------------------

  private commentSectionHeading(role: IssueRole): string {
    return role === "tracking" ? HEADING_DISCUSSION : HEADING_WORKLOG;
  }

  /** コメント相当セクションを確保する（未作成なら作成する）。返り値は当該セクションの span。 */
  private ensureCommentSection(lines: string[], role: IssueRole): SectionSpan {
    const heading = this.commentSectionHeading(role);
    const existing = lastSectionSpan(lines, heading);
    if (existing !== null) return existing;
    if (role === "tracking") {
      lines.push("", heading);
    } else {
      let insertAt = lines.length;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;
        if (HEADINGS_BEFORE_WORKLOG.some((h) => line.trim() === h)) {
          insertAt = i;
          break;
        }
      }
      lines.splice(insertAt, 0, heading, "");
    }
    return lastSectionSpan(lines, heading)!;
  }

  /**
   * コメント相当セクションの解析と採番導出。旧形式エントリと role: case の無区切り
   * 作業ログ（束ね対象）には、移行時に付与される採番を導出して返す（書込は行わない）。
   * 導出順は migrateComments と同一（旧形式の文書順 → 束ね）でなければならない。
   */
  private analyzeComments(
    lines: readonly string[],
    span: SectionSpan,
    fm: LocalIssueFrontmatter,
    role: IssueRole,
  ): CommentSectionAnalysis & {
    nextSeq: number;
    bundleSeq: number | null;
    readonly derivedSeqs: readonly number[];
  } {
    const analysis = parseCommentEntries(lines, span);
    let max = fm.comment_seq ?? 0;
    for (const entry of analysis.entries) {
      if (entry.seq !== null && entry.seq > max) max = entry.seq;
    }
    const derivedSeqs: number[] = [];
    for (const entry of analysis.entries) {
      if (entry.seq !== null) {
        derivedSeqs.push(entry.seq);
      } else {
        max += 1;
        derivedSeqs.push(max);
      }
    }
    let bundleSeq: number | null = null;
    if (role === "case" && analysis.preludeNonEmpty) {
      max += 1;
      bundleSeq = max;
    }
    return { ...analysis, nextSeq: max, bundleSeq, derivedSeqs };
  }

  /**
   * 旧形式エントリと role: case の無区切り作業ログ内容の新形式への移行（in-place）。
   * セクション内容を再構築して置き換える。移行対象がない場合は行を変更しない
   * （冪等）。再構築は各エントリを 見出し行 + 本文行 + 区切り空行 1 行 の規約へ
   * 正規化する。移行後の最高水位標を返す。
   */
  private migrateComments(
    lines: string[],
    fm: LocalIssueFrontmatter,
    role: IssueRole,
  ): number {
    const heading = this.commentSectionHeading(role);
    const span = lastSectionSpan(lines, heading);
    if (span === null) return fm.comment_seq ?? 0;
    const analysis = parseCommentEntries(lines, span);
    let max = fm.comment_seq ?? 0;
    for (const entry of analysis.entries) {
      if (entry.seq !== null && entry.seq > max) max = entry.seq;
    }
    const legacySeq = new Map<number, number>();
    for (let i = 0; i < analysis.entries.length; i++) {
      const entry = analysis.entries[i];
      if (entry?.legacy) {
        max += 1;
        legacySeq.set(i, max);
      }
    }
    let bundleSeq: number | null = null;
    if (role === "case" && analysis.preludeNonEmpty) {
      max += 1;
      bundleSeq = max;
    }
    if (legacySeq.size === 0 && bundleSeq === null) return max;
    const content: string[] = [];
    if (bundleSeq !== null) {
      content.push(
        commentEntryHeading(bundleSeq, fm.updated_at, null),
        ...bundledPreludeLines(lines, analysis),
        "",
      );
    } else {
      for (const line of lines.slice(analysis.preludeStart, analysis.preludeEnd)) {
        content.push(line);
      }
    }
    for (let i = 0; i < analysis.entries.length; i++) {
      const entry = analysis.entries[i];
      if (entry === undefined) continue;
      if (entry.legacy) {
        const seq = legacySeq.get(i);
        if (seq !== undefined) {
          content.push(commentEntryHeading(seq, entry.createdAt, null), ...commentBodyOf(lines, entry).split("\n"), "");
        }
      } else {
        const body = lines.slice(entry.bodyStart, entry.bodyEnd);
        if (body.length > 0 && body[body.length - 1] === "") body.pop();
        content.push(lines[entry.headingIdx] ?? "", ...body, "");
      }
    }
    lines.splice(span.start + 1, span.end - (span.start + 1), ...content);
    return max;
  }

  private commentCreate(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) {
      return this.fail("comment_create requires number", 0, "invalid-input");
    }
    const body = typeof args.body === "string" && args.body.length > 0 ? args.body : null;
    if (body === null) {
      return this.fail("comment_create requires a non-empty body", 0, "invalid-input");
    }
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    const lines = c.parsed.raw.split("\n");
    this.ensureCommentSection(lines, c.parsed.fm.role);
    const maxSeq = this.migrateComments(lines, c.parsed.fm, c.parsed.fm.role);
    const seq = maxSeq + 1;
    const timestamp = isoNow(this.now);
    const span = lastSectionSpan(lines, this.commentSectionHeading(c.parsed.fm.role))!;
    lines.splice(
      span.end,
      0,
      commentEntryHeading(seq, timestamp, null),
      ...toLf(body).split("\n"),
      "",
    );
    const fm: LocalIssueFrontmatter = {
      ...c.parsed.fm,
      updated_at: timestamp,
      ...(seq > (c.parsed.fm.comment_seq ?? 0) ? { comment_seq: seq } : {}),
    };
    this.writeIssue(number, this.reassemble(c.parsed, fm, lines));
    return {
      ok: true,
      payload: { commentId: commentIdOf(number, seq), url: this.issuePath(number) },
    };
  }

  private commentList(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) {
      return this.fail("comment_list requires number", 0, "invalid-input");
    }
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    const lines = c.parsed.raw.split("\n");
    const span = lastSectionSpan(lines, this.commentSectionHeading(c.parsed.fm.role));
    if (span === null) return { ok: true, payload: { number, comments: [] } };
    const analysis = this.analyzeComments(lines, span, c.parsed.fm, c.parsed.fm.role);
    const comments: Record<string, unknown>[] = [];
    if (analysis.bundleSeq !== null) {
      comments.push({
        commentId: commentIdOf(number, analysis.bundleSeq),
        body: bundledPreludeLines(lines, analysis).join("\n"),
        createdAt: c.parsed.fm.updated_at,
        updatedAt: c.parsed.fm.updated_at,
        url: this.issuePath(number),
      });
    }
    for (const [i, entry] of analysis.entries.entries()) {
      comments.push({
        commentId: commentIdOf(number, analysis.derivedSeqs[i] ?? 0),
        body: commentBodyOf(lines, entry),
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt ?? entry.createdAt,
        url: this.issuePath(number),
      });
    }
    return { ok: true, payload: { number, comments } };
  }

  private commentUpdate(args: Record<string, unknown>): GhRunnerReply {
    const cid = typeof args.commentId === "string" ? args.commentId : null;
    if (cid === null) {
      return this.fail("comment_update requires commentId", 0, "invalid-input");
    }
    const target = parseCommentId(cid);
    if (target === null) {
      return this.fail(
        "comment_update requires a commentId of the form issue-{NNNN}-c{NN}",
        0,
        "invalid-input",
      );
    }
    const body = typeof args.body === "string" && args.body.length > 0 ? args.body : null;
    if (body === null) {
      return this.fail("comment_update requires a non-empty body", 0, "invalid-input");
    }
    const c = this.readIssue(target.number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(target.number)}`);
    const lines = c.parsed.raw.split("\n");
    const maxSeq = this.migrateComments(lines, c.parsed.fm, c.parsed.fm.role);
    const found = this.findCommentEntry(lines, c.parsed.fm.role, target.seq);
    if (found === null) {
      return this.fail(`comment not found: ${cid}`);
    }
    const timestamp = isoNow(this.now);
    lines.splice(
      found.entry.bodyStart,
      found.entry.bodyEnd - found.entry.bodyStart,
      ...toLf(body).split("\n"),
      "",
    );
    lines[found.entry.headingIdx] = commentEntryHeading(
      found.entry.seq ?? target.seq,
      found.entry.createdAt,
      timestamp,
    );
    const fm: LocalIssueFrontmatter = {
      ...c.parsed.fm,
      updated_at: timestamp,
      ...(maxSeq > (c.parsed.fm.comment_seq ?? 0) ? { comment_seq: maxSeq } : {}),
    };
    this.writeIssue(target.number, this.reassemble(c.parsed, fm, lines));
    return {
      ok: true,
      payload: { commentId: cid, url: this.issuePath(target.number), number: target.number },
    };
  }

  private commentDelete(args: Record<string, unknown>): GhRunnerReply {
    const cid = typeof args.commentId === "string" ? args.commentId : null;
    if (cid === null) {
      return this.fail("comment_delete requires commentId", 0, "invalid-input");
    }
    const target = parseCommentId(cid);
    if (target === null) {
      return this.fail(
        "comment_delete requires a commentId of the form issue-{NNNN}-c{NN}",
        0,
        "invalid-input",
      );
    }
    const c = this.readIssue(target.number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(target.number)}`);
    const lines = c.parsed.raw.split("\n");
    const maxSeq = this.migrateComments(lines, c.parsed.fm, c.parsed.fm.role);
    const found = this.findCommentEntry(lines, c.parsed.fm.role, target.seq);
    if (found === null) {
      return this.fail(`comment not found: ${cid}`);
    }
    const timestamp = isoNow(this.now);
    lines.splice(found.entry.headingIdx, found.entry.bodyEnd - found.entry.headingIdx);
    const fm: LocalIssueFrontmatter = {
      ...c.parsed.fm,
      updated_at: timestamp,
      ...(maxSeq > (c.parsed.fm.comment_seq ?? 0) ? { comment_seq: maxSeq } : {}),
    };
    this.writeIssue(target.number, this.reassemble(c.parsed, fm, lines));
    return { ok: true, payload: { commentId: cid, number: target.number } };
  }

  /** 移行済みセクションから指定採番のエントリを探す。 */
  private findCommentEntry(
    lines: readonly string[],
    role: IssueRole,
    seq: number,
  ): { entry: CommentEntrySpan } | null {
    const span = lastSectionSpan(lines, this.commentSectionHeading(role));
    if (span === null) return null;
    const analysis = parseCommentEntries(lines, span);
    const entry = analysis.entries.find((e) => e.seq === seq);
    return entry === undefined ? null : { entry };
  }

  /** frontmatter を置き換え、本文行配列と再結合してローカルIssue全文を組み立てる。 */
  private reassemble(parsed: ParsedIssue, fm: LocalIssueFrontmatter, lines: readonly string[]): string {
    const bodyLines = lines.slice(parsed.fmEndLine + 1);
    let raw = `${serializeFrontmatter(fm)}\n${bodyLines.join("\n")}`;
    if (!raw.endsWith("\n")) raw += "\n";
    return raw;
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

  /** 論理 PR 本文: 3セクション（マージ前確認 / Design確定候補 / Findings / Capture候補）の定義順直列化。 */
  private serializePrBody(lines: readonly string[]): string {
    const blocks: string[] = [];
    for (const heading of PR_BODY_SECTIONS) {
      const span = lastSectionSpan(lines, heading);
      const content = span === null ? [] : sectionContentLines(lines, span);
      blocks.push(content.length === 0 ? heading : `${heading}\n\n${content.join("\n")}`);
    }
    return blocks.join("\n\n");
  }

  /** 論理 PR 本文の入力をセクション単位へ分解する（各見出しは最後の出現を正とする）。 */
  private parsePrBodySections(body: string): Map<string, string[]> {
    const lines = body.split("\n");
    const headingIdx = new Map<string, number>();
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i]?.trim();
      if (t !== undefined && (PR_BODY_SECTIONS as readonly string[]).includes(t)) {
        headingIdx.set(t, i);
      }
    }
    const sections = new Map<string, string[]>();
    for (const [heading, idx] of headingIdx) {
      let end = lines.length;
      for (const other of headingIdx.values()) {
        if (other > idx && other < end) end = other;
      }
      sections.set(heading, sectionContentLines(lines, { start: idx, end }));
    }
    return sections;
  }

  private prRead(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_read requires number", 0, "invalid-input");
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    const lines = target.parsed.raw.split("\n");
    const title = this.prTitleOfLines(lines);
    if (title === null) {
      return this.fail(
        `local issue has no '${HEADING_MERGE_CHECK}' section with a PR title line: ${issueFileName(number)}`,
      );
    }
    const state = this.hasMergeResult(target.parsed)
      ? "merged"
      : this.issueState("case", target.parsed.fm.status);
    if (state === null) {
      return this.fail(`unknown issue status: ${target.parsed.fm.status}`);
    }
    return {
      ok: true,
      payload: {
        number,
        title: title.title,
        body: this.serializePrBody(lines),
        state,
        mergeable: this.mergeableOf(target.parsed),
      },
    };
  }

  private prUpdate(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_update requires number", 0, "invalid-input");
    const title = typeof args.title === "string" && args.title.length > 0 ? args.title : null;
    const body = typeof args.body === "string" ? args.body : null;
    if (title === null && body === null) {
      return this.fail("pr_update requires title or body", 0, "invalid-input");
    }
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    const lines = target.parsed.raw.split("\n");
    if (lastSectionSpan(lines, HEADING_MERGE_CHECK) === null) {
      return this.fail(
        `local issue has no '${HEADING_MERGE_CHECK}' section: ${issueFileName(number)}`,
      );
    }
    if (body !== null) {
      const sections = this.parsePrBodySections(body);
      if (sections.size === 0) {
        return this.fail(
          `pr_update body contains none of the PR sections (${PR_BODY_SECTIONS.join(" / ")})`,
        );
      }
      for (const heading of PR_BODY_SECTIONS) {
        const content = sections.get(heading);
        if (content === undefined) continue;
        const span = lastSectionSpan(lines, heading);
        if (span === null) {
          if (lines.length > 0 && lines[lines.length - 1] !== "") lines.push("");
          lines.push(heading, ...content);
        } else {
          const replacement =
            content.length === 0 ? [heading] : [heading, "", ...content, ""];
          lines.splice(span.start, span.end - span.start, ...replacement);
        }
      }
    }
    if (title !== null) {
      const t = this.prTitleOfLines(lines);
      if (t === null) {
        return this.fail(
          `local issue has no PR title line in '${HEADING_MERGE_CHECK}': ${issueFileName(number)}`,
        );
      }
      lines[t.lineIdx] = `${PR_TITLE_PREFIX}${title}`;
    }
    this.writeIssue(number, this.reassemble(target.parsed, target.parsed.fm, lines));
    return { ok: true, payload: { number, url: this.issuePath(number) } };
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
