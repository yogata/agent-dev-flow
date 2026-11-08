# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-11-07: measurement-convergence 補正値 (commitDate) と IR-072 検査値 (author date) の設計差による check_integrity NG 5件残存

- **問題事象**: case-open 機械工程（prepare_definition_pr.ts）の measurement-convergence step が REQ-117-011 契約どおり req-updated-freshness NG 対象 5 ファイルの frontmatter updated を commitDate（本日 2026-11-07）へ補正 commit したが、check_integrity（IR-072）は updated と「最終内容変更 commit の author date」の突合を要求するため、補正値（2026-11-07）と検査要求値（author date・2026-11-04/2026-11-05）の設計差で IR-072 NG 5件が残存し、script は補正前報告の判定のまま failure 終了した
- **発生局面**: case-open STEP-4 設計PR 機械工程（Case #3961 / PR #3962・Definition branch definition/issue-3961）
- **検知方法**: prepare_definition_pr.ts 報告 JSON の check_integrity fail step と warnings（"check_integrity failed"）＋ 手動相当手順での check_integrity 再実行（exit 1・新規管理外 NG 5件「req-updated-freshness: frontmatter updated (2026-11-07) does not match the last content-change commit date」）
- **根本原因**: measurement-convergence step の補正値契約（REQ-117-011「計測日収束」: updated を commitDate へ進行）と IR-072 の検査契約（updated = 最終内容変更 commit の author date 突合・frontmatter のみの変更 commit 除外）が設計差を持つ。REQ-119-002 対象の「REQ ファイル名のみ報告形式の未捕捉」とは別の、補正値と検査値の不一致という新変種
- **自律対応内容**: 手動 contingency 経路で対象 5 ファイル（case-auto.md・case-run.md・req-define.md は 2026-11-04、v51-phase-transition-and-coexistence-model.md は 2026-11-05、req-health-metrics.md は本 branch 内容変更 commit 起因で 2026-11-07）の updated を IR-072 detection_method どおりの author date へ明示パス指定補正 commit（1f3c883db）→ check_integrity 再実行 exit 0（IR-072 該当 NG 0件・REQ-119-004 達成）
- **ユーザー確認の有無**: なし（workflow 内自律処置・既存 contingency 手順〔Case #3910 実績 commit 20a6eb9e8 と同型〕の適用）
- **REQ/Decision/Design影響**: REQ-117-011（measurement-convergence 契約の補正値と IR-072 突合値の整合検討）・REQ-119-004（IR-072 detection_method）・REQ-119-002（extractFreshnessTargets 対象抽出の拡張）
- **横展開観点**: measurement-convergence 同型の補正 step は case-ready / case-revise の機械工程 script にも存在し得るため、同一補正値契約の全域照合（prepare_definition_pr.ts 以外の機械工程 script の検査）
- **再発条件**: measurement-convergence の補正対象（req-updated-freshness NG ファイル）の最終内容変更 author date が commitDate と異なる Case で、convergence 補正後の check_integrity 再検査を経ずに設計PR を作成する条件
- **予防策候補**: measurement-convergence step の補正値を IR-072 detection_method（author date）へ統一するか、convergence 補正 commit 後の check_integrity 再実行を script 内 step として追加する
- **想定反映先**: req-define（要件化候補。REQ-117 系への追加行または新規 REQ）
- **関連**: REQ-117-011・REQ-119-002・REQ-119-004・Case #3961 / PR #3962・Case #3910（REQ-105.md 補正漏れ 5件・手動 contingency commit 20a6eb9e8・同型の手動救済前例）
- **タグ**: #measurement-convergence #ir-072 #case-open-機械工程 #freshness #check-integrity

---

## 2026-11-07: 検証用一時資材の台帳登録欠落が case-close 照合で 22件の未登録検出になり完了抑止

- **問題事象**: case-run が検証証跡を環境指定TEMP（adf-del-3961-1・66件）と .agentdev/integrity/reports/（本 Case 由来 21件）へ退避したが、検証用一時資材台帳（.agentdev/tmp/verification-resources/3961.json）への登録を実施していなかった（PR 本文は「台帳登録は委譲元が実施」と申告していたが実態は未実施）。case-close 照合（verificationResourceCheck）が gitignore 対象出力走査・OS TEMP パターン走査・dedicated-area 観測で未登録 22件を検出し、完了を抑止した
- **発生局面**: case-close STEP-2 完了判定工程（Case #3961）
- **検知方法**: close_mechanical_steps.ts 報告 JSON の unregistered-resource findings（gitignored-output・dedicated-area source 別）
- **根本原因**: 検証コマンドの stdout/stderr 分離退避が作成ヘルパー経由の作成時機械登録を経ていない
- **自律対応内容**: case-close が台帳へ後追い記録（registrationBasis=evidenced-occurrence-record・94件）を登録して照合を成立させ、回収（削除）は利用者明示確認事項として対応記録コメントへ削除提案として提示（回収未了のため close は機械境界で抑止継続）
- **ユーザー確認の有無**: なし（削除提案提示・確認待ち）
- **REQ/Decision/Design影響**: 検証用一時資材ライフサイクル Design（作成ヘルパー経由登録の運用浸透）
- **横展開観点**: case-run の証跡退避手順に台帳登録の接続が存在するかを全委譲契約で照合する
- **再発条件**: 証跡退避を環境指定TEMP・reports/ 配下へ直接書き出し、close 時まで台帳登録を省略する運用
- **予防策候補**: 検証コマンドの stdout/stderr 分離退避ヘルパーに台帳登録を統合する（退避と登録を同一手続で）
- **想定反映先**: req-define（REQ-032 系への追加行候補）
- **関連**: 検証用一時資材のライフサイクル Design「正規の作成経路」「回収」・Case #3961
- **タグ**: #検証用一時資材 #台帳 #case-close-照合 #証跡退避

---

## 2026-11-07: PR 本文検証差分の fail 明細粒度が機械受理基準の 1:1 突合に不足（記憶転記と実測転記の差）

