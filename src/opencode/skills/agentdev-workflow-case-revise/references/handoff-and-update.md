# Handoff and Update（Issue 本文更新、case-ready 引き継ぎ）

case-revise workflow STEP-5 の実行詳細（SKILL.md「制御平面（STEP 一覧）」から参照される）。

## Case 関連 Issue 本文の更新

- Definition 変更の反映に伴い Case 関連 Issue 本文（Root Case、影響再評価対象の Child Issue）を更新する場合は、Custom Tool `agentdev_gh` の issue_update 操作で投入する
- 更新時は作成時のテンプレート構造と必須セクションを維持する。Markdown 行構造（LF、セクション間空行、インデント）の byte 単位保持を含む（`agentdev-workflow-templates` のテンプレート構造維持規約、`agentdev-issue-management` の Issue 更新時の前後内容比較に従う）
- 更新前後の内容比較を行い、必須セクションの欠落を防ぐ。テンプレートの【必須】セクションの完備を確認してから更新する

## case-ready への引き継ぎ

- case-revise 完了後の execution contract / execution structure 再確定は case-ready を経由する。case-revise は再確定を実行せず、Amendment PR（存在する場合）と影響再評価結果を引き継ぎ情報として case-ready へ渡す
- case-ready は Definition Amendment PR を Definition PR 受入フロー（忠実性・整合性・品質検査、新しい意味判断が不要な場合の自動確定・merge）で受入する
- case-revise 専用の Case 状態は追加しない（Case 状態モデルの正規所有は case-run 実行契約 REQ と Case実行オーケストレーション REQ の体系が担う）

## 完了報告

- 完了報告は case-revise 完了報告テンプレート（`agentdev-workflow-templates` 選定ルール）に従う
- 完了報告には Definition Amendment PR の有無（作成 / 再利用 / 不作成）、影響再評価の結果（影響あり Issue 一覧、影響なし確認済み完了済み Issue の維持）、case-ready 引き継ぎの状態を含める
- 実行識別情報セクションの形式は `agentdev-workflow-templates` の実行識別情報セクション規約に従う。取得不能な場合は「N/A」を記録し workflow を停止しない

## deviation capture

- 自工程で実観測した deviation は `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する（保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従う）
- capture 本文は完了報告に含めず、保存した成果物のパス・分類・保存結果のみを含める
