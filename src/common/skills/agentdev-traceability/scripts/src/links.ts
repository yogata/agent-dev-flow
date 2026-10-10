// links CLI。採用された隣接工程間対応の双方向追跡（lib/links.ts の解析結果を
// lib/corpus.ts の直接走査で解決して返す公開契約）。
//
// 使い方:
//   bun scripts/src/links.ts --root <repo-root> --artifact <repo-relative-path>
//
// - upstream: 当該成果物が links 宣言する上流（下流→上流。宣言そのまま）
// - downstream: 当該成果物を上流として参照する下流（上流→下流。逆引き）
// - 探索は固定 1 ホップであり、任意深度のグラフ探索を行わない
// - 空結果を「隣接工程が存在しない」の証明として扱わない
//
// 終了コード: 正常 0、実行エラー 1（検査 fail は本 CLI の契約外）。

import { fail, emitJson, normalizeArtifactPath, parseArgs, resolveRoot } from "../lib/cli_utils.ts";
import { locateEvidence, scanCorpus } from "../lib/corpus.ts";

const args = parseArgs(process.argv.slice(2));
const rootValue = args.get("root");
if (!rootValue) fail("--root は必須です（例: --root <repo-root>）");
const root = resolveRoot(rootValue);
const artifactValue = args.get("artifact");
if (!artifactValue) fail("--artifact は必須です（例: --artifact docs/designs/example.md）");
const artifact = normalizeArtifactPath(artifactValue);

const evidence = locateEvidence(root, artifact);
if (!evidence.ok) {
  fail(
    JSON.stringify({ error: "artifact-unavailable", artifact: evidence.artifact, reason: evidence.reason }),
  );
}

const scan = scanCorpus(root);
const upstream = scan.links
  .filter((l) => l.source === artifact)
  .map((l) => ({ artifact: l.target, origin: l.origin, direction: l.direction }))
  .sort((a, b) => (a.artifact < b.artifact ? -1 : 1));
const downstream = scan.links
  .filter((l) => l.target === artifact)
  .map((l) => ({ artifact: l.source, origin: l.origin, direction: l.direction }))
  .sort((a, b) => (a.artifact < b.artifact ? -1 : 1));

emitJson({
  mode: "artifact",
  artifact,
  upstream,
  downstream,
  emptyResult: upstream.length === 0 && downstream.length === 0,
  note: "双方向の列挙は宣言済み隣接工程間対応のみを対象とする固定 1 ホップである。空結果は隣接工程が存在しないことの証明ではない。採用された隣接工程間の対応は存在しない詳細工程へ強制されない",
});
