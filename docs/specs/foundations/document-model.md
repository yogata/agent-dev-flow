---
status: accepted
updated: 2026-07-12
---

# 文書モデル

本 SPEC は agent-dev-flow リポジトリのみに適用される。

## 目的

REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックスを定義し、各文書種別が何を記述し、何を記述しないかを明確にする（REQ-0101）。

### 他 SPEC との役割分担

本 SPEC と `../responsibilities/document-type-responsibilities.md` は補完関係にある（AG-004）。重複しやすい関心を以下の通り分担する。

| 関心 | 主に扱う SPEC |
|---|---|
| 文書種別の基準境界（REQ/ADR/SPEC/guides/DOC-MAP の役割定義、ライフサイクル、優先順位、参照規則、投影方向） | 本 SPEC |
| SPEC 内部論理区分、文書7分類、局所物理分離、docs/specs/ 直下のドメイン別体系化規範 | 本 SPEC |
| 文書種別配置の執筆時判定基準、実行主体分類、要件行書き方、SKILL構造、用語政策 | `../responsibilities/document-type-responsibilities.md` |
| 共通文書モデル規約（frontmatter、ID 体系、命名規則、URL 参照形式、共通フォーマット規約） | `patterns.md`（本 SPEC は文書種別マトリックスを扱い、`patterns.md` は共通フォーマット規約を扱う: AG-006） |

両 SPEC の境界を変更する場合は、相互参照を更新し、同一関心の説明が重複・矛盾しない状態を維持する。新規ファイル分割は行わず、既存2ファイル間の重複削除で運用する（AG-004、REQ-0101-058）。

## 責務マトリックス

| 文書種別 | 記述するもの | 記述しないもの |
|---|---|---|
| REQ | 現行要件（WHAT: 何を満たすべきか） | 実装詳細、HOW、現在の動作記述 |
| ADR | 将来の設計、運用、文書システムを制約する決定とその理由（WHY）<!-- REQ-0101 --> | 可逆的な運用手順、状態遷移、形式定義 |
| SPEC | 現在のアーキテクチャ基準（現在どう動作しているか）※リポジトリ内部設計文書。実行時配布物の依存先ではない（ADR-0103, ADR-0104） | 新規要件、将来計画、判断根拠（ADR の管轄） |
| DOC-MAP | 文書探索、参照経路の入口 | 基準内容の代替、要件定義 |
| Guides | 人間向けナビゲーション層。規範的権限を持たない（ADR-0103） | 要件本文、契約本文、REQ/ADR/SPEC 内容の重複 |

### ワークフロー状態管理

ワークフロー状態（例: "要件定義", "実装", "テスト" 等の 6 マイクロフェーズ）は Issue ラベル、GitHub Project で管理する（REQ-0108-123、REQ-0101-037）。
REQ/SPEC 文書内には状態として含めず、ワークフローの説明目的でのみ使用する。

### REQ 内容契約

REQ 文書の各セクションが保持すべき内容の契約（REQ-0102-006, 007, ADR-0103）。

| セクション | 保持するもの | 保持しないもの |
|---|---|---|
| title | 責務、状態、制約を表す名称 | 作業名（移行、削除、改名等） |
| 目的 | 現在満たすべき状態、振る舞い、制約の概要 | 変更履歴、作業手順 |
| 要件行 | 検証可能な状態要件（満たすべき振る舞い、制約） | 反映作業（更新、削除、移動等の操作） |
| 適用範囲 | 現在の適用対象、対象外 | 将来の変更計画、移行対象 |

作業手段（移行、変更、再定義、削除、改名、移管、除去等）は case / Issue / 受け入れ条件 / 作業記録で扱い、現行 REQ の要件行に混入させない（REQ-0102-049）。

## REQ 分類レイヤー

現行 REQ は以下の 6 分類のいずれかに属する（REQ-0101-052）。
各 REQ ファイルは関心対象の総体として説明できること。

