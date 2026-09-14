# Issue 本文テンプレート目録の case-open 対象コマンド列が case-ready 移管後に陳腐化

## 概要

agentdev-workflow-templates/SKILL.md の Issue 本文テンプレート目録に残る `issue_desc_epic.md` / `issue_desc_child.md` の対象コマンド列（case-open 表記）は、Epic / 子 Issue 作成の case-ready（REQ-061）移管後に陳腐化する。

## 内容

- `issue_desc_epic.md` / `issue_desc_child.md` の対象コマンド列を case-ready 主体へ再割当てする
- OU-004 の case-ready 用テンプレート新規時（#2809）に再割当てを推奨。PR #2816（OU-003）では case-open 用テンプレート（root-case 系）のみ更新し、Epic / 子 Issue 用テンプレートの目録列は触れていない

## 根拠

- 観測元: case 2805 OU-003（DEL-2808-1、PR #2816）本文 Findings（intake 候補）、case-close（2026-09-14）で回収
- 元テキスト: PR #2816 本文 Findings/Capture候補「`agentdev-workflow-templates/SKILL.md` の Issue 本文テンプレート目録に残る `issue_desc_epic.md` / `issue_desc_child.md` の対象コマンド列（case-open 表記）は、Epic / 子 Issue 作成の case-ready 移管後に陳腐化。OU-004 の case-ready 用テンプレート新規時に再割当てを推奨」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
