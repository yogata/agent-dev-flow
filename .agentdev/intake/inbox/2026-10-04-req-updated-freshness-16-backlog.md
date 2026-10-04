# intake: req-updated-freshness 16件の既出債務（REQ frontmatter updated の一括是正候補）

## 内容

REQ-001/003/010/012/050/052/053/060/082/091/094/095/097/098/099 の frontmatter updated が最終 content-change commit date より旧い（check_integrity IR-072 req-updated-freshness NG 16件）。Wave-2・Wave-3 の REQ 編集ケースで updated 進行が漏れた履歴。

一括是正候補（frontmatter updated を最終 content-change commit date へ進行させる）。機械的に導出可能な既出債務として case-close 検証差分に既出分類で記録済み。

対応候補: REQ frontmatter updated の一括是正（IR-072 規約に従い content-change commit date へ進行）+ REQ 編集時の updated 進行漏れの予防（case-run 検査項目化等）。

## 根拠

- 観測元: PR #3439（Case #3432・Epic #3425 Wave 3）本文 Findings / Capture候補 intake セクション
- 元テキスト: 「req-updated-freshness 16件の既出債務: REQ-001/003/010/012/050/052/053/060/082/091/094/095/097/098/099 の frontmatter updated が最終 content-change commit date より旧い（Wave-2・本 Wave の REQ 編集ケースで updated 進行が漏れた履歴）。一括是正候補」
- 備考: Wave 3 完了判定では既出債務として対象外・完了記録に明記済み
- captured_at_commit: cefc3f794e0ed6eedcf59ea53732ca08366ad00e