| 分類 | 説明 | 代表例 |
|---|---|---|
| 文書統治 REQ | REQ/ADR/SPEC/guides/DOC-MAP の基準境界、文書分類ポリシー、ID 規約 | REQ-0101 |
| ワークフロー全体 REQ | 開発ワークフロー、コマンド間データフロー、work_type 分類、SSoT 遷移 | REQ-0104 |
| コマンド級 REQ | 公開コマンドの入力、出力、副作用境界、停止条件、他コマンドとの接続 | REQ-0102, REQ-0105, REQ-0106 |
| 成果物、実行時、スキル責務 REQ | Command/Skill/Template/Script の責務境界、配布制約、原本、配置先分離 | REQ-0103, REQ-0119 |
| 検証、検査 REQ | 整合性検査、検出事項分類、docs-check、inspect-docs の検査責務 | REQ-0108, REQ-0109 |
| ADR ライフサイクル REQ | ADR 状態の正規化、ADR 運用品質維持 | REQ-0112 |

### コマンド級 REQ 定義

コマンド級 REQ は、公開コマンドの入力、出力、副作用境界、停止条件、他コマンドとの接続を持つ単位として定義する（REQ-0101-054）。
1 コマンドにつき 1 コマンド級 REQ を原則とする。

### SPEC 分離基準

SPEC に置くべき内容を現行 REQ から切り出す基準（REQ-0101-055）:

| SPEC に置くもの | REQ に置くもの |
|---|---|
| スキーマ、ライフサイクル、コマンド構成、ルールカタログ、テストデータ詳細に加え、以下の移管候補一覧 | 満たすべき振る舞い、制約、状態の宣言 |

<!-- REQ-0101-068 -->
REQ 要件行が以下のいずれかのみを主たる文意とする場合、当該内容を SPEC、ルールカタログ、コマンドリファレンス、スキルリファレンス、テスト文書のいずれかに配置する:

| 移管候補 | 主たる移管先 |
|---|---|
| スキーマフィールド | SPEC |
| enum 値一覧 | SPEC / ルールカタログ |
| 経路、カテゴリ、状態の詳細判定表 | SPEC / ルールカタログ |
| ファイルパターン | SPEC / コマンドリファレンス |
| テンプレート種別（`variant`） | SPEC / コマンドリファレンス |
| レポート形式 | SPEC |
| テストデータ詳細（`fixture detail`） | SPEC / テスト文書 |
| 回帰テスト条件 | テスト文書 / ルールカタログ |
| チェッカー個別ルール | ルールカタログ |
| 誤検知（false positive）抑制方式 | ルールカタログ |
| リトライ回数 | SPEC / コマンドリファレンス |
| トークン目安 | SPEC / コマンドリファレンス |
| 行数上限 | SPEC |
| Step 番号 | SPEC / コマンドリファレンス |
| Phase 番号 | SPEC / コマンドリファレンス |
| 内部アルゴリズム | SPEC |
| 作業履歴 | テスト文書 / 作業記録 |
| Case/RU/Issue/PR/OU 由来の作業記録 | テスト文書 / 作業記録 |

### 安定契約の例外 <!-- REQ-0101-069 -->

REQ 要件行候補がパラメータ、分類、値の形式をとる場合であっても、以下のいずれかに該当する場合は REQ に要約として記述する。詳細な値一覧、判定表、内部処理条件は SPEC 等に配置する:

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

### REQ 粒度判定テスト <!-- REQ-0102-054 -->

REQ 要件行の粒度を判定するテスト:

> 当該要件行が存在しない場合、対象 REQ が何を満たすべきか不明になるか？

判定結果が YES の場合は当該行を REQ に残す。
判定結果が NO の場合は当該行を SPEC、ルールカタログ、コマンドリファレンス、スキルリファレンス、テスト文書のいずれかに移管する。

### 新規 REQ 作成基準

新規 REQ は、既存の現行 REQ に吸収できない独立関心対象がある場合のみ作成する（REQ-0101-007, 053）。
既存 REQ への APPEND / UPDATE を優先する。

### 廃止候補判定基準

廃止（retire）候補の判定基準（REQ-0101-056）:

| 類型 | 説明 |
|---|---|
| バグ修正由来 | 単発のバグ修正に起因し、恒常的な状態要件としての維持必要性がない |
| 移行完了状態 | 移行、改名、廃止の完了記録が主題であり、現行の状態要件ではない |
| 他 REQ 吸収済み | 恒久内容が他の現行 REQ に吸収され、単独維持の必要性がない |
| 作業手段主題 | 作業手順、運用プロセスが主題であり、満たすべき状態要件ではない |

