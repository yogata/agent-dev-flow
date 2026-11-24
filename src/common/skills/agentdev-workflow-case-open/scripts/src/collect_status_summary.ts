#!/usr/bin/env bun
//
// 定型状態確認集約の CLI 入口。
// git・gh・ファイルシステムの実読取を collectors として構築し、
// コア（../lib/status_summary.ts）へ渡して構造化 JSON サマリを出力する。
//
// 使用方法:
//   bun scripts/src/collect_status_summary.ts \
//     --sections git,files,issues \
//     --files "README.md,src/common/skills/agentdev-workflow-case-open/SKILL.md" \
//     --staleness ".agentdev/backlog/intake/inbox,.agentdev/backlog/learning/inbox" \
//     --issues-args "issue list --state open --json number,title,updatedAt --limit 50" \
//     [--root <dir>] [--limit 10] [--offset 0] [--max-bytes 15360] \
//     [--jq sections.git.head_commit,sections.files.total]
//
// 終了コード:
//   0 = 集約成立（ok: true。セクション単位の empty / partial を含む）
//   1 = 集約不成立（ok: false。出力上限超過・全セクション取得不能）または引数形式エラー
//
// gh 引数は読取サブコマンドの許可リスト（issue/pr × list/view）に限定する。
// 許可外サブコマンド（edit・close・comment 等）は実行前に拒否する（fail-closed）。

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  collectStatusSummary,
  selectByDotPaths,
} from "../lib/status_summary.ts";
import type {
  CollectInput,
  Collectors,
  SectionRequest,
} from "../lib/status_summary_types.ts";

const DEFAULT_MAX_BYTES = 15360;
const DEFAULT_LIMIT = 10;
const GH_READ_RESOURCES = new Set(["issue", "pr"]);
const GH_READ_ACTIONS = new Set(["list", "view"]);
const SECTION_NAMES = new Set(["git", "files", "staleness", "issues"]);

interface CliArgs {
  root: string;
  sections: string[];
  files: string[];
  staleness: string[];
  issuesArgs: string[] | null;
  limit: number;
  offset: number;
  maxBytes: number;
  jqPaths: string[];
}

export function parseArgs(argv: string[]): { args: CliArgs } | { error: string } {
  const args: CliArgs = {
    root: process.cwd(),
    sections: ["git"],
    files: [],
    staleness: [],
    issuesArgs: null,
    limit: DEFAULT_LIMIT,
    offset: 0,
    maxBytes: DEFAULT_MAX_BYTES,
    jqPaths: [],
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (value === undefined) {
      return { error: `missing value for ${flag}` };
    }
    i += 1;
    switch (flag) {
      case "--root":
        args.root = value;
        break;
      case "--sections":
        args.sections = value.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        break;
      case "--files":
        args.files = value.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        break;
      case "--staleness":
        args.staleness = value.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        break;
      case "--issues-args":
        args.issuesArgs = value.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
        break;
      case "--limit":
      case "--offset":
      case "--max-bytes": {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 0) {
          return { error: `${flag} must be a non-negative integer, got ${value}` };
        }
        if (flag === "--limit") args.limit = n;
        else if (flag === "--offset") args.offset = n;
        else args.maxBytes = n;
        break;
      }
      case "--jq":
        args.jqPaths = value.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        break;
      default:
        return { error: `unknown flag: ${flag}` };
    }
  }
  const unknown = args.sections.filter((s) => !SECTION_NAMES.has(s));
  if (unknown.length > 0) {
    return { error: `unknown sections: ${unknown.join(",")}` };
  }
  if (args.sections.includes("files") && args.files.length === 0) {
    return { error: "--sections files requires --files" };
  }
  if (args.sections.includes("staleness") && args.staleness.length === 0) {
    return { error: "--sections staleness requires --staleness" };
  }
  if (args.sections.includes("issues") && args.issuesArgs === null) {
    return { error: "--sections issues requires --issues-args" };
  }
  if (
    args.issuesArgs !== null &&
    (args.issuesArgs.length < 2 ||
      !GH_READ_RESOURCES.has(args.issuesArgs[0]) ||
      !GH_READ_ACTIONS.has(args.issuesArgs[1]))
  ) {
    return {
      error: `--issues-args allows only read subcommands (issue/pr x list/view), got: ${args.issuesArgs.join(" ")}`,
    };
  }
  return { args };
}

function buildCollectors(root: string): Collectors {
  return {
    runGit(cmdArgs) {
      const r = spawnSync("git", cmdArgs, { cwd: root, encoding: "utf-8" });
      if (r.error) return null;
      return { status: r.status ?? 1, stdout: r.stdout ?? "" };
    },
    runGh(cmdArgs) {
      const r = spawnSync("gh", cmdArgs, { cwd: root, encoding: "utf-8" });
      if (r.error) return null;
      return { status: r.status ?? 1, stdout: r.stdout ?? "" };
    },
    stat(rel) {
      try {
        const s = statSync(join(root, rel));
        return { exists: true, bytes: s.size };
      } catch {
        return { exists: false, bytes: null };
      }
    },
    readText(rel) {
      try {
        return readFileSync(join(root, rel), "utf-8");
      } catch {
        return null;
      }
    },
    hashText(text) {
      return createHash("sha256").update(text).digest("hex");
    },
    listFiles(rel) {
      try {
        return readdirSync(join(root, rel), { withFileTypes: true })
          .filter((e) => e.isFile())
          .map((e) => {
            try {
              return {
                name: e.name,
                modifiedMs: statSync(join(root, rel, e.name)).mtimeMs,
              };
            } catch {
              return { name: e.name, modifiedMs: null };
            }
          });
      } catch {
        return null;
      }
    },
    nowMs() {
      return Date.now();
    },
  };
}

function main(): number {
  const parsed = parseArgs(process.argv.slice(2));
  if ("error" in parsed) {
    console.error(`error: ${parsed.error}`);
    return 1;
  }
  const a = parsed.args;
  const root = resolve(a.root);
  const input: CollectInput = {
    root,
    files: a.files,
    stalenessQueues: a.staleness,
    issuesArgs: a.issuesArgs,
    limit: a.limit,
    offset: a.offset,
    maxBytes: a.maxBytes,
  };
  const request: SectionRequest = {
    git: a.sections.includes("git"),
    files: a.sections.includes("files"),
    staleness: a.sections.includes("staleness"),
    issues: a.sections.includes("issues"),
  };
  const report = collectStatusSummary(input, request, buildCollectors(root));
  if (a.jqPaths.length > 0) {
    console.log(JSON.stringify(selectByDotPaths(report, a.jqPaths), null, 2));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  return report.ok ? 0 : 1;
}

if (import.meta.main) {
  process.exit(main());
}
