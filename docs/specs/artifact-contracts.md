---
updated: 2026-06-21
---

# アーティファクト契約

> **Scope**: 本 SPEC は agent-dev-flow リポジトリのみに適用される。

## 目的

Command / Skill / Template / Script の入出力契約と依存方向を定義し、アーティファクト間の責務境界を明確にする（REQ-0103）。

## アーティファクト種別

| 種別 | 配置先 | 責務 | 入力 | 出力 |
|---|---|---|---|---|
| Command | `src/opencode/commands/agentdev/`（実行時: `.opencode/commands/agentdev/`） | ユーザー向け入口、入出力、ガードレール、高レベル Steps | ユーザー起動、GitHub Issue | PR、Issue 更新、完了報告 |
| Skill | `src/opencode/skills/`（実行時: `.opencode/skills/`） | 再利用可能な判断基準、ドメイン知識 | Command からの参照 | 判断結果の参照提供 |
| Template | `src/opencode/skills/*/templates/` または `src/opencode/commands/agentdev/templates/`（実行時: `.opencode/` 経由） | 出力構造とプレースホルダー | 変数バインド | Issue/PR 本文、コメント |
| Script | `src/opencode/skills/*/scripts/`（実行時: `.opencode/` 経由） | 決定的でテスト可能な実行ロジック | コマンドライン引数 | 標準出力（JSON/Markdown） |
| リポジトリローカル Command | `.opencode/commands/repo/`（原本なし） | 本体リポジトリ専用入口（ADR-0106） | ユーザー起動 | レポート、成果物 |
| リポジトリローカル Skill | `.opencode/skills/repo-*/`（原本なし） | 本体リポジトリ専用判断基準（ADR-0106） | Command からの参照 | 判断結果の参照提供 |

## 依存方向

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

## コマンドフロントマター契約

```yaml
---
description: コマンドの簡潔な説明
agent: prometheus | sisyphus
---
```

許可フィールドは `description` と `agent` のみ。dev メタデータは含めない（REQ-0103-015, REQ-0103-044）。

## スキル構造契約

```
<skill-name>/
  SKILL.md              # 入口カード（目的・使用条件・禁止条件・参照先）
  references/           # 詳細参照ファイル（実行時配布物のみ）
  scripts/              # 決定的処理スクリプト
  templates/            # 出力構造テンプレート
```

- `SKILL.md` は段階的開示（progressive disclosure）の入口。200 行超で分割を検討。
- `references/`（複数形）を正規ディレクトリ名として使用する。
- `references/` は実行時配布物のみを含める。執筆専用資料は含めない（REQ-0103-045）。

## スキル粒度契約

Skill は以下の条件を全て満たす単位とする（REQ-0103-100）。

| 条件 | 説明 |
|------|------|
| 同一関心 | 解決対象の問題領域が同一 |
| 同一責任境界 | 担う責任の範囲が同一 |
| 同一判断モデル | 判断の仕組み・基準が同一 |
| 矛盾しない `USE FOR` / `DO NOT USE FOR` | 全ての `USE FOR` が同一判断モデルに属し、`DO NOT USE FOR` と矛盾しない |

- 複数の `USE FOR` があっても、同一判断モデル・同一責任境界に属する場合は同一 Skill として扱う（REQ-0103-101）。
- 複数の `USE FOR` が異なる判断モデル・入力・出力・責任境界を持つ場合は、`DO NOT USE FOR` が同じであっても Skill 分割候補とする（REQ-0103-102）。

## スキル参照妥当性契約

`references/*` は同一 Skill 内の段階的開示であり、小さい Skill ではない（REQ-0103-103）。

- `references/*` は SKILL.md の入口カードから必要に応じて読み込まれる詳細参照ファイル。
- `references/*` ごとに独自の `USE FOR` / `DO NOT USE FOR` が必要になる場合は Skill 分割候補とする（REQ-0103-104）。
- `references/*` に抽出するのは実行時配布物のみ（REQ-0103-045）。

Command 固有の実行順序・Issue 作成・保存・更新・削除・完了報告は Skill 化せず、以下に配置する（REQ-0103-105）。