### REQ 品質維持基準

SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT は、inspect-docs の診断観点に加え、REQ 運用品質維持の恒常的基準として参照する（REQ-0109-039）。
REQ 体系の健全性を維持するため、これらの観点で定期的に REQ 体系を評価する。

## 文書ライフサイクル

```
REQ（要件定義）
  ↓ 判断が必要な場合
ADR（決定記録）<!-- REQ-0101 -->
  ↓ 判断に基づく実装
SPEC（現在仕様記述）
  ↓ 探索支援
DOC-MAP（索引）/ Guides（案内）
```

- REQ は領域別の総体として管理する。変更の都度 REQ を作成せず、既存 REQ への APPEND / UPDATE で対応する。
- ADR は `proposed` → `accepted` / `superseded` / `deprecated` の状態遷移を持つ。現行基準（`baseline`）は ADR-0101 以降（現行 ADR コレクション）。ADR-0001〜0099 は `docs/adr/retired/` に配置された履歴番号帯である（REQ-0112-047, 048）。
- SPEC は実装とともに変化する「生きた文書」である。REQ や ADR の判断内容を代替しない。
- DOC-MAP は非正規索引であり、REQ/ADR/SPEC の内容を代替しない。
- Guides はナビゲーション層であり、規範文書ではない。

### SPEC ライフサイクル（ADR-0123）

SPEC ファイルは frontmatter `status` フィールド（`draft` / `accepted`）で成熟度を管理する。
`status` は「現在仕様の基準」という SPEC の位置づけ（ADR-0103）を変更せず、その確定度合いを表す追加的なメタデータである。

| status | 意味 | 検査対象 | 遷移契機 |
|---|---|---|---|
| `draft` | spec-save で保存された直後の未確定状態 | IR-044（REQ/SPEC 境界違反検出）等の対象外 | spec-save が新規 SPEC 作成時に付与（既定値） |
| `accepted` | case-close で SPEC 確定チェック通過済み | すべての整合性ルールの検査対象 | case-close Step 3 で実装が SPEC 内容を検証したことを確認時 |
| `superseded` | 後継 SPEC へ移行済み。frontmatter `superseded_by` で後継を明示 | docs-check/inspect-docs 検査対象外（`superseded_by` 存在で機械判定） | req-save/spec-save で後継 SPEC 作成時に付与 |

- 新規 SPEC 作成（spec-save）時は `status: draft` を付与する
- 既存 SPEC へ追記時は当該 SPEC の `status` を変更しない
- `draft` → `accepted` の昇格は case-close の責務（spec-save は accepted を付与しない）
- `status` フィールドがない既存 SPEC は `accepted` と同等に扱う（後方互換）
- superseded SPEC は元位置に残置し `superseded_by` frontmatter で後継を明示する（`docs/specs/retired/` は新設しない）。superseded 宣言は req-save/spec-save で後継 SPEC 作成時に行う

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（ADR-0103）。
他プロジェクトへの適用を意図しない。
実行時コマンドは SPEC ファイルに依存しない（ADR-0104）。

## 作業領域と状態の境界

| ディレクトリ | 役割 | 性質 |
|---|---|---|
| `.agentdev/` | AgentDevFlow の原本ドメイン状態（intake / learning / backlog / integrity） | 永続的なドメイン状態。配布物ではない |
| `.agentdev/drafts/` | コマンドワークフローでの作業用一時領域 | 現行コマンドの明示的な作業用ドラフト引き継ぎでのみ使用 |

### draft の位置づけ（REQ-0138, ADR-0124）

`.agentdev/drafts/req-draft-*.md`（req_draft）は、req-define が生成し req-save / spec-save / case-open / case-auto / case-run / case-close が消費する一時的な構造化ハンドオフ成果物である。永久文書（REQ/ADR/SPEC/guides/DOC-MAP）ではなく、以下の性質を持つ:

