---
title: `agentdev-inspect-skills` Design
status: accepted
created: 2026-06-21
updated: 2026-07-18
---
<!-- ADF-COVERS(verification): REQ-005-014, REQ-016-001, REQ-016-002, REQ-016-003, REQ-016-004, REQ-016-005, REQ-016-006, REQ-016-007, REQ-016-008, REQ-016-009, REQ-016-010 -->
<!-- ADF-COVERS(implementation): REQ-036-013, REQ-036-014, REQ-036-015, REQ-036-023 -->

# `agentdev-inspect-skills` Design

## 目的

Command→Skill 参照妥当性と Skill 構造を、ファイル修正なしで診断する知識ベース。

## 適用対象

- inspect-skills コマンドにおける Command 参照の妥当性診断
- Skill 粒度の評価、Skill 構造のレビュー

## 提供する判断、操作

- USE FOR / DO NOT USE FOR 照合
- Skill 分割候補検出
- Command 固有手順の Skill 流入検出
- gh 直接記述の委譲漏れ検出（REQ-011）。スキャン対象、除外対象は [agentdev-gh-cli Design](agentdev-gh-cli.md)「gh 直接記述の検出スコープ」参照
- 出力形式生成（Finding / Classification / Route）

## 参照する references

- `references/execution-subject-misclassification.md`（実行主体分類誤認の判定基準（REQ-010-010））
- `references/spec-operation-contract-consistency.md`（Design 操作契約テーブル ↔ references/contracts.md フィールド一致性の判定基準、対象 Design 範囲、フィールド対応規則（REQ-010-011 / REQ-010-004 準拠））

## 現在の動作

- 検出事項を `.agentdev/inspect/inbox/` にエクスポート可能
- ファイル修正は行わない
- 推奨 route 提示に留める（自動修正禁止）

## 対象外

- ファイル修正
- Issue 作成
- 修正実行

## 検証観点

- 参照の整合性（Command → Skill 参照妥当性）
- 粒度の適切性（Skill 分割候補検出）
- 診断分類の正確性
- gh 直接記述の委譲漏れ（REQ-011）。command/skill 配下で `agentdev-gh-cli` へ委譲すべき gh 直接記述が残留していないか。許容ファイル（standard-procedures.md）の除外が正しく機能しているか

## See Also

- [commands/inspect-skills.md](../commands/inspect-skills.md)
- [agentdev-skill-authoring.md](agentdev-skill-authoring.md)
- [agentdev-command-authoring.md](agentdev-command-authoring.md)
- [agentdev-gh-cli.md](agentdev-gh-cli.md)（gh 直接記述の検出スコープ）
- REQ-036（inspect-skills / Command/Skill 参照妥当性検出）
- REQ-011（`agentdev-gh-cli` 手続き委譲基盤）

