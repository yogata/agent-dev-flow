---
title: 最小トレーサビリティモデル（TIM）
status: accepted
created: "2026-08-17"
updated: "2026-09-17"
---

<!-- ADF-COVERS(design): REQ-012-026, REQ-012-027, REQ-012-028, REQ-012-029, REQ-012-030, REQ-012-031, REQ-012-032, REQ-012-033, REQ-012-034, REQ-012-035, REQ-012-036, REQ-012-037, REQ-012-038, REQ-012-039, REQ-012-040, REQ-012-041, REQ-012-042, REQ-012-054, REQ-012-052, REQ-012-053, REQ-012-056, REQ-012-057, REQ-002-048, REQ-057-005 -->
<!-- ADF-COVERS(implementation): REQ-012-027, REQ-012-028, REQ-012-029, REQ-012-030, REQ-012-031, REQ-012-032, REQ-012-033, REQ-012-034, REQ-012-035, REQ-012-036, REQ-012-037, REQ-012-038, REQ-012-039, REQ-012-040, REQ-012-041, REQ-012-042 -->
<!-- ADF-COVERS(implementation): REQ-057-005 -->

## 目的

要件を中心とした最小のトレーサビリティ対応モデル（TIM）の概念定義を正規所有する。REQ-012 が要件契約を、本 Design がモデル要素の定義と用語政策の実体を所管する。対応宣言の表記と coverage、impact、check の実行契約は skills/agentdev-traceability.md が所管する。

## モデル要素

| 要素 | 定義 |
|---|---|
| 要件行（requirement line） | TIM の要件単位。`REQ-{NNNN}-{MMM}` 形式の個別要件行 |
| 対応関係（covers） | 成果物が要件へ明示的に対応する、TIM の標準コア関係 |
| 成果物役割（artifact role） | decision、design、implementation、verification の4種 |
| Decision 対応 | decision 役割の対応関係。要件に関する正式な意思決定を記録する永続成果物が保持する。任意であり、欠けても不完全と判定しない |
| Design 対応 | design 役割の対応関係。要件を実現する現在の設計が保持する。全要件行で1件以上を必須とする |
| 実装対応 | implementation 役割の対応関係。要件を実現する永続成果物が保持する。全要件行で1件以上を必須とする |
| 検証対応 | verification 役割の対応関係。要件を検証する永続的な検証手段が保持する。検証スコープポリシーが required とする要件行で1件以上を必須とする |

規則:

- Decision・Design・実装・検証の各対応は要件へ直接対応付け、Design 対応を経由して実装または検証が成立したものと推定しない（推移阻止）
- 1つの成果物が複数の要件へ対応でき、複数の役割を持てる。1つの Design 文書が複数の要件行を担当してよい
- implementation は永続成果物の役割であり、ソースコードという物理種別を前提としない。`.md`、`.ts` 等の拡張子で実装対応・検証対応の成立可否を制限しない
- verification は永続的な検証手段の役割であり、個々の検証実行結果は TIM に保持しない
- 一般的文書参照、Markdown リンク、言及は、TIM の標準成果物型・意味的関係に含めない

## 対応関係の完全性規則

- Decision 対応は任意であり、Decision 対応0件のみを理由に不完全と判定しない
- Design 対応は全要件行で1件以上を必須とする
- 実装対応は全要件行で1件以上を必須とする
- 検証対応は、検証スコープポリシー（`traceability/policy.yaml`）が required と判定する要件行で1件以上を必須とする
- 検証スコープポリシーは project-level の正規情報源であり、既定値 `required` と、検証対応を任意とする要件行 ID の明示列挙で構成する。ポリシーで任意と明示された要件行以外は、すべて検証対応 required と判定する（未指定 = required）
- policy.yaml が存在しない場合、全現行要件行を検証対応 required と判定する（未指定 = required の安全側既定）
- 検証対応を任意とする要件行の登録目安は、当該要件行が恒続的な検証可能な対象を持つか（検証手段との対応付けが意味を持つか）を基準とし、policy.yaml の明示登録運用で参照する
- 個々の component sidecar は検証スコープポリシーを所有せず、対応関係のみを保持する
- Design 対応0件、実装対応0件はそれぞれ対応の欠落として個別に検出する
- 検証対応0件は required の要件行のみ検証対応の欠落として個別に検出する
- 検証スコープの要否は要件行の性質を project が policy.yaml で宣言するものであり、判定状態を導出する分類モデルを持たない。「未分類」という中間状態は本モデルに存在しない
- 検証スコープポリシーは、旧「検証対応要否カタログ」を置き換える。当該カタログは廃止済みであり、カタログが保持していた ADF 自身の検証対応スコープデータは ADF リポジトリの `traceability/policy.yaml` へ移行済みである
- 対応関係を workflow が参照するときのゲート契約: REQ の保存時点では Design 対応0件を許容する。Design 確定工程（Definition 保存）で Requirement と Design の対応を成立させる。実装着手前の case-ready は、対象要件行に Design 対応1件以上が存在し、検証スコープポリシーとの整合が確認されていることを ready 遷移の条件とする。case-run は実際に要件を実現する成果物へ実装対応を、永続的な検証手段へ検証対応を sidecar に作成・更新する。case-close は対象要件行について Design 対応1件以上、実装対応1件以上、policy が required の要件行の検証対応1件以上、およびトレーサビリティデータ自体の整合性を最終再検査する。Decision の有無は完了条件としない
- 本規則は新規 REQ・要件行の追加時に自動的に適用される（REQ-021、REQ-012 との整合）