- **緩やかな契約（soft contract）**: API 契約ではなく生成側（producer）の標準。LLM 推論経由で消費され、機械的パースを前提としない（ADR-0124）。厳格なスキーマバージョン、JSON Schema、バリデータは導入しない
- **構造化データが正**: 後続工程の権威ある情報源は `# draft-data` fenced YAML block であり、人間可読 Markdown セクション（`# summary` 等）は補助的である（REQ-0138-001, REQ-0138-002）
- **一時成果物**: case-open 成功後（Issue/Epic 作成 + VERIFY）は削除されてよい。case-open 成功後は Issue/Epic を SSoT とし、req_draft は存在しない一時成果物となる（REQ-0138-015, REQ-0138-016）
- **標準データモデル**: `auto_gate`, `agreed_items`, `artifact_actions`, `conflict_resolutions`, `operation_units`, `case_open_hints` を中心フィールドとする（REQ-0138-011）。詳細構造は `docs/specs/responsibilities/artifact-contracts.md` の「req_draft 出力構造」を参照
- **artifact_actions 統合**: REQ/ADR/SPEC への保存対象は成果物別配列に分散させず、単一の `artifact_actions` 配列に統合する（REQ-0138-009）。後続コマンドの工程分岐は `work_type` 固定分岐ではなく `artifact_actions` の存在で判定する

## 信頼できる情報源の優先順位

文書間に矛盾がある場合の優先順位（REQ-0101-011）:

1. 現行 REQ
2. ADR（承認済み）
3. SPEC
4. DOC-MAP / guides

## 設定規則

| 規則 | 内容 |
|---|---|
| REQ ID | 4 桁ゼロ埋めの安定 ID。現行、廃止を問わず再利用しない |
| ADR ID | 4 桁ゼロ埋め。現行基準（`baseline`）は ADR-0101 以降（現行コレクション）。旧番号帯 ADR-0001〜0099 は廃止（`docs/adr/retired/`）。状態は frontmatter で管理（REQ-0112-047, 048） |
| SPEC 配置 | `docs/specs/**/*.md`（基盤SPECは6ドメインディレクトリ、他は commands/skills/workflows の3層。詳細は「docs/specs/ 直下のドメイン別体系化」参照） |
| SPEC status | frontmatter `status`（`draft` / `accepted`）。既定は `draft`（spec-save 新規作成時）。`status` なしは `accepted` 相当（ADR-0123） |
| Guides 配置 | `docs/guides/*.md` 直下 |
| 廃止 REQ | `docs/requirements/retired/` に配置。現行要件判断に使用しない |
| 廃止 ADR | `docs/adr/retired/` に配置。現行根拠として使用しない。履歴参照時は廃止パスを明示（REQ-0112-048） |

## ADR 編集制約

- 承認済み ADR の決定内容を意味変更してはならない（REQ-0112-045）。変更が必要な場合は新規 ADR を作成し、旧 ADR を superseded/deprecated とする
- ADR 体系の全面改定時は例外として、ユーザー承認済みの範囲で deprecated/superseded ADR の最小限を超える編集を許可する（REQ-0112-044）。ただし、編集目的、対象、変更種別、移管先、現行根拠として残す ADR を明示すること

## 文書分類ポリシー

<!-- REQ-0101 -->

文書の分類、権限、ライフサイクル、相互参照に関する包括ポリシー。
新規文書作成時、既存文書更新時の分類判断基準として機能する（REQ-0101）。

### 文書権限モデル <!-- REQ-0101 -->

各文書種別の編集権限、承認フロー、変更主体を定義する。

| 文書種別 | 編集権限 | 承認フロー | 変更主体 |
|---|---|---|---|
| REQ | req-define / req-save コマンド経由 | ユーザー承認（req-save） | エージェント（draft 作成）、ユーザー（最終承認） |
| ADR | req-save / 手動作成 | ユーザー承認 | エージェント（draft 作成）、ユーザー（最終承認） |
| SPEC | 実装に伴う更新 | SPEC は「現在仕様」の記録のため、実装完了に伴い更新 | エージェント（実装後の SPEC 更新） |
| Guide | inspect-docs / 手動更新 | 規範的権限なし。情報正確性の確認のみ | エージェント / ユーザー |
| Report | 整合性コマンド等の自動生成、または手動作成 | 公開時の事実確認 | エージェント（自動生成）、ユーザー（手動作成） |
| DOC-MAP | 文書追加、移動に伴う更新 | 非正規索引のため、承認不要 | エージェント / ユーザー |
| 廃止 | 編集不可（履歴参照専用） | なし | なし |

### 分類判断ツリーの配置 <!-- AG-004 -->

