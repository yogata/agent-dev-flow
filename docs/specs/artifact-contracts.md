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
| Repo-local Command | `.opencode/commands/repo/`（source なし） | Self-hosting repo 専用入口（ADR-0106） | ユーザー起動 | レポート、成果物 |
| Repo-local Skill | `.opencode/skills/repo-*/`（source なし） | Self-hosting repo 専用判断基準（ADR-0106） | Command からの参照 | 判断結果の参照提供 |

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

## Skill Granularity Contract

Skill は以下の条件を全て満たす単位とする（REQ-0103-100）。

| 条件 | 説明 |
|------|------|
| 同一関心 | 解決対象の問題領域が同一 |
| 同一責任境界 | 担う責任の範囲が同一 |
| 同一判断モデル | 判断の仕組み・基準が同一 |
| 矛盾しない `USE FOR` / `DO NOT USE FOR` | 全ての `USE FOR` が同一判断モデルに属し、`DO NOT USE FOR` と矛盾しない |

- 複数の `USE FOR` があっても、同一判断モデル・同一責任境界に属する場合は同一 Skill として扱う（REQ-0103-101）。
- 複数の `USE FOR` が異なる判断モデル・入力・出力・責任境界を持つ場合は、`DO NOT USE FOR` が同じであっても Skill 分割候補とする（REQ-0103-102）。

## Skill Reference Validity Contract

`references/*` は同一 Skill 内の段階的開示であり、小さい Skill ではない（REQ-0103-103）。

- `references/*` は SKILL.md の入口カードから必要に応じて読み込まれる詳細参照ファイル。
- `references/*` ごとに独自の `USE FOR` / `DO NOT USE FOR` が必要になる場合は Skill 分割候補とする（REQ-0103-104）。
- `references/*` に抽出するのは runtime 配布物のみ（REQ-0103-045）。

Command 固有の実行順序・Issue作成・保存・更新・削除・完了報告は Skill 化せず、以下に配置する（REQ-0103-105）。

| 配置先 | 対象 |
|--------|------|
| Command | 実行順序、高レベル Steps、ガードレール |
| Template | 出力本文構造（Issue/PR description、コメント） |
| Script | 決定的でテスト可能な検査・処理 |
| 操作用 Skill | GitHub 操作等の横断的操作の安全手順 |

## Size Constraints

| 種別 | 推奨上限 | 実運用上限 | 例外状態 |
|---|---|---|---|
| Command | 100 行 | 150 行 | 200 行超 |
| SKILL.md | 200 行 | — | docs-check で報告 |
| Steps 数 | 5〜12 個 | — | — |

## Subagent Delegation Contract

サブエージェント委譲は、Command の詳細手順を増やさず、探索・検査・分類・候補抽出を独立した文脈へ分離するために使用する。親エージェントは最終判断と副作用を保持し、サブエージェントは判断材料だけを返す（ADR-0112, REQ-0119）。

### 委譲時最小契約

委譲定義は以下の4要素を中心に記述する。

| 要素 | 説明 |
|---|---|
| `inputs` | 委譲先に渡す限定された入力範囲。対象ファイル、Issue/PR、ログ、参照基準、除外対象を含む |
| `side_effect_boundary` | 委譲先の副作用境界。原則は読み取り専用、保存・Issue/PR更新・commit・push・ユーザー確認は禁止 |
| `output_contract` | 返却形式。`pass` / `warn` / `fail` / `partial` を基本とし、要約、根拠、成果物パス、親判断事項、副作用なしの明示を含む |
| `capture_handoff` | intake / learning 候補を保存せず、capture 候補として親エージェントへ返す形式 |

成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）は verbatim で返す。判定結果、調査過程、中間ログ、読解メモは要約・成果物パス・根拠・親判断事項・capture候補へ圧縮して返す。

### delegation_type 参考分類

`delegation_type` は必須 envelope ではない。必要な場合のみ、委譲の意図を短く示す参考ラベルとして使用する。

| delegation_type | 用途 | 副作用 |
|---|---|---|
| `gate_check` | 完了判定・ガードレール充足確認・保存前/close前検査 | 禁止 |
| `semantic_review` | 文書・差分・REQ/ADR/SPEC の意味レビュー | 禁止 |
| `log_analysis` | テストログ・CIログ・review結果解析 | 禁止 |
| `classification` | artifact / finding / intake / learning の分類 | 禁止 |
| `extraction` | 候補・論点・未回収事項の抽出 | 禁止 |
| `draft_generation` | Issue本文・PR本文・report案などの草案生成 | 禁止 |
| `controlled_case_execution` | case-run Epic / 複数Issue実行 | case-run のみ条件付きで許可 |

Command 本文では分類ラベルより、実際の `inputs`、`side_effect_boundary`、`output_contract`、`capture_handoff` を優先する。

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

### テンプレート種別別参照先