| 配置先 | 対象 |
|--------|------|
| Command | 実行順序、高レベル Steps、ガードレール |
| Template | 出力本文構造（Issue/PR description、コメント） |
| Script | 決定的でテスト可能な検査・処理 |
| 操作用 Skill | GitHub 操作等の横断的操作の安全手順 |

## サイズ制約

| 種別 | 推奨上限 | 実運用上限 | 例外状態 |
|---|---|---|---|
| Command | 100 行 | 150 行 | 200 行超 |
| SKILL.md | 200 行 | — | docs-check で報告 |
| Steps 数 | 5〜12 個 | — | — |

## サブエージェント委譲契約

サブエージェント委譲は、Command の詳細手順を増やさず、探索・検査・分類・候補抽出を独立した文脈へ分離するために使用する。親エージェントは最終判断と副作用を保持し、サブエージェントは判断材料だけを返す（ADR-0112, REQ-0119）。

### 委譲時最小契約

委譲定義は以下の 4 要素を中心に記述する。

| 要素 | 説明 |
|---|---|
| `inputs` | 委譲先に渡す限定された入力範囲。対象ファイル、Issue/PR、ログ、参照基準、除外対象を含む |
| `side_effect_boundary`（副作用境界） | 委譲先の副作用境界。許可操作は `read_files`（ファイル読み取り）/ `inspect_content`（内容検査）/ `return_evidence`（根拠返却）等に限定し、保存・Issue/PR 更新・commit・push・ユーザー確認は禁止。包括値 `read_only` は使用しない（REQ-0140-011） |
| `output_contract`（出力契約） | 返却形式。`pass` / `warn` / `fail` / `partial` を基本とし、要約、根拠、成果物パス、親判断事項、副作用なしの明示を含む |
| `capture_handoff`（キャプチャ引き継ぎ） | intake / learning 候補を保存せず、capture 候補として親エージェントへ返す形式 |

成果物本文（Issue 本文、PR 本文、commit message、保存対象ファイル本文、テンプレート成果物）はそのまま（verbatim）返す。判定結果、調査過程、中間ログ、読解メモは要約・成果物パス・根拠・親判断事項・capture 候補へ圧縮して返す。

### delegation_type 参考分類

`delegation_type`（委譲種別）は必須の envelope ではない。必要な場合のみ、委譲の意図を短く示す参考ラベルとして使用する。

| delegation_type | 用途 | 副作用 |
|---|---|---|
| `gate_check`（ゲート検査） | 完了判定・ガードレール充足確認・保存前/close 前検査 | 禁止 |
| `semantic_review`（意味レビュー） | 文書・差分・REQ/ADR/SPEC の意味レビュー | 禁止 |
| `log_analysis`（ログ解析） | テストログ・CI ログ・review 結果解析 | 禁止 |
| `classification`（分類） | アーティファクト / 検出事項 / intake / learning の分類 | 禁止 |
| `extraction`（抽出） | 候補・論点・未回収事項の抽出 | 禁止 |
| `draft_generation`（草案生成） | Issue 本文・PR 本文・レポート案などの草案生成 | 禁止 |
| `controlled_case_execution`（統御下ケース実行） | case-run Epic / 複数 Issue 実行 | case-run のみ条件付きで許可 |

Command 本文では分類ラベルより、実際の `inputs`、`side_effect_boundary`、`output_contract`、`capture_handoff` を優先する。

## テンプレート配置契約

Template の配置先は以下の 2 種類を定義する（REQ-0103-046）。

### Skill-local templates

- **配置先**: `.opencode/skills/{skill-name}/templates/`
- **用途**: Skill 内部で利用するテンプレート（Git worktree 操作、整合性検査等）
- **参照元**: 当該 Skill または Command から Skill 経由で利用

### Command-local templates

- **配置先**: `.opencode/commands/agentdev/templates/{command}/{variant}.md`
- **用途**: コマンド完了報告テンプレート等、コマンドに固有の出力構造
- **参照元**: 当該 Command が直接参照
- **命名規則**: `{command}` はコマンド名（`case-close`, `case-run` 等）、`{variant}` は種別名（`standard`, `epic` 等）

### テンプレート種別別参照先

| テンプレート種別 | 参照先（実行時パス） | 参照元 |
|---|---|---|
| Issue 説明文 | `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_*.md` | case-open |
| Issue コメント | `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` | case-close, case-update |
| PR 説明文 | `.opencode/skills/agentdev-workflow-templates/templates/pr_desc.md` | case-run |
| 完了報告 | `.opencode/commands/agentdev/templates/{command}/{variant}.md` | 各コマンド |

