---
title: learning-promote SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# learning-promote SPEC

## 目的

inbox.md から正規化・分類・8軸評価・廃棄判定・既存対策確認・HITL 承認を経て採用済み成果物を生成する。`.opencode/` 直接反映は禁止。backlog-review 経由で RU 化する。

## 入力

- `.agentdev/learning/inbox.md`（必須・未処理学びエントリ）
- `.agentdev/learning/archive/active.md`（任意・過去エントリ参照）

## 出力

- `.agentdev/learning/evaluation-report.md`（8軸評価レポート）
- `.agentdev/learning/promoted/{category}-{name}.md`（採用済み成果物・フラット構造）
- `.agentdev/learning/archive/active.md`（inbox 移動分追記）
- `.agentdev/learning/inbox.md`（ヘッダーのみクリア）

## 副作用

- git commit/push: `.agentdev/learning/` 配下のみ（明示パスステージング・REQ-0137-002/005）
- 実行前同期: `git pull --ff-only`
- 昇華時 prune: 必須
- `.opencode/` 直接反映: 禁止（G01）

## 現在の動作

6 フェーズ構成:

- フェーズ1 inbox スキャン: Step 1 inbox.md 読込・Step 2 archive/active.md 読込
- フェーズ2-5 Normalize→Classify→Evaluate→Dispose→HITL:
  - Step 3: 正規化
  - Step 4: 問題クラス分類
  - Step 5: 8軸評価
  - Step 6: evaluation-report 生成
  - Step 7: 廃棄判定
  - Step 8: 既存対策確認（G05: 既存対策優先・新規 X 化より既存 X へ反映）
  - Step 9: 結果提示
  - Step 10: ユーザー承認（G06: 判定・prune にユーザー承認必須）
- フェーズ6 実行 git 操作:
  - Step 11: git pull
  - Step 12: 採用済み成果物生成
  - Step 13: アーカイブ移動（原子的）
  - Step 14: 昇華時 prune
  - Step 15: commit/push
  - Step 16: 完了報告

## 参照する横断 SPEC

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md) — Capture 境界
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md) — 採用済み成果物 lifecycle

## 対象外

- `.opencode/` 直接反映（G01）
- case-run への直接受け渡し（G03・backlog-review 経由のみ）
- raw learning item の再分類（G04）
- 管理用ファイル（elevation-ledger.md 等）の生成（G07）
- learning-refine への依存（G08）

## 検証観点

- evaluation-report.md は本コマンドが生成・管理（G02）
- 既存対策優先（G05）: 新規 X 化より既存 X へ反映
- ユーザー承認必須（G06）: 判定・prune

## See Also

- [backlog-review.md](backlog-review.md) — 後続コマンド（RU 生成）
- `agentdev-learning-pipeline` skill — 全判定基準・スコアリングルール・提示形式・承認フロー
- `agentdev-learning-capture` skill — capture 層（独立スキル）
- REQ-0128 — Learning-promote
