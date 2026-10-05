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

---

## extension rule の一時ファイル指示が workspace 外書込み guard と競合する（project root 内一時領域への切替）

- **問題事象**: Case 3484 の case-open（Root Case 本文候補の書込み前 lint）で、extension rule（agentdev-workflow-case-open.yaml の yomiyasu-application-before-write）が「検査専用本文ファイルを非永続領域〔一時ディレクトリ等のリポジトリ外〕に新規作成」を指示した一方、write ツールによる C:\WINDOWS\TEMP\opencode への書込みは workspace 外書込み guard により fail-closed ブロックされた。
- **発生局面**: 運用（case-open STEP-2 の GitHub 書込み前 yomiyasu lint）
- **検知方法**: write ツールの fail-closed ブロック（write targets a path outside the project root）
- **根本原因**: extension rule の指示（リポジトリ外一時ディレクトリ）と workspace 外書込み guard（project root 外の書込み禁止）が同一工程内で競合する。正規配置契約（worktree-operations.md の .agentdev/tmp/ 統一配置、case-open scripts README の workspace 外 temp 禁止・project root 内限定）と extension rule の文言が不一致である。
- **自律対応内容**: guard ブロック後に別 API 経路での迂回を行わず、bash ツール経由の heredoc による事前承認済み一時領域への検査専用本文ファイル作成へ切替した（bash リダイレクトは PowerShell cp932 再符号化の対象外）。検査後にファイルを削除した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: extension rule が一時ファイル作成を指示する工程では、指示の置き場所が guard 契約（workspace 外禁止・project root 内限定・.agentdev/tmp/ 統一配置）と整合する文言になっているかを適用前に確認する。
- **再発条件**: extension rule が「リポジトリ外」を含む一時ファイル置き場所を指示し、write ツールで実行する場合
- **予防策候補**: extension yaml の指示文言を「project root 内の実行時作業領域（.agentdev/tmp/ 等の gitignore 対象領域）」へ整合させる（intake item として記録済み）。
- **想定反映先**: .agentdev/extensions/skills/agentdev-workflow-case-open.yaml の rules 文言
- **関連**: Issue 3484、worktree-operations.md「退避ファイルの統一配置（.agentdev/tmp/）」
- **タグ**: `#writing-guard` `#extension-rules` `#case-open` `#yomiyasu`

---

## session由来RU の generation_actor 契約固定値と実測記録の差異は承認の読み替えでなく記録で解決する

- **問題事象**: RU-0160（session由来）の generation_actor が supervisor と記録され、session由来RU 契約の固定値 req-define-parent と差異があった。配置許可を契約改訂の承認として扱わない旨の条件付きで case-open へ投入された。
- **発生局面**: 運用（case-open STEP-1 前の引き継ぎ確認）
- **検知方法**: 委譲 prompt の構造化文脈（制約・契約）と RU frontmatter の突合
- **根本原因**: session由来RU の作成主体が supervisor の場合、契約固定値との差異が契約変更なしで後工程への解決指示として持ち越される運用になっている（正規契約は不変のため、差異の取り扱いが後工程責務として残る）。
- **自律対応内容**: 配置許可を契約改訂の承認として扱わず、正規契約（固定値 req-define-parent）を変更せず、差異を既知差異として完了報告へ記録し後工程（case-ready）へ引き継いだ。RU 本体・draft への改変は行わなかった。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（正規契約は不変）
- **横展開観点**: generation_actor 等の契約固定値と実測記録の差異は、後工程で「承認の読み替え」ではなく「既知差異の記録と契約不変の明示」で解決する。
- **再発条件**: supervisor が session由来RU を作成・配置した後の後工程実行
- **予防策候補**: session由来RU 契約に supervisor 作成時の記録値の扱い（差異許容と記録方法）を明文化する。
- **想定反映先**: session由来RU 契約（artifact-contracts.md の RU 採番・記録規定系）
- **関連**: RU-0160、Issue 3484
- **タグ**: `#ru-contract` `#generation-actor` `#case-open`

---

## artifact_actions の update content が target_area 節の現行内容を全含しない場合、節置換は合意外の既存内容を削除する

