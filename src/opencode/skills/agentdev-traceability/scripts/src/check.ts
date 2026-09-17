// check CLI。対応関係コーパスの9種検査（lib/check.ts の公開契約）。
// 検証スコープポリシー（traceability/policy.yaml、不在時は全要件行が検証対応必須）も
// 自動的に読み込む。policy または sidecar の解決が実行不能な場合、対応完全性の
// 合格を返さない（fail-closed）。
//
// 使い方:
//   bun scripts/src/check.ts --root <repo-root>
//   bun scripts/src/check.ts --root <repo-root> --req REQ-{NNNN}-{MMM},REQ-{NNNN}-{MMM}   # 完全性検査の対象要件を限定
//   bun scripts/src/check.ts --root <repo-root> --artifact src/example.md                # 成果物の根拠検査を追加
//
// 終了コード: すべて pass で 0、検査 fail ありで 2、実行エラーで 1。

import { fail, emitJson, normalizeArtifactPath, parseArgs, resolveRoot } from "../lib/cli_utils.ts";
import { locateEvidence, scanCorpus } from "../lib/corpus.ts";
import { runChecks } from "../lib/check.ts";
import { currentRequirementLineIds } from "../lib/requirements.ts";
import { resolveVerificationPolicyFromRoot } from "../lib/verification_scope.ts";

const args = parseArgs(process.argv.slice(2));
const rootValue = args.get("root");
if (!rootValue) fail("--root は必須です（例: --root <repo-root>）");
const root = resolveRoot(rootValue);

const reqFilter = args.get("req");
const completenessReqIds = reqFilter
  ? reqFilter
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  : undefined;

const evidenceArtifacts: { artifact: string; reason: string }[] = [];
const artifact = args.get("artifact");
if (artifact) {
  const normalized = normalizeArtifactPath(artifact);
  const evidence = locateEvidence(root, normalized);
  if (!evidence.ok) {
    evidenceArtifacts.push({ artifact: evidence.artifact, reason: evidence.reason });
  }
}

const scan = scanCorpus(root);
const knownReqIds = currentRequirementLineIds(root);
const verificationPolicy = resolveVerificationPolicyFromRoot(root, knownReqIds);
const report = runChecks(scan, knownReqIds, {
  verificationPolicy,
  ...(completenessReqIds ? { completenessReqIds } : {}),
  ...(evidenceArtifacts.length > 0 ? { evidenceArtifacts } : {}),
});
emitJson(report);
if (report.summary.fail > 0) process.exit(2);
