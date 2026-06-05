# Artifact Contracts Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

Command / Skill / Template / Script の入出力契約と依存方向を定義し、アーティファクト間の責務境界を明確にする（REQ-0103）。

## Artifact Types

| 種別 | 配置先 | 責務 | 入力 | 出力 |
|---|---|---|---|---|
| Command | `src/opencode/commands/agentdev/`（runtime: `.opencode/commands/agentdev/`） | ユーザー向け入口、入出力、ガードレール、高レベル Steps | ユーザー起動、GitHub Issue | PR、Issue 更新、完了報告 |
| Skill | `src/opencode/skills/`（runtime: `.opencode/skills/`） | 再利用可能な判断基準、domain knowledge | Command からの参照 | 判断結果の参照提供 |
| Template | `src/opencode/skills/*/templates/` または `src/opencode/commands/agentdev/templates/`（runtime: `.opencode/` 経由） | 出力構造とプレースホルダー | 変数バインド | Issue/PR 本文、コメント |
| Script | `src/opencode/skills/*/scripts/`（runtime: `.opencode/` 経由） | 決定的でテスト可能な実行ロジック | コマンドライン引数 | 標準出力（JSON/Markdown） |

## Dependency Direction

依存方向は Command → Skill の一方向とする。Skill は Command を参照しない。

```
Command ──→ Skill ──→ Reference (references/)
   │             │
   │             └──→ Script (scripts/)
   │                    └──→ Template (templates/)
   │
   ├──→ Command-local Template (templates/{command}/)
   │
   └──→ Template（直接参照の場合あり）
```

- Command は Skill を参照して判断基準を得る。
- Skill は Reference（`references/`）に詳細を分離する。
- Script は Skill 配下に配置し、Command から間接的に利用される。
- Template は Skill 配下に配置し、Command または Skill から利用される。
- Command は独自の完了報告テンプレートを command-local templates に配置できる。

## Command Frontmatter Contract

```yaml
---
description: コマンドの簡潔な説明
agent: prometheus | sisyphus
---
```

許可フィールドは `description` と `agent` のみ。`implementation_pattern`、`secondary_pattern`、`load_skills` 等の dev メタデータは含めない（REQ-0103-015, REQ-0103-044）。

## Skill Structure Contract

```
<skill-name>/
  SKILL.md              # 入口カード（目的・使用条件・禁止条件・参照先）
  references/           # 詳細参照ファイル（runtime 配布物のみ）
  scripts/              # 決定的処理スクリプト
  templates/            # 出力構造テンプレート
```

- `SKILL.md` は progressive disclosure の入口。200 行超で分割を検討。
- `references/`（複数形）が canonical。`reference/`（単数形）は obsolete 扱い。
- `references/` は runtime 配布物のみを含める。authoring-only 資料は含めない（REQ-0103-045）。

## Size Constraints

| 種別 | 推奨上限 | 実運用上限 | 例外状態 |
|---|---|---|---|
| Command | 100 行 | 150 行 | 200 行超 |
| SKILL.md | 200 行 | — | integrity-check で報告 |
| Steps 数 | 5〜12 個 | — | — |

## Template Placement Contract

Template の配置先は以下の2種類を定義する（REQ-0103-046）。

### Skill-local templates

- **配置先**: `.opencode/skills/{skill-name}/templates/`
- **用途**: Skill 内部で利用するテンプレート（Git worktree 操作、整合性検査等）
- **参照元**: 当該 Skill または Command から Skill 経由で利用

### Command-local templates

- **配置先**: `.opencode/commands/agentdev/templates/{command}/{variant}.md`
- **用途**: コマンド完了報告テンプレート等、コマンドに固有の出力構造
- **参照元**: 当該 Command が直接参照
- **命名規則**: `{command}` はコマンド名（`case-close`, `case-run` 等）、`{variant}` はバリアント名（`standard`, `epic` 等）

### 移行メモ

完了報告テンプレートは Skill-local（`.opencode/skills/agentdev-workflow-reporting/templates/`）から Command-local（`.opencode/commands/agentdev/templates/`）へ移行する。移行完了後、Skill-local の完了報告テンプレートは削除する。

## Completion Report Contract

全 agentdev コマンドの完了報告に適用する共通契約を定義する（REQ-0107-012, REQ-0107-013）。

### 共通必須フィールド

各完了報告テンプレートは以下の6フィールドをすべて含むこと（MUST）。

| # | フィールド | 説明 |
|---|-----------|------|
| 1 | 完了コマンド | 実行したコマンドのフルパス（例: `/agentdev/case-close`） |
| 2 | 対象 | 操作対象の識別子（Issue番号、PR番号、ファイルパス等） |
| 3 | 結果 | ユーザー視点・ドメイン視点の成果（Issue作成、PR作成、REQ/ADR保存等）。commit hash、push成否、HEAD同期確認等の git 操作結果は含めない |
| 4 | 検証結果 | `✅ OK` / `⚠️ 注意` / `❌ NG` のいずれか |
| 5 | git 永続化 | git 操作結果のみ。記載形式: `該当なし` / `変更なし（commit/push スキップ）` / `✅ OK（commit {hash}, push 済み）` 等 |
| 6 | 次のコマンド | 後続コマンドのフルパス、または「なし」（終端コマンドの場合） |

### 責務境界

- **`結果` フィールド**: ドメイン成果（Issue作成、PR作成、RU生成等）に限定。git 操作結果は含めない。
- **`git 永続化` フィールド**: git 操作結果（commit、push、HEAD同期等）に限定。ドメイン成果は含めない。
- **重複禁止**: `結果` 欄と `git 永続化` 欄で同一事実を重複記載してはならない（MUST NOT）。

### 出力順序ルール

完了報告ステップにおいて以下の順序を守ること（MUST）。

1. **TodoWrite 更新（先）**: TodoWrite の「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite 更新と完了報告テキストの間に、他の中間出力を挟まない

### 汎用締め文の禁止

完了報告では以下の汎用締め文を禁止する（MUST NOT）。

- 「次にやるべきことがあれば指示してください」
- 「他にご要望があればお知らせください」
- 「何かあればお気軽にどうぞ」
- その他、ユーザーへの次回アクション委譲を促す汎用的な文言

各コマンドの完了報告には `次のコマンド` フィールドまたは終端として明示的な完了宣言が含まれるため、汎用締め文は不要である。

### 完了報告後の追加出力禁止

完了報告テキストを出力した後、追加のテキスト・説明・サマリーを出力してはならない（MUST NOT）。完了報告がコマンドの最終出力である。

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書である（ADR-0017）。他プロジェクトへの適用を意図しない。runtime command は SPEC ファイルに依存しない（ADR-0018）。
