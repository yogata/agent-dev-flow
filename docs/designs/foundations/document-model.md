---
title: 文書モデル
status: accepted
created: 2026-08-20
updated: "2026-09-03"
---
<!-- ADF-COVERS(implementation): REQ-001-001, REQ-001-002, REQ-001-003, REQ-001-004, REQ-001-005, REQ-001-006, REQ-001-007, REQ-001-020, REQ-001-035, REQ-001-038, REQ-001-039, REQ-001-040, REQ-001-041, REQ-001-052 -->
<!-- ADF-COVERS(implementation): REQ-049-019 -->
<!-- ADF-COVERS(implementation): REQ-057-001 -->

# 文書モデル

本 Design は agent-dev-flow リポジトリのみに適用される。

## 目的

REQ/Decision/Design/Guide/Report の責務マトリックスを定義し、各文書種別が何を記述し、何を記述しないかを明確にする（REQ-001）。
`docs/designs/` は現在有効な Design だけを保持する正規領域とし、監査・評価・観測記録は Report（`docs/reports/`）へ分離する。

### 他 Design との役割分担

本 Design と `../responsibilities/document-type-responsibilities.md` は補完関係にある。
重複しやすい関心を以下の通り分担する。

| 関心 | 主に扱う Design |
|---|---|
| 文書種別の基準境界（REQ/Decision/Design/guides の役割定義、ライフサイクル、優先順位、参照規則、投影方向） | 本 Design |
| 文書7分類、局所物理分離、docs/designs/ 直下のドメイン別体系化規範 | 本 Design |
| 文書種別配置の執筆時判定基準、実行主体分類、要件行書き方、SKILL構造、用語政策 | `../responsibilities/document-type-responsibilities.md` |
| 共通文書モデル規約（frontmatter、ID 体系、命名規則、URL 参照形式、共通フォーマット規約） | `patterns.md`（本 Design は文書種別マトリックスを扱い、`patterns.md` は共通フォーマット規約を扱う） |

両 Design の境界を変更する場合は、相互参照を更新し、同一関心の説明が重複・矛盾しない状態を維持する。
新規ファイル分割は行わず、既存2ファイル間の重複削除で運用する（REQ-001-001）。

## 責務マトリックス

| 文書種別 | 記述するもの | 記述しないもの |
|---|---|---|
| REQ | 現行要件（WHAT: 何を満たすべきか） | 実装詳細、HOW、現在の動作記述 |
| Decision | 将来の設計、運用、文書システムを制約する決定とその理由（WHY）<!-- REQ-001 --> | 可逆的な運用手順、状態遷移、形式定義 |
| Design | REQ を満たすために現在採用している内部構造、内部動作、責務分担、データ構造、処理方式、規則、パラメータ（現在のHOW）※リポジトリ内部設計文書。実行時配布物の依存先ではない（REQ-001）。Architecture を一部として含む | 新規要件、将来案、判断根拠（Decision の管轄）、採用理由、却下理由、作業履歴、監査結果、評価結果、実測値、実装コードそのもの、検証実行結果（REQ-001-003） |
| Knowledge | プロジェクト固有の再利用可能な判断材料（知識内容、適用条件、適用対象、根拠、関連知識）。docs/knowledge/ 配下へ 1知識1 Markdown ファイル（kebab-case slug、固定 ID 採番なし）（REQ-056） | 実装コードそのもの、要件本文・判断記録本文・Design 本文との重複、標準知識（配布対象） |
| Guides | 人間向けナビゲーション層。規範的権限を持たない（REQ-001） | 要件本文、契約本文、REQ/Decision/Design 内容の重複 |
| Report | 監査、評価、観測、測定等の事実記録。必達要件の規範表現を持たない（REQ-001-065） | 規範要件、必達条件、現在設計の記述 |

### ワークフロー状態管理

ワークフロー状態（例: "要件定義", "実装", "テスト" 等の 6 マイクロフェーズ）は Issue ラベル、GitHub Project で管理する（REQ-002-035）。
REQ/Design 文書内には状態として含めず、ワークフローの説明目的でのみ使用する。

### REQ 内容契約

REQ 文書の各セクションが保持すべき内容の契約（REQ-004-006, 007, REQ-001）。

| セクション | 保持するもの | 保持しないもの |
|---|---|---|
| title | 責務、状態、制約を表す名称 | 作業名（移行、削除、改名等） |
| 目的 | 現在満たすべき状態、振る舞い、制約の概要 | 変更履歴、作業手順 |
| 要件行 | 検証可能な状態要件（満たすべき振る舞い、制約） | 反映作業（更新、削除、移動等の操作） |
| 適用範囲 | 現在の適用対象、対象外 | 将来の変更計画、移行対象 |

作業手段（移行、変更、再定義、削除、改名、移管、除去等）は case / Issue / 受け入れ条件 / 作業記録で扱い、現行 REQ の要件行に混入させない（REQ-004-049）。

## REQ 分類レイヤー

現行 REQ は以下の 6 分類のいずれかに属する（REQ-001-052）。
各 REQ ファイルは関心対象の総体として説明できること。

