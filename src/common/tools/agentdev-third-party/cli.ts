// agentdev_third_party 取得機構の一括実行面（CLI）。
//
// Design third-party-skill-management「一括実行面（cli.ts）」節:
//   - 実行形式: bun src/common/tools/agentdev-third-party/cli.ts [--dry-run] [name]
//   - 中身は引数解き + runAgentdevThirdPartyOperation 呼び出しのみ。
//     engine / acquisition / transport は既存実装を再利用する
//   - 終了コードは取得成否に連動する（成功 0、失敗 1、引数解釈不能 2）。
//     dry-run は計画表示のみで配置しない
//   - runtime 依存は bun 組み込みのみで解決し、node_modules なし環境で動作する
//   - 宣言ファイルの解決は Custom Tool と同一の2候補解決を使用し、
//     両候補とも不在の場合は fail-closed で停止して作成先を案内する
//
// 本 CLI は取得機構のバッチ実行面であって導入・同期手段には含まれず、
// scripts/ 直下の公開入口には該当しない。network access は取得機構の
// 正規能力（Custom Tool と同じ transport）である。


import * as path from "node:path";
import {
  buildTpToolEnv,
  createGitHubSourceFetcher,
  defaultTpPathProber,
  resolveDeclarationPath,
  runAgentdevThirdPartyOperation,
} from "./index.ts";

const USAGE = `usage: bun src/common/tools/agentdev-third-party/cli.ts [--dry-run] [name]

  --dry-run   acquire nothing; print the acquisition plan only
  name        target skill name from the declaration (omit for all declared skills)`;

export interface CliArgs {
  readonly dryRun: boolean;
  readonly skill?: string;
}

export type CliArgsResult =
  | { readonly ok: true; readonly args: CliArgs }
  | { readonly ok: false; readonly detail: string };

/** 引数解き（純粋関数。テストから直接検証できる）。 */
export function parseCliArgs(argv: readonly string[]): CliArgsResult {
  let dryRun = false;
  const names: string[] = [];
  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      return { ok: false, detail: USAGE };
    }
    if (arg.startsWith("-")) {
      return { ok: false, detail: `unknown option: ${arg}\n${USAGE}` };
    }
    names.push(arg);
  }
  if (names.length > 1) {
    return { ok: false, detail: `at most one skill name can be specified (got: ${names.join(", ")})\n${USAGE}` };
  }
  return {
    ok: true,
    args: {
      dryRun,
      ...(names.length === 1 ? { skill: names[0] as string } : {}),
    },
  };
}

/** 宣言ファイルが解決できなかった場合の fail-closed 案内（2候補の作成先）。 */
function printDeclarationGuidance(detail: string): void {
  console.error(`[ERROR] third-party Skill declaration cannot be resolved: ${detail}`);
  console.error(
    "guidance: create src/third-party/skills.yaml (producer-managed) or " +
      ".agentdev/third-party/skills.yaml (consumer-managed), then re-run this CLI",
  );
}

async function run(argv: readonly string[]): Promise<number> {
  const parsed = parseCliArgs(argv);
  if (!parsed.ok) {
    console.error(parsed.detail);
    return 2;
  }

  const worktree = process.cwd();
  const declarationPath = resolveDeclarationPath(worktree);
  const envResult = buildTpToolEnv(
    {
      declarationPath,
      skillsRoot: path.join(worktree, ".opencode", "skills"),
    },
    defaultTpPathProber,
    createGitHubSourceFetcher(),
  );
  if (!envResult.ok) {
    console.error(`[ERROR] ${envResult.failure.kind}: ${envResult.failure.detail}`);
    return 1;
  }

  const result = await runAgentdevThirdPartyOperation(envResult.env, {
    operation: "acquire",
    ...(parsed.args.skill !== undefined ? { skill: parsed.args.skill } : {}),
    ...(parsed.args.dryRun ? { dryRun: true } : {}),
  });

  const report = result.ok ? result.success.report : result.report;
  if (report !== undefined) {
    console.log(
      `third-party acquire ${parsed.args.dryRun ? "plan" : "result"}: ` +
        `requested=${report.summary.requested} succeeded=${report.summary.succeeded} ` +
        `failed=${report.summary.failed} refused=${report.summary.refused}`,
    );
    for (const target of report.targets) {
      console.log(
        `- ${target.name} [${target.profile}] -> ${target.placementPath} (existing: ${target.existing})`,
      );
    }
    for (const conflict of report.conflicts) {
      console.log(`! unmanaged conflict: ${conflict.name} at ${conflict.placementPath}`);
    }
    for (const entry of report.results) {
      const suffix = entry.failure !== null ? ` (${entry.failure})` : "";
      console.log(`${entry.ok ? "ok" : "NG"}: ${entry.name} ${entry.action}${suffix}`);
    }
  }
  if (!result.ok) {
    if (
      result.failure.kind === "config-uninterpretable" &&
      result.failure.detail.includes("does not exist")
    ) {
      printDeclarationGuidance(result.failure.detail);
    } else {
      console.error(`[ERROR] ${result.failure.kind}: ${result.failure.detail}`);
    }
    return 1;
  }
  if (parsed.args.dryRun) {
    console.log("dry-run complete. No placement was made.");
  }
  return 0;
}

if (import.meta.main) {
  process.exitCode = await run(process.argv.slice(2));
}
