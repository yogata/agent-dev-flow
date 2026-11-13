// 導出 checker CLI。対応宣言の導出実行と、導出結果と手動宣言の重複・矛盾の
// 決定的検出（lib/check.ts の derived-declaration-conflicts 検査）を出力する
// 恒常 checker 資産の運用入口。
//
// 使い方:
//   bun scripts/src/derivations.ts --root <repo-root>
//
// 出力: stdout に JSON
//   - derivedDeclarations: 導出された対応宣言（traceability/derivations.yaml の
//     導出規約に基づく決定的導出分）
//   - derivationIssues: 導出機構の解析・実行 issues
//   - conflicts: derived-declaration-conflicts 検査結果（重複・矛盾の findings）
//   - summary: 導出件数・重複件数・矛盾件数・issue 件数
//
// 終了コード: 導出と重複・矛盾検出がすべて pass で 0、検出ありで 2、実行エラーで 1。
//
// 注意: 本 CLI は重複・矛盾検出（構造検査）のみを出力する。対応宣言の存在は
// 要件の実現または検証の成立を証明しない（T-003）。

import { fail, emitJson, parseArgs, resolveRoot } from "../lib/cli_utils.ts";
import { scanCorpus } from "../lib/corpus.ts";
import { runChecks } from "../lib/check.ts";
import { currentRequirementLineIds } from "../lib/requirements.ts";
import { resolveVerificationPolicyFromRoot } from "../lib/verification_scope.ts";

const args = parseArgs(process.argv.slice(2));
const rootValue = args.get("root");
if (!rootValue) fail("--root は必須です（例: --root <repo-root>）");
const root = resolveRoot(rootValue);

const scan = scanCorpus(root);
const knownReqIds = currentRequirementLineIds(root);
const verificationPolicy = resolveVerificationPolicyFromRoot(root, knownReqIds);
const report = runChecks(scan, knownReqIds, { verificationPolicy });

const conflicts = report.checks["derived-declaration-conflicts"];

emitJson({
  root,
  derivedDeclarations: scan.derivedDeclarations,
  derivationIssues: scan.derivationIssues,
  conflicts: {
    kind: conflicts.kind,
    status: conflicts.status,
    findings: conflicts.findings,
  },
  summary: {
    derivedCount: scan.derivedDeclarations.length,
    conflictStatus: conflicts.status,
    conflictCount: conflicts.findings.length,
    issueCount: scan.derivationIssues.length,
  },
});
if (conflicts.status === "fail") process.exit(2);
