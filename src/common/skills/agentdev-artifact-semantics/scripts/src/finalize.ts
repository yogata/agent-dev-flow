// CLI: finalize — 工程別正式確定の判定。
//
// 入力:
//   --root（検証対象リポジトリのルート。絶対パス推奨）
//   --artifact（対象成果物のリポジトリ相対パス）
//   --phase（工程に対応する成果物役割: requirement / decision / design / implementation / verification）
//   --upstream（上流要求行のカンマ区切り。1件以上必須）
//   --verification（検証根拠のカンマ区切り。1件以上必須）
//   --coverage-report-file（agentdev-traceability coverage --artifact <artifact> の stdout JSON を
//     保存したファイル）
// 出力: stdout に JSON。coverage 報告の不一致・phase 不正は非ゼロ終了 + stderr。
// 決定性: 同一入力から同一の JSON を返す。

import { readFileSync } from "node:fs";
import { assessFinalization, ARTIFACT_PHASES, FinalizationError } from "../lib/finalization.ts";
import type { ArtifactRole } from "../lib/roles.ts";
import { emitJson, fail, parseArgs, parseCsv, resolveRoot } from "../lib/cli_utils.ts";

export function main(argv: readonly string[]): void {
  const args = parseArgs(argv);
  const root = args.get("root");
  const artifact = args.get("artifact");
  const phase = args.get("phase");
  const upstreamValue = args.get("upstream");
  const verificationValue = args.get("verification");
  const coverageReportFile = args.get("coverage-report-file");
  if (!root || !artifact || !phase || !upstreamValue || !verificationValue || !coverageReportFile) {
    fail(
      "使い方: bun src/finalize.ts --root <repo-root> --artifact <path> --phase <role> --upstream <REQ,...> --verification <path,...> --coverage-report-file <coverage.json>",
    );
  }
  if (!ARTIFACT_PHASES.includes(phase as ArtifactRole)) {
    fail(`phase は次のいずれかであること: ${ARTIFACT_PHASES.join(", ")}`);
  }
  const upstream = parseCsv(upstreamValue!);
  const verification = parseCsv(verificationValue!);
  if (upstream.length === 0 || verification.length === 0) {
    fail("--upstream と --verification には1件以上を指定すること（上流整合・必要な検証の成立なしに確定させない）");
  }
  const resolvedRoot = resolveRoot(root!);
  let coverageJson: string;
  try {
    coverageJson = readFileSync(coverageReportFile!, "utf-8");
  } catch {
    fail(`coverage 報告ファイルを読み取れない（${coverageReportFile}）`);
  }
  let result;
  try {
    result = assessFinalization(
      resolvedRoot,
      artifact!,
      phase as ArtifactRole,
      upstream,
      verification,
      coverageJson,
    );
  } catch (error) {
    if (error instanceof FinalizationError) {
      fail(error.message);
    }
    fail(`finalize の実行に失敗した: ${error instanceof Error ? error.message : "unknown error"}`);
  }
  emitJson(result);
}

if (import.meta.main) {
  main(process.argv.slice(2));
}
