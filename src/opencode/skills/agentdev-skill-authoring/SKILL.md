---
name: agentdev-skill-authoring
description: Provides quality criteria and best practices for authoring OpenCode SKILL.md files across five evaluation axes and four check protocols. USE FOR: creating new skills, improving existing skills, reviewing skill quality, designing skill structure, writing trigger descriptions, or planning progressive disclosure. DO NOT USE FOR: creating command definitions, general coding tasks, or simple documentation fixes.
---

# Skill Authoring Best Practices

OpenCodeのSKILL.mdを書く際の実践ガイド。スキルの品質を7つの観点から体系的に担保する。

## 1. 設計原則

### Concise is Key

コンテキストウィンドウは共有リソース。LLMが既に知っていることの説明は省く:

**Good** — 不要な説明を省略:
````markdown
## Git Commit

Analyze staged changes and generate a commit message:

```bash
git diff --cached --stat
```

Follow Conventional Commits format.
````

**Bad** — 既知の概念を説明:
```markdown
Git is a version control system that tracks changes in source code.
Commits are snapshots of your repository at a point in time...
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

### Line Count Governance

SKILL.md の行数が **500行を超過** した場合、`references/` サブディレクトリへの抽出が **必須** となる。

| 行数 | 判定 | アクション |
|------|------|-----------|
| ≤400行 | ✅ 適正 | なし |
| 401〜500行 | ⚠️ 抽出検討 | 独立した関心事を `references/` に移動する計画を立案 |
| >500行 | ❌ 必須抽出 | SKILL.md を概要・ナビゲーションに絞り、詳細を `references/` に切り出し |

**抽出ルール**:

1. SKILL.md は概要・判断基準・ナビゲーションのみを保持する
2. 詳細な手順・判定表・具体例は `references/` に移動する
3. SKILL.md から `references/` への参照深度は **1階層** まで
4. 抽出後の SKILL.md は 400行以下を目標とする
5. `references/` に抽出したファイルが 100行を超える場合は目次を付ける

**抽出対象の優先順位**:

1. 大きなコード例・テンプレート例 → `references/examples.md`
2. 詳細な判定表・分類表 → `references/{topic}-standards.md`
3. ワークフローの詳細手順 → `references/{topic}-workflow.md`
4. 開発プロセスの詳細 → `references/development-workflow.md`

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

description内に `USE FOR:` / `DO NOT USE FOR:` を埋め込む。agentskills.ioのde facto標準。`WHEN:` も可（Microsoft sensei形式）。

```yaml
# Good — トリガー明示付き
description: Manages git worktree creation, switching, and cleanup based on branch names. USE FOR: creating worktrees, switching between branches, cleaning up completed worktrees. DO NOT USE FOR: basic git operations like commit/push/pull.

