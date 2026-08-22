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
- 副作用は検出事項ファイルの生成のみ（Issue/PR作成、worktree作成、intake/learning/RU処理はガードレール G01〜G04 の対象外）

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

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-inspect-docs`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-docs.yaml`、kind: workflow-extension）を読み込む。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-docs` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
同スキルは read-only-diagnostic型（STEP model 対象外、resume point なし）として4工程の control plane を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 スキャン対象の収集 | コマンド起動 | スキャン対象成果物リスト | 対象ディレクトリ不存在時は空扱い警告で継続していること |
| STEP-2 REQ 体系・文書種別別意味診断 | 対象収集済み | 観点別診断結果 | source-of-truth priority（現行 REQ > 承認済み ADR > Design > guides）に従って矛盾判定していること |
| STEP-3 配布物整合性検査・route 判定 | 診断済み | 配布物整合性結果・route 判定 | 検出事項ごとに観点・対象・根拠・推奨routeが揃っていること |
| STEP-4 検出事項出力・永続化・完了報告 | 検出完了 | `.agentdev/inspect/inbox/inspect-docs-finding-*.md`・完了報告 | 検出事項ファイルが finding schema に従っていること |

同スキルは本コマンドの工程経由でのみ利用し、単独の skill 起動は soft guard（REQ-{NNNN}-{NNN}）で抑制する。

**共通ルール**（全工程適用）: エラー処理（スキャン対象ディレクトリ不存在時は該当カテゴリを空扱い警告、ファイル読込失敗時はスキップ警告）

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 診断結果の提示（検出事項、根拠、source-of-truth判定、推奨route）は source-of-truth priority（現行 REQ > 承認済み ADR > Design > guides）に従って矛盾を判定する

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G01: ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成、更新しない
- G03: worktree/ブランチを作成しない
- G04: intake/learning/RU の処理を行わない


