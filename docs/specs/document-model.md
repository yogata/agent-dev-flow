# Document Model Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックスを定義し、各文書種別が何を記述し、何を記述しないかを明確にする（REQ-0101）。

## Responsibility Matrix

| 文書種別 | 記述するもの | 記述しないもの |
|---|---|---|
| REQ | 現行要件（WHAT: 何を満たすべきか） | 実装詳細、HOW、現在の動作記述 |
| ADR | 将来の設計・運用・文書システムを制約する決定とその理由（WHY）<!-- REQ-0101 --> | 可逆的な運用手順、状態遷移、形式定義 |
| SPEC | 現在のアーキテクチャ基準（HOW it works now）※repo-internal 設計文書。runtime 配布物の依存先ではない（ADR-0103, ADR-0104） | 新規要件、将来計画、判断根拠（ADR の管轄） |
| DOC-MAP | 文書探索・参照経路の入口 | 基準内容の代替、要件定義 |
| Guides | 人間向けナビゲーション層。規範的権限を持たない（ADR-0103） | 要件本文・契約本文・REQ/ADR/SPEC 内容の重複 |

### workflow status 管理

workflow status（例: "要件定義", "実装", "テスト" 等の6マイクロフェーズ）は Issue ラベル・GitHub Project で管理する（REQ-0108-123、REQ-0101-037）。REQ/SPEC 文書内には状態として含めず、ワークフローの説明目的でのみ使用する。

### REQ Content Contract

REQ 文書の各セクションが保持すべき内容の契約（REQ-0102-006, 007, ADR-0103）。

| セクション | 保持するもの | 保持しないもの |
|---|---|---|
| title | 責務・状態・制約を表す名称 | 作業名（移行・削除・改名等） |
| 目的 | 現在満たすべき状態・振る舞い・制約の概要 | 変更履歴・作業手順 |
| 要件行 | 検証可能な状態要件（満たすべき振る舞い・制約） | 反映作業（更新・削除・移動等の操作） |
| 適用範囲 | 現在の適用対象・対象外 | 将来の変更計画・移行対象 |

作業手段（移行・変更・再定義・削除・改名・移管・除去等）は case / Issue / 受け入れ条件 / 作業記録で扱い、active REQ の要件行に混入させない（REQ-0102-049）。

## REQ Classification Layers

active REQ は以下の6分類のいずれかに属する（REQ-0101-052）。各 REQ ファイルは関心対象の総体として説明できること。

| 分類 | 説明 | 代表例 |
|---|---|---|
| 文書統治REQ | REQ/ADR/SPEC/guides/DOC-MAP の基準境界、文書分類ポリシー、ID規約 | REQ-0101 |
| ワークフロー全体REQ | 開発ワークフロー、コマンド間データフロー、work_type 分類、SSoT遷移 | REQ-0104 |
| command-level REQ | 公開commandの入力・出力・副作用境界・停止条件・他commandとの接続 | REQ-0102, REQ-0105, REQ-0106 |
| artifact/runtime/skill責務REQ | Command/Skill/Template/Script の責務境界、配布制約、source/projection分離 | REQ-0103, REQ-0119 |
| validation/inspection REQ | 整合性検査、finding分類、docs-check、inspect-docs の検査責務 | REQ-0108, REQ-0109 |
| ADR lifecycle REQ | ADR status正規化、ADR運用品質維持 | REQ-0112 |

### command-level REQ Definition

command-level REQ は、公開commandの入力・出力・副作用境界・停止条件・他commandとの接続を持つ単位として定義する（REQ-0101-054）。1 command につき 1 command-level REQ を原則とする。

### SPEC Separation Criteria

SPEC に置くべき内容を active REQ から切り出す基準（REQ-0101-055）:

| SPEC に置くもの | REQ に置くもの |
|---|---|
| schema、lifecycle、command topology、rule catalog、fixture detail | 満たすべき振る舞い・制約・状態の宣言 |

