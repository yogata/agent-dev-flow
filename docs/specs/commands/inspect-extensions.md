---
title: inspect-extensions command SPEC
status: accepted
created: 2026-07-04
updated: 2026-07-18
---

# inspect-extensions command SPEC

## 目的

project extensions 機構（`.agentdev/extensions/**`）の整合性を読み取り専用で診断するコマンド。
検出事項を `.agentdev/inspect/inbox/` へ出力する。従来の inspect-doc-inputs command は本 command へ統合・改名された。

## 入力

- extension ファイル群（`.agentdev/extensions/commands/*.yaml`、`.agentdev/extensions/skills/*.yaml`）
- 旧 doc-inputs 残存確認対象（`.agentdev/doc-inputs/**`）
- 配布 command/skill 定義ファイル群（参照先 skill 存在確認用）

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-extensions-finding-{timestamp}.md`

## 副作用

- ファイル作成: `.agentdev/inspect/inbox/inspect-extensions-finding-*.md` のみ（G01 例外）
- git commit/push: `.agentdev/inspect/` 配下のみ
- 実行前同期: `git pull --ff-only`
- 検査対象ファイルの変更: 禁止（G01）
- GitHub Issue/PR 作成、更新: 禁止（G02）
- worktree/ブランチ操作: 禁止
- 自動修正: 禁止（推奨 route 提示に留める）

## 現在の動作

8項目の読み取り専用検査を実行する:

1. `.agentdev/extensions/**` の一覧化
2. extension YAML の構造確認（version/kind/id 必須、5セクション配列、YAML 構文妥当性）
3. kind と配置の整合確認（command-extension → commands/、skill-extension → skills/）
4. id と対象 command/skill の対応確認
5. context.paths の実在確認
6. rules.skill / checks.skill に記述された project-local skill の存在確認
7. 旧 `.agentdev/doc-inputs/**` の残存検出
8. extension が標準 command/skill の上書きとして記述されていないことの確認

AgentDevFlow 標準の inspect 責務は構造確認（検査1〜4）、path 実在確認（検査5）、skill 存在確認（検査6）までとする。command/skill 本文の具体参照禁止の持続的検査は project-local skill の対象（AgentDevFlow 標準の対象外）。

検出事項を NG 分類（false positive / pre-existing / 今回修正対象）し、推奨 route を提示する。修正は実行しない。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（検出事項プロトコル）
- [foundations/project-extensions.md](../foundations/project-extensions.md)（project extensions 機構の基盤 SPEC）

## 対象外

- 検査対象の直接修正（G01）
- Issue 作成、PR 作成（G02）
- 自動修正（推奨 route 提示に留める）
- command/skill 本文の具体参照禁止の持続的検査（project-local skill の責務、REQ-0160-046）

## 検証観点

- ファイル変更禁止（G01、`.agentdev/inspect/inbox/inspect-extensions-finding-*.md` 生成は例外）
- 8項目の検査が全て定義されていること
- 配布物参照境界（command 定義本文に具体 ADR/REQ/SPEC ID を持たせない）が遵守されていること

## See Also

- [foundations/project-extensions.md](../foundations/project-extensions.md)（project extensions 基盤 SPEC）
- [skills/agentdev-project-extensions.md](../skills/agentdev-project-extensions.md)（project extensions 読み込み skill SPEC）
- [inspect-promote.md](inspect-promote.md)（検出事項分類、昇格）
- REQ-0160（Project Extensions 機構と配布物参照境界）
- ADR-0135（Project Extensions Architecture）

