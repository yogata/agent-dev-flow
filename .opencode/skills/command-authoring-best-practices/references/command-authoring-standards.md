# Command Authoring Standards

Command定義（`.opencode/commands/`）の行数目安、Steps数目安、書いてよい/書くべきでない内容、review checklist を定義する。

## Contents

- 行数目安
- Steps 数目安
- 書いてよい内容
- 書くべきでない内容
- Content vs Reference 分割ガイド
- Review Checklist

## 行数目安

| 行数 | 判定 | アクション |
|------|------|-----------|
| ≤100行 | ✅ 目標 | なし |
| 101〜150行 | ⚠️ 分割検討 | Skill reference / Script への切り出しを評価 |
| 151〜200行 | 🔶 分割推奨 | 具体的な切り出し計画を立案 |
| >200行 | ❌ 必須検討 | orchestration skill / reference / script への切り出しが必須 |

### カウント対象

- frontmatter（`---`で囲まれた部分）を含む
- 空行を含む
- コードブロック内の行を含む

### 除外対象

- YAML frontmatter の load_skills / agent / description は必須フィールドとして扱い、行数削減のために削除しない

## Steps 数目安

| Steps数 | 判定 | アクション |
|---------|------|-----------|
| 5〜12個 | ✅ 適正 | なし |
| 13〜15個 | ⚠️ 検討 | 複数Stepを1つに統合できるか評価 |
| >15個 | ❌ 分割 | Skill参照・Script化で削減 |

### Step の粒度

1 Step = 1つの明確な操作単位。以下のいずれかに該当すること:

- ファイルの読み書き
- 外部コマンドの実行（gh, git等）
- ユーザーへの確認
- 条件分岐の境界（if/elseの分岐点）
- Skillの参照

### 統合可能なStepの例

```markdown
# Bad — 細かすぎる
1. REQファイルを検索する
2. REQファイルを読み込む
3. REQファイルの内容を解析する

# Good — 1 Stepに統合
1. REQファイルを読み込み、要件を抽出する（skill参照）
```

## 書いてよい内容

Commandに記述してよい内容:

- **Input**: ユーザーから受け取る引数・ファイルパス・Issue番号等
- **Output**: Command完了時に生成される成果物
- **Guardrails**: 実行前の前提条件チェック・禁止事項
- **Steps**: 高レベルな実行手順（5〜12個）
- **ユーザー確認ポイント**: 実行中の確認・選択の提示
- **load_skills**: 参照するSkillの宣言
- **使用するSkill一覧**: Steps内で参照するSkill名
- **成果物の読み書き対象**: ファイルパス・Issue/PR番号
- **Command固有の制約**: 特定Commandにのみ適用される前提・制限
- **完了報告フォーマット**: 出力の構造定義（Skill参照も可）

## 書くべきでない内容

Commandから切り出すべき内容:

| 内容 | 移動先 | 理由 |
|------|--------|------|
| 詳細な判定表・分類表 | Skillの`references/` | 再利用可能な知識 |
| 状態遷移図・状態機械 | Orchestration skill | 大きな状態管理 |
| 再開ポイント検出ロジック | Orchestration skill | 複雑な制御フロー |
| CI loop・Wave scheduling | Orchestration skill | 継続的実行制御 |
| サブエージェント protocol | Orchestration skill | 通信プロトコル定義 |
| テンプレート選定ルールの詳細 | Skill | 判断基準 |
| スキーマ定義（JSON/YAML） | Skillの`references/` | 構造定義 |
| 決定的な変換・検証・生成 | Script | テスト可能な処理 |
| フォーマッティング処理 | Script | 純粋関数 |
| 共通安全手順の詳細 | Skill（gh-cli-best-practices等） | 再利用 |

## Content vs Reference 分割ガイド

Commandの肥大化を防ぐため、内容と参照先を適切に分割する。

### 分割の判断基準

| 観点 | Commandに残す | Skill reference に移す |
|------|---------------|----------------------|
| 再利用性 | そのCommand固有 | 複数Commandで使用 |
| 変更頻度 | Commandと同頻度 | 独立して変更される |
| 行数 | 10行以内の記述 | 10行超の詳細 |
| 性質 | 手続き的指示 | 宣言的知識 |

### 分割パターン

```
command.md                    # 薄いdispatcher（≤100行）
├── Input / Output / Steps
├── Guardrails
└── load_skills: [skill-a, skill-b]

skill-a/
├── SKILL.md                  # 基本原則・判断基準
└── references/
    └── detail.md             # 詳細な判定表・分類表
```

## Review Checklist

Command作成・改定時に確認する項目:

### サイズ確認

- [ ] 総行数が150行以内か（超過する場合は分割計画が存在するか）
- [ ] Stepsが5〜12個か
- [ ] frontmatterの必須フィールドが揃っているか

### 責務確認

- [ ] 詳細な判定表・分類表がSkillに移されているか
- [ ] 大きな状態機械がOrchestration skillに移されているか
- [ ] 決定的処理がScriptに移されているか
- [ ] テンプレート選定ルールの詳細がSkillに移されているか

### load_skills 整合性

- [ ] Command本文で参照しているSkillが全て`load_skills`に含まれているか
- [ ] `load_skills`に含まれるSkillがCommand本文で実際に参照されているか
- [ ] Skill配下のテンプレートを参照する場合、当該Skillが`load_skills`に含まれているか
- [ ] Skill配下のreferenceを参照する場合、当該Skillが`load_skills`に含まれているか

### 品質確認

- [ ] 各Stepが1つの明確な操作単位か
- [ ] ユーザー確認ポイントが適切に配置されているか
- [ ] Guardrailsに実行前の前提条件が記載されているか
- [ ] 完了報告フォーマットが指定されているか（Skill参照も可）
- [ ] 既存の良い分離（req-analysis/req-file-manager等）を維持しているか

## 参照

- **artifact-boundaries.md**: Command / Skill / Template / Script の責務境界定義
- **ADR-0001**: Command/Skill/Template/Script責任分界の正式定義
- **skill-authoring-best-practices**: Skill品質基準
