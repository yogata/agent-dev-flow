# Definition Revision（再合意受入、実変更判定、Amendment PR 冪等作成）

case-revise workflow STEP-1〜STEP-3 の実行詳細（SKILL.md「制御平面（STEP 一覧）」から参照される）。

## STEP-1 再合意内容の受入確認

- 入力された Definition 変更が req-define で再合意済みであることを確認する。確認手段は req-define の合意記録（req_draft の合意内容、Root Case 本文の Definition Package / Execution Contract との対比）である
- 再合意済みでない変更の反映要求は受け付けず、req-define へ差し戻して停止する。case-revise は新しい要求、Decision、対象範囲を生成しない（意味判断は req-define が所有する）
- 再合意済みの Definition 変更は req_draft を再解釈・再設計せず、合意済み内容をそのまま後続 STEP へ投影する

## STEP-2 実変更判定と冪等検索

- canonical Definition（merge 済み main の docs 永続文書（REQ / Decision / Design）と Issue / Epic 構造の確定状態）と再合意内容の差分を比較し、実変更の有無を判定する
- 実変更判定と並行して、冪等キー（definition-readiness Design「冪等キー」）で同じ再合意内容に対応する既存 Definition Amendment PR の有無を検索する
- 分岐:
  - 実変更なし（差分が空）: Amendment PR を作成せず STEP-5 へ進み、execution contract / execution structure の再確定を case-ready へ引き継ぐ。空の Amendment PR を作る経路は存在しない
  - 実変更ありかつ既存 Amendment PR あり: 既存 PR を再利用し、STEP-3 を省略して STEP-4 へ進む（重複生成しない）
  - 実変更ありかつ既存 Amendment PR なし: STEP-3 へ進む

## STEP-3 Definition Amendment PR 作成

- 再合意済みの実変更を Definition Amendment PR として作成する（Custom Tool `agentdev_gh` の pr_create 操作。VERIFY は Tool 内部）
- PR 作成は Case 単位で同一再合意内容に対応するものを重複生成しない。作成前に既存 PR の再検索を実行し、検出時は新規作成を取りやめて再利用へ切り替える
- REQ / Decision / Design 変更の保存実体は `agentdev-req-file-manager` / `agentdev-decision-file-manager` / `agentdev-design-file-manager` へ委譲する（case-revise は意味判断せず、合意済み内容を投影する）
- 変更範囲は `agentdev-artifact-validation` の公開検証契約で検査する（frontmatter id↔filename 整合、README entry 存在、変更範囲検証）
