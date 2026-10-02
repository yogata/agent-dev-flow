// Senpi guard 接続（guard 共通判定への接続点）。
//
// マルチホスト正本モデル Design「guard 編集解釈の分離」節に
// 従い、Senpi ホスト接続側は編集操作の意味論を解釈レイヤ
//（lib/edit-interpretation.ts）で正準化し、guard の共通判定
//（src/common/guards/distribution-boundary/・src/common/guards/gh-write/）へ
// 接続する。本モジュールは Senpi ホストの plugin/hook 配線から消費される接続
// 契約を提供する（実配備の hook 形状は Wave 3 の全組合せ試験で確定する）。
//
// fail-closed:
//   - 編集解釈の検査不能（不明 tool 名、必須意味論パラメータの欠落）: block
//   - 共通判定の検査エラー（現行内容の読取失敗、ルート外、不正 patch）: block
//     （成功扱いにしない）
//   - 共通判定の違反検出: block
//   - 共通判定・検出器の異常終了: block
//   - 本接続は副作用を持たない（fs 書込みなし）。block は副作用前の停止であり、
//     実行強制（throw）は enforce 関数が担う。

import {
  evaluateApplyPatchEnv,
  evaluateEditEnv,
  evaluateWriteContentEnv,
  type GuardDetectionsResult,
  type PathClassifier,
} from "../../../../common/guards/distribution-boundary/distribution-boundary-guard-evaluators.ts";
import { classifyPath, classifyPathNoRoot, type PathClass } from "../../../../common/guards/distribution-boundary/distribution-boundary-guard-paths.ts";
import type { GuardEnv } from "../../../../common/guards/distribution-boundary/distribution-boundary-guard-env.ts";
import {
  detectGhWriteCommand,
  formatBlockReason,
  type GhWriteVerdict,
} from "../../../../common/guards/gh-write/gh-command-detector.ts";
import { interpretSenpiEditOperation, type SenpiEditOperation } from "./edit-interpretation.ts";
import { interpretSenpiRawWriteCommand } from "./command-write-interpreter.ts";

export type GuardConnectionVerdict =
  | { readonly outcome: "allow" }
  | { readonly outcome: "block"; readonly reason: string };

export class GuardBlockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuardBlockError";
  }
}

export function allow(): GuardConnectionVerdict {
  return { outcome: "allow" };
}

export function block(reason: string): GuardConnectionVerdict {
  return { outcome: "block", reason };
}

export function formatDetectionBlockReason(
  tool: string,
  result: GuardDetectionsResult,
): string {
  const header = `agentdev-guard-connection (Senpi): blocked ${tool} (guard common judgment)`;
  if (result.ok) {
    return `${header}\nno violation detected (internal call site should not have thrown)`;
  }
  if (result.errorKind === "inspection-error") {
    return `${header}\ninspection error: malformed input, read failure, outside-root target, or unclassified entry; gate-not-passed per fail-closed`;
  }
  const lines = [header];
  for (const d of result.detections) {
    lines.push(
      `  [${d.category}] ${d.file}:${d.line} matched=${d.matched} (${d.classification})`,
    );
  }
  return lines.join("\n");
}

function makeSenpiClassifier(projectRoot: string | undefined): PathClassifier {
  if (projectRoot === undefined || projectRoot.length === 0) {
    return classifyPathNoRoot;
  }
  return (p: string): PathClass => classifyPath(p, projectRoot);
}

/**
 * Senpi 編集操作を guard 共通判定へ接続して判定する。
 * 検査不能・違反・検査エラー・異常終了のいずれも block を返す（fail-closed）。
 * 副作用を持たない。
 */
export function evaluateSenpiEditOperation(
  tool: string,
  args: Record<string, unknown>,
  guardEnv: GuardEnv,
  projectRoot?: string,
): GuardConnectionVerdict {
  const interpretation = interpretSenpiEditOperation(tool, args);
  if (!interpretation.ok) {
    return block(
      `agentdev-guard-connection (Senpi): cannot verify ${tool} (${interpretation.detail}); blocked per fail-closed`,
    );
  }
  const operation: SenpiEditOperation = interpretation.operation;
  const classify = makeSenpiClassifier(projectRoot);
  try {
    if (operation.kind === "full-replace") {
      const result = evaluateWriteContentEnv(operation.filePath, operation.content, guardEnv, classify);
      if (!result.ok) return block(formatDetectionBlockReason(tool, result));
      return allow();
    }
    if (operation.kind === "partial-replace") {
      const result = evaluateEditEnv(operation, guardEnv, classify);
      if (!result.ok) return block(formatDetectionBlockReason(tool, result));
      return allow();
    }
    const result = evaluateApplyPatchEnv(operation, guardEnv, classify);
    if (!result.ok) return block(formatDetectionBlockReason(tool, result));
    return allow();
  } catch (e) {
    return block(
      `agentdev-guard-connection (Senpi): common judgment crashed (${e instanceof Error ? e.message : String(e)}); blocked ${tool} per fail-closed`,
    );
  }
}

/**
 * Senpi 生の書込み経路（コマンド実行系）を gh WRITE 迂回検出の共通判定へ接続
 * して判定する。コマンド文字列が検証不能な場合は検査不能の成功扱いを避ける
 * ため block を返す（fail-closed）。
 */
export function evaluateSenpiRawWriteCommand(
  args: Record<string, unknown>,
): GuardConnectionVerdict {
  const interpretation = interpretSenpiRawWriteCommand(args);
  if (!interpretation.ok) {
    return block(
      `agentdev-guard-connection (Senpi): cannot verify command invocation (${interpretation.detail}); blocked per fail-closed`,
    );
  }
  let verdict: GhWriteVerdict;
  try {
    verdict = detectGhWriteCommand(interpretation.command);
  } catch (e) {
    return block(
      `agentdev-guard-connection (Senpi): detection crashed (${e instanceof Error ? e.message : String(e)}); blocked per fail-closed`,
    );
  }
  if (verdict.kind === "block") {
    return block(formatBlockReason(verdict));
  }
  return allow();
}

/**
 * 判定を強制適用する。block 判定なら GuardBlockError を投げて呼出側の
 * 副作用実行を停止させる。allow 判定は何もしない。
 */
export function enforceSenpiEditOperation(
  tool: string,
  args: Record<string, unknown>,
  guardEnv: GuardEnv,
  projectRoot?: string,
): void {
  const verdict = evaluateSenpiEditOperation(tool, args, guardEnv, projectRoot);
  if (verdict.outcome === "block") throw new GuardBlockError(verdict.reason);
}

export function enforceSenpiRawWriteCommand(args: Record<string, unknown>): void {
  const verdict = evaluateSenpiRawWriteCommand(args);
  if (verdict.outcome === "block") throw new GuardBlockError(verdict.reason);
}
