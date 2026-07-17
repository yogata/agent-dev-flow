---
description: Command→Skill 参照妥当性と Skill 構造を、検査対象を直接修正せずに診断する
agent: sisyphus
---

# inspect-skills

Command→Skill 参照妥当性と Skill 構造を検査対象を直接修正せずに診断し、検出事項、分類、根拠、推奨 route を提示する。
診断結果は `.agentdev/inspect/inbox/` へ出力する。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断を基本とし、許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示
- 根拠と推奨 route の提示
- 正規文書変更、REQ/ADR/SPEC 変更、Command/Skill/Template/Script 変更、Issue作成、PR作成、RU保存、branch、worktree 操作の禁止

## 入力

- Command 定義ファイル群
- Skill 定義ファイル群
- 必要に応じて関連する template/ reference/ script ファイル群

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`（検出事項ファイル出力）

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/inspect-skills.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 手順

### Step 1: 診断対象の読込

Command/ Skill 定義を読み込み、Command→Skill 参照、Skill frontmatter、本文構造、references 利用、template/ script 参照を把握する
### Step 2: 各診断観点の評価

`agentdev-inspect-skills` に従い、参照妥当性、粒度、段階的開示、責務境界、canonical name、内部構造依存を評価する
### Step 3: 配布物構文健全性、責務整合診断

配布物（`src/opencode/commands/agentdev/`、`src/opencode/skills/agentdev-*/`）について、docs-spec-rebuild-integrity SPEC（extension 経由）が定義する検査パターンのうち Command/Skill 構造に関わる観点（frontmatter 重複、見出し重複、Markdown 構文破損、壊れた括弧、command と関連 skill 間の責務説明矛盾）を `agentdev-inspect-skills` に従って診断する
### Step 4: 分類

検出事項ごとに診断分類ラベルを付与する。NG 分類（false positive/ pre-existing/ 今回修正対象）は docs-spec-rebuild-integrity SPEC（extension 経由）の NG 分類表に従い、各検出事項に分類、理由、後続対象を付ける
### Step 5: route 提示

修正は実行せず、推奨 route を提示する
### Step 6: 検出事項出力

検出事項を `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md` へ出力
### Step 7: 実行前同期（git pull --ff-only）

 - `git pull --ff-only` を実行
 - **失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（自動解消しない）
### Step 8: .agentdev/inspect/ 変更の commit と push

`agentdev-git-worktree` の「ドメイン状態永続化プロシージャ」（`references/git-common-procedures.md` Section 2、並列実行安全ステージングプロシージャ含む）に従い、`.agentdev/inspect/` 配下の変更を commit/ push する。commit message は `chore(agentdev): capture inspect-skills finding`（Conventional Commits 形式）。変更なし時は commit/push せず完了報告で「変更なし」と報告する。push 失敗時は同プロシージャの構造化エラー形式で停止する（完了扱いにしない）
### Step 9: 完了報告

完了報告 template に従って出力

## ガードレール

- G01: ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成、更新しない
- G03: RU、intake、learning、backlog 成果物を保存しない
- G04: commit/ push は `.agentdev/inspect/` 配下の永続化のみ許可。branch/ worktree 操作は禁止
- G05: 自動修正せず、推奨 route の提示に留める

## エラー処理

| エラー | 対処 |
|--------|------|
| 対象ファイルが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| 参照先 Skill が存在しない | 検出事項として報告し、canonical name の確認を推奨 |


