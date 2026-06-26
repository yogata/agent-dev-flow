# REQ-0114 に歴史的叙述（「従来〜」）が現行要件文中に残留

## 発生源

- `/repo/docs-check` 実行（2026-06-25）
- `.agentdev/integrity/reports/2026-06-24-integrity-report.md`
- 対象行: `docs/requirements/REQ-0114.md:110`

## 観測内容

`docs/requirements/REQ-0114.md` L110 に歴史的文脈（「従来 depends_on ...」）が blockquote で記述されている。REQ-0108-205 は、歴史的文脈を retired 文書や mapping table に配置すべきとし、現行要件文中の記述を避けることを求める。

該当箇所は case-auto の Epic 運用に関する旧運用（独立 OU のみ Epic 対象）の説明であり、現行要件判断には不要な歴史的背景情報にあたる。

## 影響

- 現行要件文中に歴史情報が残留し、読者が現行判断と歴史背景を混同する可能性

## 課題

- 当該「運用メモ」blockquote を mapping table または retired 文書へ移動するか、現行 REQ 文中に残す（必要な文脈と判断）か
- 残す場合、歴史情報であることを明示する修飾（「（廃止済み運用）」等）を付与するか

## 既存要件との関連

- REQ-0108-205（historical narrative detection、歴史的文脈を retired 文書や mapping table に配置すべき）
- `docs/requirements/REQ-0114.md` L110

## 対応方針候補

- 文書ドリフト・歴史的叙述の配置規律に従い、mapping table/retired へ移動または歴史情報である旨を明示する
