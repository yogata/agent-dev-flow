---
title: Traceability Information Model（TIM）語彙カタログ
status: draft
created: 2026-08-17
updated: 2026-08-18
spec_logical_division: カタログSPEC
canonical_owner: agentdev-artifact-graph
---

# Traceability Information Model（TIM）語彙カタログ

## 目的

TIM の成果物型、トレースリンク型、関係の意味、関係制約のカタログを正規所有する。
agentdev-artifact-graph の派生索引生成と高位問い合わせは本カタログを正とする。
REQ-012 が要件契約を、本 SPEC が語彙・意味定義の実体を所管する。

## TIM が表現する要素の定義

**Traceability Information Model（TIM）**は、成果物間トレーサビリティの正規論理モデルである（REQ-012-018、DEC-017 決定1）。
TIM は次の8要素を表現する。

| 要素 | 定義 |
|---|---|
| 成果物型（artifact type） | トレーサビリティの対象となる成果物の種別 |
| トレースリンク型（trace link type） | 成果物間に張る関係の種別 |
| リンク元成果物型 | トレースリンクの起点に置ける成果物型 |
| リンク先成果物型 | トレースリンクの終点に置ける成果物型 |
| 関係の意味 | トレースリンク型が表現する関係の意味の定義 |
| 変更影響方向 | リンクの一方の側の変更が他方の側へ伝わる方向の定義 |
| 必要な関係制約 | リンク元とリンク先の組合せなど、トレースリンクが満たすべき制約 |
| 根拠情報への関連付け | 各成果物と各トレースリンクを、正規文書内の根拠箇所へ関連付ける情報 |

TIM とその実装の位置関係は次のとおりである。

- トレーサビリティ機能は、TIM、Trace Index、Trace Query、ADF Integration の4層へ分離される（DEC-017 決定5）。本 SPEC は TIM 層の語彙と意味定義を所管する
- グラフの物理保存形式（`.agentdev/graph/` 配下の派生索引ファイル群）は、TIM そのものとみなさない。TIM は論理モデルであり、保存形式は Trace Index 層の実装詳細である
- Artifact Graph は、TIM に基づくトレーサビリティ情報から生成される再生成可能な派生索引であり、正規情報源ではない。正規情報源は正規成果物（REQ、Decision、SPEC 等）である

採用語彙の表記は英字 snake_case（例: `satisfies`）を正とする。
標準語彙の原名（例: OSLC の `satisfiedBy`）は、対応表の出典欄に記す。

## 標準成果物型カタログ

標準コアの成果物型は、永続文書種別に対応する最小集合（`requirement`、`decision`、`specification`）とし、それ以外は augmentation が追加する（REQ-012-003）。

### 成果物型対応表

| 成果物型 | 意味 | SysML | OSLC | OpenFastTrace | 位置づけ |
|---|---|---|---|---|---|
| `requirement` | システムが満たすべき成果の定義 | Requirement | Requirement | req | 標準語彙 |
| `decision` | 意思決定の記録とその判断根拠 | 対応なし | 対応なし | 対応なし | ADF 固有拡張 |
| `specification` | 現行アーキテクチャの記述 | 対応なし | 対応なし | dsn 等の設計系成果物型 | 標準語彙（概念的対応は OpenFastTrace） |

対応の根拠は次のとおりである。

- `requirement`: SysML の Requirement、OSLC Requirements Management の Requirement、OpenFastTrace の req 成果物型はいずれも要件成果物を表し、意味の一致度が高い
- `decision`: 意思決定記録をトレーサビリティの正規成果物型とする標準は、SysML、OSLC、OpenFastTrace のいずれにも存在しない。Decision を ADF 固有の拡張成果物型として TIM へ追加する（DEC-017 決定3、REQ-012-020）
- `specification`: SysML はモデル要素を対象とするため文書成果物型を持たず、OSLC Requirements Management は要件管理に限定される。OpenFastTrace は req 以外に設計（dsn）等の複数の成果物型を持ち、仕様書類を複数型で表現する。`specification` はこの概念的対応に基づく標準語彙とする

### Decision の関係表現

Decision と他成果物との関係は、既存の標準的なトレースリンク型で表現する。
Decision という成果物型が ADF 固有であることを理由として、Decision 専用の関係型を無条件に追加しない（REQ-012-020）。

