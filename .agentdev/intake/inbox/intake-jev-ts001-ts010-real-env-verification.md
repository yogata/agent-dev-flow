---
source: case-close-capture
source_case: "#3056"
source_pr: "#3058"
captured_at: "2026-09-22"
title: Jev 実環境検証フォローアップ（API key 設定環境での TS-001/TS-010 未実施分）
---

# Jev 実環境検証フォローアップ（API key 設定環境での TS-001/TS-010 未実施分）

## 実観測

Case #3056（REQ-090 Jev 先行評価 Stage 1）の実行環境に `AI_GATEWAY_API_KEY` が未設定のため、test strategy の次の 2 項目の実環境部分を実施できず record-in-findings とした:

- TS-001: API key 設定環境で6系統代表 Workflow を実行し、Jev 先行評価が呼び出され観測 JSON が生成されることの確認
- TS-010: 初期 Vercel adapter による実際の Jev 呼出しの観測 JSON で inputTokens が記録されることの確認

not_configured 経路（TS-002/TS-013）は実測合格、evaluate 経路の構造は provider 側偽実装テストで網羅済み。未実施は実 provider（Vercel AI Gateway）経由の実呼出し確認のみで、blocker は「API key unavailable」のみ。実行手順と観測確認の準備は完了している。

## 提案する修正対象

- 実装の修正ではなく検証フォローアップ。`AI_GATEWAY_API_KEY` を設定した環境で6系統代表 Workflow を1回実行し、`.agentdev/jev-observations/` 配下の観測 JSON に (1) Jev 結果・confidence・llm_treatment を含む judgment、(2) inputTokens 記録、(3) 失敗時は構造化失敗区分、を確認する。Stage 1 の実運用観測開始時の初回 Jev 実行で同時に確認可能。

## 補足

- case-close（QG-4）での disposition: record-in-findings 受容（warn）。完了条件 REQ-090-002/005 は実施済み検証で達成判定済み（Issue #3056 対応記録コメント参照）。
- 完了条件の後ろ倒しではなく、将来検証機会の記録。観測 JSON 確認は Jev 有効性評価（Issue B）の入力ともなる。
