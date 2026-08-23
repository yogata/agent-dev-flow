// check の7種検査（agentdev-traceability Design「公開能力 check」の実装）。
//
// 1. malformed-declaration: 不正な対応宣言（形式・構文違反）
// 2. unknown-role: 未知の成果物役割
// 3. unknown-req-ref: 存在しない要件への参照
// 4. invalid-catalog-refs: 検証対応要否カタログの無効なエントリ・参照
//    （存在しない要件行への参照、形式違反、同一REQファイル外・逆順の範囲、読取不能）
// 5. missing-implementation: 実装対応の欠落（検査対象要件で実装対応0件。全要件行が対象）
// 6. missing-verification: 検証対応の欠落（検査対象要件のうち検証対応必須行で検証対応0件。
//    要否区分は検証対応要否カタログ、未登録行は必須）
// 7. evidence-unavailable: 対応宣言の根拠箇所を取得できない状態（ファイル不在・読取不能）
//
// Design 対応（design 役割）は完全性判定に使わない。Design 対応0件のみを理由に
// 異常とはしない（対応関係の完全性規則、foundations/traceability-model.md）。
//
// 検証対応要否の分類状態の導出（トレーサビリティモデル「対応関係の完全性規則」）は
// classification.ts が担い、missing-verification の計上とレポートの
// verificationClassification は同一の導出結果から計算する（単一の正規導出、二重管理しない）。

import type { DeclarationIssue } from "./declarations.ts";
import type { ScanResult } from "./corpus.ts";
import type { VerificationScopeResolution } from "./verification_scope.ts";
import {
  classifyVerificationScope,
  declaredVerificationReqIds,
} from "./classification.ts";
import type { VerificationClassificationEntry } from "./classification.ts";

export type CheckKind =
  | "malformed-declarations"
  | "unknown-roles"
  | "unknown-req-refs"
  | "invalid-catalog-refs"
  | "missing-implementation"
  | "missing-verification"
  | "evidence-unavailable";

export interface CheckFinding {
  readonly file?: string;
  readonly line?: number;
  readonly reqId?: string;
  readonly artifact?: string;
  readonly reason?: string;
  readonly text?: string;
  readonly detail?: string;
}

export interface CheckResultItem {
  readonly kind: CheckKind;
  readonly status: "pass" | "fail";
  readonly findings: readonly CheckFinding[];
}

export interface CheckSummary {
  readonly pass: number;
  readonly fail: number;
}

export interface CheckReport {
  readonly checks: Readonly<Record<CheckKind, CheckResultItem>>;
  readonly summary: CheckSummary;
  /** 完全性検査（missing-*）の対象要件。all は現行要件全体を指す。 */
  readonly completenessScope: "all" | readonly string[];
  /**
   * 全現行要件行の検証対応要否分類状態（トレーサビリティモデルの分類状態導出契約）。
   * 完全性検査の対象限定（completenessReqIds）の影響を受けず全行を報告する。
   */
  readonly verificationClassification: readonly VerificationClassificationEntry[];
}

export interface CheckOptions {
  /**
   * 完全性検査（missing-implementation / missing-verification）の対象要件ID。
   * 省略時は knownReqIds 全体（= 現行要件行全体）を対象とする。
   */
  readonly completenessReqIds?: readonly string[];
  /** 根拠検査（evidence-unavailable）に追加する成果物パス。 */
  readonly evidenceArtifacts?: readonly { artifact: string; reason: string }[];
  /** 検証対応要否カタログの解決結果（任意行の除外と invalid-catalog-refs 検査の入力）。 */
  readonly verificationScope?: VerificationScopeResolution;
}

function item(kind: CheckKind, findings: readonly CheckFinding[]): CheckResultItem {
  return { kind, status: findings.length === 0 ? "pass" : "fail", findings };
}

/**
 * 7種検査を実行する。scan は正規成果物の直接走査結果、knownReqIds は現行要件行ID。
 * verificationScope を省略した場合（カタログ不在と同等）、全要件行が検証対応必須となる。
 */
export function runChecks(
  scan: ScanResult,
  knownReqIds: readonly string[],
  options: CheckOptions = {},
): CheckReport {
  const known = new Set(knownReqIds);
  const scope = options.completenessReqIds ?? knownReqIds;
  const optionalReqIds = options.verificationScope?.optionalReqIds ?? new Set<string>();
  const verificationClassification = classifyVerificationScope(
    knownReqIds,
    declaredVerificationReqIds(scan.declarations),
    optionalReqIds,
  );
  const unclassifiedReqIds = new Set(
    verificationClassification
      .filter((entry) => entry.classification === "unclassified")
      .map((entry) => entry.reqId),
  );

  const malformed = scan.issues.filter((i): i is DeclarationIssue & { kind: "malformed-declaration" } => i.kind === "malformed-declaration");
  const unknownRoles = scan.issues.filter((i): i is DeclarationIssue & { kind: "unknown-role" } => i.kind === "unknown-role");

  const unknownReqRefs: CheckFinding[] = [];
  for (const d of scan.declarations) {
    for (const reqId of d.reqIds) {
      if (!known.has(reqId)) {
        unknownReqRefs.push({ file: d.file, line: d.line, reqId });
      }
    }
  }

  const catalogFile = options.verificationScope?.catalogFile;
  const invalidCatalogRefs: CheckFinding[] = (
    options.verificationScope?.issues ?? []
  ).map((issue) => ({
    ...(catalogFile ? { file: catalogFile } : {}),
    ...(issue.line > 0 ? { line: issue.line } : {}),
    ...(issue.reqId !== undefined ? { reqId: issue.reqId } : {}),
    reason: issue.reason,
    text: issue.text,
    detail: issue.detail,
  }));

  const missingImplementation: CheckFinding[] = [];
  const missingVerification: CheckFinding[] = [];
  for (const reqId of scope) {
    const impl = scan.declarations.some((d) => d.role === "implementation" && d.reqIds.includes(reqId));
    if (!impl) missingImplementation.push({ reqId });
    if (unclassifiedReqIds.has(reqId)) missingVerification.push({ reqId });
  }

  const evidenceFindings: CheckFinding[] = scan.unreadableFiles.map((file) => ({
    artifact: file,
    reason: "unreadable",
  }));
  for (const extra of options.evidenceArtifacts ?? []) {
    evidenceFindings.push({ artifact: extra.artifact, reason: extra.reason });
  }

  const checks: Record<CheckKind, CheckResultItem> = {
    "malformed-declarations": item("malformed-declarations", malformed),
    "unknown-roles": item("unknown-roles", unknownRoles),
    "unknown-req-refs": item("unknown-req-refs", unknownReqRefs),
    "invalid-catalog-refs": item("invalid-catalog-refs", invalidCatalogRefs),
    "missing-implementation": item("missing-implementation", missingImplementation),
    "missing-verification": item("missing-verification", missingVerification),
    "evidence-unavailable": item("evidence-unavailable", evidenceFindings),
  };

  const values = Object.values(checks);
  const summary: CheckSummary = {
    pass: values.filter((v) => v.status === "pass").length,
    fail: values.filter((v) => v.status === "fail").length,
  };
  return {
    checks,
    summary,
    completenessScope: options.completenessReqIds ?? "all",
    verificationClassification,
  };
}
