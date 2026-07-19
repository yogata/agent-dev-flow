---
name: agentdev-skill-authoring
description: Provides quality criteria and best practices for authoring OpenCode SKILL.md files across five evaluation axes and four check protocols. USE FOR: creating new skills, improving existing skills, reviewing skill quality, designing skill structure, writing trigger descriptions, or planning progressive disclosure. DO NOT USE FOR: creating command definitions, general coding tasks, or simple documentation fixes.
---

# スキル作成ベストプラクティス

OpenCodeのSKILL.mdを書く際の実践ガイド。
スキルの品質を7つの観点から体系的に担保する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-skill-authoring.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 1. 設計原則

SKILL.md の設計は、簡潔さ、自由度、トークン予算、行数ガバナンスの4観点で設計する。行数が500行を超える場合は `references/`への抽出が必須となり、抽出後の SKILL.md は400行以下を目標とする（REQ-0113-010）。各原則の詳細、コード例、行数ガバナンス表、抽出ルールと優先順位は [references/design-principles.md](references/design-principles.md) 参照。

## 2. スキル仕様

### 命名規則

**動名詞形（gerund form）** を推奨。実行する活動を明確に示す:

- ✓ `processing-pdfs`, `analyzing-spreadsheets`, `testing-code`
- ✓ `pdf-processing`, `spreadsheet-analysis`（名詞句も可）
- ✗ `helper`, `utils`, `tools`（曖昧すぎる）
- ✗ `anthropic-helper`, `claude-tools`（予約語を含む）

ルール: 小文字、数字、ハイフンのみ。
最大64文字。

### 効果的な description の記述

description は **3人称** で書く（システムプロンプトに注入されるため）。
何をするか + いつ使うかの両方を含める。
100+のスキルから正しいものを選ぶために十分な詳細が必要。
descriptionはスキル選択の要。

### トリガー設計

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

### See Also 記述規約

`See Also` セクションは関連 skill の**補助的な発見導線**として機能する。

**配置場所**: SKILL.md 末尾。

**記述ルール**:
- 関連 skill 名と簡潔な説明（発見導線としての文脈）を記述
- **実行判断材料を含めない**: 委譲先の条件、責務境界、禁止条件、停止条件は See Also ではなく本文（`USE FOR`、`DO NOT USE FOR`、責務境界セクション、該当ルール本文）に記述する
- **DO NOT USE FOR との重複を避ける**: DO NOT USE FOR に既に記載されている委譲先、禁止条件を See Also に重複して記述しない
- **別 SSoT 管理対象を含めない**: 全コマンド一覧等は skill 内に保持せず、該当する README 等を参照する

**OK**: `- **agentdev-req-analysis**: 要件分析手法`（発見導線）
**NG**: `- **agentdev-gh-cli**: --body-file 使用、安全な読み取り手順`（実行判断材料）

## 3. 構造設計

### 複雑度分類

3段階の複雑度に応じて構造とトークン予算を調整する:

| 複雑度 | 基準 | SKILL.md行数 | 構造 | トークン予算 |
|--------|------|-------------|------|-------------|
| **simple** | 単一関心、<200行 | <200行 | SKILL.mdのみ | <2,000 tokens |
| **moderate** | 複数関心、参照ファイル必要 | 200-400行 | SKILL.md + 1-2参照ファイル | 2,000-4,000 tokens |
| **detailed** | 複雑なワークフロー、ドメイン別モジュール | 400-500行 | SKILL.md + references/ ディレクトリ | 4,000-5,000 tokens |

デフォルトは **simple**（200行以内が最善）。
複数の独立した関心事があれば **moderate**。
ドメイン横断で複数モジュールが必要な場合のみ **detailed**。

### 段階的開示

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

## 4. 品質評価基準

スキルの品質を5つの軸で評価する:

| 軸 | 定義 | 評価基準 | よくある失敗 |
|----|------|----------|-------------|
| **明確性** | 指示が一意に解釈可能 | 各セクションが単一の明確な目的を持つ | 複数の意味に取れる表現 |
| **完全性** | 対象複雑度に必要な情報が存在 | ワークフローに欠落ステップがない | 「詳細は別途」で参照先が空 |
| **トリガー精度** | USE FOR/ DO NOT USE FOR が実際の選択場面と一致 | 偽陽性、偽陰性が少ない | 抽象的すぎるトリガー |
| **スコープ範囲** | 内容が定義済みスコープ内に収まる | 他スキルの領域に侵出していない | スコープクリープ |
| **アンチパターン検出** | 既知のアンチパターンが存在しない | 不要な説明、深いネストがない | セクション7のアンチパターン一覧にある問題 |

