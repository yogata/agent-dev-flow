// agentdev-gh Custom Tool の Local 実装（GhRunner、REQ-011-006 / DEC-004）。
//
// 同一の操作契約（contracts.ts の10操作）を、GitHub Issue/PR の代わりに
// Case ファイル（`.agentdev/cases/case-{NNNN}.md`）の読み書きへ読み替える。
// Workflow は GitHub 実装（runner-cli.ts）と本実装の差を認識しない。
//
// 読み替え規則（正本: docs/designs/local/local-case-file.md、操作用定義: case-schema/）:
//   - Issue 番号 = Case 番号（4 桁ゼロ埋め、欠番再利用なし）
//   - Issue state  = Case status の非終端（open/running/blocked/review）→ open、終端 → closed
//   - PR state    = `## マージ結果` 記録済み → merged、それ以外は Case status から写像
//   - 出力 URL    = Case ファイルの絶対パス（GitHub 実装の Issue/PR URL に代わる一意識別子）
//   - 本文の内容Routing（テンプレート展開等）は本 Tool の責務外（REQ-011-020）


import * as fs from "node:fs";
import * as path from "node:path";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "../../opencode/tools/agentdev-gh/runner.ts";

const CASE_FILE_PREFIX = "case-";
const CASE_FILE_SUFFIX = ".md";
const FRONTMATTER_DELIMITER = "---";

const HEADING_WORKLOG = "## 作業ログ";
const HEADING_MERGE_CHECK = "## マージ前確認";
const HEADING_MERGE_RESULT = "## マージ結果";
const HEADINGS_BEFORE_WORKLOG = [HEADING_MERGE_CHECK, "## Design確定候補", "## Findings / Capture候補"];
const PR_TITLE_PREFIX = "### PR title: ";

const NON_TERMINAL_STATUSES = ["open", "running", "blocked", "review"] as const;

export interface LocalRunnerOptions {
  /** Case ファイルの配置ディレクトリ（`.agentdev/cases`）。 */
  readonly casesDir: string;
  /** 日時の注入点（テスト用）。省略時は実行時刻。 */
  readonly now?: () => Date;
}

