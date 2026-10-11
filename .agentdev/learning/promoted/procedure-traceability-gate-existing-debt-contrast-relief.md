# traceability-gate-existing-debt-contrast-relief

## 背景

case-open STEP-4 の traceability gate（prepare_definition_pr script 内判定）は、definition-pr-and-idempotency.md L38 の gate 判定仕様「missing-design 以外の検査種別は status: fail のとき fail とする」に従う。このため、case-open の正規ゲート（対象 REQ 行の missing-design 0 件）は成立していても、corpus 全体の missing-implementation 等の既存債務（case-run / case-ready 段階の前提）が 1 件以上あると script は gate fail を返す。

実運用で 2 Case が同一状況に到達した:

1. Case #3605（PR #3608、bugfix Definition PR・REQ 行変更なし）: traceabilityReqIds 空のため missing-design は gate 非対象だが、missing-implementation 92 件の既存債務で script が exitCode 2 gate fail。変更前後の対照実行（worktree HEAD と main HEAD で check.ts --root を切替実行）により status・findings が完全一致（差分 0）を機械証明し、本変更起因の検出悪化 0 件を根拠に PR 作成可と意味判断した
2. Case #3560（PR #3561）: 対象 REQ 行の missing-design 0 件（正規ゲート成立）にもかかわらず、missing-implementation 1 件（main HEAD 変更前から存在する既存欠落）で gate fail。対照実行で同一定 REQ 行 check の同一 findings を確認し、既存欠落を warn として報告に記録して PR 作成へ進んだ

両者とも「fail を pass へ変換せず」既存債務を case-ready の lifecycle gate completeness と後続 OU が所有する既知債務として保持する方針で処理した。対照実行（STEP-3 手順 4.5 の正規手順: 変更前後の check 結果の対照による検出差分の変更起因分離）の gate 判定への適用が実効的な救済手順として機能した。

## 問題

definition-pr-and-idempotency.md L38 の gate 判定仕様は「対象 REQ 行外の missing-design（既存欠落の既知債務）は gate 判定を変更せず、本工程の失敗へ読み替えない」までを明示するが、missing-design 以外の fail（missing-implementation / missing-verification 等）についての対照救済手順（変更前後の findings 差分 0 件を機械証明した場合は既存債務として本工程の失敗へ読み替えない）が明文化されていない。このため REQ 行変更なし・実装対応を持たない Definition PR（bugfix / docs_chore）では、corpus 既存債務残存下で script が gate fail を返すたびに実行者が意味判断をゼロから構築する。

加えて、coverage コマンドの `--req` カンマ連結指定は複数 REQ 行分の union の関係一覧を返すため、counts.design の計上有無で「対象 REQ 行全体の design 対応実在」を判定すると行単位の帰着証明として不成立になる（Case #3605 の case-ready STEP-1 で missing-design 10 行を検出し merge 抑止→case-open 差し戻しが発生）。行単位の design 対応帰着は coverage 単行実行または check --req の missing-design findings で確認する必要がある。

## 望ましい変更

definition-pr-and-idempotency.md の gate 判定仕様節（L38）および missing-design 0 件ゲート節（L62）に、次の 2 点を補足する:

- gate 判定仕様への対照救済手順: missing-design 以外の fail についても、対照実行（変更前後の check 結果の対照）で findings 差分 0 件を機械証明した場合は既存債務として本工程の失敗へ読み替えない。判断と証跡は PR 本文の検証差分へ記録する
- missing-design 0 件ゲート確認手順への注意: coverage --req のカンマ連結指定は union の関係一覧を返し、counts.design は行単位の design 対応帰着証明に使えない。行単位の確認は coverage 単行実行または check --req の missing-design findings で実施する

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`（gate 判定仕様節 L38、missing-design 0 件ゲート節 L62）

### 対象外

- prepare_definition_pr.ts の gate 判定実装の変更（現行動作「missing-design 以外の status: fail は gate fail」は L38 仕様として既に正とされている。仕様と実装の整合は前回評価で解消済み）
- traceability check エンジン（check.ts）の変更
- coverage コマンドの仕様変更（union の挙動自体は仕様どおり）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` | 対照救済手順の明文化（L38 節）+ coverage union 解釈注意（L62 節） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` L38（gate 判定仕様。実測確認。「missing-design 以外の検査種別は status: fail のとき fail とする」「対象 REQ 行外の missing-design は…本工程の失敗へ読み替えない」まで記載済み。対照実行による救済手順の記述は不在）/ L62（missing-design 0 件ゲート。「coverage --req による実測帰着確認を併用する」まで記載済み。union 結果の行単位帰着不可の注意は不在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 対照救済手順と coverage union 解釈注意が未規定。2 Case（#3560・#3605）で同一手順が個別に構築され、1 Case（#3605 case-ready 段）では coverage union 解釈ミスが merge 抑止+差し戻し（往復）として実害化した

## 制約

- 対照救済は「fail を pass へ変換する」ことではなく、既存債務を本工程の失敗へ読み替えないことを機械証明する手順である。対象 REQ 行内の missing-design には適用しない（既存債務除外は対象 REQ 行外のみ）
- coverage は advisory・fail-open であり check の判定を代替しない（既存契約の維持）
- gate 判定仕様自体（script 現行動作を正とする部分）は変更しない

## 受け入れ条件

- [ ] gate 判定仕様節に対照実行（findings 差分 0 件機械証明）による既存債務救済手順が明文化されている
- [ ] missing-design 0 件ゲート節に coverage --req カンマ連結の union 結果を行単位帰着証明に使わない注意が明記されている
- [ ] いずれの補足も「fail を pass へ変換しない」原則と整合する

## 元learning item / 根拠

- **要約**: traceability gate の既存債務 fail は対照実行で変更起因 0 件を機械証明してから PR 作成可否を意味判断する。coverage カンマ連結の union 結果は行単位 design 対応の帰着証明に使えない（エントリ: 「traceability gate の既存債務 fail は対照実行で変更起因 0 件を機械証明してから PR 作成可否を意味判断する」「coverage カンマ連結の union 結果を行単位 design 対応の帰着証明に使えず case-ready で missing-design 10 行が検出された」「case-open traceability gate は script 判定が missing-design 以外の fail を無条件失敗にし Design 意図と乖離する」の 3 エントリ統合）
- **根拠**: Case #3605（PR #3608、commit e9a65d50）で対照実行（worktree HEAD vs main HEAD、findings 完全一致）により既存債務救済を実証。Case #3560（PR #3561）で missing-design 0 件成立下の既存欠落 fail を対照実行で分離。coverage union 解釈ミスは case-ready STEP-1 の gate fail（missing-design 10 行）と merge 抑止として実害化し、case-open 差し戻しで解消。同型対応が 2 Case で個別に構築された
- **再発条件**: corpus に missing-implementation 等の既存債務が残存する状態で、REQ 行変更なし・実装対応を持たない Definition PR を作成した場合。複数 REQ 行をカンマ連結で coverage 実行し counts.design の計上有無で design 対応実在を判定した場合
- **横展開可能性**: traceability gate を実行する case-open STEP-4 と case-ready トレーサビリティ完全性ゲート（同一エンジン共有）。coverage を帰着確認に使う全工程

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: #3560、#3605
