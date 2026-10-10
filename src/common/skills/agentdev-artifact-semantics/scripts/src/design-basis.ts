// CLI: design-basis — 採用規約に基づく設計責務判定。
//
// 入力:
//   --root（検証対象リポジトリのルート。絶対パス推奨）
//   --req（要件行ID。1行）
//   --coverage-report-file（agentdev-traceability coverage --req <reqId> の stdout JSON を
//     保存したファイル。宣言解析の正規所有者からの報告を消費する）
//   --adopted（採用宣言 YAML のリポジトリ相対パス。省略時は移行期デフォルト）
// 出力: stdout に JSON。採用宣言の読取失敗・解析失敗は非ゼロ終了 + stderr（fail-closed）。
// 決定性: 同一入力から同一の JSON を返す。

import { readFileSync } from "node:fs";
import { assessDesignBasis, DesignBasisError } from "../lib/design-basis.ts";
import { ConventionsError, readAdoptedConventionsFile, resolveConventions } from "../lib/conventions.ts";
import { emitJson, fail, parseArgs, resolveRoot } from "../lib/cli_utils.ts";

export function main(argv: readonly string[]): void {
  const args = parseArgs(argv);
  const root = args.get("root");
  const req = args.get("req");
  const coverageReportFile = args.get("coverage-report-file");
  const adopted = args.get("adopted");
  if (!root || !req || !coverageReportFile) {
    fail(
      "使い方: bun src/design-basis.ts --root <repo-root> --req <REQ-{NNNN}-{MMM}> --coverage-report-file <coverage.json> [--adopted <conventions.yaml>]",
    );
  }
  const resolvedRoot = resolveRoot(root!);
  let coverageJson: string;
  try {
    coverageJson = readFileSync(coverageReportFile!, "utf-8");
  } catch {
    fail(`coverage 報告ファイルを読み取れない（${coverageReportFile}）`);
  }
  let conventionsJson: string | undefined;
  if (adopted !== undefined) {
    try {
      conventionsJson = readAdoptedConventionsFile(resolvedRoot, adopted);
    } catch (error) {
      fail(error instanceof Error ? error.message : "unknown error");
    }
  }
  let result;
  try {
    const conventions = resolveConventions(conventionsJson);
    result = assessDesignBasis(resolvedRoot, coverageJson, conventions);
  } catch (error) {
    if (error instanceof ConventionsError || error instanceof DesignBasisError) {
      fail(error.message);
    }
    fail(`design-basis の実行に失敗した: ${error instanceof Error ? error.message : "unknown error"}`);
  }
  emitJson(result);
}

if (import.meta.main) {
  main(process.argv.slice(2));
}
