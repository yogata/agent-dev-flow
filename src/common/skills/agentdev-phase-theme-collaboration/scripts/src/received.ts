/**
 * CLI: 受領済み途中検討知見の照会（別セッション再取得の機械的部分）。
 *
 * bun src/received.ts --dir <received-dir> [--theme <THEME-NNN>]
 *
 * received/ 配下の受領記録（YAML frontmatter 様式）を読み、受領情報を一覧する。
 * 一度も受領していない外部検討内容は、received/ に記録が存在しないため返らない
 * （未受領の内容を復元したと扱わない契約の機械的基盤）。
 * 破損した受領記録は silent skip せず非ゼロ終了で報告する（fail-closed）。
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs, printJson, fail, requireFlag } from "../lib/cli.ts";
import { parseReceivedRecordMeta, type ReceivedRecordMeta } from "../lib/schema.ts";

function parseFrontmatter(text: string, file: string): ReceivedRecordMeta {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (match === null || match[1] === undefined) {
    throw new Error(`${file}: 受領記録の frontmatter が検出できない`);
  }
  const parsed: unknown = Bun.YAML.parse(match[1]);
  return parseReceivedRecordMeta(parsed, file);
}

const args = parseArgs(process.argv.slice(2));
const dir = requireFlag(args, "dir");
const themeFilter = args.flags.get("theme") ?? null;

try {
  const entries = (await readdir(dir)).filter((entry) => entry.endsWith(".md")).sort();
  const records = [];
  for (const entry of entries) {
    const file = join(dir, entry);
    const meta = parseFrontmatter(await readFile(file, "utf8"), entry);
    records.push({ file: entry, ...meta });
  }
  const filtered = themeFilter === null ? records : records.filter((record) => record.theme === themeFilter);
  printJson({ records: filtered, count: filtered.length });
} catch (error) {
  fail(`受領記録の照会に失敗した: ${error instanceof Error ? error.message : String(error)}`);
}
