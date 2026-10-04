# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 段階委任の並行重複実行を検知し、正規実行を特定して是正する手順

- **問題事象**: case-auto stage 2 の case-ready 段階委任（Root Case #3457）が2系統で並走した。後行実行が先行実行の merge・子 Issue・ready 状態を検知せず、子 Issue 10件を重複作成し、Epic 本文を実行構成表ごと上書きした（正規状態 ready が open へ後退）。後行実行は ready 遷移未到達で停滞した
- **発生局面**: 運用（case-auto orchestration の段階委任。GitHub Issue 書込み・Jev 評価は専有 Git スロットの保護対象外）
- **検知方法**: STEP-7 の git status で予定外の untracked Jev 観測ファイル 3件を発見し、観測 JSON の workflow/evaluationKind/sourceRevision とタイムスタンプを照合。続く issue_list で重複子 Issue 10件（#3466〜#3475）を検出し、Epic 本文の読み戻しで上書きを確認した
- **根本原因**: 同一 Root Case×同一段階の委任が single-flight 保護なしに再派遣された。専有スロットが Git 操作（merge/push）のみを保護し、GitHub Issue 書込みと Jev 評価を保護していなかった。後行実行は冪等再実行契約（既存子 Issue の検知・再利用）を履行しなかった
- **自律対応内容**: (1) 観測 ID・sourceRevision（merge 後 4389c49f）・子 Issue 作成順から後行を重複と特定し、先行（スロット付与・全タイムスタンプ先行）を正規とした。(2) Epic #3457 へ停止記録コメント（5984571855）を投稿し、本文を正規版（7子構成・正規状態 ready）へ復元、是正記録を構成推論の根拠へ追記した。(3) 重複子 #3466〜#3475 を not_planned でクローズした。(4) 後行の Jev 観測 3件は事実記録として削除・書換えせずそのまま commit した。(5) 本知見と具体的修正対象（orchestration の再派遣ガード）を Split Rule で分割保存した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（契約上の権威配分に変更なし。case-auto Design の派遣制御見直し候補は intake item 2026-10-05-case-auto-double-dispatch-race.md に分離済み）
- **横展開観点**: 並行列挙で予告なく増える domain state ファイル（jev-observations 等）は並走実行の最初の信号。段階委任の成果物を書き込む前に、対象 Issue の読み戻しと自分の成果物の存続確認（自分が最後に書いた内容が現存するか）を行うことで lost update を早期検出できる
- **再発条件**: 委譲先の応答が長時間に及んだ際に親がタイムアウト再派遣する、または複数経路から同一 Root Case の段階が同時に起動する場合。Git 操作以外の書込み（Issue・PR・観測）には専有スロットが効かない
- **予防策候補**: 段階委任への single-flight 保護（同一 Root Case×同一段階の実行中再派遣禁止、または再派遣前に既存実行の成果物・観測を検知して再利用）、GitHub 書込み前の読み戻しによる楽観的競合検出、冪等再実行契約の機械検証
- **想定反映先**: case-auto Design（派遣制御・停止理由分類）、agentdev-workflow-case-open/case-ready の冪等再実行手順（既存子 Issue 検知の前置）
- **関連**: Epic #3457（コメント 5984571855）、子 Issue #3459〜#3465（正規）・#3466〜#3475（重複クローズ）、PR #3458、Jev 観測 20261004T211249Z-12d1 他5件、.agentdev/intake/inbox/2026-10-05-case-auto-double-dispatch-race.md
- **タグ**: `#orchestration` `#race-condition` `#idempotency` `#case-ready`

