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
- 正規文書変更、REQ/Decision/SPEC 変更、Command/Skill/Template/Script 変更、Issue作成、PR作成、RU保存、branch、worktree 操作の禁止

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
本コマンド（inspect-skills）と inspect-docs は配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`）の検出対象が一部重複する（inspect-skills の配布物構文健全性・責務整合診断、inspect-docs の配布物整合性検査）。変更範囲に応じて routing することで重複検出を防ぐ。

| 変更ファイル種別 | 実行コマンド |
|------|------|
| `docs/requirements/<*>.md`、`docs/decisions/<*>.md` | inspect-docs |
| `docs/specs/<**/*>.md`（`docs/specs/commands/`、`docs/specs/skills/` 配下を除く） | inspect-docs |
| `docs/guides/*.md`、`README.md` | inspect-docs |
| `.opencode/commands/**/*.md`、`.opencode/skills/**/*.md` | inspect-skills |
| `.opencode/commands/**/*.md`、`.opencode/skills/**/*.md`（実行時プロジェクション） | inspect-skills |
| `docs/specs/<commands/**/*>.md`、`docs/specs/<skills/**/*>.md` | inspect-skills |
| 上記両方（docs と command/skill にまたがる変更） | inspect-docs を先に実行し、続けて inspect-skills を実行 |

routing は実行コマンド選択の目安であり、各コマンドの検出対象（既定のスキャン範囲）は変更しない。配布物のみの変更時は inspect-skills を優先する。

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/inspect-skills.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-skills` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルは read-only-diagnostic型（STEP model 対象外、resume point なし）として3工程の control plane を所有する。

- **STEP-1** 診断対象の読込 — Command/ Skill 定義の把握（Command→Skill 参照、Skill frontmatter、本文構造、references 利用、template/ script 参照）
- **STEP-2** 診断観点の評価・分類・route 提示 — 参照妥当性、粒度、段階的開示、責務境界、canonical name、内部構造依存の評価、配布物構文健全性・責務整合診断、診断分類ラベル付与、推奨 route 提示（修正は実行しない）
- **STEP-3** 検出事項出力・永続化・完了報告 — inbox 出力、実行前同期、`.agentdev/inspect/` commit/push、完了報告

各工程の詳細は `agentdev-workflow-inspect-skills` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。同スキルは本コマンドの工程経由でのみ利用し、単独の skill 起動は soft guard（REQ-{NNNN}-{NNN}）で抑制する。

**共通ルール**（全工程適用、詳細は workflow skill 参照）: エラー処理（対象ファイル不存在時は空扱い警告、読込失敗時はスキップ警告、参照先 Skill 不存在時は検出事項として報告）

## ガードレール

- G01: ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成、更新しない
- G03: RU、intake、learning、backlog 成果物を保存しない
- G04: commit/ push は `.agentdev/inspect/` 配下の永続化のみ許可。branch/ worktree 操作は禁止
- G05: 自動修正せず、推奨 route の提示に留める


