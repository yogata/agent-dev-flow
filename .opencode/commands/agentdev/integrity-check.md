---
description: AgentDevFlow artifact 整合性検査
agent: sisyphus
implementation_pattern: read-only-diagnostic
load_skills:
  - agentdev-integrity
  - agentdev-req-analysis
  - agentdev-adr-guidelines
  - agentdev-workflow-reporting
---

# Artifact 整合性検査

AgentDevFlow 管理下の artifact（REQ、ADR、skill、command、spec）の整合性を検査し、結果をレポートとして出力する read-only コマンド。

## 基本原則: Read-Only 制約

**検査対象 artifact を変更しない。** 検査対象以外の新規ファイル作成は許容する:

- ✅ 検出結果レポートの生成（`.agentdev/integrity/reports/`）— 検査対象外の新規作成
- ✅ intake item の新規作成（`.agentdev/intake/inbox/`）— 検査対象外の新規作成
- ❌ 検査対象ファイル（REQ、ADR、skill、command、specs 等）の変更 — 禁止

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
| Skill 定義 | `.opencode/skills/*/SKILL.md` | `glob` |
| Skill reference | `.opencode/skills/**/reference/*.md` | `glob` |
| Skill references | `.opencode/skills/**/references/*.md` | `glob` |
| Command ファイル | `.opencode/commands/**/*.md`（`README.md` を含む） | `glob` |
| Command README | `.opencode/commands/agentdev/README.md` | `glob` |
| Root README | `README.md` | `Read` |
| Specs ファイル | `docs/specs/*.md` | `glob` |

各ファイルの内容を `Read` tool で読み込む。ファイルが存在しないカテゴリは空として扱い、警告を出力する。

### 2. REQ frontmatter↔ファイル名整合性検査

各 REQ ファイルについて以下を検査する:

- **(a) frontmatter `id` ↔ ファイル名**: ファイル名 `REQ-{NNNN}.md` の `{NNNN}` と frontmatter の `id` 値（例: `REQ-0103`）が一致するか
- **(b) frontmatter 必須フィールド**: `id`、`title`、`created`、`updated`、`tags` が存在するか
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

### 6. 旧 namespace 残存検査

スキャン対象全文書を対象に、旧 namespace の残存を検出する:

- **(a) 旧 public command namespace**: `/issue/issue-*` 形式の参照がアクティブなガイダンスとして使用されていないか（REQ 関連情報セクションの「旧称」説明や履歴記述は除外）
- **(b) 旧 tips namespace**: `/tips/tips-*` 形式の参照がアクティブな public command として参照されていないか（REQ 関連情報セクションの「旧称」説明は除外）
- **(c) 二重プレフィクス**: `agentdev-agentdev-*` パターンの誤記を検出する
- **(d) 存在しない skill 名**: テキスト中で参照されている `agentdev-*` スキル名が `.opencode/skills/{name}/SKILL.md` として実在するか
- **(e) load_skills の存在確認**: 全 command ファイルの frontmatter `load_skills` に列挙されたスキル名が `.opencode/skills/{name}/SKILL.md` として実在するか（Step 4-a と重複するが、ここでは旧名称の混入も併せて検出する）
- **(f) Command inventory 整合性**: `.opencode/commands/agentdev/README.md` のコマンド一覧と実際の command ファイルの過不足を検出する。加えて root `README.md` および `docs/specs/system.md` のコマンド一覧テーブルと実際の command ファイルの過不足も検出する（`checkExpandedReadmeSync`）
- **(g) 旧 bare command name 残存**: 以下の旧 bare command name がアクティブなガイダンス（スキル reference、コマンド定義、spec、README）に残存していないか: `issue-req`, `issue-work`, `issue-close`, `issue-create`, `issue-update`, `issue-save-req`, `issue-backlog-create`, `tips-elevate`, `tips-refactor`（REQ 関連情報セクションの「旧称」説明や履歴記述は除外）
- **(h) 旧 command path 残存**: `.opencode/commands/issue/` または `.opencode/commands/tips/` への参照が残存していないか
- **(i) 旧 skill name 残存**: 以下の旧 skill 名がアクティブなガイダンスに残存していないか: `issue-lifecycle`, `issue-template-manager`, `tips-pipeline-orchestration`, `issue-completion-reporting`, `issue-post-review-routing`, `issue-work-orchestration`
- **(j) 旧 data path 残存**: `docs/tips/` への参照がアクティブなガイダンス・pipeline 記述に残存していないか（履歴記述は除外）
- **(k) 旧 terminology 残存**: `tips` がアクティブな schema・command guidance・pipeline 記述に残存していないか（`生きている tips プール` → `生きている learning プール`、`refactor時prune` → `refine時prune`、`elevate時prune` → `promote時prune` 等。履歴レコード・REQ旧称説明は除外）