- 実行時コマンドは上記実行時パス（`.opencode/...`）からテンプレートを参照すること
- `src/opencode/...` は原本配置・install-sync 入力・執筆コンテキストに限定し、実行時の参照先として使用しない

## 完了報告契約

全 agentdev コマンドの完了報告に適用する共通契約を定義する（REQ-0107-012, REQ-0107-013）。

### 共通必須フィールド

各完了報告テンプレートは以下の 6 フィールドをすべて含むこと。

| # | フィールド | 説明 |
|---|-----------|------|
| 1 | 完了コマンド | 実行したコマンドのフルパス（例: `/agentdev/case-close`） |
| 2 | 対象 | 操作対象の識別子（Issue 番号、PR 番号、ファイルパス等） |
| 3 | 結果 | ユーザー視点・ドメイン視点の成果（Issue 作成、PR 作成、REQ/ADR 保存等）。commit hash、push 成否、HEAD 同期確認等の git 操作結果は含めない |
| 4 | 検証結果 | `✅ OK` / `⚠️ 注意` / `❌ NG` のいずれか |
| 5 | git 永続化 | git 操作結果のみ。記載形式: `該当なし` / `変更なし（commit/push スキップ）` / `✅ OK（commit {hash}, push 済み）` 等 |
| 6 | 次のコマンド | 後続コマンドのフルパス、または「なし」（終端コマンドの場合） |

### 責務境界

- **`結果` フィールド**: ドメイン成果（Issue 作成、PR 作成、RU 生成等）に限定。git 操作結果は含めない。
- **`git 永続化` フィールド**: git 操作結果（commit、push、HEAD 同期等）に限定。ドメイン成果は含めない。
- **重複禁止**: `結果` 欄と `git 永続化` 欄で同一事実を重複記載してはならない。

### 出力順序ルール

完了報告ステップにおいて以下の順序を守ること。

1. **TodoWrite 更新（先）**: TodoWrite の「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite 更新と完了報告テキストの間に、他の中間出力を挟まない

### 汎用締め文の取り扱い

完了報告には `次のコマンド` フィールドまたは終端として明示的な完了宣言を含める。明示的な完了宣言があるため、以下の汎用締め文に頼る必要はない。

- 「次にやるべきことがあれば指示してください」
- 「他にご要望があればお知らせください」
- 「何かあればお気軽にどうぞ」
- その他、ユーザーへの次回アクション委譲を促す汎用的な文言

各コマンドの完了報告には `次のコマンド` フィールドまたは終端として明示的な完了宣言が含まれるため、汎用締め文は不要である。

### 完了報告の最終性

完了報告がコマンドの最終出力である。完了報告テキストを出力した後は、追加のテキスト・説明・サマリーを出力しない。

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（ADR-0103）。他プロジェクトへの適用を意図しない。実行時コマンドは SPEC ファイルに依存しない（ADR-0104）。

## リポジトリローカルアーティファクト（ADR-0106）

配布対象外コマンド/スキルは AgentDevFlow の配布対象外である:
- `.opencode/commands/repo/` — AgentDevFlow 本体リポジトリ専用コマンド。`src/opencode/` に原本を持たず、sync-opencode.ps1 のジャンクション管理対象外
- `.opencode/skills/repo-*/` — AgentDevFlow 本体リポジトリ専用スキル。同上
- `repo-*` プレフィックスは AgentDevFlow 配布コマンド体系（`agentdev-*`）とは独立に管理される

## ドラフトアーティファクト契約（REQ-0103-129〜139）

`.agentdev/drafts/` 配下の中間成果物（draft file）の契約を定義する。draft file は原本アーティファクト（REQ/ADR/SPEC/RU）ではなく、コマンド間で受け渡す中間成果物である（REQ-0103-126-128）。

### ドラフト種別レジストリ（Draft Type Registry）

各 draft type（ドラフト種別）はレジストリ側で生成元（producer）・許可消費元（allowed consumers）・ライフサイクルを定義する（REQ-0103-130, REQ-0103-136）。個別 draft file の frontmatter にはこれらを記述せず、レジストリを唯一の定義源とする。

