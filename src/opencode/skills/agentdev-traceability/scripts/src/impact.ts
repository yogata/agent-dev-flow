// impact CLI。変更時の再確認候補取得（lib/query.ts の公開契約）。
// 探索範囲は成果物 ↔ 要件 ↔ 成果物の固定2ホップ。空結果は「影響なし」の証明として扱わない。
//
// 使い方:
//   bun scripts/src/impact.ts --root <repo-root> --req REQ-{NNNN}-{MMM}
//   bun scripts/src/impact.ts --root <repo-root> --req REQ-{NNNN}-{MMM},REQ-{NNNN}-{MMM}   # 各 reqId の照合結果を指定順で連結
//   bun scripts/src/impact.ts --root <repo-root> --artifact src/example.md

import { fail, emitJson, normalizeArtifactPath, parseArgs, parseReqIds, resolveRoot } from "../lib/cli_utils.ts";
import { locateEvidence, scanCorpus } from "../lib/corpus.ts";
import type { CoverDeclaration } from "../lib/declarations.ts";
import {
  EMPTY_IMPACT_NOTE,
  impactByArtifact,
  impactByRequirement,
  type ImpactByRequirement,
} from "../lib/query.ts";

// 複数 reqId 指定時は各 reqId 個別の照合結果の連結（指定順）。検出ロジック自体は
// impactByRequirement（単数照合）を再利用する。
function impactByRequirementList(
  declarations: readonly CoverDeclaration[],
  reqIds: readonly string[],
): ImpactByRequirement {
  const results = reqIds.map((id) => impactByRequirement(declarations, id));
  const recheckCandidates = results.flatMap((r) => r.recheckCandidates);
  const emptyResult = recheckCandidates.length === 0;
  return {
    mode: "requirement",
    reqId: reqIds.join(","),
    recheckCandidates,
    emptyResult,
    ...(emptyResult ? { note: EMPTY_IMPACT_NOTE } : {}),
  };
}

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
  const reqIds = parseReqIds(reqId);
  emitJson(
    reqIds.length > 0
      ? impactByRequirementList(scan.declarations, reqIds)
      : impactByRequirement(scan.declarations, reqId),
  );
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