### 6b. 完了報告フォーマット検査

全 command 定義ファイル（`.opencode/commands/agentdev/*.md`、`README.md` を除く）について、完了報告フォーマットの適合性を検査する:

#### REQ-0107: 参照整合性

- **(a) load_skills 参照**: 各 command 定義の frontmatter `load_skills` に `agentdev-workflow-reporting` が含まれているか
- **(b) variantファイル存在**: `agentdev-workflow-reporting/reference/completion-reports/{command}/` に該当コマンドのvariantファイルが存在するか（REQ-0107-024）
- **(c) 完了報告 Step の参照**: 各 command 定義に完了報告 Step が存在し、`completion-reports/` variant を参照しているか

#### REQ-0107: 違反パターン検出

- **(d) インライン完了報告コードブロック**: command 定義の完了報告 Step 内に triple-backtick で囲まれた完了報告コードブロック（✅/⚠️/❌ を含む）が存在しないか（REQ-0107-025）
- **(e) 完了報告後の追加出力指示**: command 定義に完了報告の後に Todo一覧、Step別ログ、補足説明、汎用締め文（「次にやるべきことがあれば…」等）を出力する指示が存在しないか
- **(f) Todo一覧の最終出力指示**: command 定義に Todo一覧を最終出力として表示する指示が存在しないか
- **(g) 共通必須フィールド**: 各variantファイルに完了コマンド・対象・結果・検証結果・git永続化・次のコマンドの6フィールドが存在するか（REQ-0107-026）
- **(h) fragment合成パターン**: variantファイルに「追加する」「追加報告」など、base templateとfragmentの合成を前提にした表現が存在しないか（REQ-0107-027）

検出結果を違反エントリとして記録する。

### 7. DOC-MAP 存在性・参照整合性検査（REQ-0101）

DOC-MAP（`docs/DOC-MAP.md`）の存在性と参照整合性を検査する:

- **(a) DOC-MAP 存在確認**: `docs/DOC-MAP.md` が存在するか
- **(b) 参照ファイル存在確認**: DOC-MAP 内で参照されているファイル（Markdown リンク `[text](path)` 形式）が実在するか
- **(c) 基準境界違反検出**: DOC-MAP に要件・判断・仕様の基準（canonical）に相当する内容が含まれていないか。DOC-MAP は探索経路の索引であり、REQ/ADR/SPEC の代替ではない。基準と重複する詳細内容（要件テーブル、ADR判断、仕様詳細）が DOC-MAP に存在する場合は `canonical-conflict` として報告する

### 7a. Views 残存検出（REQ-0101, 023）

Views 廃止後の残存構造を検出する:

- **(a) views ディレクトリ残存**: `docs/requirements/views/` ディレクトリが存在しないか
- **(b) DOC-MAP 内 views 参照**: `docs/DOC-MAP.md` 内に `views` への参照（パス、セクション名、説明）が残存していないか
- **(c) 他 docs ファイルの views 参照**: `docs/` 配下のファイルで `views/*.md` または `docs/requirements/views/` へのアクティブな参照が残存していないか（履歴記述・旧称説明は除外）