- **問題事象**: PR 本文の検証差分が split3 fail を「installer 系 11件（scripts-behavior.test.ts 10件 + textlint-guard-distribution.test.ts 1件）」と記録したが、証跡の実測明細は scripts-behavior 9件 + textlint-guard-distribution 2件の内訳であった。機械受理基準（observedFailCounts と failureOrigins の fail 単位 1:1 突合）では明細粒度の実測記録が必要で、記憶に基づく内訳転記では突合が成立しない
- **発生局面**: case-close STEP-2 機械受理記録の組み立て（Case #3961）
- **検知方法**: failure-origin-count-mismatch violation（expected 12 / actual 11）＋ stage 3 証跡（adf-del-3961-1/suite-split3-r2.err の fail 行明細）と baseline detached worktree 再現確認（sb 9件・tgd 2件）の実測
- **根本原因**: PR 本文の fail 内訳が証跡の実測再確認ではなく記憶に基づく内訳で記録されていた
- **自律対応内容**: 実測明細から内訳を確定し機械受理記録を組み立て直した（11件の failureOrigins に baseline 再現記録を付与）
- **ユーザー確認の有無**: なし（workflow 内自律処置）
- **REQ/Decision/Design影響**: checker 実行契約 Design（件数突合と明細記録の粒度）
- **横展開観点**: 検証差分記録の fail 明細は必ず証跡ファイルの実測から転記する
- **再発条件**: 記憶・要約に基づく fail 件数・内訳の記録
- **予防策候補**: fail 明細転記に証跡参照義務（明細行の grep 出力添付）を検証差分規約へ明記
- **想定反映先**: agentdev-quality-gates（QG-4 受理条件の明細粒度明記）
- **関連**: checker 実行契約 Design「baseline 退避物と BaselineFile の役割分離と合否判定基準」・Case #3961
- **タグ**: #検証差分 #fail明細 #機械受理 #qg4

---

## 2026-11-07: worktree bundle 整備状態に依存する execution-form fail は merge 直前 HEAD 再実行で非再現（前段申告分類の固定化転写は観測と乖離する）

- **問題事象**: stage 3 split3 で観測された「エンジン配布ファイルに docs/ 具体パスと共有領域の具体パスが含まれない」fail 1件（workflow_body_contract.test.ts）は worktree の textlint-guard vendor bundle 整備状態に依存し、case-close の merge 直前 HEAD 再実行では観測されなかった。baseline 90842e944 detached worktree（bundle 未整備）でも非再現、main root（正規環境）では pass
- **発生局面**: case-close 機械受理記録の組み立て（Case #3961）
- **検知方法**: failure-origin-count-mismatch violation と baseline・main root 対照実行の実測
- **根本原因**: 環境依存 fail は実行環境の状態（bundle 整備時刻等）に依存し、前段申告の由来分類を固定して機械受理記録へ転写すると観測と乖離する
- **自律対応内容**: execution-form 分類を観測実態に合わせて除外し、残り 11件を pre-existing（baseline 再現記録付き）として記録し直した
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存契約どおりの由来分類運用）
- **横展開観点**: fail 由来分類は前段記録の引き継ぎではなく毎回の観測で分類する
- **再発条件**: 前段の fail 分類をそのまま申告記録へ転写する運用
- **予防策候補**: なし（機械側の 1:1 突合が既に逸脱を防ぐ）
- **想定反映先**: なし
- **関連**: checker 実行契約 Design「fail 由来分類」・Case #3961
- **タグ**: #由来分類 #execution-form #機械受理 #worktree-環境差

---

## 2026-11-07: pre-existing fail 3系統と対象範囲外 SKILL 旧文言残存 2件の問題記録（PR 本文 Findings の learning 転記・Case #3961 対象外）

- **問題事象**: (1) traceability_relied_diff.test.ts T6「後続消費経路の文書接続が存在する」が現行 v51 Design 実文と不一致（baseline 90842e944 でも再現・REQ-119 対象外）。(2) installer 系 11件（scripts-behavior.test.ts 9件: git clone checkout 3・tools/plugins projection 3・third-party drift 3 ＋ textlint-guard-distribution.test.ts 2件: vendor 欠落系）が baseline でも再現。(3) PR 本文 Findings 3 の REQ-119.md:14 prh 違反は case-close で表層是正済み（commit 87829d9d4・解消）。(4) 対象範囲外 SKILL 2ファイル（agentdev-workflow-case-run/SKILL.md L150・agentdev-workflow-case-open/SKILL.md L107）に REQ-119-007 と同由来の旧境界文言（「案件スコープの専用領域へ作成し」等）が残存
- **発生局面**: case-run Findings 記録と case-close 検証（Case #3961）
- **検知方法**: full integrity suite・textlint・grep 実測
- **根本原因**: (1)(2) は main 本体の既知欠陥。(4) は REQ-119 適用範囲（adapter SKILL.md と投影先）外の同種文言
- **自律対応内容**: (1)(2)(4) は改変せず記録のみ。(3) は表層是正で解消
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: (4) は REQ-119.md 備考の文言整合対象一覧化知見の適用候補
- **横展開観点**: (1)(2) は後続 Case（既知欠陥是正）の候補。(4) は文言整合の横断是正候補
- **再発条件**: なし（既存欠陥の記録）
- **予防策候補**: なし
- **想定反映先**: req-define（後続要求候補の下地として保持）
- **関連**: PR #3963 本文 Findings・Case #3961
- **タグ**: #pre-existing #既知欠陥 #文言整合 #capture

---

## 2026-11-08: prepare_definition_pr の計測日収束 trigger が checker 実出力の表記と不一致で発動せず、手動 contingency で救済（Case #3964）

