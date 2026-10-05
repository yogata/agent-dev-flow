/**
 * 共通結果型と stdout/stderr 出力ヘルパー（I/O 契約: stdout JSON、エラー時は非ゼロ終了コード + stderr）。
 *
 * agentdev-workflow-req-define の組立・検査スクリプト群が利用する。
 * agentdev-design-file-manager scripts/lib/result.ts と同一の I/O 規約に従う。
 */

export type SearchOk = {
  ok: true;
  matches: Array<{ file: string; line: number; text: string }>;
};

export type SearchErr = {
  ok: false;
  error: string;
};

export type SearchResult = SearchOk | SearchErr;

/** stdout に JSON を出力する（stdin → stdout JSON 契約）。 */
export function emitJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

/** stderr にエラーを出力し非ゼロ終了コードで終了する。 */
export function emitError(message: string, code = 1): never {
  process.stderr.write(message + "\n");
  process.exit(code);
}