| 分類 | 説明 | 代表例 |
|---|---|---|
| 文書統治 REQ | REQ/Decision/Design/guides の基準境界、文書分類ポリシー、ID 規約 | REQ-001 |
| ワークフロー全体 REQ | 開発ワークフロー、コマンド間データフロー、work_type 分類、SSoT 遷移 | REQ-005 |
| コマンド級 REQ | 公開コマンドの入力、出力、副作用境界、停止条件、他コマンドとの接続 | REQ-004, REQ-008, REQ-006 |
| 成果物、実行時、スキル責務 REQ | Command/Skill/Template/Script の責務境界、配布制約、原本、配置先分離 | REQ-002, REQ-003 |
| 検証、検査 REQ | 整合性検査、検出事項分類、docs-check、inspect-docs の検査責務 | REQ-010, REQ-036 |
| Decision ライフサイクル REQ | Decision 状態の正規化、Decision 運用品質維持 | REQ-001 |

### コマンド級 REQ 定義

コマンド級 REQ は、公開コマンドの入力、出力、副作用境界、停止条件、他コマンドとの接続を持つ単位として定義する（REQ-001-054）。
1 コマンドにつき 1 コマンド級 REQ を原則とする。

### Design 分離基準

Design に置くべき内容を現行 REQ から切り出す基準（REQ-001-055）:

| Design に置くもの | REQ に置くもの |
|---|---|
| スキーマ、ライフサイクル、コマンド構成、ルールカタログ、テストデータ詳細に加え、以下の移管候補一覧 | 満たすべき振る舞い、制約、状態の宣言 |

<!-- REQ-001-067 -->
REQ 要件行が以下のいずれかのみを主たる文意とする場合、当該内容を Design、ルールカタログ、コマンドリファレンス、スキルリファレンス、テスト文書のいずれかに配置する:

| 移管候補 | 主たる移管先 |
|---|---|
| スキーマフィールド | Design |
| enum 値一覧 | Design / ルールカタログ |
| 経路、カテゴリ、状態の詳細判定表 | Design / ルールカタログ |
| ファイルパターン | Design / コマンドリファレンス |
| テンプレート種別（`variant`） | Design / コマンドリファレンス |
| レポート形式 | Design |
| テストデータ詳細（`fixture detail`） | Design / テスト文書 |
| 回帰テスト条件 | テスト文書 / ルールカタログ |
| チェッカー個別ルール | ルールカタログ |
| 誤検知（false positive）抑制方式 | ルールカタログ |
| リトライ回数 | Design / コマンドリファレンス |
| トークン目安 | Design / コマンドリファレンス |
| 行数上限 | Design |
| Step 番号 | Design / コマンドリファレンス |
| Phase 番号 | Design / コマンドリファレンス |
| 内部アルゴリズム | Design |
| 作業履歴 | テスト文書 / 作業記録 |
| Case/RU/Issue/PR/OU 由来の作業記録 | テスト文書 / 作業記録 |

### 安定契約の例外 <!-- REQ-001-068 -->

REQ 要件行候補がパラメータ、分類、値の形式をとる場合であっても、以下のいずれかに該当する場合は REQ に要約として記述する。詳細な値一覧、判定表、内部処理条件は Design 等に配置する:

| REQ に要約として残す安定契約 | 説明 |
|---|---|
| 公開コマンド名 | 利用者および後続工程が参照するコマンドの名称 |
| 公開入口 | コマンドの起動点、引数受付 |
| ドメイン状態の位置づけ | `.agentdev/` 等の永続状態の役割 |
| 他コマンドとの接続契約 | コマンド間の入出力、依存関係 |
| 利用者に見える分類体系 | work_type 等のユーザー可視分類 |
| 安全境界 | 実行許可範囲、破壊的操作の境界 |
| 停止条件の大枠 | いつ終了するかの概要レベル条件 |
| 後続工程が依存する安定した外部契約 | 後段コマンドが前提とする安定契約 |

### REQ 粒度判定テスト <!-- REQ-004-054 -->

REQ 要件行の粒度を判定するテスト:

> 当該要件行が存在しない場合、対象 REQ が何を満たすべきか不明になるか？

判定結果が YES の場合は当該行を REQ に残す。
判定結果が NO の場合は当該行を Design、ルールカタログ、コマンドリファレンス、スキルリファレンス、テスト文書のいずれかに移管する。

### 新規 REQ 作成基準

新規 REQ は、既存の現行 REQ に吸収できない独立関心対象がある場合のみ作成する（REQ-001-007, 053）。
既存 REQ への APPEND / UPDATE を優先する。

### 廃止候補判定基準

廃止（retire）候補の判定基準（REQ-001-052）:

| 類型 | 説明 |
|---|---|
| バグ修正由来 | 単発のバグ修正に起因し、恒常的な状態要件としての維持必要性がない |
| 移行完了状態 | 移行、改名、廃止の完了記録が主題であり、現行の状態要件ではない |
| 他 REQ 吸収済み | 恒久内容が他の現行 REQ に吸収され、単独維持の必要性がない |
| 作業手段主題 | 作業手順、運用プロセスが主題であり、満たすべき状態要件ではない |

### REQ 品質維持基準

SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT は、inspect-docs の診断観点に加え、REQ 運用品質維持の恒常的基準として参照する（REQ-037-006）。
REQ 体系の健全性を維持するため、これらの観点で定期的に REQ 体系を評価する。

### 恒久契約適格性と既存成果物処置分類 <!-- v2:REQ-0155-005, REQ-039-003, v2:REQ-0140-021 -->

