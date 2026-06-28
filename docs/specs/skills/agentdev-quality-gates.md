---
title: `agentdev-quality-gates` SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# `agentdev-quality-gates` SPEC

## 目的

AgentDevFlow 主ワークフローの品質ゲート QG-1〜QG-4 の判定基準、検査観点を提供する参照専用スキル。

## 適用対象

- QG-1（Definition Integrity Gate）: req-define / req-save での要件定義の構造的完全性検証
- QG-2（Acceptance Criteria Coverage Gate）: case-open での完了条件の必達要件網羅性検証
- QG-3（Implementation Deviation Gate）: case-run での実装乖離検出、分類
- QG-4（Final Acceptance Gate）: case-close での最終受け入れ確認

主ワークフロー（req-define / req-save / spec-save / case-open / case-run / case-close）のみ適用。
spec-save は独自 QG を持たず QG-1、QG-4 で担保される。

## 提供する判断、操作

- 各 Gate の pass / warn / fail / partial 判定基準
- 乖離分類（QG-3）: no-deviation / impl-bug / spec-bug / scope-creep
- evidence-first 原則
- Gate 結果フォーマット
- 各 Gate の検査観点

## 参照する references

- `references/common-gate-contract.md`（全 Gate 共通契約）
- `references/qg-1-definition-integrity.md`
- `references/qg-2-acceptance-criteria-coverage.md`
- `references/qg-3-implementation-deviation.md`
- `references/qg-4-final-acceptance.md`

## 現在の動作

- 参照専用（read-only）knowledge base
- ファイル編集、Issue 作成、PR 作成、マージ、テスト実行は行わない
- 自動ループバック禁止（QG-3 / QG-4 fail 時は推奨アクション提示、ユーザー決定）

## 対象外

- テストの実行、型チェック、Lint、ビルド（各コマンドのローカル検証ステップ責務）
- ファイル編集、REQ 更新、Issue チェックボックス更新（各コマンド責務）
- Issue / PR / コメントの作成（各コマンド責務）
- コマンド固有の手順（Steps / Guardrails）の置き換え
- docs 全体の意味レビュー（inspect-docs 責務）
- 適用範囲外ワークフロー（inspect-* / intake-* / learning-* / backlog-* / case-update）

## 検証観点

- 各 Gate 固有の判定基準への適合
- evidence-first 原則の遵守
- 乖離分類（QG-3）の正確性
- SPEC status 昇格（draft → accepted）と QG-4 の連携

## See Also

- [quality-gates.md](../quality/quality-gates.md)（SPEC 定義）
- [commands/req-define.md](../commands/req-define.md), [commands/req-save.md](../commands/req-save.md), [commands/case-open.md](../commands/case-open.md), [commands/case-run.md](../commands/case-run.md), [commands/case-close.md](../commands/case-close.md)（適用先）
- REQ-0136（REQ/SPEC 責務分離の徹底）
