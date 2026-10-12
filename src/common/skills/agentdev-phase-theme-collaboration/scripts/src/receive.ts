/**
 * CLI: 外部AIの戻り入力の受理・採否記録生成（O(n) 線形走査、fail-closed）。
 *
 * bun src/receive.ts --input <path | -> [--adopt <id|title>]... [--prior <path>] [--prior-label <label>]
 *
 * - --input `-` で stdin（貼付経路）、パスでファイル経路。両経路は同一正規化で同一 JSON
 * - --adopt は利用者の明示採用指示（repeatable）。指定なしだと全エントリ不採用
 * - --prior は既存受領記録 JSON（再投入時の重複検出）
 * - 明示採用指示に該当エントリがない場合は非ゼロ終了（fail-closed）
 */
import { readFile } from "node:fs/promises";
import { parseArgs, printJson, fail, requireFlag } from "../lib/cli.ts";
import { receiveReturnInput, loadPriorRecord } from "../lib/receive.ts";

async function readInputText(flag: string): Promise<string> {
  if (flag === "-") {
    return await new Promise<string>((resolve, reject) => {
      let text = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => {
        text += chunk;
      });
      process.stdin.on("end", () => resolve(text));
      process.stdin.on("error", reject);
    });
  }
  return await readFile(flag, "utf8");
}

const args = parseArgs(process.argv.slice(2), ["adopt"]);
const inputFlag = requireFlag(args, "input");
const adoptIds = args.repeatFlags.get("adopt") ?? [];
const priorPath = args.flags.get("prior") ?? null;
const priorLabel = args.flags.get("prior-label") ?? null;

try {
  const rawText = await readInputText(inputFlag);
  const prior = priorPath !== null
    ? loadPriorRecord(JSON.parse(await readFile(priorPath, "utf8")))
    : null;
  const result = receiveReturnInput(rawText, adoptIds, prior, priorLabel ?? (priorPath !== null ? priorPath : null));
  printJson(result);
} catch (error) {
  fail(`戻り入力の受理に失敗した: ${error instanceof Error ? error.message : String(error)}`);
}
