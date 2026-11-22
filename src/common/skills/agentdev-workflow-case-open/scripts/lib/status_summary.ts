//
// 定型状態確認集約のコア（純粋関数）。
// git HEAD/branch/status/worktree 一覧、対象ファイル群の存在/SHA256/行数、
// 滞留キュー、Issue/PR 状態の一括取得を構造化 JSON サマリへ集約する。
// 取得手段は collectors 抽象へ注入するため、本モジュール自身は
// git・gh・ファイルシステムへ直接依存しない（テストは偽 collectors で成立させる）。
//
// セクション状態の区別（読取補完規律の機械的保持）:
// - ok:       取得成立。検索結果が 0 件でも total 0 として明示する（empty と区別）
// - empty:    検索系の結果 0 件。呼出側は空を対象なし・成功の証拠に使わない
// - partial:  一部読取失敗を含む（errors に内訳を記録）
// - unavailable: セクション全体の取得不能（他セクションの集約を妨げない）
// - skipped:  呼出側が要求していないセクション（対象外として区別）

import type {
  CollectInput,
  Collectors,
  FileEntry,
  FilesSection,
  GitSection,
  IssuesSection,
  SectionRequest,
  SectionStatus,
  StalenessQueue,
  StalenessSection,
  StatusSummaryReport,
} from "./status_summary_types.ts";

function countLines(text: string): number {
  if (text.length === 0) return 0;
  const normalized = text.replace(/\r\n/g, "\n");
  return normalized.split("\n").length - (normalized.endsWith("\n") ? 1 : 0);
}

function gitSection(
  collectors: Collectors,
  input: CollectInput,
): GitSection {
  const section: GitSection = {
    status: "ok",
    head_commit: null,
    branch: null,
    status_entries: [],
    status_total: 0,
    worktrees: [],
    worktree_total: 0,
    limit: input.limit,
  };
  const errors: string[] = [];

  const head = collectors.runGit(["rev-parse", "HEAD"]);
  if (head === null) {
    errors.push("git rev-parse HEAD unavailable");
  } else if (head.status !== 0) {
    errors.push(`git rev-parse HEAD exit ${head.status}`);
  } else {
    section.head_commit = head.stdout.trim() || null;
  }

  const branch = collectors.runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch === null || branch.status !== 0) {
    errors.push("git rev-parse --abbrev-ref HEAD unavailable");
  } else {
    section.branch = branch.stdout.trim() || null;
  }

  const status = collectors.runGit(["status", "--porcelain"]);
  if (status === null || status.status !== 0) {
    errors.push("git status --porcelain unavailable");
  } else {
    const all = status.stdout
      .split("\n")
      .map((l) => l.trimEnd())
      .filter((l) => l.length > 0);
    section.status_total = all.length;
    section.status_entries = all.slice(0, input.limit);
  }

  const worktree = collectors.runGit(["worktree", "list", "--porcelain"]);
  if (worktree === null || worktree.status !== 0) {
    errors.push("git worktree list unavailable");
  } else {
    const all = worktree.stdout
      .split("\n")
      .filter((l) => l.startsWith("worktree "))
      .map((l) => l.slice("worktree ".length));
    section.worktree_total = all.length;
    section.worktrees = all.slice(0, input.limit);
  }

  if (errors.length > 0) {
    section.status = errors.length >= 4 ? "unavailable" : "partial";
    section.error = errors.join("; ");
  }
  return section;
}

function filesSection(
  collectors: Collectors,
  input: CollectInput,
): FilesSection {
  const start = Math.max(0, input.offset);
  const end = start + input.limit;
  const window = input.files.slice(start, end);
  const entries: FileEntry[] = [];
  let errors = 0;
  for (const rel of window) {
    const stat = collectors.stat(rel);
    if (!stat.exists) {
      entries.push({
        path: rel,
        exists: false,
        sha256: null,
        bytes: null,
        lines: null,
      });
      continue;
    }
    const text = collectors.readText(rel);
    if (text === null) {
      errors += 1;
      entries.push({
        path: rel,
        exists: true,
        sha256: null,
        bytes: stat.bytes,
        lines: null,
        error: "read unavailable",
      });
      continue;
    }
    entries.push({
      path: rel,
      exists: true,
      sha256: collectors.hashText(text),
      bytes: Buffer.byteLength(text, "utf-8"),
      lines: countLines(text),
    });
  }
  const status: SectionStatus =
    errors > 0 ? "partial" : window.length === 0 ? "empty" : "ok";
  return {
    status,
    total: input.files.length,
    returned: entries.length,
    offset: input.offset,
    limit: input.limit,
    entries,
  };
}

