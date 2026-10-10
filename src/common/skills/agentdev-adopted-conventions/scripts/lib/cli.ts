// CLI 共通の argv 解析と出力契約。
// - 入力: argv（--root 等）
// - 出力: stdout に JSON
// - エラー: 非ゼロ終了コード + stderr にエラーメッセージ（実行エラー 1）

export interface ParsedArgs {
  readonly positional: readonly string[];
  readonly flags: ReadonlyMap<string, string>;
  readonly arrayFlags: ReadonlyMap<string, readonly string[]>;
}

export function parseArgs(argv: readonly string[], repeatableFlags: readonly string[] = []): ParsedArgs {
  const positional: string[] = [];
  const flags = new Map<string, string>();
  const arrayFlags = new Map<string, string[]>();
  let index = 0;
  while (index < argv.length) {
    const arg = argv[index];
    if (arg !== undefined && arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error(`--${key} には値が必要`);
      }
      if (repeatableFlags.includes(key)) {
        const values = arrayFlags.get(key) ?? [];
        arrayFlags.set(key, [...values, value]);
      } else {
        flags.set(key, value);
      }
      index += 2;
      continue;
    }
    if (arg !== undefined) positional.push(arg);
    index += 1;
  }
  return { positional, flags, arrayFlags };
}

export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
