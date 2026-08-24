// agentdev-gh Custom Tool の実行境界。
//
// GhRunner は gh CLI（GitHub I/O）への構造化された実行境界である。文字コード制御、
// シェル呼出、一時ファイル操作、CLI オプション運用等の実装詳細はこの境界の内側に
// 隠蔽され、契約（contracts.ts）を利用する呼び出し側には現れない。
// gh CLI への具体的な写像（--body-file、UTF-8 BOM なし、chcp 初期化等）は
// 本境界の実装として GitHub I/O 移管の後続 Issue が接続する。
//
// ローカル版（consumer-generated）は同一の操作契約で Case ファイル
// 読み書きへ読み替えた Local 実装をこの境界へ差し替える。Workflow は差を認識しない。


import type { GhToolOperation } from "./contracts.ts";

/** 実行要求。操作名と構造化引数のみ（コマンド文字列の組み立ては内側）。 */
export interface GhRunnerRequest {
  readonly operation: GhToolOperation;
  readonly args: Readonly<Record<string, unknown>>;
}

/** 実行応答。ok=false は操作の実行失敗（exitCode は CLI 互換の終了コード）。 */
export type GhRunnerReply =
  | { readonly ok: true; readonly payload: unknown }
  | { readonly ok: false; readonly error: string; readonly exitCode: number | null };

/**
 * gh CLI 実行境界。実装は構造化要求を実際の gh 呼び出しへ写像する。
 * 呼び出しは副作用を持ち得る（side-effect 操作）。engine はこの境界の
 * 応答を読み戻し検証（VERIFY）してから成功を返す。
 */
export interface GhRunner {
  run(request: GhRunnerRequest): Promise<GhRunnerReply>;
}