本節は intake / learning / diagnostics の採用済み成果物を恒久契約（REQ/Decision/Design/command/skill）へ昇格させる前の共通基準と、既存成果物の見直し処置の定義を正規所有する。
適格性基準は v2:ADR-0112（過剰適用防止）、REQ-001決定4（REQ拡張は2種別に限定）、v2:REQ-0155-005（無条件自動REQ化禁止）を具体化する。

#### 恒久契約適格性

intake、learning、inspect 由来の知見は、既存契約で未充足の新しいステークホルダー要求、外部から観測可能な契約変更、または明示が必要な安全境界に該当する場合だけ恒久契約候補とする。
既存要求を満たすバリエーション、エッジケース、不適合修正、内部再構成、文書訂正は、既存契約が要求を保持している限り REQ を拡張しない（REQ-001決定4の要約）。

詳細な判定項目、優先順位、例外、工程別手順は各 command / workflow Design に配置する。
適格性チェックポイントは QG-1〜QG-4（主ワークフロー品質ゲート）とは別体系とし、各補助パイプラインの HITL 確定点（REQ-003-003〜009）で実行する。

#### 既存成果物の6処置

既存REQ、Decision、Design、guide、command、skill の記述を見直す際の処置は以下の6区分とする。
各処置は相互排他的であり、1つの記述に対して1処置を適用する。

| 処置 | 意味 |
|---|---|
| KEEP | 恒久契約として現在位置に残す |
| MERGE | 同じ責務の正式な定義箇所へ統合する |
| REFERENCE | 詳細を正式な定義箇所へ寄せ、現在位置は参照へ縮約する |
| MOVE | 別の文書種、reference、test、fixture 等へ移す |
| RETIRE | 現行契約として不要なため廃止する |
| INFERENCE | 当該記述を恒久契約として明文化せず、上位原則からの実行時判断へ委ねる |

INFERENCE は「明文化を残す KEEP」とも「別成果物に残す MOVE」とも異なる処置であり、個別事例ごとの適用規則が Design に記載されている場合に、個別規則を恒久契約から除去し上位の一般原則のみを維持して将来の個別適用を実行エージェントの意味判断へ委ねる。

処置の判定根拠は非排他的な情報として記録する。
観測事実、適用した既存規則、意味判断、ユーザー合意、機械検出結果等が併存し得る。
判定根拠の伝播は REQ-001-033 が定義する分類根拠フィールドへ統合し、INFERENCE/MANUAL/RULE のような排他的 enum は導入しない。

本節の6処置は昇格前の適格性判定に適用する。
「6 処置モデル」節（「恒久基準と非規範情報の整理」配下）も同名の KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE を定義するが、cleanup 実行モデルの処置であり、適用フェーズと参照する正規所有契約が異なる。
両者は独立した正規所有契約であり、統合しない。

#### intake・learning 昇格分類との違い

intake・learning パイプラインの対応要否分類（action-required / covered / duplicate / verification-only / deferred / rejected）と対応形態分類（local-fix / example-or-test / knowledge-only / permanent-contract-candidate）は、本節の6処置とは別の分類である。
昇格分類は採用済み成果物をどう処理するかの前段階判定であり、既存成果物を実際に変更する段階で必要に応じて6処置を適用する。

#### 診断観点と6処置の対応表

inspect-docs の診断観点（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）と既存成果物6処置（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）は別軸である。
診断観点は REQ/Design 体系の構造的問題を検出する軸であり、6処置は採用済み成果物へのアクションを表す軸である。

| 診断観点 | 主に対応する処置 | 関係 |
|---|---|---|
| SPLIT | MOVE | REQ 分割結果の配置移動 |
| MERGE | MERGE | 複数REQ/Designの統合 |
| MOVE | MOVE | 配置場所変更 |
| DUPLICATE | REFERENCE または MERGE | 重複の整理 |
| RETIRE | RETIRE | 廃止 |
| DRIFT | MOVE または RETIRE | 実態乖離の修正 |

対応表は参照であり、診断観点と処置は1対1対応しない。
各検出事項は個別に処置を判定する。

#### 工程別手順の配置先

document-model.md は共通定義のみを正規所有し、工程固有手順は各 Design へ分散する: intake の分類と振り分け（intake pipeline Design）、learning の分類と振り分け（learning pipeline Design）、独立再判定（backlog integration Design）、req-define での範囲統制（req-define / req-analysis Design）、事後監査（inspect-docs / diagnostics Design）。

## 文書ライフサイクル

```
REQ（要件定義）
  ↓ 判断が必要な場合
Decision（決定記録）<!-- REQ-001 -->
  ↓ 判断に基づく実装
Design（現在設計記述）
  ↓ 探索支援
Guides（案内）
```

- REQ は領域別の総体として管理する。変更の都度 REQ を作成せず、既存 REQ への APPEND / UPDATE で対応する。
- Decision は `proposed` → `accepted` / `superseded` / `deprecated` の状態遷移を持つ。現行基準（`baseline`）は REQ-001 以降（現行 Decision コレクション）。v2:ADR-0001〜0099 は過去に存在した履歴番号帯である（実体は2026-07-20に物理削除）（REQ-001-047, 048）。
- Design は実装とともに変化する「生きた文書」である。REQ や Decision の判断内容を代替しない。
- Guides はナビゲーション層であり、規範文書ではない。

### Design ライフサイクル（REQ-001-025）

Designはfrontmatter `status`で成熟度を管理する。
状態は `draft`、`accepted` の2値である。
frontmatter形式は`patterns.md`が所有する。