function stalenessSection(
  collectors: Collectors,
  input: CollectInput,
): StalenessSection {
  const now = collectors.nowMs();
  const queues: StalenessQueue[] = [];
  const errors: string[] = [];
  for (const name of input.stalenessQueues) {
    const files = collectors.listFiles(name);
    if (files === null) {
      errors.push(`queue unreadable: ${name}`);
      continue;
    }
    const oldest = files.reduce<number | null>((acc, f) => {
      if (f.modifiedMs === null) return acc;
      return acc === null || f.modifiedMs < acc ? f.modifiedMs : acc;
    }, null);
    queues.push({
      name,
      count: files.length,
      oldest_age_days:
        oldest === null
          ? null
          : Math.floor((now - oldest) / (24 * 3600 * 1000)),
    });
  }
  return {
    status: errors.length === input.stalenessQueues.length && errors.length > 0 ? "unavailable" : errors.length > 0 ? "partial" : "ok",
    error: errors.length > 0 ? errors.join("; ") : undefined,
    queues,
  };
}

function issuesSection(
  collectors: Collectors,
  input: CollectInput,
): IssuesSection {
  const section: IssuesSection = {
    status: "skipped",
    total: 0,
    returned: 0,
    offset: input.offset,
    limit: input.limit,
    items: [],
  };
  if (input.issuesArgs === null) {
    return section;
  }
  const result = collectors.runGh(input.issuesArgs);
  if (result === null) {
    return { ...section, status: "unavailable", error: "gh unavailable" };
  }
  if (result.status !== 0) {
    return {
      ...section,
      status: "unavailable",
      error: `gh exit ${result.status}`,
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (error) {
    return {
      ...section,
      status: "unavailable",
      error: `gh output not valid JSON: ${String(error)}`,
    };
  }
  if (!Array.isArray(parsed)) {
    if (parsed !== null && typeof parsed === "object") {
      // gh … view は単一オブジェクトを返す。1 件の配列へ正規化して同じ集約経路へ載せる。
      parsed = [parsed];
    } else {
      return {
        ...section,
        status: "unavailable",
        error: "gh output is not a JSON array",
      };
    }
  }
  const all = parsed as Record<string, unknown>[];
  const start = Math.max(0, input.offset);
  const items = all.slice(start, start + input.limit);
  const status: SectionStatus =
    all.length === 0 ? "empty" : items.length < all.length ? "partial" : "ok";
  return {
    ...section,
    status,
    total: all.length,
    returned: items.length,
    items,
  };
}

export function collectStatusSummary(
  input: CollectInput,
  request: SectionRequest,
  collectors: Collectors,
): StatusSummaryReport {
  const sections: StatusSummaryReport["sections"] = {};
  if (request.git) sections.git = gitSection(collectors, input);
  if (request.files) sections.files = filesSection(collectors, input);
  if (request.staleness) sections.staleness = stalenessSection(collectors, input);
  if (request.issues) sections.issues = issuesSection(collectors, input);

  const report: StatusSummaryReport = {
    ok: true,
    root: input.root,
    sections,
    output_bytes: 0,
  };
  const bytes = Buffer.byteLength(`${JSON.stringify(report, null, 2)}\n`, "utf-8");
  report.output_bytes = bytes;
  if (bytes > input.maxBytes) {
    report.ok = false;
    report.error = `output bytes ${bytes} exceeds maxBytes ${input.maxBytes}; narrow --limit/--files/--jq before retrying (truncated re-reads are not offered)`;
    return report;
  }
  const requested = Object.values(sections);
  const allUnavailable =
    requested.length > 0 &&
    requested.every(
      (s) => s.status === "unavailable" || s.status === "skipped",
    );
  if (allUnavailable) {
    report.ok = false;
    report.error = "all requested sections unavailable";
  }
  return report;
}

/** --jq の dot path 評価（必要フィールド限定）。未対応の型・未存在 path は null。 */
export function selectByDotPaths(
  report: StatusSummaryReport,
  paths: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const p of paths) {
    let value: unknown = report;
    let ok = true;
    for (const key of p.split(".")) {
      if (
        value !== null &&
        typeof value === "object" &&
        key in (value as Record<string, unknown>)
      ) {
        value = (value as Record<string, unknown>)[key];
      } else {
        ok = false;
        break;
      }
    }
    out[p] = ok ? value : null;
  }
  return out;
}

export { runGitOk };
