// 課題管理スクリプト共通の CLI ユーティリティ。argv 解析、JSON 出力、エラー終了。
// 外部依存なし（bun + node 標準 API のみ）。

export type Args = Map<string, string | boolean>;

/** `--key value` 形式（値なしフラグは boolean true）を解析する。未知のキーはエラー。 */
export function parseArgs(argv: readonly string[], valueKeys: readonly string[], flagKeys: readonly string[]): Args {
  const args: Args = new Map();
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === undefined || !token.startsWith("--")) {
      throw new Error(`引数の形式が不正です: ${token}`);
    }
    const key = token.slice(2);
    if (flagKeys.includes(key)) {
      args.set(key, true);
      continue;
    }
    if (!valueKeys.includes(key)) {
      throw new Error(`未知のオプションです: ${token}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`--${key} には値が必要です`);
    }
    args.set(key, value);
    i += 1;
  }
  return args;
}

export function emitJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

export function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