## 5. レビュープロトコル

スキル品質を5軸（明確性、完全性、トリガー精度、スコープ範囲、アンチパターン検出）で評価し、frontmatter、予算、構造、助言、サブエージェント編集安全性の4観点でチェックする。各観点のチェックリストと frontmatter `name:` のバッククォート禁止規定（PR #1334 事例）は [references/review-protocol.md](references/review-protocol.md) 参照。

## 6. 開発ワークフロー

スキルは「スキルなしでタスク完了 → パターン特定 → スキル作成 → レビュー → 構造改善 → テスト → 反復」のサイクルで開発する。テンプレートパターン（Strict/ Flexible）、条件付きワークフローパターン、評価先行構築、フィードバックループの詳細は [references/development-workflow.md](references/development-workflow.md) 参照。

## 7. アンチパターン

Windows形式パス、多すぎる選択肢、不必要な前提知識の説明、深いネストの参照、時間依存の情報、用語の不統一、過度な具体性、frontmatterの拡張の8パターンを避ける。アンチパターン一覧表と詳細は [references/development-workflow.md](references/development-workflow.md) 参照。

## 8. コマンドとスキルの境界

Skill の品質基準は本スキルの範囲とする。
Command に何を置き、何を置かないかの境界定義は `artifact-contracts.md`（artifact-contracts SPEC）を参照。
Skill 作成時に Command 側の詳細に踏み込みすぎないこと。

## 参照記述ルール

### command → skill 参照の原則

1. **実在パス明記**: command から template/ reference/ script を参照する場合、実在する repo-root-relative path を明記すること
2. **自然言語ラベル参照禁止**: `workflow classification`、`Issue 生成プロトコル` 等の自然言語ラベルだけでファイルを推測させる参照を禁止する。参照先が必要な場合は skill 名、`SKILL.md`、または実在する path を明記すること
3. **skill 内部構造参照禁止**: command は他 skill 内部の protocol 名、Step 名、Section 名、見出し名を参照しないこと。skill を参照する場合は skill 名（`agentdev-*`）までとすること
4. **command 固有 Step 番号の skill 側保持禁止**: skill は command 固有の Step 番号、Phase 名を一次情報として保持しないこと。概念名を使用すること

### skill → command 参照の原則

1. **概念名使用**: skill は command の Step 番号、Phase 名を参照せず、概念名（処理名）を使用すること
2. **例**: `case-run Step 10` → `SPEC 更新時`、`case-close Step 8` → `完了時`

## 9. 配置判断フロー

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
| 実行時配布物 | 個別プロジェクトで command/skill 実行時に必要 | 判断基準、テンプレート、検査スクリプト |
| Skill | 再利用可能、宣言的、複数 command から参照可能 | フェーズ体系、命名規則、状態遷移 |
| Script | 入力が同じなら出力も同じ。テスト可能 | 採番、validation、INDEX 生成 |
| Template | 変数置換で使用。ロジックなし | Issue/PR 本文、コメント |
| SPEC | 現在の構造、契約、ルールの記述 | system.md、patterns.md |
| ADR | 「なぜその決定をしたか」の記録 | 技術選定、方針変更 |
| Guide | 人間向けの案内、説明 | ワークフロー概要、クイックスタート |

**注意**: skill `references/` は実行時配布物のみを含める（現在は SPEC system.md で規定）。
authoring-only 資料は `references/` に含めない。

配置判断の補強:
- Command 固有の実行手順（Issue 作成、保存、削除、完了報告）は Skill 化せず Command に置く
- 出力本文や固定文言は Template、決定的でテスト可能な検査は Script に置く
- 操作安全手順は、複数 Command から再利用される場合のみ操作用 Skill として切り出す

## 10. スキル粒度と参照妥当性

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

配置判断は 9 章を優先し、Skill 粒度の最終確認として本章を使う。

## references 一覧

SKILL.md 本文から遅延読み込みされる詳細資料。各ファイルの冒頭に本文への文脈宣言を備える（REQ-0113-010）。

| ファイル | 内容 |
|----------|------|
| [references/design-principles.md](references/design-principles.md) | 設計原則の詳細（簡潔さ、自由度、トークン予算管理、行数ガバナンス、抽出ルールと優先順位） |
| [references/review-protocol.md](references/review-protocol.md) | レビュープロトコル（frontmatter、予算、構造、助言、サブエージェント編集安全性のチェックリスト） |
| [references/development-workflow.md](references/development-workflow.md) | 開発ワークフロー（反復開発、フィードバックループ、評価先行構築、テンプレートパターン）とアンチパターン一覧 |

## See Also

- **agentdev-doc-writing**: ADR/REQ/SPEC横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）


