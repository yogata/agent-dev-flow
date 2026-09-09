// ADF-COVERS(implementation): REQ-053-014, REQ-053-015, REQ-053-016, REQ-053-022, REQ-053-031, REQ-053-032, REQ-053-033, REQ-010-074, REQ-010-075
// agentdev-textlint-guard 最終検査（単独実行入口）。
//
// 標準対象と追加対象の全件を列挙し、実ファイル全文を共通基盤（lib/）で検査する。
// shell、外部 editor、生成処理による変更も検出する。対象全件の拒否対象違反ゼロで
// 合格とし、検査不能は不合格とする。差分だけ、以前の査読結果だけ、pre-write 通過だけを
// 完了証拠にしない。docs-check に依存せず、導入先でも利用できる。
//
// 使い方:
//   bun run gate.ts [--root <project-root>] [--json]
// 終了コード: 0 = 合格（拒否対象違反ゼロ）、1 = 不合格（違反あり or 検査不能）、2 = 引数エラー

import { inspectAllTargetFiles } from "./lib/inspect.ts";
import { formatOutcome, type InspectionOutcome } from "./lib/results.ts";

interface GateCliArgs {
  readonly root: string;
  readonly json: boolean;
}

function parseArgs(argv: readonly string[]): GateCliArgs | { error: string } {
  let root: string | null = null;
  let json = false;
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === undefined) break;
    if (arg === "--root") {
      const value = argv[i + 1];
      if (value === undefined || value.length === 0) return { error: "--root requires a path argument" };
      root = value;
      i += 2;
      continue;
    }
    if (arg === "--json") {
      json = true;
      i += 1;
      continue;
    }
    return { error: `unknown argument: ${arg} (supported: --root <path>, --json)` };
  }
  return { root: root ?? process.cwd(), json };
}

export async function runFinalGate(argv: readonly string[]): Promise<{ exitCode: number; output: string }> {
  const parsed = parseArgs(argv);
  if ("error" in parsed) {
    return { exitCode: 2, output: `agentdev-textlint-guard final gate: ${parsed.error}` };
  }
  const result = await inspectAllTargetFiles(parsed.root);
  if (!result.ok) {
    return {
      exitCode: 1,
      output: parsed.json
        ? JSON.stringify({ ok: false, error: result.detail }, null, 2)
        : `${result.detail}\nfinal gate: FAIL (inspection could not complete)`,
    };
  }
  if (result.outcome.hardCount > 0) {
    return {
      exitCode: 1,
      output: parsed.json
        ? finalGateJsonPayload(result.outcome)
        : `${formatOutcome(result.outcome)}\nfinal gate: FAIL (hard violations remain)`,
    };
  }
  const adviceCount = result.outcome.files.reduce(
    (acc, f) => acc + f.findings.filter((x) => x.severity !== "hard").length,
    0,
  );
  if (parsed.json) {
    return { exitCode: 0, output: JSON.stringify({ ok: true, outcome: result.outcome }, null, 2) };
  }
  const adviceSummary = adviceCount > 0 ? ` 助言対象: ${adviceCount} 件。` : "";
  return {
    exitCode: 0,
    output: `final gate: PASS (${result.outcome.files.length} target file(s) inspected, 0 hard violations).${adviceSummary}`,
  };
}

if (import.meta.main) {
  const result = await runFinalGate(process.argv.slice(2));
  console.log(result.output);
  process.exit(result.exitCode);
}

/** JSON 出力用の公開関数（テスト・本体側の保存・完了・品質検査からの利用入口）。 */
export function finalGateJsonPayload(outcome: InspectionOutcome): string {
  return JSON.stringify({ ok: outcome.hardCount === 0, outcome }, null, 2);
}
