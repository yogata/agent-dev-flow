---
title: "AUTOGEN ブロック鮮度検出 gate"
status: draft
created: "2026-08-09"
updated: "2026-08-09"
---

# AUTOGEN ブロック鮮度検出 gate

`/repo/docs-check` は repo-local コマンドであり配布対象外 SPEC を持たないため、AUTOGEN ブロック鮮度検出 gate を本新規 SPEC として配置する。AUTOGEN ブロックを含む SPEC ファイル（spec-health-metrics.md 等）の陳腐化を検出し、再生成を促す契約を定義する。

## 検出対象

- AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN -->` 〜 `<!-- AUTOGEN:END -->`）を含む SPEC ファイル
- 代表例: `docs/specs/quality/spec-health-metrics.md`

## 鮮度判定基準

- 対象 SPEC の rename 発生時に AUTOGEN ブロックの再生成必要性を判定する
- 対象 SPEC の status 変更（draft → accepted 等）時に AUTOGEN ブロックの再生成必要性を判定する
- SC-002（定期再生成）と整合する運用を維持する

## 不合格時の処置

- 鮮度判定不合格時は再生成を要求し、合格まで検出を継続する
- 自動修復は行わず、再生成対象を報告に留める

## 関連

- REQ-010-059（AUTOGEN ブロック鮮度検出 gate 要件行）
- SC-002（定期再生成、REQ-010 関連）
- `/repo/docs-check`（repo-local、配布対象外）
