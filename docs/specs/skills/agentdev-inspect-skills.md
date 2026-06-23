---
title: agentdev-inspect-skills SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-inspect-skills SPEC

## 目的

Command→Skill 参照妥当性と Skill 構造を、ファイル修正なしで診断する知識ベース。

## 適用対象

- inspect-skills コマンドにおける Command 参照の妥当性診断
- Skill 粒度の評価・Skill 構造のレビュー

## 提供する判断・操作

- USE FOR / DO NOT USE FOR 照合
- Skill 分割候補検出
- Command 固有手順の Skill 流入検出
- 出力形式生成（Finding / Classification / Route）

## 参照する references

- `references/execution-subject-misclassification.md`（実行主体分類誤認の判定基準（REQ-0125-010））

## 現在の動作

- 検出事項を `.agentdev/inspect/inbox/` にエクスポート可能
- ファイル修正は行わない
- 推奨 route 提示に留める（自動修正禁止）

## 対象外

- ファイル修正（G01）
- Issue 作成（G02）
- 修正実行

## 検証観点

- 参照の整合性（Command → Skill 参照妥当性）
- 粒度の適切性（Skill 分割候補検出）
- 診断分類の正確性

## See Also

- [commands/inspect-skills.md](../commands/inspect-skills.md)
- [agentdev-skill-authoring.md](agentdev-skill-authoring.md)
- [agentdev-command-authoring.md](agentdev-command-authoring.md)
- REQ-0125（inspect-skills / Command/Skill 参照妥当性検出）
