// agentdev-gh Custom Tool の GitHub 実装（GhRunner）。
//
// 環境依存の実装詳細（gh オプション運用、--input によるファイル渡し、
// UTF-8 BOM なし一時ファイル、シェルを経由しない引数配列での gh 呼び出し、
// REST API による title/body 投入、応答の正規化）はすべて本ファイルの内側に
// 隠蔽する（REQ-011-013）。呼び出し側（engine / plugin）には現れない。
//
// 実行方式:
//   - gh は node:child_process の spawnSync（シェル不使用、引数配列）で呼ぶ。
//     PowerShell パイプラインを経由しないため、日本語を含む引数と応答の
//     文字コード変換破損（cp932 化け）が構造的に発生しない
//   - 書き込み系は title と body を1つの UTF-8 (BOM なし) JSON ファイルへ
//     書き出し、`gh api --input` で投入する（inline --title / --body 不使用）
//   - 一時ファイルは操作ごとに作成し、成否にかかわらず削除する


import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "./runner.ts";

/** gh 実行の注入点（テストは偽実装を差し込める）。 */
export type GhExec = (
  file: string,
  args: readonly string[],
) => { status: number | null; stdout: string; stderr: string };

/** 既定の gh 実行（シェル不使用、UTF-8 で応答を受け取る）。 */
export function defaultGhExec(): GhExec {
  return (file, args) => {
    const r = spawnSync(file, [...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
  };
}

export interface CliRunnerOptions {
  /** 対象リポジトリ（owner/name 形式）。 */
  readonly repo: string;
  /** 一時ファイルを置くディレクトリ（engine の GhToolPaths.tempDir を渡す）。 */
  readonly tempDir: string;
  /** gh 実行の注入点（省略時は既定実装）。 */
  readonly exec?: GhExec;
}

interface RawReply {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

/** gh pr view の state 値（OPEN/CLOSED/MERGED）を操作契約の値へ正規化する。 */
function normalizePrState(v: unknown): string | null {
  const s = str(v);
  if (s === null) return null;
  const lower = s.toLowerCase();
  if (lower === "open" || lower === "closed" || lower === "merged") return lower;
  return null;
}

/** gh の Issue state 値（OPEN/CLOSED）を操作契約の値へ正規化する。 */
function normalizeIssueState(v: unknown): "open" | "closed" | null {
  const s = str(v);
  if (s === null) return null;
  const lower = s.toLowerCase();
  if (lower === "open") return "open";
  if (lower === "closed") return "closed";
  return null;
}

/** GitHub 実装の GhRunner。 */
export class CliRunner implements GhRunner {
  private readonly repo: string;
  private readonly tempDir: string;
  private readonly exec: GhExec;
  private tempCounter = 0;

  constructor(options: CliRunnerOptions) {
    this.repo = options.repo;
    this.tempDir = options.tempDir;
    this.exec = options.exec ?? defaultGhExec();
  }

  async run(request: GhRunnerRequest): Promise<GhRunnerReply> {
    switch (request.operation) {
      case "issue_create":
        return this.issueCreate(request.args);
      case "issue_read":
        return this.issueRead(request.args);
      case "issue_update":
        return this.issueUpdate(request.args);
      case "issue_comment":
        return this.issueComment(request.args);
      case "issue_close":
        return this.issueClose(request.args);
      case "pr_create":
        return this.prCreate(request.args);
      case "pr_read":
      case "pr_mergeable":
        return this.prView(request.args);
      case "pr_changed_files":
        return this.prChangedFiles(request.args);
      case "pr_merge":
        return this.prMerge(request.args);
    }
  }

  // ---------------------------------------------------------------------
  // 内部: gh 実行の共通処理
  // ---------------------------------------------------------------------

  private fail(error: string, exitCode: number | null): GhRunnerReply {
    return { ok: false, error, exitCode };
  }

  private runGh(args: readonly string[]): { ok: true; payload: unknown } | GhRunnerReply {
    const r: RawReply = this.exec("gh", args);
    if (r.status === null) {
      return this.fail("failed to start gh (is gh installed and on PATH?)", null);
    }
    if (r.status !== 0) {
      const message = r.stderr.trim().length > 0 ? r.stderr.trim() : r.stdout.trim();
      return this.fail(message.length > 0 ? message : `gh exited with ${r.status}`, r.status);
    }
    const trimmed = r.stdout.trim();
    if (trimmed.length === 0) {
      return this.fail("gh replied with empty output", r.status);
    }
    try {
      return { ok: true, payload: JSON.parse(trimmed) as unknown };
    } catch (e) {
      return this.fail(
        `gh reply is not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
        r.status,
      );
    }
  }

  /** UTF-8 (BOM なし) の JSON 一時ファイルを書き出し、パスを返す。 */
  private writeTempJson(body: unknown): string {
    this.tempCounter += 1;
    const file = path.join(
      this.tempDir,
      `agentdev-gh-${Date.now()}-${this.tempCounter}.json`,
    );
    fs.mkdirSync(this.tempDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(body), "utf8");
    return file;
  }

  /** `gh api` の書き込み系（--input による JSON ファイル渡し）。一時ファイルは必ず削除する。 */
  private apiWithInput(
    method: "POST" | "PATCH" | "PUT",
    apiPath: string,
    body: unknown,
    toPayload: (record: Record<string, unknown>) => GhRunnerReply,
  ): GhRunnerReply {
    const temp = this.writeTempJson(body);
    try {
      const r = this.runGh(["api", "-X", method, apiPath, "--input", temp]);
      if (!r.ok) return r;
      if (!isRecord(r.payload)) {
        return this.fail("gh api reply is not an object", 0);
      }
      return toPayload(r.payload);
    } finally {
      fs.rmSync(temp, { force: true });
    }
  }

  /** `gh api` の読み取り系（GET）。 */
  private apiGet(
    apiPath: string,
    toPayload: (record: Record<string, unknown>) => GhRunnerReply,
  ): GhRunnerReply {
    const r = this.runGh(["api", apiPath]);
    if (!r.ok) return r;
    if (!isRecord(r.payload)) {
      return this.fail("gh api reply is not an object", 0);
    }
    return toPayload(r.payload);
  }

  private requireNumber(args: Record<string, unknown>): number | null {
    const n = args.number;
    return typeof n === "number" && Number.isInteger(n) && n > 0 ? n : null;
  }

  // ---------------------------------------------------------------------
  // Issue 系（REST API で title/body を UTF-8 JSON ファイル経由で投入する）
  // ---------------------------------------------------------------------

  private issueCreate(args: Record<string, unknown>): GhRunnerReply {
    return this.apiWithInput("POST", `repos/${this.repo}/issues`, {
      title: args.title,
      body: args.body,
      labels: Array.isArray(args.labels) ? args.labels : [],
    }, (rec) => {
      const number = rec.number;
      const url = str(rec.html_url);
      if (typeof number !== "number" || url === null) {
        return this.fail("issue create reply missing number/html_url", 0);
      }
      return { ok: true, payload: { number, url } };
    });
  }

  private issueRead(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_read requires number", 0);
    return this.apiGet(`repos/${this.repo}/issues/${number}`, (rec) => {
      const state = normalizeIssueState(rec.state);
      const title = str(rec.title);
      const body = str(rec.body);
      if (state === null || title === null || body === null) {
        return this.fail("issue reply missing state/title/body", 0);
      }
      return { ok: true, payload: { number, title, body, state } };
    });
  }

  private issueUpdate(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_update requires number", 0);
    const body: Record<string, unknown> = {};
    if (args.title !== undefined && args.title !== null) body.title = args.title;
    if (args.body !== undefined && args.body !== null) body.body = args.body;
    return this.apiWithInput("PATCH", `repos/${this.repo}/issues/${number}`, body, (rec) => {
      const url = str(rec.html_url);
      if (url === null) {
        return this.fail("issue update reply missing html_url", 0);
      }
      return { ok: true, payload: { number, url } };
    });
  }

  private issueComment(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_comment requires number", 0);
    return this.apiWithInput(
      "POST",
      `repos/${this.repo}/issues/${number}/comments`,
      { body: args.body },
      (rec) => {
        const url = str(rec.html_url);
        if (url === null) {
          return this.fail("comment reply missing html_url", 0);
        }
        return { ok: true, payload: { number, url } };
      },
    );
  }

  private issueClose(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("issue_close requires number", 0);
    const reason = str(args.reason) ?? "completed";
    return this.apiWithInput("PATCH", `repos/${this.repo}/issues/${number}`, {
      state: "closed",
      state_reason: reason,
    }, (rec) => {
      const state = normalizeIssueState(rec.state);
      if (state !== "closed") {
        return this.fail("issue close reply is not closed", 0);
      }
      return { ok: true, payload: { number, state: "closed" } };
    });
  }

  // ---------------------------------------------------------------------
  // PR 系
  // ---------------------------------------------------------------------

  private prCreate(args: Record<string, unknown>): GhRunnerReply {
    const body: Record<string, unknown> = {
      title: args.title,
      body: args.body,
      head: args.head,
      base: args.base,
    };
    if (args.draft === true) body.draft = true;
    return this.apiWithInput("POST", `repos/${this.repo}/pulls`, body, (rec) => {
      const number = rec.number;
      const url = str(rec.html_url);
      if (typeof number !== "number" || url === null) {
        return this.fail("pr create reply missing number/html_url", 0);
      }
      return { ok: true, payload: { number, url } };
    });
  }

  /** `gh pr view --json` を使う読み取り（pr_read / pr_mergeable）。 */
  private prView(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr view requires number", 0);
    const r = this.runGh([
      "pr",
      "view",
      String(number),
      "--repo",
      this.repo,
      "--json",
      "number,title,state,mergeable",
    ]);
    if (!r.ok) return r;
    if (!isRecord(r.payload)) {
      return this.fail("gh pr view reply is not an object", 0);
    }
    const rec = r.payload;
    const title = str(rec.title);
    const state = normalizePrState(rec.state);
    const mergeable = str(rec.mergeable);
    if (title === null || state === null || mergeable === null) {
      return this.fail("pr view reply missing title/state/mergeable", 0);
    }
    return { ok: true, payload: { number, title, state, mergeable } };
  }

  private prChangedFiles(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_changed_files requires number", 0);
    const r = this.runGh([
      "pr",
      "view",
      String(number),
      "--repo",
      this.repo,
      "--json",
      "files",
    ]);
    if (!r.ok) return r;
    if (!isRecord(r.payload)) {
      return this.fail("gh pr view reply is not an object", 0);
    }
    const files = r.payload.files;
    if (!Array.isArray(files)) {
      return this.fail("pr view reply missing files array", 0);
    }
    const paths: string[] = [];
    for (const f of files) {
      if (!isRecord(f)) return this.fail("files entry is not an object", 0);
      const p = str(f.path);
      if (p === null) return this.fail("files entry missing path", 0);
      paths.push(p);
    }
    return { ok: true, payload: { number, files: paths } };
  }

  private prMerge(args: Record<string, unknown>): GhRunnerReply {
    const number = this.requireNumber(args);
    if (number === null) return this.fail("pr_merge requires number", 0);
    const method = str(args.method) ?? "merge";
    return this.apiWithInput(
      "PUT",
      `repos/${this.repo}/pulls/${number}/merge`,
      { merge_method: method },
      (rec) => {
        if (rec.merged !== true) {
          return this.fail(str(rec.message) ?? "pr merge reply is not merged", 0);
        }
        return { ok: true, payload: { number, merged: true } };
      },
    );
  }
}

/** GitHub 実装の GhRunner を構築する。 */
export function createCliRunner(options: CliRunnerOptions): GhRunner {
  return new CliRunner(options);
}