| テンプレート種別 | 参照先（runtime path） | 参照元 |
|---|---|---|
| Issue 説明文 | `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_*.md` | case-open |
| Issue コメント | `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` | case-close, case-update |
| PR 説明文 | `.opencode/skills/agentdev-workflow-templates/templates/pr_desc.md` | case-run |
| 完了報告 | `.opencode/commands/agentdev/templates/{command}/{variant}.md` | 各コマンド |

- runtime command は上記 runtime path（`.opencode/...`）からテンプレートを参照すること
- `src/opencode/...` は source 配置・install-sync 入力・authoring context に限定し、runtime 実行時の参照先として使用しない

## Completion Report Contract

全 agentdev コマンドの完了報告に適用する共通契約を定義する（REQ-0107-012, REQ-0107-013）。

### 共通必須フィールド

各完了報告テンプレートは以下の6フィールドをすべて含むこと。

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
- **重複禁止**: `結果` 欄と `git 永続化` 欄で同一事実を重複記載してはならない。

### 出力順序ルール

完了報告ステップにおいて以下の順序を守ること。

1. **TodoWrite 更新（先）**: TodoWrite の「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite 更新と完了報告テキストの間に、他の中間出力を挟まない

### 汎用締め文の禁止

完了報告では以下の汎用締め文を禁止する。

- 「次にやるべきことがあれば指示してください」
- 「他にご要望があればお知らせください」
- 「何かあればお気軽にどうぞ」
- その他、ユーザーへの次回アクション委譲を促す汎用的な文言

各コマンドの完了報告には `次のコマンド` フィールドまたは終端として明示的な完了宣言が含まれるため、汎用締め文は不要である。

### 完了報告後の追加出力禁止

完了報告テキストを出力した後、追加のテキスト・説明・サマリーを出力してはならない。完了報告がコマンドの最終出力である。

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書である（ADR-0103）。他プロジェクトへの適用を意図しない。runtime command は SPEC ファイルに依存しない（ADR-0104）。

## Repo-Local Artifacts（ADR-0106）

配布対象外コマンド/スキルは AgentDevFlow の配布対象外である:
- `.opencode/commands/repo/` — AgentDevFlow本体リポジトリ専用コマンド。`src/opencode/` に原本を持たず、sync-opencode.ps1 の junction 管理対象外
- `.opencode/skills/repo-*/` — AgentDevFlow本体リポジトリ専用スキル。同上
- `repo-*` prefix は AgentDevFlow 配布コマンド体系（`agentdev-*`）とは独立に管理される

## Draft Artifact Contract（REQ-0103-129〜139）

`.agentdev/drafts/` 配下の中間成果物（draft file）の契約を定義する。draft file は canonical artifact（REQ/ADR/SPEC/RU）ではなく、command 間で受け渡す中間成果物である（REQ-0103-126-128）。

### Draft Type Registry

各 draft type は registry 側で以下を定義する（REQ-0103-130）。producer / allowed consumers は個別 draft file の frontmatter ではなく、registry 側でのみ定義する（REQ-0103-136）。

| draft_type | file pattern | producer | allowed consumers | 位置づけ | lifecycle |
|---|---|---|---|---|---|
| `req_draft` | `.agentdev/drafts/req-draft-{topic}.md` | `req-define` | `req-save`, `case-open` | 保存前の要件ドラフト | case-open の Issue 作成 + VERIFY 成功後に削除 |

標準 draft type は `req_draft` の1種のみとする（REQ-0103-132）。`requirements-review-finding` および旧 `skill_review_finding` は標準 draft type に含めない。Skill/Command 参照妥当性の検出結果は inspect lifecycle（`.agentdev/inspect/inbox/`、REQ-0103-140-151）へ出力する。

### Draft File Frontmatter

`.agentdev/drafts/` 配下の draft file は、以下の frontmatter を基本とする（REQ-0103-135）:

```yaml
---
draft_type: req_draft
topic: example-topic
status: draft
created_at: 2026-06-14T19:36:47+09:00
---
```

frontmatter に `producer`・`consumer`・`next` を必須化しない（REQ-0103-136）。これらは `draft_type` から導出可能であり、registry 側で定義される。

### Command-Side draft_type 検証

各 command は、入力 draft の `draft_type` が自 command の allowed input に該当するかを確認する（REQ-0103-131）。producer / consumer / next を個別 file frontmatter から読んで整合性判定する必要はない。

| command | 受け付ける draft_type |
|---|---|
| `req-save` | `req_draft` |
| `case-open` | `req_draft` |

### inspect-skills Side Effect 境界

`inspect-skills` は read-only 診断 command とする。許可される side effect は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成のみとし、それ以外のファイル変更・canonical docs 変更・REQ/ADR/SPEC 変更・Command/Skill/Template/Script 変更・RU 保存・Issue 作成・PR 作成・commit・push を行わない（inspect lifecycle、REQ-0103-140-151）。inspect finding は `inspect-promote` による promote/defer/reject lifecycle の対象となる。
