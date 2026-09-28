# 対象内訳差異: Issue #3220 本文の docs/decisions 件数記述（46件 vs 実測 45件）

- 出典: REQ-094 Wave 2-3（Epic #3216・Issue #3220、PR #3228）の Findings / Capture候補（case-run 記録）
- 発見内容: Issue #3220 本文は「docs/decisions/*.md 全46件（DEC-001〜046）」とするが、実測は DEC-018 欠番を含む **DEC 45件** + `docs/decisions/README.md` 1件（AUTOGEN 派生物で手是正対象外）。case-run は git ls-files 実測 45件を走査対象として検証網羅（TS-009 PASS）し、Issue 本文は変更していない
- 現状: case-close 対応記録コメントと Issue #3220 本文の case-close 判定補記（2026-09-28）で実測 45件の補記済み。Epic #3216 対応記録コメントにも記録済み
- 検討候補: 過去に起票済みでクローズ済みの Case Issue 本文の件数記述を訂正する手続き・方針（履歴保持 vs 誤記修正の線引き）。REQ-094 では「履歴上その文字列自体を保持する必要がある事実関係は変更しない」ため、機械的訂正ではなく intake での検討に回収
- 関連: Issue #3220、PR #3228、Epic #3216、docs/decisions/README.md（AUTOGEN）
