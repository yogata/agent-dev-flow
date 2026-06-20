# コマンド作成標準（Command Authoring Standards）

Command定義（`.opencode/commands/`）の行数目安、Steps数目安、書いてよい/書くべきでない内容、review checklist を定義する。

## 目次

- 行数目安
- Steps 数目安
- Step 表記規則
- Token 基準
- 書いてよい内容
- 書くべきでない内容
- Content vs Reference 分割ガイド
- 後方互換性維持の設計原則
- 実行時パス（Runtime Path）規約
- Review Checklist
- 検査観点展開基準
- 委譲定義最小構成
- delegated_check
- 中間成果基準
- verbatim 置換方針

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
- dev メタデータは frontmatter に記述禁止（Case 5 / RU-0020, 規定の行番号範囲）

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

## Step 表記規則

Command の最上位 Step は整数のみで表記する。小数 Step と英字サブステップは使用しない。

| 表記 | 判定 | 用途 |
|---|---|---|
| `Step 1` | OK | 最上位 Step |
| `Step 10` | OK | 最上位 Step |
| `Step 10-1` | OK | サブステップ |
| `Step 10-2` | OK | サブステップ |
| `Step 10.5` | NG | 小数 Step は禁止 |
| `Step 10a` | NG | 英字サブステップは禁止 |

### サブステップの使用条件

サブステップは、親 Step 内の局所的な確認・VERIFY・分岐を表す場合に限り `N-M` 形式で使用できる。独立した進行判断、保存、Issue / PR 更新、commit、push、ユーザー確認を伴う処理は最上位 Step へ昇格する。

### 既存 Step 追加時の扱い

既存 Step の間に処理を追加する場合も、英字や小数で差し込まない。近接 Step の統合または後続 Step の再番号付けにより、最上位 Step を整数のみで維持する。

## Token 基準

行数目安を補完する token 概算基準。行数目安は残置し、token 基準を補完情報として扱う。

### Token 概算ルール

- 概算式: `chars / 4`
- 日本語テキストは実際の token より過小に概算されるが、この誤差は許容する

### Command token 基準

| Token 数 | 判定 | アクション |
|----------|------|-----------|
| <3,500tk | ✅ 目標 | なし |
| 3,500〜5,000tk | ⚠️ 縮小推奨 | 理由を明示した上で維持可 |
| >5,000tk | ❌ 必須検討 | 分割・共通化による削減が必須 |

### SKILL.md token 基準

| Token 数 | 判定 | アクション |
|----------|------|-----------|
| <5,000tk | ✅ 目標 | なし |
| 5,000〜8,000tk | ⚠️ 縮小推奨 | 理由を明記した上で維持可 |
| >8,000tk | ❌ 必須検討 | references/ への分割が必須 |

### Token 削減手法

| 手法 | 説明 | 適用基準 |
|------|------|---------|
| 同型分岐の共通化 | 個別 step への重複記述ではなく、共通手順 + 差分表で表現する | 同じ構造の分岐が2箇所以上 |
| 表現の削減 | セマンティクス不変で、理由説明の過多・例の過多・強制条件表現の反復・長文表現を削減する | 同一意図の反復表現あり |
| セマンティクス維持確認 | 薄型化後にセマンティクス維持の確認メモを残す。薄型化はセマンティクスを維持して行うこと | 全 token 削減作業 |

### before/after 報告形式

token 削減の成果は以下の3区分で報告する:

| 区分 | 対象 |
|------|------|
| command-main | command 定義ファイル（`.opencode/commands/agentdev/*.md`） |
| skill-main | SKILL.md 本体 |
| skill-support | references/・templates/・scripts/ |

## 書いてよい内容

Commandに記述してよい内容:

- **Input**: ユーザーから受け取る引数・ファイルパス・Issue番号等
- **Output**: Command完了時に生成される成果物
- **Guardrails**: 実行前の前提条件チェック・禁止事項
- **Steps**: 高レベルな実行手順（5〜12個）
- **ユーザー確認ポイント**: 実行中の確認・選択の提示
- **使用するSkill一覧**: Steps内で参照するSkill名（本文内の宣言としてのみ記載）
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
└── Guardrails

skill-a/
├── SKILL.md                  # 基本原則・判断基準
└── references/
    └── detail.md             # 詳細な判定表・分類表
