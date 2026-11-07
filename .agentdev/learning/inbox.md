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
