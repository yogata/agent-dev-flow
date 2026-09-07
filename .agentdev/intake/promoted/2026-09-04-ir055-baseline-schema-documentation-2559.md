# IR-055 baseline entry schema の明文化

## 観測内容
Issue #2559 で `ir-055-baseline.json` の entry に `classification: baseline` と `reason` を追加し、再生成時に機械的に付与・保持する実装が導入された。

## 影響
実在する entry schema と `integrity-contracts.md` の baseline 運用記述に差があり、strict entry と heuristic entry の扱いを確認しにくい。

## 課題
integrity-contracts.md へ classification/reason、機械付与契約、strict entry 非対象を明文化し、REQ 側の記述も確認する。

## 既存要件・正規成果物との関連
PR #2583、Issue #2559、ACT-DESIGN-003、`ir-055-baseline.json`。