| draft_type | file pattern | producer | allowed consumers | 位置づけ | lifecycle |
|---|---|---|---|---|---|
| `req_draft` | `.agentdev/drafts/req-draft-{topic}.md` | `req-define` | `req-save`, `case-open` | 保存前の要件ドラフト | case-open の Issue 作成 + VERIFY 成功後に削除 |

標準 draft type は `req_draft` の 1 種のみとする（REQ-0103-132）。`requirements-review-finding` および旧 `skill_review_finding` は標準 draft type に含めない。Skill/Command 参照妥当性の検出結果は inspect lifecycle（`.agentdev/inspect/inbox/`、REQ-0103-140-151）へ出力する。

### ドラフトファイルフロントマター

`.agentdev/drafts/` 配下の draft file は、以下の frontmatter を基本とする（REQ-0103-135）:

```yaml
---
draft_type: req_draft
topic: example-topic
status: draft
created_at: 2026-06-14T19:36:47+09:00
---
```

frontmatter の基本フィールドは `draft_type`・`topic`・`status`・`created_at` とし、producer・allowed consumers・lifecycle は registry 側で `draft_type` ごとに定義する（REQ-0103-135, REQ-0103-136）。

### Command 側 draft_type 検証

各コマンドは、入力 draft の `draft_type` とレジストリ上の許可消費元（allowed consumers）を照合して受理可否を判定する（REQ-0103-131, REQ-0103-136）。

| command | 受け付ける draft_type |
|---|---|
| `req-save` | `req_draft` |
| `case-open` | `req_draft` |

### inspect-skills 副作用境界

`inspect-skills` は検査対象（Command/Skill 定義ファイル）を直接修正しない診断コマンドとする。許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit / push）のみとし、それ以外の原本文書変更・REQ/ADR/SPEC 変更・Command/Skill/Template/Script 変更・RU 保存・Issue 作成・PR 作成・許可範囲外の commit/push を行わない（inspect lifecycle、REQ-0103-140-151、REQ-0125-007）。最終判断（promote / defer / reject）は `inspect-promote` が行う。検出事項（inspect finding）は `inspect-promote` による promote/defer/reject ライフサイクルの対象となる。

## req_draft 出力構造

`req_draft`（`.agentdev/drafts/req-draft-{topic}.md`）は req-define が生成する一時的な構造化ハンドオフ成果物であり、req-save / spec-save / case-open / case-auto / case-run / case-close が消費する。

- req_draft は API 契約ではなく、生成元（producer）側の標準（緩やかな契約: soft contract）である。LLM 推論経由で消費され、機械的パースを前提としない（ADR-0124）
- スキーマバージョン・JSON Schema・バリデータは導入しない
- 後続工程の権威ある情報源は `draft-data` YAML block であり、人間可読 Markdown セクションではない
- 標準データモデル fields: `auto_gate`, `agreed_items`, `artifact_actions`, `conflict_resolutions`, `operation_units`, `case_open_hints`
- `summary` 等の人間可読セクションは補助的であり、後続工程の権威ある情報源ではない

### artifact_actions 詳細構造

- 1 action = 1 artifact × 1 editing concern とする（REQ-ID 単位でも、箇条書き 1 行単位でもない）
- 同一関心の複数 agreed items は、単一 action に複数段落の `content` としてまとめる

各 action の field 構成:

| field | 説明 |
|---|---|
| `id` | `ACT-REQ-NNN` / `ACT-ADR-NNN` / `ACT-SPEC-NNN` |
| `artifact` | `req` / `adr` / `spec` |
| `operation` | REQ/ADR: `create` / `append` / `update`、SPEC: `create` / `update` |
| `target` | file path または `new:{slug}` |
| `target_area` | optional: section / area 指定 |
| `source_items` | 対応する agreed_item ID の list |
| `content` | 保存対象の full text |

### frontmatter 構造

req_draft の frontmatter は最小限のメタデータのみとする。後続工程の主入力は `# draft-data` fenced YAML block である。

- 最小 frontmatter fields: `draft_type`, `topic_slug`, `status`, `created_at`、optional で `source_rus`
- frontmatter は lightweight metadata のみ。後続工程の主入力は `# draft-data` fenced YAML であり、frontmatter ではない