### New REQ Creation Criteria

新規 REQ は、既存 active REQ に吸収できない独立関心対象がある場合のみ作成する（REQ-0101-007, 053）。既存 REQ への APPEND / UPDATE を優先する。

### Retire Candidate Criteria

retire 候補の判定基準（REQ-0101-056）:

| 類型 | 説明 |
|---|---|
| バグ修正由来 | 単発のバグ修正に起因し、恒常的な状態要件としての維持必要性がない |
| 移行完了状態 | 移行・改名・廃止の完了記録が主題であり、現行の状態要件ではない |
| 他REQ吸収済み | 恒久内容が他の active REQ に吸収され、単独維持の必要性がない |
| 作業手段主題 | 作業手順・運用プロセスが主題であり、満たすべき状態要件ではない |

### REQ Quality Maintenance Criteria

SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT は、inspect-docs の診断観点に加え、REQ運用品質維持の恒常的基準として参照する（REQ-0109-039）。REQ体系の健全性を維持するため、これらの観点で定期的にREQ体系を評価する。

## Document Lifecycle

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
- ADR は `proposed` → `accepted` / `superseded` / `deprecated` の状態遷移を持つ。現行 baseline は ADR-0101 以降（current ADR collection）。ADR-0001〜0099 は `docs/adr/retired/` に配置された履歴番号帯である（REQ-0112-047, 048）。
- SPEC は実装とともに変化する「生きた文書」である。REQ や ADR の判断内容を代替しない。
- DOC-MAP は非正規索引であり、REQ/ADR/SPEC の内容を代替しない。
- Guides はナビゲーション層であり、規範文書ではない。

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用の repo-internal 設計文書である（ADR-0103）。他プロジェクトへの適用を意図しない。runtime command は SPEC ファイルに依存しない（ADR-0104）。

## Workspace and State Boundaries

| ディレクトリ | 役割 | 性質 |
|---|---|---|
| `.agentdev/` | AgentDevFlow の canonical domain state（intake / learning / backlog / integrity） | 永続的 domain state。配布物ではない |
| `.sisyphus/` | runtime 作業領域 | 一時的ワークスペース。domain state ではない |
| `.agentdev/drafts/` | command workflow での作業用一時領域 | active command の明示的な working draft handoff でのみ使用 |

## Source-of-Truth Priority

文書間に矛盾がある場合の優先順位（REQ-0101-011）:

1. active REQ
2. ADR（accepted）
3. SPEC
4. DOC-MAP / guides

## Configuration Rules

| 規則 | 内容 |
|---|---|
| REQ ID | 4桁ゼロ埋めの安定ID。active/retired を問わず再利用しない |
| ADR ID | 4桁ゼロ埋め。現行 baseline は ADR-0101 以降（current collection）。旧番号帯 ADR-0001〜0099 は retired（`docs/adr/retired/`）。状態は frontmatter で管理（REQ-0112-047, 048） |
| SPEC 配置 | `docs/specs/*.md` 直下 |
| Guides 配置 | `docs/guides/*.md` 直下 |
| Retired REQ | `docs/requirements/retired/` に配置。現行要件判断に使用しない |
| Retired ADR | `docs/adr/retired/` に配置。現行根拠として使用しない。履歴参照時は retired path を明示（REQ-0112-048） |

## ADR Editing Constraints

- accepted ADR の決定内容を意味変更してはならない（REQ-0112-045）。変更が必要な場合は新規 ADR を作成し、旧 ADR を superseded/deprecated とする
- ADR 体系の全面改定時は例外として、ユーザー承認済みの範囲で deprecated/superseded ADR の最小限を超える編集を許可する（REQ-0112-044）。ただし、編集目的・対象・変更種別・移管先・現行根拠として残す ADR を明示すること

## Document Classification Policy

<!-- REQ-0101 -->

文書の分類・権限・ライフサイクル・相互参照に関する包括ポリシー。新規文書作成時・既存文書更新時の分類判断基準として機能する（REQ-0101）。

