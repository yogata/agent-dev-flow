---
name: agentdev-quality-gates
description: "Defines lightweight quality gates for AgentDevFlow main workflow. USE FOR: QG-1 definition integrity, QG-2 acceptance criteria coverage, QG-3 implementation deviation, QG-4 final acceptance. DO NOT USE FOR: executing tests, modifying files, creating issues, updating issue checkboxes, creating PRs, merging PRs, or replacing command-specific procedures."
---

# Quality Gates スキル

AgentDevFlow 主ワークフローの品質ゲート QG-1〜QG-4 の判定基準・検査観点を提供する knowledge base。本スキルは参照専用であり、ファイル編集・Issue 作成・PR 作成・マージ・テスト実行は行わない。

## 概要

- **役割**: QG-1〜QG-4 の判定基準・検査観点・乖離分類基準を提供する
- **対象**: AgentDevFlow **主ワークフローのみ**（req-define/ req-save/ spec-save/ case-open/ case-run/ case-close）。spec-save は主ワークフローの一工程だが、独自の QG を持たず QG-1（req-save）と QG-4（case-close）の SPEC lifecycle 確定で担保される
- **特性**: knowledge base。コマンドから参照され、判定結果を返すが成果物を直接編集しない
- **依存**: agentdev コマンドから参照される専門スキル

## Quality Gate 一覧

| Gate | 名称 | 配置コマンド | 参照ファイル |
|------|------|-------------|-------------|
| QG-1 | Definition Integrity Gate | req-define/ req-save | [qg-1-definition-integrity.md](references/qg-1-definition-integrity.md) |
| QG-2 | Acceptance Criteria Coverage Gate | case-open | [qg-2-acceptance-criteria-coverage.md](references/qg-2-acceptance-criteria-coverage.md) |
| QG-3 | Implementation Deviation Gate | case-run | [qg-3-implementation-deviation.md](references/qg-3-implementation-deviation.md) |
| QG-4 | Final Acceptance Gate | case-close | [qg-4-final-acceptance.md](references/qg-4-final-acceptance.md) |

全 Gate 共通の契約（pass/warn/fail/partial 定義・evidence-first 原則・ゲート結果フォーマット）は [common-gate-contract.md](references/common-gate-contract.md) を参照。

## USE FOR

- QG-1: req-define/req-save での要件定義の構造的完全性検証（REQ/SPEC 分類・ADR ゲート・チェックボックス測可能性）
- QG-2: case-open での完了条件の必達要件網羅性検証（REQ 必達要件 → 完了条件 mapping）
- QG-3: case-run での実装乖離検出・分類（no-deviation/ impl-bug/ spec-bug/ scope-creep）
- QG-4: case-close での最終受け入れ確認（完了条件チェックボックス・CI・ドキュメント整合性）

## DO NOT USE FOR

- テストの実行・型チェック・Lint・ビルド（各コマンドのローカル検証ステップの責務）
- ファイル編集・REQ 更新・Issue チェックボックス更新（各コマンドの責務）
- Issue/ PR/ コメントの作成（各コマンドの責務）
- コマンド固有の手順（Steps/ Guardrails）の置き換え
- docs 全体の意味レビュー（`/agentdev/inspect-docs` の責務）

## 適用範囲外のワークフロー

以下の補助ワークフローは **実行時コマンドの参照対象ではない**。QG-1〜QG-4 を適用しない:

- `inspect-*`（inspect-docs/ inspect-skills/ inspect-promote）
- `intake-*`（intake-capture/ intake-from-github/ intake-promote）
- `learning-*`（learning-capture/ learning-promote）
- `backlog-*`（backlog-review）
- `case-update`（QG 直接参照なし。`--review-ng` 時は QG-3 の結果を引用する）

## 責務境界

本スキルは**判定基準の提供と判定結果の提示**に限定する。

- **本スキルが行うこと**: 各 Gate の pass/warn/fail 判定、乖離の分類（QG-3）、推奨アクションの提示
- **本スキルが行わないこと**: ファイル編集、REQ 更新、Issue チェックボックス更新、PR 作成、マージ、テスト実行

### QG-3 と docs 全体レビューの関係

QG-3 は実装と Issue/ REQ/ ADR/ SPEC/ work plan の乖離検出ゲートであり、docs 全体の意味レビューの代替ではない。docs 全体の意味レビューは `/agentdev/inspect-docs` が担う。

### case-update 連携

QG-3 は乖離の分類と推奨アクションの提示までを責務とし、REQ 更新の最終判断は case-update（ユーザー承認入力）に委譲する。乖離分類 → case-update フラグの mapping は `references/qg-3-implementation-deviation.md` を参照。

## 自動ループバック禁止

QG-3/ QG-4 の fail 判定時、エージェントは推奨アクションを提示しユーザーが決定する。自動的な差し戻し・修正は行わない。

## See Also

- [common-gate-contract.md](references/common-gate-contract.md) — 全 Gate 共通契約（pass/warn/fail/partial・evidence-first・結果フォーマット）
- [quality-gates.md SPEC](../../../../docs/specs/quality-gates.md) — QG-1〜QG-4 の SPEC 定義・機械化境界・実装マッピング
- **agentdev-req-analysis**: 要件分析手法・チェックボックス品質基準（QG-1 の基準）
- **agentdev-workflow-lifecycle**: work_type 判定・フェーズ定義
- **agentdev-workflow-routing**: case-update --review-ng 手順（QG-3 結果の消費先）

