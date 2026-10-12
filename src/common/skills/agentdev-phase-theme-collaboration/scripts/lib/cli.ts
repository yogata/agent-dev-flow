/**
 * CLI 共通の argv 解析と出力契約。
 * - 入力: argv（--flag 値 形式）
 * - 出力: stdout に JSON
 * - エラー: 実行エラーは非ゼロ終了コード + stderr（技術的失敗を成功として出力しない）
 */

export interface ParsedArgs {
  readonly flags: ReadonlyMap<string, string>;
  readonly repeatFlags: ReadonlyMap<string, readonly string[]>;
}

export function parseArgs(argv: readonly string[], repeatableFlags: readonly string[] = []): ParsedArgs {
  const flags = new Map<string, string>();
  const repeatFlags = new Map<string, string[]>();
  let index = 0;
  while (index < argv.length) {
    const arg = argv[index];
    if (arg === undefined) break;
    if (!arg.startsWith("--")) {
      throw new Error(`位置引数は対応しない: ${arg}`);
    }
    const key = arg.slice(2);
    const value = argv[index + 1];
    if (value === undefined) {
      throw new Error(`--${key} には値が必要`);
    }
    if (repeatableFlags.includes(key)) {
      const values = repeatFlags.get(key) ?? [];
      repeatFlags.set(key, [...values, value]);
    } else {
      flags.set(key, value);
    }
    index += 2;
  }
  return { flags, repeatFlags };
}

export function requireFlag(args: ParsedArgs, key: string): string {
  const value = args.flags.get(key);
  if (value === undefined) {
    throw new Error(`必須の --${key} が指定されていない`);
  }
  return value;
}

export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
