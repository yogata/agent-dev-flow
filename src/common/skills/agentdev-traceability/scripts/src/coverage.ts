// coverage CLI。要件起点・成果物起点の対応関係取得（lib/query.ts の公開契約）。
//
// 使い方:
//   bun scripts/src/coverage.ts --root <repo-root> --req REQ-{NNNN}-{MMM}
//   bun scripts/src/coverage.ts --root <repo-root> --req REQ-{NNNN}-{MMM},REQ-{NNNN}-{MMM}   # 各 reqId の照合結果を指定順で連結
//   bun scripts/src/coverage.ts --root <repo-root> --artifact src/example.md

import { fail, emitJson, normalizeArtifactPath, parseArgs, parseReqIds, resolveRoot } from "../lib/cli_utils.ts";
import { locateEvidence, scanCorpus } from "../lib/corpus.ts";
import type { CoverDeclaration } from "../lib/declarations.ts";
import { coverageByArtifact, coverageByRequirement, type CoverageByRequirement } from "../lib/query.ts";

// 複数 reqId 指定時は各 reqId 個別の照合結果の連結（指定順）。検出ロジック自体は
// coverageByRequirement（単数照合）を再利用する。
function coverageByRequirementList(
  declarations: readonly CoverDeclaration[],
  reqIds: readonly string[],
): CoverageByRequirement {
  const results = reqIds.map((id) => coverageByRequirement(declarations, id));
  const relations = results.flatMap((r) => r.relations);
  return {
    mode: "requirement",
    reqId: reqIds.join(","),
    relations,
    counts: {
      decision: results.reduce((acc, r) => acc + r.counts.decision, 0),
      design: results.reduce((acc, r) => acc + r.counts.design, 0),
      implementation: results.reduce((acc, r) => acc + r.counts.implementation, 0),
      verification: results.reduce((acc, r) => acc + r.counts.verification, 0),
      total: relations.length,
    },
    truncated: false,
    emptyResult: relations.length === 0,
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
      ? coverageByRequirementList(scan.declarations, reqIds)
      : coverageByRequirement(scan.declarations, reqId),
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
  emitJson(coverageByArtifact(scan.declarations, normalized));
}
