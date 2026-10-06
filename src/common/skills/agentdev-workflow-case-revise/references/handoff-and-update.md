# Handoff and Update（Issue 本文更新、case-ready 引き継ぎ）

case-revise workflow STEP-5 の実行詳細（SKILL.md「制御平面（STEP 一覧）」から参照される）。

## Case 関連 Issue 本文の更新

- Definition 変更の反映に伴い Case 関連 Issue 本文（Root Case、影響再評価対象の Child Issue）を更新する場合は、Custom Tool `agentdev_gh` の issue_update 操作で投入する
- 更新時は作成時のテンプレート構造と必須セクションを維持する。Markdown 行構造（LF、セクション間空行、インデント）の byte 単位保持を含む（`agentdev-workflow-templates` のテンプレート構造維持規約、`agentdev-issue-management` の Issue 更新時の前後内容比較に従う）
- 更新前後の内容比較を行い、必須セクションの欠落を防ぐ。テンプレートの【必須】セクションの完備を確認してから更新する

## 最新条件の引き渡しと適用方針報告の確認

- STEP-4 で影響対象と判定した Issue の作業担当へ、Definition 変更の最新条件を引き渡す。引き渡しは Case 関連 Issue 本文の更新（変更の参照先、影響範囲、継続・停止・再実行の処置判断、再開条件）を通じて行い、作業担当が Issue 本文を読めば旧条件に基づかず再開できることを基準とする
- 引き渡し後、作業担当による当該作業への適用方針の報告を確認する。適用方針の報告は、変更をどの工程・成果物へ適用するかと、影響しない部分を現行の進行状況更新のまま継続するかを含む
- 適用方針の報告が確認できるまで case-ready 引き継ぎへ進まない。報告が得られない対象がある場合は、確認待ちとして停止理由と再開条件を完了報告へ記録する（一律停止はせず、影響のない対象の進行は止めない）
- 適用方針の報告確認は、影響対象と判定した Issue をもつ作業担当ごとに行い、確認結果を完了報告に含める

## 反映後成果物の読み戻し確認と旧契約抑止

- Case 関連 Issue 本文の更新後、Custom Tool `agentdev_gh` の issue_read 操作で更新後の本文を読み戻し、最新条件の参照先、影響範囲、処置判断、再開条件が反映されていることを確認する。更新の投入と読み戻し確認を同一の操作として扱わず、読み戻しの結果で反映を判定する
- 設計修正PRを作成した場合は、受入後の canonical Definition（merge 済み main の REQ / Decision / Design）を読み戻し、再合意内容が正本文書へ反映されていることを確認する
- 重要条件の変更が影響対象へ未反映である間は、当該 Definition を契約条件とする新規実行の dispatch と最終受け入れを開始しない。case-ready 引き継ぎは、最新条件の引き渡し、適用方針報告の確認、読み戻し確認が完了し、未反映の重要条件がないことを確認した後に行う（case-ready 側の再確定が旧条件に基づかないことを本 STEP で担保する）
- 読み戻し確認で不備を検出した場合は当該更新を反映済みと扱わず、不足分を再試行した後に読み戻しをやり直す

## case-ready への引き継ぎ

- case-revise 完了後の execution contract / execution structure 再確定は case-ready を経由する。case-revise は再確定を実行せず、Definition Amendment PR（存在する場合）と影響再評価結果を引き継ぎ情報として case-ready へ渡す
- case-ready は設計修正PRを設計PR受入フロー（忠実性・整合性・品質検査、既存の正規契約からの導出または委譲された裁量の範囲内で自律確定できる場合の自動確定・merge）で受入する
- case-revise 専用の Case 状態は追加しない（Case 状態モデルの正規所有は case-run 実行契約 REQ と Case実行オーケストレーション REQ の体系が担う）

## 完了報告

- 完了報告は case-revise 完了報告テンプレート（`agentdev-workflow-templates` 選定ルール）に従う
- 完了報告には設計修正PRの有無（作成 / 再利用 / 不作成）、影響再評価の結果（影響あり Issue 一覧、影響なし確認済み完了済み Issue の維持、影響対象ごとの継続・停止・再実行の判断）、証拠・既判定の鮮度確認の結果（有効と確認した証拠・判定、再評価対象とした証拠・判定）、証拠と契約変更記録・対象成果物状態の対応（commit、PR、成果物への参照）の追跡可能性、最新条件の引き渡しと適用方針報告の確認結果、反映後成果物の読み戻し確認の結果、case-ready 引き継ぎの状態を含める
- 途中で確定した判断変更（影響対象の処置判断の確定、影響しない対象の継続判断等）があった場合は、判断変更の記録契機として撤回対象を必須項目に含む記録コメントを Case Issue へ残す（記録コメントの様式は `agentdev-workflow-templates` に従う）
- 実行識別情報セクションの形式は `agentdev-workflow-templates` の実行識別情報セクション規約に従う。取得不能な場合は「N/A」を記録し workflow を停止しない

## deviation capture

- 自工程で実観測した deviation は `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する（保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従う）
- capture 本文は完了報告に含めず、保存した成果物のパス・分類・保存結果のみを含める
