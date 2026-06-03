# Command Authoring Standards

Command定義（`.opencode/commands/`）の行数目安、Steps数目安、書いてよい/書くべきでない内容、review checklist を定義する。

## Contents

- 行数目安
- Steps 数目安
- 書いてよい内容
- 書くべきでない内容
- Content vs Reference 分割ガイド
- 後方互換性維持の設計原則
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

- YAML frontmatter の `agent` / `description` は必須フィールドとして扱い、行数削減のために削除しない
- `implementation_pattern` / `secondary_pattern` / `load_skills` 等の dev メタデータは frontmatter に記述禁止（Case 5 / RU-0020, REQ-0108-095~097, 124）

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
| 共通安全手順の詳細 | Skill（agentdev-gh-cli等） | 再利用 |

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

## 後方互換性維持の設計原則

コマンド・スキル拡張時に後方互換性を維持するための設計原則。既存フローを破壊する拡張を防止する。

### 原則1: 既存Step不変 + 分岐点のみ注入

既存コマンドを拡張する場合、既存の Step 内容を変更せず、分岐点のみで新規パスを注入する（SHALL — REQ-0111-001）。

**目的**: 既存の利用者が依存しているフローを破壊しないため。

**適用パターン**:

```
# 良い例: 既存Stepの間に新規Stepを挿入
Step 3: 既存の処理（変更なし）
Step 3a: [NEW] 条件分岐 — 新規要件が適用される場合のみ実行
Step 4: 既存の処理（変更なし）

# 悪い例: 既存Step内に条件を追加して内容を変更
Step 3: 既存の処理 + 新規条件の分岐 ← Step内容を変更している
```

**判定基準**: 拡張前後で、既存パスの全 Step が同一のテキスト・同一の順序で実行されること。

### 原則2: ディレクトリリネームには git mv を使用

ディレクトリのリネームには `git mv` を使用し、Write/Delete による実装を禁止する（SHALL — REQ-0111-002）。

**目的**: git 履歴の追跡可能性を維持するため。Write/Delete では git がファイルの移動を追跡できず、履歴が断絶する。

**適用ルール**:

| 操作 | 許可 | 理由 |
|------|------|------|
| `git mv old/ new/` | ✅ | git が移動を追跡 |
| Write新規 + Delete旧 | ❌ | 履歴断絶 |

### 原則3: 新旧パスの明示的分離

新規パスと既存パスを明示的に分離して記述する（SHALL — REQ-0111-003）。

**目的**: レビュー時に新旧の境界を即座に識別できるようにするため。

**適用パターン**:

```markdown
## Steps

### 既存パス（変更なし）

1. Step 1: ...
2. Step 2: ...

### 新規パス（REQ-XXXX で追加）

3. Step 2a: ... — 条件Xが成立する場合のみ
4. Step 2b: ...
```

**判定基準**: 拡張箇所に `[NEW]` マーカーまたは「新規パス」見出しによって新旧の境界が判別できること。

## Review Checklist

Command作成・改定時に確認する項目:

### サイズ確認

- [ ] 総行数が150行以内か（超過する場合は分割計画が存在するか）
- [ ] Stepsが5〜12個か
- [ ] frontmatterが description + agent のみか（dev メタデータ禁止: implementation_pattern / secondary_pattern / load_skills / pattern / workflow_route / branch_type / labels）

### 責務確認

- [ ] 詳細な判定表・分類表がSkillに移されているか
- [ ] 大きな状態機械がOrchestration skillに移されているか
- [ ] 決定的処理がScriptに移されているか
- [ ] テンプレート選定ルールの詳細がSkillに移されているか

### load_skills 確認（Case 5 / RU-0020 以降）

- [ ] `load_skills` は frontmatter に記述していないか（禁止: REQ-0108-097）
- [ ] `implementation_pattern` / `secondary_pattern` は frontmatter に記述していないか（禁止: REQ-0108-095, 096）
- [ ] command 本文で参照している Skill が command-map.md の pattern 定義と整合しているか

### load_skills Prompt Budget（REQ-0103-027~034, REQ-0108-060~061）

- [ ] `load_skills` が frontmatter に混入していないか（REQ-0108-097, 禁止）
- [ ] `implementation_pattern` / `secondary_pattern` が frontmatter に混入していないか（REQ-0108-095, 096, 禁止）
- [ ] `pattern` / `workflow_route` / `branch_type` / `labels` が frontmatter に混入していないか（REQ-0108-124, 禁止）

### 共通処理重複確認（REQ-0103-040~043, REQ-0108-064）

- [ ] 複数 command で使う共通処理（git 同期、push、hash 照合等）が共通 skill reference / script に集約されているか
- [ ] command 側には共通処理名・入出力・停止条件のみが保持されているか
- [ ] 同種の重複記述が複数箇所に現れていないか（現れた場合は共通化または検査ルール追加を検討）

### Canonical Path 確認（REQ-0103-039, REQ-0108-052）

- [ ] skill reference パスに `reference/`（単数形）が残っていないか（`references/` が canonical）
- [ ] 削除した過検出が再発しないよう regression test が追加されているか

### 完了報告 Variant 確認（REQ-0107-019~020, REQ-0107-042~043）

- [ ] command 定義に完了報告本文・追加ブロック・次コマンド文面が直接保持されていないか
- [ ] 完了報告 variant file path、選択条件、置換変数のみが保持されているか
- [ ] 各 variant に共通必須フィールド（完了コマンド・対象・結果・検証結果・git永続化・次のコマンド）が含まれているか

### 品質確認

- [ ] 各Stepが1つの明確な操作単位か
- [ ] ユーザー確認ポイントが適切に配置されているか
- [ ] Guardrailsに実行前の前提条件が記載されているか
- [ ] 完了報告フォーマットが指定されているか（Skill参照も可）
- [ ] 既存の良い分離（agentdev-req-analysis/agentdev-req-file-manager等）を維持しているか

### 追加時の判定（REQ-0108-062~063）

- [ ] 新しい command / skill / reference を追加する場合、既存 artifact への APPEND / UPDATE で足りるかを確認したか
- [ ] 長い説明を追加する場合、command / SKILL.md へ直接追加する前に reference / template / script のいずれに置くべきかを判定したか

## 参照

- **artifact-boundaries.md**: Command / Skill / Template / Script の責務境界定義
- **ADR-0001**: Command/Skill/Template/Script責任分界の正式定義
- **agentdev-skill-authoring**: Skill品質基準