## 対応関係データの保存方式

- 対応関係データの標準保存方式は、リポジトリ top-level の `traceability/` ディレクトリ配下に置く component / package 単位の sidecar ファイルとする
- sidecar ファイルは YAML 形式とし、ファイル名は `traceability/<component-slug>.yaml` とする。component-slug は component または package の識別子を kebab-case で表現する
- sidecar の最小データは、component 識別子、artifact のリポジトリ相対パス、role、要件行 ID とする。専用 artifact ID、graph node ID、edge ID、revision、digest を必須データとしない
- sidecar schema:

  ```yaml
  component: <component-slug>
  decision:
    docs/decisions/DEC-{NNN}.md:
      - REQ-{NNNN}-{MMM}
  design:
    docs/designs/{domain}/{slug}.md:
      - REQ-{NNNN}-{MMM}
  implementation:
    {リポジトリ相対パス}:
      - REQ-{NNNN}-{MMM}
  verification:
    {リポジトリ相対パス}:
      - REQ-{NNNN}-{MMM}
  ```

- トップレベルキー `component` は必須の文字列とする。role キーは decision / design / implementation / verification の4種のみ許容し、各 role キーは「artifact のリポジトリ相対パス → 要件行 ID の列挙」のマッピングを持つ。要件行 ID は `REQ-{NNNN}-{MMM}` 形式とする
- artifact パスは POSIX 区切り文字のリポジトリ相対パスで記述する。1つの artifact パスを複数の role キー配下へ重複させてよい。同一 role 内での同一パスの重複定義は check の重複不整合検出対象とする
- 1つの sidecar ファイルが複数の component を混在させず、同一 component を複数の sidecar ファイルへ分散させない。sidecar はその component の artifact への対応関係のみを保持する
- 全 component を単一ファイルへ集約する巨大な中央台帳を採用しない。対応関係データは component / package 単位の sidecar による分散保持を正規構造とする
- 検証スコープポリシーは `traceability/policy.yaml` に置く:

  ```yaml
  verification:
    default: required
    optional:
      - REQ-{NNNN}-{MMM}
  ```

  `verification.default` は文字列 `required` を取る。`verification.optional` は検証対応を任意とする要件行 ID の列挙とする。それ以外のキーは schema 違反とする
- `traceability/` 配下のデータは producer / project 側の開発管理成果物であり、consumer distribution closure に含めない
- producer-only artifact では、対応関係を inline declaration（`ADF-COVERS` 宣言行）として保持できる。inline declaration は TIM そのものではなく表現形式の一つであり、sidecar と inline declaration は同一の論理的な対応関係（artifact パス、role、要件行 ID）へ正規化される。consumer distribution closure に含まれる成果物では inline declaration を使用しない（配布境界は integrity/distribution-boundary.md が所有する）
- 同一の論理関係を sidecar と inline declaration の双方に記述してよい。整合しない重複は check が検出する

## 正規情報源と直接走査

- 対応関係データの正規情報源は、`traceability/` 配下の sidecar と policy.yaml、および producer-only artifact に許容された inline declaration とする
- 要件行の存在と内容の正規情報源は docs/requirements/ 配下の REQ ファイルとし、成果物の存在確認はリポジトリ相対パスで行う
- トレーサビリティ機能は正規成果物を直接走査して対応関係をその場で解決する。sidecar は派生索引ではなく対応関係の一次保存方式である。派生索引、グラフDB、物理保存形式を規定しない
- 実装成果物および検証手段に専用の恒久IDを新設しない（要件行IDとリポジトリ相対パスで識別する）

## 用語政策

- 日本語本文の正式用語は「対応関係」「対応付け」「Decision 対応」「Design 対応」「実装対応」「検証対応」「sidecar」「検証スコープポリシー」を用いる
- coverage / covers は機械識別子または外部標準（OpenFastTrace 等）との対応説明でのみ使用する
- 影響方向カタログ、関係型カタログ、拡張関係、派生索引の鮮度管理、検証対応要否カタログ等の旧語彙は本モデルで所有しない

## 対象外

- 一般文書探索、任意経路探索、構造診断、依存関係探索（README 索引、正規成果物の直接読取、rg 等の独立探索手段が担う）
- ADF ワークフロー統合の工程割り当て（REQ-021、各 command Design）
- 対応宣言の文字列表記と解析仕様（skills/agentdev-traceability.md）