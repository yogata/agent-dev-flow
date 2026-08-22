# 既存未管理 NG の現状（Wave 2 マージ後: LinkIntegrity 5 + workflow-status-prohibition 2）

## 観測

PR #2395 時点の既存未管理 NG は9件（LinkIntegrity broken-file-link 5件: consumer-project-setup.md の旧 specs/ パス、LifecycleBoundary 3件: SPEC→Design 改名 #2350 による baseline evidence 不一致化、Decision DEC-017 proposed warning 1件）であった。Wave 2 全マージ後（main 74571d3f）の case-close 独立再検証では unmanaged NG 7件（LinkIntegrity 5件 + workflow-status-prohibition 2件: design-save.md:93・artifact-contracts.md:124）に変化し、LifecycleBoundary 3件と DEC-017 warning は解消済み（DEC-016/017 accepted 昇格と #2396 の docs 修正による）。integrity-contracts「追加対象でない既存未管理 NG は baseline へ取り込まず実修復対象として残す」に従い残置する。

## 今回扱わない理由

いずれも base commit 由来の既知事項で、LinkIntegrity は RU-0001 コーパス機械是正（OU-010、Wave 4 #2388）の対象領域、workflow-status-prohibition 2件は個別是正候補（別 item 参照）のため。

## 影響

check_integrity が exit 1 で終わる状態が継続する（既知・管理された残置）。

## レビューで決めること

- LinkIntegrity 5件: OU-010（RU-0001、Issue #2388）での旧 specs/ パス是正への組み込み
- workflow-status-prohibition 2件: 別 item（frontmatter フィールド名 backtick 化または文言変更）の対応優先度

## 根拠

- PR #2395 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2395 ）
- PR #2396 本文「check_integrity before/after」（回収元: https://github.com/yogata/agent-dev-flow/pull/2396 ）
- case-close Wave 2 独立再検証（check_integrity.ts、main 74571d3f、junction 再構築後）: NG 7 / Warning 0
