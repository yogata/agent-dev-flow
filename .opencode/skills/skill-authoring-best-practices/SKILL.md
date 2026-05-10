---
name: skill-authoring-best-practices
description: SKILL.mdの作成・改善時に参照するベストプラクティスガイド。USE FOR: スキル新規作成、既存スキル改善、スキル品質レビュー、スキル構造設計、トリガーdescription執筆、progressive disclosure設計。DO NOT USE FOR: コマンド定義の作成、一般的なコーディング作業、ドキュメントの単純修正。
---

# Skill Authoring Best Practices

OpenCodeのSKILL.mdを書く際の実践ガイド。スキルの品質を7つの観点から体系的に担保する。

## 1. 設計原則

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
````markdown
## Database migration

Run exactly this script:

```bash
python scripts/migrate.py --verify --backup
```

Do not modify the command or add additional flags.
````

**High freedom** — 多くの道が成功に至る場合:
```markdown
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

### Token Budget Awareness

コンテキストウィンドウは有限リソース。定量的な予算管理で品質を担保:

| 指標 | 上限 | 根拠 |
|------|------|------|
| **SKILL.md 行数** | ≤500行 | トリガー時に全文がコンテキストに読み込まれる |
| **指示トークン数** | <5,000 tokens | 1スキルが占めるコンテキストの適正規模 |
| **参照ファイル** | 無制限（渐进的読み込み） | 必要時のみ読み込まれるため影響は限定的 |

トークン数の見積もり: 英語は約4文字≈1 token、日本語は約1.5文字≈1 token。実測推奨。
予算超過の兆候: 400行超で分割検討、同セクション反復参照は統合、未アクセスファイルは削除検討。

## 2. スキル仕様

### Naming Conventions

**動名詞形（gerund form）** を推奨。実行する活動を明確に示す:

- ✓ `processing-pdfs`, `analyzing-spreadsheets`, `testing-code`
- ✓ `pdf-processing`, `spreadsheet-analysis`（名詞句も可）
- ✗ `helper`, `utils`, `tools`（曖昧すぎる）
- ✗ `anthropic-helper`, `claude-tools`（予約語を含む）

ルール: 小文字・数字・ハイフンのみ。最大64文字。

### Writing Effective Descriptions

description は **3人称** で書く（システムプロンプトに注入されるため）。何をするか + いつ使うかの両方を含める。100+のスキルから正しいものを選ぶために十分な詳細が必要。descriptionはスキル選択の要。

### Trigger Design

description内に `USE FOR:` / `DO NOT USE FOR:` を埋め込む。agentskills.ioのde facto標準であり、dotnet/runtime、github/awesome-copilot、microsoft/vscode等の主要リポジトリで採用されている。`WHEN:` も可（Microsoft sensei形式）。

```yaml
# Good — トリガー明示付き
description: Manages git worktree creation, switching, and cleanup based on branch names. USE FOR: creating worktrees, switching between branches, cleaning up completed worktrees. DO NOT USE FOR: basic git operations like commit/push/pull.

# Good — WHEN形式
description: Extracts text from PDF files, fills forms, merges documents. WHEN: working with PDFs, forms, or document extraction.

