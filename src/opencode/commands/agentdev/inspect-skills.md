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
- 副作用は検出事項ファイルの生成のみ（正規文書・REQ/Decision/SPEC・Command/Skill/Template/Script への変更、Issue/PR作成、RU保存、branch、worktree 操作はガードレール G01〜G04 の対象外）

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

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-inspect-skills`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-skills.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-skills` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
同スキルは read-only-diagnostic型（STEP model 対象外、resume point なし）として3工程の control plane を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 診断対象の読込 | コマンド起動（Command/Skill 定義ファイル群） | 診断対象リスト | 対象ファイル不存在時は空扱い警告、読込失敗時はスキップ警告で継続していること |
| STEP-2 診断観点の評価・分類・route 提示 | 読込済み | 観点別評価結果・分類・推奨 route | 参照先 Skill 不存在時は検出事項として報告されていること |
| STEP-3 検出事項出力・永続化・完了報告 | 評価完了 | `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`・完了報告 | 検出事項（対象、観点、分類、根拠、推奨 route）が finding schema に従っていること |

同スキルは本コマンドの工程経由でのみ利用し、単独の skill 起動は soft guard（REQ-{NNNN}-{NNN}）で抑制する。

**共通ルール**（全工程適用）: エラー処理（対象ファイル不存在時は空扱い警告、読込失敗時はスキップ警告、参照先 Skill 不存在時は検出事項として報告）

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 診断は検出と推奨 route の提示までとし、修正は後続の処置（inspect-promote、各正規所有者）に委ねる

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G01: ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成、更新しない
- G03: RU、intake、learning、backlog 成果物を保存しない
- G04: commit/ push は `.agentdev/inspect/` 配下の永続化のみ許可。branch/ worktree 操作は禁止


