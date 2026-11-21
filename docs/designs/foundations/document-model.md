---
title: 文書モデル
status: accepted
created: 2026-08-20
updated: "2026-11-21"
---
<!-- ADF-COVERS(implementation): REQ-001-001, REQ-001-002, REQ-001-003, REQ-001-004, REQ-001-005, REQ-001-006, REQ-001-007, REQ-001-020, REQ-001-035, REQ-001-038, REQ-001-039, REQ-001-040, REQ-056-001 -->
<!-- ADF-COVERS(implementation): REQ-049-019 -->
<!-- ADF-COVERS(design): REQ-001-005, REQ-001-006, REQ-034-019 -->
<!-- ADF-COVERS(design): REQ-056-001 -->
<!-- ADF-COVERS(design): REQ-103-023（REQ-103 の docs 全体整合の設計対応面） -->
<!-- ADF-COVERS(design): REQ-059-006 -->
<!-- ADF-COVERS(implementation): REQ-059-006 -->

<!-- ADF-COVERS(implementation): REQ-123-003（REQ-123-003 のスリム化編集の実装実体。ハブ化と重複排除・移管済み必須仕様の削除。REQ-123.md 冒頭 inline ADF-COVERS(design) 宣言と REQ-116 型 covers 宣言構成） -->
# 文書モデル

## 目的

REQ/Decision/Design/Guide/Report の責務マトリックスを定義し、各文書種別が何を記述し、何を記述しないかを明確にする（REQ-001）。
`docs/designs/` は現在有効な Design だけを保持する正規領域とし、監査・評価・観測記録は Report（`docs/reports/`）へ分離する。
本 Design の責務マトリックスと配置規範は、docs 配下全体を横断して読んだとき、ADF の設計思想、判断責務、ライフサイクル、用語、所有関係について相互矛盾する現在像が得られないことの設計対応（REQ-103-023）である。### 他 Design との役割分担

本 Design と `../responsibilities/document-type-responsibilities.md` は補完関係にあり、重複しやすい関心を分担する。

| 関心 | 主に扱う Design |
|---|---|
| 文書種別の基準境界（役割定義、ライフサイクル、優先順位、参照規則、投影方向）、文書7分類、局所物理分離、ドメイン別体系化規範 | 本 Design |
| 執筆時判定基準、実行主体分類、要件行書き方、SKILL構造、用語政策 | `../responsibilities/document-type-responsibilities.md` |
| REQ 分類レイヤー、Design 分離基準、安定契約の例外、REQ 粒度・廃止候補・品質維持基準 | `../responsibilities/document-type-responsibilities.md`（本 Design から移管。REQ-123-003） |
| 共通文書モデル規約（frontmatter、ID 体系、命名規則、URL 参照形式） | `patterns.md` |

新規ファイル分割は行わず、既存2ファイル間の重複削除で運用する（REQ-001-001）。

## 責務マトリックス

| 文書種別 | 記述するもの | 記述しないもの |
|---|---|---|
| REQ | 現行要件（WHAT: 何を満たすべきか） | 実装詳細、HOW、現在の動作記述 |
| Decision | 将来の設計、運用、文書システムを制約する決定とその理由（WHY）<!-- REQ-001 --> | 可逆的な運用手順、状態遷移、形式定義 |
| Design | REQ を満たすために現在採用している内部構造、内部動作、責務分担、データ構造、処理方式、規則、パラメータ（現在のHOW）。Architecture を一部として含む（REQ-001-003） | 新規要件、将来案、判断根拠（Decision の管轄）、採用理由、却下理由、作業履歴、監査結果、評価結果、実測値、実装コードそのもの、検証実行結果 |
| Knowledge | プロジェクト固有の再利用可能な判断材料。docs/knowledge/ 配下へ 1知識1 Markdown ファイル（kebab-case slug、固定 ID 採番なし）（REQ-056） | 要件・判断記録・Design 本文との重複、標準知識（配布対象） |
| Guides | 人間向けナビゲーション層。規範的権限を持たない（REQ-001） | 要件本文、契約本文、REQ/Decision/Design 内容の重複 |
| Report | 監査、評価、観測、測定等の事実記録。正規配置領域は `docs/reports/`（REQ-001-065）。規範表現を持たず、修正は事実確認に限定。移行結果・リリース証跡の保存先 | 規範要件、必達条件、現在設計の記述、Design 一覧・件数・健全性計測への混入 |