```

## 後方互換性維持の設計原則

コマンド・スキル拡張時に後方互換性を維持するための設計原則。既存フローを破壊する拡張を防止する。

### 原則1: 既存Step不変 + 分岐点のみ注入

既存コマンドを拡張する場合、既存の Step 内容を変更せず、分岐点のみで新規パスを注入する。

**目的**: 既存の利用者が依存しているフローを破壊しないため。

**適用パターン**:

```
# 良い例: 既存Stepの間に新規Stepを挿入し、後続Stepを再番号付け
Step 3: 既存の処理（変更なし）
Step 4: [NEW] 条件分岐 — 新規要件が適用される場合のみ実行
Step 5: 既存の処理（旧Step 4、内容変更なし）

# 悪い例: 既存Step内に条件を追加して内容を変更
Step 3: 既存の処理 + 新規条件の分岐 ← Step内容を変更している
```

**判定基準**: 拡張前後で、既存パスの全 Step が同一のテキスト・同一の順序で実行されること。

### 原則2: ディレクトリリネームには git mv を使用

ディレクトリのリネームには `git mv` を使用し、Write/Delete による実装を禁止する。

**目的**: git 履歴の追跡可能性を維持するため。Write/Delete では git がファイルの移動を追跡できず、履歴が断絶する。

**適用ルール**:

| 操作 | 許可 | 理由 |
|------|------|------|
| `git mv old/ new/` | ✅ | git が移動を追跡 |
| Write新規 + Delete旧 | ❌ | 履歴断絶 |

### 原則3: 新旧パスの明示的分離

新規パスと既存パスを明示的に分離して記述する。

**目的**: レビュー時に新旧の境界を即座に識別できるようにするため。

**適用パターン**:

```markdown
## Steps

### 既存パス（変更なし）

1. Step 1: ...
2. Step 2: ...

### 新規パス（REQ-XXXX で追加）

