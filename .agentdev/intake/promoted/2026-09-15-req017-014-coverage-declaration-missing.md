# REQ-017-014（presence-based 判定）の実装対応宣言が未付与

## 観測内容

REQ-017-014（presence-based 判定）が Issue #2809 の対象行リスト（13 行）に含まれず、PR #2817 の coverage 宣言対象外となっている。配布物（`references/execution-contract.md`）には運用説明として記述済みだが、REQ-017-014 行自体の実装対応宣言は未付与。

本 promoted 成果物の生成時点（2026-09-15）で再検証済み:

- `src/opencode` 全域で `REQ-017-014` の ADF-COVERS 宣言なし（grep で 0 件）

## 影響

- REQ-017-014 の実装対応が traceability 上で欠落したまま残り、coverage 整合を崩している

## 課題（対応候補と判断材料）

- 後続 OU での REQ-017-014 への実装対応宣言付与
- 付与先は正規配置先カタログ（実現する配布物の SKILL.md / command .md 冒頭 HTML コメント）に従う

## 既存要件との関連

- REQ-017（presence-based 判定）: 宣言付与の対象 REQ 行

## 根拠

- 観測元: case 2805 OU-004（DEL-2809-1、PR #2817）本文 Findings/Capture候補（intake 候補）、case-close（2026-09-14）で回収
- 処分経緯: intake-promote（2026-09-15）で宣言不在を grep により機械再確認し、採用を確定（自律確定）