REQ 文書のセクション構成と記述規約は `patterns.md`「REQ セクション構成」「REQ 分類規約」を原本とする。作業手段（移行、削除、改名等）を REQ の要件行に混入させない（REQ-004-049）。

### ワークフロー状態管理

ワークフロー状態（6 マイクロフェーズ等）は Issue ラベル、GitHub Project で管理し（REQ-002-035）、REQ/Design 文書内には含めない。

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

- REQ は領域別の総体として管理し、変更は既存 REQ への APPEND / UPDATE で対応する。
- Decision は `proposed` → `accepted` / `superseded` / `deprecated` の状態遷移を持ち、accepted だけを現行判断の根拠とする。
- Design は実装とともに変化する「生きた文書」であり、REQ や Decision の判断内容を代替しない。
- Guides はナビゲーション層であり、規範文書ではない。
- 追跡Issueは docs/ 配下の文書種別ではなく管理単位・永続状態として扱い、docs/ 配下に課題ファイルの文書種別を設けない（REQ-049）。

### Design ライフサイクル（REQ-001-025）

Designはfrontmatter `status`で成熟度を管理する（形式は`patterns.md`が所有）。

| status | 意味 | 遷移契機 |
|---|---|---|
| `draft` | Design 保存（case-ready / case-revise の Capability Skill 委譲）で保存された未確定状態。確定Design向け検査の対象外 | 新規Design保存時 |
| `accepted` | 実装との整合確認を通過した現在設計。通常の整合性検査対象 | case-closeで確定時（v4 モデル定義 Design はモデル合意確定時） |

- `accepted` の付与は case-close の責務である。status欠落は後方互換のため`accepted`相当と扱う
- 置換済みDesignは現行ツリーへ保持せず、履歴はGit、Issue、Decision等の既存履歴手段から確認する
- Designの識別は文書配置パスによる（安定ID体系なし。REQ-001-008）

### retired 文書への言及の保持基準

retired REQ・Decision への言及は、歴史的説明（意思決定当時の根拠・経緯の引用）なら本文保持、現行契約参照と読める言及なら現行側へ置換する（REQ-059-006）。判定材料は、言及先が当時の文脈での根拠引用かである。保持基準の要件上の定義は REQ-059 が所有し、本節が詳細基準を所有する。
保持基準違反は機械検出できないため inspect-docs 意味診断で順守確認する。廃止 Decision 参照には `(retired)` 注記と現行後継の併記を行い、docs-check / inspect-docs は現行引用を警告する。

Decision 関係モデル（relates-to / supersedes / reaffirms）、粒度管理、健全性評価モデルの詳細は `decision-lifecycle.md` が正規所有する。本節は参照関係を示し、内容を複製しない。

## 作業領域と状態の境界

| ディレクトリ | 役割 | 性質 |
|---|---|---|
| `.agentdev/` | ADF の原本ドメイン状態（intake / learning / backlog / integrity） | 永続的なドメイン状態。配布物ではない |
| `.agentdev/drafts/` | 作業用一時領域 | 明示的な作業用ドラフト引き継ぎでのみ使用 |

`.agentdev/drafts/req-draft-*.md`（req_draft）は、req-define が生成する一時的な構造化ハンドオフ成果物である（REQ-008, DEC-003）。
consumer 境界は producer、direct consumer、orchestration pre-reader、invalid post-case reader の 4 集合で確定し、正規定義は `docs/designs/responsibilities/artifact-contracts.md`「req_draft consumer 4 集合」節を SSoT とする（REQ-008-008、REQ-008-036、REQ-034-019）。
req_draft は soft contract（DEC-003）であり、構造化データ（`# draft-data` fenced YAML block）が正で、case-open 成功後は削除されてよい一時成果物である。標準データモデル・詳細構造・realization_actions の分離（DEC-026）は artifact-contracts.md「req_draft 出力構造」を参照。

