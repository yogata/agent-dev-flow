---
description: docs全体の意味整合性を検出し、検出事項を .agentdev/inspect/inbox/ へ出力する
---

# inspect-docs

docs全体（REQ/Decision/SPEC/guides）の意味整合性を診断し、検出事項を `.agentdev/inspect/inbox/` へ出力するコマンド。
検査対象を直接修正しない診断を行い、REQ structure review（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）に加えて SPEC、ADR、guides、README の意味診断を含む。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断のみを実行する。
許可される副作用は `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示（検出事項、根拠、source-of-truth判定、推奨route）
- `.agentdev/inspect/inbox/` への検出事項出力
- Issue/PR作成、worktree作成、intake/learning/RU処理の禁止

## 入力

- なし（コマンド実行時に全対象成果物を自動スキャン）

## 出力

- 診断結果（セッション内テキスト出力 + `.agentdev/inspect/inbox/` への検出事項ファイル）
  - 検出事項リスト（観点、対象、根拠、source-of-truth判定、推奨route）

## inspect-* コマンド選択 routing

変更ファイル種別に基づき、実行する inspect-* コマンドを選ぶ。
本コマンド（inspect-docs）と inspect-skills は配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`）の検出対象が一部重複する（inspect-docs の配布物整合性検査、inspect-skills の配布物構文健全性・責務整合診断）。変更範囲に応じて routing することで重複検出を防ぐ。

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

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/inspect-docs.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-inspect-docs` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルは read-only-diagnostic型（STEP model 対象外、resume point なし）として4工程の control plane を所有する。

- **STEP-1** スキャン対象の収集 — `docs/requirements/`、`docs/decisions/`、`docs/specs/`、`docs/guides/`、`README.md`、`.opencode/`
- **STEP-2** REQ 体系・文書種別別意味診断 — REQ 参照ID整合性、第一参照導線、現行/廃止/世代境界、6観点 structure review（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）、文書分類一貫性、SPEC/Decision/guides/README 意味診断
- **STEP-3** 配布物整合性検査・route 判定 — 構文健全性・文意保持・責務整合診断、docs-check route 候補提示、未処理 artifact 確認
- **STEP-4** 検出事項出力・永続化・完了報告 — inbox 出力（source-of-truth priority、NG 分類）、実行前同期、`.agentdev/inspect/` commit/push、完了報告

各工程の詳細は `agentdev-workflow-inspect-docs` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。同スキルは本コマンドの工程経由でのみ利用し、単独の skill 起動は soft guard（REQ-{NNNN}-{NNN}）で抑制する。

**共通ルール**（全工程適用、詳細は workflow skill 参照）: エラー処理（スキャン対象ディレクトリ不存在時は該当カテゴリを空扱い警告、ファイル読込失敗時はスキップ警告）

## ガードレール

- G01: ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成、更新しない
- G03: worktree/ブランチを作成しない
- G04: intake/learning/RU の処理を行わない
- G05: source-of-truth priority（現行 REQ > 承認済み ADR > SPEC > guides）に従って矛盾を判定する