- **問題事象**: draft（RU-0161 由来）の ACT-DESIGN-006 content が target_area「### repo-local Plugin の配布・投影契約」節の現行内容の一部（outside-root 判定段落）を含んでいなかった。content で節全体を置換すると、合意に含まれない既存内容が黙示的に削除される状態だった
- **発生局面**: 運用（case-open STEP-3 の Definition 適用。Design target_area 置換）
- **検知方法**: artifact_actions 適用前の target_area 節の実取得（read）と draft content の突合。節の現行内容のうち content に対応行のない段落を検出した
- **根本原因**: draft 生成時（req-define）の update 操作の content が節の部分差分として作成され、操作種別（update = 節置換）との組合せで削除リスクが暗黙化していた。draft の reviewed 合意では target_area 置換の削除含意が明示されていなかった
- **自律対応内容**: 節全体置換を避け、既存段落を保持した最小追加（textlint 関連 bullet のみの追加）へ適用方式を変更して削除を回避した。保持判断（合意外の既存段落の削除なし）を Definition PR 本文の完了条件へ記録した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存内容の保持は合意範囲内の忠実性確保）
- **横展開観点**: artifact_actions の update 操作では、content が target_area 節の現行内容を全含しない限り、節置換は既存内容の削除を含意する。適用前に現行節と content の差分を必ず実取得して照合する。逆方向（content 側にだけある行の追加）と併せて diff 突合が素早い判定になる
- **再発条件**: req-define が update 操作の content を部分差分として生成し、後続工程が target_area 置換を機械的に実行する場合
- **予防策候補**: req-define の artifact_actions 生成契約へ「update 操作の content は target_area 節の現行内容を全含する、または削除対象行を明示する」の追加と、case-ready の適用前検証（手順 1.5）への節内容差分突合の明文化
- **想定反映先**: artifact-contracts.md の req_draft 出力構造（artifact_actions 形式）、case-open Design（適用前検証）
- **関連**: RU-0161、Issue #3486、PR #3489
- **タグ**: `#draft-schema` `#target-area` `#artifact-actions` `#case-open`

---

## Definition PR の品質検査記録が coverage 対象外の既存行の missing-design を検出できず case-ready STEP-2 で表面化する事象

- **問題事象**: Definition PR #3489 本文の品質検査記録が「traceability check: missing-design 0 件（対象: REQ-053-041〜048、REQ-053-016、REQ-053-032）」と記録していた一方、case-ready STEP-2 で merge 後 canonical（origin/main 7f278d81 の detached worktree）に対して同対象の check を機械実行したところ missing-design 2件（REQ-053-016、REQ-053-032）を検出した。coverage --req 実測でも REQ-053-016/032 の design role 対応は 0 relations（implementation 5件・verification 2件のみ）だった
- **発生局面**: 運用（case-open STEP-3/4 の Definition Package 品質検査記録 → case-ready STEP-2 の canonical 再取得時 traceability check 機械実行）
- **検知方法**: merge 後 canonical worktree での check 再実行（PR 記録との再現突合）。case-open worktree（.worktrees/3486-definition、HEAD c3208c1a）での同一コマンド再実行でも同一結果を再現し、実行環境差異ではなく corpus の実在状態の差異と確定した
- **根本原因**: REQ-053-016/032 の design 対応宣言が sidecar（traceability/agentdev-textlint-guard.yaml。implementation/verification role のみで design role 不在）にも inline ADF-COVERS(design) にも存在しなかった。両行は既存行であり design 対応 0 件は merge 前から存在する状態で、本 Case が UPDATE 対象行として check 対象に含めたことで初めて機械検出された。PR 側の coverage --req 実行対象が新規行 041〜048 に限定され、coverage 実測記録「14 relations 全行 design 対応あり」が 016/032 の design 欠落を検出できず、CR-001 の「design 対応事前確認実施済み・対応存在・欠落なし」記録と corpus 実在が乖離したまま品質検査記録が確定した
- **自律対応内容**: case-ready は STEP-2 差し戻し契約に従い ready へ遷移せず case-open へ差し戻して停止した（merge 巻き戻しは行わない。draft/RU 保持）。overlap 突合（横断依存検査警告: textlint-design-covers 共有領域）は REQ-053-016 の design 登録が実在しないことから実登録競合なしと確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（case-ready STEP-2 / STEP-6 の既存 missing-design ゲートの適用事例）
- **横展開観点**: Definition PR の品質検査記録は check --req の対象行集合と coverage 実測の対象行集合を一致させ、UPDATE 対象の既存行を含める。既存行を UPDATE する Definition では「その行の design 対応が merge 前から成立しているか」を事前確認する。UPDATE は行を check 対象へ新規に引き込む行為であり、潜在欠落の表面化を Definition Package 構成の欠漏として扱う（case-open STEP-2 のトレーサビリティポリシー追随確認の対象）
- **再発条件**: 既存 REQ 行を UPDATE 操作対象に含む Definition の case-open 生成・case-ready 受入。design 対応を持たない既存行が check 完全性検査の対象に加わる変更
- **予防策候補**: case-open の Definition Package 生成時に UPDATE 対象行を coverage --req / check --req の機械実行対象へ含める。design 対応 0 件の既存行を UPDATE 対象にする場合は design 宣言追加を同一 Definition Package へ含める（case-ready STEP-2 ゲートの再発防止）
- **想定反映先**: case-open Design（Definition Package 生成・品質検査の対象行集合規定）、agentdev-workflow-case-ready references/definition-acceptance.md（STEP-2 機械実行対象の明示）
- **関連**: Issue #3486、PR #3489（merge 7f278d81）、REQ-053-016、REQ-053-032、traceability/agentdev-textlint-guard.yaml
- **タグ**: `#traceability` `#missing-design` `#definition-acceptance` `#case-ready` `#case-open`

