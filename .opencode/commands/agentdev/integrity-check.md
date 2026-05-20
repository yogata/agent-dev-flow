---
description: AgentDevFlow artifact 整合性検査
agent: sisyphus
load_skills:
  - agentdev-req-analysis
  - agentdev-adr-guidelines
  - agentdev-gh-cli-best-practices
---

# Artifact 整合性検査

AgentDevFlow 管理下の artifact（REQ、ADR、skill、command）の整合性を検査し、結果をレポートとして出力する read-only コマンド。

## 基本原則: Read-Only 制約

**検査対象 artifact を一切変更しない。** 以下のみ許容する:

- ✅ 検出結果レポートの生成（`.agentdev/integrity/reports/`）
- ✅ intake item の新規作成（`.agentdev/intake/inbox/`）
- ❌ 検査対象ファイル（REQ、ADR、skill、command、specs 等）の変更

## Input

- なし（コマンド実行時に全 artifact を自動スキャン）

## Output

- `.agentdev/integrity/reports/YYYY-MM-DD-integrity-report.md` — 検出結果レポート
- `.agentdev/intake/inbox/YYYY-MM-DD-integrity-{issue-slug}.md` — 検出問題の intake item（MAY、ユーザー承認時のみ）

## Steps

### 1. スキャン対象の収集

以下の artifact を収集する:

| カテゴリ | 対象パス | 収集方法 |
|----------|----------|----------|
| REQ ファイル | `docs/requirements/REQ-*.md` | `glob` |
| ADR ファイル | `docs/adr/ADR-*.md` | `glob` |
| Skill ディレクトリ | `.opencode/skills/*/SKILL.md` | `glob` |
| Command ファイル | `.opencode/commands/agentdev/*.md`（`README.md` 除く） | `glob` |
| Specs ファイル | `docs/specs/*.md` | `glob` |

各ファイルの内容を `Read` tool で読み込む。ファイルが存在しないカテゴリは空として扱い、警告を出力する。

### 2. REQ frontmatter↔ファイル名整合性検査

各 REQ ファイルについて以下を検査する:

- **(a) frontmatter `id` ↔ ファイル名**: ファイル名 `REQ-{NNNN}.md` の `{NNNN}` と frontmatter の `id` 値（例: `REQ-0017`）が一致するか
- **(b) frontmatter 必須フィールド**: `id`、`title`、`status` が存在するか
- **(c) README インデックス整合性**: `docs/requirements/README.md`（存在する場合）に該当 REQ がリストされているか。逆に README にリストされている REQ のファイルが実在するか

検出結果を不一致エントリとして記録する。

### 3. ADR↔REQ 相互参照整合性検査

各 ADR ファイルについて以下を検査する:

- **(a) ADR 内の REQ 参照**: ADR 本文内で参照している REQ（`REQ-{NNNN}` パターン）が実在するか
- **(b) REQ 内の ADR 参照**: REQ ファイル（frontmatter または本文）で参照している ADR（`ADR-{NNNN}` パターン）が実在するか
- **(c) ステータス整合性**: ADR が `accepted` かつ参照元 REQ が `superseded` でないか等の不自然な組み合わせを検出する（SHOULD — 厳密な判定は不要、疑わしいものを報告）

### 4. Skill↔load_skills 参照整合性検査

各 command ファイルについて以下を検査する:

- **(a) load_skills 参照先の存在**: frontmatter `load_skills` に列挙されたスキル名に対応する `SKILL.md` が存在するか（`.opencode/skills/{name}/SKILL.md`）
- **(b) agentdev プレフィクス規約**: `load_skills` 内のスキル名が `agentdev-` プレフィクスを持つか（AgentDevFlow namespace のコマンドの場合）
- **(c) 未使用スキル**: 存在するスキルのうち、どの command からも `load_skills` で参照されていないスキルを検出する（SHOULD）

### 5. Command-map↔実体整合性検査