### Document Authority Model <!-- REQ-0101 -->

各文書種別の編集権限・承認フロー・変更主体を定義する。

| 文書種別 | 編集権限 | 承認フロー | 変更主体 |
|---|---|---|---|
| REQ | req-define / req-save コマンド経由 | ユーザー承認（req-save） | agent（draft 作成）、user（最終承認） |
| ADR | req-save / 手動作成 | ユーザー承認 | agent（draft 作成）、user（最終承認） |
| SPEC | 実装に伴う更新 | SPEC は「現在仕様」の記録のため、実装完了に伴い更新 | agent（実装後の SPEC 更新） |
| Guide | inspect-docs / 手動更新 | 規範的権限なし。情報正確性の確認のみ | agent / user |
| Report | integrity コマンド等の自動生成、または手動作成 | 公開時の事実確認 | agent（自動生成）、user（手動作成） |
| DOC-MAP | 文書追加・移動に伴う更新 | 非正規索引のため、承認不要 | agent / user |
| Retired | 編集不可（履歴参照専用） | なし | なし |

### Classification Decision Tree <!-- REQ-0101 -->

新規文書を作成する際の分類判断フロー。

| 判断質問 | 結果 | 文書種別 |
|---|---|---|
| 満たすべき振る舞い・制約・状態の定義か? | YES → | **REQ** |
| 可逆的な運用上の判断か? | YES → | Guide または workflow 内の判断として扱い、独立文書不要 |
| 将来の設計・運用・文書システムを制約する決定か? | YES → | **ADR** |
| 現在のアーキテクチャ・システム動作の記述か? | YES → | **SPEC** |
| 分析結果・監査所見・インシデント記録か? | YES → | **Report** |
| 人間向けのナビゲーション・案内か? | YES → | **Guide** |
| 文書探索の索引か? | YES → | **DOC-MAP** |
| 上記のいずれにも該当しない → | 既存文書の APPEND/UPDATE で対応できないか確認。新規文書が必要な場合は REQ として要件化 |

判断の結果が複数の文書種別にまたがる場合、それぞれの責務に応じて分割する。単一文書に複数種別の内容を混在させない。

### Cross-document Projection Rules <!-- REQ-0101 -->

コマンド・スキル等の runtime 配布物における source/projection の用語と方向を定義する。

| 用語 | 意味 | パス例 |
|---|---|---|
| **原本 (source)** | 編集対象の一次ソース | `src/opencode/commands/agentdev/*.md`、`src/opencode/skills/agentdev-*/` |
| **配置先 (projection)** | runtime 環境への投影先 | `.opencode/commands/agentdev/*.md`、`.opencode/skills/agentdev-*/` |

**投影方向**: 原本 → 配置先 のみ（逆方向の投影は行わない）。配置先での直接編集は禁止し、原本を変更後に同期スクリプトで配置先を更新する（ADR-0105）。

### Reference Rules <!-- REQ-0101 -->

文書間の参照形式と引用ルールを定義する。

- **REQ 参照**: `REQ-{NNNN}` 形式（例: `REQ-0101`）。個別要件は `REQ-{NNNN}-{SSS}` 形式（例: `REQ-0101-002`）
- **ADR 参照**: `ADR-{NNNN}` 形式（例: `ADR-0103`）
- **リンク形式**: Markdown リンクで `[REQ-0101](../requirements/REQ-0101.md)` のように相対パスで記述
- **引用ルール**: 安定ID（`REQ-{NNNN}`、`ADR-{NNNN}`）で参照し、セクションタイトルのみでの参照は禁止。セクション参照が必要な場合は `REQ-0101-002` や `ADR-0103 決定セクション` のように ID を併記する
- **retired 文書の参照**: retired 文書を参照する場合は `(retired)` 注記を付与し、現行の後継文書も併記する（REQ-0112-048）

