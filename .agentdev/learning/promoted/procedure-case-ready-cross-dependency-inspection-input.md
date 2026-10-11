# case-ready-cross-dependency-inspection-input

## 背景

case-ready STEP-6 の横断依存検査（inspect_cross_dependencies.ts 共有エンジン）で、Epic 化済み Root Case（Issue #3585）を current_case として検査を実行した際、初回入力の構成ミスにより 2 種類の偽陽性警告が発生した（Case #3585 実測）:

1. Root Case を `epic_ref: null`（Standard 扱い）として渡したため、同一パス重複の Wave 内委譲判定（isWaveInternal。全メンバーが同一非 null epic_ref を持つ場合のみ委譲）が作動せず、condition (a) の同一パス警告 4 件が発生した
2. 対応関係領域（adf-covers-declarations）の file_paths に traceability sidecar のみを渡したため、design 対応が inline 宣言（docs/designs/** の ADF-COVERS 宣言）に存在する REQ-104〜109 の対応が未登録と誤判定し、条件 (b) の重複需要 9 Case 分が報告された

入力を修正（current_case.epic_ref = "#3585"、対応関係領域の file_paths に coverage.ts で取得した REQ-104〜109 の design 対応 11 ファイルを追加）して再実行した結果、wave_internal_delegated_paths に 4 パスが委譲記録され、condition_a 0 件・condition_b 0 件・detection_unavailable なしで検査が成立した。エンジンは同一入力から同一報告を返すため再実行は冪等。

## 問題

`src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md` L14-24 の「横断依存検査（ゲート横断次元）」節は、検出条件と共有領域の解決を定めるが、検査入力の構成規律、(1) Epic 化済み Root Case を current_case とする場合の epic_ref の与え方、(2) 対応関係領域の実体解決（sidecar と design 対応の inline 宣言ファイルの和集合）が未規定である。このため初回実行時に偽陽性警告が出て、意味レビューで初動を消費し、修正再実行する往復が発生する。

## 望ましい変更

readiness-and-cleanup.md の横断依存検査節に入力構成の補足を追加する:

- Epic 化済み Root Case を current_case とする場合は epic_ref に自身の Epic 参照を設定する（null にしない）
- 対応関係領域の file_paths は traceability sidecar と design 対応の inline 宣言ファイル（coverage で取得可能）の和集合とする
- 修正後の再実行は冪等である旨（エンジンは同一入力から同一報告を返す）

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md` の横断依存検査節

### 対象外

- inspect_cross_dependencies.ts（共有エンジン）の判定ロジック・isWaveInternal 実装の変更
- 横断依存検査契約の Design 側変更（ワークフロー契約 Design「Case 投入時の横断依存検査契約」節）
- coverage / check の判定仕様変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | `src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md` | 横断依存検査節への入力構成補足 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md` L14-24（実測確認。grep: 「epic_ref」表記なし、「対応関係領域」は検出条件と共有領域の解決のみで入力構成規律なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 検査入力の構成規律（Epic 化済み Root Case の epic_ref 扱い、対応関係領域の実体解決に coverage を使う手順）が節に未記載。根本原因として (1) epic_ref の与え方の解釈が未確定のまま null を選択、(2) design 対応が inline 宣言に存在することを coverage 実行前に特定していなかった

## 制約

- エンジン側（inspect_cross_dependencies.ts）は変更しない。既存の isWaveInternal 判定（全メンバー同一非 null epic_ref）の前提に合わせた入力構成の補足である
- 検査入力 JSON の置き場所は既存の置き場所指針（scripts/README.md「検査入力 JSON の置き場所指針」節。project root 内 git 管理対象外領域）に従う
- 再実行の冪等性は観測事実として記録されたもの（同一入力→同一報告）

## 受け入れ条件

- [ ] readiness-and-cleanup.md の横断依存検査節に、Epic 化済み Root Case の epic_ref 設定規律が明記されている
- [ ] 対応関係領域 file_paths の実体解決（sidecar + inline 宣言の和集合、coverage による取得手順）が明記されている
- [ ] 補足はワークフロー契約 Design「Case 投入時の横断依存検査契約」節と矛盾しない

## 元learning item / 根拠

- **要約**: case-ready 横断依存検査の初回入力で Root Case を非 Epic 扱いにし対応関係領域の実体が不完全なまま警告が発生した（エントリ: 「case-ready 横断依存検査の初回入力で Root Case を非 Epic 扱いにし対応関係領域の実体が不完全なまま警告が発生した」）
- **根拠**: Issue #3585 / case-auto stage 2 委譲実行で発生。検知方法はエンジン報告（wave_internal_delegated_paths 空・condition_a 4 件・condition_b case_count 9）と Epic 配下 9 Case の入力実態との突合、エンジン実装（isWaveInternal）の確認。入力修正（epic_ref="#3585"、file_paths に coverage で取得した design 対応 11 ファイル追加）で再実行し、condition_a/b 0 件で検査成立。実害は初回入力の再構成と再実行 1 回
- **再発条件**: Epic 化済み Root Case で横断依存検査を実行し、epic_ref を null のまま渡した場合、または対応関係領域を sidecar のみで解決した場合
- **横展開可能性**: Epic 配下に子 Case を持つ全 case-ready STEP-6 実行。Epic 化管理 Issue を current_case とする横断依存検査全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: #3585
