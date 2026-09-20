# sidecar と検証スコープポリシーの作成・更新手順

本 reference は、対応関係 sidecar（`traceability/<component-slug>.yaml`）と検証スコープポリシー（`traceability/policy.yaml`）の作成・更新手順、および要件・Design・実装・検証変更時の対応関係更新手順を提供する。
schema とモデルの正本は producer 側リポジトリの ADF v4 Traceability モデル Design（v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md）が所有する。本 reference は正本への参照を前提とした利用手順を記述し、規範の独立定義を行わない。

## sidecar の作成手順

1. 対象 component / package の識別子を決め、kebab-case の component-slug とする（例: `traceability/<component-slug>.yaml`）
2. ファイルをリポジトリ top-level `traceability/` 配下へ作成する
3. トップレベルキー `component`（必須の文字列）と、role キー（decision / design / implementation / verification の4種のみ許容）を記述する
4. 各 role キー配下へ「artifact のリポジトリ相対パス → 要件行 ID（`REQ-{NNNN}-{MMM}` 形式）の列挙」を記述する

```yaml
component: <component-slug>
decision:
  docs/<path/to/decision>.md:
    - REQ-{NNNN}-{MMM}
design:
  docs/<domain>/<slug>.md:
    - REQ-{NNNN}-{MMM}
implementation:
  <repository-relative-path>:
    - REQ-{NNNN}-{MMM}
verification:
  <repository-relative-path>:
    - REQ-{NNNN}-{MMM}
```

記述上の規約（schema の詳細は ADF v4 Traceability モデル Design〔v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md〕正本を参照）:

- artifact パスは POSIX 区切り文字のリポジトリ相対パスで記述する
- 1つの artifact パスを複数の role キー配下へ重複させてよい。同一 role 内での同一パスの重複定義は check（`duplicate-inconsistencies`）の検出対象とする
- 1つの sidecar ファイルに複数 component を混在させず、同一 component を複数 sidecar へ分散させない。sidecar はその component の artifact への対応関係のみを保持する
- 全 component を単一ファイルへ集約する巨大な中央台帳を作らない。component / package 単位の分散保持が正規構造である
- 各対応は要件行へ直接対応付け、Design 対応を経由して実装・検証が成立したものと推定する記述をしない（推移阻止）
- 専用の artifact ID、graph node ID、edge ID、revision、digest は必須データとしない
- `traceability/` 配下の sidecar と policy.yaml は project 側の開発管理成果物であり、配布対象の製品ソースへ含めない

## 検証スコープポリシー（policy.yaml）の利用手順

`traceability/policy.yaml` は project-level の正規情報源であり、検証対応の要否のみを宣言する。対応関係を保持しない。sidecar ではないため、component との関連も持たない。

```yaml
verification:
  default: required
  optional:
    - REQ-{NNNN}-{MMM}
```

利用規約:

- `verification.default` は文字列 `required` を取る。`verification.optional` は検証対応を任意とする要件行 ID の列挙とする。それ以外のキーは schema 違反（`policy-invalid`）とする
- 未指定の要件行はすべて検証対応 required として扱う（未指定 = required）。検証対応を任意とするには、policy への明示登録のみが手段である
- policy.yaml が存在しない場合、全現行要件行を検証対応 required として扱う（安全側既定）
- policy.yaml が読取不能または schema 不適合の場合、check は検証対応の要否判定が不能となり当該検査を不合格にする（完全性判定不能を合格として扱わない、fail-closed）
- optional 登録の目安は、当該要件行が恒続的に検証可能な対象を持つか（検証手段との対応付けが意味を持つか）とする。性質に応じて project が policy で宣言するものであり、判定状態を導出する分類モデルは存在しない
- policy の optional 列挙に存在しない要件行 ID を含めない（`unknown-req-refs` の検出対象）

## 要件・Design・実装・検証変更時の対応関係更新手順

### 要件行の追加（新 REQ、既存 REQ への行追加）

1. Design 確定工程で Design 対応を成立させる（Design 対応0件のまま実装着手しない）。対応は Design 文書の sidecar（または producer-only artifact の inline declaration）へ要件行を追加する
2. 実装着手後、実際に要件を実現する永続成果物へ実装対応を、永続的な検証手段へ検証対応を sidecar へ作成・更新する
3. 検証対応を持たない要件行は、policy が required と判定する限り `missing-verification` に計上される。恒続的な検証対象を持たない行のみ policy の `optional` へ明示登録する

### Design 文書の変更（rename、移動、役割の変更）

1. sidecar 内の該当 artifact パスを新しいリポジトリ相対パスへ更新する（旧パスの残置は `invalid-artifact-paths` または対応の欠落を誘発する）
2. 1つの Design 文書が複数の要件行を担当してよい。他要件行への対応関係は維持する

### 実装・検証成果物の追加・移動・削除

1. 追加時: 該当 component の sidecar へ artifact パスと要件行 ID を追加する。役割は実際の性質（implementation / verification）で判断し、1つの成果物が複数役割を持てる
2. 移動時（rename）: sidecar の該当パスを更新する
3. 削除時: 該当 artifact の対応関係を sidecar から削除する。要件行自体が残る場合、実装対応・検証対応の欠落が `missing-implementation` / `missing-verification` に計上されるため、後継の成果物へ対応付け替える

### 要件行の廃止・要件の退避

1. 要件行が現行要件テーブルから退避すると、その要件行 ID への参照は `unknown-req-refs` の検出対象になり得る
2. sidecar と inline declaration から該当要件行 ID の列挙を整理し、後継要件行がある場合は後継へ対応付け替える

### sidecar と inline declaration の関係の管理

- 同一の論理関係（同一 artifact パス × role × 要件行 ID）を sidecar と inline declaration の双方へ記述してよい。整合しない重複は `duplicate-inconsistencies` として検出される
- inline declaration から sidecar へ移行する場合、旧側の宣言を撤去してから新側を確定するなど、移行途中で論理関係が矛盾しないよう整理する
- consumer distribution closure（配布対象の製品ソース）では inline declaration を使用しない。配布対象成果物の対応関係は sidecar で保持する
