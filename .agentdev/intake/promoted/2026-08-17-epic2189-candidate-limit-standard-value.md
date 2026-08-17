# 高位問い合わせ標準候補数上限の初期値 30 と実測推奨値 12 の乖離 — 最終決定手順の実行

## 観測内容

標準候補数上限の初期値を 30（DEFAULT_CANDIDATE_LIMIT）としたが、実グラフ回帰の recommended_standard_limit は 12。REQ-040-008（代表ケース回帰に基づく決定）と REQ-020-006（代表質問回帰検証体系への接続）に従う最終決定は、TIM 語彙カタログ SPEC（PR #2196 で整備済み）の関係意味確定後に暫定意味表（semantics.ts）をカタログ定義へ置換して再計測した上で行うのが適切。

## 影響

- 初期値 30 が暫定のまま確定しておらず、クエリ結果の網羅性・網羅過多の運用基準が未確定

## 課題

candidate_limit サブスイートの暫定意味表をカタログ定義へ置換して回帰を再実行し、期待出力の差分を文書化した上で標準上限値を確定する（README に運用契機を明記済み）。カタログと実装の乖離解消後に実施する。

## 既存要件・成果物との関連

- 要件: REQ-040-008、REQ-020-006
- 対象: src/opencode/skills/agentdev-artifact-graph/scripts/effectiveness/candidate_limit/
- 関連: 2026-08-17-epic2189-candidate-limit-semantics-swap.md（置換契機、統合候補）、2026-08-17-epic2189-level2-integration-residual.md（乖離解消の進展記録）
- 出典: Issue #2193 (CLOSED), Epic #2189、PR #2199 (merged da999aef)

## 出典

- 発生日: 2026-08-17
- 発生源: PR #2199 case-run 検証（Findings / Capture候補）
- 元 item: intake-2026-08-17-epic2189-candidate-limit-standard-value.md
