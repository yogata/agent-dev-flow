---
description: 再合意済みの Definition 変更を既存 Case へ反映し、実変更がある場合のみ Definition Amendment PR を作成する
---

# Case改訂

req-define で再合意済みの Definition 変更を既存 Case へ反映する主フローの例外経路コマンドである。
本コマンドは新しい要求、Decision、対象範囲を自身では決定せず、意味判断は req-define が所有する。
canonical Definition との差分比較で実変更の有無を判定し、実変更がある場合のみ Definition Amendment PR を作成する。
実変更がなければ Amendment PR を作成せず、execution contract / execution structure の再確定は case-ready が行う（空の Amendment PR を作らない）。
同一再合意内容に対応する既存 Amendment PR が存在する場合は再利用し、重複生成しない。
Epic の完了済み Issue は Definition 変更の影響があるもののみ再評価し、影響なしと確認できた完了済み Issue は巻き戻さない。

## 入力

- Root Case（Issue 番号または URL）
- req-define で再合意済みの Definition 変更（draft）

## 出力

- Definition Amendment PR（canonical Definition に実変更がある場合のみ。実変更なし時は作成しない）
- case-ready への引き継ぎ（execution contract / execution structure の再確定は case-ready が実行）
- 完了報告（case-revise 完了報告テンプレート）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-revise` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。
Issue 本文・PR 本文・コメントのテンプレート選定は `agentdev-workflow-templates` の選定ルールに従う（【必須】セクションの完備確認、【任意】は内容がある場合のみ含める）。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 再合意済みでない変更の反映要求は受け付けず、req-define へ差し戻す（新しい要求、Decision、対象範囲は本コマンドで生成しない。意味判断は req-define が所有する）
- canonical Definition（merge 済み main の docs 永続文書と Issue / Epic 構造の確定状態）との差分が空の場合は Amendment PR を作成せず、case-ready へ引き継ぐ（実変更判定は冪等キー（definition-readiness Design）で既存 Amendment PR の有無も確認する）
- 中断済み成果物は原則として巻き戻さず、既存成果物（既存 Amendment PR を含む）を再利用して正しい最終状態へ収束する
- 再合意済みの Definition 変更は req_draft を再解釈せず、合意済み内容をそのまま Amendment PR へ投影する
- case-revise 完了後の execution contract / execution structure 再確定は case-ready を経由する。本コマンドは専用の Case 状態を追加しない
- Case 関連 Issue 本文を更新する際は作成時のテンプレート構造と必須セクションを維持する
- runtime-only 判断（PR CI 結果、実 diff、test 実行結果）は事前確定せず、case-ready の Definition PR 受入と case-run の安全検査として維持する
- GitHub の読み取りは Custom Tool `agentdev_gh` の読み取り操作（issue_read、pr_read、comment_list 等）経由で行う。work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- Definition Amendment PR は Case 単位で同一再合意内容に対応するものを重複生成しない。既存 PR を検出した場合は再利用する
- Epic の完了済み Issue を、Definition 変更の影響なしと確認できた理由なく再評価対象へ含めない（影響なしと確認できた完了済み Issue は巻き戻さない）
- Root Case 本文、Epic Issue 本文、子 Issue 本文、コメントは Custom Tool `agentdev_gh` の操作（issue_update、pr_create、comment_create）で投入する。文字コード・一時ファイル等の実装詳細は Tool 内部に隠蔽される（`POL-gh-io-delegation`）
- Epic Issue 本文のステータス追跡テーブルは更新しない（単一書き手は case-close）
