# クローズ済み Case Issue 本文の件数誤記（46 vs 実測 45）に対する訂正方針の確定

- 元 item: .agentdev/intake/inbox/2026-09-28-3220-decisions-batch-count-discrepancy.md
- 観測元: REQ-094 Wave 2-3（Epic #3216・Issue #3220・PR #3228）の case-run 記録
- 事実関係: Issue #3220 本文「docs/decisions/*.md 全46件（DEC-001〜046）」に対し、実測は DEC-018 欠番を含む DEC 45 件（git ls-files 実測・2026-09-28 再確認）。case-run は実測 45 件で検証網羅（TS-009 PASS）。case-close 判定補記・Epic #3216 対応記録コメントで実測補記済み。

## 課題（方針論点）

過去に起票済みでクローズ済みの Case Issue 本文の件数記述を訂正する手続き・方針（履歴保持 vs 誤記修正の線引き）が未確立。REQ-094 は「履歴上その文字列自体を保持する必要がある事実関係は変更しない」ため、機械的訂正ではなく方針検討として回収された。

## 既存論点との関連

- inspect-docs 20260925 F-08「Decision history-keeping vs successor-note policy」（継続 defer、20260928 に証拠追加あり）と同族の横断方針。統合判断を推奨。
- 同一の「固定件数埋め込み」族として inspect 20260928 DS-17（index-auto-generation.md:189「データ行 43 行」vs 実測 45 行）が存在するが、DS-17 は Design 側の機械是正対象で本 item は Issue 本文側の方針論点。処置系は異なるため重複カウントしないこと。

## route 提示（backlog-review 判断用）

- ポリシー検討 RU（F-08 との統合候補）。方針確定はユーザー合議必須。
