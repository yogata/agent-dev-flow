---
name: skill-authoring-best-practices
description: SKILL.mdの作成・改善時に参照するベストプラクティスガイド。スキル設計、description命名、progressive disclosure、ワークフロー定義、評価手法、アンチパターンの回避策を提供。スキルを新規作成、既存スキルを改善、スキルの品質をレビュー、スキル構造を設計する際に使用。
---

# Skill Authoring Best Practices

OpenCodeのSKILL.mdを書く際の実践ガイド。Claude Agent Skillsのベストプラクティスに基づく。

## Core Principles

### Concise is Key

コンテキストウィンドウは共有リソース。LLMが既に知っていることの説明は省く:

**Good** — LLMに不要な説明を省略:
````markdown
## Git Commit

Analyze staged changes and generate a commit message:

```bash
git diff --cached --stat
```

Follow Conventional Commits format.
````

**Bad** — LLMに既知の概念を説明:
```markdown
## Git Commit

Git is a version control system that tracks changes in source code.
Commits are snapshots of your repository at a point in time.
A good commit message should describe what changed and why.
To create a commit, you need to stage your changes first using
git add, then use git commit with a descriptive message...
```

### Degrees of Freedom

タスクの脆さと変動性に合わせて指示の具体的レベルを調整する:

| 自由度 | いつ使う | 例 |
|--------|----------|-----|
| **High** | 複数の有効なアプローチが存在、文脈依存の判断 | コードレビュー、分析タスク |
| **Medium** | 推奨パターンはあるが変動OK | 設定可能なテンプレート |
| **Low** | 操作が脆くエラーが出やすい、一貫性が重要 | DB マイグレーション、デプロイ手順 |

**Low freedom** — 安全な道が一つだけの場合:
```markdown
## Database migration

Run exactly this script:

```bash
python scripts/migrate.py --verify --backup
```

Do not modify the command or add additional flags.
```

**High freedom** — 多くの道が成功に至る場合:
```markdown
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

## Structure

### Naming Conventions

**動名詞形（gerund form）** を推奨 — 実行する活動を明確に示す:

- ✓ `processing-pdfs`, `analyzing-spreadsheets`, `testing-code`
- ✓ `pdf-processing`, `spreadsheet-analysis`（名詞句も可）
- ✗ `helper`, `utils`, `tools`（曖昧すぎる）
- ✗ `anthropic-helper`, `claude-tools`（予約語を含む）

ルール: 小文字・数字・ハイフンのみ。最大64文字。

### Writing Effective Descriptions

description は **3人称** で書く（システムプロンプトに注入されるため）。何をするか + いつ使うか の両方を含める:

```yaml
# Good — 具体的 + トリガーコンテキスト付き
description: Extracts text from PDF files, fills forms, merges documents. Use when working with PDFs, forms, or document extraction.

# Bad — 曖昧
description: Helps with documents
```

description はスキル選択の要。100+ のスキルから正しいものを選ぶために十分な詳細が必要。

### Progressive Disclosure

SKILL.md は目次として機能し、詳細は必要に応じて読み込む:

```
skill/
├── SKILL.md              # メイン指示（トリガー時に読み込み）
├── reference.md          # APIリファレンス（必要時に読み込み）
├── examples.md           # 使用例（必要時に読み込み）
└── scripts/
    └── validate.py       # ユーティリティスクリプト
```

**SKILL.md本文は500行以内**を推奨。これに近づいたら別ファイルに分割。

#### Pattern 1: High-level Guide with References

````markdown
# PDF Processing

## Quick start

Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
````

#### Pattern 2: Domain-specific Organization

ユーザーが特定ドメインの質問をした時、そのドメインのファイルだけが読まれる:

```
bigquery-skill/
├── SKILL.md (概要とナビゲーション)
└── reference/
    ├── finance.md (revenue, billing)
    ├── sales.md (opportunities, pipeline)
    └── product.md (API usage, features)