例として、要件が意思決定の内容に依存する関係は `depends_on` で表現し、`justifies` 等の専用型を追加しない。

### プロジェクト拡張による成果物型の追加様式

成果物型は closed-enum とせず、augmentation（`.agentdev/artifact-graph.yaml`）の `node_types` へ追加できる（REQ-012-004、REQ-012-006）。

追加時の様式は次のとおりである。

- 成果物型名は英字 snake_case とし、標準コア語彙と重複しない
- 追加する成果物型の意味を、augmentation 内に自然言語で定義する
- 標準語彙（SysML、OSLC、OpenFastTrace）に対応する語彙がある場合は対応を出典とともに記録し、対応がない場合は ADF 固有またはプロジェクト固有と明記する

self-hosting augmentation が追加する成果物型の例は `command`、`skill`、`integrity_rule`、`extension`、`source_file` であり、いずれも標準対応を持たない ADF 固有の型である（REQ-012-009）。

## 標準トレースリンク型カタログ

標準トレースリンク型は、トレーサビリティ標準が扱う関係意味を意味スロットへ整理し、各スロットへ採用語彙を1つ定める（REQ-012-019）。

### 意味スロットと採用語彙の対応表

| 意味スロット | 採用語彙 | 語彙の意味（ADF 定義） | SysML | OSLC | OpenFastTrace |
|---|---|---|---|---|---|
| 分解 | `contains` | リンク元がリンク先を構成要素として含む構造包含 | containment | decomposedBy | 対応なし |
| 具体化 | `refines` | リンク元がリンク先をより詳細へ具体化する | refine | elaboratedBy | 対応なし |
| 仕様化 | `specifies` | リンク元がリンク先の要件を仕様へ展開する | 対応なし | specifiedBy | 対応なし |
| 制約 | `constrains` | リンク元がリンク先へ制約を課す | constrain | 対応なし | 対応なし |
| 依存 | `depends_on` | リンク元の成立がリンク先に依存する | dependency | 対応なし | 対応なし |
| 実現 | `realizes` | リンク元がリンク先を実現する | realization | 対応なし | 対応なし |
| 充足 | `satisfies` | リンク元がリンク先の要件を充足する | satisfy | satisfies | covers |
| 実装 | `implements` | リンク元がリンク先の要件や仕様を実装する | 対応なし | implementedBy | covers（impl 成果物） |
| 検証 | `verifies` | リンク元がリンク先を検証する | verify | verifiedBy | covers（tst 成果物） |
| 妥当性確認 | `validates` | リンク元がリンク先の妥当性を確認する | 対応なし | validatedBy | 対応なし |
| 置換・改訂 | `supersedes` | リンク元がリンク先を置き換える | 対応なし | 対応なし | 対応なし |
| 一般参照 | `references` | 関係意味を持たない文書参照 | trace | 対応なし | 対応なし |

出典に関する注記は次のとおりである。

- OSLC の語彙は要件側を主語とする受動形（`specifiedBy`、`implementedBy` 等）が基本である。ADF の採用語彙はリンク元を動作の主体とする能動形で統一する。このため対応する OSLC 語彙と ADF 語彙の間でリンク方向が逆になる場合があり、リンク方向は本カタログの語彙定義（語彙の意味欄）を正とする
- OpenFastTrace は関係語彙として covers（および needs coverage）のみを持ち、充足、実装、検証を成果物型（req、impl、tst 等）の組合せで区別する。このためスロット単位の語彙対応は、covers による代替として記録する
- SysML の trace は関係意味を限定しない汎用トレースである。`references` は、これを関係意味を持たない一般参照へ位置づけて採用する
- `depends_on` は UML と SysML の汎用 dependency に由来する ADF 既存語彙である
- `supersedes` は、3標準のいずれにも語彙対応がない。一般語 supersede に基づく ADF 既存語彙として維持する（採用判断の基準は「語彙採用基準」節に従う）

### ADF 固有関係型

既存標準語彙で ADF の意味を表現できない場合のみ、ADF 固有の関係型を追加する（DEC-017 決定2）。

| 関係型 | 語彙の意味（ADF 定義） | 導入根拠 |
|---|---|---|
| `extends` | リンク元がリンク先の適用範囲を追加定義で広げる | 具体化（`refines`）は対象を狭めて詳細化する操作であり、範囲を広げる拡張の意味は既存標準語彙で表現できない |

