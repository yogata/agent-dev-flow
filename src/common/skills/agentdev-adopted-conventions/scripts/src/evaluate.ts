// CLI: 採用規約に基づく対象成果物の判定（解決手順の第 3 段階）。
//
// 使い方:
//   bun src/evaluate.ts --root <project-root> [--file <declaration-path>]
//     [--scope <process-id>] [--check-path <artifact-path>]
//     [--exclude <process>:<artifact-path>:<reason>]
//
// - --root: 対象プロジェクトのルート
// - --file: 採用宣言のパス（root からの相対。既定は .agentdev/adopted-conventions.yaml）
// - --scope: 判定対象工程の部分集合（単独工程の実施。複数回指定可）
// - --check-path: 存在確認の対象パス（root からの相対。複数回指定可。未指定時は基準全件）
// - --exclude: 実行契約由来の根拠ある除外宣言（対象作業側で承認済みのもの。
//   process:artifact:reason 形式。複数回指定可。採用規約上の省略明示の代替ではなく、
//   対象作業の実行契約における根拠ある除外の経路）
//
// 出力: stdout に JSON（判定結果。移行期デフォルト時は判断留保 judgment-deferred）
// エラー: 実行エラーは非ゼロ終了コード + stderr。unresolvable / judgment-deferred は
//         終了コード 0 で JSON を返す（missing の検出は判定結果であり実行エラーではない）

import { parseArgs, fail, printJson } from "../lib/cli.ts";
import { resolveBasis } from "../lib/resolve.ts";
import { evaluateCriteria } from "../lib/judge.ts";

const argv = process.argv.slice(2);
const args = parseArgs(argv, ["scope", "check-path", "exclude"]);
const root = args.flags.get("root");
if (root === undefined) fail("--root は必須（対象プロジェクトのルート）");
const file = args.flags.get("file");
const scope = args.arrayFlags.get("scope");
const checkPaths = args.arrayFlags.get("check-path");
const executionExclusions = (args.arrayFlags.get("exclude") ?? []).map((entry) => {
  const parts = entry.split(":");
  if (parts.length !== 3) {
    fail(`--exclude は <process>:<artifact>:<reason> 形式（reason に : を含める場合は採用規約上の除外明示を利用すること）: ${entry}`);
  }
  const [process, artifact, reason] = parts as [string, string, string];
  if (process.trim() === "" || artifact.trim() === "" || reason.trim() === "") {
    fail(`--exclude の process、artifact、reason はすべて非空であること: ${entry}`);
  }
  return { process, artifact, reason };
});

const basis = resolveBasis(root, file);
const result = evaluateCriteria(root, basis, {
  processScope: scope,
  checkPaths,
  executionExclusions,
});
printJson(result);
