// agentdev-gh Custom Tool の Local 実現（GhRunner、REQ-011-006 / DEC-004）。
//
// 同一の操作契約（contracts.ts の16操作）を、GitHub Issue/PR の代わりに
// ローカルIssue（`.agentdev/issues/issue-{NNNN}.md`、単一採番空間）の
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
//   - Comment 操作（comment_*）は role により読み替え先セクションを分岐する
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
// 物理写像（role/状態と frontmatter/ラベルの対応）の機械適用は
// Tool 本体の tracking-schema.ts が所有する写像表に従う。


import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import type {
  GhRunner,
  GhRunnerFailureClass,
  GhRunnerReply,
  GhRunnerRequest,
} from "../runner.ts";
import type { GhToolOperation } from "../contracts.ts";
import { defaultCloseAcceptanceIo, verifyCloseAcceptanceForClose, type CloseAcceptanceIo } from "../close-acceptance.ts";
import {
  LOCAL_TRACKING_STATUS_VALUES,
  REOPEN_TRACKING_STATE,
  type CloseReason,
  type IssueRole,
} from "../tracking-schema.ts";
import { loadLocalCaseSchema } from "./local-schema-loader.ts";

const ISSUE_FILE_PREFIX = "issue-";
const ISSUE_FILE_SUFFIX = ".md";
const FRONTMATTER_DELIMITER = "---";

// case-schema rules yaml の実行時消費（REQ-047-012、G-007 解消）。
// frontmatter 必須フィールド・id パターン・role 値域・forbidden フィールド・
// comment_seq 最小値、status 値域・labels 値域・終端状態・本文見出しの実行時強制箇所は
// case-schema/rules/{frontmatter,status,labels,headings}.yaml を runtime 読込で消費する。
// yaml 欠損・スキーマ不適合時は import 時に fail-closed で停止する。
const RUNNER_DIR = path.dirname(fileURLToPath(import.meta.url));
const CASE_SCHEMA_RULES_DIR = path.join(RUNNER_DIR, "case-schema", "rules");
const SCHEMA = loadLocalCaseSchema(CASE_SCHEMA_RULES_DIR);

// tracking 値域は local case-schema（tracking_status_enum）を正として消費する。
// Tool 本体の写像表（tracking-schema.ts LOCAL_TRACKING_STATUS_VALUES）との不一致は
// 起動時に fail-closed で検出する（独立所有の同期条件の機械検証）。
if (SCHEMA.trackingStatusValues.join("|") !== LOCAL_TRACKING_STATUS_VALUES.join("|")) {
  throw new Error(
    `local case-schema status.yaml tracking_status_enum (${SCHEMA.trackingStatusValues.join(", ")}) ` +
      `does not match tracking-schema.ts LOCAL_TRACKING_STATUS_VALUES (${LOCAL_TRACKING_STATUS_VALUES.join(", ")})`,
  );
}

// role 値域は frontmatter.yaml（fields.role.enum）を正として消費する。実行時分岐の
// 型（IssueRole）と値域の不一致は起動時に fail-closed で検出する。
if (SCHEMA.frontmatter.roleValues.join("|") !== "tracking|case") {
  throw new Error(
    `local case-schema frontmatter.yaml fields.role.enum (${SCHEMA.frontmatter.roleValues.join(", ")}) ` +
      `does not match the runner role values (tracking, case)`,
  );
}

// id パターン（^issue-[0-9]{4}$）は frontmatter.yaml fields.id.pattern を正として消費する。
const ISSUE_ID_PATTERN = new RegExp(SCHEMA.frontmatter.idPattern);

const HEADING_WORKLOG = SCHEMA.caseHeadingsByNumber[8] ?? "";
const HEADING_DISCUSSION = SCHEMA.commentSections.tracking;
const HEADING_MERGE_CHECK = SCHEMA.caseHeadingsByNumber[9] ?? "";
const HEADING_MERGE_RESULT = SCHEMA.caseHeadingsByNumber[12] ?? "";
const HEADING_DESIGN_CANDIDATES = SCHEMA.caseHeadingsByNumber[10] ?? "";
const HEADING_FINDINGS = SCHEMA.caseHeadingsByNumber[11] ?? "";
const HEADINGS_BEFORE_WORKLOG = [
  HEADING_MERGE_CHECK,
  HEADING_DESIGN_CANDIDATES,
  HEADING_FINDINGS,
];
const PR_BODY_SECTIONS = HEADINGS_BEFORE_WORKLOG;
for (const [num, heading] of Object.entries(SCHEMA.caseHeadingsByNumber)) {
  if ([8, 9, 10, 11, 12].includes(Number(num))) {
    if (!heading) {
      throw new Error(`local case-schema headings.yaml case_headings number ${num} has no heading`);
    }
  }
}

