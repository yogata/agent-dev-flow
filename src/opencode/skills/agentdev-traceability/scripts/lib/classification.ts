// 検証対応要否の分類状態の導出（トレーサビリティモデル
// 「対応関係の完全性規則」が所有する分類状態の導出契約の実装側）。
//
// - 分類状態は既存の恒久成果物（対応宣言コーパスと検証対応要否カタログ）から
//   その場で導出する。分類状態のみを保持する独立した台帳、REQ frontmatter 項目、
//   派生索引を新設しない
// - 未分類 = 検証対応宣言なし かつ 検証対応要否カタログ未登録
// - 検証対応宣言ありの行はカタログ登録の有無によらず分類済み（恒久検証対応が存在）
// - 検証対応宣言なし・カタログ登録済みの行は分類済み（検証対応任意行）。
//   任意行に恒久的な検証手段が存在しないことだけを完了阻止理由にしない
//
// 段階ゲート（req-save の未分類検出・記録、case-open の未分類残存の停止、
// case-close の未分類残存・検証対応必須行の恒久検証対応欠落の完了阻止）は
// 本導出を利用する（ゲート挙動の契約所有は各 Workflow Skill 側）。
//
// 本モジュールは導出のみを担い、検査（check.ts）や CLI（../src/）から分離している。

import type { CoverDeclaration } from "./declarations.ts";

export type VerificationClassification =
  | "unclassified"
  | "verification-present"
  | "catalog-registered";

export interface VerificationClassificationEntry {
  readonly reqId: string;
  readonly classification: VerificationClassification;
}

/** コーパス走査結果から検証対応宣言を持つ要件行ID集合を導出する。 */
export function declaredVerificationReqIds(
  declarations: readonly CoverDeclaration[],
): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const declaration of declarations) {
    if (declaration.role !== "verification") continue;
    for (const reqId of declaration.reqIds) ids.add(reqId);
  }
  return ids;
}

/**
 * 全現行要件行の分類状態を導出する（純粋関数）。
 * 同一入力から常に同一結果を返し、呼び出し間で状態を保持しない。
 * knownReqIds の順序でエントリを返す。
 */
export function classifyVerificationScope(
  knownReqIds: readonly string[],
  declaredVerification: ReadonlySet<string>,
  optionalReqIds: ReadonlySet<string>,
): readonly VerificationClassificationEntry[] {
  return knownReqIds.map((reqId) => ({
    reqId,
    classification: declaredVerification.has(reqId)
      ? "verification-present"
      : optionalReqIds.has(reqId)
        ? "catalog-registered"
        : "unclassified",
  }));
}