新規文書作成時の分類判断フロー（分類判断ツリー）は執筆時配置判定に属するため、`../responsibilities/document-type-responsibilities.md`「新規文書作成時の分類判断ツリー」を参照（AG-004）。本 SPEC は文書種別の基準境界（責務マトリックス、各文書種別の記述対象）を正本として保持し、執筆時の判定手順は document-type-responsibilities.md 側に寄せている。

### 文書間投影規則 <!-- REQ-0101 -->

コマンド、スキル等の実行時配布物における原本、配置先（source/projection）の用語と方向を定義する。

| 用語 | 意味 | パス例 |
|---|---|---|
| **原本 (source)** | 編集対象の一次ソース | `src/opencode/commands/agentdev/*.md`、`src/opencode/skills/agentdev-*/` |
| **配置先 (projection)** | 実行時環境への投影先 | `.opencode/commands/agentdev/*.md`、`.opencode/skills/agentdev-*/` |

**投影方向**: 原本 → 配置先 のみ（逆方向の投影は行わない）。
配置先での直接編集は禁止し、原本を変更後に同期スクリプトで配置先を更新する（ADR-0105）。

### 参照規則 <!-- REQ-0101 -->

文書間の参照形式と引用ルールを定義する。

- **REQ 参照**: `REQ-{NNNN}` 形式（例: `REQ-0101`）。個別要件は `REQ-{NNNN}-{SSS}` 形式（例: `REQ-0101-002`）
- **ADR 参照**: `ADR-{NNNN}` 形式（例: `ADR-0103`）
- **リンク形式**: Markdown リンクで `[REQ-0101](../requirements/REQ-0101.md)` のように相対パスで記述
- **引用ルール**: 安定 ID（`REQ-{NNNN}`、`ADR-{NNNN}`）で参照し、セクションタイトルのみでの参照は禁止。セクション参照が必要な場合は `REQ-0101-002` や `ADR-0103 決定セクション` のように ID を併記する
- **廃止文書の参照**: 廃止文書を参照する場合は `(retired)` 注記を付与し、現行の後継文書も併記する（REQ-0112-048）

### ライフサイクル規則 <!-- REQ-0101 -->

各文書種別の状態遷移を定義する。

**共通状態**: 作成 → 現行 → 改訂 → 廃止（種別ごとに表現が異なる）

| 文書種別 | 状態遷移 | 備考 |
|---|---|---|
| REQ | created → active → superseded / partially superseded | APPEND/UPDATE で拡張。個別要件の supersede は mapping-table で追跡 |
| ADR | proposed → accepted → superseded / deprecated | 承認済みのみ現行根拠。全面改訂時は新世代を創設（ADR-0001〜0023 → ADR-0101〜0112） |
| SPEC | active → superseded（後継SPECへの移行表示） | SPEC は「現在仕様」の記録。後継SPECへの移行表示を frontmatter `superseded_by` で保持し、廃止状態を持たず元位置に残置する |
| Guide | active → outdated → removed | 内容陳腐化時に移行。規範的権限なし |
| Report | published → archived | 作成後の修正は事実確認の範囲に限定 |
| DOC-MAP | always active | 更新のみ。廃止なし |

### 基準再設定規則 <!-- REQ-0101 -->

文書体系の全面改訂時の取り扱いを定義する。

- **全面改訂は世代交代であり、上書きではない**
- 世代交代の例: ADR 基準（`baseline`）再編（ADR-0001〜0023 → ADR-0101〜0112）。旧番号帯は `docs/adr/retired/` に配置し、現行判断の基盤は新番号帯にある
- 新世代の創設時は、旧世代から引き継ぐ判断内容、移管先、移管しない判断を明示する
- 旧世代は履歴参照専用とし、現行判断の根拠として引用しない

### 同期規則 <!-- REQ-0101 -->

既存文書の更新運用ルールを定義する。

- **APPEND/UPDATE が正しい操作である。同期不足が問題である。**
- REQ の変更は APPEND（要件追加）または UPDATE（既存要件の修正）で行う。既存 REQ を新規 REQ で上書きしない
- ADR の変更は新規 ADR の作成により行い、旧 ADR を superseded/deprecated とする
- SPEC の更新は実装完了後に反映し、REQ と SPEC 間の同期ズレを放置しない
- docs-check / inspect-docs が同期不足を検出可能であること