# Bad — 曖昧で選択精度が低い
description: Helps with documents
```

トリガー設計のポイント:
- **Positive triggers** (`USE FOR:`): エージェントがこのスキルを選ぶべき場面を列挙
- **Negative triggers** (`DO NOT USE FOR:`): 誤選択を防ぐ除外条件を明記
- トリガーはdescriptionテキスト内に記述（frontmatterの別フィールドにはしない）

## 3. 構造設計

### Complexity Classification

3段階の複雑度に応じて構造とトークン予算を調整する:

| 複雑度 | 基準 | SKILL.md行数 | 構造 | トークン予算 |
|--------|------|-------------|------|-------------|
| **simple** | 単一関心、<200行 | <200行 | SKILL.mdのみ | <2,000 tokens |
| **moderate** | 複数関心、参照ファイル必要 | 200-400行 | SKILL.md + 1-2参照ファイル | 2,000-4,000 tokens |
| **detailed** | 複雑なワークフロー、ドメイン別モジュール | 400-500行 | SKILL.md + reference/ ディレクトリ | 4,000-5,000 tokens |

どの段階を狙うか: デフォルトは **simple**（200行以内が最善）。複数の独立した関心事があれば **moderate**。ドメイン横断で複数モジュールが必要な場合のみ **detailed**。

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

## 4. 品質評価基準

スキルの品質を5つの軸で評価する:

### Clarity (明確性)

- **定義**: 指示が一意に解釈可能で、誤読の余地がない
- **評価基準**: 各セクションが単一の明確な目的を持つ。手順があいまいさなく記述されている
- **よくある失敗**: 複数の意味に取れる表現、前提の暗黙的な省略

### Completeness (完全性)

- **定義**: 対象複雑度に必要な情報がすべて存在する
- **評価基準**: ワークフローに欠落ステップがない。参照先に実在する内容がある
- **よくある失敗**: 「詳細は別途」で参照先が空、エラーケースの記述漏れ

### Trigger Precision (トリガー精度)

- **定義**: USE FOR / DO NOT USE FOR が実際の選択場面と一致している
- **評価基準**: 偽陽性（関係ない場面で選ばれる）と偽陰性（必要な場面で選ばれない）が少ない
- **よくある失敗**: 抽象的すぎるトリガー（「開発に役立つ」）、除外条件の欠落

### Scope Coverage (スコープ適合性)

- **定義**: 内容が定義済みスコープ内に収まっている
- **評価基準**: 他スキルの領域に侵出していない。参照モジュール数が適切（moderate: 2-3、detailed: 3-5）
- **よくある失敗**: スコープクリープ、参照ファイルの乱立

### Anti-Pattern Detection (アンチパターン検出)

- **定義**: 既知のアンチパターンが存在しない
- **評価基準**: 不要な説明、深いネスト、時間依存情報、用語の不統一がない
- **よくある失敗**: セクション7のアンチパターン一覧にある問題の混入

## 5. レビュープロトコル

4つの観点でスキル品質をチェックする:

### 5.1 Frontmatter Check

- [ ] nameが命名規則に従っている（kebab-case、gerund form推奨）
- [ ] descriptionにトリガー（USE FOR / DO NOT USE FOR または WHEN）が含まれている
- [ ] descriptionが3人称で書かれている
- [ ] frontmatterフィールドはnameとdescriptionのみ（拡張フィールドを追加しない）

### 5.2 Budget Check

- [ ] 行数 ≤500行
- [ ] 推定トークン数が複雑度の予算内（simple: <2K、moderate: <4K、detailed: <5K）
- [ ] 複雑度に対してSKILL.mdが大きすぎない（simpleなのに300行等）

### 5.3 Structure Check

- [ ] Progressive disclosureが適用されている
- [ ] 参照深度が1階層まで
- [ ] 複雑度分類が内容に合っている
- [ ] 100行超の参照ファイルに目次がある

### 5.4 Advisory Check

- [ ] 参照モジュール数が適切（moderate: 2-3、detailed: 3-5）
- [ ] 過度な具体性（環境固有のハードコード等）がない
- [ ] 手続き的コンテンツがワークフローセクションに配置されている
- [ ] 用語が一貫している

## 6. 開発ワークフロー

### Skill Creation Workflow

複雑な操作は順序付きステップに分解。チェックリストで進捗を追跡:

```
Progress:
- [ ] Step 1: Identify reusable patterns from past interactions
- [ ] Step 2: Write minimal SKILL.md covering gaps
- [ ] Step 3: Test with actual task in new session
- [ ] Step 4: Iterate based on observed behavior
```

**Step 1**: 繰り返し提供したコンテキストに注目。表名、フィルタリングルール、共通ワークフローを抽出。
**Step 2**: ギャップを埋める分だけのコンテンツを作成。LLMが既に知っていることは省く。
**Step 3**: スキルをロードした別セッションで実際のタスクを実行。成功・失敗を観察。
**Step 4**: 参照を見落とす→リンクを明確に、同セクション反復→本体に移す、未使用ファイル→削除検討。

### Feedback Loop

「バリデート → 修正 → 繰り返し」のパターンで品質を担保:

1. スキルをロードして代表タスクを実行
2. **即座に評価** — セクション5のチェックリストに照らす
3. 問題があれば:
   - 該当セクションを特定
   - SKILL.mdを修正
   - 別セッションで再テスト
4. **全項目パスしたら完了**

### Build Evaluations First

豊富なドキュメントを書く前に評価を作成する:

1. **ギャップ特定**: スキルなしで代表タスクを実行し、失敗を記録
2. **評価作成**: ギャップをテストする3つのシナリオを作成
3. **ベースライン測定**: スキルなしでの性能を計測
4. **最小限の指示を書く**: ギャップを埋める分だけのコンテンツを作成
5. **反復**: 評価を実行、ベースラインと比較、洗練

### Iterative Development

最も効果的なスキル開発プロセス:

1. **スキルなしでタスク完了** — 繰り返し提供したコンテキストに注目
2. **再利用可能なパターンを特定** — 表名、フィルタリングルール、共通クエリ
3. **スキルを作成** — 特定したパターンをSKILL.mdに抽出
4. **簡潔さをレビュー** — 不要な説明を削除
5. **情報構造を改善** — 大きな内容は別ファイルに分割
6. **実際のタスクでテスト** — 別セッションで検証
7. **観察に基づいて反復** — 困難な点を特定し改善

観察すべきポイント: 予期しない読み込み順序→構造が直感的でない、参照見落とし→リンクを明確に、同セクション反復→本体に移す、未アクセスファイル→不要かも。

### Common Patterns

#### Template Pattern

出力フォーマットのテンプレートを提供。厳格さは要件に合わせて調整:

**Strict**（APIレスポンスやデータフォーマット向け）:
````markdown
## Skill description template

ALWAYS use this exact format:

```yaml
---
name: [verb]-[noun]
description: [What it does]. USE FOR: [trigger conditions]. DO NOT USE FOR: [exclusions].
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
description: [What + USE FOR + DO NOT USE FOR]
---

