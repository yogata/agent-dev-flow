// agentdev-gh ホスト接続 adapter の CLI 共通部。
//
// Custom Tool を登録できないホストで、agent が shell から起動する入口の形式を
// 所有する（--input による UTF-8 JSON ファイル渡し、実行結果の stdout への JSON
// 出力、成否の終了コード写像）。操作の実行は route-adapter.ts の経路解決と
// engine 実行に委譲する。実行 cwd（導入先リポジトリ root）を worktree として
// 受け取る。

import type { GhToolResult } from "./contracts.ts";
import {
  runAgentdevGhRouteAdapter,
  type AgentdevGhRouteAdapterDeps,
} from "./route-adapter.ts";

/** CLI の I/O（テストは偽実装を差し込める）。 */
export interface AdapterCliIo {
  readonly readFile: (path: string) => string;
  readonly stdout: (text: string) => void;
}

function cliFailure(detail: string): GhToolResult {
  return {
    ok: false,
    failure: {
      kind: "invalid-input",
      retryable: true,
      detail,
      contingency: { fallbacks: [], canContinue: false },
    },
  };
}

/**
 * adapter CLI の本体。--input <request.json> を読み、実行結果を stdout へ
 * JSON で出力し、成否を終了コードへ写す（成功 0 / 失敗 1）。起動引数や
 * 要求ファイルの異常も実行結果と同じ経路で JSON の構造化失敗として報告する。
 */
export async function runAgentdevGhAdapterCli(
  deps: AgentdevGhRouteAdapterDeps,
  worktree: string,
  argv: readonly string[],
  io: AdapterCliIo,
): Promise<number> {
  const inputIndex = argv.indexOf("--input");
  const inputPath =
    inputIndex >= 0 && inputIndex + 1 < argv.length ? argv[inputIndex + 1] : undefined;
  if (inputPath === undefined) {
    io.stdout(
      JSON.stringify(
        cliFailure("usage: --input <request.json> (run from the consumer repository root)"),
        null,
        2,
      ),
    );
    return 1;
  }
  let text: string;
  try {
    text = io.readFile(inputPath);
  } catch (e) {
    io.stdout(
      JSON.stringify(
        cliFailure(
          `could not read the request file ${inputPath}: ${e instanceof Error ? e.message : String(e)}`,
        ),
        null,
        2,
      ),
    );
    return 1;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    io.stdout(
      JSON.stringify(
        cliFailure(
          `the request file ${inputPath} is not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
        ),
        null,
        2,
      ),
    );
    return 1;
  }
  const result = await runAgentdevGhRouteAdapter(deps, worktree, raw);
  io.stdout(JSON.stringify(result, null, 2));
  return result.ok ? 0 : 1;
}
