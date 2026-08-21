// check CLI。対応宣言コーパスの7種検査（lib/check.ts の公開契約）。
// 検証対応要否カタログ（既定パス、不在時は全要件行が検証対応必須）も自動的に読み込む。
//
// 使い方:
//   bun scripts/src/check.ts --root .
//   bun scripts/src/check.ts --root . --req REQ-{NNNN}-{MMM},REQ-{NNNN}-{MMM}   # 完全性検査の対象要件を限定
//   bun scripts/src/check.ts --root . --artifact src/example.md                # 成果物の根拠検査を追加
//
// 終了コード: すべて pass で 0、検査 fail ありで 2、実行エラーで 1。

import { fail, emitJson, normalizeArtifactPath, parseArgs } from "../lib/cli_utils.ts";
import { locateEvidence, scanCorpus } from "../lib/corpus.ts";
import { runChecks } from "../lib/check.ts";
import { currentRequirementLineIds } from "../lib/requirements.ts";
import { resolveVerificationScopeFromRoot } from "../lib/verification_scope.ts";

const args = parseArgs(process.argv.slice(2));
const root = args.get("root");
if (!root) fail("--root は必須です（例: --root .）");

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
  const evidence = locateEvidence(root!, normalized);
  if (!evidence.ok) {
    evidenceArtifacts.push({ artifact: evidence.artifact, reason: evidence.reason });
  }
}

const scan = scanCorpus(root!);
const knownReqIds = currentRequirementLineIds(root!);
const verificationScope = resolveVerificationScopeFromRoot(root!, knownReqIds);
const report = runChecks(scan, knownReqIds, {
  verificationScope,
  ...(completenessReqIds ? { completenessReqIds } : {}),
  ...(evidenceArtifacts.length > 0 ? { evidenceArtifacts } : {}),
});
emitJson(report);
if (report.summary.fail > 0) process.exit(2);
