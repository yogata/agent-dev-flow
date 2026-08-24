---
description: docs全体の意味整合性を検出し、検出事項を .agentdev/inspect/inbox/ へ出力する
---

# inspect-docs

docs全体（REQ/Decision/Design/guides）の意味整合性を診断し、検出事項を `.agentdev/inspect/inbox/` へ出力するコマンド。
検査対象を直接修正しない診断を行い、REQ structure review（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）に加えて Design、ADR、guides、README の意味診断を含む。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断のみを実行する。
許可される副作用は `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示（検出事項、根拠、source-of-truth判定、推奨route）
- `.agentdev/inspect/inbox/` への検出事項出力
- 副作用は検出事項ファイルの生成のみ（Issue/PR作成、worktree作成、intake/learning/RU処理は後述のガードレール対象外）

## 入力

- なし（コマンド実行時に全対象成果物を自動スキャン）

## 出力

- 診断結果（セッション内テキスト出力 + `.agentdev/inspect/inbox/` への検出事項ファイル）
  - 検出事項リスト（観点、対象、根拠、source-of-truth判定、推奨route）

## inspect-* コマンド選択 routing

変更ファイル種別に基づき、実行する inspect-* コマンドを選ぶ。
本コマンド（inspect-docs）と inspect-skills は配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`）の検出対象が一部重複する（inspect-docs の配布物整合性検査、inspect-skills の配布物構文健全性・責務整合診断）。
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

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-docs` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。
エラー処理（スキャン対象ディレクトリ不存在時は該当カテゴリを空扱い警告、ファイル読込失敗時はスキップ警告）

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 診断結果の提示（検出事項、根拠、source-of-truth判定、推奨route）は source-of-truth priority（現行 REQ > 承認済み ADR > Design > guides）に従って矛盾を判定する

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成は例外として許可する
- GitHub Issue/PR を作成、更新しない
- worktree/ブランチを作成しない
- intake/learning/RU の処理を行わない