const CASE_TERMINAL_STATUSES = [...SCHEMA.terminalStates.case];
const CASE_STATUS_VALUES = SCHEMA.caseStatusValues;
const CASE_LABEL_VALUES = SCHEMA.caseLabelValues;

const PR_TITLE_PREFIX = "### PR title: ";
const PR_BASE_PREFIX = "### PR base: ";
const PR_HEAD_PREFIX = "### PR head: ";

const COMMENT_ENTRY_HEADING_RE = /^### c(\d{2,}) (\S+)(?: \(updated (\S+)\))?$/;
const LEGACY_COMMENT_ENTRY_RE = /^### (\S+)$/;
const COMMENT_ID_RE = /^issue-(\d{4})-c(\d{2,})$/;

export interface LocalRunnerOptions {
  /** ローカルIssueの配置ディレクトリ（`.agentdev/issues`）。 */
  readonly issuesDir: string;
  /** 日時の注入点（テスト用）。省略時は実行時刻。 */
  readonly now?: () => Date;
  readonly closeAcceptanceIo?: CloseAcceptanceIo;
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

/**
 * role ごとの labels 値域（同上）。tracking は値域の列挙拘束とラベル値域の
 * 機械検証の適用外（原則空配列・通常ラベルの任意付与可）であり値域定義を持たない。
 * role: case の値域所属検証は現行どおり維持する。
 */
export function localLabelValues(role: IssueRole): readonly string[] {
  return role === "case" ? CASE_LABEL_VALUES : [];
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
  if (!ISSUE_ID_PATTERN.test(fm.id)) {
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
  // tracking の labels 値域は列挙拘束と機械検証の適用外（原則空配列・通常ラベルの
  // 任意付与可）。role: case の値域所属検証は現行どおり維持する。
  if (fm.role === "case") {
    const labelValues = localLabelValues(fm.role);
    for (const label of fm.labels) {
      if (!labelValues.includes(label)) {
        errors.push(`label '${label}' is not in the ${fm.role} label values`);
      }
    }
  }
  const terminal = localTerminalStatuses(fm.role).includes(fm.status);
  if (terminal && fm.closed_at.length === 0) {
    errors.push("terminal status requires closed_at");
  }
  if (!terminal && fm.closed_at.length > 0) {
    errors.push("non-terminal status must not have closed_at");
  }
  const commentSeqMinimum = SCHEMA.frontmatter.commentSeqMinimum ?? 0;
  if (fm.comment_seq !== undefined && (!Number.isInteger(fm.comment_seq) || fm.comment_seq < commentSeqMinimum)) {
    errors.push(`comment_seq must be an integer of at least ${commentSeqMinimum}: ${String(fm.comment_seq)}`);
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

/**
 * Windows では既存ファイルの置換を伴う rename が、直前の書込みハンドル解放や
 * 検索インデクサ等の一時的な保持で非決定的に EPERM / EACCES になる。
 * 短期の bounded retry（指数バックオフ、最大約150ms）で吸収する。
 * リトライ不能な失敗は初回エラーをそのまま伝播する。
 */
function renameReplacingFile(from: string, to: string): void {
  const backoffMs = [0, 10, 20, 40, 80];
  let lastError: unknown = null;
  for (const wait of backoffMs) {
    if (wait > 0) sleepSync(wait);
    try {
      fs.renameSync(from, to);
      return;
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "EPERM" && code !== "EACCES") throw e;
      lastError = e;
    }
  }
  throw lastError;
}

/** 同期スリープ（メインスレッドを待機させる。retry 経路のみで使用）。 */
function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
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
  // frontmatter.yaml の機械可読定義による実行時強制（G-007 解消）。
  // forbidden_fields（前書き禁止フィールド）の混入と required: true フィールドの
  // 欠落はスキーマ違反として読取を fail-closed で拒否する。
  for (const key of fields.keys()) {
    if (SCHEMA.frontmatter.forbiddenFields.includes(key)) return null;
  }
  for (const name of SCHEMA.frontmatter.requiredFields) {
    if (!fields.has(name)) return null;
  }
  const id = fields.get("id") as string;
  const title = fields.get("title") as string;
  const role = fields.get("role") as string;
  const status = fields.get("status") as string;
  const created = fields.get("created_at") as string;
  const updated = fields.get("updated_at") as string;
  if (!SCHEMA.frontmatter.roleValues.includes(role)) return null;
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
      role: role as IssueRole,
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
  private readonly closeAcceptanceIo: CloseAcceptanceIo;

  constructor(options: LocalRunnerOptions) {
    this.issuesDir = options.issuesDir;
    this.now = options.now ?? (() => new Date());
    this.closeAcceptanceIo = options.closeAcceptanceIo ?? defaultCloseAcceptanceIo();
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

  // Release 操作は GitHub 接続専用の例外（custom-tool-contracts Design が明示）。
  // ローカル環境では GitHub Release 相当の状態を持たないため、副作用を実行せず
  // 構造化失敗（operation-failed）を返す。
  private releaseUnsupported(operation: GhToolOperation): GhRunnerReply {
    return this.fail(
      `${operation} is GitHub-connected only; the local environment has no GitHub Release equivalent state`,
    );
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
      renameReplacingFile(tmp, target);
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

  private latestIssueNumber(): number {
    fs.mkdirSync(this.issuesDir, { recursive: true });
    let max = 0;
    for (const entry of fs.readdirSync(this.issuesDir)) {
      const n = parseIssueNumber(entry);
      if (n === null || n <= max) continue;
      max = n;
    }
    return max;
  }

  /** Issue 系の state 出力（role ごとの終端判定: 非終端 → open、終端 → closed）。 */
  private issueState(role: IssueRole, status: string): "open" | "closed" | null {
    if (!localStatusValues(role).includes(status)) return null;
    return isTerminal(role, status) ? "closed" : "open";
  }

  /** close reason（ローカル版は tracking / case とも導出しない。終端 reason は 検討経過 の履歴が保持する）。 */
  private trackingMetaOf(): {
    closeReason: CloseReason | null;
  } {
    return { closeReason: null };
  }

  /** 実行前状態（before）。issue_update / issue_reopen の応答へ含め、VERIFY の照合基準とする。 */
  private beforeFrom(parsed: ParsedIssue): Record<string, unknown> {
    const state = this.issueState(parsed.fm.role, parsed.fm.status);
    const meta = this.trackingMetaOf();
    return {
      state: state ?? "open",
      labels: [...parsed.fm.labels],
      role: parsed.fm.role,
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
      case "release_create":
      case "release_list":
      case "release_read":
      case "release_publish":
        return this.releaseUnsupported(request.operation);
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
    const labels = Array.isArray(args.labels)
      ? args.labels.filter((l): l is string => typeof l === "string")
      : [];
    // tracking の labels 値域は列挙拘束の適用外（原則空配列・通常ラベルの任意付与可）。
    // role: case の値域所属検証は現行どおり維持する。
    if (role !== "tracking") {
      const labelValues = localLabelValues(role);
      for (const label of labels) {
        if (!labelValues.includes(label)) {
          return this.fail(`label '${label}' is not in the ${role} label values`);
        }
      }
    }
    const finalLabels = labels;
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
    const meta = this.trackingMetaOf();
    return {
      ok: true,
      payload: {
        number,
        title: c.parsed.fm.title,
        body: c.parsed.raw,
        state,
        labels: c.parsed.fm.labels,
        role: c.parsed.fm.role,
        closeReason: meta.closeReason,
        updatedAt: c.parsed.fm.updated_at,
      },
    };
  }

  private issueUpdate(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_update requires number");
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
    if (Array.isArray(args.labels)) {
      const labels = args.labels.filter((l): l is string => typeof l === "string");
      // tracking の labels 値域は列挙拘束の適用外（原則空配列・通常ラベルの任意付与可）。
      if (fm.role === "case") {
        const labelValues = localLabelValues(fm.role);
        for (const label of labels) {
          if (!labelValues.includes(label)) {
            return this.fail(`label '${label}' is not in the ${fm.role} label values`);
          }
        }
      }
      nextFm.labels = labels;
      changed = true;
    }
    if (!changed) {
      return this.fail("issue_update requires title, body, or labels");
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

  private issueClose(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_close requires number");
    const c = this.readIssue(number);
    if (c === null) return this.fail(`local issue not found: ${issueFileName(number)}`);
    if (c.parsed.fm.role === "case") {
      const acceptance = verifyCloseAcceptanceForClose(
        this.closeAcceptanceIo, path.resolve(this.issuesDir, "..", ".."), number, c.parsed.fm.updated_at,
      );
      if (!acceptance.ok) return this.fail(acceptance.detail, null, acceptance.kind);
    }
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
    const state = args.state === "open" || args.state === "closed" ? args.state : null;
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
      const meta = this.trackingMetaOf();
      if (role !== null && parsed.fm.role !== role) continue;
      if (state !== null && issueState !== state) continue;
      if (labels.length > 0 && !labels.every((l) => parsed.fm.labels.includes(l))) continue;
      if (search !== null && !parsed.fm.title.includes(search)) continue;
      issues.push({
        number: n,
        title: parsed.fm.title,
        url: this.issuePath(n),
        state: issueState,
        labels: parsed.fm.labels,
        role: parsed.fm.role,
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
    const base = typeof args.base === "string" && args.base.length > 0 ? args.base : null;
    const head = typeof args.head === "string" && args.head.length > 0 ? args.head : null;
    if (title === null || body === null || base === null || head === null) {
      return this.fail("pr_create requires title, body, base, and head", 0, "invalid-input");
    }
    // 対象識別（number）は必須。対象を最新Caseの推測で解決せず、対象識別を欠く
    // 要求は副作用発生前に入力契約違反として拒否する（Design「対象操作の境界」節
    // の pr_create 対象識別契約条項）。
    const number = this.requireNumber(args);
    if (number === null) {
      return this.fail("pr_create requires number (target identification)", 0, "invalid-input");
    }
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    const section = [
      "",
      HEADING_MERGE_CHECK,
      "",
      `${PR_TITLE_PREFIX}${title}`,
      `${PR_BASE_PREFIX}${base}`,
      `${PR_HEAD_PREFIX}${head}`,
      "",
      toLf(body).replace(/\n+$/, ""),
      "",
    ].join("\n");
    this.writeIssue(number, `${target.parsed.raw.replace(/\n+$/, "")}\n${section}`);
    return { ok: true, payload: { number, url: this.issuePath(number) } };
  }

  /** PR base / PR head 行（物理表現）を論理 PR 本文から除外する。 */
  private isPrPhysicalMetaLine(line: string): boolean {
    return line.startsWith(PR_BASE_PREFIX) || line.startsWith(PR_HEAD_PREFIX);
  }

  /** 論理 PR 本文: 3セクション（マージ前確認 / Design確定候補 / Findings / Capture候補）の定義順直列化。 */
  private serializePrBody(lines: readonly string[]): string {
    const blocks: string[] = [];
    for (const heading of PR_BODY_SECTIONS) {
      const span = lastSectionSpan(lines, heading);
      const content = span === null ? [] : sectionContentLines(lines, span);
      const logical = heading === HEADING_MERGE_CHECK
        ? content.filter((l) => !this.isPrPhysicalMetaLine(l))
        : content;
      blocks.push(logical.length === 0 ? heading : `${heading}\n\n${logical.join("\n")}`);
    }
    return blocks.join("\n\n");
  }

  /**
   * マージ前確認セクションの物理行から pr_create 読戻し照合の取得情報
   * （base・head・createBody）を抽出する。createBody は PR タイトル行と
   * PR base / PR head 行の後の本文部分（pr_create が書込んだ作成時送信値の
   * 読戻し値）。タイトル行が存在しない場合は null（呼出側で失敗扱い）。
   */
  private mergeCheckReadBack(lines: readonly string[]): {
    base: string | null;
    head: string | null;
    createBody: string | null;
  } {
    const span = lastSectionSpan(lines, HEADING_MERGE_CHECK);
    if (span === null) return { base: null, head: null, createBody: null };
    const content = sectionContentLines(lines, span);
    let titleIdx = -1;
    for (let i = 0; i < content.length; i++) {
      if ((content[i] ?? "").startsWith(PR_TITLE_PREFIX)) {
        titleIdx = i;
        break;
      }
    }
    if (titleIdx < 0) return { base: null, head: null, createBody: null };
    let base: string | null = null;
    let head: string | null = null;
    const bodyLines: string[] = [];
    for (let i = titleIdx + 1; i < content.length; i++) {
      const line = content[i] ?? "";
      if (line.startsWith(PR_BASE_PREFIX) && base === null) {
        base = line.slice(PR_BASE_PREFIX.length).trim();
        continue;
      }
      if (line.startsWith(PR_HEAD_PREFIX) && head === null) {
        head = line.slice(PR_HEAD_PREFIX.length).trim();
        continue;
      }
      bodyLines.push(line);
    }
    while (bodyLines.length > 0 && bodyLines[0] === "") bodyLines.shift();
    while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1] === "") bodyLines.pop();
    return { base, head, createBody: bodyLines.join("\n") };
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
    const readBack = this.mergeCheckReadBack(lines);
    return {
      ok: true,
      payload: {
        number,
        title: title.title,
        body: this.serializePrBody(lines),
        state,
        mergeable: this.mergeableOf(target.parsed),
        isDraft: false,
        base: readBack.base,
        head: readBack.head,
        createBody: readBack.createBody,
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

  /**
   * コミットハッシュがローカルIssueルート（`.agentdev/issues/` を含むリポジトリルート）の
   * git リポジトリに commit 型として実在することを確認する（VERIFY）。
   * 実在しない場合、git 実行自体の失敗（git 不在、リポジトリ不在）も含めて
   * operation-failed を返す。確認に成功した場合は null を返す。
   */
  private verifyCommitExists(commitHash: string): GhRunnerReply | null {
    const repoRoot = path.resolve(this.issuesDir, "..", "..");
    const r = spawnSync("git", ["cat-file", "-t", commitHash], { cwd: repoRoot, encoding: "utf8" });
    const type = typeof r.stdout === "string" ? r.stdout.trim() : "";
    if (r.status !== 0 || type !== "commit") {
      const detail = r.error !== null && r.error !== undefined ? ` (spawnSync: ${r.error.message})` : "";
      return this.fail(
        `pr_merge requires commitHash that resolves to an existing commit in the local git repository: ${commitHash}${detail}`,
      );
    }
    return null;
  }

  private prMerge(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_merge requires number");
    const target = this.requireCaseIssue(number);
    if (!("parsed" in target)) return target;
    if (this.hasMergeResult(target.parsed)) {
      return this.fail(`local issue already has a merge result: ${issueFileName(number)}`);
    }
    const commitHash = typeof args.commitHash === "string" && args.commitHash.length > 0 ? args.commitHash : null;
    if (commitHash === null) {
      return this.fail("pr_merge requires commitHash", 0, "invalid-input");
    }
    // 取り込みの実行主体はローカル版 case-close。本操作は記録の正確性の保証として
    // 実測コミットのローカル Git 実在を確認（VERIFY）してから記録する（fail-closed）。
    const notVerified = this.verifyCommitExists(commitHash);
    if (notVerified !== null) return notVerified;
    const method = typeof args.method === "string" ? args.method : "merge";
    const base = typeof args.base === "string" && args.base.length > 0 ? args.base : null;
    const head = typeof args.head === "string" && args.head.length > 0 ? args.head : null;
    const timestamp = isoNow(this.now);
    const record = [
      "",
      HEADING_MERGE_RESULT,
      "",
      `- 操作: ローカル取り込み（merge 方式: ${method}）`,
      `- コミットハッシュ: ${commitHash}`,
      ...(base !== null ? [`- 取り込み先ブランチ: ${base}`] : []),
      ...(head !== null ? [`- 取り込み元ブランチ: ${head}`] : []),
      `- 実行日時: ${timestamp}`,
      `- 結果: PASS`,
      "",
    ].join("\n");
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