```

#### Pattern 3: Conditional Details

基本はSKILL.md内、高度な内容は別ファイル:

```markdown
# DOCX Processing

## Creating documents
Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents
For simple edits, modify the XML directly.
**For tracked changes**: See [REDLINING.md](REDLINING.md)
```

### Avoid Deep Nesting

参照は **SKILL.mdから1階層まで**。深いネストは部分的な読み込みを引き起こす:

```markdown
# Bad — too deep
SKILL.md → advanced.md → details.md → actual info

# Good — one level
SKILL.md → advanced.md (complete info here)
SKILL.md → reference.md (complete info here)
```

### Structure Longer Reference Files

100行を超える参照ファイルには目次を付ける:

```markdown
# API Reference

## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Advanced features (batch operations, webhooks)
- Error handling patterns

## Authentication and setup
...
```

## Workflows and Feedback Loops

### Use Workflows for Complex Tasks

複雑な操作は明確な順序付きステップに分解。チェックリストを含めると進捗が追跡可能:

````markdown
## Skill creation workflow

Copy this checklist and track your progress:

```
Progress:
- [ ] Step 1: Identify reusable patterns from past interactions
- [ ] Step 2: Write minimal SKILL.md covering gaps
- [ ] Step 3: Test with actual task in new session
- [ ] Step 4: Iterate based on observed behavior
```

**Step 1: Identify reusable patterns**
Review prompts you've repeatedly provided. Extract table names, filtering rules, common workflows.

**Step 2: Write minimal SKILL.md**
Create just enough content to address identified gaps. Omit what LLM already knows.

**Step 3: Test with actual task**
Load the skill in a fresh session and run a real task. Observe where it succeeds or struggles.

**Step 4: Iterate based on observation**
- Missed references → make links more prominent
- Repeated file access → move content to main SKILL.md
- Unused files → consider removing
````

### Implement Feedback Loops

「バリデート → 修正 → 繰り返し」のパターンで品質を担保:

```markdown
## Skill review process

1. Load the skill and run a representative task
2. **Evaluate immediately** against checklist:
   - Concise? No unnecessary explanations?
   - Effective description with triggers?
   - Progressive disclosure (under 500 lines)?
   - Consistent terminology?
3. If issues found:
   - Note each issue with specific section
   - Revise the SKILL.md
   - Re-test with a fresh session
4. **Only finalize when all checklist items pass**
```

## Content Guidelines

### Avoid Time-sensitive Information

期限付きの情報はすぐに不正確になる:

```markdown
# Bad — 時間依存
If you're doing this before August 2025, use the old API.
After August 2025, use the new API.

# Good — 履歴セクションで管理
## Current method
Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns
<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>
The v1 API used: `api.example.com/v1/messages`
This endpoint is no longer supported.
</details>
```

### Use Consistent Terminology

一つの用語を決めてスキル全体で一貫して使用:

- ✓ 常に "API endpoint"
- ✗ "API endpoint", "URL", "API route", "path" を混在

## Common Patterns

### Template Pattern

出力フォーマットのテンプレートを提供。厳格さは要件に合わせて調整:

**Strict**（APIレスポンスやデータフォーマット向け）:
````markdown
## Skill description template

ALWAYS use this exact format:

```yaml
---
name: [verb]-[noun]
description: [What it does]. Use when [trigger conditions].
---
```
````

**Flexible**（適応が有用な場合）:
````markdown
## Skill structure template

Sensible default structure — adjust based on complexity:

```markdown
---
name: [kebab-case-name]
description: [What + when]
---

# [Skill Title]

## Overview
[1-2 sentences]