### Report 分類 <!-- REQ-0101 -->

Report を正式な文書分類として定義する。
SPEC とは独立した種別である。

- **定義**: 分析結果、監査所見、インシデント記録、診断レポート等の事実記録文書
- **配置場所**: `.agentdev/integrity/reports/` または該当ドメイン配下
- **規範表現**: Report は 必達要件 規範表現を使用しない。事実の記述と分析結果の提示に留める
- **変更**: 公開後の修正は事実確認の範囲に限定。事実関係の誤りのみ修正可能
- **SPEC との違い**: SPEC は現在のアーキテクチャ基準（現在どう動作しているか）を記述する。Report は特定の時点での分析、監査、診断結果を記録する

### ADR 定義拡張 <!-- REQ-0101 -->

ADR の適用範囲を拡張する。

- **従来の定義**: 「取り返しのつかない技術判断の記録」
- **拡張後の定義**: 「将来の設計、運用、文書システムを制約する決定の記録」
- 技術判断に限定されず、文書システムの運用ルールや、プロジェクトの組織的決定も ADR の対象となる
- この拡張は ADR-0103 の決定セクションにも反映される

### 内容境界規則（ADR/REQ 主題妥当性）<!-- REQ-0101-043〜051 -->

ADR と REQ の主題として記述してよい内容の境界を定義する。
作業手段（HOW）が ADR/REQ の主題に混入することを防ぐ。

- **ADR**: 意思決定と理由のみを記録する。削除、廃止、移行、統合、再構築、完全削除そのものを主題にしない（REQ-0101-044）。過去判断を現行基盤から外すだけの場合は新規 ADR ではなく廃止、supersede で処理する（REQ-0101-045）
- **REQ**: 現在満たすべき状態、振る舞い、制約のみを定義する。作業手段を要件行として含めない
- **作業手段の取り扱い**: 削除、廃止、移行、統合、再構築、完全削除等の作業手段は case/Issue/PR/作業記録で扱い、ADR/REQ の主題としない

### SPEC 責務境界 <!-- REQ-0101 -->

SPEC の記述範囲を責務境界として定義する。

- **SPEC に新規要件を置かない**。将来要件は REQ に記述する
- **SPEC は現在仕様、契約記述に限定する**。判断根拠は ADR に記述する
- SPEC は現在システムがどう動作しているか（現在どう動作しているか）を記述し、どう動作すべきか（WHAT）を記述しない

### アンチパターン <!-- REQ-0101 -->

文書分類の典型的な誤りパターンを列挙する。
これらのパターンに該当する文書は分類修正の対象とする。

| 誤りパターン | 正しい分類 | 修正方針 |
|---|---|---|
| SPEC に新規要件が含まれている | REQ | 要件部分を REQ に切り出し、SPEC は現在仕様の記述に留める |
| ADR が現在の動作を記述している | SPEC | 動作記述部分を SPEC に移動し、ADR は判断とその根拠に絞る |
| Guide に要件本文、契約本文が含まれている | REQ/ADR/SPEC 参照 | 要件、契約内容を REQ/ADR/SPEC への参照に置き換える |
| REQ に実装詳細が含まれている | SPEC | 実装詳細を SPEC に移動し、REQ は WHAT に絞る |
| Report の内容が SPEC に混入している | Report（独立文書） | Report を独立文書として分離する |
| 廃止文書が現行判断の根拠として引用されている | 現行後継文書 | 引用先を現行の後継文書に更新する |

### レビュー、検査対応 <!-- REQ-0101 -->

分類ルールと docs-check / inspect-docs の検査項目の対応を定義する。

| 分類ルール | docs-check 検査 | inspect-docs 検査 | 検査内容 |
|---|---|---|---|
| 責務境界（SPEC に要件混入） | SPEC-REQ-mix 検査 | 意味整合性レビュー | SPEC 内の 必達要件 が現在仕様の記述か判定 |
| 責務境界（Guide の要件本文混入） | Guide-intrusion 検査 | 要件本文検出 | Guide が要件本文、契約本文を保持していないか検出 |
| ADR 状態管理 | ADR-status 検査 | ADR 整合性レビュー | proposed/accepted/superseded/deprecated の一貫性 |
| 廃止引用 | Retired-reference 検査 | 文書間参照整合性 | 廃止文書の現行引用を検出 |
| 原本、配置先 同期 | Source-projection sync 検査 | 同期ズレ検出 | 原本と配置先の内容差異を検出 |
| REQ ID 一意性 | REQ-ID-uniqueness 検査 | ID 衝突検出 | REQ ID の再利用を検出 |
| Report 規範表現 | Report-normative 検査 | 必達要件 混入検出 | Report 内の規範表現を検出 |

