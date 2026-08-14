---
title: intake-capture SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-15
---

# intake-capture SPEC

## 目的

未分類の変更候補を手動入力から intake item として保存する。
保存専用コマンドであり、GitHub Issue 作成、採用可否判断は行わない。

## 承認・HITL 境界

- 承認点を持たない（入力の受領と保存のみ。採用可否の判断は `/agentdev/intake-promote` が担う）。

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

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-intake-capture`）が正規情報源である（capture-only 型、REQ-027-003 により STEP model 対象外）。

- 入力受領
- intake item 生成（推奨標準形に整理、ユーザー未指定セクションは省略（G13: 過度補完禁止、G11: 過度解釈禁止））
- ファイル名生成（`YYYY-MM-DD-{topic-slug}.md`）
- 実行前同期（`git pull --ff-only`）
- 保存（`.agentdev/intake/inbox/`）。同名時は連番付与
- commit/push（`.agentdev/intake/` 配下変更のみ）
- 完了報告

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 SPEC であり、command 定義（`src/opencode/commands/agentdev/intake-capture.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（工程構成、intake item 推奨標準形への整形手順、reference 構成）は Workflow Skill（`agentdev-workflow-intake-capture`）が所有し、本 SPEC はこれらを複製しない。本 workflow は capture-only 型であり、STEP model の対象外である（REQ-027-003）。resume point、export、import を持たず、工程は逐次実行、中断時は先頭から再実行する。
- Workflow Skill の単独起動防止（soft guard）は Workflow Skill description の DO NOT USE FOR トリガーにより実効する（command 定義本文に soft guard 宣言節を持たない構成である）。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

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

## 停止状態

- 実行前同期（`git pull --ff-only`）失敗時（エラーを報告して停止する）。
- 保存先の書き込み失敗時（commit/push を実行せず、エラーを報告して停止する）。

## See Also

- [intake-promote.md](intake-promote.md)（後続コマンド（採用判断））
- [intake-from-github.md](intake-from-github.md)（GitHub からの自動抽出）
- `agentdev-workflow-intake-capture` skill（workflow 実装本体）
- `agentdev-intake-pipeline` skill（共通手順）
- REQ-010（Intake command群）

