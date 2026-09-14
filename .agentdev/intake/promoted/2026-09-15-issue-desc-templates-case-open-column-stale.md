# Issue 本文テンプレート目録の case-open 対象コマンド列が case-ready 移管後に陳腐化

## 観測内容

`agentdev-workflow-templates/SKILL.md` の Issue 本文テンプレート目録に残る `issue_desc_epic.md` / `issue_desc_child.md` の対象コマンド列（case-open 表記）は、Epic / 子 Issue 作成の case-ready（REQ-061）移管後に陳腐化している。

本 promoted 成果物の生成時点（2026-09-15）で再検証済み:

- `src/opencode/skills/agentdev-workflow-templates/SKILL.md` L21-22 の `issue_desc_epic.md` / `issue_desc_child.md` 対象コマンド列が case-open 表記のまま残存（grep 確認）

## 影響

- テンプレート目録の対象コマンド列が実態（Epic / 子 Issue 作成は case-ready）と不一致であり、参照者が旧割当てに誘導され得る

## 課題（対応候補と判断材料）

- `issue_desc_epic.md` / `issue_desc_child.md` の対象コマンド列を case-ready 主体へ再割当てする
- PR #2816（OU-003）では case-open 用テンプレート（root-case 系）のみ更新しており、Epic / 子 Issue 用テンプレートの目録列は未更新

## 既存要件との関連

- REQ-061（case-ready の Epic / 子 Issue 構成確定）: 移管先の正規契約

## 根拠

- 観測元: case 2805 OU-003（DEL-2808-1、PR #2816）本文 Findings（intake 候補）、case-close（2026-09-14）で回収
- 処分経緯: intake-promote（2026-09-15）で L21-22 残存を grep により機械再確認し、採用を確定（自律確定）
