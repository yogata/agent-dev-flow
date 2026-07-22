/**
 * 共通結果型と stdout/stderr 出力ヘルパー（REQ-0103-160 I/O 契約）。
 *
 * 全スクリプトの出力 JSON は成功時は ok: true を含み、
 * エラー時は非ゼロ終了コード + stderr メッセージとする。
 */

export type AllocOk = {
  ok: true;
  allocated: string;
  max: number;
};

export type AllocErr = {
  ok: false;
  error: string;
};

export type AllocResult = AllocOk | AllocErr;

export type CheckOk = {
  ok: true;
  errors: string[];
  warnings: string[];
};

export type CheckErr = {
  ok: false;
  error: string;
};

export type CheckResult = CheckOk | CheckErr;

/** stdout に JSON を出力する（argv/stdin → stdout JSON 契約）。 */
export function emitJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

/** stderr にエラーを出力し非ゼロ終了コードで終了する。 */
export function emitError(message: string, code = 1): never {
  process.stderr.write(message + "\n");
  process.exit(code);
}
