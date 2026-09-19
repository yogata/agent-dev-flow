---
title: 品質仕様
status: accepted
created: 2026-08-20
updated: 2026-09-19
---
<!-- ADF-COVERS(implementation): REQ-007-006, REQ-007-007, REQ-007-008, REQ-007-009 -->

# 品質仕様

AgentDevFlow の品質基準、検証ルールを定義する。

## 品質ゲート（QG-1〜QG-4）

品質要件の検証体系は v4 Quality モデル（docs/designs/quality/v4-quality-gate-model.md）が所有する。Quality Policy（何を品質として要求するか）・Verification Obligation・Verifier・Evidence・Gate の 5 概念に分解され、QG-1〜QG-4 は本モデルが lifecycle 遷移点から再導出した Gate 群の呼称である。判定値と遷移接続・証拠種別の扱いは同 Design の定めるところに従う。
各 Gate の判定基準、検査観点は `agentdev-quality-gates` スキルの参照ファイルを参照。


## 品質メトリクス収集

型チェック、Lint、ビルド、テスト等の品質メトリクス収集は、各コマンドのローカル検証ステップ（case-run 実行担当サブエージェント委譲内の test-fix ループ等）の責務である。

## 文書品質ルール

以下の文書品質ルールの原本 Design として機能する（rule-ownership.md Domain 3, 4, 20 参照）:

- Command 行数上限: 100行目標、150行上限、200行以内（200行超は分割対象）
- Skill 行数上限: 200行超で分割候補報告
- 執筆完了基準（Authoring DoD）: 行数、Steps、共通化、正規パス（`canonical path`）

## 必須シナリオ（10シナリオ）

必須シナリオ（S-001..S-010）説明中の RU-xxxx 設計根拠参照を除去し、必要な意味を本文へ直接記述する。
REQ-001-030（永続文書の根拠参照は一時成果物識別子を含まない）に基づく。
詳細 normative は移行計画 §5.6。