| status | 意味 | 通常内容検査 | 遷移契機 |
|---|---|---|---|
| `draft` | design-saveで保存された未確定状態 | 境界違反等の確定Design向け検査対象外 | 新規Design保存時 |
| `accepted` | 実装との整合確認を通過した現在設計 | 通常の整合性検査対象 | case-closeで確定時 |

- 新規Designは `draft` として作成され、確定時に `accepted` へ遷移する。`accepted` の付与は case-close の責務である
- statusがない既存Designは後方互換のため`accepted`相当として扱う
- 置換済みDesignは現行Designツリーへ保持しない。置換時は旧Designを現行ツリーから除外し、履歴はGit、Issue、Decision等の既存履歴手段から確認する
- Design専用の安定ID体系は持たず、Designの識別は文書配置パスによる（REQ-001-008）
### Decision ライフサイクル詳細

Decision 関係モデル（relates-to / supersedes / reaffirms）、粒度管理、健全性評価モデルの詳細は `decision-lifecycle.md` が正規所有する。
本節は参照関係を示し、内容を複製しない。
Decision は REQ と管理特性を分離し（AG-004）、固定件数ではなく意味的健全性で粒度を評価し（AG-006）、REQ 重複・分割モデルと分離された健全性評価を持つ（AG-017）。

## 適用範囲宣言

`docs/designs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは Design ファイルに依存しない（REQ-001）。

## 作業領域と状態の境界

| ディレクトリ | 役割 | 性質 |
|---|---|---|
| `.agentdev/` | AgentDevFlow の原本ドメイン状態（intake / learning / backlog / integrity） | 永続的なドメイン状態。配布物ではない |
| `.agentdev/drafts/` | コマンドワークフローでの作業用一時領域 | 現行コマンドの明示的な作業用ドラフト引き継ぎでのみ使用 |

### draft の位置づけ（REQ-008, DEC-003）

`.agentdev/drafts/req-draft-*.md`（req_draft）は、req-define が生成する一時的な構造化ハンドオフ成果物である。
consumer 境界は producer、direct consumer、orchestration pre-reader、invalid post-case reader の 4 集合で確定する（REQ-008-008、REQ-008-036、REQ-034-019）。
4 集合の正規定義は `docs/designs/responsibilities/artifact-contracts.md`「req_draft consumer 4 集合」節を SSoT とし、本節は同じ 4 集合を抽出元として一致させる。
永久文書（REQ/Decision/Design/guides）ではなく、以下の性質を持つ:

- **consumer 4 集合**: req_draft の consumer 境界は次の 4 集合で確定する（REQ-008-008、REQ-008-036、REQ-034-019）
  - producer: `{req-define}` — req_draft を生成する唯一の command
  - direct consumer: `{req-save, design-save, case-open}` — req_draft を主入力として消費し、REQ/Decision/Design/Issue を生成する command 群。draft type registry の allowed consumers 列と同一
  - orchestration pre-reader: `{case-auto}` — case-open 前だけ req_draft を読み、後続工程の orchestration 入力とする command
  - invalid post-case reader: `{case-auto, case-run, case-close}` — case-open 成功後に req_draft を参照してはならない command 群。case-open 成功後は Issue と Epic を SSoT として単独成立する
- **緩やかな契約（soft contract）**: API 契約ではなく生成側（producer）の標準。LLM 推論経由で消費され、機械的パースを前提としない（DEC-003）。厳格なスキーマバージョン、JSON Schema、バリデータは導入しない
- **構造化データが正**: 後続工程の権威ある情報源は `# draft-data` fenced YAML block であり、人間可読 Markdown セクション（`# summary` 等）は補助的である（REQ-008-001, REQ-008-002）
- **一時成果物**: case-open 成功後（Issue/Epic 作成 + VERIFY）は削除されてよい。case-open 成功後は Issue/Epic を SSoT とし、req_draft は存在しない一時成果物となる（REQ-008-015, REQ-008-016）
- **標準データモデル**: `auto_gate`, `agreed_items`, `artifact_actions`, `realization_actions`, `conflict_resolutions`, `operation_units`, `case_open_hints` を中心フィールドとする（REQ-008-011）。詳細構造は `docs/designs/responsibilities/artifact-contracts.md` の「req_draft 出力構造」を参照
- **artifact_actions 統合**: REQ/Decision/Design への保存対象は成果物別配列に分散させず、単一の `artifact_actions` 配列に統合する（REQ-008-009）。後続コマンドの工程分岐は `work_type` 固定分岐ではなく `artifact_actions` の存在で判定する
- **realization_actions 分離**: 実現面の変更方針（正規所有責務、変更すべき実現面、変更意図、検証との対応）は `realization_actions` として `artifact_actions` と分離して保持し、case-open が execution contract へ投影する。`artifact_actions` に実現物種別の enum を追加しない
## 信頼できる情報源の優先順位

文書間に矛盾がある場合の優先順位（REQ-001-020）:

1. 現行 REQ
2. Decision（承認済み）
3. Design
4. guides

## 設定規則

