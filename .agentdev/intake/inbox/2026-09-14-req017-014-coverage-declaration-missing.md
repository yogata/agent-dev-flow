# REQ-017-014（presence-based 判定）が Issue 対象行リスト外で coverage 宣言対象外

## 概要

REQ-017-014（presence-based 判定）が Issue #2809 の対象行リスト（13 行）に含まれず、PR #2817 の coverage 宣言対象外となっている。配布物（references/execution-contract.md）には運用説明として記述済みだが、REQ-017-014 行自体の実装対応宣言は未付与。

## 内容

- 後続 OU での REQ-017-014 への実装対応宣言付与候補
- 付与先は正規配置先カタログ（実現する配布物の SKILL.md / command .md 冒頭 HTML コメント）に従う

## 根拠

- 観測元: case 2805 OU-004（DEL-2809-1、PR #2817）本文 Findings/Capture候補（intake 候補）、case-close（2026-09-14）で回収
- 元テキスト: PR #2817 本文「REQ-017-014（presence-based 判定）が Issue 対象行リスト（13 行）に含まれず、本 PR の coverage 宣言対象外。配布物（references/execution-contract.md）には運用説明として記述済みだが、REQ-017-014 行自体の実装対応は未付与。後続 OU での宣言付与候補。分類: intake」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