---

## Definition PR 受入ゲート（yomiyasu 適用記録）の突合が merge 後になった

- **問題事象**: case-ready STEP-1 で Definition PR（#3487）の受入検査（忠実性・整合性・品質検査、isDraft 確認）を実施して merge した後、project-extensions の workflow-extension（case-ready）の acceptance_gates に「Definition PR 差分に docs/** 日本語文章変更を含む場合、yomiyasu 適用記録が PR 上に存在すること。不足時は merge 前差し戻し」があることを検知した。PR 本文・コメントに yomiyasu 適用記録が存在せず、受入ゲートの突合を経由しないまま merge が成立していた
- **発生局面**: 運用（case-ready STEP-1 の Definition PR 受入）
- **検知方法**: merge 後の STEP-6 検証ゲートで project-extensions の workflow-extension context を読み込んだ際の acceptance_gates 突合
- **根本原因**: 受入検査の確認リストを STEP-1 reference（definition-acceptance.md）の3検査と isDraft 確認で構成し、merge 実行より前に project-extensions の acceptance_gates を読む前置確認が case-ready STEP-1 の手順に明示されていなかった。workflow-extension の読み込み位置が「検証ゲート横断依存検査の共有領域解決」のみに紐づいており、ゲート確認のタイミングが受入より後になっていた
- **自律対応内容**: merge 後のため巻き戻さず、事後補完として対象 Design セクション本文を一時ファイルへ抽出して yomiyasu_lint.py を実行（通常終了コード 0、スコア 95/100、指摘 1 件は ACT-DESIGN-001 合意済み契約構造由来のため保持）、適用記録（対象・実施結果・保持した指摘理由）を PR #3487 へコメント追記して受入ゲートの記録要求を事後充足した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（extension の受入ゲート要求の充足。merge 収録内容の変更なし）
- **横展開観点**: project-extensions の acceptance_gates は該当 workflow の受入・merge を伴う STEP（case-ready STEP-1 など）の前置確認項目に含める。workflow-extension の解決は共有領域解決だけでなく受入ゲート・rules の読み込み点でもある
- **再発条件**: docs/** 日本語文章変更を含む Definition PR を case-ready が受入する場合（merge を実行する全 Case）
- **予防策候補**: case-ready STEP-1 の merge 前確認手順へ「project-extensions の workflow-extension（case-ready）の acceptance_gates 突合」を前置項目として追加する
- **想定反映先**: case-ready workflow スキル（references/definition-acceptance.md の merge 前確認）、project-extensions 解決手順
- **関連**: Issue #3484、PR #3487、.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml
- **タグ**: `#case-ready` `#acceptance-gate` `#project-extensions` `#yomiyasu`

---

## 単独実行契約を持つ確認テストにフル実行前提のアサーションを入れると選択実行で失敗する

- **問題事象**: テストスイート内の計測・記録確認テストに「起動ログ非空」のアサーションを入れると、テスト名指定（`-t`）の選択実行で先行テスト不在により失敗する。フル実行でのみ成立する前提をアサーションに組み込むと、ファイル単体実行契約（選択実行でも成立する）を壊す
- **発生局面**: 実装（Case #3484 の check_integrity.test.ts 結果共有構造の起動回数確認テスト実装中）
- **検知方法**: 選択実行（`-t` 指定）での TS-002 単独実行確認中に当該テストが失敗
- **根本原因**: 記録確認テストの検査対象を「ログの非空」（フル実行でのみ成立）にしたことで、共有ゲッターの遅延初期化が当該テスト内で完結しない選択実行経路で前提が崩れた
- **自律対応内容**: アサーションを単独でも成立する条件（重複ゼロ）のみへ変更し、ログ非空確認を削除して再検証（フル実行 188 pass と選択実行 1 pass の両立を確認）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（テストスイート内部の実行形態。Design「check_integrity テストスイート内の結果共有契約」の単独選択実行契約と整合）
- **横展開観点**: 単独実行契約を持つ確認テストは、フル実行時のみ意味を持つ前提のアサーションを避け、単独でも成立する条件のみを検査する。集合状態を確認するテストは、対象集合の構築をそのテスト自身の遅延初期化で完結させる
- **再発条件**: 起動回数・ログ・カウンタ等の集合状態を確認するテストを、他テストの先行実行が存在する前提で書く場合
- **予防策候補**: 記録確認系テストの合格条件を「単独実行で成立する不変条件（重複ゼロ等）」に限定する規約を Design 側の実行形態契約に明記する
- **想定反映先**: checker 実行契約 Design「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節、integrity test suite の実装規約
- **関連**: Issue #3484、PR #3491（merge 9ecdb0dd）、PR 本文 learning 候補
- **タグ**: `#bun-test` `#テスト設計` `#選択実行` `#case-run`

## tsc のヒストグラム対照は同一実行形態（tsconfig・target）で行わないと新規エラー判定が誤る

- **問題事象**: case-close QG-4 の typecheck 独立再検査で、`bunx tsc --noEmit` に tsconfig・target を指定しない形（default target es5）で実行すると、変更前後でエラーコードヒストグラムが 1 件だけ不一致（TS2802 57→58、MapIterator spread）に見えた。package の型検査構成（target ES2022 の tsconfig 形）で同一対照を行うとヒストグラムは完全一致で新規 0 件だった
- **発生局面**: 検証（case-close STEP-2/3 の merge 直前 HEAD での typecheck 独立再実測・baseline 対照。Issue #3484）
- **検知方法**: baseline（f9029d91）への一時差し替え対照実行でのヒストグラム差分検出（+1 TS2802）
- **根本原因**: default target(es5) の tsc は MapIterator 等のイテレータ spread に対して TS2802 を構造的に大量生成する（baseline でも 57 件）。実行形態が package の型検査構成と不一致なまま対照すると、実行形態固有の差分を「変更起因の新規エラー」と誤判定し得る
- **自律対応内容**: package 設定と同一のオプション形（ES2022・types bun,node・strict 等）で HEAD と baseline を再対照し、ヒストグラム完全一致（新規 0 件）を確認。default target 形の差分は無効（実行形態アーティファクト）として検証差分へ記録し、判定から除外
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（QG-4 typecheck 検証の実行形態解釈。package 正規 typecheck〔-p tsconfig.distribution-boundary.json〕は exit 0 を維持）
- **横展開観点**: tsc 変更前後対照は、変更前後で同一の実行形態（tsconfig・target・ファイル集合）を使う。実行形態が記録されていない typecheck 証跡は、ヒストグラム単独では再現比較不能なため、実行コマンド（オプション明示）を証跡へ残す
- **再発条件**: tsconfig.json を持たない package 配下で tsc を明示ファイル指定・オプション指定なしで実行する場合（MapIterator、spread、import.meta 等の target 依存エラークラスを含む対象）
- **予防策候補**: typecheck 検証記録への実行コマンド（オプション・target・対象ファイル）明記を検証差分セクションの標準項目化する。baseline 対照時の実行形態一致確認を前置項目化する
- **想定反映先**: checker 実行契約 Design（tsc 実行形態）、agentdev-quality-gates QG-4 検証差分セクション規約
- **関連**: Issue #3484、PR #3491（merge 9ecdb0dd）、.agentdev/learning/deferred.md の LSP timeout 時 tsc --noEmit 代替記録
- **タグ**: `#typecheck` `#tsc` `#fail由来分類` `#case-close` `#qg-4`

## worktree の repo 全体 bun test 単一実行で textlint 一時 dictionary 競合疑いの fail が出る（正規形 3 分割実行では非再現）

- **問題事象**: worktree での repo 全体 `bun test ./`（カレントディレクトリトリビアな単一実行）が vendor build 後も textlint tests 38 件が temp `check.dat.gz` ENOENT で失敗。textlint plugin suite 単体実行では 133/133 pass
- **発生局面**: case-run の repository tests 実行（Case #3485、PR #3490）
- **検知方法**: `bun test ./` 初回 1293 pass / 40 fail → vendor build 後再実行で 1295 pass / 38 fail 残存。単独 suite 実行では症状が出ないため一時 dictionary の並列/cleanup 競合を疑った
- **根本原因**: 一時 dictionary（check.dat.gz）の並列実行/cleanup 競合が疑われるが原因確定は未実施
- **自律対応内容**: case-close QG-4 で bun test フル suite 正規形（3 cwd 分割実行・依存パッケージ前置・stdout/stderr 分離退避・timeout 明示）で merge 直前 HEAD を再実測し 3595 tests / 0 fail を確認。単一実行形態の fail は正規形外の実行形態由来として扱い、textlint ENOENT は正規形下で非再現（無効分類）として検証差分へ記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: bun test フル suite 正規形（3 分割実行・`./` prefix・cwd 統一）を守れば textlint 一時 dictionary 競合は観測されない。カレントディレクトリトリビアな `bun test ./` 単一実行は正規形違反であり、その fail を fail 証拠として合格判定に使わない
- **再発条件**: 同一 repo の worktree で正規形外の bun test 単一実行を行う場合（既に #3484 / #3486 でも同種の非正規形 fail 観測あり）
- **予防策候補**: bun test フル suite 正規形（3 分割実行）の遵守確認を検証記録の前置項目化し、正規形外実行の fail を由来分類の対象外とする基準を検証差分セクション規約へ明記する
- **想定反映先**: checker 実行契約 Design「bun test 実行形態契約」節、agentdev-quality-gates bun test フル suite 正規形（実行形態契約）
- **関連**: Issue #3485、PR #3490（merge ada63ed1）、PR 本文 learning 候補、Issue #3484 / PR #3491 の learning（並行競合疑いの先行記録）
- **タグ**: `#bun-test` `#textlint` `#worktree` `#fail由来分類` `#case-close` `#qg-4`

## Windows で依存生成済み worktree の git worktree remove が Filename too long で失敗する（node fs.rmSync での回復手順）

- **問題事象**: case-close STEP-6-1 の worktree 削除（Case #3486、plugin 依存生成済み〔bun install + build:engine 済み、node_modules と textlint vendor 辞書を含む〕）で `git worktree remove .worktrees/3486-case` が `error: failed to delete ... Filename too long` で失敗した。worktree list からは登録が外れるが `.worktrees/3486-case/` ディレクトリ実体が残存した。Git Bash の rm でも tmp 退避ログ等の一部パスが ENOENT として解決不能になり個別削除が不可だった
- **発生局面**: 運用（case-close STEP-6-1 の worktree/branch 削除。依存生成を実施した Case のクローズ）
- **検知方法**: git worktree remove の error 出力と、削除後の `ls .worktrees/` での残存ディレクトリ確認。worktree 登録（`git worktree list`）とディレクトリ実体の乖離を確認
- **根本原因**: Windows MAX_PATH（260 文字）制限。textlint vendor の辞書ファイル（kuromoji の charset 表等の長いファイル名）と node_modules の深い階層が連結して 260 超に到達し、git worktree remove が OS の削除 API 経由で失敗する。clean tree（git 管理変更なし）でも ignore 対象の生成物ごとディレクトリを削除するため生成物の長パスが障害になる
- **自律対応内容**: node の `fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 })` で残存ディレクトリを削除した（node は Windows で拡張長パス解決を行うため成功）。その後 `git worktree prune` と branch `-D` で整合を確保。definition worktree（依存生成なし・clean）は git worktree remove が通常どおり成功
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の worktree 削除手順への Windows 環境適用上の補足であり契約変更ではない）
- **横展開観点**: 依存生成済み worktree のクローズでは worktree 登録とディレクトリ実体が乖離し得る（登録は外れる・実体は残る）。乖離を検知したら node fs.rmSync → worktree prune → branch 削除の順で回復する。PowerShell cmdlet の一括読み書きと同系統の Windows パス処理問題であり、node の fs API が標準回復手段
- **再発条件**: Windows 環境で bun install・build:engine（vendor 生成）を実施した worktree を case-close STEP-6-1 で削除する場合
- **予防策候補**: agentdev-git-worktree の worktree 削除手順へ「依存生成済み worktree での remove 失敗時の回復手順（node fs.rmSync → prune）」を補足として追加する候補（skill 変更は別 Case 対象として本記録に留める）
- **想定反映先**: agentdev-git-worktree skill（worktree 削除手順の Windows 注意事項）
- **関連**: Case #3486、PR #3493（merge 6cf02f4c）、AGENTS.md 行動規範（PowerShell 一括 IO 禁止・node fs API 標準手段）
- **タグ**: `#windows` `#long-path` `#worktree` `#case-close`

## agentdev_gh の全操作が gh exit 66（stderr 空）で失敗し、OpenCode ホスト側の対処が再開条件になる

- **問題事象**: case-open（RU-0162 由来 draft、Root Case 未起票）で Custom Tool agentdev_gh の読み取り・書き込み全操作（issue_list〔同一操作の契約再試行 1 回を含む〕、issue_read、issue_create）が `gh exited with code 66; stderr is empty (non-zero exit with empty stderr may indicate a startup environment failure)` で一律失敗した。書込み操作は代替経路なし（fail-closed）のため Root Case 起票以降の全工程が停止した
- **発生局面**: case-open STEP-5 冪等検出（読取）と STEP-2 Root Case 起票（書込み）。agentdev_gh 経由の GitHub I/O 全般
- **検知方法**: Tool 応答の failure detail。セッション側の再現試験では同一の gh 呼出がすべて成功（bash の `gh api`、node spawnSync による `gh repo view`・`gh api`、cmd の `where gh` がいずれも status 0。gh 2.102.0 が PATH 上 `C:\Program Files\GitHub CLI\gh.exe` に存在し、AGENTDEV_GH_REPO・GH_TOKEN・GITHUB_TOKEN は未設定、`.opencode/tools/agentdev-gh/runner-local.ts` の Local 投影は不在で GitHub 実装側と確定）
- **根本原因**: 未確定（OpenCode プロセス内 plugin ホストの spawn コンテキストに起因する環境差を推定。セッション側からは到達不能）。exit 66・stdout・stderr のいずれも空で、gh の認証失敗・API エラー・PATH 不在の通常の失敗様式（stderr 付き・exit 1/4・spawn ENOENT）のいずれとも一致しない
- **自律対応内容**: 同一操作の再試行 1 回→別操作（issue_read）での疎通確認→gh CLI 読み取り専用 fallback 契約による冪等検出の完了（既存 Root Case・Definition PR なしを確認）まで実施し、書込みは issue_create の 1 回失敗で停止した（ループ retry 禁止の遵守。書込みの gh CLI 代替は契約禁止）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Custom Tool 契約・fallback 区分の変更なし）
- **横展開観点**: 同一の失敗様式（exit 66・空 stderr・全操作共通・セッション側 gh は正常）を検知した場合、同一操作の再試行は 1 回までとし、書込みは即時に停止して OpenCode ホスト側の対処（ホスト再起動による plugin 再初期化）を再開条件にする。読み取りのみの工程であれば gh CLI fallback 契約で継続できる
- **再発条件**: OpenCode プラグインホストの spawn コンテキストで gh の起動が失敗する環境（同一ホストの全セッションで再現し得る）
- **予防策候補**: OpenCode ホスト起動時の agentdev_gh 疎通確認（読取 1 操作の起動時確認）と、failure detail への再開手順（ホスト側対処の案内）追記
- **想定反映先**: agentdev-gh README（失敗分類の診断ガイド）、docs/knowledge/（git 非対話認証知識の隣接領域）
- **関連**: RU-0162 の case-open（blocked、Root Case 未起票）、入口 commit 96bdec73（draft・Jev 観測の先行永続化済み）
- **タグ**: `#agentdev-gh` `#opencode` `#fail-closed` `#case-open` `#blocked`