### 既存5関係型の移行先

現行 Artifact Graph の標準コア relation_types（`references`、`supersedes`、`defined_in`、`contains`、`extends`）は、本カタログへ次のとおり移行する。

| 既存関係型 | 移行先 | 移行内容 |
|---|---|---|
| `references` | `references`（一般参照） | 語彙は維持し、関係意味を持たない一般参照として位置づけを更新する |
| `supersedes` | `supersedes`（置換・改訂） | 語彙は維持し、変更影響方向 `none` を割り当てる |
| `defined_in` | `depends_on`（依存） | 定義所在への依存は依存の一種であるため、語彙を集約して重複定義を排除する |
| `contains` | `contains`（分解） | 語彙は維持し、構造包含による分解の意味定義を付与する。索引・集約成果物をリンク元とする用法は「索引・集約成果物の役割識別」節の位置づけに従う |
| `extends` | `extends`（ADF 固有関係型） | 語彙は維持し、「ADF 固有関係型」の定義に従う |

移行後は、意味が重複する ADF 独自語彙を残さない（REQ-012-019）。

## 変更影響方向の定義

変更影響方向は、次の4値とする（REQ-012-022）。

| 値 | 名称 | 定義 |
|---|---|---|
| `forward` | リンク方向へ影響 | リンク元の変更がリンク先へ影響する |
| `backward` | 逆方向へ影響 | リンク先の変更がリンク元へ影響する |
| `bidirectional` | 双方向へ影響 | リンク元とリンク先の変更が互いに影響する |
| `none` | 変更影響なし | どの方向の変更影響も定義しない |

リンクの記述方向と変更影響方向を同一視しない。
リンクの記述方向（リンク元からリンク先への向き）は関係を読む向きの約束にすぎず、変更影響方向は関係の意味から独立に割り当てる属性である。

### 各トレースリンク型への割当て

| 採用語彙 | 変更影響方向 | 割当ての根拠 |
|---|---|---|
| `contains` | `bidirectional` | 構成要素の変更は全体の意味を変え、全体の変更は構成要素へ波及する |
| `refines` | `bidirectional` | 具体化元の変更は具体化先へ波及し、具体化先の変更は具体化の妥当性を変える |
| `specifies` | `bidirectional` | 要件の変更は仕様へ波及し、仕様の変更は要件との整合確認を要する |
| `constrains` | `forward` | 制約の変更は制約対象へ波及する。制約対象の変更は制約の内容を変えない |
| `depends_on` | `backward` | 依存先の変更が依存元へ波及する |
| `realizes` | `backward` | 実現対象の変更が実現側へ波及する |
| `satisfies` | `backward` | 要件の変更が充足側へ波及する |
| `implements` | `backward` | 実装対象の変更が実装側へ波及する |
| `verifies` | `backward` | 検証対象の変更が検証成果物へ波及する |
| `validates` | `backward` | 妥当性確認対象の変更が確認成果物へ波及する |
| `supersedes` | `none` | 置換後の旧成果物は凍結され、新旧の間で変更が波及しない。旧成果物への残存参照は diagnostics の検出対象とする |
| `references` | `none` | 関係意味を持たないため、変更影響を定義しない |
| `extends` | `bidirectional` | 拡張元の変更は拡張成果物へ波及し、拡張成果物の変更は拡張の妥当性を変える |

影響探索（impact）は本表の割当てに従って探索方向を導出する。
`forward` は起点からリンク方向へ、`backward` は起点がリンク先であるリンクを逆向きに、`bidirectional` は両方向をたどる。
`none` の関係を、リンクが存在することだけを理由に影響探索の経路へ使用しない（REQ-040-003）。

### 高位問い合わせへの参加区分

目的別の高位問い合わせ（related、impact、dependency、implementation）への参加可否は、TIM が関係型ごとに定義する意味情報から導出する（REQ-012-022）。
Trace Query 層は、独立した関係モデルを持たず本定義に従うプロファイルとして動作する（REQ-040-001）。