- **問題事象**: case-open STEP-4 機械工程で check_integrity が 1 NG（index-generation-consistency: req-metrics 計測日 AUTOGEN が commit 前基準の 2026-11-07 のまま・期待値 2026-11-08）で fail した。script の measurement-convergence step は generate_indexes rerun のみを実行し、rerun 結果の派生物補正 commit と frontmatter updated 追随が発動せず、派生物が uncommitted のまま残った。baseline: 計測対象 commit 6ba37c9f7（definition/issue-3964 の Definition commit HEAD・PR #3965）、計測 2026-11-08、実行コマンド bun prepare_definition_pr.ts --input（check_integrity は commit 済み HEAD 対象）
- **発生局面**: 実装（case-open STEP-4 機械工程の check_integrity 後処理）
- **検知方法**: prepare-definition-pr 報告 JSON の check_integrity step fail と、計測日収束補正 commit 後の check_integrity 再実行（NG 0件確認）の実測
- **根本原因**: script の hasMeasurementDrift trigger 判定が正規表現 /IndexGenerationConsistency/（キャメル表記・reference 文書の表記に追従）である一方、checker（check_integrity.ts）の実出力は index-generation-consistency（ケバブ表記）で機械突合が成立せず、trigger 漏れとなった。trigger 条件の表記は下位 checker の実サンプル機械突合テストで固定されていなかった
- **自律対応内容**: reference（definition-pr-and-idempotency.md）の計測日収束手動 contingency に従い、(a) rerun 済みの req-health-metrics.md 計測日 AUTOGEN を明示パス指定で補正 commit、(b) 同ファイルの frontmatter updated を 2026-11-08 へ追随補正 commit、の後 check_integrity 再実行で NG 0件・新規 unmanaged NG 0件を確認（コミット 8f4053eb4・bd215ec33）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存 contingency 手順の履行。REQ-060 の bun test 実行形態契約・full integrity suite の3 cwd 分割正規形は変更なし）
- **横展開観点**: 機械化 step の trigger 条件は対象 checker の実際の出力表記に対する実サンプル機械突合テストで固定する。reference 文書の表記を信頼した trigger 実装は実出力と乖離し得る
- **再発条件**: commit 前実行の generate_indexes が旧 author date 基準の計測日を書く条件（計測日ずれ）が発生し、かつ checker 出力と trigger 正規表現の表記不一致が残る場合に再発する
- **予防策候補**: prepare-definition-pr.test.ts に checker 実出力文字列（index-generation-consistency のケバブ表記）を trigger 判定が捕捉することの機械突合テストを追加する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（hasMeasurementDrift 判定）と scripts/tests/prepare_definition_pr.test.ts
- **関連**: .agentdev/integrity/reports/prepare-report-3964.json・PR #3965 検証差分・Case #3964
- **タグ**: #計測日収束 #機械工程 #表記差異 #trigger漏れ #case-open

---
## 2026-11-08: case-close の Issue 本文更新（結果セクション）が終了判定記録の targetRevision を無効化し issue_close が fail-closed 拒否される（Case #3966）

- **問題事象**: STEP-5 で完了記録コメント投稿と本文結果セクション更新（issue_update）を行った後の issue_close が、Custom Tool agentdev_gh の終了前提検証で拒否された（verification-incomplete: 終了判定記録の targetRevision 2026-11-07T20:48:00Z ≠ 現行 Issue revision 2026-11-07T21:15:33Z。過去 accepted 記録の再利用拒否）。判定確定後に Issue 本文へ書込みを行う工程順序は、本文更新のたびに updated_at が進み、acceptance 記録の再生成（機械工程の再実行）を必ず要する
- **発生局面**: case-close STEP-5（完了記録の反映と Issue クローズ）
- **検知方法**: issue_close の Tool VERIFY 失敗応答（fail-closed 正規経路。誤クローズは発生せず）
- **根本原因**: 終了判定記録の targetRevision は対象 Issue の issue_read revision（updated_at）であり、判定確定後の本文更新（進行状況・結果セクション）が revision を進める。STEP-5 の手順順序（記録コメント → 本文更新 → issue_close）がこの再生成を前提にしていない
- **自律対応内容**: 判定入力（判定区分・母集団）は不変のまま、issueUpdatedAt を新 revision 2026-11-07T21:15:33Z へ更新した機械工程の冪等再実行で accepted 記録を再書出しし、issue_close を再実行して成功（exitCategory success・全 step pass の同一結果を再確認）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（終了判定記録の様式・再利用防止契約は REQ-118/Design どおり機能。issue_reopen による無効化の維持も含め意図どおりの fail-closed）
- **横展開観点**: case-close の STEP-5 手順は「本文更新を判定確定の前に配置する」か「issue_close 前の機械工程再実行（1回）を標準コストとして織り込む」かを手順側で明示すると、再実行の発生を計画化できる。targetRevision を判定確定時点で凍結する代替様式は、過去 accepted 記録再利用防止（issue_reopen 無効化）とのトレードオフ
- **再発条件**: 判定確定後に本文・ラベル等の Issue 更新を行ってから issue_close する全ての close で発生し得る（ Tool 側で機械検出・拒否されるため誤完了には至らない）
- **予防策候補**: close_mechanical_steps.ts の README/手順に「Issue 本文更新後の再実行が標準経路」であることの明記、または issue_close 前提検証のエラー応答への回復手順（入力契約の issueUpdatedAt 更新と冪等再実行）の案内追記
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/scripts/README.md・references/cleanup-and-capture.md（STEP-5 手順注記）
- **関連**: .agentdev/integrity/reports/issue-3966/mechanical-report-judged.stdout.txt（再実行報告）・Case #3966・PR #3976
- **タグ**: #case-close #終了判定記録 #targetRevision #fail-closed #手順順序

---

## 2026-11-08: close_mechanical_steps.ts の CLI runner が deleteFile を提供せず post-merge の reclamation step が常に fail-closed 報告になる（Case #3966）

