// ADF-COVERS(implementation): REQ-030-012, REQ-061-029, REQ-061-030
//
// Case 投入時の横断依存検査の CLI 入口。
// case-open（STEP-5 冪等確認）と case-ready（トレーサビリティ完全性ゲート）の両 workflow skill から
// 共有される単一実装（比較ロジックは lib/cross_dependency_engine.ts）。
//
// 入力: `--input` に検査入力 JSON ファイル、`--root` に共有領域ファイル相対パスの
// 解決基準ディレクトリ（省略時は cwd）。入力 JSON の構成は lib/cross_dependency_types.ts
// （検出源、未クローズ Case 群の宣言、共有領域定義を呼出側が収集した値）。
// 出力: stdout に報告 JSON。警告の有無にかかわらず検査成立時は終了コード 0
// （警告はエラーではなくゲート遷移判定に影響しない）。引数・入力の形式エラーは 1。

import * as fs from "node:fs";
import * as path from "node:path";
import type {
  CrossDependencyInspectionInput,
  CrossDependencyInspectionReport,
} from "../lib/cross_dependency_types.ts";
import { inspectCrossDependencies } from "../lib/cross_dependency_engine.ts";

const USAGE = `usage: bun .opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts --input <input.json> [--root <dir>]
  --input  検査入力 JSON（検出源、未クローズ Case 群の宣言、共有領域定義）
  --root   共有領域ファイル相対パスの解決基準ディレクトリ（省略時 cwd）`;

function fail(message: string): never {
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv: readonly string[]): { input: string; root: string } {
  let input: string | null = null;
  let root = process.cwd();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" && argv[i + 1] !== undefined) {
      input = argv[++i] ?? null;
    } else if (arg === "--root" && argv[i + 1] !== undefined) {
      root = argv[++i] as string;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${USAGE}\n`);
      process.exit(0);
    } else {
      fail(`unknown argument: ${arg}\n${USAGE}`);
    }
  }
  if (input === null) fail(`--input is required\n${USAGE}`);
  return { input, root };
}

function validateInput(value: unknown): CrossDependencyInspectionInput {
  if (typeof value !== "object" || value === null) fail("input must be a JSON object");
  const v = value as Record<string, unknown>;
  if (v.mode !== "case-open" && v.mode !== "case-ready") {
    fail('mode must be "case-open" or "case-ready"');
  }
  if (typeof v.current_case !== "object" || v.current_case === null) {
    fail("current_case is required");
  }
  if (!Array.isArray(v.unclosed_cases)) fail("unclosed_cases must be an array");
  return value as CrossDependencyInspectionInput;
}

function main(): void {
  const { input, root } = parseArgs(process.argv.slice(2));
  let raw: string;
  try {
    raw = fs.readFileSync(input, "utf-8");
  } catch (error) {
    fail(`cannot read input file: ${input} (${String(error)})`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`input is not valid JSON: ${String(error)}`);
  }
  const inspected = inspectCrossDependencies(validateInput(parsed), (relative) =>
    fs.readFileSync(path.resolve(root, relative), "utf-8"),
  );
  const report: CrossDependencyInspectionReport = inspected;
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();