interface CaseFrontmatter {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly closed_at: string;
  readonly labels: readonly string[];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function toLf(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function caseFileName(number: number): string {
  return `${CASE_FILE_PREFIX}${String(number).padStart(4, "0")}${CASE_FILE_SUFFIX}`;
}

function parseCaseNumber(fileName: string): number | null {
  if (!fileName.startsWith(CASE_FILE_PREFIX) || !fileName.endsWith(CASE_FILE_SUFFIX)) return null;
  const digits = fileName.slice(CASE_FILE_PREFIX.length, -CASE_FILE_SUFFIX.length);
  if (!/^\d{4}$/.test(digits)) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function quoteYamlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function serializeFrontmatter(fm: CaseFrontmatter): string {
  const labels = fm.labels.length > 0 ? `[${fm.labels.join(", ")}]` : "[]";
  return [
    FRONTMATTER_DELIMITER,
    `id: ${fm.id}`,
    `title: ${quoteYamlString(fm.title)}`,
    `status: ${fm.status}`,
    `created_at: ${quoteYamlString(fm.created_at)}`,
    `updated_at: ${quoteYamlString(fm.updated_at)}`,
    `closed_at: ${fm.closed_at.length > 0 ? quoteYamlString(fm.closed_at) : '""'}`,
    `labels: ${labels}`,
    FRONTMATTER_DELIMITER,
  ].join("\n");
}

interface ParsedCase {
  readonly fm: CaseFrontmatter;
  readonly bodyAfterFrontmatter: string;
  readonly raw: string;
}

function unquoteYamlString(v: string): string {
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return v;
}

function parseCase(raw: string): ParsedCase | null {
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
  const status = fields.get("status");
  const created = fields.get("created_at");
  const updated = fields.get("updated_at");
  if (id === undefined || title === undefined || status === undefined || created === undefined || updated === undefined) {
    return null;
  }
  const labelsRaw = fields.get("labels") ?? "[]";
  const labelsInner = labelsRaw.replace(/^\[/, "").replace(/\]$/, "").trim();
  const labels = labelsInner.length > 0 ? labelsInner.split(",").map((s) => s.trim()) : [];
  return {
    fm: {
      id,
      title: unquoteYamlString(title),
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

function isNonTerminal(status: string): boolean {
  return (NON_TERMINAL_STATUSES as readonly string[]).includes(status);
}

function isoNow(now: () => Date): string {
  return now().toISOString();
}

/** Local 実装の GhRunner。 */
export class LocalRunner implements GhRunner {
  private readonly casesDir: string;
  private readonly now: () => Date;

  constructor(options: LocalRunnerOptions) {
    this.casesDir = options.casesDir;
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

  private casePath(number: number): string {
    return path.join(this.casesDir, caseFileName(number));
  }

  private readCase(number: number): { parsed: ParsedCase; file: string } | null {
    const file = this.casePath(number);
    if (!fs.existsSync(file)) return null;
    const parsed = parseCase(fs.readFileSync(file, "utf8"));
    if (parsed === null) return null;
    return { parsed, file };
  }

  private writeCase(number: number, raw: string): void {
    fs.mkdirSync(this.casesDir, { recursive: true });
    fs.writeFileSync(this.casePath(number), toLf(raw), "utf8");
  }

  private requireNumber(args: Record<string, unknown>): number | null {
    const n = args.number;
    return typeof n === "number" && Number.isInteger(n) && n > 0 ? n : null;
  }

  private nextCaseNumber(): number {
    return this.latestCaseNumber() + 1;
  }

  private latestCaseNumber(): number {
    fs.mkdirSync(this.casesDir, { recursive: true });
    let max = 0;
    for (const entry of fs.readdirSync(this.casesDir)) {
      const n = parseCaseNumber(entry);
      if (n !== null && n > max) max = n;
    }
    return max;
  }

  /** Issue 系の state 出力（非終端 → open、終端 → closed）。 */
  private issueState(status: string): "open" | "closed" | null {
    return isNonTerminal(status) ? "open" : "closed";
  }

  /** PR 系の state 出力（マージ結果記録済み → merged）。 */
  private prState(parsed: ParsedCase): "open" | "closed" | "merged" | null {
    if (this.hasMergeResult(parsed)) return "merged";
    return this.issueState(parsed.fm.status);
  }

  private hasMergeResult(parsed: ParsedCase): boolean {
    return parsed.raw.split("\n").some((l) => l.trim() === HEADING_MERGE_RESULT);
  }

  private mergeableOf(parsed: ParsedCase): "MERGEABLE" | "CONFLICTING" | "UNKNOWN" {
    return parsed.fm.status === "review" ? "MERGEABLE" : "UNKNOWN";
  }

  /** 最後の `## マージ前確認` セクションから PR title を取り出す。 */
  private prTitle(parsed: ParsedCase): string | null {
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
    const labels = Array.isArray(args.labels)
      ? args.labels.filter((l): l is string => typeof l === "string")
      : [];
    const number = this.nextCaseNumber();
    const timestamp = isoNow(this.now);
    const fm: CaseFrontmatter = {
      id: `case-${String(number).padStart(4, "0")}`,
      title,
      status: "open",
      created_at: timestamp,
      updated_at: timestamp,
      closed_at: "",
      labels,
    };
    this.writeCase(number, `${serializeFrontmatter(fm)}\n${toLf(body)}`);
    return { ok: true, payload: { number, url: this.casePath(number) } };
  }

  private issueRead(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_read requires number");
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
    const state = this.issueState(c.parsed.fm.status);
    if (state === null) return this.fail(`unknown case status: ${c.parsed.fm.status}`);
    return {
      ok: true,
      payload: { number, title: c.parsed.fm.title, body: c.parsed.raw, state },
    };
  }

  private issueUpdate(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_update requires number");
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
    if (typeof args.body === "string") {
      // body は Case ファイル全体の内容（issue_read が返す形式）をそのまま反映する。
      // updated_at の更新は呼び出し側の責務（読み戻し検証は全文一致を要求する）。
      this.writeCase(number, toLf(args.body));
    } else if (typeof args.title === "string") {
      const fm: CaseFrontmatter = { ...c.parsed.fm, title: args.title };
      this.writeCase(number, `${serializeFrontmatter(fm)}\n${c.parsed.bodyAfterFrontmatter.replace(/^\n+/, "")}`);
    } else {
      return this.fail("issue_update requires title or body");
    }
    return { ok: true, payload: { number, url: this.casePath(number) } };
  }

  private issueComment(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_comment requires number");
    const body = typeof args.body === "string" ? args.body : null;
    if (body === null) return this.fail("issue_comment requires body");
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
    const lines = c.parsed.raw.split("\n");
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
    this.writeCase(number, updated);
    return { ok: true, payload: { number, url: this.casePath(number) } };
  }

  private issueClose(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_close requires number");
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
    const reason = typeof args.reason === "string" ? args.reason : "completed";
    const fm: CaseFrontmatter = {
      ...c.parsed.fm,
      status: reason === "not_planned" ? "cancelled" : "closed",
      closed_at: isoNow(this.now),
      updated_at: isoNow(this.now),
    };
    this.writeCase(number, `${serializeFrontmatter(fm)}\n${c.parsed.bodyAfterFrontmatter.replace(/^\n+/, "")}`);
    return { ok: true, payload: { number, state: "closed" } };
  }

  // ---------------------------------------------------------------------
  // PR 系
  // ---------------------------------------------------------------------

  private prCreate(args: Record<string, unknown>): GhRunnerReply {
    const title = typeof args.title === "string" ? args.title : null;
    const body = typeof args.body === "string" ? args.body : null;
    if (title === null || body === null) return this.fail("pr_create requires title and body");
    // 操作契約上 pr_create は番号を持たないため、ローカル版は最新 Case を対象とする。
    const number = this.requireNumber(args) ?? this.latestCaseNumber();
    if (number <= 0) return this.fail("pr_create requires an existing case");
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
    const section = [
      "",
      HEADING_MERGE_CHECK,
      "",
      `${PR_TITLE_PREFIX}${title}`,
      "",
      toLf(body).replace(/\n+$/, ""),
      "",
    ].join("\n");
    this.writeCase(number, `${c.parsed.raw.replace(/\n+$/, "")}\n${section}`);
    return { ok: true, payload: { number, url: this.casePath(number) } };
  }

  private prRead(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_read requires number");
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
    const title = this.prTitle(c.parsed);
    const state = this.prState(c.parsed);
    if (title === null || state === null) {
      return this.fail(`case file has no PR section: ${caseFileName(number)}`);
    }
    return {
      ok: true,
      payload: { number, title, state, mergeable: this.mergeableOf(c.parsed) },
    };
  }

  private prMerge(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_merge requires number");
    const method = typeof args.method === "string" ? args.method : "merge";
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
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
    if (this.hasMergeResult(c.parsed)) {
      return this.fail(`case file already has a merge result: ${caseFileName(number)}`);
    }
    this.writeCase(number, `${c.parsed.raw.replace(/\n+$/, "")}\n${record}`);
    return { ok: true, payload: { number, merged: true } };
  }

  private prChangedFiles(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_changed_files requires number");
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
    // ローカル版に変更ファイル一覧は存在しない（Git worktree の実状態が正）。
    return { ok: true, payload: { number, files: [] } };
  }

  private prMergeable(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_mergeable requires number");
    const c = this.readCase(number);
    if (c === null) return this.fail(`case file not found: ${caseFileName(number)}`);
    return { ok: true, payload: { number, mergeable: this.mergeableOf(c.parsed) } };
  }
}

/** Local 実装の GhRunner を構築する。 */
export function createLocalRunner(options: LocalRunnerOptions): GhRunner {
  return new LocalRunner(options);
}