### 7b. README ↔ ファイル整合性検査（REQ-0101, 025, 026）

各 README インデックスと実体ファイルの整合性を検査する:

- **(a) requirements/README.md ↔ REQ ファイル**: `docs/requirements/README.md` の REQ テーブルにリストされた REQ と `docs/requirements/REQ-*.md` ファイルの過不足を検出する（Step 2-c の拡張）
- **(b) adr/README.md ↔ ADR ファイル**: `docs/adr/README.md` の ADR テーブルにリストされた ADR と `docs/adr/ADR-*.md` ファイルの過不足を検出する
- **(c) specs/README.md ↔ specs ファイル**: `docs/specs/README.md` の SPEC テーブルにリストされたエントリと `docs/specs/*.md` ファイルの過不足を検出する（新規チェック）

### 7c. Finding 分類（REQ-0101）

各検出結果（finding）を以下の分類に類別する:

| 分類 | 説明 |
|------|------|
| `document-drift` | ドキュメント内容が基準から乖離している |
| `broken-reference` | 参照先のファイル・セクションが存在しない |
| `obsolete-structure` | 廃止済み構造の残存（例: views 残存） |
| `canonical-conflict` | 補助ドキュメントに基準文書に属する内容が含まれている |
| `workflow-gap` | DOC-MAP 更新の反復失敗など、ワークフロー上の欠陥を示唆する所見 |
| `integrity-rule-gap` | 既存の整合性検査ルールでカバーされていない問題 |

各 finding には分類ラベルを付与してレポートに記載する。1つの finding に複数分類が当てはまる場合は全て列挙する。

### 7d. Finding ルート推奨（REQ-0101）

各 finding について、対応ルートを推奨する:

| ルート | 対象 |
|--------|------|
| `intake` | 具体的かつ修正可能な個別項目 |
| `learning` | 再発防止や検査観点の向上など、learning pipeline に委ねるべき知見 |
| `intake+learning` | 具体的修正と再発防止知見の両方に該当する場合 |
| `req-define` | ワークフロー・要件定義自体の変更が必要な場合 |
| `none` | 情報提供のみ（対応不要） |

推奨ルートはレポートの finding エントリに併記する。実際の intake/learning 作成は Step 9（旧 Step 8）のユーザー承認時のみ実行する。

### 8. 検出結果レポートの生成

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
| 旧 namespace 残存 | N | N | — |
| 完了報告フォーマット | N | N | — |
| DOC-MAP 存在性・参照整合性 | N | N | — |
| Views 残存 | N | N | — |
| README↔ファイル整合性 | N | N | — |

## 詳細

### REQ frontmatter↔ファイル名
{検出結果の詳細。OK の場合は「問題なし」、NG の場合は具体的な不一致内容}

### ADR↔REQ 相互参照
{検出結果の詳細}

### Skill↔load_skills 参照
{検出結果の詳細}

### Command-map↔実体
{検出結果の詳細}

### 旧 namespace 残存
{検出結果の詳細。残存箇所のファイルパス・行番号・該当テキストを記載}

### 完了報告フォーマット
{検出結果の詳細。違反がある場合は該当コマンド名・違反種別・該当箇所を記載}

### DOC-MAP 存在性・参照整合性
{検出結果の詳細。参照先不存在のパス、基準境界違反の内容を記載}

### Views 残存
{検出結果の詳細。残存箇所のファイルパス・行番号・該当テキストを記載}

### README↔ファイル整合性
{検出結果の詳細。過不足のある REQ/ADR/SPEC エントリを記載}

