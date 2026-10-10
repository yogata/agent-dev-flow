// reuse CLI。変更前の証拠を再利用する場合の構造的適用可否確認
// （lib/reuse.ts の公開契約）。
//
// 使い方:
//   bun scripts/src/reuse.ts --root <repo-root> --evidence <repo-relative-path> [--revision <identifier>]
//
// - 構造検査（対象の存在・読取可能性、covers 宣言関係、links の双方向）を列挙する
// - 版・条件の適合は意味的品質検証であり、本 CLI は合格判定を返さない。
//   manualConfirmation の確認を経ない証拠再利用を変更反映完了の根拠にしない
//
// 終了コード: 正常 0、実行エラー 1。

import { fail, emitJson, parseArgs, resolveRoot } from "../lib/cli_utils.ts";
import { evaluateEvidenceReuse } from "../lib/reuse.ts";

const args = parseArgs(process.argv.slice(2));
const rootValue = args.get("root");
if (!rootValue) fail("--root は必須です（例: --root <repo-root>）");
const root = resolveRoot(rootValue);
const evidence = args.get("evidence");
if (!evidence) fail("--evidence は必須です（例: --evidence docs/reports/previous-run.md）");
const revision = args.get("revision");

emitJson(evaluateEvidenceReuse(root, evidence, revision));