### Lifecycle Rules <!-- REQ-0101 -->

各文書種別の状態遷移を定義する。

**共通状態**: Creation → Active → Revised → Retired（種別ごとに表現が異なる）

| 文書種別 | 状態遷移 | 備考 |
|---|---|---|
| REQ | created → active → superseded / partially superseded | APPEND/UPDATE で拡張。個別要件の supersede は mapping-table で追跡 |
| ADR | proposed → accepted → superseded / deprecated | accepted のみ現行根拠。全面改訂時は新世代を創設（ADR-0001〜0023 → ADR-0101〜0112） |
| SPEC | active（実装とともに進化） | SPEC は「現在仕様」の記録であり、REQ や ADR の意味での「retired」状態を持たない |
| Guide | active → outdated → removed | 内容陳腐化時に移行。規範的権限なし |
| Report | published → archived | 作成後の修正は事実確認の範囲に限定 |
| DOC-MAP | always active | 更新のみ。retired なし |

### Re-baseline Rules <!-- REQ-0101 -->

文書体系の全面改訂時の取り扱いを定義する。

- **全面改訂は世代交代であり、上書きではない**
- 世代交代の例: ADR baseline 再編（ADR-0001〜0023 → ADR-0101〜0112）。旧番号帯は `docs/adr/retired/` に配置し、現行判断の基盤は新番号帯にある
- 新世代の創設時は、旧世代から引き継ぐ判断内容・移管先・移管しない判断を明示する
- 旧世代は履歴参照専用とし、現行判断の根拠として引用しない

### Synchronization Rules <!-- REQ-0101 -->

既存文書の更新運用ルールを定義する。

- **APPEND/UPDATEが正しい操作である。同期不足が問題である。**
- REQ の変更は APPEND（要件追加）または UPDATE（既存要件の修正）で行う。既存 REQ を新規 REQ で上書きしない
- ADR の変更は新規 ADR の作成により行い、旧 ADR を superseded/deprecated とする
- SPEC の更新は実装完了後に反映し、REQ と SPEC 間の同期ズレを放置しない
- docs-check / inspect-docs が同期不足を検出可能であること

### Report Classification <!-- REQ-0101 -->

Report を正式な文書分類として定義する。SPEC とは独立した種別である。

- **定義**: 分析結果、監査所見、インシデント記録、診断レポート等の事実記録文書
- **配置場所**: `.agentdev/integrity/reports/` または該当ドメイン配下
- **規範表現**: Report は 必達要件 規範表現を使用しない。事実の記述と分析結果の提示に留める
- **変更**: 公開後の修正は事実確認の範囲に限定。事実関係の誤りのみ修正可能
- **SPEC との違い**: SPEC は現在のアーキテクチャ基準（HOW it works now）を記述する。Report は特定の時点での分析・監査・診断結果を記録する

### ADR Definition Expansion <!-- REQ-0101 -->

ADR の適用範囲を拡張する。

- **従来の定義**: 「取り返しのつかない技術判断の記録」
- **拡張後の定義**: 「将来の設計・運用・文書システムを制約する決定の記録」
- 技術判断に限定されず、文書システムの運用ルールや、プロジェクトの組織的決定も ADR の対象となる
- この拡張は ADR-0103 の決定セクションにも反映される

### Content Boundary Rules（ADR/REQ 主題妥当性）<!-- REQ-0101-043〜051 -->

ADR と REQ の主題として記述してよい内容の境界を定義する。作業手段（HOW）が ADR/REQ の主題に混入することを防ぐ。

- **ADR**: 意思決定と理由のみを記録する。削除・廃止・移行・統合・再構築・完全削除そのものを主題にしない（REQ-0101-044）。過去判断を現行基盤から外すだけの場合は新規ADRではなくretire/supersedeで処理する（REQ-0101-045）
- **REQ**: 現在満たすべき状態・振る舞い・制約のみを定義する。作業手段を要件行として含めない
- **作業手段の取り扱い**: 削除・廃止・移行・統合・再構築・完全削除等の作業手段は case/Issue/PR/作業記録で扱い、ADR/REQ の主題としない