README（`.opencode/commands/agentdev/README.md`）のコマンド一覧と実際の command ファイルの整合性を検査する:

- **(a) README にリストされているコマンドのファイルが実在するか**
- **(b) 実在するコマンドが README にリストされているか**
- **(c) README の description と各コマンド frontmatter の `description` が一致するか（SHOULD）**

### 6. 検出結果レポートの生成

検出結果を以下の形式でレポートとして出力する:

- 保存先: `.agentdev/integrity/reports/YYYY-MM-DD-integrity-report.md`
- ディレクトリが存在しない場合は作成する

#### レポート形式

```markdown
# Integrity Check Report

- **実行日時**: YYYY-MM-DD HH:MM
- **スキャン対象**: REQ N件、ADR N件、Skill N件、Command N件

## サマリ

| 検査カテゴリ | OK | NG | 備考 |
|-------------|----|----|------|
| REQ frontmatter↔ファイル名 | N | N | — |
| ADR↔REQ 相互参照 | N | N | — |
| Skill↔load_skills 参照 | N | N | — |
| Command-map↔実体 | N | N | — |

## 詳細

### REQ frontmatter↔ファイル名
{検出結果の詳細。OK の場合は「問題なし」、NG の場合は具体的な不一致内容}

### ADR↔REQ 相互参照
{検出結果の詳細}

### Skill↔load_skills 参照
{検出結果の詳細}

### Command-map↔実体
{検出結果の詳細}
```

### 7. Intake Item 作成（MAY）

検出された問題のうち、ユーザーが intake item 化を指示したものについて intake item を作成する。

- **ユーザーに結果を提示**: Step 6 のレポート内容を表示
- **ユーザーに intake item 化を問う**: 「検出された問題のうち、intake item として登録するものがありますか？」
- **ユーザーが指定した問題のみ**: `.agentdev/intake/inbox/YYYY-MM-DD-integrity-{issue-slug}.md` に intake item 形式で保存
- **保存形式**: `/agentdev/intake-capture` の Intake Item 形式に従う
- **ユーザーが intake item 化をスキップ**: レポートのみで終了

### 8. 完了報告

```
✅ integrity-check 完了
  レポート: .agentdev/integrity/reports/YYYY-MM-DD-integrity-report.md
  検出件数: NG N件 / OK N件
  intake item: N件作成（または「なし」）
```

## Guardrails

### Read-Only 制約（REQ-0017-029）
- G01: 検査対象ファイル（REQ、ADR、skill、command、specs、README）の内容を変更しない
- G02: レポート・intake item の新規作成のみ許容
- G03: `git` コマンドは実行しない（コミット・プッシュ禁止）

### 検査対象制約
- G04: 検査は存在性・整合性の確認に限定し、内容の妥当性評価は行わない
- G05: ステータス整合性（Step 3-c, 5-c）は SHOULD であり、厳密な判定を求めない

### 実行制約
- G06: `gh` コマンドは使用しない（GitHub Issue の作成・更新は行わない）
- G07: ユーザーの承認なしに intake item を作成しない（REQ-0017-030 MAY）

### 委譲・参照制約
- G08: `agentdev-req-analysis` skill の要件分析手法を参照して REQ フィールドの検査を実施
- G09: `agentdev-adr-guidelines` skill の ADR 構造定義を参照して ADR フィールドの検査を実施

## Error Handling

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| README が存在しない | Step 2-c, Step 5 をスキップし、警告を出力 |
| レポート書込失敗 | エラー内容を報告し、コンソールに結果を表示 |

## 注意事項

- **実行の都度レポートを生成**: 過去レポートは上書きしない（日付ベースのファイル名で毎回新規作成）
- **intake item 作成は任意**: ユーザーが指示した場合のみ実行（REQ-0017-030 MAY）
- **false negative より false positive を優先**: 整合性検査は「見逃し」より「過検出」を許容する
