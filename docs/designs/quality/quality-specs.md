---
title: 品質仕様
status: accepted
created: 2026-08-20
updated: 2026-11-18
---
<!-- ADF-COVERS(implementation): REQ-007-006, REQ-007-007, REQ-007-008, REQ-007-009 -->
<!-- ADF-COVERS(design): REQ-122-011, REQ-122-012（コマンド・スキル本文・コマンド Design 文書の行数上限と references/ 分離の品質仕様。本文は ## 文書品質ルール 節） -->

# 品質仕様

AgentDevFlow の品質基準、検証ルールを定義する。

## 品質ゲート（QG-1〜QG-4）

品質要件の検証体系は v4 Quality モデル（docs/designs/quality/quality-gate-model.md）が所有する。Quality Policy（何を品質として要求するか）・Verification Obligation・Verifier・Evidence・Gate の 5 概念に分解され、QG-1〜QG-4 は本モデルが lifecycle 遷移点から再導出した Gate 群の呼称である。判定値と遷移接続・証拠種別の扱いは同 Design の定めるところに従う。
各 Gate の判定基準、検査観点は `agentdev-quality-gates` スキルの参照ファイルを参照。


## 品質メトリクス収集

型チェック、Lint、ビルド、テスト等の品質メトリクス収集は、各コマンドのローカル検証ステップ（case-run 実行担当サブエージェント委譲内の test-fix ループ等）の責務である。

## 文書品質ルール

以下の文書品質ルールの原本 Design として機能する（rule-ownership.md 参照）:

- 行数上限: コマンド定義本文（src/**/commands/*.md と投影）、SKILL.md 本文（src/**/skills/*/SKILL.md と投影）、
  コマンド Design 文書（docs/designs/commands/*.md、_template.md を除く）は YAML Frontmatter を含む総行数
  250 行以内であること（8,192 bytes は目安の併記とし、バイト数のみの超過は違反としない）
- 上限超過の解消手段: メインファイルは制御フロー骨格（150〜200行目標）とし、詳細仕様・判定マトリクス・
  委譲プロンプトテンプレート・異常系手順は references/<name>/ 配下へ分離する（段階的開示。
  **/references/**/*.md は行数上限の対象外）
- 検出手順・エラーメッセージ形式の機械検査仕様は IR-075（ir-file-size）ルール定義が所有する
- 執筆完了基準（Authoring DoD）: 行数、Steps、共通化、正規パス（`canonical path`）


## 必須シナリオ（10シナリオ）

必須シナリオ（S-001..S-010）説明中の RU-xxxx 設計根拠参照を除去し、必要な意味を本文へ直接記述する。
REQ-001-030（永続文書の根拠参照は一時成果物識別子を含まない）に基づく。
詳細 normative は本 Design の各節と document-model Design が所有する。
