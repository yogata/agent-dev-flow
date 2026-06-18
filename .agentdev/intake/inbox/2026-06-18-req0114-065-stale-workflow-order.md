# REQ-0114-065 の case-auto workflow 順序表記が旧順序のまま残存

## 観測

Issue #901 (RU-4) で case-auto ワークフローを `req-save → spec-save → case-open → case-run → case-close` に拡張した（ADR-0123 Decision #3）。しかし REQ-0114（case-auto 最大自走モード要件）の要件行 -065 付近には旧順序 `feature: req-save → case-open → …` の記載が残っており、新ワークフローと乖離している。driver subagent は REQ ファイル編集スコープ外のため #901 PR では未修正。

## 影響

- REQ-0114 の case-auto 工程分岐記述が ADR-0123 accepted 後の新ワークフローと矛盾する
- AGENTS.md 信頼できる情報源優先順位では「アクティブな REQ > ADR」だが、REQ-0114-065 が旧順序のままだと case-auto 実行時の工程分岐解釈で迷いが生じうる

## レビューで決めること

- REQ-0114 への APPEND/UPDATE で -065 周辺の工程分岐表記を `req-save → spec-save → case-open → …` に更新するか（maintenance / docs_chore）
- あわせて REQ-0114 の他の旧順序参照箇所（Step 4-1/4-2/8-1 等）も新ワークフローに揃えるか

## 根拠

- PR #915: https://github.com/yogata/agent-dev-flow/pull/915 (Findings / Capture候補)
- Issue #901: https://github.com/yogata/agent-dev-flow/issues/901
- ADR-0123 (accepted): SPEC lifecycle と spec-save の導入（Decision #3）
- 関連: REQ-0114 (case-auto 最大自走モード), REQ-0136-014