| 採用語彙 | impact | dependency | implementation |
|---|---|---|---|
| `contains` | 参加 | 参加 | 不参加 |
| `refines` | 参加 | 参加 | 不参加 |
| `specifies` | 参加 | 参加 | 不参加 |
| `constrains` | 参加 | 参加 | 不参加 |
| `depends_on` | 参加 | 参加 | 不参加 |
| `realizes` | 参加 | 参加 | 参加 |
| `satisfies` | 参加 | 参加 | 参加 |
| `implements` | 参加 | 参加 | 参加 |
| `verifies` | 参加 | 参加 | 不参加 |
| `validates` | 参加 | 参加 | 不参加 |
| `supersedes` | 不参加 | 不参加 | 不参加 |
| `references` | 不参加 | 不参加 | 不参加 |
| `extends` | 参加 | 参加 | 不参加 |

参加区分の判断基準は次のとおりである。

- impact: 変更影響方向が `none` 以外の関係型が参加する
- dependency: 起点成果物が成立、実現または実行のために依存する先をたどれる関係型が参加する。起点がリンク元とリンク先のいずれに位置する場合も含む
- implementation: 実現、実装、充足の系列を構成する関係型（`realizes`、`satisfies`、`implements`、探索方向は逆向き）が参加する。`specifies`、`verifies`、`validates` は参加しない。検証と妥当性確認の系列は将来の coverage 問い合わせへの統合対象とする（REQ-040-005）

related は、明示的なトレースと一般参照のすべてを返すため、参加区分表から除外する（REQ-040-002）。

## 関係制約

標準トレースリンク型のリンク元とリンク先の成果物型の組合せ制約を、次に定める。

| 採用語彙 | リンク元の成果物型 | リンク先の成果物型 |
|---|---|---|
| `contains` | 任意（リンク先と同種を推奨） | 任意 |
| `refines` | 任意 | 任意 |
| `specifies` | 仕様的位置づけの成果物型 | `requirement` |
| `constrains` | 任意 | 任意 |
| `depends_on` | 任意 | 任意 |
| `realizes` | 任意 | `requirement` または `specification` |
| `satisfies` | 任意 | `requirement` |
| `implements` | 任意 | `requirement` または `specification` |
| `verifies` | 任意 | `requirement` または `specification` |
| `validates` | 任意 | `requirement` |
| `supersedes` | リンク先と同一の成果物型 | リンク元と同一の成果物型 |
| `references` | 任意 | 任意 |
| `extends` | 任意 | 任意 |

「任意」は、標準コアの3成果物型（`requirement`、`decision`、`specification`）と拡張成果物型のいずれも許容する。
「仕様的位置づけの成果物型」は、`specification` および仕様の役割を持つ拡張成果物型を指す。
プロジェクト拡張で追加する関係型の制約は、augmentation 側の意味定義に従う（「拡張関係型の意味定義様式」節）。

### diagnostics 判定の扱い

- TIM が定義した制約に基づいて、派生索引の生成と検査が制約違反を diagnostics へ報告する（REQ-040-006）
- 制約違反は構造上の注目候補であって、違反だけをもって異常を確定しない
- ADF 固有の所有や統制の構造に関する診断は、TIM の制約ではなく ADF Integration 層の診断規則として扱う
- 索引・集約成果物をリンク元とする包含や参照は、「索引・集約成果物の役割識別」節の位置づけに従い、関係制約違反ではなく索引構造の検査対象とする

## 拡張関係型の意味定義様式

**拡張関係型**とは、プロジェクト拡張によって追加されるトレースリンク型を指す。
拡張関係型を高位問い合わせへ参加させる場合は、次の意味情報を augmentation 内に明示する（REQ-012-023）。

| 必須項目 | 内容 |
|---|---|
| 関係型名 | 英字 snake_case。標準コア語彙と重複しないこと |
| 関係の意味 | リンク元とリンク先の役割を含む自然言語の定義 |
| 変更影響方向 | `forward`、`backward`、`bidirectional`、`none` のいずれか |
| 高位問い合わせ参加区分 | related、impact、dependency、implementation への参加可否 |
| 関係制約 | リンク元とリンク先の成果物型の組合せ。制約しない場合は「なし」と明記 |

### 意味の自動推定の禁止

未知の関係型について、名前からの推定や LLM 推論による意味の自動推定を行わない（REQ-012-023）。
意味定義が存在しない関係型は、低位問い合わせ（neighbors、path、provenance）でのみ利用可能とし、高位問い合わせへ自動参加しない。
未知の関係型が派生索引内に存在しても、低位問い合わせは継続動作する。

