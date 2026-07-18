# 設計原則

本ファイルは `agentdev-skill-authoring` SKILL.md の補助資料であり、SKILL.md 本文に圧縮して記載するとエントリポイントとしての役割を損なう設計原則の詳細（簡潔さ、自由度、トークン予算管理、行数ガバナンス、抽出ルール）を扱う。SKILL.md は本ファイルを参照しつつ、本文では要約と判断表のみを保持する（REQ-0113-010）。

## 簡潔さを優先する

コンテキストウィンドウは共有リソース。LLMが既に知っていることの説明は省く:

**Good**（不要な説明を省略）:
````markdown
## Git Commit

Analyze staged changes and generate a commit message:

```bash
git diff --cached --stat
```

Follow Conventional Commits format.
````

**Bad**（既知の概念を説明）:
```markdown
Git is a version control system that tracks changes in source code.
Commits are snapshots of your repository at a point in time...
```

## 自由度

タスクの脆さと変動性に合わせて指示の具体的レベルを調整する:

| 自由度 | いつ使う | 例 |
|--------|----------|-----|
| **High** | 複数の有効なアプローチが存在、文脈依存の判断 | コードレビュー、分析タスク |
| **Medium** | 推奨パターンはあるが変動OK | 設定可能なテンプレート |
| **Low** | 操作が脆くエラーが出やすい、一貫性が重要 | DB マイグレーション、デプロイ手順 |

**Low freedom**（安全な道が一つだけの場合）:
````markdown
## Database migration

Run exactly this script:

```bash
python scripts/migrate.py --verify --backup
```

Do not modify the command or add additional flags.
````

**High freedom**（多くの道が成功に至る場合）:
```markdown
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

## トークン予算管理

コンテキストウィンドウは有限リソース。定量的な予算管理で品質を担保:

| 指標 | 上限 | 根拠 |
|------|------|------|
| **SKILL.md 行数** | ≤500行 | トリガー時に全文がコンテキストに読み込まれる |
| **指示トークン数** | <5,000 tokens | 1スキルが占めるコンテキストの適正規模 |
| **参照ファイル** | 無制限（漸進的読み込み） | 必要時のみ読み込まれるため影響は限定的 |

トークン数の見積もり: 英語は約4文字≈1 token、日本語は約1.5文字≈1 token。実測推奨。
予算超過の兆候: 400行超で分割検討、同セクション反復参照は統合、未アクセスファイルは削除検討。

## 行数ガバナンス

SKILL.md の行数が **500行を超過** した場合、`references/` サブディレクトリへの抽出が **必須** となる。行数は形式基準であり、知識の局所集中の緩和を本旨とする（REQ-0113-010）。

| 行数 | 判定 | アクション |
|------|------|-----------|
| ≤400行 | ✅ 適正 | なし |
| 401〜500行 | ⚠️ 抽出検討 | 独立した関心事を `references/` に移動する計画を立案 |
| >500行 | ❌ 必須抽出 | SKILL.md を概要、ナビゲーションに絞り、詳細を `references/` に切り出し |

**抽出ルール**:

1. SKILL.md は概要、判断基準、ナビゲーションのみを保持する
2. 詳細な手順、判定表、具体例は `references/` に移動する
3. SKILL.md から `references/` への参照深度は **1階層** まで
4. 抽出後の SKILL.md は 400行以下を目標とする
5. `references/` に抽出したファイルが 100行を超える場合は目次を付ける

**抽出対象の優先順位**:

1. 大きなコード例、テンプレート例 → `references/{topic}-examples.md`
2. 詳細な判定表、分類表 → `references/{topic}-standards.md`
3. ワークフローの詳細手順 → `references/{topic}-workflow.md`
4. 開発プロセスの詳細 → `references/{topic}-process.md`