3. Step 3: ... — 条件Xが成立する場合のみ
4. Step 4: ...
```

**判定基準**: 拡張箇所に `[NEW]` マーカーまたは「新規パス」見出しによって新旧の境界が判別できること。

## 実行時パス（Runtime Path）規約

Command本文でパスを参照する際は実行時パス（runtime path）を使用する。Source path は agent-dev-flow 開発リポジトリ内でのみ有効であり、個別プロジェクト（consumer repository）には投影されない。

### 実行時パスと Source path の対応

| 用途 | 実行時パス（✅ 使用する） | Source path（❌ 使用しない） |
|------|---------------------------|---------------------------|
| Command 定義 | `.opencode/commands/agentdev/` | `src/opencode/commands/agentdev/` |
| Skill 本体 | `.opencode/skills/{name}/SKILL.md` | `src/opencode/skills/{name}/SKILL.md` |
| Skill テンプレート | `.opencode/skills/{name}/templates/` | `src/opencode/skills/{name}/templates/` |
| Skill 参照 | `.opencode/skills/{name}/references/` | `src/opencode/skills/{name}/references/` |
| Skill スクリプト | `.opencode/skills/{name}/scripts/` | `src/opencode/skills/{name}/scripts/` |

### OK / NG 具体例

**✅ OK — テンプレート参照時は実行時パスを使用する**:
```markdown
テンプレート `.opencode/skills/agentdev-workflow-templates/templates/close-report.md` を読み込む
```

**❌ NG — source path は実行時環境でアクセス不可**:
```markdown
テンプレート `src/opencode/skills/agentdev-workflow-templates/templates/close-report.md` を読み込む
```

**✅ OK — Skill 参照時は実行時パス**:
```markdown
Skill `agentdev-gh-cli`（`.opencode/skills/agentdev-gh-cli/SKILL.md`）の VERIFY操作を実行する
```

**❌ NG — source path で Skill を参照**:
```markdown
Skill `agentdev-gh-cli`（`src/opencode/skills/agentdev-gh-cli/SKILL.md`）の VERIFY操作を実行する
```

### 適用範囲

- Command 本文（Steps, Guardrails, Output 記述）
- Skill 本文内での他スキル参照
- テンプレートパス・スクリプトパスの記述

Source path は agent-dev-flow リポジトリ内の開発用文書（ADR, SPEC, Guide）でのみ使用する。

## Review Checklist

Command作成・改定時に確認する項目:

### サイズ確認

- [ ] 総行数が150行以内か（超過する場合は分割計画が存在するか）
- [ ] Stepsが5〜12個か
- [ ] frontmatterが description + agent のみか（dev メタデータ禁止: pattern / workflow_route / branch_type / labels）

### Token 確認

- [ ] Token 概算を chars/4 で算出したか
- [ ] Command token が 3,500tk 未満か（超過時は理由明示）
- [ ] SKILL.md token が 5,000tk 未満か（超過時は理由明記）
- [ ] 同型分岐が共通手順 + 差分表で表現されているか（個別 step 重複がないか）
- [ ] セマンティクス不変で削減可能な反復表現（理由説明・例・強制条件表現の反復・長文）がないか
- [ ] before/after を command-main / skill-main / skill-support の3区分で報告したか
- [ ] セマンティクス維持の確認メモを残したか

### 責務確認

- [ ] 詳細な判定表・分類表がSkillに移されているか
- [ ] 大きな状態機械がOrchestration skillに移されているか
- [ ] 決定的処理がScriptに移されているか
- [ ] テンプレート選定ルールの詳細がSkillに移されているか

### Command-map 整合確認

- [ ] command 本文で参照している Skill が command-map.md の pattern 定義と整合しているか

### Frontmatter 禁止フィールド確認

- [ ] `pattern` / `workflow_route` / `branch_type` / `labels` が frontmatter に混入していないか（禁止）

### 共通処理重複確認

- [ ] 複数 command で使う共通処理（git 同期、push、hash 照合等）が共通 skill reference / script に集約されているか
- [ ] command 側には共通処理名・入出力・停止条件のみが保持されているか
- [ ] 同種の重複記述が複数箇所に現れていないか（現れた場合は共通化または検査ルール追加を検討）

### 正規パス（Canonical Path）確認

- [ ] skill reference パスに `reference/`（単数形）が残っていないか（`references/` が正規パス）
- [ ] 削除した過検出が再発しないよう regression test が追加されているか

### 実行時パス（Runtime Path）確認

Command本文でテンプレート・スキル参照のパスを記述する際の OK/NG:

| 判定 | 記述例 | 理由 |
|------|--------|------|
| ✅ OK | `.opencode/skills/{name}/templates/close-report.md` | 実行時パス（投影先でアクセス可能） |
| ✅ OK | `.opencode/commands/agentdev/case-close.md` | 実行時パス（commandの実際の配置場所） |
| ❌ NG | `src/opencode/skills/{name}/templates/close-report.md` | source path（実行時環境に存在しない） |
| ❌ NG | `src/opencode/commands/agentdev/case-close.md` | source path（開発リポジトリ内のみ有効） |

- [ ] Command本文内のパス参照が実行時パス（`.opencode/...`）を使用しているか
- [ ] `src/opencode/...` で始まるパス参照が Command 本文に含まれていないか
- [ ] テンプレート参照先が `.opencode/skills/{skill-name}/templates/` で記述されているか

### 完了報告の種別確認

- [ ] command 定義に完了報告本文・追加ブロック・次コマンド文面が直接保持されていないか
- [ ] 完了報告の種別ファイルパス、選択条件、置換変数のみが保持されているか
- [ ] 各種別に共通必須フィールド（完了コマンド・対象・結果・検証結果・git永続化・次のコマンド）が含まれているか

### 品質確認

- [ ] 各Stepが1つの明確な操作単位か
- [ ] 最上位 Step が整数のみで表記されているか
- [ ] サブステップが必要な場合、`N-M` 形式（例: `10-1`, `10-2`）で表記されているか
- [ ] 小数 Step（例: `10.5`）や英字サブステップ（例: `10a`）が残っていないか
- [ ] ユーザー確認ポイントが適切に配置されているか
- [ ] Guardrailsに実行前の前提条件が記載されているか
- [ ] 完了報告フォーマットが指定されているか（Skill参照も可）
- [ ] 既存の良い分離（agentdev-req-analysis/agentdev-req-file-manager等）を維持しているか

### 語彙・境界確認（#586 予防ゲート）

- [ ] 旧コマンド名（`issue-*`, `tips-*`, bare slash form）を使用していないか（語彙レジストリ参照）
- [ ] 廃止済み概念（`req-backlog`, `reference/` 単数形, Pattern A/B/C/D）を参照していないか
- [ ] 旧スキル名（`issue-lifecycle`, `issue-template-manager` 等）を使用していないか
- [ ] 廃止済みスキル（integrity check の abolished-skill 検出で網羅）を参照していないか
- [ ] 完了報告フィールド名が正規名称（完了コマンド・対象・結果・検証結果・git永続化・次のコマンド）と一致しているか
- [ ] REQ範囲表記が実際のactive REQファイル数と一致しているか

### 追加時の判定

- [ ] 新しい command / skill / reference を追加する場合、既存 artifact への APPEND / UPDATE で足りるかを確認したか
- [ ] 長い説明を追加する場合、command / SKILL.md へ直接追加する前に reference / template / script のいずれに置くべきかを判定したか

### 委譲定義確認（ADR-0112）

- [ ] Command に検査観点の詳細を展開していないか（Skill reference への分離を検討したか）
- [ ] 委譲定義を追加する場合、最小契約（inputs, side_effect_boundary, output_contract, capture_handoff）を満たしているか
- [ ] delegated_check を使用する場合、親コマンドが検証結果の最終判断を保持しているか
- [ ] サブエージェントの成果物本文は verbatim、判定結果・調査過程・中間ログ・読解メモは圧縮返却として記述しているか
- [ ] SPEC/REQ/ADR 文書への置換は verbatim 置換方針に従っているか

## 検査観点展開基準

Command に検査観点の詳細を展開すべきでない基準。検査観点は Skill reference に分離し、Command は委譲定義のみを持つ。

### 展開すべきでない内容

| 内容 | 配置先 | 理由 |
|------|--------|------|
| 判定基準の詳細（閾値・条件式） | Skill `references/` | 再利用可能な知識 |
| 検査手順のステップバイステップ | Skill `references/` | 手続き的詳細 |
| エラー分類と対応表 | Skill `references/` | 宣言的知識 |
| レビュー観点の網羅リスト | Skill `references/` | 長大化しやすい |
| フォーマット検証ルール | Script | 決定的処理 |

### Command に残す内容

- 委譲先 Skill 名と reference path（必要な場合）
- 委譲種別（delegation_type、必要な場合のみ）
- 入力、副作用境界、返却形式、capture handoff の定義
- 親コマンドが最終判断を保持すること

### トリガー条件

以下のいずれかに該当する場合、検査観点の展開（Skill reference への分離）が必要:

1. Command 内の Step 記述が判定基準を含む（「X の場合 Y とする」が3箇所以上）
2. 検査処理が他のコマンドでも再利用可能
3. 検査観点の記述が 10 行を超える

## 委譲定義最小構成

Command に委譲を定義する際の最小構成:

```yaml
inputs:
  scope:
    - {対象ファイル、Issue、PR、ログ、成果物パスなど}
  constraints:
    - {参照してよい基準、読んでよい範囲、除外対象}