### 意味定義の例（self-hosting augmentation）

| 項目 | `delegates_to` | `governs` |
|---|---|---|
| 関係の意味 | リンク元が処理の一部をリンク先へ委譲する | リンク元がリンク先の内容または品質を統治する |
| 変更影響方向 | `backward` | `forward` |
| 高位問い合わせ参加区分 | dependency のみ | impact のみ |
| 関係制約 | なし | なし |

## 索引・集約成果物の役割識別

**索引・集約成果物**とは、主たる内容が他成果物への参照の一覧である成果物を指す。
README、INDEX、CATALOG 等の名称そのものではなく、この役割によって識別する（REQ-012-024）。

### 利用可能用途

索引・集約成果物とそこからの関係は、次の用途で利用できる。

- 索引構造の検査
- 索引漏れ・参照漏れの検査
- 所在確認
- 一般参照探索
- 明示的な索引構造問い合わせ

### グラフからの削除禁止

索引・集約成果物であることだけを理由として、成果物またはその関係をグラフから削除しない（REQ-012-024）。

### 変更影響除外の判断基準

索引・集約成果物をリンク元とする包含や参照のリンクは、索引構造の記述であって当該成果物の内容の分解を意味しない。
このようなリンクは関係意味を持たないため、impact、dependency、implementation の探索経路へ参加しない。
変更影響等から除外する主たる判断は、成果物名ではなくトレースリンクの意味に基づく（REQ-012-024）。
一般参照探索と明示的な索引構造問い合わせでは、引き続き利用できる。

## 語彙カタログの確定（実測基準）

本カタログは実測基準で確定する。PR #2195 Level 2 統合後の実装（語彙定義モジュール）を基準とし、カタログと実装の乖離は実測に基づきカタログを修正して解消する（CR-001）。

- 変更影響方向の値名は `forward`、`backward`、`bidirectional`、`none` の4値として実装と一致させて確定する
- `supersedes` は変更影響方向 `none`、`extends` は `bidirectional` とし、impact プロファイルへの参加区分は変更影響方向の導出に従う
- `defined_in` の `depends_on`（依存）への集約は実装側に移行残差として残る。集約完了まで `defined_in` は仕様化スロット・変更影響方向 `backward` の関係型として実装が保持し、カタログは集約完了後に当該移行行を完結する
- 標準コア語彙は実現系列関係型（`realizes`、`satisfies`、`implements`）を含む。implementation プロファイルの参加範囲は「高位問い合わせへの参加区分」節の確定値に従う。implementation プロファイルが常に空結果となる欠陥は実装側是正として扱い、カタログ側の参加範囲変更の根拠にしない
- 索引・集約成果物の役割識別は node_type の role 属性（`index`、`aggregation`）で表現し、専用 node_type は追加しない

## 語彙採用基準

SysML、OSLC、OpenFastTrace の間で、語形と意味が完全に一致する語彙はほぼ存在しない。
完全一致語彙がない場合、次の基準で採用語彙を決定する。

1. **意味の一致度**: 表現したい関係意味と各標準語彙が定義する意味の一致度を評価し、語形より意味を優先する
2. **ADF の利用目的**: 変更影響分析、依存確認、実現確認、検証確認の目的に役立つ意味情報（変更影響方向、依存の向き、系列上の位置）を持つ語彙を選ぶ
3. **出典の明記**: 対応表へ出典標準を記録する。どの標準にも対応しない語彙は ADF 固有（またはプロジェクト固有）と明記し、既存語彙では表現できない理由を残す

採用語彙の運用規則は次のとおりである。

- 1つの意味スロットに対して採用語彙は1つとし、意味が重複する語彙を併存させない（REQ-012-019）
- 標準語彙への変更提案が生じた場合は、本カタログの対応表と移行先を更新してから派生索引と実装へ反映する

## See Also

- [agentdev-artifact-graph SPEC](../skills/agentdev-artifact-graph.md): 派生索引の生成、検査、問い合わせの契約
- [REQ-012](../../requirements/REQ-012.md): TIM と Trace Index 層の要件契約
- [REQ-040](../../requirements/REQ-040.md): Trace Query 層の要件
- [DEC-017](../../decisions/DEC-017.md): TIM 準拠トレーサビリティモデルの採用と4層分離
