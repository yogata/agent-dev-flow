---
description: Command→Skill 参照妥当性と Skill 構造を、検査対象を直接修正せずに診断する
---

# inspect-skills

Command→Skill 参照妥当性と Skill 構造を検査対象を直接修正せずに診断し、検出事項、分類、根拠、推奨 route を提示する。
診断結果は `.agentdev/inspect/inbox/` へ出力する。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断を基本とし、許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示
- 根拠と推奨 route の提示
- 副作用は検出事項ファイルの生成のみ（正規文書・REQ/Decision/Design・Command/Skill/Template/Script への変更、Issue/PR作成、RU保存、branch、worktree 操作はガードレール G01〜G04 の対象外）

## 入力

- Command 定義ファイル群
- Skill 定義ファイル群
- 必要に応じて関連する template/ reference/ script ファイル群

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`（検出事項ファイル出力）

## inspect-* コマンド選択 routing

変更ファイル種別に基づき、実行する inspect-* コマンドを選ぶ。
本コマンド（inspect-skills）と inspect-docs は配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`）の検出対象が一部重複する（inspect-skills の配布物構文健全性・責務整合診断、inspect-docs の配布物整合性検査）。
変更範囲に応じて routing することで重複検出を防ぐ。

| 変更ファイル種別 | 実行コマンド |
|------|------|
| `docs/requirements/<*>.md`、`docs/decisions/<*>.md` | inspect-docs |
| `docs/designs/<**/*>.md`（`docs/designs/commands/`、`docs/designs/skills/` 配下を除く） | inspect-docs |
| `docs/guides/*.md`、`README.md` | inspect-docs |
| `.opencode/commands/**/*.md`、`.opencode/skills/**/*.md` | inspect-skills |
| `.opencode/commands/**/*.md`、`.opencode/skills/**/*.md`（実行時プロジェクション） | inspect-skills |
| `docs/designs/<commands/**/*>.md`、`docs/designs/<skills/**/*>.md` | inspect-skills |
| 上記両方（docs と command/skill にまたがる変更） | inspect-docs を先に実行し、続けて inspect-skills を実行 |

routing は実行コマンド選択の目安であり、各コマンドの検出対象（既定のスキャン範囲）は変更しない。
配布物のみの変更時は inspect-skills を優先する。

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-skills` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。
エラー処理（対象ファイル不存在時は空扱い警告、読込失敗時はスキップ警告、参照先 Skill 不存在時は検出事項として報告）

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 診断は検出と推奨 route の提示までとし、修正は後続の処置（inspect-promote、各正規所有者）に委ねる

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G01: ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成、更新しない
- G03: RU、intake、learning、backlog 成果物を保存しない
- G04: commit/ push は `.agentdev/inspect/` 配下の永続化のみ許可。branch/ worktree 操作は禁止