## Instructions
[Main content]
```

Adapt sections as needed.
````

### Examples Pattern

入出力ペアで期待する品質を示す（説明だけよりも効果的）:

````markdown
## SKILL.md description examples

**Example 1:**
Input: スキルがGit Worktreeを管理する
Output:
```yaml
description: Manages Git worktree creation, switching, and cleanup based on branch names. Use when working with multiple branches simultaneously, checking out PRs for review, or isolating feature work in separate directories.
```

**Example 2:**
Input: スキルがテストを実行する
Output:
```yaml
description: Runs test suites with coverage reports and suggests fixes for failures. Use when running tests, checking coverage, debugging test failures, or improving test quality.
```

**Example 3:**
Input: スキルが要件を分析する
Output:
```yaml
description: Analyzes requirements into functional and non-functional categories with quality criteria. Use when starting a new feature, defining requirements, or evaluating requirement completeness.
```

Follow this style: [what it does] + [trigger conditions].
````

### Conditional Workflow Pattern

分岐ポイントで意思決定をガイド:

```markdown
## Skill creation approach

1. Determine the skill complexity:

   **Single concern, under 200 lines?** → Write everything in SKILL.md
   **Multiple domains or over 200 lines?** → Split into separate files

2. Single-file approach:
   - Write SKILL.md with all instructions inline
   - Keep under 500 lines

3. Multi-file approach:
   - Write SKILL.md as overview with references
   - Create domain-specific files for details
   - Link from SKILL.md (one level deep only)
```

## Evaluation and Iteration

### Build Evaluations First

豊富なドキュメントを書く前に評価を作成する:

**評価駆動開発の流れ:**
1. **ギャップ特定:** スキルなしで代表タスクを実行し、失敗を記録
2. **評価作成:** ギャップをテストする3つのシナリオを作成
3. **ベースライン測定:** スキルなしでの性能を計測
4. **最小限の指示を書く:** ギャップを埋める分だけのコンテンツを作成
5. **反復:** 評価を実行、ベースラインと比較、洗練

### Iterative Development

最も効果的なスキル開発プロセス:

1. **スキルなしでタスク完了** — 繰り返し提供したコンテキストに注目
2. **再利用可能なパターンを特定** — 表名、フィルタリングルール、共通クエリなど
3. **スキルを作成** — 特定したパターンをSKILL.mdに抽出
4. **簡潔さをレビュー** — 不要な説明を削除
5. **情報構造を改善** — 大きな内容は別ファイルに分割
6. **実際のタスクでテスト** — スキルをロードした別セッションで検証
7. **観察に基づいて反復** — スキルを使って困難な点を特定し改善

**観察すべきポイント:**
- 予期しないファイルの読み込み順序 → 構造が直感的でない可能性
- 重要ファイルへの参照を見落とし → リンクをもっと明確に
- 同じセクションを繰り返し参照 → SKILL.md本体に移すべきか検討
- 一度もアクセスされないファイル → 不要かもしれない

## Anti-Patterns

| アンチパターン | 問題 | 修正 |
|---------------|------|------|
| Windows形式のパス `\path\to\file` | Unix環境でエラー | 常にフォワードスラッシュ `path/to/file` |
| 多すぎる選択肢の提示 | 混乱を招く | デフォルトを1つ提示、代替は例外時のみ |
| 不必要な前提知識の説明 | トークン無駄遣い | LLMが既に知っていることを説明しない |
| 深いネストの参照 | 不完全な読み込み | SKILL.mdから1階層まで |
| 時間依存の情報 | すぐに不正確に | 履歴セクションで管理 |
| 用語の不統一 | 混乱 | 一つの用語を決めて一貫使用 |

## Checklist for Effective Skills

- [ ] **Concise**: LLMが既に知っている説明を省いている
- [ ] **Descriptive name**: gerund form または名詞句で活動を表現
- [ ] **Effective description**: 何をするか + いつ使うか + トリガーキーワード（3人称）
- [ ] **Progressive disclosure**: SKILL.md本文は500行以内、詳細は別ファイル
- [ ] **One-level references**: SKILL.mdから直接リンク、深いネストなし
- [ ] **Consistent terminology**: 同じ概念には同じ用語を使用
- [ ] **No time-sensitive info**: 日付依存の記述を避けている
- [ ] **Tested**: 実際のタスクで検証済み
- [ ] **Forward slashes**: すべてのパスで `/` を使用
