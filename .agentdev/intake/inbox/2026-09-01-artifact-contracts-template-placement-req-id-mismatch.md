# artifact-contracts.md 216行目の REQ-002-046 誤参照（Template 配置先への参照ズレ）

## 観測

`docs/designs/responsibilities/artifact-contracts.md` 216 行目「Template の配置先は以下の 2 種類を定義する（REQ-002-046）。」が REQ-002-046（ADF core の技術固有知識非保持境界）への誤参照の疑い。REQ-002-046 は配布成果物の知識保持境界の原則行であり、Template 配置先の契約を所有しない。Template 配置先を所有する要件は REQ-002 のテーブル内別行（005/007/008 系の配置規定行）であり、REQ-002 テーブル末尾行（REQ-002-046 が末尾に追加された）への参照ズレと推定される。

## 今回扱わない理由

docs 側修正は Issue #2489（PR #2494）の docs 変更禁止契約により対象外。本 Case（REQ-002-046 履行）の配布成果物走査では docs/ 配下は検査対象外であり、是正は後続工程での対応候補。

## 影響

docs 内の REQ 参照が意味的に誤った行を指す状態が残る（文書整合の軽微な不備。Template 配置契約自体の動作・境界への影響なし）。

## レビューで決めること

- 216 行目の正しい参照先の特定（REQ-002 の該当行への付け替え、または参照削除）
- 参照ズレが生じた経緯の確認と、REQ テーブル末尾行追加時に既存参照がズレるパターンの再発防止要否

## 根拠

- PR #2494 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2494 ）
