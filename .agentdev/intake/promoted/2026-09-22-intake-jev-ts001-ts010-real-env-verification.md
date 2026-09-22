# Jev 実環境検証フォローアップ（API key 設定環境での TS-001/TS-010 未実施分）

## 観測内容

Case #3056（REQ-090 Jev 先行評価 Stage 1）の実行環境に `AI_GATEWAY_API_KEY` が未設定のため、test strategy の次の 2 項目の実環境部分を実施できず record-in-findings とした:

- TS-001: API key 設定環境で6系統代表 Workflow を実行し、Jev 先行評価が呼び出され観測 JSON が生成されることの確認
- TS-010: 初期 Vercel adapter による実際の Jev 呼出しの観測 JSON で inputTokens が記録されることの確認

not_configured 経路（TS-002/TS-013）は実測合格、evaluate 経路の構造は provider 側偽実装テストで網羅済み。未実施は実 provider（Vercel AI Gateway）経由の実呼出し確認のみで、blocker は「API key unavailable」のみ。実行手順と観測確認の準備は完了している。

## 影響

- 完了条件の後ろ倒しではない（完了条件 REQ-090-002/005 は実施済み検証で達成判定済み、case-close QG-4 で record-in-findings 受容〔warn〕）。将来検証機会の記録
- 観測 JSON 確認結果は Jev 有効性評価（Issue B）の入力になる

## 課題

- 実 provider 経由の Jev 呼出しが未検証のまま。観測 JSON に (1) Jev 結果・confidence・llm_treatment を含む judgment、(2) inputTokens 記録、(3) 失敗時の構造化失敗区分、が実際に記録されるかの実環境確認が未実施

## 提案する対応（検証フォローアップ、実装の修正なし）

- `AI_GATEWAY_API_KEY` を設定した環境で6系統代表 Workflow を1回実行し、`.agentdev/jev-observations/` 配下の観測 JSON に (1) judgment、(2) inputTokens 記録、(3) 失敗時は構造化失敗区分、を確認する。Stage 1 の実運用観測開始時の初回 Jev 実行で同時に確認可能

## 既存要件との関連

- REQ-090（Jev 先行評価の実運用組込み Stage 1）: 完了条件は達成済み。本件は検証機会の記録であり REQ の変更を要さない
- Jev 有効性評価（Issue B、RU-0120）: 観測 JSON 確認の結果が評価の入力となる
- 関連観測源: Case #3056、PR #3058（case-close capture。Issue #3056 対応記録コメント参照）
- ユーザー採用判断（2026-09-22 HITL）: 保留（実運用観測開始まで待機）より採用（追跡可能な作業単位として RU 化し検証機会を保全）が選択された

## 分類根拠

- change_nature: unknown（検証フォローアップであり8変更種別のいずれにも直接該当せず、adversarial-review 審議で一意確定不能と判定。soft-contract の unknown 既定値で警告。backlog-review / req-define が後段で確定可能）
- req_impact: no
- target_stakeholder: 開発者（Jev 観測の運用者、Jev 有効性評価〔Issue B〕の実施者）
- user_visible_change: no
- canonical_owner: Jev 有効性評価（Issue B / RU-0120）の検証入力。観測の正は `.agentdev/jev-observations/`
- observed_evidence: Case #3056 実行環境の AI_GATEWAY_API_KEY 未設定による TS-001/TS-010 実環境部分の未実施（record-in-findings、blocker は API key unavailable のみ）
- 分類: 採用（2026-09-22 ユーザー HITL 承認。自律確定候補判定ではユーザー判断必要と判定された item）

## 元 intake item

- .agentdev/intake/inbox/intake-jev-ts001-ts010-real-env-verification.md（source: case-close-capture、Case #3056 / PR #3058、captured 2026-09-22）
