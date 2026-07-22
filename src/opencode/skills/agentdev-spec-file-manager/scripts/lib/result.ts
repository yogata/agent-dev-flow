/**
 * 共通結果型と stdout/stderr 出力ヘルパー（REQ-0103-160 I/O 契約）。
 *
 * 本スキル (agentdev-spec-file-manager) の SPEC 固有スクリプト群が利用する。
 * 成功時は ok: true を含み、エラー時は非ゼロ終了コード + stderr メッセージとする。
 *
 * 共通検証スクリプト (check-frontmatter-consistency / check-entry-existence /
 * check-change-impact) は agentdev-artifact-validation の公開検証契約へ委譲する
 * ため、本ファイルには SPEC 固有の search 結果型のみを含む（REQ-0136-029/032）。
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

/** stdout に JSON を出力する（argv/stdin → stdout JSON 契約）。 */
export function emitJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

/** stderr にエラーを出力し非ゼロ終了コードで終了する。 */
export function emitError(message: string, code = 1): never {
  process.stderr.write(message + "\n");
  process.exit(code);
}
