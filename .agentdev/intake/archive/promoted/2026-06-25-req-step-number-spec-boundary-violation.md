# REQ 要件行が SPEC 詳細（Step 番号）を含む（REQ-0102-070, REQ-0151-007）

## 概要

2 つの REQ 要件行が SPEC 詳細に属す「Step 番号」参照を含み、REQ/SPEC 責務分界（IR-044, REQ-0108-259）から逸脱している可能性がある。REQ は外部契約・状態・振る舞いを記述すべきであり、command の手続詳細（Step 番号）は SPEC または command reference に属す。

### 検出行

- `docs/requirements/REQ-0102.md:79` REQ-0102-070:
  > req-define は要件doc保存後、要件doc確認前に auto_gate を確認し、auto_ready:false または未解決 item（...）が残る場合、当該 stop_reasons を解消する方策を壁打ち（**Step 3**）で合意すること

- `docs/requirements/REQ-0151.md:24` REQ-0151-007:
  > case-close と case-merge を分離しないこと。case-close **Step 4** に rebase を追加し、責務境界を「完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、解消不能時は即エスカレーション、実装変更は行わない）」と再定義すること

## 提案しなかった理由

本 finding は `/repo/docs-check`（機械的整合性検査）の検出結果（heuristic warning）であり、採否は `intake-promote` に委譲する前提のため。Step 番号参照が実装指示（SPEC 詳細）か、要件の必達判定に必要な位置参照かは、要件文脈の精査が必要。

## テーマ

- REQ/SPEC 責務分界・要件行の粒度
- 関連 REQ: REQ-0136（REQ/SPEC 責務分離の徹底）、REQ-0108-259（req-spec-boundary-violation）、IR-044

## レビューで決めること

- REQ-0102-070 の「（Step 3）」を「壁打ちフェーズ」等の機能名に置換し Step 番号依存を除去するか、Step 番号を残したまま SPEC/command 側で番号を安定化させるか
- REQ-0151-007 の「case-close Step 4 に rebase を追加」を「case-close のマージ手順に rebase を追加」等に再表現し、特定 Step 番号への依存を除去するか
- 両要件行は同一是正方針（Step 番号 → 機能名・フェーズ名への置換）で統合的に処理可能

## 備考

- **Finding 分類**: WARNING / CanonicalConflict / req-spec-boundary-violation（2 件を同一方針で統合）
- **Route**: req-define
- **根拠**: `/repo/docs-check` 実行（2026-06-25）。`.agentdev/integrity/reports/2026-06-24-integrity-report.md`
- **原因分類**: 仮説（heuristic 検出。Step 番号が実装指示にあたるかは要件文脈次第）
- **重複確認**: 既存 inbox item `2026-06-24-issue1102-spec-command-step-number-mismatch.md` は SPEC↔command 間の Step 番号ずれ（別問題）であり、本 item（REQ 内の Step 番号参照）とは対象が異なるため重複なし
