---
title: third-party-sync Design
status: accepted
created: 2026-08-30
updated: 2026-08-30
---

# third-party-sync コマンド Design

## 入口契約

- 利用者向け入口: /agentdev/third-party-sync
- 入力: 対象 Skill 名（省略時は全件）、dry-run 指定
- 出力: 取得結果報告（対象一覧、成否、配置パス、管理外衝突検出状況）
- ガードレール: 取得手順本体を所有せず専用 Custom Tool へ委譲する。
  scripts/ 直下の公開入口を追加しない（REQ-003 との整合上、副作用実行は Tool が担う）

## Workflow Skill 設計（同一 Design 内統合）

- STEP-1 入力解決・skills.yaml 読込と検証（構文、name 制約）
- STEP-2 対象選択（全件または指定名、管理外衝突の事前判定）
- STEP-3 取得実行（Custom Tool 委譲、dry-run 指定時は計画表示のみ）
- STEP-4 結果検証・報告（成功読み戻し確認、失敗時の状態維持と要因報告）

実装詳細（ファイル構成、エラーメッセージ）は実装スコープとする。