side_effect_boundary:
  allowed:
    - read_files
    - inspect_content
    - classify_candidates
    - return_summary
    - return_evidence
    - return_artifact_body_when_requested
  forbidden:
    - file_write
    - issue_pr_update
    - commit
    - push
    - user_confirmation
output_contract:
  status: pass | warn | fail | partial
  summary: {判定結果の要約}
  evidence:
    - {根拠ファイル、行、ログ、観測事実}
  artifact_body: {成果物本文がある場合のみverbatimで返す}
  parent_decision_required:
    - {親エージェントが判断・保存・確認すべき事項}
  side_effects: none
capture_handoff:
  intake_candidates:
    - {具体的な修正候補。保存は親エージェントが判断する}
  learning_candidates:
    - {再発防止知見候補。保存は親エージェントが判断する}
```

### 各フィールドの説明

| フィールド | 必須 | 説明 |
|---|---|---|
| `inputs` | ✅ | 委譲先に渡す限定された入力範囲 |
| `side_effect_boundary` | ✅ | 委譲先の副作用境界。許可操作は `read_files` / `inspect_content` / `return_evidence` 等の具体名で列挙し、包括値 `read_only` は使用しない（REQ-0140-011） |
| `output_contract` | ✅ | `pass` / `warn` / `fail` / `partial` を基本とする返却形式 |
| `capture_handoff` | ✅ | intake / learning 候補を保存せず親へ返す形式 |

### 任意フィールド

| フィールド | 説明 |
|---|---|
| `delegation_type` | gate_check / semantic_review / log_analysis / classification / extraction / draft_generation / controlled_case_execution の参考分類。必須ではない |
| `skill` | 委譲先 skill 名。Command 本文で接続点を明示する場合に記述する |
| `reference` | 委譲先が参照する skill reference / SPEC section の実行時パス |
| `on_result` | 親側の扱いを短く示す場合に記述する。最終判断は親コマンドが保持する |

### 禁止事項

- Command に委譲先の判定ロジックを記述しない
- `inputs` に自由記述のプロンプトを含めない（構造化フィールドのみ）
- `delegation_type` / `on_result` を必須項目として扱わない
- サブエージェントに保存、Issue / PR 更新、commit、push、ユーザー確認を委譲しない

## delegated_check

検証をサブエージェントに委譲する際の記述標準。

### 定義

```markdown
### Step N: {検査名}（delegated_check）

