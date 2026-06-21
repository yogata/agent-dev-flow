---
title: intake-promote SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# intake-promote SPEC

## 目的

inbox 内の intake item をレビュー・分類し、採用 item を backlog-review 向け採用済み成果物に整形する。review・分類・整形を担う。GitHub Issue 作成は行わない。

## 入力

- intake item 群（`.agentdev/intake/inbox/` 内 Markdown）
- ユーザーによる追加コンテキスト・分類修正指示（対話的）

## 出力

- 採用 item の採用済み成果物（backlog-review 用）
- `.agentdev/intake/promoted/*.md`（整形済み item・フラット構造・frontmatter なし）
- 分類結果レポート（採用/保留/却下）

## 副作用

- git commit/push: `.agentdev/intake/` 配下のみ（commit message: `chore: promote intake items`）
- 採用 item の inbox 元ファイルを `.agentdev/intake/archive/promoted/` に移動（G17）
- 実行前同期: `git pull --ff-only`
- GitHub Issue 作成: 行わない（G01）

## 現在の動作

5 フェーズ構成:

- フェーズ1 inbox スキャン: Step 1 inbox 確認・Step 2 item 読込
- フェーズ2 内部レビュー: Step 3 レビュー評価・Step 4 分類提示
- フェーズ3 HITL 確定: Step 5 ユーザー確認（G06: ユーザー明示的承認必須・G07: 分類結果の提示と確認修正機会提供・G08: 自動確定・自動進行禁止）
- フェーズ4 振り分け: Step 6 採用 item 整形・Step 7 保存（`.agentdev/intake/promoted/`・フラット構造・frontmatter なし）・Step 8 振り分け
- フェーズ5 git 操作完了報告: Step 9 git pull・Step 10 commit/push・Step 11 完了報告

## 参照する横断 SPEC

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md) — Capture 境界・Split Rule
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md) — 採用済み成果物 lifecycle

## 対象外

- GitHub Issue 作成（G01）
- intake item 元内容の改変（G02）
- backlog-review の自動起動（G03）
- learning pipeline 入力生成（G04）
- learning item 保存・分類・昇華（G05）
- ユーザー明示的承認なしの採用済み成果物生成（G06）
- 分類結果の非提示（G07・必ず提示・確認修正機会提供）
- 自動確定・自動進行（G08）
- workflow 管理成果物の扱い（G09）
- 整形結果への frontmatter 含有（G10）
- 整形結果への重複排除キー・後続成果物参照含有（G11）
- 元 item 本文への整形結果書込（G12）
- `.agentdev/intake/accepted/` の参照使用（G13）
- 保存先 `.agentdev/intake/promoted/` 直下以外（G16）

## 検証観点

- HITL 承認の確実性（G06, G07, G08）
- 整形結果の frontmatter / 重複排除キー / 後続成果物参照を含まないこと（G10, G11）
- 保存先が `.agentdev/intake/promoted/` 直下のみであること（G16）
- 採用 item 元ファイルの `.agentdev/intake/archive/promoted/` 移動（G17）

## See Also

- [intake-capture.md](intake-capture.md), [intake-from-github.md](intake-from-github.md) — 前段コマンド
- [backlog-review.md](backlog-review.md) — 後続コマンド（RU 生成）
- `agentdev-intake-pipeline` skill — inbox スキャン・レビュー評価・分類提示・整形保存
- REQ-0127 — Intake command群
