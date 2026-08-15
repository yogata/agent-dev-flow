# 既存 broken reference 群の残存（ADR-006、REQ-0145、audits 相対リンク等）

## 観測内容

docs-check で常態化している既存の broken reference 群が残存している。REQ-021 から ADR-006 への参照、vocabulary-registry から REQ-0145 への参照、integrity/audits 配下の壊れた相対リンク等。ADR→Decision 移行の横断是正で配下参照の洗い替えが完了していなかった事例による。

## 影響

- 新規変更起因の broken reference 指摘との判別コストが増加する
- docs-check の検出結果が恒常的にノイズを含む状態が継続する

## 課題

既存 broken reference 群を網羅的に収集し、参照解決（Decision 移行後の ID への更新、存在しない参照先の除去）を一括是正する。ADR→Decision 移行（DEC モデル）に伴う参照洗い替えの未完了分を特定する。

## 既存要件・成果物との関連

- 対象: docs/ 配下の broken reference を含む文書群（REQ-021 参照元、vocabulary-registry、integrity/audits 関連）
- 関連: ADR→Decision 移行の横断是正

## 出典

- 発生日: 2026-08-15
- 取得元: docs-check 実行時の観測
- 元 item: intake-2026-08-15-existing-broken-references-legacy.md