## Finding 分類・ルート一覧
{各 finding を分類（document-drift / broken-reference / obsolete-structure / canonical-conflict / workflow-gap / integrity-rule-gap）と推奨ルート（intake / learning / intake+learning / req-define / none）とともに一覧表示}
```

### 9. Intake Item 作成（MAY）

検出された問題のうち、ユーザーが intake item 化を指示したものについて intake item を作成する。

- **ユーザーに結果を提示**: Step 8 のレポート内容を表示
- **ユーザーに intake item 化を問う**: 「検出された問題のうち、intake item として登録するものがありますか？」
- **ユーザーが指定した問題のみ**: `.agentdev/intake/inbox/YYYY-MM-DD-integrity-{issue-slug}.md` に intake item 形式で保存。同名ファイル衝突時は `{issue-slug}-2`, `{issue-slug}-3` のように連番を付与する
- **保存形式**: `/agentdev/intake-capture` の Intake Item 形式に従う
- **ユーザーが intake item 化をスキップ**: レポートのみで終了

### 10. Git 永続化（条件付き）

Step 9 で intake item を作成した場合、`.agentdev/intake/` 配下の変更を git 永続化する（SHALL）:

1. `git status --porcelain -- .agentdev/intake/` で変更を検知
2. **変更なし**（intake item 未作成）→ 完了報告へ（「変更なし」パターン）
3. **変更あり**:
   a. `git add .agentdev/intake/`（`.agentdev/intake/` 配下のみ。integrity report は commit 対象外）（SHALL）
   b. `git commit -m "chore: add intake items from integrity-check"`
   c. `git push`
   d. **失敗時** → エラー報告・後続中止（SHALL）

### 11. 完了報告

完了報告 → `agentdev-workflow-reporting` の完了報告variantに従って出力。variant: completion-reports/integrity-check/standard.md

## Guardrails

### Read-Only 制約
- G01: 検査対象 artifact（REQ、ADR、skill、command、specs、README、DOC-MAP）を変更しない。レポート生成（`.agentdev/integrity/reports/`）および intake item の新規作成（`.agentdev/intake/inbox/`）はこの制約の例外として許容する（REQ-0101）
- G02: レポート・intake item の新規作成のみ許容
- G03: `git` コマンドは intake item 作成時にのみ `.agentdev/intake/` 配下に限定して実行する（SHALL）。それ以外の git操作（コミット・プッシュ）は禁止する。検査対象の git変更は一切行わない

### Finding 分類制約（REQ-0105, REQ-0105, REQ-0101）
- G10: finding（検出された不整合）は原則 intake 対象である（REQ-0105）
- G11: finding の発生原因や予防策がある場合のみ learning 対象にもなりうるが、learning item の直接作成は行わない（MUST NOT）（REQ-0105）。learning 対象候補は learning pipeline に委ねる
- G13: finding は Step 7c の分類（document-drift / broken-reference / obsolete-structure / canonical-conflict / workflow-gap / integrity-rule-gap）に類別すること（REQ-0101）
- G14: finding には Step 7d の推奨ルート（intake / learning / intake+learning / req-define / none）を付与すること（REQ-0101）

### 完了報告フォーマット検査制約
- G12: 完了報告フォーマット検査は command 定義ファイルの構造確認に限定し、実際の完了報告出力の動的検証は行わない

### 検査対象制約
- G04: 検査は存在性・整合性の確認に限定し、内容の妥当性評価は行わない
- G05: ステータス整合性（Step 3-c, 5-c）は SHOULD であり、厳密な判定を求めない

### 実行制約
- G06: `gh` コマンドは使用しない（GitHub Issue の作成・更新は行わない）
- G07: ユーザーの承認なしに intake item を作成しない（MAY）

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
- **intake item 作成は任意**: ユーザーが指示した場合のみ実行（MAY）
- **false negative より false positive を優先**: 整合性検査は「見逃し」より「過検出」を許容する
- **旧名称の履歴記述は除外**: Step 6 の旧 namespace 残存検査で、REQ 関連情報セクションの「旧称」や移行履歴の説明は検出対象外とする
