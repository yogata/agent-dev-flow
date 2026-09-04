---
id: intake-20260904-ng-baseline-req-adr-entry-staleness-candidate-2570
title: ng-baseline.json の REQ/ADR/ baseline エントリ陳腐化（src 側解消済み分のエントリ削除判断）
created: 2026-09-04
status: inbox
---

## 概要

- PR #2593 本文明記の Findings（case-run DEL-2570-1 実行時に記録、case-close STEP-6 で capture 回収）
- baseline 22 エントリ（provenance `issue-2372-ir065-initial-baseline`）のうち src 側 19 ファイル分は OU-020（Issue 2570）の現行化により解消済み
- baseline ファイル（`.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json`）は検出基盤データかつ本 OU の変更対象成果物外のため未更新

## 内容

IR-065 triage_action の「`REQ/ADR/` 列挙の一括正規化は intake 経由で判断」方針に対し、本 OU が src 側分を実行した実績の baseline 反映（エントリ削除）が未了。解消済みエントリが残存していると、baseline 管理の実態と実際の検出状態が乖離する。

## 対応候補

- 解消済みエントリの削除判断（intake-promote で分類）
- 削除する場合: ng-baseline.json の src 側 19 ファイル分エントリ除去と、その後の check_integrity 再実行での demote 解除確認

## 関連

- PR #2593 本文明記の Findings/ Capture候補（intake）
- Issue #2570 対応記録コメント（case-close 対応記録セクション）
- docs/designs/integrity/rules/IR-065-obsolete-vocabulary-current-use.md（baseline 運用契約）
