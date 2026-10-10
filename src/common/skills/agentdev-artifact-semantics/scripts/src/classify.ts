// CLI: classify — 成果物の意味役割の決定的判定。
//
// 入力: --root（検証対象リポジトリのルート。絶対パス推奨）, --files（カンマ区切りの成果物パス）
// 出力: stdout に JSON。読取失敗・未知の役割宣言は非ゼロ終了 + stderr。
// 決定性: 同一入力から同一の JSON を返す。

import { assessArtifactRoles, RoleAssessmentError } from "../lib/roles.ts";
import { emitJson, fail, parseArgs, parseCsv, resolveRoot } from "../lib/cli_utils.ts";

export function main(argv: readonly string[]): void {
  const args = parseArgs(argv);
  const root = args.get("root");
  const filesValue = args.get("files");
  if (!root || !filesValue) {
    fail("使い方: bun src/classify.ts --root <repo-root> --files <path[,path...]>");
  }
  const files = parseCsv(filesValue!);
  if (files.length === 0) {
    fail("--files に1つ以上の成果物パスを指定すること");
  }
  const resolvedRoot = resolveRoot(root!);
  const results: ReturnType<typeof assessArtifactRoles>[] = [];
  const failures: { file: string; error: string }[] = [];
  for (const file of files) {
    try {
      results.push(assessArtifactRoles(resolvedRoot, file));
    } catch (error) {
      if (error instanceof RoleAssessmentError) {
        failures.push({ file: error.file, error: error.message });
        continue;
      }
      fail(`classify の実行に失敗した: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }
  emitJson({
    mode: "classify",
    files: results,
    failures,
  });
  if (failures.length > 0) {
    fail(`${failures.length} 件の成果物が判定できなかった（fail-closed）`, 2);
  }
}

if (import.meta.main) {
  main(process.argv.slice(2));
}
