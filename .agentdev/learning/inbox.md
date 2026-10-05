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

---

## 並行実行時のbun testフル suiteで corpus 系テストが回転的に timeout fail する事象とその由来分類

- **問題事象**: case-close（Root Case 3454）の QG-4 full integrity suite 分割①（2672テスト）で IR-071（7813ms）と known-gap registry exemption（5078ms）が bun test の既定 per-test timeout 5000ms を超えて fail した。直前の main root 実行（2683テスト）では別のテスト（bootstrap-report 7891ms、REQ-018-003 系）が同種の timeout fail しており、fail テストが実行ごとに入れ替わる回転性があった
- **発生局面**: 運用（case-close STEP-3 の full suite 実行。同一 Windows マシンで複数 Case の実行が並走していた）
- **検知方法**: stderr 退避ファイルの fail 一覧と「^ this test timed out after 5000ms.」行、直前実行の退避ログ（main root の stderr-1-main.log 等）との比較
- **根本原因**: corpus 全体を走査する低速テストは単独実行でも数秒かかり、並行セッションが CPU と IO を占有すると 5000ms の閾値を超える。どのテストが閾値を超えるかは負荷次第で、実行ごとに fail が入れ替わる。テスト対象の内容とは無関係
- **自律対応内容**: QG-4 の fail 由来分類証跡手順に従い、(1) 失敗テストファイルの単独再実行（check_integrity.test.ts は単独で176/176合格、状態依存を確認）、(2) baseline commit 9ae2d8e3 の detached worktree で内容起因4件（TS-007×2、TIM 対応宣言コーパス、issue_tracking_list）の同一再現を確認し pre-existing と分類、(3) baseline フル実行で timeout 不発生を確認し、timeout 2件を環境依存（負荷）と分類して由来不明0件で受理した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の QG-4 fail 由来分類手順の適用事例）
- **横展開観点**: フル suite で実行時間表示が5000ms 前後の低速テストが回転的に fail するときは、まず負荷依存 timeout を疑う。単独再実行で合格すれば内容起因ではない。main root に前回実行の退避ログが残っていれば比較のみで「前回も失敗」「前回は失敗していない」を即時判定できる
- **再発条件**: 複数セッションでの bun test フル suite 並行実行。単独実行5秒超のテストの比率が高いほど発生しやすい
- **予防策候補**: 低速テストへの bun test timeout オプション指定、corpus 系テスト側の per-test timeout 設計、timeout 検出時の fail 対象のみの再実行（既存証跡手順の位置づけ）
- **想定反映先**: agentdev-quality-gates の QG-4 fail 由来分類節（分類事例の補遺）
- **関連**: Issue 3454、PR 3481、対応記録コメント 5987025958（検証差分に分類の要約を記録）
- **タグ**: `#bun-test` `#timeout` `#fail-origin-classification` `#case-close`

---

## REQ 行改番時の旧参照追随スイープが related_req と本文括弧書きの2層で漏れる事象とその検出契機

- **問題事象**: Case 3457（Epic・Wave 1 子 Issue 3459）の REQ 行 ID 改番（重複 REQ-010-070 解消、新規検査クラス追加行を REQ-010-080 へ採番）に伴う旧参照追随で、Definition 適用（PR 3458）と事前検証 GAP-1（IR-066 ルール文書）で計3件を修正した後も、case-close の QG-4 完了条件独立再評価で IR-068 description 内の括弧書き言及と IR-070 related_req 第3項の2件（GAP-3）が残存していた。commit 78cf5df4 で解消した
- **発生局面**: 運用（case-close STEP-2 の完了条件単位最終評価。改番を伴う Definition 適用 Case のクローズ時）
- **検知方法**: 完了条件「改名行を指す旧参照の grep」を case-close が別コンテキストで再実行し、残存 REQ-010-070 言及を出所（作成時点 commit 6e549c7b では REQ-010-070 が新規検査クラス追加行を指していたこと）と意味論（REQ 番号ギャップ検査行とは無関係な checker 採用由来の参照であること）から分類した
- **根本原因**: 行 ID 改番の追随スイープが related_req フィールド（AUTOGEN 起点）と README 索引に偏り、ルール文書 description 本文中の行 ID 括弧書き言及、および related_req の意味論（どの行のプログラムで採用された checker か）までは確認していなかった。旧番号が現行でも別行（REQ 番号ギャップ検査行）として生存しているため、機械的な行 ID 存在性検査（broken-req-ref・unknown-req-refs）では陳腐化参照を検出できない
- **自律対応内容**: GAP-3 の2件を REQ-010-080 へ修正し rule-ownership AUTOGEN を再生成して PR 3480 へ包含した。あわせて事前検証 GAP-1 記録の「IR-070 はギャップ検査行への正規参照」という分類を撤回・訂正した（PR 本文検証差分に明記）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の AG-005 完了条件「改名行を指す旧参照残存 0 件」の適用）
- **横展開観点**: REQ 行の改番・リネーム・統合を伴う Definition 適用では、(a) related_req フィールド、(b) ルール文書・Design 本文中の行 ID の prose 言及（括弧書き含む）、(c) 旧番号で生存し続ける行との意味論的な参照先判別、の3点をスイープ対象にする。旧番号が別行として残る場合は存在性検査が無効であり、prose 言及は作成時点の git 履歴で旧番号が何を指していたかを確認してから判定する
- **再発条件**: REQ 行の改番・行 ID リネーム・行統合を伴う Definition 変更の適用時
- **予防策候補**: 改番を伴う Case の完了条件展開時に「作成時点履歴照合を含む prose 言及の残存確認」を検証方法へ織り込む。中期的には prose 内行 ID 言及と related_req の整合を検査する checker 拡張の検討（本 Case の対象外であり、構造検査の検討課題として本記録に留める）
- **想定反映先**: 行採番規律（numbering-and-validation.md）、integrity ルール文書のメタデータ運用
- **関連**: Issue 3459、PR 3480（commit 78cf5df4・squash merge fecca28d）、Epic 3457、Definition PR 3458
- **タグ**: `#req-renumbering` `#stale-reference` `#case-close` `#qg-4`


