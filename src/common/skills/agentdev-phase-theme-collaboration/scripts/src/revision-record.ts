/**
 * CLI: 完了済み過去工程の改訂実行記録の生成（改訂の実行記録の様式と機械生成の決定的部分）。
 *
 * bun src/revision-record.ts [--impact <relied-diff-report.json | ->]
 *                            --items <items.json | ->
 *                            --approval <承認の対象・内容・範囲の記録>
 *                            [--notice <pre|in-progress|post>=<記録参照>]...
 *
 * - --impact は依拠版基準の影響評価の入力（relied-diff 公開 CLI の stdout JSON）。
 *   省略時は取得できていない状態として記録し、全下流対象を完了側に含めない
 * - --items は下流対象ごとの処置結果（JSON 配列）。
 *   要素: { path, outcome, reason, verification, evidenceReuse }
 * - --approval は適用した承認の対象・内容・範囲の記録（必須。空は非ゼロ終了）
 * - --notice は通知の時点区分（repeatable。stage は pre / in-progress / post。
 *   同一区分の複数回指定可。実行中の追加通知は新たな影響の判明ごとに複数回あり得る）
 * - 様式違反・語彙外・空参照は非ゼロ終了（fail-closed。確定しない）
 * - 本 CLI は改訂実行記録の保存を行わない（stdout への JSON 出力のみ）。
 *   保存先は `.agentdev/phase/revisions/`（1改訂1ファイル）であり、
 *   保存先への書込みは保存する操作（成果物反映 Workflow Skill）の責務である
 */
import { readFile } from "node:fs/promises";
import { parseArgs, printJson, fail, requireFlag } from "../lib/cli.ts";
import {
  buildRevisionRecord,
  resolveRecordedAt,
  summarizeReliedDiffReport,
} from "../lib/revision-record.ts";
import type { NoticeEntry, RevisionItem } from "../lib/revision-record.ts";

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

function parseOptionalJsonText(text: string | null, label: string): unknown {
  if (text === null) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    fail(`${label}の JSON 解析に失敗した（fail-closed）: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const args = parseArgs(process.argv.slice(2), ["notice"]);
const impactFlag = args.flags.get("impact") ?? null;
const itemsFlag = requireFlag(args, "items");
const approval = requireFlag(args, "approval");
const noticeSpecs = args.repeatFlags.get("notice") ?? [];

try {
  const impactReport = impactFlag !== null
    ? parseOptionalJsonText(await readInputText(impactFlag), "影響評価の入力（--impact）")
    : null;
  const impactInput = impactReport !== null
    ? summarizeReliedDiffReport(impactReport)
    : {
        resolved: false,
        reliedCommit: null,
        headCommit: null,
        comparisonRange: null,
        fullyPropagated: null,
        note:
          "影響評価の入力（relied-diff 公開 CLI の出力）が渡されていない。依拠版基準の影響分類を取得するまで全下流対象を完了側に含めない",
      };

  const itemsRaw = parseOptionalJsonText(await readInputText(itemsFlag), "下流対象の処置結果（--items）");
  if (!Array.isArray(itemsRaw)) {
    fail("下流対象の処置結果（--items）が JSON 配列でない（fail-closed）");
  }
  const items = itemsRaw as readonly RevisionItem[];

  const notices: NoticeEntry[] = noticeSpecs.map((spec) => {
    const separator = spec.indexOf("=");
    if (separator <= 0) {
      fail(`--notice は <pre|in-progress|post>=<記録参照> の形式で指定する（fail-closed）: ${spec}`);
    }
    return {
      stage: spec.slice(0, separator) as NoticeEntry["stage"],
      reference: spec.slice(separator + 1),
    };
  });

  const result = buildRevisionRecord({
    recordedAt: resolveRecordedAt(),
    impactInput,
    items,
    approval,
    notices,
  });
  printJson(result);
} catch (error) {
  fail(`改訂実行記録の生成に失敗した: ${error instanceof Error ? error.message : String(error)}`);
}