| 規則 | 内容 |
|---|---|
| REQ ID | 4桁ゼロ埋めの安定ID。現行・廃止を問わず再利用しない |
| Decision ID | 3桁ゼロ埋め。状態はfrontmatterで管理する |
| Design配置 | `docs/designs/**/*.md` |
| Design status | `draft`、`accepted` の2値。status欠落は`accepted`相当。確定時の昇格はcase-closeが行う |
| Guides配置 | `docs/guides/*.md` |
| 廃止REQ | 物理削除を第一選択とし、履歴参照用途に限定してretired配下への移動も選択できる |
| 廃止Decision | 物理削除を第一選択とし、履歴参照用途に限定してretired配下への移動も選択できる |
## Decision 編集制約

- 承認済み Decision の決定内容を意味変更してはならない（REQ-001-056）。変更が必要な場合は新規 Decision を作成し、旧 Decision を superseded/deprecated とする
- Decision 体系の全面改定時は例外として、ユーザー承認済みの範囲で deprecated/superseded Decision の最小限を超える編集を許可する（REQ-001-059）。ただし、編集目的、対象、変更種別、移管先、現行根拠として残す Decision を明示すること

## accepted Decision の意味的不変

accepted Decision は意味的に不変とする（REQ-001-056〜060）。
詳細プロトコルは agentdev-decision-guidelines「accepted Decision の更新規則」、agentdev-decision-file-manager「accepted Decision 直接編集チェックリスト」を参照。

### 原則

- accepted Decision を意味的に不変とする
- 直接更新可能な非意味修正は6件、後継 Decision を必要とする意味変更は6件
- 直接更新前に明示承認記録が存在する
- accepted Decision の過去版を無言で書き換えない
- 意味変更を表記修正として扱わない
- Report へ規範要件または必達条件を移さない

### 正規所有

- 意味不変原則: REQ-001（核心契約）、agentdev-decision-guidelines Design（詳細プロトコル）
- 直接編集チェックリスト: agentdev-decision-file-manager Design
- accepted Decision の扱い: 本節（document-model.md）

## 文書分類ポリシー

<!-- REQ-001 -->

文書の分類、権限、ライフサイクル、相互参照に関する包括ポリシー。
新規文書作成時、既存文書更新時の分類判断基準として機能する（REQ-001）。

### 文書権限モデル <!-- REQ-001 -->

各文書種別の編集権限、承認フロー、変更主体を定義する。

| 文書種別 | 編集権限 | 承認フロー | 変更主体 |
|---|---|---|---|
| REQ | req-define / req-save コマンド経由 | ユーザー承認（req-save） | エージェント（draft 作成）、ユーザー（最終承認） |
| Decision | req-save / 手動作成 | ユーザー承認 | エージェント（draft 作成）、ユーザー（最終承認） |
| Design | 実装に伴う更新 | Design は現在設計の記録のため、実装完了に伴い更新 | エージェント（実装後の Design 更新） |
| Guide | inspect-docs / 手動更新 | 規範的権限なし。情報正確性の確認のみ | エージェント / ユーザー |
| Report | 整合性コマンド等の自動生成、または手動作成 | 公開時の事実確認 | エージェント（自動生成）、ユーザー（手動作成） |
| 廃止 | 編集不可（履歴参照専用） | なし | なし |

### 分類判断ツリーの配置

新規文書作成時の分類判断フロー（分類判断ツリー）は執筆時配置判定に属するため、`../responsibilities/document-type-responsibilities.md`「新規文書作成時の分類判断ツリー」を参照。
本 Design は文書種別の基準境界（責務マトリックス、各文書種別の記述対象）を正本として保持し、執筆時の判定手順は document-type-responsibilities.md 側に寄せている。

### 文書間投影規則 <!-- REQ-001 -->

コマンド、スキル等の実行時配布物における原本、配置先（source/projection）の用語と方向を定義する。

| 用語 | 意味 | パス例 |
|---|---|---|
| **原本 (source)** | 編集対象の一次ソース | `src/opencode/commands/agentdev/*.md`、`src/opencode/skills/agentdev-*/` |
| **配置先 (projection)** | 実行時環境への投影先 | `.opencode/commands/agentdev/*.md`、`.opencode/skills/agentdev-*/` |

**投影方向**: 原本 → 配置先 のみ（逆方向の投影は行わない）。
配置先での直接編集は禁止し、原本を変更後に同期スクリプトで配置先を更新する（DEC-002）。

### 参照規則 <!-- REQ-001 -->

文書間の参照形式と引用ルールを定義する。

- **REQ 参照**: `REQ-{NNN}` 形式（例: `REQ-001`）。個別要件は `REQ-{NNN}-{SSS}` 形式（例: `REQ-001-002`）
- **Decision 参照**: `DEC-{NNN}` 形式（例: `DEC-001`）
- **リンク形式**: Markdown リンクで `[REQ-001](../requirements/REQ-001.md)` のように相対パスで記述
- **引用ルール**: 安定 ID（`REQ-{NNN}`、`DEC-{NNN}`）で参照し、セクションタイトルのみでの参照は禁止。セクション参照が必要な場合は `REQ-001-002` や `REQ-001 決定セクション` のように ID を併記する
- **廃止文書の参照**: 廃止文書を参照する場合は `(retired)` 注記を付与し、現行の後継文書も併記する（REQ-001-048）

### ライフサイクル規則 <!-- REQ-001 -->