## 信頼できる情報源の優先順位

文書間に矛盾がある場合の優先順位（REQ-001-020）:

1. 現行 REQ
2. Decision（承認済み）
3. Design
4. guides

## 設定規則

| 規則 | 内容 |
|---|---|
| REQ ID | 安定ID。表示はゼロ埋め（最小幅、切詰めしない）、受理検査に桁数上限なし、再利用しない |
| Decision ID | 3桁ゼロ埋め（最小幅、切詰めしない）。状態はfrontmatterで管理 |
| Design配置 | `docs/designs/**/*.md`。status は `draft`/`accepted` の2値（欠落は`accepted`相当） |
| Guides配置 | `docs/guides/*.md` |
| 廃止REQ・Decision | 物理削除を第一選択、履歴参照用途に限定してretired配下への移動も選択できる |

## Decision 編集制約と accepted Decision の意味的不変

- 承認済み Decision の決定内容を意味変更してはならない（REQ-001-056）。変更が必要な場合は新規 Decision を作成し、旧 Decision を superseded/deprecated とする
- 全面改定時は例外として、ユーザー承認済みの範囲で deprecated/superseded Decision の最小限を超える編集を許可する（REQ-001-059。編集目的、対象、変更種別、移管先、現行根拠を明示すること）
- accepted Decision の意味変更は後継 Decision を必須とし、履歴証拠を削除して追跡不能にしない

正規所有: 意味不変原則は REQ-001 と agentdev-decision-guidelines Design、直接編集チェックリストは agentdev-decision-file-manager Design、accepted Decision の扱いは本節。

## 文書分類ポリシー

<!-- REQ-001 -->

文書の分類、権限、ライフサイクル、相互参照に関する包括ポリシー（REQ-001）。

### 文書権限モデル <!-- REQ-001 -->

| 文書種別 | 編集権限 | 承認フロー | 変更主体 |
|---|---|---|---|
| REQ | req-define 経由 + Definition 保存内部責務（case-ready / case-revise） | ユーザー承認（case-ready） | エージェント（draft 作成）、ユーザー（最終承認） |
| Decision | 同上 / 手動作成 | ユーザー承認 | 同上 |
| Design | 実装に伴う更新 | 実装完了に伴い更新 | エージェント（実装後の Design 更新） |
| Guide | inspect-docs / 手動更新 | 規範的権限なし。情報正確性の確認のみ | エージェント / ユーザー |
| Report | 自動生成または手動作成 | 公開時の事実確認 | エージェント / ユーザー |
| 廃止 | 編集不可（履歴参照専用） | なし | なし |

### 分類判断ツリーと文書間投影・参照規則 <!-- REQ-001 -->

新規文書作成時の分類判断フロー（分類判断ツリー）は執筆時配置判定に属するため、`../responsibilities/document-type-responsibilities.md`「新規文書作成時の分類判断ツリー」を参照。

コマンド、スキル等の実行時配布物における原本、配置先（source/projection）の用語と方向を定義する。

| 用語 | 意味 | パス例 |
|---|---|---|
| **原本 (source)** | 編集対象の一次ソース | `src/common/commands/agentdev/*.md`、`src/common/skills/agentdev-*/` |
| **配置先 (projection)** | 実行時環境への投影先 | `.opencode/commands/agentdev/*.md`、`.opencode/skills/agentdev-*/` |

**投影方向**: 原本 → 配置先 のみ（逆方向の投影は行わない）。
原本を変更してから同期スクリプトで配置先を更新する。投影を直接編集しない（DEC-049）。