### SPEC 責務境界 <!-- REQ-0101 -->

SPEC の記述範囲を責務境界として定義する。

- **SPEC に新規要件を置かない**。将来要件は REQ に記述する
- **SPEC は現在仕様・契約記述に限定する**。判断根拠は ADR に記述する
- SPEC は現在システムがどう動作しているか（HOW it works now）を記述し、どう動作すべきか（WHAT it 推奨 do）を記述しない

### Anti-patterns <!-- REQ-0101 -->

文書分類の典型的な誤りパターンを列挙する。これらのパターンに該当する文書は分類修正の対象とする。

| 誤りパターン | 正しい分類 | 修正方針 |
|---|---|---|
| SPEC に新規要件が含まれている | REQ | 要件部分を REQ に切り出し、SPEC は現在仕様の記述に留める |
| ADR が現在の動作を記述している | SPEC | 動作記述部分を SPEC に移動し、ADR は判断とその根拠に絞る |
| Guide に要件本文・契約本文が含まれている | REQ/ADR/SPEC 参照 | 要件・契約内容を REQ/ADR/SPEC への参照に置き換える |
| REQ に実装詳細が含まれている | SPEC | 実装詳細を SPEC に移動し、REQ は WHAT に絞る |
| Report の内容が SPEC に混入している | Report（独立文書） | Report を独立文書として分離する |
| Retired 文書が現行判断の根拠として引用されている | Active 後継文書 | 引用先を active な後継文書に更新する |

### Review/Check Mapping <!-- REQ-0101 -->

分類ルールと docs-check / inspect-docs の検査項目の対応を定義する。

| 分類ルール | docs-check 検査 | inspect-docs 検査 | 検査内容 |
|---|---|---|---|
| 責務境界（SPEC に要件混入） | SPEC-REQ-mix 検査 | 意味整合性レビュー | SPEC 内の 必達要件 が現在仕様の記述か判定 |
| 責務境界（Guide の要件本文混入） | Guide-intrusion 検査 | 要件本文検出 | Guide が要件本文・契約本文を保持していないか検出 |
| ADR 状態管理 | ADR-status 検査 | ADR 整合性レビュー | proposed/accepted/superseded/deprecated の一貫性 |
| Retired 引用 | Retired-reference 検査 | 文書間参照整合性 | retired 文書の現行引用を検出 |
| 原本/配置先 同期 | Source-projection sync 検査 | 同期ズレ検出 | 原本と配置先の内容差異を検出 |
| REQ ID 一意性 | REQ-ID-uniqueness 検査 | ID 衝突検出 | REQ ID の再利用を検出 |
| Report 規範表現 | Report-normative 検査 | 必達要件 混入検出 | Report 内の規範表現を検出 |

### Retired ADR Reference Update <!-- REQ-0101 -->

Retired ADR の参照更新ルールを定義する。

- Retired ADR が現行判断の根拠として引用されている場合、active な後継 ADR または REQ に参照を更新する
- 履歴参照として retired ADR 番号を保持する場合は、`(retired)` 注記を付与する
- 例: `ADR-0017` → `ADR-0103 (後継)`。`ADR-0017 (retired)` は履歴参照として許容
- docs-check / inspect-docs が retired ADR の現行引用を検出した場合は警告を出力する

### Terminology: 原本/配置先 <!-- REQ-0101 -->

原本と配置先の用語定義（Cross-document Projection Rules と同一内容の再掲）。

- **原本 (source)**: `src/opencode/` 配下の編集対象一次ソース
- **配置先 (projection)**: `.opencode/` 配下の runtime 投影先
- **投影方向**: 原本 → 配置先（逆方向禁止）
- **編集原則**: 配置先を直接編集せず、原本を変更後に同期スクリプトで配置先を更新する