- **問題事象**: post-merge 機械工程で reclamation.closeAcceptanceRecord を指定したところ、reclamation step が「mechanical runner does not provide deleteFile; reclamation cannot execute (fail-closed)」で fail（終了コード 1）。CLI 実行経路の MechanicalRunner には deleteFile が実装されておらず、CLI からは回収を実行できない。cleanup-worktree-branch は pass（worktree 削除・branch -d 成功）
- **発生局面**: case-close STEP-6（post-merge 機械工程の終了判定記録回収）
- **検知方法**: post-merge 報告 JSON の close-acceptance-reclamation step fail と終了コード 1
- **根本原因**: CLI main() の runner 構築（writeTextFile・mkdirRecursive・removeFile・gitCommonDir・sleep まで実装）に deleteFile が欠落しており、reclamation 指定時の回収実行面が CLI から恒常的に到達不能。回収実行の主体は case-close（モデル）であるため手動回収で回復可能だが、script 側の入力契約と runner 実装の不一致が毎回の fail-closed 報告として現れる
- **自律対応内容**: 記録の実在・内容確認（issueNumber・targetRevision・accepted・judgment の実測）→ 証跡退避（evidence dir）→ 明示パス削除 → 実不存在確認（ls で消滅検証）→ 報告。回収記録は対応記録コメントへ記録済み
- **ユーザー確認の有無**: なし（対象は機械工程自身が書出した自己終了判定記録。様式の正は検証用一時資材のライフサイクル Design「削除確認」節の自己記録区分）
- **REQ/Decision/Design影響**: なし（fail-closed どおりの動作。回収は設計どおり成立）
- **横展開観点**: runner の提供メソッド一覧と入力契約（reclamation 指定可否）の対応は、実サンプル実行（post-merge input fixture）で固定するテストがあると不一致を導入時に検出できる
- **再発条件**: CLI で reclamation.closeAcceptanceRecord を指定する全ての post-merge 実行で発生する（設計どおりの fail-closed 報告。回収自体は手動経路で完遂可能）
- **予防策候補**: CLI runner への deleteFile 実装追加、または validateInput / README で CLI 実行時の reclamation 非指定と手動回収手順を明示
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（main の runner 構築）と scripts/README.md
- **関連**: .agentdev/integrity/reports/issue-3966/mechanical-postmerge-report.stdout.txt・Case #3966・PR #3976
- **タグ**: #case-close #機械工程 #reclamation #runner実装差 #fail-closed

---
---

## 2026-11-08: git / bun への POSIX 風パス渡しの解釈差異（Windows 環境）で git worktree add が C:/tmp へ作成され bun install --cwd が ENOENT（Case #3967）

- **問題事象**: bash の $TEMP（/tmp）を git worktree add に渡すと git（Windows バイナリ）は C:	mp へ作成し、bun install --cwd は ENOENT で失敗する。bash のパス解釈と Windows バイナリのパス解釈の差異が一時 worktree 作成を破壊する
- **発生局面**: case-run QG-4 baseline 再現確認（detached worktree・TEMP 配下）
- **検知方法**: bun install の ENOENT エラーと git worktree list での意図しない作成先
- **根本原因**: bash の $TEMP は POSIX パス（/tmp）に展開されるが、git・bun（Windows バイナリ）は POSIX パスを C:	mp として解釈する。cygpath 変換なしの直接渡しが破綻
- **自律対応内容**: 誤作成領域（C:	mp・C:c）を削除し、git・bun には cygpath -m による mixed 形式（C:/WINDOWS/TEMP/...）の Windows パスを渡し、bash 内部操作は POSIX パスを使い分ける標準手順へ修正
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: QG-4 baseline 再現確認（detached worktree・TEMP 配下）の実行手順に前置知見として有用。bash スクリプト内で Windows バイナリへパスを渡す全経路に適用可能
- **再発条件**: Windows 環境で bash の TEMP/POSIX パスを git・bun へ直接渡す全ての実行
- **予防策候補**: baseline 再現確認手順テンプレートへ cygpath -m 変換の前置を明記
- **想定反映先**: agentdev-quality-gates の QG-4 checker 実測手順（baseline 再現確認の実行手順）
- **関連**: PR #3973 本文・Findings/Capture候補・Case #3967
- **タグ**: #Windows #パス解釈 #git #bun #baseline再現

---

## 2026-11-08: close_mechanical_steps.test.ts pin テストの baseline fail は Design 文言との読点差由来で、書出し側 Issue（#3966）merge で解消した（Case #3967）

- **問題事象**: 分割②（bun test ./src/common/skills/）で「終了判定記録の様式…契約行がライフサイクル Design に存在する」pin 期待値が Design 現行文言と読点差（様式は対象 Issue 番号、… vs 様式は、対象 Issue 番号、…）で不一致し baseline で fail（Case #3967 の検証時は pre-existing として由来分類）
- **発生局面**: case-run QG-4 full integrity suite 分割②
- **検知方法**: baseline 776805a25 detached worktree での単独再現確認（同一 fail 再現・変更由来でないことの実測）
- **根本原因**: pin テストの期待値が Design 本文の読点位置に依存しており、読み取り検証側（#3967）と書出し側（#3966・RA-001）が並列実行中のため期待値更新を自分の PR で行えなかった
- **自律対応内容**: 本 PR では pin 期待値を変更せず pre-existing 由来分類を記録。case-close で #3966 merge 後の fresh HEAD 再実測により 0 fail を確認し由来分類を撤回（解消確認として検証差分へ記録）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: 並列 Wave の兄弟 Issue が同一テストファイルを対象とする場合、fail の由来分類は「merge 後の fresh HEAD 再実測で解消確認してから撤回する」運用が有効。pin 期待値は Design 文言の句読点に依存しない書き方（正規化比較）にすると pin が安定する
- **再発条件**: 並列 Wave で Design 文言 pin テストの期待値が他 Issue の変更対象と重複する場合
- **予防策候補**: pin 期待値の正規化比較（句読点除去）への改修は書出し側 RA の対象範囲。依存する場合は対応宣言で明示
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts（書出し側の対象領域）
- **関連**: PR #3973 本文・Findings/Capture候補・Case #3967・Case #3966
- **タグ**: #pinテスト #読点差 #並列Wave #pre-existing #由来分類

---

## 2026-11-08: 配布依存境界 source profile の対象は src/common/{commands,skills,tools}/** と src/opencode/plugins/** であり tools/** を含む（Case #3967・case-close STEP-3）

