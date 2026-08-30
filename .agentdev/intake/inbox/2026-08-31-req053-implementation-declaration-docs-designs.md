# REQ-053 行の implementation 宣言の恒久化は docs/designs 配下への付与が正規

## 観測

配布 command・skill の文章品質是正 Case（REQ-053 適合、Issue #2485 / PR #2486）の case-run 検証で、REQ-053 行の implementation 宣言を配布物 10 ファイルへ付与したところ、配布依存境界 checker が concrete-id 新規違反 13件を検出した（配布物への concrete ID 記述は REQ-029 配布依存境界で禁止）。宣言を撤去し baseline 一致に復帰済み。

- 正規の付与先は docs/designs 配下（配布物外）であり、本 Case は REQ/Decision/Design 変更なしの契約（artifact_actions: []）のため付与対象外
- case-close トレーサビリティ check（REQ-053 限定）で missing-implementation 1件が再確認された（既出、本項目と同一事象）

## 今回扱わない理由

本 Case は配布物 Markdown の文章表現のみを対象とする契約であり、docs への宣言付与は対象外。route: intake 指定のため、intake パイプラインでの triage 候補として記録する。

## 影響

REQ-053 の implementation 宣言が正規成果物側に存在せず、トレーサビリティ check の missing-implementation 検査が REQ-053 で fail し続ける。

## レビューで決めること

- REQ-053 行の implementation 宣言を docs/designs 配下のどの Design（配布依存境界 Design 等）へ付与するか、付与形式と責務配置

## 根拠

- PR #2486 本文「Findings / Capture候補」intake 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2486）
- Issue #2485 対応記録コメント（case-close 検証差分: トレーサビリティ check missing-implementation 既出 1件）
