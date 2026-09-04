---
id: intake-20260904-japanese-tech-writing-baseline-staleness-candidate-2570
title: ng-baseline.json の japanese-tech-writing 起源エントリ陳腐化の可能性（不在パスの baseline 運用整合）
created: 2026-09-04
status: inbox
---

## 概要

- PR #2593 本文明記の Findings（case-run DEL-2570-1 実行時に記録、case-close STEP-6 で capture 回収）
- ng-baseline.json に `src/opencode/skills/japanese-tech-writing/SKILL.md` 起源エントリが存在するが、該当パスは不在（japanese-tech-writing は third-party Skill で .opencode 側のみ配置）

## 内容

third-party Skill（japanese-tech-writing）は src/opencode/skills/ 配下にソースを持たない。不在パスを向く baseline エントリは永久に不発となり、baseline 管理の実態から乖離する。

## 対応候補

- 該当エントリの削除判断、または third-party Skill を baseline 走査対象外とする運用の明文化
- baseline 運用契約（IR-065 / ng-baseline）側での third-party 由来エントリの扱い規定を併せて確認

## 関連

- PR #2593 本文明記の Findings/ Capture候補（intake）
- Issue #2570 対応記録コメント（case-close 対応記録セクション）
- intake item 2026-09-04-ng-baseline-req-adr-entry-staleness-candidate-2570（同一 baseline ファイルの陳腐化課題）