- **問題事象**: PR 本文の品質メトリクス申告が「配布依存境界: 該当変更なし〔src/common/{commands,skills}/** に該当変更なし〕」としていたが、本 PR は src/common/tools/agentdev-gh/** を変更しており、source profile の正確な対象集合（lib/distribution-boundary-fs.ts の projection semantics: source/archive は src/common/{commands,skills,tools}/** + src/opencode/plugins/**）に含まれるため申告が見落としだった
- **発生局面**: case-close STEP-3（配布依存境界 最終 gate の trigger 判定）
- **検知方法**: STEP-3 実行時の detector 対象集合確認（distribution-boundary-fs.ts の projection 定義実読）
- **根本原因**: source profile の対象集合の理解が commands・skills に限定されていた（tools を含まない誤解）
- **自律対応内容**: case-close 側で gate を実行（check_distribution_boundary.ts --profile source・worktree HEAD 指定）し ok true・failures 0・rules ok を確認。検証差分（対応記録コメント）に申告の修正済みを記録
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（gate は合格・申告の見落としは工程間検証差分で補正済み）
- **横展開観点**: case-run の STEP-S5（配布依存境界 gate trigger 判定）でも同一の見落としが起き得る。trigger 判定は PR 変更ファイルと source profile 対象集合の交差で機械的に判定する（集合は lib の projection 定義が正）のが安全
- **再発条件**: src/common/tools/**・src/opencode/plugins/** を変更する PR で配布依存境界 gate をスキップ申告する case-run
- **予防策候補**: PR テンプレートの品質メトリクス申告欄に source profile 対象集合の注記（tools・plugins 含む）を追加、または trigger 判定の機械化
- **想定反映先**: agentdev-workflow-case-run SKILL・PR テンプレート（検証差分セクションの注記）・case-close references/docs-and-design-promotion.md
- **関連**: PR #3973・対応記録コメント（検証差分行1）・Case #3967
- **タグ**: #配布依存境界 #source-profile #trigger判定 #case-close #case-run

---

## 2026-11-08: bun test の件数サマリー・fail 明細は stderr 出力のため機械工程報告 JSON に含まれず、fail 由来分類には stderr 分離退避付きの script 外直接実行が必須（Case #3967）

- **問題事象**: close_mechanical_steps.ts の full-integrity-suite step は integrityResults に stdout のみを保持するため、bun test の fail 明細と件数サマリー（Ran N tests across M files）が報告 JSON から取得できない。fail 由来分類（IntegrityMachineAcceptanceRecord）の組み立てには 1 回目の実行だけでは fail 識別子が得られない
- **発生局面**: case-close pre-merge 機械工程（fail 由来分類の組み立て）
- **検知方法**: 1 回目の報告 JSON で failures 配列が空（fail 件数が不明）の実測
- **根本原因**: bun test は結果サマリーと fail 詳細を stderr へ出力する。機械工程の spawnSync は stderr を内部捕捉して捨てる（reference「機械工程 script 呼び出し自体のリダイレクトラップは bun test の stderr を内部捕捉するため証跡成立手段にならない」どおり）
- **自律対応内容**: script 外直接実行（stderr 分離退避・2> 常時付与）で 3 分割と file-level split を再実行し、fail 明細・N/M 件数を退避ファイルから取得して由来分類を組み立て、2 回目の機械工程実行で機械受理判定を確定。機械工程は（1）gates 実測・fail 観測（2）分類込み確定の 2 段階で実行した
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（reference の stderr 分離退避契約どおりの運用）
- **横展開観点**: 機械工程の 2 段階実行（1回目 gates 実測で fail 件数観測・2回目 integrityMachineAcceptance 込み）は fail がある Case の標準手順になる。機械工程は resume-idempotent なため再実行で契約整合を保てる
- **再発条件**: full integrity suite に fail が存在する全ての close 実行
- **予防策候補**: close_mechanical_steps.ts の integrityResults へ stderr の併せ持ち、または README へ 2 段階実行手順の明記
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts・scripts/README.md
- **関連**: Case #3967・機械工程報告 JSON（pass1〜pass4）
- **タグ**: #bun-test #stderr #機械工程 #fail由来分類 #2段階実行

---

## 2026-11-08: bun install 実施済み worktree の git worktree remove が部分失敗し unregister 完了後にディレクトリ残骸が残る（Windows・Case #3967）

- **問題事象**: textlint vendor 生成のため bun install を実施した worktree（.worktrees/3967-feature・node_modules 1437+ ファイル）で post-merge 機械工程の git worktree remove が exit 255 で部分失敗。unregister と branch 削除は成功したがディレクトリが途中まで削除された状態で残存（.git ファイル消失・src 配下 node_modules 残骸）
- **発生局面**: case-close STEP-6-1（worktree 削除・post-merge 機械工程 cleanup）
- **検知方法**: post-merge 報告 JSON の cleanup-worktree-branch step warn（worktreeRemoveExitCode 255）と残存ディレクトリの実在確認
- **根本原因**: Windows 環境で node_modules の大量ファイル（ロック・長パス）が remove の完全削除を妨げる。unregister は完了するため worktree list から消えるが、実ディレクトリの残骸が残る
- **自律対応内容**: 残骸の完全列挙（1437 ファイル・textlint-guard node_modules 由来＋checkout 残骸・.agentdev ドメイン状態混入なし・worktree は clean と機械工程が事前確認済み）を確認したうえで rm -rf で残骸を削除し、不存在確認まで実施（STEP-6-1 の remove 失敗時の掃除・再試行手順の適用）
- **ユーザー確認の有無**: なし（対象は自 Case が生成した依存実体と worktree checkout 残骸。削除対象の識別情報は列挙で確定）
- **REQ/Decision/Design影響**: なし
- **横展開観点**: worktree で bun install を実行する Case（依存パッケージ前置・vendor 生成）では、remove 前に worktree root 相対の node_modules 掃除を前置するか、remove 失敗後の残骸削除手順を標準コストとして織り込むのが安全
- **再発条件**: worktree 内で bun install・vendor 生成を実施した全ての Windows 環境 close
- **予防策候補**: agentdev-git-worktree の remove 前退避ファイル掃除手順に node_modules 残骸掃除の注記を追加
- **想定反映先**: src/common/skills/agentdev-git-worktree/references/worktree-operations.md（remove 前退避ファイル掃除節）
- **関連**: Case #3967・post-merge 報告 JSON
- **タグ**: #worktree #git-worktree-remove #Windows #node_modules #後片付け

---

## 2026-11-08: contractStateCheck.contractStatePaths に .agentdev/close-acceptance/ を含めると機械工程自身の終了判定記録が未コミット検出される（Case #3969・case-close pre-merge）

- **問題事象**: pre-merge 機械工程の contract-state-residue-check に contractStatePaths へ `.agentdev/close-acceptance/` を含めて実行すると、同一実行内で機械工程が書き出した終了判定記録（`issue-{N}.json`）自身が `uncommittedStateRecords` として検出され step が fail した
- **発生局面**: case-close pre-merge 機械工程（契約状態記録の範囲導出）
- **検知方法**: 1回目機械工程の報告 JSON（contract-state-residue-check fail・uncommittedStateRecords [".agentdev/close-acceptance"]）
- **根本原因**: `.agentdev/close-acceptance/` は git 履歴上で commit されたことがない管理対象外の終了判定記録配置（機械工程が書出し・終了判定に必要な期間だけ保護し post-merge で回収する契約）であり、「正規契約で git 管理対象と宣言される記録」の範囲導出に含めるべきでなかった
- **自律対応内容**: 2回目実行で contractStatePaths から close-acceptance を除外し、自己記録 `issue-3969.json` を humanConfirmedPaths（ファイル単位パス・帰属根拠 basis 付き）で確認記録。contract-state-residue-check pass（committed=true・humanConfirmationItems 0）を取得
- **ユーザー確認の有無**: なし（帰属は機械工程自身の書出し物として明確・確認根拠を basis に記録）
- **REQ/Decision/Design影響**: なし（現行契約どおりの範囲導出の運用補正）
- **横展開観点**: pre-merge 機械工程を実行する close の範囲導出は「git 管理対象と宣言される記録」に限定し、close-acceptance は範囲外とする。machineConfirmedPaths の機械側除外（excludedSelfAcceptanceRecordPath 相当）は worktree status 検査にのみ存在し contract-state-residue-check には存在しないため、呼出側の範囲導出が正確であることが前提
- **再発条件**: 範囲導出ヒントに close-acceptance が列挙されたまま機械工程を実行する close
- **予防策候補**: close_mechanical_steps.ts の contract-state-residue-check に自己終了判定記録の除外（pre-merge-local-state-check の excludedSelfAcceptanceRecordPath と同一機構）を追加
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts・SKILL.md 契約状態記録検査節の範囲導出注記
- **関連**: Case #3969・機械工程報告 JSON（pass1・pass2）
- **タグ**: #contract-state-residue #close-acceptance #範囲導出 #humanConfirmedPaths #case-close

---

## 2026-11-08: post-merge 機械工程の reclamation は CLI runner が deleteFile を提供せず fail-closed 報告となり手動回収経路が現行正常系（Case #3969・再観測）

- **問題事象**: post-merge 機械工程の close-acceptance-reclamation step が「mechanical runner does not provide deleteFile; reclamation cannot execute (fail-closed)」で fail 報告となった。CLI 直接実行形態の runner 実装は deleteFile を注入しないため回収ステップが常時 fail 報告になる
- **発生局面**: case-close post-merge 機械工程（終了判定記録の回収）
- **検知方法**: post-merge 報告 JSON（close-acceptance-reclamation fail・reclamation.error）
- **根本原因**: close_mechanical_steps.ts の CLI runner 実装に deleteFile が未実装（インターフェイスでは optional・未提供時は fail で報告する契約）。回収の機械実行経路と手動回収経路の接続は契約上 fail-closed 報告が正
- **自律対応内容**: 手動回収経路（現行正常系）で実施: 実在確認（`.agentdev/close-acceptance/issue-3969.json`）→ 証跡退避（機械工程報告 JSON の closeAcceptanceRecord〔targetRevision 2026-11-07T23:41:09Z・accepted true〕と完了記録コメントの機械工程 pass 記録）→ 明示パス削除 → 不存在確認
- **ユーザー確認の有無**: なし（削除対象は自 Case が生成した終了判定記録・識別情報は path で明確・#3966/#3967 close で確立済みの現行正常系の適用）
- **REQ/Decision/Design影響**: なし（REQ-118-008 の既存作業記録経路への報告で成立）
- **横展開観点**: #3966・#3967 close で同一の fail-closed 報告と手動回収経路を観測済み（learning inbox 記録済み）。CLI runner への deleteFile 注入は旧機構撤去後の設計判断領域であり、手動回収経路の標準化が現行
- **再発条件**: deleteFile 未提供の runner で post-merge reclamation を実行する全ての close
- **予防策候補**: scripts/README.md に手動回収経路（実在確認→証跡退避→削除→不存在確認）の標準手順としての明記
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/scripts/README.md
- **関連**: Case #3969・Case #3966・Case #3967・post-merge 報告 JSON
- **タグ**: #reclamation #deleteFile #手動回収 #fail-closed #case-close #再観測

---

## 2026-11-08: worktree で textlint vendor 伝播済みでも git worktree remove が部分失敗し残骸掃除が必要（Case #3969・#3967 と同一パターン再観測）

- **問題事象**: bun install を明示実施していない worktree（textlint vendor が main から伝播済み・node_modules 739 ファイル規模）でも post-merge 機械工程の git worktree remove が exit 255 で部分失敗し、unregister と branch 削除は成功したが src 配下の checkout 残骸（textlint node_modules を含む）が残存した
- **発生局面**: case-close STEP-6-1（worktree 削除）
- **検知方法**: post-merge 報告 JSON の cleanup-worktree-branch step warn（worktreeRemoveExitCode 255）と .worktrees/3969-feature 残骸の実在確認
- **根本原因**: Windows 環境で node_modules の大量ファイルが remove の完全削除を妨げる（bun install の明示有無に依存せず vendor 伝播があると発生）
- **自律対応内容**: 残骸の性質確認（.agentdev ドメイン状態混入なし・node_modules と checkout 残骸のみ・739 ファイル）を確認したうえで rm -rf で削除し、不存在確認まで実施（STEP-6-1 の remove 失敗時の掃除・再試行手順の適用）
- **ユーザー確認の有無**: なし（自 Case の worktree checkout 残骸・識別情報は列挙で確定）
- **REQ/Decision/Design影響**: なし
- **横展開観点**: #3967 分の学び（bun install 実施済み worktree の remove 残骸）の対象条件を「vendor 伝播済み」まで拡張する知見。remove 失敗後の残骸掃除は標準コストとして織り込むのが安全
- **再発条件**: textlint vendor が伝播した Windows 環境の worktree 削除全般
- **予防策候補**: agentdev-git-worktree の remove 前退避ファイル掃除手順に node_modules 残骸掃除の注記追加（#3967 分の予防策候補と同一）
- **想定反映先**: src/common/skills/agentdev-git-worktree/references/worktree-operations.md（remove 前退避ファイル掃除節）
- **関連**: Case #3969・Case #3967・post-merge 報告 JSON
- **タグ**: #worktree #git-worktree-remove #Windows #vendor伝播 #後片付け #再観測

---

## 2026-11-08: traceability check を MSYS 形式パス指定で bun 起動すると Module not found で中断する落とし穴の再観測（Case #3969・PR 本文 capture）

- **問題事象**: 前回委譲 DEL-3969-1 が traceability check を MSYS 形式パス（`/c/Users/...`）指定で bun 起動し Module not found で中断した残留記録を観測
- **発生局面**: case-run 実行委譲内（agentdev-traceability check 実行）
- **検知方法**: DEL-3969-2（回収委譲）冒頭の残留変更・一時ファイル確認（`.agentdev/tmp-traceability-check-3969.json` 検証失敗記録）
- **根本原因**: Windows 実行環境では `--root` に Windows 形式絶対パス（forward slash 記法推奨）を指定する前提に対し MSYS 形式を渡した。MSYS 形式は Windows プログラム側のパス解決で実在しない root として扱われ fail-closed 契約により検査対象が見かけ上全件欠落する
- **自律対応内容**: 回収委譲では残留一時ファイル（失敗記録）を実質確認のうえ削除し、検証経路を worktree 内 script パス（Windows 形式絶対パス指定）へ切り替えて完了。既存知識 `windows-checker-msys-path-argument.md` の対象領域に近い落とし穴の再観測として記録
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: 既存知識の適用例であり、恒常化の追加要否は promote 判断で評価する
- **再発条件**: 委譲先サブエージェントが bash のパス展開結果（MSYS 形式）を checker 引数へそのまま渡す場合
- **予防策候補**: 委譲 prompt に checker パス引数の Windows 形式絶対パス指定の注意を明記するか、既存知識への参照を委譲契約に組み込む
- **想定反映先**: docs/knowledge/windows-checker-msys-path-argument.md（再観測としての追記判断）・agentdev-workflow-case-run 委譲契約
- **関連**: Case #3969・PR #3975 本文 Findings/Capture候補・DEL-3969-1 残留記録
- **タグ**: #MSYSパス #traceability-check #委譲 #fail-closed #再観測

---

## 2026-11-08: 期待値結合テストの事前確認は pin 期待値文字列で直接 grep する（Case #3968・PR 本文 capture）

- **問題事象**: S3-7 事前確認を Issue 列挙の旧記述語句（作成ヘルパー・台帳・作成先拒否等）で grep したため、「作成先確認」「環境指定TEMP」を期待値とする pin（close_mechanical_steps.test.ts「作成先確認接続」）を事前検出できず、bun test 実行後に検出・追随更新した
- **発生局面**: case-run 実装委譲内（adapter SKILL 文言変更の S3-7 事前確認）
- **検知方法**: bun test 実行後の pin fail 検出（DEL-3968-1 PR 本文検証差分 3）
- **根本原因**: 語句を除去する変更の pin 事前確認を、除去語句そのものではなく周辺語句（pin 期待値候補）で行うべきところを Issue 列挙語句で実施した
- **自律対応内容**: bun test 実行後に pin を検出し同一 PR で期待値を追随更新（adapter 対象を除外）。Level 2 解消（DEL-3968-2）で最終的に main 版採用となり当該 pin は消滅したが、事前確認手法自体の改善知見として記録
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: 語句除去系変更では除去語句そのものではなく、周辺語句（作成先確認・環境指定TEMP 等）を pin 期待値候補として grep するのが確実
- **再発条件**:文言除去変更で pin 期待値を事前 grep せず bun test 後検出に頼る場合
- **予防策候補**: 実行委譲契約の test strategy 事前確認手順に pin 期待値候補語句での grep を明記
- **想定反映先**: agentdev-case-run-execution-adapter references/harness-delegation.md（test strategy 実行手順）
- **関連**: Case #3968・PR #3974 本文 Findings/learning 候補・DEL-3968-1 検証差分 3
- **タグ**: #pin追随 #期待値結合テスト #事前確認 #grep

---

## 2026-11-08: bun test 統合テスト系は worktree 環境で timeout fail が恒常発生・merge 後 branch では正規領域一時 worktree（detached・origin/main）で bun test 直接実行が pre-existing 判定の実測経路（Case #3968・PR 本文 capture）

- **問題事象**: scripts 統合テスト系（install/projection 系 11件）が worktree 環境で 2.2秒〜31秒 timeout fail を恒常的に発生させる（baseline でも同一結果）。冷キャッシュ初回実行の probe fail は再実行で判別可能
- **発生局面**: case-run / case-close の bun test フル suite（3 cwd 分割）実行
- **検知方法**: split3 の fail 明細と baseline 再現実行の同一結果照合（DEL-3968-1/3968-2 検証差分・case-close 検証差分）
- **根本原因**: worktree の junction 未伝播環境と統合テストの timeout 前提の相互作用（実行環境差）。コード欠陥ではない
- **自律対応内容**: pre-existing fail の由来分類を stash 復帰ではなく正規領域（.agentdev/tmp/）への一時 detached worktree（origin/main・bun install 不要で bun test 直接実行）で実測再現する経路を確立し、merge で main を取り込み済みの branch でも baseline 実測再現を機械的に立証できた
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（受理由件7 の baseline 再現確認記録〔detached-worktree・sameFailureReproduced〕の実測経路として活用）
- **横展開観点**: merge 取り込み済み branch での pre-existing 判定は、当該 baseline commit（origin/main）の一時 detached worktree での直接実行が最短経路。baseline commit 進行時は最新 origin/main での再現確認が安全
- **再発条件**: worktree での full suite 実行による環境固有 timeout fail の由来分類が必要になる場合
- **予防策候補**: qg-4 受理由件7 の baseline 再現確認手順に detached worktree 実測経路の具体例を追記する判断は promote 判断で評価
- **想定反映先**: agentdev-quality-gates references/qg-4-final-acceptance.md（受理由件7 運用補助）・agentdev-workflow-case-close 機械工程運用
- **関連**: Case #3968・PR #3974 本文 Findings/learning 候補・Case #3967 の stash 復帰経路（比較対象）
- **タグ**: #bun-test #timeout-fail #pre-existing #baseline再現 #detached-worktree

---

## 2026-11-08: pre-merge 機械工程の契約状態記録パスに終了判定記録（.agentdev/close-acceptance/）を含めない・機械工程自身が書出した記録の untracked 検出は humanConfirmedPaths で帰属確認する（Case #3968 close 実行）

- **問題事象**: 機械工程 pre-merge の入力 contractStateCheck.contractStatePaths に .agentdev/close-acceptance/ を含めた結果、機械工程自身が書出した終了判定記録（issue-3968.json）が未コミット・未追跡検出となり contract-state-residue-check が fail（exitCategory failure・accepted 記録書出し拒否）した
- **発生局面**: case-close STEP-2 機械工程 pre-merge 実行（契約状態残存検査）
- **検知方法**: 機械工程報告 JSON の contract-state-residue-check step fail（uncommittedStateRecords: .agentdev/close-acceptance）と issue_close の fail-closed 拒否（targetRevision 不一致とは別個の事象として先に発生）
- **根本原因**: 終了判定記録は恒久 commit 対象の契約状態記録ではなく一時保護記録（post-merge reclamation で回収・.agentdev/close-acceptance/ は git 履歴なし）であり、commit 済み検証の対象（正規契約で git 管理対象と宣言される記録）に含めるべきでなかった
- **自律対応内容**: contractStatePaths から close-acceptance を除外し、機械工程が書出した記録の untracked 検出（ファイル単位 .agentdev/close-acceptance/issue-3968.json）を humanConfirmedPaths（path + 帰属根拠 basis 実体：機械工程報告 JSON の close-acceptance-record step 記録）で確認して再実行 → residue committed=true・accepted 記録書出し成立
- **ユーザー確認の有無**: なし（帰属根拠が機械工程報告 JSON で機械的に立証可能な帰属確認）
- **REQ/Decision/Design影響**: なし（検証に伴う一時資材の取扱いと後片付け責任 Design の記録様式どおりの運用）
- **横展開観点**: 後続 close 群（#3970/#3971/#3972）で同様の入力組み立てをする際の標準形。終了判定記録は statePaths から除外し、検出時はファイル単位 humanConfirmedPaths で帰属確認する
- **再発条件**: contractStatePaths への終了判定記録ディレクトリ誤指定
- **予防策候補**: case-close 機械工程の入力組み立て手順に contractStatePaths の対象範囲（learning/intake/jev-observations 等の恒久契約記録のみ）を明記する判断は promote 判断で評価
- **想定反映先**: agentdev-workflow-case-close SKILL.md「完了判定の契約状態記録・未追跡残存検証」節の運用補助・references/issue-resolution-and-qg4.md
- **関連**: Case #3968 close 実行・機械工程報告 mechanical-report-premerge/premerge2
- **タグ**: #contract-state-residue #終了判定記録 #humanConfirmedPaths #fail-closed #case-close

---

## 2026-11-08: Windows + bun 環境で gate を spawnSync 経由の bun run で起動すると SIGTERM で落ちる・module import 経由 + process.exit(exitCode) ラッパが安定実行経路（Case #3968 close 実行）

- **問題事象**: agentdev-textlint-guard gate.ts を spawnSync（bun run gate.ts --json）経由で起動すると 300〜600 秒待機後 SIGTERM で終了し stdout 空となる事象が再現した（同 gate を bash 直接実行と module import 経由では 12〜300 秒程度で正常完了）
- **発生局面**: case-close 機械工程 textlintGate の実行経路選択（機械工程 script は GateCommandSpec を spawnSync 相当で実行する）
- **検知方法**: spawnSync ラッパ script の meta（timedOut: true・exitCode null）と bash 直接実行の成功（ok=true）との乖離
- **根本原因**: bun run の子プロセス生存・終了タイミング問題（checker 実行契約 Design「安定実行経路」節の既知事象の別形態）。モジュール import 経由では発生しない
- **自律対応内容**: gate を module import（await import(gate.ts)）で呼び出し runFinalGate を直接実行・証跡退避後に process.exit(result.exitCode) で明示終了するラッパ script を作成し、textlintGate の実行体として機械工程へ渡した（exit 0・12 秒・完了確認）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（checker 実行契約 Design「安定実行経路」の例外経路〔process.exit 前の stdout flush 保証〕の適用）
- **横展開観点**: 機械工程の GateCommandSpec で TS checker を bun 起動する場合、安定実行経路は module import 経由のラッパ（process.exit 付き）を command に指定する構成
- **再発条件**: Windows + bun で CLI 起動形式（bun run <script>）を spawnSync 経由で使用する場合
- **予防策候補**: checker 実行契約の安定実行経路節に spawnSync 経由の bun run 事象とラッパ構成例を追記する判断は promote 判断で評価
- **想定反映先**: checker 実行契約 Design「安定実行経路」節・agentdev-workflow-case-close scripts README
- **関連**: Case #3968 close 実行・textlint-gate 証跡（.agentdev/tmp/3968-close-verify/）
- **タグ**: #bun #spawnSync #SIGTERM #安定実行経路 #module-import #process-exit

---