# Bad — 曖昧で選択精度が低い
description: Helps with documents
```

トリガー設計のポイント:
- **Positive triggers** (`USE FOR:`): エージェントがこのスキルを選ぶべき場面を列挙
- **Negative triggers** (`DO NOT USE FOR:`): 誤選択を防ぐ除外条件を明記
- トリガーはdescriptionテキスト内に記述（frontmatterの別フィールドにはしない）

### Trigger Convention（USE FOR / DO NOT USE FOR 表記規約）

`USE FOR:` / `DO NOT USE FOR:` は skill description 内に **必須** で記述する。

**配置場所**: frontmatter の `description` フィールド内。

**フォーマット**:
- `USE FOR:` の後にカンマ区切りで適用場面を列挙（インライン）
- `DO NOT USE FOR:` の後にカンマ区切りで除外場面を列挙
- 両方とも記述することが推奨。`WHEN:` 形式も可
- description 全体は3人称・事実ベースで記述する

**スコープ境界の明確化**:
- Positive trigger は **具体的な操作・場面** を示す（抽象概念は避ける）
- Negative trigger は **隣接スキルの領域** を除外する
- trigger 数は 3〜7個が適正

## 3. 構造設計

### Complexity Classification

3段階の複雑度に応じて構造とトークン予算を調整する:

| 複雑度 | 基準 | SKILL.md行数 | 構造 | トークン予算 |
|--------|------|-------------|------|-------------|
| **simple** | 単一関心、<200行 | <200行 | SKILL.mdのみ | <2,000 tokens |
| **moderate** | 複数関心、参照ファイル必要 | 200-400行 | SKILL.md + 1-2参照ファイル | 2,000-4,000 tokens |
| **detailed** | 複雑なワークフロー、ドメイン別モジュール | 400-500行 | SKILL.md + references/ ディレクトリ | 4,000-5,000 tokens |

デフォルトは **simple**（200行以内が最善）。複数の独立した関心事があれば **moderate**。ドメイン横断で複数モジュールが必要な場合のみ **detailed**。

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

3パターンの構造:
- **High-level Guide + References**: 基本はSKILL.md内、高度な内容は別ファイル
- **Domain-specific Organization**: ドメイン別ファイル、質問に応じて該当ドメインのみ読み込み
- **Conditional Details**: 基本はSKILL.md内、高度な内容は別ファイル

### Avoid Deep Nesting

参照は **SKILL.mdから1階層まで**。深いネストは部分的な読み込みを引き起こす。

### Structure Longer Reference Files

100行を超える参照ファイルには目次を付ける。

## 4. 品質評価基準

スキルの品質を5つの軸で評価する:

| 軸 | 定義 | 評価基準 | よくある失敗 |
|----|------|----------|-------------|
| **Clarity** | 指示が一意に解釈可能 | 各セクションが単一の明確な目的を持つ | 複数の意味に取れる表現 |
| **Completeness** | 対象複雑度に必要な情報が存在 | ワークフローに欠落ステップがない | 「詳細は別途」で参照先が空 |
| **Trigger Precision** | USE FOR / DO NOT USE FOR が実際の選択場面と一致 | 偽陽性・偽陰性が少ない | 抽象的すぎるトリガー |
| **Scope Coverage** | 内容が定義済みスコープ内に収まる | 他スキルの領域に侵出していない | スコープクリープ |
| **Anti-Pattern Detection** | 既知のアンチパターンが存在しない | 不要な説明、深いネストがない | セクション7のアンチパターン一覧にある問題 |

## 5. レビュープロトコル

4つの観点でスキル品質をチェックする:

### 5.1 Frontmatter Check

- [ ] nameが命名規則に従っている（kebab-case、gerund form推奨）
- [ ] descriptionにトリガー（USE FOR / DO NOT USE FOR または WHEN）が含まれている
- [ ] descriptionが3人称で書かれている
- [ ] frontmatterフィールドはnameとdescriptionのみ（拡張フィールドを追加しない）

### 5.2 Budget Check

- [ ] 行数 ≤500行（超過時は `references/` への抽出が必須 — Section 1 Line Count Governance 参照）
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

### Iterative Development（最も効果的なプロセス）

1. **スキルなしでタスク完了** — 繰り返し提供したコンテキストに注目
2. **再利用可能なパターンを特定** — 表名、フィルタリングルール、共通クエリ
3. **スキルを作成** — 特定したパターンをSKILL.mdに抽出
4. **簡潔さをレビュー** — 不要な説明を削除
5. **情報構造を改善** — 大きな内容は別ファイルに分割
6. **実際のタスクでテスト** — 別セッションで検証
7. **観察に基づいて反復** — 困難な点を特定し改善

観察すべきポイント: 予期しない読み込み順序→構造が直感的でない、参照見落とし→リンクを明確に、同セクション反復→本体に移す、未アクセスファイル→不要かも。

### Feedback Loop

「バリデート → 修正 → 繰り返し」のパターンで品質を担保:

1. スキルをロードして代表タスクを実行
2. **即座に評価** — セクション5のチェックリストに照らす
3. 問題があれば該当セクションを特定、SKILL.mdを修正、別セッションで再テスト
4. **全項目パスしたら完了**

### Build Evaluations First

豊富なドキュメントを書く前に評価を作成する:

1. **ギャップ特定**: スキルなしで代表タスクを実行し、失敗を記録
2. **評価作成**: ギャップをテストする3つのシナリオを作成
3. **ベースライン測定**: スキルなしでの性能を計測
4. **最小限の指示を書く**: ギャップを埋める分だけのコンテンツを作成
5. **反復**: 評価を実行、ベースラインと比較、洗練

### Common Patterns

#### Template Pattern

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

#### Conditional Workflow Pattern

分岐ポイントで意思決定をガイド:

```markdown
1. Determine the skill complexity:
   **Single concern, under 200 lines?** → Write everything in SKILL.md
   **Multiple domains or over 200 lines?** → Split into separate files
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

期限付きの情報は履歴セクションで管理する（時期別の分岐はアンチパターン）。

### Use Consistent Terminology

一つの用語を決めてスキル全体で一貫して使用。

## 8. Command / Skill 境界

Skill の品質基準は本スキルの範囲とする。Command に何を置き、何を置かないかの境界定義は `artifact-contracts.md`（`docs/specs/artifact-contracts.md`）を参照。Skill 作成時に Command 側の詳細に踏み込みすぎないこと。

## 9. 配置判断フロー

新規コンテンツをどこに配置するかの判断フロー:

```
Q1: runtime 配布物で個別プロジェクトで実行されるか？
  → Yes: Q2 へ / No: Q5 へ（authoring-only）

Q2: 宣言的ルール・判断基準・domain knowledge か？
  → Yes: Skill / No: Q3 へ

Q3: 決定的でテスト可能な処理ロジックか？
  → Yes: Script（scripts/） / No: Q4 へ

Q4: 出力構造・プレースホルダーか？
  → Yes: Template（templates/） / No: 再評価

Q5: 現在仕様の記述か？
  → Yes: SPEC（docs/specs/） / No: Q6 へ

Q6: 将来の設計・運用・文書システムを制約する決定の記録か？
  → Yes: ADR（docs/adr/） / No: Q7 へ

Q7: 人間向けナビゲーション・案内か？
  → Yes: Guide（docs/guides/） / No: DOC-MAP または適切な分類先を再検討
```

各分岐の判定基準:

| 分岐 | 判定基準 | 例 |
|---|---|---|
| runtime 配布物 | 個別プロジェクトで command/skill 実行時に必要 | 判断基準、テンプレート、検査スクリプト |
| Skill | 再利用可能、宣言的、複数 command から参照可能 | フェーズ体系、命名規則、状態遷移 |
| Script | 入力が同じなら出力も同じ。テスト可能 | 採番、validation、INDEX 生成 |
| Template | 変数置換で使用。ロジックなし | Issue/PR 本文、コメント |
| SPEC | 現在の構造・契約・ルールの記述 | system.md、patterns.md |
| ADR | 「なぜその決定をしたか」の記録 | 技術選定、方針変更 |
| Guide | 人間向けの案内・説明 | ワークフロー概要、クイックスタート |

**注意**: skill `references/` は runtime 配布物のみを含める（現在は SPEC system.md で規定）。authoring-only 資料は `references/` に含めない。

## See Also

- **agentdev-no-ai-slop-writing**: 自然言語成果物の文章品質ゲート（AI-slop 検出・修正）