### 廃止 ADR 参照更新 <!-- REQ-0101 -->

廃止 ADR の参照更新ルールを定義する。

- 廃止 ADR が現行判断の根拠として引用されている場合、現行の後継 ADR または REQ に参照を更新する
- 履歴参照として廃止 ADR 番号を保持する場合は、`(retired)` 注記を付与する
- 例: `ADR-0017` → `ADR-0103 (後継)`。`ADR-0017 (retired)` は履歴参照として許容
- docs-check / inspect-docs が廃止 ADR の現行引用を検出した場合は警告を出力する

### 用語: 原本、配置先 <!-- REQ-0101 -->

原本 (source) と配置先 (projection) の用語定義、投影方向、編集原則は「文書間投影規則」セクションを正本とする。本セクションでは再掲しない（AG-003、intra-file 重複解消）。

## SPEC 内部論理区分

SPEC は文書種別として維持し、内部を以下の論理区分で整理する（REQ-0155-001）。各区分の規範は各レポジトリの document-model.md が定義する。
従来の3層ディレクトリ構造（commands/skills/workflows/直下）を維持しつつ、各 SPEC ファイルの内容がいずれの論理区分に属するかを明確にする。

| 論理区分 | 記述対象 | 代表例 |
|---|---|---|
| 挙動SPEC | コマンド、スキル、ワークフローの振る舞い、入出力、副作用、停止条件 | commands/req-define.md、skills/`agentdev-req-analysis`.md |
| カタログSPEC | スキーマ、enum、判定表、ルールカタログ、テンプレート種別 | integrity-rule-catalog.md、req-impact-map.md |
| 横断契約SPEC | 複数コマンド、スキルにまたがる共通契約 | workflows/workflow-contracts.md、workflows/delegation-contracts.md |
| 実装詳細SPEC | 内部アルゴリズム、パラメータ、実装詳細 | req-health-metrics.md、quality-gates.md |

1つの SPEC ファイルが複数の論理区分にまたがる場合、主たる区分をファイルの冒頭に明示する。
論理区分は物理的なディレクトリ分離を意味せず、既存3層構造内での内容整理のための区分である。
従来の workflows/ 層が横断契約 SPEC に対応する。

索引文書（DOC-MAP.md、specs/README.md）は文書探索、参照経路の入口を担うが、SPEC 内部論理区分には含まれない。索引文書は既存文書種別（DOC-MAP.md = 探索経路インデックス、specs/README.md = SPEC マニフェスト）の役割表現であり、新文書種別ではない。

## 文書7分類モデル

文書全体を以下の7分類で整理する（REQ-0155-003）。
REQ と SPEC の文書種別境界（REQ-0101-067）に加え、文書の関心と役割に基づく分類を提供する。

| 分類 | 記述対象 |
|---|---|
| REQ | 満たすべき振る舞い、制約、状態 |
| 挙動SPEC | コマンド、スキルの振る舞い、入出力、契約 |
| カタログSPEC | スキーマ、enum、判定表、ルールカタログ |
| guide | 人間向けナビゲーション（規範的権限なし） |
| learning維持 | learning 知見の恒久契約への昇華候補 |
| 作業記録 | Case/RU/Issue/PR/OU 由来の一時作業記録 |
| 対象外 | 当該要件化の対象外 |

7分類は文書の振る舞いを規定するものではなく、文書整理と粒度判定の参照分類である。
分類確定は backlog-review（暫定分類）→ req-define（最終分類確定）の流れで行う。

## 局所物理分離の許容

*-rules.md 併設、integrity-rules/ サブディレクトリによる局所物理分離を許容する。
docs/specs/behavior|catalog/ への全面再配置は禁止し、既存3層構造（commands/skills/workflows/直下）を維持する。
具体配置は各レポジトリの document-model.md に従う。
局所物理分離は文書の物理的分離を許容するが、全面再配置を強制しない。

