---
title: intake-capture SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# intake-capture SPEC

## 目的

未分類の変更候補を手動入力から intake item として保存する。保存専用コマンドであり、GitHub Issue 作成、採用可否判断は行わない。

## 入力

- ユーザーの自然言語による変更候補記述
- 任意で観測元、影響、判断保留事項の指定

## 出力

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md`（intake item）

## 副作用

- git commit/push: `.agentdev/intake/` 配下のみ（commit message: `chore: capture intake item`）
- 実行前同期: `git pull --ff-only`
- GitHub Issue 作成: 行わない（G01）
- 採用可否判断: 行わない（G02）

## 現在の動作

- Step 1: 入力受領
- Step 2: intake item 生成（推奨標準形に整理、ユーザー未指定セクションは省略（G13: 過度補完禁止、G11: 過度解釈禁止））
- Step 3: ファイル名生成（`YYYY-MM-DD-{topic-slug}.md`）
- Step 3-1: 実行前同期（`git pull --ff-only`）
- Step 4: 保存（`.agentdev/intake/inbox/`）。同名時は連番付与
- Step 4-1: commit/push（`.agentdev/intake/` 配下変更のみ）
- Step 5: 完了報告

## 参照する横断 SPEC

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Split Rule（作業知見のみは除外））
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（intake inbox lifecycle）

## 対象外

- GitHub Issue 作成（G01）
- 採用可否判断（G02）
- intake item 変更、更新（G03）
- review、整形、分類（G04）
- 作業知見のみの内容（G05、learning item 扱い）
- learning item 保存、分類、昇華（G06）
- frontmatter、状態値、重複排除キーの必須化（G08）
- workflow 管理成果物の扱い（G07）
- 特定セクションの必須扱い（G09）
- ユーザー入力内容の過度解釈、変形（G11）
- `.agentdev/intake/` 以外への保存（G12）

## 検証観点

- ファイル名形式: `YYYY-MM-DD-{topic-slug}.md`
- 同名時連番付与
- git 操作スコープ: `.agentdev/intake/` 配下のみ

## See Also

- [intake-promote.md](intake-promote.md)（後続コマンド（採用判断））
- [intake-from-github.md](intake-from-github.md)（GitHub からの自動抽出）
- `agentdev-intake-pipeline` skill（共通手順）
- REQ-0127（Intake command群）