| 文書種別 | 状態遷移 | 備考 |
|---|---|---|
| REQ | created → active → superseded / partially superseded | APPEND/UPDATEで拡張する。現行 REQ は `docs/requirements/README.md`、旧世代の履歴資料は tag `v2.11.0` で参照する |
| Decision | proposed → accepted → superseded / deprecated | acceptedだけを現行判断の根拠とする |
| Design | draft → accepted | 新規Designはdraftで作成され、確定時にacceptedへ遷移する。置換済みDesignは現行ツリーへ保持しない |
| Guide | active → outdated → removed | 規範的権限を持たない |
| Report | published → archived | 事実記録として扱う |
### 基準再設定規則 <!-- REQ-001 -->

文書体系の全面改訂時の取り扱いを定義する。

- **全面改訂は世代交代であり、上書きではない**
- 世代交代の例: ADR 基準（`baseline`）再編（v2:ADR-0001〜0023 → REQ-001〜0112）。旧番号帯は物理削除済みであり、現行判断の基盤は新番号帯にある
- 新世代の創設時は、旧世代から引き継ぐ判断内容、移管先、移管しない判断を明示する
- 旧世代は履歴参照専用とし、現行判断の根拠として引用しない

### 同期規則 <!-- REQ-001 -->

既存文書の更新運用ルールを定義する。

- **APPEND/UPDATE が正しい操作である。同期不足が問題である。**
- REQ の変更は APPEND（要件追加）または UPDATE（既存要件の修正）で行う。既存 REQ を新規 REQ で上書きしない
- Decision の変更は新規 Decision の作成により行い、旧 Decision を superseded/deprecated とする
- Design の更新は実装完了後に反映し、REQ と Design 間の同期ズレを放置しない
- docs-check / inspect-docs が同期不足を検出可能であること

### Report 分類 <!-- REQ-001 -->

Report を正式な文書分類として定義する。
Design とは独立した種別であり、正規配置領域を Design と分離して持つ（REQ-001-065）。

- **定義**: 監査、評価、観測、測定等の事実記録文書
- **配置場所**: `docs/reports/`（Report の正規配置領域）
- **規範表現**: Report は 必達要件 規範表現を使用しない。事実の記述と分析結果の提示に留める
- **変更**: 公開後の修正は事実確認の範囲に限定。事実関係の誤りのみ修正可能
- **Design との違い**: Design は現在採用している内部構造、内部動作、規則等（現在のHOW）を記述する。Report は特定の時点での分析、監査、評価、観測結果を記録する
- **Design への混入禁止**: 監査・評価・観測記録、実測スナップショット、完了済み作業履歴を Design へ混入させない。Design 一覧、Design 件数、Design 健全性計測へも混入させない

### Decision 定義拡張 <!-- REQ-001 -->

Decision の適用範囲を拡張する。

- **従来の定義**: 「取り返しのつかない技術判断の記録」
- **拡張後の定義**: 「将来の設計、運用、文書システムを制約する決定の記録」
- 技術判断に限定されず、文書システムの運用ルールや、プロジェクトの組織的決定も Decision の対象となる
- この拡張は REQ-001 の決定セクションにも反映される

### 内容境界規則（Decision/REQ 主題妥当性）<!-- REQ-001-002、REQ-001-004、REQ-001-022 -->

Decision と REQ の主題として記述してよい内容の境界を定義する。
作業手段（HOW）が Decision/REQ の主題に混入することを防ぐ。

- **Decision**: 意思決定と理由のみを記録する。削除、廃止、移行、統合、再構築、完全削除そのものを主題にしない（REQ-001-004）。過去判断を現行基盤から外すだけの場合は新規 Decision ではなく廃止、supersede で処理する（REQ-001-022）
- **REQ**: 現在満たすべき状態、振る舞い、制約のみを定義する。作業手段を要件行として含めない
- **作業手段の取り扱い**: 削除、廃止、移行、統合、再構築、完全削除等の作業手段は case/Issue/PR/作業記録で扱い、Decision/REQ の主題としない

### Design 責務境界 <!-- REQ-001-003 -->

Design の記述範囲を責務境界として定義する。

- **Design に新規要件を置かない**。将来要件、将来案は REQ に記述する
- **Design は現在採用している内部構造、内部動作、責務分担、データ構造、処理方式、規則、パラメータの記述に限定する**。判断根拠、採用理由、却下理由は Decision に記述する
- Design は現在システムがどう構成され動作しているか（現在のHOW）を記述し、どう動作すべきか（WHAT）を記述しない
- 将来案、作業履歴、監査結果、評価結果、実測値、実装コードそのもの、検証実行結果を Design に保持しない
- Architecture は Design に含まれる一部として扱い、Design を高位設計だけに限定しない

### 正規所有原則 <!-- REQ-001-042 -->

正規所有者という設計原則を維持する。
各関心の正規定義の所有者は `../responsibilities/artifact-responsibilities.md`（成果物責任表）が定める。
Design の基本frontmatter（`title`、`status`、`created`、`updated`）は per-file の正規所有者宣言フィールドを含まず、Design 用の代替分類メタデータも追加しない。

### アンチパターン <!-- REQ-001 -->

文書分類の典型的な誤りパターンを列挙する。
これらのパターンに該当する文書は分類修正の対象とする。

| 誤りパターン | 正しい分類 | 修正方針 |
|---|---|---|
| Design に新規要件が含まれている | REQ | 要件部分を REQ に切り出し、Design は現在設計の記述に留める |
| Decision が現在の動作を記述している | Design | 動作記述部分を Design に移動し、Decision は判断とその根拠に絞る |
| Guide に要件本文、契約本文が含まれている | REQ/Decision/Design 参照 | 要件、契約内容を REQ/Decision/Design への参照に置き換える |
| REQ に実装詳細が含まれている | Design | 実装詳細を Design に移動し、REQ は WHAT に絞る |
| Report の内容が Design に混入している | Report（独立文書） | Report を独立文書として分離する |
| 廃止文書が現行判断の根拠として引用されている | 現行後継文書 | 引用先を現行の後継文書に更新する |

