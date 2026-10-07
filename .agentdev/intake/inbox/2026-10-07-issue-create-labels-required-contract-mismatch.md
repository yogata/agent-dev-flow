# agentdev_gh issue_create の labels 必須契約と検索・整理用ラベル任意付与契約の不整合

## 観測
case-open STEP-2（Case #3528）で agentdev_gh issue_create を labels 指定なしで呼出したところ、Tool 入力契約の必須フィールド検査（missing-field [labels]）で invalid-input として拒否された。一方、agentdev-workflow-case-open の手順契約は「検索・整理用ラベル（work_type 等）の付与は任意である。付与義務と起票時の既定付与は設けない」と定めている。labels 省略の呼出が Tool 契約上成立しないため、任意付与の意図を呼出に反映する手段が呼出側から明示されていない（空配列の可否は未検証）。

## 今回扱わない理由
本 Case の成果物（Root Case #3528）は work_type ラベル（feature）付与で作成済みであり、本 Case 内での契約整合の修正は対象範囲外。Tool 契約と skill 契約のどちらを改めるかは規範側の判断を要する。

## 影響
Root Case 起票・追跡Issue起票など issue_create を用いる全経路で、ラベルを付けない起票が Tool 契約上成立しない状態が継続する。ラベル付与義務なし契約を実質的に満たせない可能性がある。

## レビューで決めること
- Tool 側で labels を optional（省略時は付与なし）にするか、workflow skill 側で「labels 必須（work_type または空配列）」を明記するかの方針
- 空配列指定時の Tool 動作の確認と、その結果の契約への反映

## 根拠（任意）
- 発生: Case #3528 実行時（2026-10-07）
- 拒否応答: invalid-input / missing-field [labels] / retryable
- 関連: agentdev-workflow-case-open references（検索・整理用ラベルの任意付与契約）、docs/designs/responsibilities/custom-tool-contracts.md
