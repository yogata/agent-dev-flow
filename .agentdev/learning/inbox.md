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

---

## トレーサビリティ対応宣言の inline・sidecar 二重宣言は集合完全一致契約で即検出されることの経験知

- **問題事象**: Case 3457（Epic・Wave 1 子 Issue 3460）で traceability sidecar への対応宣言追加（REQ-018-002 design・REQ-099-001 verification）を sidecar 単独で行ったところ、同一論理関係（artifact × role）の inline ADF-COVERS 宣言との REQ 集合差分が duplicate-inconsistencies 2 件として即検出された。inline 側へ同一 REQ を追記して集合を完全一致させた後、check は pass した。
- **発生局面**: 実装（case-run・sidecar/inline 対応宣言の追加）
- **検知方法**: traceability check --req の中間再実行で duplicate-inconsistencies が fail として検出（PR 3478 本文検証差分セクションの中間行に記録）
- **根本原因**: 同一 artifact × role に inline declaration と sidecar の両方が存在する場合、check は両情報源の REQ 集合完全一致を契約として要求する。sidecar への新規 REQ 追加だけでは既存 inline 宣言との集合差分が矛盾状態になる。
- **自律対応内容**: inline 宣言行へ同一 REQ を追記し、inline と sidecar の集合を完全一致させた（traceability の inline declaration 優先規則に従い、sidecar 側の重複解消ではなく集合一致の方針）。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（traceability モデルの既存契約（duplicate-inconsistencies 検査・inline declaration 優先規則）の適用確認に留まる）
- **横展開観点**: sidecar へ対応宣言を追加する場合は、同一 artifact × role に既存 inline ADF-COVERS 宣言が無いかを事前確認し、存在する場合は inline と sidecar の両側へ同一 REQ 集合を反映する。片側のみの追加で intermediate check を回さない場合は merge 前の最終 check で確実に fail する。
- **再発条件**: inline 宣言が既存の artifact へ sidecar 経由で対応宣言を追加する変更
- **予防策候補**: sidecar 編集手順に「同一 artifact × role の inline 宣言存在確認と集合一致反映」を前置する（agentdev-traceability の sidecar-and-policy 手順への反映候補）。
- **想定反映先**: agentdev-traceability references/sidecar-and-policy.md の対応宣言追加手順
- **関連**: Issue 3460、PR 3478（squash merge commit 83d48e86）、Epic 3457
- **タグ**: `#traceability` `#sidecar` `#duplicate-inconsistencies` `#case-run`

---

## GitHub Issue 本文を決定的エンジンへ手書き転写する経路の転写誤字リスクと書き込み前照合の効用

- **問題事象**: Case 3460 の case-close（Epic 実行構成表更新）で、issue_read で取得した Epic 3457 本文（約21KB）を決定的エンジン（reflect.ts closing）の入力ファイルへ手書き転写したところ、「実装面交差なし」を「実面交差なし」と脱字した。エンジン適用前の転写内容確認で検出・修正し、Epic 本文への誤った反映は発生しなかった。
- **発生局面**: 運用（case-close STEP-6-2・Epic 実行構成表の per-Epic 単一書き手更新）。GitHub I/O を持たない決定的エンジンへ本文を渡す経路全般
- **検知方法**: エンジン実行前の転写ファイル内容と issue_read 取得原文の照合（差分確認）
- **根本原因**: agentdev_gh の操作引数は文字列で受け渡すため、長い本文を会話コンテキストからファイルや引数へ転写する工程が不可避で、この転写が人手同等の写経になり得る。既存の PowerShell bulk IO 腐敗知識は機構的符号化を対象としており、エージェント自身の転写ミスは対象外。
- **自律対応内容**: 転写誤字をエンジン適用前に修正し、更新後本文の該当行を再確認してから issue_update に渡した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 長文本文をエンジン入力や Tool 引数へ転写する場面（Epic 実行構成表更新、Issue 本文の結果セクション適用等）では、書き込み前に転写結果と取得原文の照合を1回挟む。特に本文中の技術用語（実装面、正規状態等）は一部欠落しても気づきにくい。
- **再発条件**: GitHub Issue 本文の全文転写を伴う決定的エンジン適用または Tool 操作引数の組み立て
- **予防策候補**: 転写後・書き込み前の原文照合を case-close の Epic 更新手順に明示する（agentdev-epic-tracker references の手順反映候補）。
- **想定反映先**: agentdev-epic-tracker references/epic-reflect-coordination.md の最新取得→マージ→更新手順
- **関連**: Issue 3460、Epic 3457、case-close（commit 83d48e86 のクローズ処理）
- **タグ**: `#epic-tracker` `#transcription` `#case-close` `#deterministic-engine`

---

## main root での修正版テスト直接実行と非干渉契約の緊張（決定的再実行と post-merge 直接実行の分担で解消）

- **問題事象**: Issue 3463 の完了条件の検証方法「該当テストを main root・worktree 両環境で実行」について、実行担当サブエージェントの非干渉契約（worktree root 配下でのみファイル編集）により、main root では修正版テストコードの直接実行ができない。case-run では「修正版ロジックを main root の正規配置パス・実データへ適用する決定的再実行」で代替した。
- **発生局面**: case-run / case-close での両環境検証（worktree 検証の環境差是正。Issue 3463・PR 3477）
- **検知方法**: 完了条件の検証方法と非干渉契約の突合
- **根本原因**: main root 環境を要する検証方法と、実行担当の main root 編集禁止が衝突すると、検証方法の実施形態を実行ごとに場当たり的に決めることになる
- **自律対応内容**: case-run 側は決定的再実行で代替し、case-close 工程で main を最新化した後の main root から正規 suite を直接実行して両環境 green を確定した（case-close は main root 編集を伴わない読取実行のため契約上の衝突なし）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（明文化候補の記録）
- **横展開観点**: 「main root・worktree 両環境で実行」を検証方法に書く完了条件は、実施形態（case-run で決定的再実行、case-close で post-merge 直接実行）を工程ごとに明記すると解釈の揺れが消える
- **再発条件**: 両環境実行を検証方法に持つ子 Issue の case-run / case-close
- **予防策候補**: checker 実行契約 Design または qg-4 への「両環境検証の工程別実施形態」明記（RU/learning 議論対象）
- **想定反映先**: docs/designs/integrity/checker-execution-contracts.md、agentdev-quality-gates references/qg-4-final-acceptance.md
- **関連**: Issue 3463、PR 3477（squash 763a05d5）、Epic 3457
- **タグ**: `#worktree` `#verification` `#case-close`
