---
description: Command→Skill 参照妥当性と Skill 構造を、検査対象を直接修正せずに診断する
---

# inspect-skills

Command→Skill 参照妥当性と Skill 構造を、検査対象を直接修正せずに診断し、検出事項、分類、根拠、推奨経路を提示する。
診断結果は `.agentdev/inspect/inbox/` へ出力する。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断を基本とし、許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示
- 根拠と推奨経路の提示
- 副作用は検出事項ファイルの生成のみ（正規文書・REQ/Decision/Design・Command/Skill/Template/Script への変更、Issue/PR作成、RU保存、branch、worktree 操作は後述のガードレール対象外）

## 入力

- Command 定義ファイル群
- Skill 定義ファイル群
- 必要に応じて関連する template/ reference/ script ファイル群

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨経路）
- `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`（検出事項ファイル出力）

## inspect-* コマンド選択 routing

変更ファイル種別に基づく inspect-* コマンドの選択表と振り分け規律（本コマンドと inspect-docs の配布物検出対象の重複の扱いを含む）は、`agentdev-workflow-lifecycle` スキル「共通報告・Decision・自律確定規約」節「inspect-* コマンド選択 routing」を正本として参照する。

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-skills` スキルへ委譲する（責務3層分化と1:N分割原則、検出コマンド実行契約要件）。
工程、分岐、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。
エラー処理（対象ファイル不存在時は空扱い警告、読込失敗時はスキップ警告、参照先 Skill 不存在時は検出事項として報告）も同スキルが所有する。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 診断は検出と推奨経路の提示までとし、修正は後続の処置（inspect-promote、各正規所有者）に委ねる

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成は例外として許可する
- GitHub Issue/PR を作成、更新しない
- RU、intake、learning、backlog 成果物を保存しない
- commit/ push は `.agentdev/inspect/` 配下の永続化のみ許可。branch/ worktree 操作は禁止


