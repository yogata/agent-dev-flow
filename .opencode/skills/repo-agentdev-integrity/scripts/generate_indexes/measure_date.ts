// 対象ドキュメント群の計測日（最終コミット日付）導出（generate_indexes.ts 分割モジュール）。

const path = require("path") as typeof import("path");

/**
 * 対象ドキュメント群の最終コミット日付（YYYY-MM-DD）を導出する（SC-002「計測日導出」）。
 *
 * `git log -1 --format=%cI -- <paths...>` で対象群のいずれかに触った最終コミット
 * （= 各ファイル最終コミット日付の最大値）を取得し、その ISO 8601 日付部
 * （コミットタイムゾーン基準）を返す。実行環境のタイムゾーンや実行時日付
 * （`new Date()`）に依存しないため、ドキュメント群に実変更がない限り計測日を含む
 * AUTOGEN ブロックは鮮度を失わない（IR-061 日次再検出の構造的解消）。
 *
 * 導出不能時（git コマンド失敗、対象パスへのコミット実績なし）は null を返す。
 * 呼び出し元は null を検知した場合に生成・検査を失敗扱いとする。
 */
export function deriveMeasureDateFromLastCommit(
  root: string,
  absPaths: string[],
): string | null {
  if (absPaths.length === 0) return null;
  const { execFileSync } = require("child_process") as typeof import("child_process");
  const relPaths = absPaths.map((p) =>
    path.relative(root, p).replace(/\\/g, "/"),
  );
  // パスを分割実行して Windows コマンドライン長制限を回避する。パスは OR 条件の
  // ため、チャンクごとの最大値（ISO 日付の辞書順比較）の全体最大が群の最終コミット日付。
  const CHUNK_SIZE = 100;
  let latest: string | null = null;
  for (let i = 0; i < relPaths.length; i += CHUNK_SIZE) {
    const chunk = relPaths.slice(i, i + CHUNK_SIZE);
    let out: string;
    try {
      out = execFileSync(
        "git",
        ["log", "-1", "--format=%cI", "--", ...chunk],
        { cwd: root, encoding: "utf-8" },
      ) as string;
    } catch {
      return null;
    }
    const match = out.trim().match(/^(\d{4}-\d{2}-\d{2})T/);
    if (!match) continue;
    if (latest === null || match[1]! > latest) latest = match[1]!;
  }
  return latest;
}
