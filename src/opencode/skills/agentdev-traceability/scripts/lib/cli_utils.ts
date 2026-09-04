// CLI 共通ユーティリティ（引数解析、JSON 出力、エラー終了）。
//
// I/O 契約（scripts/src/*.ts 共通）:
// - 入力: argv（--root, --req, --artifact 等）
// - 出力: stdout に JSON
// - エラー: 非ゼロ終了コード + stderr にエラーメッセージ

import { resolve } from "node:path";

export function parseArgs(argv: readonly string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      args.set(key, next);
      i += 1;
    } else {
      args.set(key, "true");
    }
  }
  return args;
}

export function emitJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

export function fail(message: string, code = 1): never {
  console.error(message);
  process.exit(code);
}

export function normalizeArtifactPath(artifact: string): string {
  return artifact.replaceAll("\\", "/").replace(/^\.\//, "");
}

// --root 値を絶対パスへ解決する。相対パスは実行時のカレントディレクトリ基準で
// 一度だけ解決し、以降の走査は解決済み絶対パスで行う（cwd 依存の排除）。
export function resolveRoot(root: string): string {
  return resolve(root);
}
