---
id: intake-20260904-adr-revision-mode-machine-contract-stale-candidate-2570
title: adr-revision-mode 機械契約値（draft-meta）の陳腐化判断（値改名または規約行撤去）
created: 2026-09-04
status: inbox
---

## 概要

- PR #2593 本文明記の Findings（case-run DEL-2570-1 実行時に記録、case-close STEP-6 で capture 回収）
- `req-save-procedure.md:22` の draft-meta 値 `adr-revision-mode: full-reclassification` は、draft 生成側（req-define / req-analysis）に書き手が存在せず陳腐契約の可能性
- 棚卸し記録 §4 では「機械契約」として除外規則該当と確認済み（OU-020 では現行化対象外）

## 内容

draft-meta 値の書き手が不在のため、該当値が実際に draft に付与されることがなく、規約行だけが残存している可能性。名前自体も旧称（adr）を含むため、DEC-009 移行後の語彙政策とも不整合。

## 対応候補

- 値自体の改名（decision-revision-mode 等）または規約行の撤去を intake-promote で判断
- 撤去する場合: req-save-procedure.md の該当行除去と、req-save 側 reader の有無確認

## 関連

- PR #2593 本文明記の Findings/ Capture候補（intake）
- Issue #2570 対応記録コメント（case-close 対応記録セクション）
- src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md（該当規約行）
