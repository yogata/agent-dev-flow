# ADR README ADR-0009 ステータス不整合

## 観測

`docs/adr/README.md` ADR一覧テーブル（L17）で ADR-0009 のステータスが `proposed` と記載されているが、`docs/adr/ADR-0009.md` frontmatter では `status: accepted` であり、同 README の Status View セクション（L34）でも `accepted` として分類されている。

## 影響

ADR一覧テーブルのみ古いステータス値が残存。README を閲覧した際に ADR-0009 のステータスが未確定と誤認される可能性がある。

## レビューで決めること

- ADR README の ADR一覧テーブル L17 の ADR-0009 ステータスを `accepted` に更新する

## 根拠

- 検出元: integrity-check F-01 (2026-05-31)
- 分類: document-drift
- 対象ファイル: `docs/adr/README.md:17`
