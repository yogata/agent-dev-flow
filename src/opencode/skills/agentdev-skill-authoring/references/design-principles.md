# 設計原則

本ファイルは `agentdev-skill-authoring` SKILL.md の補助資料であり、SKILL.md 本文に圧縮して記載するとエントリポイントとしての役割を損なう設計原則の詳細（簡潔さ、自由度、トークン予算管理、行数ガバナンス、抽出ルール、命名規則、description記述、トリガー設計、複雑度分類、段階的開示、配置判断フロー、参照記述ルール）を扱う。
SKILL.md は本ファイルを参照しつつ、本文では要約と判断表のみを保持する。

## 目次

- [簡潔さを優先する](#簡潔さを優先する)
- [自由度](#自由度)
- [トークン予算管理](#トークン予算管理)
- [行数ガバナンス](#行数ガバナンス)
- [命名規則](#命名規則)
- [効果的な description の記述](#効果的な-description-の記述)
- [トリガー設計](#トリガー設計)
- [複雑度分類](#複雑度分類)
- [段階的開示](#段階的開示)
- [配置判断フロー](#配置判断フロー)
- [スキル粒度と参照妥当性](#スキル粒度と参照妥当性)
- [参照記述ルール](#参照記述ルール)

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
|---|---|---|
| **High** | 複数の有効なアプローチが存在、文脈依存の判断 | コードレビュー、分析タスク |
| **Medium** | 推奨パターンはあるが変動OK | 設定可能なテンプレート |
| **Low** | 操作が脆くエラーが出やすい、一貫性が重要 | DB マイグレーション、デプロイ手順 |

## トークン予算管理

コンテキストウィンドウは有限リソース。定量的な予算管理で品質を担保:

| 指標 | 上限 | 根拠 |
|---|---|---|
| **SKILL.md 行数** | ≤500行 | トリガー時に全文がコンテキストに読み込まれる |
| **指示トークン数** | <5,000 tokens | 1スキルが占めるコンテキストの適正規模 |
| **参照ファイル** | 無制限（漸進的読み込み） | 必要時のみ読み込まれるため影響は限定的 |

トークン数の見積もり: 英語は約4文字≈1 token、日本語は約1.5文字≈1 token。
実測推奨。
予算超過の兆候: 400行超で分割検討、同セクション反復参照は統合、未アクセスファイルは削除検討。

## 行数ガバナンス

SKILL.md の行数が **500行を超過** した場合、`references/` サブディレクトリへの抽出が **必須** となる。
行数は形式基準であり、知識の局所集中の緩和を本旨とする。

| 行数 | 判定 | アクション |
|---|---|---|
| ≤400行 | 適正 | なし |
| 401〜500行 | 抽出検討 | 独立した関心事を `references/` に移動する計画を立案 |
| >500行 | 必須抽出 | SKILL.md を概要、ナビゲーションに絞り、詳細を `references/` に切り出し |

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

## 命名規則

**動名詞形（gerund form）** を推奨。実行する活動を明確に示す:

- ✓ `processing-pdfs`, `analyzing-spreadsheets`, `testing-code`
- ✓ `pdf-processing`, `spreadsheet-analysis`（名詞句も可）
- ✗ `helper`, `utils`, `tools`（曖昧すぎる）
- ✗ `anthropic-helper`, `claude-tools`（予約語を含む）

ルール: 小文字、数字、ハイフンのみ。
最大64文字。

## 効果的な description の記述

description は **3人称** で書く（システムプロンプトに注入されるため）。
何をするか + いつ使うかの両方を含める。
100+のスキルから正しいものを選ぶために十分な詳細が必要。
descriptionはスキル選択の要。

### トリガー表記規約（USE FOR/ DO NOT USE FOR）

`USE FOR:`/ `DO NOT USE FOR:` は skill description 内に **必須** で記述する。

**配置場所**: frontmatter の `description` フィールド内。

**フォーマット**:
- `USE FOR:` の後にカンマ区切りで適用場面を列挙（インライン）
- `DO NOT USE FOR:` の後にカンマ区切りで除外場面を列挙
- 両方とも記述することが推奨。`WHEN:` 形式も可
- description 全体は3人称、事実ベースで記述する

**スコープ境界の明確化**:
- Positive trigger は **具体的な操作、場面** を示す（抽象概念は避ける）
- Negative trigger は **隣接スキルの領域** を除外する
- trigger 数は 3〜7個が適正

## トリガー設計

description内に `USE FOR:`/ `DO NOT USE FOR:` を埋め込む。
agentskills.ioのde facto標準。
`WHEN:` も可（Microsoft sensei形式）。

```yaml
# Good：トリガー明示付き
description: Manages git worktree creation, switching, and cleanup based on branch names. USE FOR: creating worktrees, switching between branches, cleaning up completed worktrees. DO NOT USE FOR: basic git operations like commit/push/pull.

# Bad：曖昧で選択精度が低い
description: Helps with documents
```

トリガー設計のポイント:
- **Positive triggers** (`USE FOR:`): エージェントがこのスキルを選ぶべき場面を列挙
- **Negative triggers** (`DO NOT USE FOR:`): 誤選択を防ぐ除外条件を明記
- トリガーはdescriptionテキスト内に記述（frontmatterの別フィールドにはしない）

## 複雑度分類

3段階の複雑度に応じて構造とトークン予算を調整する:

| 複雑度 | 基準 | SKILL.md行数 | 構造 | トークン予算 |
|---|---|---|---|---|
| **simple** | 単一関心、<200行 | <200行 | SKILL.mdのみ | <2,000 tokens |
| **moderate** | 複数関心、参照ファイル必要 | 200-400行 | SKILL.md + 1-2参照ファイル | 2,000-4,000 tokens |
| **detailed** | 複雑なワークフロー、ドメイン別モジュール | 400-500行 | SKILL.md + references/ ディレクトリ | 4,000-5,000 tokens |

デフォルトは **simple**（200行以内が最善）。
複数の独立した関心事があれば **moderate**。
ドメイン横断で複数モジュールが必要な場合のみ **detailed**。

## 段階的開示

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

### 深いネストの回避

参照は **SKILL.mdから1階層まで**。
深いネストは部分的な読み込みを引き起こす。

### 長い参照ファイルの構造化

100行を超える参照ファイルには目次を付ける。

## 配置判断フロー

新規コンテンツをどこに配置するかの判断フロー:

```
Q1: 実行時配布物で個別プロジェクトで実行されるか？
  → Yes: Q2 へ / No: Q5 へ（authoring-only）

Q2: 宣言的ルール・判断基準・ドメイン知識 か？
  → Yes: Skill / No: Q3 へ

Q3: 決定的でテスト可能な処理ロジックか？
  → Yes: Script（scripts/） / No: Q4 へ

Q4: 出力構造・プレースホルダーか？
  → Yes: Template（templates/） / No: 再評価

Q5: 現在設計の記述か？
  → Yes: Design（docs/designs/） / No: Q6 へ

Q6: 将来の設計・運用・文書システムを制約する決定の記録か？
  → Yes: Decision（docs/decisions/） / No: Q7 へ

Q7: 人間向けナビゲーション・案内か？
  → Yes: Guide（docs/guides/） / No: 適切な分類先を再検討
```

各分岐の判定基準:

| 分岐 | 判定基準 | 例 |
|---|---|---|
| 実行時配布物 | 個別プロジェクトで command/skill 実行時に必要 | 判断基準、テンプレート、検査スクリプト |
| Skill | 再利用可能、宣言的、複数 command から参照可能 | フェーズ体系、命名規則、状態遷移 |
| Script | 入力が同じなら出力も同じ。テスト可能 | 採番、validation、INDEX 生成 |
| Template | 変数置換で使用。ロジックなし | Issue/PR 本文、コメント |
| Design | 現在の構造、契約、ルールの記述 | system.md、patterns.md |
| ADR | 「なぜその決定をしたか」の記録 | 技術選定、方針変更 |
| Guide | 人間向けの案内、説明 | ワークフロー概要、クイックスタート |

**注意**: skill `references/` は実行時配布物のみを含める（現在は Design system.md で規定）。
authoring-only 資料は `references/` に含めない。

配置判断の補強:
- Command 固有の実行手順（Issue 作成、保存、削除、完了報告）は Skill 化せず Command に置く
- 出力本文や固定文言は Template、決定的でテスト可能な検査は Script に置く
- 操作安全手順は、複数 Command から再利用される場合のみ操作用 Skill として切り出す

## スキル粒度と参照妥当性

Skill は、同一関心、同一責任境界、同一判断モデルを共有し、矛盾しない `USE FOR`/ `DO NOT USE FOR` で説明できる単位とする。

### 粒度判断

同一 Skill にまとめる条件:
- 複数の `USE FOR` が同じ判断モデルに属する
- 入力、出力、責任境界が同じ利用文脈で説明できる
- `DO NOT USE FOR` が各用途で矛盾せず、隣接 Skill との境界を一貫して示せる

Skill 分割候補:
- 同じ関心に見えても、`USE FOR`/ `DO NOT USE FOR` が用途ごとに分岐する
- 入力、出力、判断モデル、責任境界のいずれかが用途ごとに異なる
- 片方の用途で必要な禁止条件が、別用途では正当な実行条件になる

### references/* 分割基準

`references/*` は同一 Skill 内の段階的開示であり、小さい Skill ではない。
詳細手順、判定表、例、長いチェックリストを遅延読み込みするために使う。

`references/*` に切り出してよい条件:
- SKILL.md の判断モデルは単一のまま、詳細だけが長い
- 参照ファイルを読まなくても Skill の適用可否を判断できる
- 参照ファイルが SKILL.md の `USE FOR`/ `DO NOT USE FOR` を変更しない

Skill 分割を検討する条件:
- `references/*` ごとに独自の `USE FOR`/ `DO NOT USE FOR` が必要になる
- 参照ファイルごとに入力、出力、責任境界、判断モデルが異なる
- 参照ファイルを選ぶこと自体が別 Skill の選択判断になっている

配置判断は配置判断フロー（前節）を優先し、Skill 粒度の最終確認として本節を使う。

## 参照記述ルール

### command → skill 参照の原則

1. **実在パス明記**: command から template/ reference/ script を参照する場合、実在するリポジトリルート相対パスを明記すること
2. **自然言語ラベル参照禁止**: `workflow classification`、`Issue 生成プロトコル` 等の自然言語ラベルだけでファイルを推測させる参照を禁止する。参照先が必要な場合は skill 名、`SKILL.md`、または実在する path を明記すること
3. **skill 内部構造参照禁止**: command は他 skill 内部の protocol 名、Step 名、Section 名、見出し名を参照しないこと。skill を参照する場合は skill 名（`agentdev-*`）までとすること
4. **command 固有 Step 番号の skill 側保持禁止**: skill は command 固有の Step 番号、Phase 名を一次情報として保持しないこと。概念名を使用すること

### skill → command 参照の原則

1. **概念名使用**: skill は command の Step 番号、Phase 名を参照せず、概念名（処理名）を使用すること
2. **例**: `case-run Step 10` → `Design 更新時`、`case-close Step 8` → `完了時`

### See Also 記述規約

`See Also` セクションは関連 skill の**補助的な発見導線**として機能する。

**配置場所**: SKILL.md 末尾。

**記述ルール**:
- 関連 skill 名と簡潔な説明（発見導線としての文脈）を記述
- **実行判断材料を含めない**: 委譲先の条件、責務境界、禁止条件、停止条件は See Also ではなく本文（`USE FOR`、`DO NOT USE FOR`、責務境界セクション、該当ルール本文）に記述する
- **DO NOT USE FOR との重複を避ける**: DO NOT USE FOR に既に記載されている委譲先、禁止条件を See Also に重複して記述しない
- **別 SSoT 管理対象を含めない**: 全コマンド一覧等は skill 内に保持せず、該当する README 等を参照する

**OK**: `- **agentdev-req-analysis**: 要件分析手法`（発見導線）
**NG**: `- **agentdev-gh**: gh オプションの運用詳細`（実行判断材料）
