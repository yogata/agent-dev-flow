---
title: inspect-skills SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# inspect-skills SPEC

## 目的

Command→Skill 参照妥当性と Skill 構造を、検査対象を直接修正せずに診断するコマンド。検出事項を `.agentdev/inspect/inbox/` へ出力する。

## 入力

- Command 定義ファイル群（`src/opencode/commands/`、`.opencode/commands/`）
- Skill 定義ファイル群（`src/opencode/skills/`、`.opencode/skills/`）
- 必要に応じて関連する template / reference / script ファイル群

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`

## 副作用

- ファイル作成: `.agentdev/inspect/inbox/inspect-skills-finding-*.md` のみ（G01 例外）
- git commit/push: `.agentdev/inspect/` 配下のみ
- 実行前同期: `git pull --ff-only`
- 検査対象ファイルの変更: 禁止（G01）
- GitHub Issue/PR 作成、更新: 禁止（G02）
- worktree/ブランチ操作: 禁止（G04）
- RU/intake/learning/backlog 成果物保存: 禁止（G03）
- 自動修正: 禁止（G05、推奨 route 提示に留める）

## 現在の動作

- 診断対象の読込（Command、Skill 群）
- 各診断観点の評価（`agentdev-inspect-skills`）:
  - Command 参照の妥当性診断
  - Skill 粒度の評価
  - Skill 構造のレビュー
  - USE FOR / DO NOT USE FOR 照合
  - Skill 分割候補検出
  - Command 固有手順の Skill 流入検出
- 分類（finding / classification / route）
- route 提示
- 検出事項出力（`.agentdev/inspect/inbox/inspect-skills-finding-*.md`）
- 実行前同期（`git pull --ff-only`）
- `.agentdev/inspect/` 変更の commit と push
- 完了報告

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（検出事項プロトコル）

## 対象外

- 正規文書変更、REQ/ADR/SPEC 変更、Command/Skill/Template/Script 変更（G01）
- Issue 作成、PR 作成、RU 保存（G02, G03）
- branch、worktree 操作（G04）
- 自動修正（G05、推奨 route 提示に留める）

## 検証観点

- ファイル変更禁止（G01、`.agentdev/inspect/inbox/inspect-skills-finding-*.md` 生成は例外）
- GitHub Issue/PR 作成、更新禁止（G02）
- commit/push スコープ: `.agentdev/inspect/` 配下のみ（G04）
- 自動修正禁止（G05）

## See Also

- [inspect-docs.md](inspect-docs.md)（docs 全体の意味整合レビュー）
- [inspect-promote.md](inspect-promote.md)（検出事項分類、昇格）
- `agentdev-inspect-skills` skill（詳細手順、finding 形式、推奨 route）
- REQ-0125（inspect-skills / Command/Skill 参照妥当性検出）
