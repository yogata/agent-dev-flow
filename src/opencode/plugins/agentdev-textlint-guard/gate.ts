// agentdev-textlint-guard 最終検査（単独実行入口・用途別入口）。
//
// 標準対象と追加対象の全件を列挙し、実ファイル全文を共通基盤（lib/）で検査する。
// shell、外部 editor、生成処理による変更も検出する。対象全件の拒否対象違反ゼロで
// 合格とし、検査不能は不合格とする。差分だけ、以前の査読結果だけ、pre-write 通過だけを
// 完了証拠にしない。docs-check に依存せず、導入先でも利用できる。
//
// 用途は正規契約から決定的に選択される（REQ-053-047。--purpose で工程側の契約上の
// 用途を指定する。既定は通常最終検査）。通常最終検査（final）は対象全件の列挙と全文取得を
// 毎回行った上で、同一性が機械検証できた対象だけ規則実行を省略し、保存済みの
// ファイル単位結果を再利用する（REQ-053-041〜044）。必須独立検査（independent）は
// 保存結果を利用せず対象全件の規則を実行する（REQ-053-045）。結果表示（display）は
// 検査を起動せず直近の実行結果を読み戻すだけである（進行判定には使えない）。
// 検査の開始時・終了時に対象集合、本文、検査条件を照合し、変化が生じた場合は
// 未完了として進行判定が拒否される（REQ-053-046）。
//
// 使い方:
//   bun run gate.ts [--root <project-root>] [--purpose final|independent|display] [--json]
// 終了コード: 0 = 合格（拒否対象違反ゼロ、完了、照合一致）、1 = 不合格（違反あり、検査不能、
//   未完了〔開始終了時照合の不一致を含む〕、または対象解決 0 件〔0 inspected〕）、
//   2 = 引数エラー。display は検査を起動しないため常に 0 を返す（進行判定には使えない）。

import { formatOutcome, type InspectionOutcome } from "./lib/results.ts";
import { acceptForProgress, formatRunResult, runDisplay, runInspection } from "./lib/runs.ts";

interface GateCliArgs {
  readonly root: string;
  readonly json: boolean;
  readonly purpose: "final" | "independent" | "display";
}

function parseArgs(argv: readonly string[]): GateCliArgs | { error: string } {
  let root: string | null = null;
  let json = false;
  let purpose: GateCliArgs["purpose"] | null = null;
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
    if (arg === "--purpose") {
      const value = argv[i + 1];
      if (value !== "final" && value !== "independent" && value !== "display") {
        return { error: "--purpose requires final, independent, or display" };
      }
      purpose = value;
      i += 2;
      continue;
    }
    if (arg === "--json") {
      json = true;
      i += 1;
      continue;
    }
    return { error: `unknown argument: ${arg} (supported: --root <path>, --purpose final|independent|display, --json)` };
  }
  return { root: root ?? process.cwd(), json, purpose: purpose ?? "final" };
}

export async function runFinalGate(argv: readonly string[]): Promise<{ exitCode: number; output: string }> {
  const parsed = parseArgs(argv);
  if ("error" in parsed) {
    return { exitCode: 2, output: `agentdev-textlint-guard final gate: ${parsed.error}` };
  }
  if (parsed.purpose === "display") {
    const run = await runDisplay(parsed.root);
    const output = parsed.json
      ? JSON.stringify({ ok: false, run, inspectedFiles: run.targetScope.count }, null, 2)
      : `${formatRunResult(run)}\ndisplay: ${run.detail ?? "done"}`;
    return { exitCode: 0, output };
  }
  const run = await runInspection(parsed.root, parsed.purpose);
  const accepted = acceptForProgress(run);
  if (!accepted.accepted) {
    const inspectedFiles = run.files.filter((f) => f.findings.length > 0 || run.targetScope.count === 0).length;
    const count = run.targetScope.count === 0 ? 0 : Math.max(inspectedFiles, run.targetScope.count);
    const output = parsed.json
      ? JSON.stringify(
          {
            ok: false,
            error: accepted.reason ?? undefined,
            ...(run.files.length > 0 ? { outcome: { files: run.files, hardCount: run.hardCount } satisfies InspectionOutcome } : {}),
            run,
            inspectedFiles: count,
          },
          null,
          2,
        )
      : `${formatRunResult(run)}\nfinal gate: FAIL (${accepted.reason ?? "inspection did not complete"})`;
    return { exitCode: 1, output };
  }
  const outcome: InspectionOutcome = { files: run.files, hardCount: run.hardCount };
  const adviceCount = run.files.reduce((acc, f) => acc + f.findings.filter((x) => x.severity !== "hard").length, 0);
  const adviceSummary = adviceCount > 0 ? ` 助言対象: ${adviceCount} 件。` : "";
  const reuseSummary = `規則実行 ${run.ruleExecutions.actual} 件、再利用 ${run.ruleExecutions.reused} 件。`;
  const purposeLabel = run.purpose === "independent" ? "independent inspection" : "final gate";
  const output = parsed.json
    ? JSON.stringify({ ok: true, outcome, run, inspectedFiles: run.targetScope.count }, null, 2)
    : `${formatOutcome(outcome)}\n${purposeLabel}: PASS (${run.targetScope.count} target file(s) inspected, 0 hard violations). ${reuseSummary}${adviceSummary}\n${formatRunResult(run)}`;
  return { exitCode: 0, output };
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