文書間の参照は安定 ID（`REQ-{NNN}`、`REQ-{NNN}-{SSS}`、`DEC-{NNN}`）で行い、Markdown 相対リンク（`[REQ-001](../../requirements/REQ-001.md)` 等）で記述する。
セクションタイトルのみでの参照は禁止。セクション参照が必要な場合は `REQ-001-002` のように ID を併記する。

### 基準再設定と同期規則 <!-- REQ-001 -->

文書体系の全面改訂は世代交代であり、上書きではない。
新世代の創設時は、旧世代から引き継ぐ判断内容、移管先、移管しない判断を明示する。
旧世代は履歴参照専用とし、現行判断の根拠として引用しない。

更新運用は APPEND/UPDATE が正しい操作であり、同期不足が問題である。
- REQ の変更は APPEND（要件追加）または UPDATE（既存要件の修正）で行う。既存 REQ を新規 REQ で上書きしない
- Decision の変更は新規 Decision の作成により行い、旧 Decision を superseded/deprecated とする
- Design の更新は実装完了後に反映し、REQ と Design 間の同期ズレを放置しない（docs-check / inspect-docs が検出可能）

### 正規所有原則 <!-- REQ-001-042 -->

各関心の正規定義の所有者は `../responsibilities/artifact-responsibilities.md`（成果物責任表）が定める。Design の基本frontmatterは正規所有者宣言フィールドを含まず、代替分類メタデータも追加しない。

## 文書7分類モデル

文書全体を以下の7分類で整理する（v2:REQ-0155-003。REQ-001-067 の文書種別境界に加える関心別分類）。

| 分類 | 記述対象 |
|---|---|
| REQ | 満たすべき振る舞い、制約、状態 |
| 挙動Design | コマンド、スキルの振る舞い、入出力、契約 |
| カタログDesign | スキーマ、enum、判定表、ルールカタログ |
| guide | 人間向けナビゲーション（規範的権限なし） |
| learning維持 | learning 知見の恒久契約への昇華候補 |
| 作業記録 | Case/RU/Issue/PR/OU 由来の一時作業記録 |
| 対象外 | 当該要件化の対象外 |

7分類は文書の振る舞いを規定するものではなく、文書整理と粒度判定の参照分類である（分類確定は Design 論理区分と同一の消費経路）。

## Design 論理区分（5区分）

Design 文書の論理区分を以下の5区分で整理する。文書7分類とは別軸の Design 内部分類であり、挙動Design・カタログDesignの2区分名は7分類と共有するが分類の対象が異なる。

| 区分 | 記述対象 |
|---|---|
| 挙動Design | コマンド、スキル、ワークフローの振る舞い、入出力、契約 |
| カタログDesign | スキーマ、enum、判定表、ルールカタログ |
| 横断契約Design | 複数成果物を横断する契約、責務境界、共通規律の正 |
| パラメータDesign | 再試行回数、タイムアウト、閾値、重み等の調整パラメータの契約 |
| 実装詳細Design | 内部アルゴリズム、実装方式の詳細（利用者契約に影響しない内部実装の設計記録） |

design action の canonical_owner 出力（req-define command Design）と各 Design の責務分類宣言は本表の区分名を用いる（分類確定は7分類と同一の消費経路）。

## 局所物理分離の許容

*-rules.md 併設、integrity-rules/ サブディレクトリによる局所物理分離を許容する。既存3層構造（commands/skills/workflows/直下）を維持し、全面再配置を強制しない。
integrity-rule-catalog.md の個別ルール（IR-NNN）は integrity/rules/ サブディレクトリに分離し、カタログはスキーマと索引を所有する（REQ-001-008, v2:REQ-0155-007、DEC-013）。

## docs/designs/ 直下のドメイン別体系化（agent-dev-flow リポジトリ）

基盤Designは、既存の commands/skills/workflows 層を維持したまま6つのドメインディレクトリへ分類する（REQ-001-001）。この体系化は agent-dev-flow リポジトリ特有であり、利用先プロジェクトの docs 構成を縛らない。

