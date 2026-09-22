# Jev 実環境検証フォローアップ（case-ready 系 TS-001/TS-010 残部確認）

## 観測内容

Case #3056（REQ-090 Jev 先行評価 Stage 1）の実行環境に `AI_GATEWAY_API_KEY` が未設定だったため、test strategy の次の 2 項目の実環境部分を実施できず record-in-findings とした（case-close QG-4 で受容・warn）:

- TS-001: API key 設定環境で6系統代表 Workflow を実行し、Jev 先行評価が呼び出され観測 JSON が生成されることの確認
- TS-010: 初期 Vercel adapter による実際の Jev 呼出しの観測 JSON で inputTokens が記録されることの確認

adversarial-review の技術検証による観測事実の更新（2026-09-22 時点）:

- `.agentdev/jev-observations/` に同日の観測 JSON 6 件が存在し、すべて `outcome: completed` + 実 `inputTokens` + `resolvedModel: typesafe-ai/jev`（vercel-ai-gateway）を記録。workflow 種別は 5 種（learning-promote×2、intake-promote、inspect-promote、backlog-review、req-define）。
- TS-010 相当（inputTokens 記録）は実績済み。TS-001 の「6系統代表 Workflow」のうち、**case-ready（Epic/Wave 構成判断）系の観測 JSON のみが未生成**であり、残存する未検証はこの 1 系統分。
- REQ-090-002/005 の完了条件は実施済み検証で達成判定済み。本フォローアップは完了条件の後ろ倒しではなく、将来検証機会の追跡記録である。

HITL 確定（2026-09-22）: ユーザー判断により採用（残存の case-ready 系確認に絞り込んだ内容へ整形）と確定。TS-010 記録と他 5 系統分の実績は観測事実として本成果物に反映済み。

## 影響

- 実装の修正ではなく検証フォローアップ。システム変更を必要としないため、RU 化（req-define → case-open は artifact_actions を前提とする構造）は不適合の可能性が高い。
- backlog-review の処置語彙（RU化 / docs/knowledge/ 知識文書保存 / 重複・陳腐化した知識の削除 / 保留）のうち、知識文書保存（Jev 有効性評価〔Issue B〕の入力として）または保留が現実的な処置先。

## 課題

- case-ready（Epic/Wave 構成判断）系の実環境 Jev 実行は、Epic 構成を伴う case-ready が AI_GATEWAY_API_KEY 設定環境で初回実行されるまで確認できない。観測 JSON が生成された時点で本フォローアップは自然に充足し得る。
- QG-4 warn 処分（record-in-findings 受容）の追跡保持: 本件は REQ-090 の Case #3056 完了記録における warn 処分の恒久追跡対象であり、観測 JSON 確認は Jev 有効性評価（Issue B）の入力ともなる。

## 提案する修正対象（検証フォローアップ）

- case-ready（Epic/Wave 構成判断）系の実環境 Jev 実行確認: AI_GATEWAY_API_KEY 設定環境で当該系統の Workflow が実行された際、`.agentdev/jev-observations/` 配下の観測 JSON に (1) Jev 結果・confidence・llm_treatment を含む judgment、(2) inputTokens 記録、(3) 失敗時は構造化失敗区分、が記録されていることを確認する。将来の case-ready Epic 実行時に同時確認可能。
- 実装の修正は伴わない。

## 既存要件との関連

- REQ-090（Jev 先行評価の実運用組込み Stage 1: 観測可能化）。REQ-090-002（not_configured 区分の記録）、REQ-090-005（inputTokens 記録）は達成判定済み。本フォローアップは REQ 拡張を伴わない検証追跡であり、観測 JSON は Jev 有効性評価（Issue B: 一定量観測後の評価）の入力となる。

## 出典

- case-close-capture、Case #3056 / PR #3058、captured_at 2026-09-22。
- HITL 確定: ユーザー判断 (a) 採用（2026-09-22、 intake-promote HITL）。
