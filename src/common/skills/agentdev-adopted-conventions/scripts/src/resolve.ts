// CLI: 採用規約の解決（解決手順の第 1〜2 段階）。
//
// 使い方:
//   bun src/resolve.ts --root <project-root> [--file <declaration-path>]
//     [--scope <process-id>]
//
// - --root: 対象プロジェクトのルート（採用宣言の配置先プロジェクト）
// - --file: 採用宣言のパス（root からの相対。既定は .agentdev/adopted-conventions.yaml）
// - --scope: 基準を特定する工程 id（単独工程の実施。複数回指定可）
//
// 出力: stdout に JSON（解決基準 basis と、adopted の場合は特定済み基準 criteria）
// エラー: 実行エラーは非ゼロ終了コード + stderr。unresolvable は解決結果として
//         終了コード 0 で JSON を返す（判定を下さず判断留保を返すため）

import { parseArgs, fail, printJson } from "../lib/cli.ts";
import { resolveBasis, identifyCriteria } from "../lib/resolve.ts";

const argv = process.argv.slice(2);
const args = parseArgs(argv, ["scope"]);
const root = args.flags.get("root");
if (root === undefined) fail("--root は必須（対象プロジェクトのルート）");
const file = args.flags.get("file");
const scope = args.arrayFlags.get("scope");

const basis = resolveBasis(root, file);
if (basis.basis === "adopted") {
  let criteria;
  try {
    criteria = identifyCriteria(basis.declarations, scope);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  printJson({ basis: "adopted", file: basis.file, adoptedAt: basis.declarations.adoptedAt, criteria });
} else if (basis.basis === "transition-default") {
  printJson({ basis: "transition-default", file: null, reference: basis.reference });
} else {
  printJson({ basis: "unresolvable", file: basis.file, reason: basis.reason, issues: basis.issues });
}
