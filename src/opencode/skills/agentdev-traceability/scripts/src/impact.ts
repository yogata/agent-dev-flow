// impact CLI。変更時の再確認候補取得（lib/query.ts の公開契約）。
// 探索範囲は成果物 ↔ 要件 ↔ 成果物の固定2ホップ。空結果は「影響なし」の証明として扱わない。
//
// 使い方:
//   bun scripts/src/impact.ts --root <repo-root> --req REQ-{NNNN}-{MMM}
//   bun scripts/src/impact.ts --root <repo-root> --artifact src/example.md

import { fail, emitJson, normalizeArtifactPath, parseArgs, resolveRoot } from "../lib/cli_utils.ts";
import { locateEvidence, scanCorpus } from "../lib/corpus.ts";
import { impactByArtifact, impactByRequirement } from "../lib/query.ts";

const args = parseArgs(process.argv.slice(2));
const rootValue = args.get("root");
if (!rootValue) fail("--root は必須です（例: --root <repo-root>）");
const root = resolveRoot(rootValue);
const reqId = args.get("req");
const artifact = args.get("artifact");
if (!reqId && !artifact) fail("--req か --artifact のいずれかを指定してください");
if (reqId && artifact) fail("--req と --artifact は同時に指定できません");

if (reqId) {
  const scan = scanCorpus(root);
  emitJson(impactByRequirement(scan.declarations, reqId));
} else {
  const normalized = normalizeArtifactPath(artifact!);
  const evidence = locateEvidence(root, normalized);
  if (!evidence.ok) {
    fail(
      JSON.stringify({ error: "evidence-unavailable", artifact: evidence.artifact, reason: evidence.reason }),
    );
  }
  const scan = scanCorpus(root);
  emitJson(impactByArtifact(scan.declarations, normalized));
}
