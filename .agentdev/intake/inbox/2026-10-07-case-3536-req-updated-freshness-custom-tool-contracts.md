# custom-tool-contracts.md の req-updated-freshness（Wave 2-1 由来の updated 進行漏れ）を後続 Wave で解消する

## 内容

Case 3536（Wave 2-4）case-close の check_integrity 本体独立再実行（merge 直前 HEAD 58bf3a5e）で、req-updated-freshness NG 1 件が計上された: docs/designs/responsibilities/custom-tool-contracts.md の frontmatter updated（2026-10-04）が最終 content-change commit date（2026-10-07）と不一致。merge 実行前時点の main HEAD 874f4c40 でも同一内容が再現することを対照実行で確認済み。

- 起因は Wave 2-1（Issue 3533）の merge（d052d6fd「docs(jev): Jev 評価器障害時契約を正規モデルへ再整合（RA-001）」）で custom-tool-contracts.md が content 変更された際に frontmatter updated が進行しなかった追随漏れ。本変更 8 ファイルは非接触
- Wave 2-1 の case-close では bun test 3分割を主体とした検証で check_integrity 本体の fresh 実行が記録になく、本 NG は見過ごされた経過状態

## 影響

check_integrity が exit 1 を継続し、後続 Wave の case-close で毎回由来分類の説明が必要になる。Epic #3530 完了条件の「check_integrity（exit 0）」を Issue 3538 の Epic 完了判定時に阻害する。

## 提案

Issue 3537（Wave 2-5）または Wave 3 の docs 変更単位で custom-tool-contracts.md の frontmatter updated を 2026-10-07 へ進行させる（IR-072 契約の通常追随。恒久免除の新設は不要）。次の docs 変更 PR で自然解消する可能性もあるが、Epic 完了条件の判定主体が Issue 3538 であるため、Wave 3 内での確実な解消を推奨する。

## 根拠

Case 3536 case-close の対応記録コメント（検証差分節 check_integrity 本体独立再実行行・main 対照実行）と完了記録コメント（comment 6038574426）の判定根拠。

https://github.com/yogata/agent-dev-flow/pull/3543
