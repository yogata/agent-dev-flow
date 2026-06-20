✅ inspect-docs 完了

完了コマンド: /agentdev/inspect-docs
対象: docs全体（REQ {active_count}件 / ADR {adr_count}件 / SPEC {spec_count}件 / guides {guide_count}件）
結果:
  - レビュー観点: {観点リスト}
  - 検出事項: {finding_count}件
  - 推奨経路: {route_summary}
  - req-define入力案: {draft_count}件（{0件の場合は「該当なし」}）
検証結果: ✅ OK
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド:
  - 要件変更が必要な場合: /agentdev/req-define
  - 実装逸脱の場合: 該当Issueで case-update
  - 問題なしの場合: なし