- **委譲先**: skill `{skill-name}`, reference `{path}`
- **入力**: {検査対象、参照基準、除外対象}
- **副作用境界**: 検査対象を直接修正しない。許可操作は `read_files` / `inspect_content` / `return_evidence` 等。保存、Issue / PR 更新、commit、push、ユーザー確認は禁止
- **返却形式**: `pass` / `warn` / `fail` / `partial`、要約、根拠、親判断事項、副作用なしの明示
- **capture handoff**: intake / learning 候補は保存せず親へ返す
- **制約**: 検証結果の最終判断は本コマンドが保持する
```

### 制約

| 制約 | 説明 |
|---|---|
| 親コマンド判断保持 | delegated_check の結果は「入力」であり、最終決定は親が行う |
| 結果の中間成果扱い | サブエージェント出力は中間成果。全体採用・部分採用・却下が可能 |
| 禁止: 結果の自動承認 | delegated_check の出力を自動的に最終結果として扱わない |
| 禁止: 副作用の委譲 | 検証結果に基づくファイル変更・git操作は親コマンドが実行 |

## 中間成果基準

サブエージェント出力を中間成果として扱う基準。

### 基準

| 基準 | 説明 |
|---|---|
| 親判断事項の明示 | `output_contract.parent_decision_required` で親が判断・保存・確認すべき事項を返す |
| 部分採用の許可 | 親コマンドは出力の一部を採用し、残りを却下できる |
| 修正の許可 | 親コマンドは出力を修正してから採用できる |
| 却下の許可 | 親コマンドは出力全体を却下できる |
| 却下理由の記録 | 却下時は理由を完了報告に記載 |

### Command への記述方法

```markdown
- **親判断事項**:
  - 採用候補: {採用する部分の説明}
  - 修正候補: {修正する部分の説明}
  - 却下候補: {却下する部分の説明}
```

### 禁止事項

- 判定結果・調査過程・中間ログ・読解メモを verbatim でそのまま最終成果として扱わない
- 採否判断なしに出力をファイルに書き込まない
- 中間成果の品質評価をサブエージェントに委譲しない（親コマンドの責務）

## verbatim 置換方針

サブエージェント出力によるファイル置換の方針。

### 方針

| 対象文書種別 | 置換方式 | 理由 |
|---|---|---|
| SPEC/REQ/ADR 文書 | verbatim 置換 | 文書構造・frontmatter・相互参照の保全 |
| Issue/PR 本文 | semantic rewrite | テンプレート構造内での意味保持 |
| レポート・診断結果 | semantic rewrite | フォーマット自由度高 |
| コード・Script | verbatim 置換 | 構文整合性の保全 |

### verbatim 置換の適用ルール

1. **置換対象セクションの明示**: 置換対象をセクション単位で指定（ファイル全体の置換は避ける）
2. **frontmatter の保持**: 置換対象に frontmatter が含まれる場合、置換後も保持
3. **相互参照の整合確認**: 置換後に参照先の存在確認を行う
4. **id / ファイル名の不変**: ADR番号・REQ番号は変更しない

### semantic rewrite の適用ルール

1. **テンプレート構造の遵守**: テンプレートのセクション構造を維持
2. **意味の保持**: 元の意図を変えない範囲での表現調整
3. **必須セクションの欠落防止**: テンプレートの必須セクションが欠落しないことを確認

## 他 Skill 参照境界

command は他 skill の内部 reference path（`references/*.md`）を直接指定しない。他 skill の詳細手順・判定表を参照する場合、skill 名と責務名までを記述し、必要な references 読込判断は対象 skill に委ねる。skill 自身が自分の references/ を案内する progressive disclosure は維持する（制限対象外とする）。

## 参照

- **artifact-boundaries.md**: Command / Skill / Template / Script の責務境界定義
- **Command/Skill/Template/Script責任分界の正式定義**: Command / Skill / Template / Script の責務境界定義
- **agentdev-skill-authoring**: Skill品質基準