### ドメインディレクトリと責務 <!-- REQ-001-002 -->

配置対象 Design の網羅一覧は designs/README.md（Design 索引）を正とする。

| ディレクトリ | 責務 |
|---|---|
| foundations/ | 基盤モデル、システム構成、文書フォーマット、設計原則 |
| responsibilities/ | 文書種別責務、成果物責任、アーティファクト契約、REQ影響マップ |
| quality/ | 品質仕様、品質ゲート |
| integrity/ | 整合性契約、整合性ルールカタログ、ルール所有権、配布物整合性 |
| local/ | ローカル版 Design 群（実行時パッケージ境界、link mode、Case ファイル） |
| authoring/ | 執筆規約（DEC-065 により配下 Design なし） |

特例配置: req-impact-map.md は responsibilities/ に配置する（REQ → アーティファクト影響マッピングであり、責務、影響追跡の位置づけ）。

### 段階移送方針

既存直下Designのドメインディレクトリへの移送は、inspect/backlog 経由で段階的かつ個別に行い、一括移送を禁止する（REQ-001-005）。
移送時、旧パスを参照する文書の参照先を移送単位で更新する（REQ-001-006）。
新規Design作成時は、本セクションのドメイン分類に従って該当ディレクトリに配置する（REQ-001-004）。
本体系化は既存 Design 文書種別内でのディレクトリ整理であり、CATALOG 等の新規文書種別を新設しない（REQ-001-009）。

## 恒久基準と非規範情報の整理

恒久基準（Decision、REQ、Design）と非規範情報（移行情報、内部実装方式、fixture、regex、未宣言 reference、draft Design、移行証跡、リリース証跡）を整理するための 6 処置モデルを定義する。処置の実行は inspect-docs / inspect-skills / 専用の cleanup 作業で行い、本節はモデルと契約を所有する。採用済み成果物の恒久契約適格性判定にも本モデルの 6 処置を適用し、昇格前判定の変更種別分類は [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)「learning/intake 由来変更の変更種別分類」が所有する。

### 対象カテゴリと識別子

走査対象は6カテゴリ: (1) Decision 内の移行時情報、(2) REQ 内の内部実装方式、(3) Design 内の fixture・regex・内部関数・テスト構成、(4) 未宣言の references、(5) 未決着の draft Design、(6) 移行結果またはリリース証跡。
各 inventory item は `artifact_path`・`target_area`（見出し、field、rule row の識別子）・`statement_key`（stable hash）で識別し、重複 key を許可しない。

### 6 処置モデル

各 inventory item へ次のいずれか一つを割り当てる。同一項目へ複数処置を割り当てない。

| 処置 | 内容 |
|---|---|
| KEEP | 現位置で保持する |
| MERGE | 同一関心の他記述へ統合する |
| REFERENCE | 他文書へ参照を張る |
| MOVE | 別の正規所有者へ移動する |
| RETIRE | 廃止し履歴保持先へ記録する |
| INFERENCE | 推論により正規所有者を補完する |

必須記録事項: KEEP は正規所有者、MERGE は統合先と根拠、REFERENCE は参照先、MOVE は移動先と正規所有者、RETIRE は廃止理由と履歴保持先、INFERENCE は推論根拠と補完先。MOVE/REFERENCE には解決可能な移動先・参照先が存在すること。

### 処置後の記録と再検証

- 処置後は記録事項を残し、処置の影響レーンだけを再検証する（影響レーン局限）
- 現行 Decision、REQ、Design に移行結果・リリース証跡が規範内容として残らないこと。非規範の Report（Release Report 等）へ移す
- draft Design ごとに accepted 化、統合、retire のいずれかを確定する。放置は designs/README.md status 列追跡と case-close の Design 確定工程で管理する
- accepted Decision の意味変更は後継 Decision を必須とし、履歴証拠を削除して追跡不能にしない

## 適用範囲宣言

`docs/designs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは Design ファイルに依存しない（REQ-001）。
