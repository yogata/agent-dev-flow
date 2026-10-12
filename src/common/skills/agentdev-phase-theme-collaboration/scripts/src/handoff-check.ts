/**
 * CLI: 持出し文書の構成検証（持出し確認契約の機械的部分）。
 *
 * bun src/handoff-check.ts --input <path | ->
 *
 * 必須4要素（目的・問い・前提・参照元）と既知機密パターンを検証する。
 * 送信機能を持たないため、出力に送出先・送信操作のフィールドは存在しない。
 * 機密検出時も終了コードは 0（検証結果の報告。送出判断は利用者が担う）。
 */
import { readFile } from "node:fs/promises";
import { parseArgs, printJson, fail, requireFlag } from "../lib/cli.ts";
import { checkHandoff } from "../lib/handoff.ts";

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

const args = parseArgs(process.argv.slice(2));
const inputFlag = requireFlag(args, "input");

try {
  const text = await readInputText(inputFlag);
  const result = checkHandoff(text);
  printJson(result);
} catch (error) {
  fail(`持出し文書の検証に失敗した: ${error instanceof Error ? error.message : String(error)}`);
}
