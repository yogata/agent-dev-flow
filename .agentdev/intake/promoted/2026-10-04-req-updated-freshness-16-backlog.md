# 採用済み成果物: req-updated-freshness 16件の既出債務（REQ frontmatter updated の一括是正候補）

## 観測内容

REQ-001/003/010/012/050/052/053/060/082/091/094/095/097/098/099 の frontmatter updated が最終 content-change commit date より旧い（check_integrity IR-072 req-updated-freshness NG 16件）。Wave-2・Wave-3 の REQ 編集ケースで updated 進行が漏れた履歴。

## 影響

IR-072 検査で継続的に検出される既知 NG。REQ 文書の鮮度情報（frontmatter updated）が実際の編集履歴と不一致し、REQ の最終変更時点の誤認を招く。

## 課題

一括是正の対応候補: frontmatter updated を最終 content-change commit date へ進行させる（IR-072 規約に従う）。対象 REQ の正確な一覧は機械的に導出可能なため、対応時に check_integrity の現行実行結果で再確定すること。併せて REQ 編集時の updated 進行漏れの予防（case-run 検査項目化等）の検討候補。

## 既存要件との関連

- IR-072（req-updated-freshness 検査）
- REQ frontmatter 運用規約（REQ-010 系の文書構成規則）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-04-req-updated-freshness-16-backlog.md`（分類採用により削除済み）
- 観測元: PR #3439（Case #3432・Epic #3425 Wave 3）本文 Findings / Capture候補 intake セクション
- 備考（元 item）: Wave 3 完了判定では既出債務として対象外・完了記録に明記済み
- captured_at_commit: cefc3f794e0ed6eedcf59ea53732ca08366ad00e
- 現行源検証（intake-promote・ad6e8341・読取のみ）: REQ-053 をスポット実測し frontmatter updated=2026-09-29 < 最終 content-change=2026-10-04（343d4661）で残存を確認。全件一覧は対応時に機械再確定
- 関連: 2026-10-03 取得の既知債務 3系統 item の債務 2（REQ-003/012/034/082）と重複。統合記録 `2026-10-03-known-integrity-debts-consolidation.md` 参照（REQ-034 は本 item の列挙外のため統合時に残存確認を含めること）
