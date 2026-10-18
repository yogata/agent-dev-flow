/**
 * CLI: テーマ一覧の導出と旧新対応の解決（未決引継ぎ・旧新解決・一覧導出・採用状態照合の機械的部分）。
 *
 * bun src/themes.ts --themes-file <path> [--pending-file <path>] [--resolve-old <THEME-NNN>] [--assess-adoption true]
 *
 * テーマ一覧はテーマ正本から導出する（恒久一覧を作らない）。
 * 同一入力から同一 JSON を返す（決定的）。
 */
import { readFile } from "node:fs/promises";
import { parseArgs, printJson, fail, requireFlag } from "../lib/cli.ts";
import { parseThemes, parsePending, deriveThemeList, resolveOldId, carriedPending, assessAdoptionClaims } from "../lib/sections.ts";

const args = parseArgs(process.argv.slice(2));
const themesFile = requireFlag(args, "themes-file");
const pendingFile = args.flags.get("pending-file") ?? null;
const resolveOld = args.flags.get("resolve-old") ?? null;
const assessAdoption = args.flags.get("assess-adoption") === "true";

try {
  const themesText = await readFile(themesFile, "utf8");
  const sections = parseThemes(themesText);
  const themes = deriveThemeList(sections);
  const output: Record<string, unknown> = {
    themes,
    count: themes.length,
  };
  if (assessAdoption) {
    output["adoptionAssessments"] = assessAdoptionClaims(sections);
  }
  if (pendingFile !== null) {
    const pendingText = await readFile(pendingFile, "utf8");
    const pending = parsePending(pendingText);
    output["pending"] = pending;
    output["carriedPending"] = carriedPending(pending).map((section) => section.id);
  }
  if (resolveOld !== null) {
    output["oldResolution"] = resolveOldId(sections, resolveOld);
  }
  printJson(output);
} catch (error) {
  fail(`テーマ一覧の導出に失敗した: ${error instanceof Error ? error.message : String(error)}`);
}