### レビュー、検査対応 <!-- REQ-001 -->

分類ルールと docs-check / inspect-docs の検査項目の対応を定義する。

| 分類ルール | docs-check 検査 | inspect-docs 検査 | 検査内容 |
|---|---|---|---|
| 責務境界（Design に要件混入） | Design-REQ-mix 検査 | 意味整合性レビュー | Design 内の 必達要件 が現在設計の記述か判定 |
| 責務境界（Guide の要件本文混入） | Guide-intrusion 検査 | 要件本文検出 | Guide が要件本文、契約本文を保持していないか検出 |
| Decision 状態管理 | Decision-status 検査 | Decision 整合性レビュー | proposed/accepted/superseded/deprecated の一貫性 |
| 廃止引用 | Retired-reference 検査 | 文書間参照整合性 | 廃止文書の現行引用を検出 |
| 原本、配置先 同期 | Source-projection sync 検査 | 同期ズレ検出 | 原本と配置先の内容差異を検出 |
| REQ ID 一意性 | REQ-ID-uniqueness 検査 | ID 衝突検出 | REQ ID の再利用を検出 |
| Report 規範表現 | Report-normative 検査 | 必達要件 混入検出 | Report 内の規範表現を検出 |

### 廃止 Decision 参照更新 <!-- REQ-001 -->

廃止 Decision の参照更新ルールを定義する。

- 廃止 Decision が現行判断の根拠として引用されている場合、現行の後継 Decision または REQ に参照を更新する
- 履歴参照として廃止 Decision 番号を保持する場合は、`(retired)` 注記を付与する
- 例: `v2:ADR-0017` → `REQ-001 (後継)`。`v2:ADR-0017 (retired)` は履歴参照として許容
- docs-check / inspect-docs が廃止 Decision の現行引用を検出した場合は警告を出力する

### 用語: 原本、配置先 <!-- REQ-001 -->

原本 (source) と配置先 (projection) の用語定義、投影方向、編集原則は「文書間投影規則」セクションを正本とする。
本セクションでは再掲しない（intra-file 重複解消）。

## 文書7分類モデル

文書全体を以下の7分類で整理する（v2:REQ-0155-003）。
REQ と Design の文書種別境界（REQ-001-067）に加え、文書の関心と役割に基づく分類を提供する。

| 分類 | 記述対象 |
|---|---|
| REQ | 満たすべき振る舞い、制約、状態 |
| 挙動Design | コマンド、スキルの振る舞い、入出力、契約 |
| カタログDesign | スキーマ、enum、判定表、ルールカタログ |
| guide | 人間向けナビゲーション（規範的権限なし） |
| learning維持 | learning 知見の恒久契約への昇華候補 |
| 作業記録 | Case/RU/Issue/PR/OU 由来の一時作業記録 |
| 対象外 | 当該要件化の対象外 |

7分類は文書の振る舞いを規定するものではなく、文書整理と粒度判定の参照分類である。
分類確定は backlog-review（暫定分類）→ req-define（最終分類確定）の流れで行う。

GitHub の追跡Issueは docs/ 配下の文書種別ではなく、管理単位・永続状態として扱う。未解決事項の追跡は Issue 基盤（追跡Issue）で行い、docs/ 配下に課題ファイルの文書種別を設けない（REQ-049）。

## 局所物理分離の許容

*-rules.md 併設、integrity-rules/ サブディレクトリによる局所物理分離を許容する。
既存3層構造（commands/skills/workflows/直下）を維持する。
具体配置は各レポジトリの document-model.md に従う。
局所物理分離は文書の物理的分離を許容するが、全面再配置を強制しない。

## docs/designs/ 直下のドメイン別体系化（agent-dev-flow リポジトリ）

agent-dev-flow リポジトリの docs/designs/ 直下の基盤Designは、既存の commands/skills/workflows 層を維持したまま、以下の6つのドメインディレクトリに分類、体系化する（REQ-001-001）。
全面的な behavior/catalog 分割ではなく、基盤Designのドメイン別整理である。
この体系化は agent-dev-flow リポジトリ特有であり、AgentDevFlow 利用先プロジェクトの docs 構成を縛らない。

### ドメインディレクトリと責務 <!-- REQ-001-002 -->

| ディレクトリ | 責務 | 配置対象Design |
|---|---|---|
| foundations/ | 基盤モデル、システム構成、文書フォーマット、設計原則、縮小済みワークフロー契約 | system.md, document-model.md, patterns.md, design-principles.md, workflow-contracts.md（縮小済み旧版） |
| responsibilities/ | 文書種別責務、成果物責任、アーティファクト契約、REQ影響マップ | document-type-responsibilities.md, artifact-responsibilities.md, artifact-contracts.md, req-impact-map.md |
| quality/ | 品質仕様、品質ゲート、健全性メトリクス（REQ/Design 双方向） | quality-specs.md, quality-gates.md, req-health-metrics.md, design-health-metrics.md |
| integrity/ | 整合性契約、整合性ルールカタログ、ルール所有権、配布物整合性、backticks 判定閾値 | integrity-contracts.md, integrity-rule-catalog.md, rule-ownership.md, docs-spec-rebuild-integrity.md, backticks-identifier-threshold.md |
| local/ | ローカル版 Design 群（実行時パッケージ境界、link mode、Case ファイル） | runtime-package-boundary.md, local-case-file.md |
| authoring/ | コマンドファイル執筆規約 | command-file-format.md |

