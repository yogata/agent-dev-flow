# Artifact Contracts Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

Command / Skill / Template / Script の入出力契約と依存方向を定義し、アーティファクト間の責務境界を明確にする（REQ-0103）。

## Artifact Types

| 種別 | 配置先 | 責務 | 入力 | 出力 |
|---|---|---|---|---|
| Command | `.opencode/commands/agentdev/` | ユーザー向け入口、入出力、ガードレール、高レベル Steps | ユーザー起動、GitHub Issue | PR、Issue 更新、完了報告 |
| Skill | `.opencode/skills/` | 再利用可能な判断基準、domain knowledge | Command からの参照 | 判断結果の参照提供 |
| Template | `.opencode/skills/*/templates/` | 出力構造とプレースホルダー | 変数バインド | Issue/PR 本文、コメント |
| Script | `.opencode/skills/*/scripts/` | 決定的でテスト可能な実行ロジック | コマンドライン引数 | 標準出力（JSON/Markdown） |

## Dependency Direction

依存方向は Command → Skill の一方向とする。Skill は Command を参照しない。

```
Command ──→ Skill ──→ Reference (references/)
   │             │
   │             └──→ Script (scripts/)
   │                    └──→ Template (templates/)
   │
   └──→ Template（直接参照の場合あり）
```

- Command は Skill を参照して判断基準を得る。
- Skill は Reference（`references/`）に詳細を分離する。
- Script は Skill 配下に配置し、Command から間接的に利用される。
- Template は Skill 配下に配置し、Command または Skill から利用される。

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

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書である（ADR-0017）。他プロジェクトへの適用を意図しない。runtime command は SPEC ファイルに依存しない（ADR-0018）。
