// list CLI。課題の検索、一覧、形式検証（lib/issue_file.ts の公開契約）。
//
// 使い方:
//   bun scripts/src/list.ts --root .
//   bun scripts/src/list.ts --root . --status on-hold
//   bun scripts/src/list.ts --root . --related docs/requirements/REQ-{NNN}.md
//   bun scripts/src/list.ts --root . --id ISL-{NNN}
//   bun scripts/src/list.ts --root . --validate
//
// 出力: stdout に JSON（--format md 指定時は Markdown 表）。
// 終了コード: 0 = 正常、1 = 実行エラー、2 = --validate 指定時に形式検証 fail あり。

import { emitJson, fail, parseArgs } from "../lib/cli_utils.ts";
import {
  countByStatus,
  filterIssues,
  scanIssueDir,
  toMarkdownTable,
  validateIssues,
} from "../lib/issue_file.ts";

const VALUE_KEYS = ["root", "status", "related", "id", "format"] as const;
const FLAG_KEYS = ["validate"] as const;

let args: Map<string, string | boolean>;
try {
  args = parseArgs(process.argv.slice(2), VALUE_KEYS, FLAG_KEYS);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const root = args.get("root");
if (typeof root !== "string") fail("--root は必須です（例: --root .）");

const format = args.get("format");
if (format !== undefined && format !== "json" && format !== "md") {
  fail("--format は json または md を指定してください");
}
const status = args.get("status");
const related = args.get("related");
const id = args.get("id");
if (typeof id === "string" && !/^ISL-\d{3}$/.test(id)) {
  fail("--id は ISL-NNN 形式（3桁ゼロ埋め）で指定してください");
}

const files = scanIssueDir(root);
const records = filterIssues(files, {
  status: typeof status === "string" ? status : undefined,
  related: typeof related === "string" ? related : undefined,
  id: typeof id === "string" ? id : undefined,
});
const validation = validateIssues(files);

if (format === "md") {
  console.log(toMarkdownTable(records));
} else {
  emitJson({
    issues: records,
    counts: countByStatus(records),
    validation,
  });
}

if (args.get("validate") === true && validation.length > 0) {
  process.exit(2);
}
