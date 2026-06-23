---
title: agentdev-req-analysis SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-req-analysis SPEC

## 目的

要件分析のための知識ベースとして分析観点、品質基準、定義を提供し、壁打ちフェーズでの壁打ち品質を担保する。

## 適用対象

- 要件定義プロセス全般（壁打ち、Issue 作成、実装検証）
- 要件分析、完了条件定義、要件網羅性評価時
- req-define Step 4（要件展開）、Step 4-2（分類ゲート）、Step 4-3（文書分類妥当性検証）、Step 10（要件doc確認）

## 提供する判断、操作

- ユーザーストーリー、完了条件、境界条件の展開
- 状態要件と反映作業の分類基準（分類ゲート）
- REQ/SPEC 境界判定基準（REQ-0101-067〜069）
- 壁打ちメソドロジー（未決分岐解消、回答分類: Confirmed / Inferred / Unknown / User Decision / Out of Scope）
- ADR 閾値判定ブリッジ
- 複数 RU 入力受付、統合/分離判定、操作単位ごとの出力生成
- Epic 規模検出、Wave 候補、依存関係の記録
- チェックボックス品質基準（測定可能、一意、実装可能）

## 参照する references

- `@.opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md`（REQ テンプレート）

## 現在の動作

- Confirmed のみを要件 doc へ反映
- Inferred / Unknown / User Decision / Out of Scope は要件 doc 外で提示
- 要件行は「変更後に満たすべき振る舞い、制約、状態」のみ記述
- 実装指示は要件行に混入させない
- 委譲接点: サブエージェントは分類候補、根拠のみを返し、親エージェントが確定事項として記録

## 対象外

- REQ ファイルの採番、CREATE/APPEND/UPDATE、frontmatter 更新、README 更新（`agentdev-req-file-manager` 担当）
- 実装計画、タスク分割、コード変更方針の確定
- ADR ファイルの作成、更新（`agentdev-adr-file-manager` 担当）

## 検証観点

- チェックボックス品質: 測定可能、一意、実装可能であるか
- 曖昧な表現を具体化できているか
- 全ステークホルダー視点で合意形成できているか
- 要件行が必達要件として記述されているか
- SPEC 分離基準（REQ-0101-068）違反の残留検出

## See Also

- [agentdev-req-file-manager.md](agentdev-req-file-manager.md)
- [agentdev-req-structure-diagnostics.md](agentdev-req-structure-diagnostics.md)
- [agentdoc-architecture-advisory.md](agentdev-architecture-advisory.md)
- [agentdev-adr-guidelines.md](agentdev-adr-guidelines.md)
- [commands/req-define.md](../commands/req-define.md)
- REQ-0102（要件定義、保存）