## docs/specs/ 直下のドメイン別体系化（agent-dev-flow リポジトリ）

agent-dev-flow リポジトリの docs/specs/ 直下の基盤SPECは、既存の commands/skills/workflows 層を維持したまま、以下の6つのドメインディレクトリに分類、体系化する（REQ-0156-001）。
全面的な behavior/catalog 分割ではなく、基盤SPECのドメイン別整理である。
この体系化は agent-dev-flow リポジトリ特有であり、AgentDevFlow 利用先プロジェクトの docs 構成を縛らない。

### ドメインディレクトリと責務 <!-- REQ-0156-002 -->

| ディレクトリ | 責務 | 配置対象SPEC |
|---|---|---|
| foundations/ | 基盤モデル、システム構成、文書フォーマット、設計原則、縮小済みワークフロー契約 | system.md, document-model.md, patterns.md, design-principles.md, workflow-contracts.md（縮小済み旧版） |
| responsibilities/ | 文書種別責務、成果物責任、アーティファクト契約、REQ影響マップ | document-type-responsibilities.md, artifact-responsibilities.md, artifact-contracts.md, req-impact-map.md |
| quality/ | 品質仕様、品質ゲート、健全性メトリクス（REQ/SPEC 双方向） | quality-specs.md, quality-gates.md, req-health-metrics.md, spec-health-metrics.md |
| integrity/ | 整合性契約、整合性ルールカタログ、ルール所有権、配布物整合性、backticks 判定閾値 | integrity-contracts.md, integrity-rule-catalog.md, rule-ownership.md, docs-spec-rebuild-integrity.md, backticks-identifier-threshold.md |
| local/ | ローカル版 SPEC 群（実行時パッケージ境界、Case ファイル、生成） | runtime-package-boundary.md, local-case-file.md, local-generation.md（local-transform.md は local-generation.md へ一本化、削除済み: AG-003, REQ-0141-028/029） |
| authoring/ | コマンドファイル執筆規約 | command-file-format.md |

### 分類確定ファイル（親エージェント確認済み）

以下のファイルは RU-0002 の提案構造に明示されていなかったが、親エージェントにより分類先が確定した。

| ファイル | 分類先 | 根拠 |
|---|---|---|
| req-impact-map.md | responsibilities/ | REQ → アーティファクト影響マッピングであり、責務、影響追跡の位置づけ。artifact-responsibilities.md、artifact-contracts.md と同領域 |
| workflow-contracts.md | foundations/ | 縮小済み旧版であり、基盤的なワークフロー契約の残存。内容の大部分は workflows/workflow-contracts.md へ移管済み。廃止、統合の検討は段階移送方針に従い別途 inspect-docs で行う |

### 整合性ルールの局所物理分離

integrity-rule-catalog.md の個別ルール（IR-NNN）は integrity/rules/ サブディレクトリに分離する（REQ-0156-008, REQ-0155-007）。
integrity-rule-catalog.md はスキーマ定義とルールインデックスを維持し、各ルールの15フィールド詳細は integrity/rules/IR-NNN-{slug}.md に配置する。

### SPEC 健全性メトリクス

spec-health-metrics.md を quality/ 配下に配置する（REQ-0156-007）。
req-health-metrics.md と対となる SPEC 健全性の定量メトリクスを定義する。
内容概念（REQ/SPEC 健全性の双方向メトリクス）は REQ-0155 で決定された。

### 段階移送方針

既存直下SPECのドメインディレクトリへの移送は、inspect/backlog 経由で段階的かつ個別に行う（REQ-0156-005）。
一括移送を禁止する。
移送の優先順位は inspect/backlog で決定する。
移送時、旧パスを参照する文書（README.md、DOC-MAP.md、他SPEC内の相対リンク等）の参照先を移送単位で更新する（REQ-0156-006）。

新規SPEC作成時は、本セクションのドメイン分類に従って該当ディレクトリに配置する（REQ-0156-004）。
本体系化は既存 SPEC 文書種別内でのディレクトリ整理であり、CATALOG 等の新規文書種別を新設しない（REQ-0156-009）。
