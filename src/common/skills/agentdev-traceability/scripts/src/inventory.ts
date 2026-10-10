// inventory CLI。正規成果物の棚卸しと宣言外候補の発見（lib/inventory.ts の
// 公開契約）。
//
// 使い方:
//   bun scripts/src/inventory.ts --root <repo-root>
//
// - 棚卸しは coverage・check の能力を入力にせず、正規成果物の直接走査で行う
// - 宣言外の実在成果物は発見候補（advisory・fail-open）として返す。
//   発見候補を対応関係の欠落と誤判定しない
//
// 終了コード: 正常 0、実行エラー 1。

import { fail, emitJson, parseArgs, resolveRoot } from "../lib/cli_utils.ts";
import { buildInventory } from "../lib/inventory.ts";

const args = parseArgs(process.argv.slice(2));
const rootValue = args.get("root");
if (!rootValue) fail("--root は必須です（例: --root <repo-root>）");
const root = resolveRoot(rootValue);

emitJson(buildInventory(root));