### 特例配置ファイル

| ファイル | 分類先 | 根拠 |
|---|---|---|
| req-impact-map.md | responsibilities/ | REQ → アーティファクト影響マッピングであり、責務、影響追跡の位置づけ。artifact-responsibilities.md、artifact-contracts.md と同領域 |
| workflow-contracts.md | foundations/ | 縮小済み旧版であり、基盤的なワークフロー契約の残存。内容の大部分は workflows/workflow-contracts.md へ移管済み。廃止、統合の検討は段階移送方針に従い別途 inspect-docs で行う |

### 整合性ルールの局所物理分離

integrity-rule-catalog.md の個別ルール（IR-NNN）は integrity/rules/ サブディレクトリに分離する（REQ-001-008, v2:REQ-0155-007）。
integrity-rule-catalog.md はスキーマ定義とルールインデックスを維持し、各ルールの12フィールド詳細は integrity/rules/IR-NNN-{slug}.md に配置する（DEC-013 適用: `lifecycle_state`、`enforcement_mode`、`baseline_status` 削除、retired REQ-028-009/010 から移管）。

### Design 健全性メトリクス

design-health-metrics.md を quality/ 配下に配置する（REQ-001-007）。
req-health-metrics.md と対となる Design 健全性の定量メトリクスを定義する。
内容概念（REQ/Design 健全性の双方向メトリクス）は v2:REQ-0155 で決定された。

### 段階移送方針

既存直下Designのドメインディレクトリへの移送は、inspect/backlog 経由で段階的かつ個別に行う（REQ-001-005）。
一括移送を禁止する。
移送の優先順位は inspect/backlog で決定する。
移送時、旧パスを参照する文書（README.md、他Design内の相対リンク等）の参照先を移送単位で更新する（REQ-001-006）。

新規Design作成時は、本セクションのドメイン分類に従って該当ディレクトリに配置する（REQ-001-004）。
本体系化は既存 Design 文書種別内でのディレクトリ整理であり、CATALOG 等の新規文書種別を新設しない（REQ-001-009）。

## 恒久基準と非規範情報の整理

恒久基準（Decision、REQ、Design）と非規範情報（移行情報、内部実装方式、fixture、regex、内部関数、テスト構成、
未宣言 reference、draft Design、移行証跡、リリース証跡）を整理するための 6 処置モデルを定義する。
処置の実行は inspect-docs / inspect-skills / 専用の cleanup 作業で行い、本節はモデルと契約を所有する。

### 対象カテゴリ

次の6カテゴリを走査の対象とする。

1. Decision 内の移行時情報
2. REQ 内の内部実装方式
3. Design 内の fixture、regex、内部関数、テストファイル構成
4. 規範または非規範の地位が未宣言の references
5. 未決着の draft Design
6. 移行結果またはリリース証跡

### inventory item 識別子

各 inventory item は次の3要素で識別する。
重複 key を許可しない。

| 要素 | 内容 |
|---|---|
| `artifact_path` | 対象ファイルの相対パス |
| `target_area` | 見出し、field、rule row の識別子 |
| `statement_key` | 正規化した対象記述の stable hash |

### 6 処置モデル

各 inventory item へ次のいずれか一つを割り当てる。
同一 item へ複数処置を割り当てない。

| 処置 | 内容 | 必須記録事項 |
|---|---|---|
| KEEP | 現位置で保持する | 正規所有者 |
| MERGE | 同一関心の他記述へ統合する | 統合先、統合根拠 |
| REFERENCE | 他文書へ参照を張る | 参照先 |
| MOVE | 別の正規所有者へ移動する | 移動先、正規所有者 |
| RETIRE | 廃止し履歴保持先へ記録する | 廃止理由、履歴保持先 |
| INFERENCE | 推論により正規所有者を補完する | 推論根拠、補完先 |

- MOVE または REFERENCE には解決可能な移動先または参照先が存在すること
- RETIRE または INFERENCE には理由と履歴保持先が記録されること

本節の6処置は cleanup 実行モデルに適用する。
「既存成果物の6処置」節（「恒久契約適格性と既存成果物処置分類」配下）も同名の KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE を定義するが、昇格前の適格性判定に適用する。
両者は独立した正規所有契約であり、統合しない。

### 処置後の記録と再検証

- 処置後は正規所有者、移動先、履歴保持先を記録する
- 処置の影響レーンだけを再検証する（全文再検証ではなく影響レーン局限）
- 現行 Decision、REQ、Design に移行結果またはリリース証跡が規範内容として残らないこと
- 移行結果とリリース証跡は非規範の Report（Release Report 等）へ移す

### draft Design の扱い

- draft Design ごとに accepted 化、統合、retire のいずれかを確定する
- 未決着の draft Design を放置しない
- draft status の Design が一定期間更新されず放置されることを検出するルール（IR-054）と連動する

### accepted Decision の意味変更

- accepted Decision の意味変更は後継 Decision を必須とし、直接適用しない
- 履歴証拠を削除して追跠不能にしない
