// coverage CLI。要件起点・成果物起点の対応関係取得（lib/query.ts の公開契約）。
//
// 使い方:
//   bun scripts/src/coverage.ts --root . --req REQ-{NNNN}-{MMM}
//   bun scripts/src/coverage.ts --root . --artifact src/example.md

import { fail, emitJson, normalizeArtifactPath, parseArgs } from "../lib/cli_utils.ts";
import { locateEvidence, scanCorpus } from "../lib/corpus.ts";
import { coverageByArtifact, coverageByRequirement } from "../lib/query.ts";

const args = parseArgs(process.argv.slice(2));
const root = args.get("root");
if (!root) fail("--root は必須です（例: --root .）");
const reqId = args.get("req");
const artifact = args.get("artifact");
if (!reqId && !artifact) fail("--req か --artifact のいずれかを指定してください");
if (reqId && artifact) fail("--req と --artifact は同時に指定できません");

if (reqId) {
  const scan = scanCorpus(root!);
  emitJson(coverageByRequirement(scan.declarations, reqId));
} else {
  const normalized = normalizeArtifactPath(artifact!);
  const evidence = locateEvidence(root!, normalized);
  if (!evidence.ok) {
    fail(
      JSON.stringify({ error: "evidence-unavailable", artifact: evidence.artifact, reason: evidence.reason }),
    );
  }
  const scan = scanCorpus(root!);
  emitJson(coverageByArtifact(scan.declarations, normalized));
}