# [Skill Title]

## Overview
[1-2 sentences]

## Instructions
[Main content]
```

Adapt sections as needed.
````

#### Examples Pattern

入出力ペアで期待する品質を示す（説明だけよりも効果的）:

````markdown
**Example 1:**
Input: スキルがGit Worktreeを管理する
Output:
```yaml
description: Manages Git worktree creation, switching, and cleanup based on branch names. USE FOR: creating worktrees, switching between branches, cleaning up completed worktrees. DO NOT USE FOR: basic git operations like commit/push/pull.
```

**Example 2:**
Input: スキルがテストを実行する
Output:
```yaml
description: Runs test suites with coverage reports and suggests fixes for failures. USE FOR: running tests, checking coverage, debugging test failures. DO NOT USE FOR: writing test cases from scratch.
```

**Example 3:**
Input: スキルが要件を分析する
Output:
```yaml
description: Analyzes requirements into functional and non-functional categories with quality criteria. WHEN: starting a new feature, defining requirements, evaluating requirement completeness.
```

Follow this style: [what it does] + [trigger conditions] + [exclusions].
````

#### Conditional Workflow Pattern

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

## 7. Anti-Patterns

| アンチパターン | 問題 | 修正 |
|---------------|------|------|
| Windows形式のパス `\path\to\file` | Unix環境でエラー | 常にフォワードスラッシュ `path/to/file` |
| 多すぎる選択肢の提示 | 混乱を招く | デフォルトを1つ提示、代替は例外時のみ |
| 不必要な前提知識の説明 | トークン無駄遣い | LLMが既に知っていることを説明しない |
| 深いネストの参照 | 不完全な読み込み | SKILL.mdから1階層まで |
| 時間依存の情報 | すぐに不正確に | 履歴セクションで管理 |
| 用語の不統一 | 混乱 | 一つの用語を決めて一貫使用 |
| 過度な具体性 | 環境変更で破綻 | 汎用的な記述にし環境依存は変数化 |
| frontmatterの拡張 | 互換性リスク | nameとdescriptionのみに制限 |

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
