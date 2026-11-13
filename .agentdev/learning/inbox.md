# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-11-13: agentdev_jev evaluate の observationMetadata.references.digest に sha256 形式外の値を渡すと evaluator 成功後に観測書込みが invalid_input で失敗する（Case #4049・case-ready）

- **問題事象**: case-ready のスコープ重複判定（Jev 先行評価）で observationMetadata.references の digest に sha256 hex 64文字でない説明用プレースホルダ文字列を渡したところ、evaluator 自体は成功（scope-overlap=false・確率 0.93）したものの、評価直後の観測永続化が invalid_input（input reference digest must be a sha256 hex digest）で失敗し、観測 JSON が .agentdev/jev-observations/ に保存されなかった。evaluate の成功応答には observation write 失敗が warning として付与される
- **発生局面**: case-ready STEP-5（実行構造確定・既存オープン Issue とのスコープ重複判定の Jev 先行評価。Case #4049 / C-ω）
- **検知方法**: evaluate 応答内の observation.warning（observation write failed: invalid_input）と .agentdev/jev-observations/ の最新ファイル mtime の突合（当該評価の観測ファイルが新規作成されていないことで確認）
- **根本原因**: 呼出側（本実行）が references.digest に実ファイルの sha256 計算値ではなく説明的なプレースホルダ文字列を渡したこと。Tool 側の入力検証（sha256 hex 64文字）は正しく機能し、観測契約（再構成可能な入力は path + digest で保持）の要件を満たさない入力を fail-closed で拒否した
- **自律対応内容**: 契約どおり観測の再実行・擬似再生成は行わず、観測書込み失敗を独立 warning として完了報告に記録（evaluator 結果と LLM 最終判断の一致: scope-overlap=false）。次回以降は references を渡す前に sha256sum 等で実 digest を計算するか、references を省略して snapshot のみで構成する
- **ユーザー確認の有無**: なし（workflow 内自律処置・warning 記録）
- **REQ/Decision/Design影響**: なし（呼出側入力構成の注意喚起。Tool の fail-closed 検証自体は正常動作）
- **横展開観点**: Jev 先行評価を行う6系統 Workflow（learning-promote、req-define、case-ready、intake-promote、inspect-promote、backlog-review）の evaluate 呼出しで references を構成する全経路で同型の失敗が発生し得る
- **再発条件**: observationMetadata.references.digest に実計算値でない文字列を渡して evaluate を呼ぶ条件
- **予防策候補**: evaluate 呼出し前の references 構成手順への sha256 実計算の明示（または references 省略時の snapshot 構成への統一）
- **想定反映先**: learning-promote（運用手順の知見として整理）・execution-structure.md「Jev 評価経路」の呼出側規律参照候補
- **関連**: Case #4049 / case-ready STEP-5・REQ-090 系（Jev 先行評価の実運用組込み）
- **タグ**: #agentdev-jev #observation-metadata #invalid-input #fail-closed #case-ready

---

## 2026-11-13: agentdev_gh pr_create の number フィールド取扱いが reference 規約と Tool 実挙動で矛盾（Case #4049・case-open 設計PR作成）

- **問題事象**: case-open の設計PR作成で reference 規約（definition-pr-and-idempotency.md「要求には対象識別（対象 Root Case Issue の番号を number で指定）を含める。対象識別を欠く要求は Tool が受理しない」）に従い number を含めて pr_create を呼んだところ、Tool が当該要求を fail-closed で拒否した（拒否応報は pr_create 契約が number フィールドを受理しない旨）。number を除いて再実行したところ作成に成功した（PR #4050）
- **発生局面**: case-open STEP-4 設計PR作成（Case #4049 / PR #4050・C-ω）
- **検知方法**: pr_create の失敗応答（fail-closed 拒否）と number 除去後の成功の対比。Tool の公開契約（request schema）は pr_create の number を「対象識別として受理する（GitHub 実装は head branch で対象解決するため作成対象解決には使用しない）」と記述しており、実挙動・reference・schema の三者が不一致
- **根本原因**: 確定不能（要検証）。Tool 実装の入力検証が schema 記述と乖離しているか、拒否理由の報告文が不正確である可能性。委譲セッションが glm-5.3 利用上限に伴うサーバー再起動で消失し、拒否応答の原文が採取できないため、原文に基づく原因特定は未実施
- **自律対応内容**: Tool 契約（実挙動）を正として number を除いて再作成し、reference と Tool 契約の不整合を逸脱として報告に記録した（本 entry が当該記録の正規 Capture）
- **ユーザー確認の有無**: なし（workflow 内自律処置・逸脱記録）
- **REQ/Decision/Design影響**: case-open の definition-pr-and-idempotency.md（pr_create の対象識別要件）と agentdev_gh 公開契約・実装の三者整合の確認要求
- **横展開観点**: write-proxy payload 標準配置（issue-operation-recovery.md）も「pr_create の場合は対象識別を含める要求全体」と規定しており、同規約に従う全経路で同一の拒否に遭遇し得る
- **再発条件**: number を含めて pr_create を呼ぶ全ての case-open / case-revise 実行
- **予防策候補**: agentdev_gh の入力検証と schema 記述の整合修正、または reference 2件（definition-pr-and-idempotency.md・issue-operation-recovery.md）の対象識別要件の実装追従
- **想定反映先**: agentdev-workflow-case-open references・agentdev-issue-management references・agentdev_gh Tool 契約
- **関連**: Case #4049 / PR #4050・case-open STEP-4
- **タグ**: #agentdev-gh #pr_create #契約不一致 #fail-closed #case-open

---

## 2026-11-12: bun run --cwd による tsc 実行が worktree で node_modules 解決に失敗する（package 単位 bun install の前置が安全）

- **問題事象**: `bun run --cwd <package> typecheck`（tsc 実行）が worktree 内で node_modules 解決に失敗する。package 直下の node_modules が未整備の場合、tsc 自体が起動しない
- **発生局面**: Case #4005 / PR #4017（B1-2）の typecheck ×4 利用側 package 実行（PR 本文 learning 候補から回収）
- **検知方法**: typecheck 実行の終了コード異常と node_modules 解決エラー
- **根本原因**: worktree は node_modules を伝播しない構造的制約に加え、`--cwd` 経由の bun run は当該 package 配下の node_modules/.bin 解決を要求する
- **自律対応内容**: skill scripts 配下で bun install（package 単位整備）を事前実行してから typecheck を実行する手順に統一
- **ユーザー確認の有無**: なし（実行手順の自律調整）
- **REQ/Decision/Design影響**: なし（運用手順の知見）
- **横展開観点**: typecheck・bun run を含む検証手順の委譲 prompt・機械工程で同型の前置が必要になり得る
- **再発条件**: 新規 worktree または node_modules 未整備の package で bun run --cwd を実行する条件
- **予防策候補**: 検証手順テンプレートへの package 単位 bun install 前置の明記
- **想定反映先**: learning-promote（運用手順の知見として整理）
- **関連**: Case #4005 / PR #4017・REQ-113-002・worktree の node_modules 非伝播構造
- **タグ**: #bun-run #node_modules #worktree #typecheck #依存復元

## 2026-11-12: detached worktree を相対パスで作ると現在 worktree 配下にネストする（worktree add は main root から実行・絶対パス指定）

- **問題事象**: `git worktree add` に相対パスを渡すと、実行時の cwd（検証中の worktree 配下）を起点に解決され、意図せず既存 worktree 配下に新 worktree がネストする
- **発生局面**: Case #4005 / PR #4017（B1-2）の baseline 対照実行用 detached worktree 作成（PR 本文 learning 候補から回収）
- **検知方法**: 作成後の worktree パス確認（ネスト先に作成されていることを観測）
- **根本原因**: git worktree add のパス解決が cwd 基準の相対解決であることと、検証実行中の cwd が検証対象 worktree であることの組み合わせ
- **自律対応内容**: worktree add は main root から実行するか、絶対パスで指定する手順に統一
- **ユーザー確認の有無**: なし（実行手順の自律調整）
- **REQ/Decision/Design影響**: なし（運用手順の知見）
- **横展開観点**: baseline 対照実行（detached worktree 標準手順）を実行する全委譲・機械工程で同型の注意が必要
- **再発条件**: worktree 配下の cwd から相対パスで git worktree add を実行する条件
- **予防策候補**: agentdev-git-worktree の detached 対照手順への絶対パス指定の明記
- **想定反映先**: learning-promote（運用手順の知見として整理）・agentdev-git-worktree の参照更新候補
- **関連**: Case #4005 / PR #4017・baseline 対照実行（detached worktree 標準手順）
- **タグ**: #git-worktree #detached #baseline-対照 #パス解決

## 2026-11-11: accept_definition_checks.ts の integrity gate が既出債務 warning で機械 fail となり後続ゲートが後続抑止される構造

- **問題事象**: case-ready 受入検査（accept_definition_checks.ts phase: acceptance-checks）の integrity gate（check_integrity --profile source）が、本 Case 変更と無関係の既出債務 warning（gh-direct-invocation・case-close scripts README の記述行・IR baseline 管理下）により exit 1 となり、script の後続抑止設計（非ゼロ終了の integrity gate は証拠保存後に後続ゲートを実行しない）により overlap 突合・AUTOGEN 再生成差分検出・traceability check が同一呼出しで実行できなかった
- **発生局面**: case-ready STEP-1 設計PR受入の機械工程（Case #4004 / PR #4007）
- **検知方法**: script 報告 JSON（caseready-4004-acceptance-report-1.json）の definition-acceptance-checks step fail と warnings（"Definition integrity/quality check failed"）＋ worktree・main 双方の対照実行（いずれも summary NG 0 / Warning 1・「1 new unmanaged NG (delta)」行は main 側にも存在＝本変更起因でない対照証明）
- **根本原因**: check_integrity の終了コード契約（NG または warning のいずれかで exit 1・warning 専用の抑止フラグなし）と、受入合格条件の意味基準（本変更起因の新規 finding 0 件）との粒度差。既出債務 warning が恒常的に存在する倉庫状態では script が後続ゲートへ到達できない
- **自律対応内容**: 対照実行（main root での同一検査）により既出債務の新規性なしを機械証明した上で、残り3ゲート（overlap 突合〔exit 0・警告2件〕・generate_indexes + worktree 内 AUTOGEN diff〔exit 0・差分0件〕・traceability check --req 5行〔exit 2・missing-design 0件・deferred 2種は契約どおり〕）を手動相当手順（GATE_ALTERNATIVE_ROUTES の manual-equivalent-procedure）で同等実施し、実行証跡（終了コード・stdout・stderr）を .agentdev/integrity/reports/caseready-4004-* に保存して受理判断した
- **ユーザー確認の有無**: なし（受入合格条件〔本変更起因の新規 finding 0 件〕からの正規契約導出・意味レビューと受理判断はモデル責務の範囲内）
- **REQ/Decision/Design影響**: case-ready Design「機械工程の script 呼び出し契約」節（後続抑止時の継続経路の明示化候補）・checker-execution-contracts（check_integrity 終了コードと受入判定の粒度整合）
- **横展開観点**: 同一構造は case-open の prepare_definition_pr.ts の check_integrity step にも存在し得る（2026-11-07 の measurement-convergence 学び〔Case #3961〕とは別変種）。永久 warning を持つ倉庫での機械工程 script の完遂性を点検する
- **再発条件**: 既出債務 warning（例: gh-direct-invocation 1 件）が解消されないまま、integrity gate を含む acceptance-checks script を実行する条件
- **予防策候補**: script 入力に integrity gate の既知 warning 許容リスト（対照証明の添付を必須化）を受け取る入力契約の追加、または非ゼロ終了時に後続ゲートを続行する continuation mode 相当の入力契約拡張
- **想定反映先**: req-define（case-ready 機械工程の継続契約の要件化候補）
- **関連**: Case #4004 / PR #4007・accept_definition_checks.ts の GATE_ALTERNATIVE_ROUTES・Case #3961 の measurement-convergence 学び（2026-11-07・別変種）
- **タグ**: #case-ready-機械工程 #check-integrity #既出債務 #後続抑止 #手動相当手順

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

## 2026-11-08: textlint gate ラッパの実行ランタイムは bun が正・node --experimental-strip-types の ESM loader は vendored bundle の blob: URL import を fail-closed ブロックする（Case #3970 close 実行）

- **問題事象**: Case #3968 close で確立した module import + process.exit ラッパ経路を node --experimental-strip-types で実行したところ、textlint-guard の vendored engine bundle（textlint-engine.bundle.json）の動的 import が `Received protocol 'blob:'` で fail-closed ブロックされ gate が検査不能（exit 1・0 inspected）となった
- **発生局面**: case-close STEP-3 機械工程 textlintGate 実行（merge 直前 HEAD の最終検査）
- **検知方法**: 機械工程 1回目実行の textlint-final-check step fail（exitCode 1・stderrTail 空）→ ラッパ単独再実行でエラー本文を取得
- **根本原因**: node v26 の既定 ESM loader は import 許可 scheme を file/data/node に制限しており、vendored bundle が使用する blob: URL 動的 import をブロックする（bun の ESM loader は blob: を解決する）。ラッパの module import 構成は正だが実行ランタイムの選択が環境依存だった
- **自律対応内容**: ラッパの起動を `node --experimental-strip-types` から `bun <wrapper.mts>` に変更（runFinalGate の module import + process.exit 構成は変更なし）→ exit 0・ok=true・拒否対象違反ゼロを確認し、機械工程 2回目で textlint-final-check step pass
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（checker 実行契約「安定実行経路」の運用補完・実装変更なし）
- **横展開観点**: 機械工程の GateCommandSpec で module import ラッパを使う TS checker は、vendored bundle（blob: 動的 import）を含む場合ラッパの実行 command は bun を指定する。node は vendor 非依存 checker 向けの選択肢
- **再発条件**: node --experimental-strip-types で vendored bundle を import する checker ラッパを実行する場合
- **予防策候補**: checker 実行契約「安定実行経路」節への実行ランタイム選択規律（vendored bundle 含有 → bun）の追記は promote 判断で評価
- **想定反映先**: checker 実行契約 Design「安定実行経路」節・agentdev-workflow-case-close scripts README
- **関連**: Case #3970 close 実行・Case #3968 close のラッパ確立学び・textlint 証跡（.agentdev/tmp/3970-close-verify/textlint-bun-stdout.json）
- **タグ**: #node-esm-loader #blob-url #vendored-bundle #textlint #安定実行経路 #bun

---

## 2026-11-08: git worktree remove が .git メタデータ削除後に物理ディレクトリ削除へ失敗し「メタデータ消滅 + 物理残骸」を残す・rm -rf と prune での掃除と照合を織り込む（Case #3970 close 実行）

- **問題事象**: post-merge 機械工程の cleanup-worktree-branch で `git worktree remove .worktrees/3970-feature` が exit 255 で失敗。直後に `git worktree list` から対象が消え（メタデータ削除済み）`is not a working tree` となる一方、.worktrees/3970-feature が物理残存した
- **発生局面**: case-close STEP-6 worktree/branch 削除（bun install 済み worktree・node_modules 30MB の gitignore 領域あり）
- **検知方法**: 機械工程報告 JSON の cleanup-worktree-branch step warn（worktreeRemoveExitCode 255）と worktree list / 物理ディレクトリ実在確認の乖離
- **根本原因**: git worktree remove の物理削除段階が Windows のファイルロック等で失敗したと推定。メタデータ削除は先行して完了するため、失敗後に「git 管理上は存在しない・ディスクには残存する」半分状態を生む
- **自律対応内容**: 物理ディレクトリの中身確認（空ディレクトリに縮退していた）→ rm -rf で物理削除 → git worktree prune → worktree list と .worktrees/ 実在確認で不存在を照合。branch は機械工程内で -d 削除・remote は deleteBranchOnMerge で自動削除済みを ls-remote で確認
- **ユーザー確認の有無**: なし（untracked・gitignore 外の残存は 0件と実測済み）
- **REQ/Decision/Design影響**: なし（既存の残骸掃除手順の具体化）
- **横展開観点**: bun install 済み worktree の remove 後は、worktree list と物理ディレクトリ実在の双方を確認し、半分状態の場合は rm -rf + prune で掃除してから不存在確認へ進む
- **再発条件**: Windows で gitignore 領域が重い worktree の remove を実行する場合
- **予防策候補**: agentdev-git-worktree のクリーンアップ手順への半分状態掃除の追記は promote 判断で評価
- **想定反映先**: agentdev-git-worktree references・agentdev-workflow-case-close references/cleanup-and-capture.md
- **関連**: Case #3970 close 実行・postmerge 報告 JSON（.agentdev/tmp/3970-close-verify/postmerge.stdout）
- **タグ**: #git-worktree-remove #windowsロック #残骸掃除 #半分状態 #prune

---

## 2026-11-08: bun test の実行形態逸脱が fail を実行形態由来として生む実測 — scripts cwd 直実行で 24 fail のうち 23件が正規形再実行で解消（Case #3970 case-run DEL-3970-1 実行）

- **問題事象**: worktree の full integrity suite を scripts cwd 直実行（非正規形）で起動したところ 24 fail を観測。正規形（worktree root cwd・`./` prefix・timeout 600s 明示）での再実行で 23件が解消し、残 1件（relied-diff T6）のみ baseline でも再現する pre-existing と分類
- **発生局面**: case-run DEL-3970-1 の full integrity suite 実行（REQ-060 の 3 cwd 分割正規形契約）
- **検知方法**: 非正規形実行と正規形再実行の fail 件数差（24 → 1）の突合
- **根本原因**: bun test の cwd 依存テストが混在するスイートで、cwd 逸脱により実行形態由来の fail が量産される（REQ-060 の実行形態契約の逸脱検知条件が実務で機能した事例。worktree 環境 fail 分類の knowledge と整合）
- **自律対応内容**: 正規形（worktree root cwd・./ prefix）再実行で解消を確認し、fail 明細の由来分類を baseline 5fa75b7d9 detached worktree での再現確認で確定（T6 のみ pre-existing）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（REQ-060 実行形態契約の逸脱検知の有効性実証）
- **横展開観点**: worktree 環境の fail 分類では正規形再実行を前置し、実行形態由来 fail を由来分類へ混入させない
- **再発条件**: bun test を scripts cwd 直実行など非正規形で起動する場合
- **予防策候補**: worktree 環境 fail 分類 knowledge への実測事例追記は promote 判断で評価
- **想定反映先**: docs/knowledge/ の worktree 環境 fail 分類 knowledge・REQ-060 関連 reference
- **関連**: PR #3977 本文検証差分「bun test フル suite 実行環境ラベル」節・Case #3970 case-run
- **タグ**: #bun-test #実行形態逸脱 #正規形再実行 #fail分類 #worktree

---

## 2026-11-08: worktree で bun install 前置後に tsc --noEmit が依存解決可能になる — package 境界ごとの前置要否は REQ-060-006 どおり（Case #3970 case-run DEL-3970-1 実行）

- **問題事象**: worktree 環境では node_modules が伝播せず、bun install 前置なしの typecheck が依存解決に失敗する環境がある
- **発生局面**: case-run DEL-3970-1 の typecheck（case-close scripts package）
- **検知方法**: bun install --cwd 前置実施後の tsc --noEmit が終了コード 0（error 0件）で通過
- **根本原因**: worktree は git 管理対象のみ伝播し node_modules（gitignore 対象）は main root に留まるため、package 境界ごとの bun install 前置が要否分岐となる（REQ-060-006 のとおり）
- **自律対応内容**: bun install --cwd src/common/skills/agentdev-project-extensions/scripts と bun install --cwd .opencode/skills/repo-agentdev-integrity/scripts を前置し、typecheck と full suite を正規実行
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（REQ-060-006 の運用確認）
- **横展開観点**: worktree での typecheck・test 実行は対象 package 境界の bun install 前置を手順に織り込む（node_modules は gitignore 対象・merge 差分への影響なし）
- **再発条件**: worktree 環境で bun install 前置なしに package 依存を前提とする検証を実行する場合
- **予防策候補**: REQ-060-006 の worktree 手順表への前置対象一覧の整備は promote 判断で評価
- **想定反映先**: REQ-060 関連 reference・docs/knowledge/ の worktree 検証手順
- **関連**: PR #3977 本文検証差分「依存パッケージ状態」節・Case #3970 case-run
- **タグ**: #bun-install #worktree #node_modules #typecheck #REQ-060-006

---

## 2026-11-08: リポジトリ内作業領域の tsc 依存未整備環境では bun install 後に node_modules/.bin/tsc 直接起動が確実（Case #3971 case-run DEL-3971-1 実行・PR #3978 本文 Findings より回収）

- **問題事象**: リポジトリ内作業領域（.agentdev/tmp/）の tsc 依存未整備環境では `bun run tsc --noEmit` が PATH 解決失敗でヘルプ出力を表示し、検証が通過扱いに見えるが実行されていない
- **発生局面**: case-run DEL-3971-1 の typecheck（integrity scripts package）
- **検知方法**: bun run tsc の出力がヘルプ表示であることの確認
- **根本原因**: tsc への PATH 解決が未整備の作業領域で bun run が想定の依存を解決できない
- **自律対応内容**: package.json の typecheck script の正規形（tsc --noEmit -p tsconfig.distribution-boundary.json）を bun install 後に node_modules/.bin/tsc 直接起動で実行して解消
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（REQ-117-007 の skip メッセージの正規整備手段と整合）
- **横展開観点**: 依存未整備環境での typecheck 実行は node_modules/.bin/tsc 直接起動に統一する
- **再発条件**: tsc 依存が未整備の作業領域で bun run tsc を実行する場合
- **予防策候補**: typecheck 実行手順の統一は promote 判断で評価
- **想定反映先**: integrity scripts の typecheck 実行手順・REQ-117-007 関連 reference
- **関連**: PR #3978 本文 Findings / learning・Case #3971 case-run
- **タグ**: #tsc #bun-run #typecheck #PATH解決 #REQ-117-007

---

## 2026-11-08: bash から node -e で機械工程入力 JSON を構築する際、Windows 絶対パスの文字列リテラルは shell 解釈で \\ エスケープが崩れて ENOENT になる・配列 join(String.fromCharCode(92)) か .cjs スクリプトファイル経由で構築する（Case #3971 close 実行）

- **問題事象**: bash 内蔵 shell の node -e 一行スクリプトで Windows 絶対パスを `'C:\\\\Users\\\\...\\\\tmp\\\\3971...'` の文字列リテラルとして渡したところ、shell→node のエスケープ解釈が崩れて `\tmp` がタブ・`\03971` が `\u0003` に化け、機械工程が issueBodyPath の ENOENT で fail した
- **発生局面**: case-close STEP-5 の機械工程冪等再実行（fresh updated_at で入力 JSON の issueBodyPath を node -e 一行で書き換えた場合）
- **検知方法**: 機械工程の stderr に出た ENOENT の path 表示（タブ・制御文字混入が目視確認できた）
- **根本原因**: bash の二重エスケープ解釈と node -e 文字列リテラルのエスケープ解釈が重なり、複数回のエスケープ層で正確な `\\` の記述が困難
- **自律対応内容**: パスを配列 `['C:','Users',...].join(String.fromCharCode(92))` で構築して再実行し解消。初回の入力 JSON 構築は .cjs スクリプトファイル経由で成功しており、その経路が正規
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（機械工程入力構築の手順上の学び・契約変更なし）
- **横展開観点**: bash から node -e でパスを含む JSON を構築する場合は Windows パスを文字列リテラルで直書きせず、配列 join またはスクリプトファイル経由に統一する
- **再発条件**: bash 一行コマンドで Windows パスを含む JSON を node -e で生成・書き換える場合
- **予防策候補**: 機械工程入力構築のヘルパースクリプト整備は promote 判断で評価
- **想定反映先**: agentdev-workflow-case-close scripts README（機械工程入力 JSON の置き場所・構築手順）
- **関連**: Case #3971 close 実行・機械工程報告（.agentdev/tmp/3971-close-verify/）
- **タグ**: #node-e #bash エスケープ #windowsパス #機械工程入力 #ENOENT

---

## 2026-11-08: verify-only closure（PR なし）では機械工程が accepted=true の終了判定記録を書出せず issue_close が終了前提検証で拒否される

- **問題事象**: 検証のみで完了する Issue（PR も carrier commit も存在しない verify-only closure・Wave-4 #3972）の case-close STEP-5 で、agentdev_gh issue_close の終了前提検証（close-acceptance・REQ-032-046 維持機構）が「判定が不成立（accepted=false）」として 2 回構造化拒否した。機械工程（close_mechanical_steps.ts）の受入評価・機械受理基準・契約状態記録検査はすべて成立済み（closeAllowed true・integrityMachineAcceptance accepted・committed）で、完了条件 13/13 達成済み
- **発生局面**: case-close STEP-5 issue_close（Case #3964 / Issue #3972・verify-only closure・対象版 HEAD 49d94576b = origin/main・変更 0 件）
- **検知方法**: issue_close の structured failure「the close acceptance record exists but the judgment is not accepted (accepted=false)」（targetRevision 不一致の第1拒否は機械工程冪等再実行で解消済み）
- **根本原因**: 機械工程の accepted 書出し条件 `isCloseAcceptanceReady` が `report.result.exitCategory === "success"` を要求し、exitCategory success は mergeable-polling step pass（mergeable === "MERGEABLE" または prState === "MERGED" の実在 PR 観測）を前提とする。verify-only closure では PR が構造的に存在せず、mergeablePolling maxAttempts 0（ポーリング不実行）構成でも step は warn → exitCategory は needs-judgment で fixed。PR 前提の構造で Wave-1〜3 子 Issue は全て PR あり close のため露呈せず、verify-only closure は Wave-4 が初適用
- **自律対応内容**: STEP-1〜4（QG-4 達成判定・docs 検証・機械工程 pre-merge・verify-only closure 判定）を完遂し、停止報告（記録種別 hold・comment 6717844662・再開条件記録）を投稿。Epic #3964 実行構成表 #3972 行を pending → blocked に更新（case-close 単一書き手）。機械工程報告は .agentdev/integrity/reports/case-3972-close-premerge.json に退避。機械工程 script・Tool は配布対象の実装変更であり本 Case（検証のみ・対象外に実装層の追加修正）では変更しない
- **ユーザー確認の有無**: なし（fail-closed 機械契約の尊重・停止報告経路の正規適用）
- **REQ/Decision/Design影響**: REQ-032-046（終了前提の機械受理）の判定内容適合と verify-only closure 対応・検証に伴う一時資材の取扱いと後片付け責任 Design「終了操作の安全境界と終了判定記録」節・close_mechanical_steps.ts（mergeable-polling の N/A 経路・accepted 書出し条件）・agentdev_gh close-acceptance（受理判定経路）
- **横展開観点**: docs_chore 特例フロー（PR なし main 直接 commit）と Epic 最終 close 構成（worktreeRoot==main root・対象 PR merge 済みで polling が MERGED を観測する既存考慮）との整合照合。単一 Issue クローズ ルートの verify-only closure は PR 前提構造の全経路（機械工程・issue_close 前提検証・Local 版 runner）で同型ギャップが存在する可能性
- **再発条件**: 検証のみで完了する Issue（実装変更を所有しない検証実行 Issue・docs_chore を除く PR なし完了）を case-close STEP-5 で issue_close する場合。実行環境メモ「issue_close 前に本文更新したら fresh updated_at で機械工程冪等再実行」は第1拒否の既知学びであり、第2拒否（accepted 検査）は新規
- **予防策候補**: 機械工程 script に PR なし構成で exitCategory success となり accepted=true を書出す経路（mergeable-polling の N/A 化: prNumber 0 または PR 不在時の merge 前提確認省略と、受入評価・機械受理・residue 成立時の accepted 書出し）を追加する。または issue_close 前提検証に verify-only closure 用の受理判定経路を追加する。いずれも Definition 変更（REQ-032-046 の判定内容適合範囲）として req-define 経路で合意したうえで実装する
- **想定反映先**: req-define（機構是正の要件化候補。REQ-032 系または case-close 機械工程の実装要件）
- **関連**: Case #3964 / Issue #3972 停止報告 comment 6717844662・完了記録 comment 6717724355・機械工程報告 .agentdev/integrity/reports/case-3972-close-premerge.json・#3971 close（PR あり close の直近実績・case-3971-close-premerge-v2.json）
- **タグ**: #verify-only-closure #issue_close #終了判定記録 #機械受理 #mergeable-polling #fail-closed

---

## 2026-11-08: verify-only closure での full integrity suite 実行時の分割③ plugins 対象欠落（junction 未伝播）と bun install 前置・リダイレクト先の運用学び（Wave-4 再観測）

- **問題事象**: verify-only closure（実装変更なし・main 同一内容に対する検証）でも 3 検査 + full integrity suite を通常 Case と同水準で実行した際、分割③（bun test ./.opencode/plugins/ ./scripts/）の .opencode/plugins 対象欠落（worktree junction 未伝播環境）が同様に発生する。未実行対象を実行済みとして扱わず環境差として記録する運用が verify-only closure の証跡にも必要。既存知識 worktree-environment-fail-classification.md と整合する再観測
- **発生局面**: case-run Wave-4 検証実行（Case #3964 / Issue #3972・DEL-3972-1）・verify-only closure 証跡
- **検知方法**: bun test 分割③の実行結果（348 tests / 21 files・11 fail・install projection check 系・.opencode/plugins junction 未伝播による対象欠落）
- **根本原因**: worktree に .opencode/plugins の junction が伝播しない環境特性（既知・同一構成）
- **自律対応内容**: fail 12 件（split1 T6 1件 + split3 11件）全件を pre-existing・環境依存として由来分類し、機械受理基準の記録要素（終了コード・件数突合・実行環境・検査範囲・退避先）を SSoT コメントに記録。Wave-1〜3 close と同一 fail 構成を baseline detached worktree 実測（PR #3978 close 記録・baseline 0baf5df4c）と突合
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存知識の再観測・契約変更なし）
- **横展開観点**: verify-only closure の証跡にも環境差（junction 未伝播による対象欠落）の記録を必ず含める
- **再発条件**: junction 未伝播環境の worktree で full integrity suite を実行する全 Case
- **予防策候補**: 既存知識 worktree-environment-fail-classification.md に verify-only closure の記録要件を追記する（promote 判断）
- **想定反映先**: learning-promote（既存知識への追記判定）
- **関連**: Case #3964 / Issue #3972 SSoT コメント issuecomment-6717238931・worktree-environment-fail-classification.md
- **タグ**: #junction未伝播 #integrity-suite #verify-only-closure #環境差記録

---

## 2026-11-08: package 単位の bun install 前置後の worktree root cwd 正規形実行と退避ファイルの絶対パス指定

- **問題事象**: worktree 内で各 package（case-close scripts・agentdev-gh・agentdev-gh-tool opencode/senpi・traceability scripts・integrity scripts・textlint-guard plugin）のテスト・checker を実行する際、package 単位の bun install 前置後に各 package のテストを worktree root cwd の正規形（`./` prefix 付きパス指定）で実行すれば依存解決が成立する。traceability check のように scripts cwd から実行する検査では、stdout/stderr の退避ファイルのリダイレクト先を cwd 相対でなく絶対パスで指定しないと失敗する実測
- **発生局面**: case-run Wave-4 検証実行（Case #3964 / Issue #3972・DEL-3972-1）
- **検知方法**: traceability check の相対リダイレクト失敗の実測
- **根本原因**: cwd 相対リダイレクトは実行時 cwd に依存し、検査の実行 cwd（traceability scripts 配下）と退避先の意図（一時領域）がずれる
- **自律対応内容**: 退避ファイルのリダイレクト先を絶対パスで指定して実行・SSoT コメントに運用手順を記録
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（検証実行手順の学び・契約変更なし）
- **横展開観点**: scripts cwd から実行する検査（traceability check 等）の退避指定は全て絶対パスに統一する
- **再発条件**: worktree 内の package 単位検証で cwd が実行対象ごとに変わる検査をリダイレクト付きで実行する場合
- **予防策候補**: 検証手順テンプレートに「リダイレクト先は絶対パス」を明記する（promote 判断）
- **想定反映先**: learning-promote（運用手順の知識化判定）
- **関連**: Case #3964 / Issue #3972 SSoT コメント issuecomment-6717238931（verify-only closure 証跡・bun install 前置の記載）
- **タグ**: #bun-install #worktree #リダイレクト #検証手順

---

## 2026-11-08: 配布物本文への concrete ID 直書きは配布依存境界 checker が baseline 差分として即座に検出する

- **問題事象**: 配布 skill scripts 配下のソース（実装コメント）へ要件行 ID（concrete ID）を直書きしたところ、配布依存境界 checker（source profile）の baseline 比較で concrete-id 違反 1件が baseline（failures 0・scanned 496）からの差分として即座に検出された（Case #3979・PR #3982 実装中・計測 2026-11-08・ID 除去で解消）
- **発生局面**: case-run 実装（close_mechanical_steps.ts のコメント追記・DEL-3979-1）
- **検知方法**: `bun ./.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts --profile source --json .`（worktree root 実行）の failures 差分（concrete-id・baseline `.agentdev/tmp/db-3979-baseline.json`〔source profile・ok・failures 0〕との比較）
- **根本原因**: 配布物本文への concrete ID 混入は配布依存境界違反。コメント内での要件行 ID 直書き禁止規律（「対応関係は traceability/ 配下 sidecar を参照」記述規律）は checker の baseline 比較で機械化・実効的に担保されている
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存検査機構の実効性確認・契約変更なし）
- **横展開観点**: 配布対象の実装コメントにも concrete ID を書かない。要件対応は sidecar 参照の記述規律を守る
- **再発条件**: 配布 skill ソース面のコメント・本文へ要件行 ID を記載する場合
- **予防策候補**: 配布物変更 Case の実装時に checker baseline 比較を標準前置にする（concrete ID 混入の実効的な予防ゲートとして機能する実績）
- **想定反映先**: learning-promote（運用手順の知識化判定）
- **関連**: Case #3979 / PR #3982 本文検証差分（実装中初回検出・修正済み記録）
- **タグ**: #配布依存境界 #concrete-id #checker #baseline

---

## 2026-11-08: bun test 分割③の junction 未伝播環境差は件数安定でも実行対象数を検証差分へ明記する

- **問題事象**: bun test 分割③（.opencode/plugins/ ./scripts/）の fail 数は junction 未伝播環境の worktree 実行でも baseline と同一件数（11件）に安定したが、実行対象ファイル数の環境差（worktree の .opencode/plugins/ は空・21 files 348 tests 実行）が件数突合だけでは判別できない（Case #3979 close 実測・計測 2026-11-08）
- **発生局面**: case-close STEP-2/3 の bun test 3分割正規形実測（merge 直前 HEAD d9f7d2ead・worktree root cwd・timeout 600s 明示）
- **検知方法**: stderr 件数サマリー（Ran N tests across M files）の M 値の環境差（main root では plugins 分割対象が含まれる・worktree では 21 files。未伝播のため plugins 分割が未実施である旨は検証差分の環境ラベルで明記）
- **根本原因**: worktree junction 未伝播により分割③の plugins 対象が欠落する構造的環境差は fail 件数には反映されない（欠落対象のテストが実行されないだけ・未実行対象を実行済みとして扱わない規律が必要）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存知識の記録要件確認・契約変更なし）
- **横展開観点**: verify-only closure に限らず通常 Case の worktree 実行でも同様。検証差分へ実行対象数の環境差（M 値と plugins 分割実施の別）を明記する記録要件を維持する
- **再発条件**: worktree で bun test 分割③正規形を実行する場合
- **予防策候補**: 検証差分記録テンプレートに「分割③ 実行対象数と plugins 分割実施の別」の明記欄を追加する検討（promote 判断）
- **想定反映先**: learning-promote（既存知識 worktree-environment-fail-classification.md への補強判定）
- **関連**: docs/knowledge/worktree-environment-fail-classification.md・Case #3979 / PR #3982 本文検証差分（環境ラベル記録）
- **タグ**: #bun-test #worktree #junction #件数突合 #環境差

---

---

## 2026-11-08: verify-only closure（prNumber 0）の機械工程正規構成は事前観測→stage1（記録なし fail 観測）→stage2（記録完備・accepted）の 3 実行で、fail 件数は bun test stderr から抽出する

- **問題事象**: verify-only closure（PR も carrier commit も存在しない完了・Issue #3972 再開実行）で機械工程の fail 12 件に対する機械受理記録（integrityMachineAcceptance）を構築する際、機械工程報告の full-integrity-suite detail は stdout 先頭行のみ（bun test v1.3.6 バナー）を記録し、fail 件数（1/0/11）が取得できない。bun 1.3.6 のサマリー行「Ran N tests across M files」には fail 件数が含まれない
- **発生局面**: case-close STEP-5 再開・機械工程 2 段階実行（対象版 5d8446414・main 5d8446414 = 機構是正 ee1af14e4 反映済み・2026-11-08 実測）
- **検知方法**: stage1 機械工程実行（integrityMachineAcceptance なし）の full-integrity-suite fail（machine-acceptance-record-missing・failedGateNames split1/split3）と事前観測（bun test 3 分割を機械工程と同一コマンド・同一 cwd で直接実行・stdout/stderr 分離退避・UTF-8 明示書出し）の突合
- **根本原因**: bun test は fail 件数を stderr の「N pass / N fail」行に出すため、機械工程報告（stdout のみ detail 記録）からは fail 件数が抽出できない構造。機械受理記録の observedFailCounts・suiteRunRecords.testCountSummary の構築には事前観測の実測値が必須
- **自律対応内容**: (1) 事前観測で 3 分割直接実行・stderr 退避・fail 件数を「(fail) 行数と N pass / N fail カウント行の双方突合」で決定的抽出（2998/1・979/0・337/11 実測・split2 は #3979 テスト追加 5 件で 974→979 件に増えているため前回記録の盲信は不可） (2) stage1 を機械受理記録なしで実行し fail 構成観測（MUST DO の機械工程 2 段階実行） (3) stage2 を記録完備で再実行 → exitCategory success・全 11 step pass・warnings 0・accepted=true 書出し成立。 Epic 表更新（epicBodyPath・epicChildStatusUpdates）は機械工程に渡さない（blocked 行は closing 適用対象外で epic-table-analysis が warn を出し exitCategory success を壊すため。省略は入力契約上正当）
- **ユーザー確認の有なし**: なし
- **REQ/Decision/Design影響**: なし（実行形態契約 REQ-060・機械受理基準 REQ-032-046 は変更せず維持）
- **横展開観点**: docs_chore 特例等の他の PR なし完了構成でも同一構成が使える。prNumber 0 は PR 不在の合意表現として入力検証で受理される（mergeable-polling は prNotApplicable で N/A pass・gh pr view 非発行）
- **再発条件**: verify-only closure・PR なし完了構成で fail ありの bun test を機械受理する場合
- **予防策候補**: 機械工程入力構築スクリプト（.cjs）に事前観測モードと stage2 モード（stage1 報告 + 退避 stderr からの fail 件数抽出・exit code 突合）を標準実装する
- **想定反映先**: learning-promote（verify-only closure 実行手順の知識化判定）
- **関連**: Issue #3972 再開完了記録 comment 6720052233・機構是正 Case #3979 / PR #3982・.agentdev/integrity/reports/case-3972-reopen-observe-buntest.json
- **タグ**: #verify-only-closure #close_mechanical_steps #bun-test #fail-件数抽出 #機械受理

---

## 2026-11-08: Epic 実行構成表の blocked 行への completed 適用は closing では拒否され（already-blocked skip）reset→closing の 2 段階が正規経路

- **問題事象**: case-close 機械工程の epicChildStatusUpdates で #3972（blocked）に completed を適用したところ epic-table-analysis が warn（already-blocked skip）になり、warning 残存で exitCategory が success にならず isCloseAcceptanceReady が成立しない
- **発生局面**: case-close STEP-5 再開・Epic #3964 実行構成表更新（#3972 blocked→completed・7/7 化・2026-11-08 実測）
- **検知方法**: stage1 機械工程報告の warnings「epic child status update skipped: #3972(already-blocked)」と tracking-table.ts 契約（TERMINAL_STATUSES = completed・blocked・failed・applyClosingStatus は既に終端子状態の行を上書きしない）の照合
- **根本原因**: blocked は終端子状態であり人間判断・再開条件を含む保留状態のため、機械的な closing 書換（pending→completed の冪等置換）は既に終端の行に適用されない安全設計。blocked からの正規遷移は resetChildToPending（blocked→pending の冪等戻し）を前置する 2 段階のみ
- **自律対応内容**: (1) 機械工程からは Epic 表更新を除外（epicBodyPath・epicChildStatusUpdates を省略） (2) issue_close 後に agentdev-epic-tracker 正規手順（reflect.ts reset → closing・最新取得済み本文に対して決定的適用・行差分突合 [#3972 のみ変化]・terminal 7/7 確認）を実施し issue_update で書込み（case-close 単一書き手・per-Epic 排他制御） (3) Epic 自動クローズ判定は reflect.ts overall で実行 → overallCompleted false（完了条件 1〜5 未評価）を報告（Epic クローズ自体は次段 case-close(#epic) 委譲が所有）
- **ユーザー確認の有なし**: なし
- **REQ/Decision/Design影響**: なし（agentdev-epic-tracker scripts 契約の運用確認）
- **横展開観点**: failed 行からの completed 適用も同一 2 段階。Wave 反復中の一時 blocked と終端 blocked の区別は表では表現されないため、戻し経路（reset）の前置が必須
- **再発条件**: 停止（blocked）経由で完了した子 Issue の Epic 反映を機械工程の closing 適用で行おうとした場合
- **予防策候補**: blocked→completed 更新が必要な Case では、機械工程の epicChildStatusUpdates に blocked 行を含めず、issue_close 後の reset→closing 2 段階を標準手順とする
- **想定反映先**: learning-promote（agentdev-epic-tracker 運用手順の知識化判定）
- **関連**: Issue #3972 再開完了記録 comment 6720052233・Epic #3964 実行構成表（#3972 行 completed 更新済み）・src/common/skills/agentdev-epic-tracker/scripts/lib/tracking-table.ts
- **タグ**: #epic-tracker #実行構成表 #blocked-行 #reset-closing #機械工程

---

## 2026-11-08: contract-state-residue-check の humanConfirmedPaths は untrackedListing の観測形（省略形 vs ファイル形）に一致させる必要がある

- **問題事象**: Epic close 機械工程（Issue #3964）の contractStateCheck.humanConfirmedPaths にディレクトリ接頭辞 `.agentdev/close-acceptance/` を指定したところ、untrackedListing がファイル形 `.agentdev/close-acceptance/issue-3964.json` を観測したため正確一致せず、帰属不能検出（humanConfirmationItems）に計上されて contract-state-residue-check が fail（fail-closed）し exitCategory が failure になった
- **発生局面**: case-close Epic Wave クローズ・機械工程 pre-merge 1段階目（Epic #3964 close・2026-11-08 実測・報告退避 .agentdev/tmp/epic3964-close-premerge-report.json → integrity/reports/epic-3964-close-premerge.json は 2段階目）
- **検知方法**: 報告 JSON の diff.contractStateResidue.humanConfirmationItems と warnings（"untracked residue with undeterminable attribution requires human confirmation"）・evaluateContractStateResidue の一致判定は normalizeRelPath 後の正確一致のみ（isUnderPath は statePaths と approvalEntries にのみ適用）
- **根本原因**: 省略形観測（`?? dir/`）を前提にしたディレクトリ接頭辞指定は matchesSelfAcceptanceRecordEntry（local-state-check 専用の省略形一致）とは異なり residue 検査では受理されない。観測形の事前確認なしに path 形式を仮定した
- **自律対応内容**: humanConfirmedPaths をファイル単位 `.agentdev/close-acceptance/issue-3964.json`（実在の自己終了判定記録・機械工程報告 diff.closeAcceptanceRecord で実在確認済み・post-merge で退避後に回収）へ修正し、fresh updated_at で冪等再実行 → contract-state-residue-check pass（humanConfirmed 1 件・humanConfirmationItems 空）
- **ユーザー確認の有無**: なし（機械工程 2段階実行〔運用学び (d)〕による冪等修正）
- **REQ/Decision/Design影響**: なし（close_mechanical_steps.ts 契約の運用確認）
- **横展開観点**: humanConfirmedPaths を渡す前に `git ls-files --others --exclude-standard` で観測形を確認する（省略形ならディレクトリ接頭辞・ファイル形ならファイルパス）。機械工程自己記録の観測は実行順序（close-acceptance-record step が residue 検査の前に書込む）により毎回出現する
- **再発条件**: humanConfirmedPaths を観測形確認なしで省略形想定のディレクトリ接頭辞で指定した場合
- **予防策候補**: 機械工程入力構築手順に「humanConfirmedPaths 指定前の untrackedListing 観測形確認」を含める。1段階目 fail は観測形を特定する実測として活用できる（運用学び (d) の 2段階実行と親和）
- **想定反映先**: learning-promote（close_mechanical_steps 入力構築手順の知識化判定）
- **関連**: Issue #3964 Epic close 完了記録 comment 6720643954・src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（evaluateContractStateResidue）
- **タグ**: #contract-state-residue #humanConfirmedPaths #機械工程 #fail-closed #2段階実行

---

## 2026-11-08: Epic close 構成（worktreeRoot == main root）の post-merge cleanup は main worktree remove 拒否と branch=main 残存が構造的に warn になる

- **問題事象**: Epic close の post-merge 機械工程で cleanup-worktree-branch が warn（worktreeRemoveExitCode 128・branchListOutput "* main"）になり exitCategory が needs-judgment になった。worktreeRoot == repoRoot == main root の構成では削除対象が存在しないため、この warn は構造的に避けられない
- **発生局面**: case-close Epic Wave クローズ・STEP-E6 post-merge 機械工程（Epic #3964 close・2026-11-08 実測）
- **検知方法**: 報告 JSON の cleanup-worktree-branch detail（worktreeRemoveExitCode 128 = main working tree への git 拒否・branchListOutput "* main"）と git worktree list / git branch list の独立実測の突合
- **根本原因**: post-merge cleanup step は単一 Issue close（worktree + feature branch 削除）を前提とし、Epic close 構成（main root 直接・branch main）の N/A 経路を持たない。mergeable-polling の prNumber 0 N/A pass（#3979 で実装済み）と異なり、cleanup は cleanup.removeWorktree: false でも branchListOutput 判定が warn を出す
- **自律対応内容**: 意味レビューで構造的 N/A と確定: (1) 本 Epic 由来の worktree/branch は全削除済み（git worktree list 実測・feature/issue-3972 は前段 STEP-6 で削除済み） (2) worktreeRemoveExitCode 128 は main worktree（remove 不可の正）への拒否で実害なし (3) branch=main の存在は Epic close 構成の正常状態であり cleanup 残存ではない。cleanup.removeWorktree: false・removeBranch: null の入力構成で機械実行記録を残し、needs-judgment を報告として受理
- **ユーザー確認の有無**: なし（機械工程報告の意味レビューはモデル担当〔機械工程の script 呼び出し契約〕）
- **REQ/Decision/Design影響**: なし（case-close Design「機械工程の script 呼び出し契約」の運用確認・Epic close 構成の cleanup N/A 経路は後続の機構整理候補）
- **横展開観点**: Epic close（worktreeRoot == main root）をまたぐ Case の post-merge は常に同一 warn 構成になる。warn の意味レビューで参照する実測（git worktree list・branch list・本 Epic 由来 worktree/branch の不在）を報告に含める
- **再発条件**: Epic Issue または PR なし完了構成で post-merge 機械工程を実行した場合（毎回構造的に発生）
- **予防策候補**: close_mechanical_steps.ts の post-merge cleanup に Epic close 構成判定（worktreeRoot == repoRoot）を入力検証レベルで追加し、cleanup を N/A pass として記録する経路の整備
- **想定反映先**: learning-promote（Epic close 構成の post-merge 機械工程運用の知識化判定）
- **関連**: Issue #3964 Epic close 完了記録 comment 6720643954・機構是正 Case #3979 / PR #3982（mergeable-polling prNumber 0 N/A pass の先例）・.agentdev/integrity/reports/epic-3964-close-postmerge.json
- **タグ**: #epic-close #post-merge #cleanup #機械工程 #needs-judgment

---

## 2026-11-10: case-open 円等検出の issue_list search トークン（topic_slug 単独）が既存 Root Case を取りこぼし重複 Root Case・重複設計PR を作成した

- **問題事象**: case-open STEP-2 の円等検出で issue_list search トークン「adf-simplification-c-beta-doc-contracts」（draft topic_slug）を1件だけ使用してヒット 0件と判定し、Root Case #3989 と設計PR #3990 を新規作成した。実行後、同一 draft から作成済みの Root Case #3988（タイトル「Case: ADF全体簡素化調査の文書系契約間不一致を正本契約へ整合させる」・タイトルと本文に topic_slug を含まない）と設計PR #3991 が既存であることが判明した。#3989 は対照実行側により「[duplicate] …（#3988 へ集約）」へタイトル更新済み。definition/issue-3988 と definition/issue-3989 の tree 差分は 0件（git diff --stat 空出力・計測 baseline: ローカル main HEAD f7392b9be・origin/main c3ee42737・2026-11-10・`git diff origin/definition/issue-3988 origin/definition/issue-3989 --stat`）
- **発生局面**: 運用（case-open STEP-2 円等検出。工程委譲 DEL-OU001-S1）
- **検知方法**: STEP-5 円等再実行確認の未クローズ Case 群取得（issue_list search「Case:」）で #3988 の存在を検知し、git fetch 後の branch 間 diff --stat で tree 完全一致を機械確認
- **根本原因**: 円等キー語を draft topic_slug に限定した単一トークン検索を採用した。GitHub search/issues は in:title tokenized match であり、既存 Root Case のタイトル（Case 接頭辞＋主題）に topic_slug が含まれず、本文にも topic_slug が埋め込まれていなかったため検索が空振りした。search トークン選択性指針（issue-operation-safety.md「issue_list の絞り込み規律」節）は選択性を要求するが、ヒット 0件時の主題語・REQ 行 ID 併用の再検証までは契約化されていなかった
- **自律対応内容**: 既存 #3988 を正規 Root Case として再利用判定し、設計PR #3991 を正規受入対象と認定した。#3990 と #3991 の tree 差分 0件を機械証明して重複 PR の内容不備がないことを確認。#3990 は merge せず重複記録を完了報告へ記載した（PR close 操作は agentdev_gh 操作カタログに存在しないため後続工程の判断へ委譲）
- **ユーザー確認有無**: なし（workflow 円等契約からの機械的再利用判定）
- **REQ/Decision/Design影響**: REQ-030-010（円等再実行確認）の運用面に影響の余地。agentdev-issue-management の issue-operation-safety.md「issue_list の絞り込み規律」節への追加規律候補（影響の記録まで。反映判断は learning-promote の責務）
- **横展開観点**: 既存成果物の円等検出を行う全 workflow（case-ready・case-revise・case-close）へ同種の複数トークン検証を適用できる
- **再発条件**: draft の topic_slug が既存 Root Case のタイトル・本文に含まれない書式で起票されている場合に、topic_slug 単独の search トークンで円等検出を実施した場合
- **予防策候補**: 円等検出の search は topic_slug に加え、合意済み対象・目的から導出した主題語と対象 REQ 番号を併用する複数トークン検索とする。ヒット 0件の場合でも主題語・REQ 行 ID による再検索を実施する二段検証を STEP-2 円等検出の標準手順へ追加する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md（STEP-2 円等検出手順）、agentdev-issue-management issue-operation-safety.md（issue_list の絞り込み規律）
- **関連**: #3988、#3989、#3990、#3991、.agentdev/drafts/req-draft-adf-simplification-c-beta-doc-contracts.md
- **タグ**: #case-open #idempotency #issue_list #重複生成 #円等検出

---

## 2026-11-10: case-ready 受入検査の check_integrity 既存警告が機械工程の後続抑止を引き、対照救済＋手動相当手順への切替が毎回必要になる構造

- **問題事象**: case-ready STEP-1 の受入検査（accept_definition_checks.ts・acceptance-checks phase）で check_integrity が既存警告1件（gh-direct-invocation・case-close scripts README 由来・warning cap 超過）により終了コード1となり、script は definition-acceptance-checks fail で後続ゲート（overlap-cross-check・generate_indexes・traceability-check）を実行せず停止した。既存警告は本 Case 変更と無関係な baseline 警告であるため受入判断としては過剰停止であり、残り3ゲートは手動相当手順での個別実行に切替した
- **発生局面**: case-ready STEP-1 設計PR受入の機械工程（Case #3988 / PR #3991）
- **検知方法**: script 報告 JSON の definition-acceptance-checks step fail（check_integrity exitCode 1・summary {ng:0, warning:1}）と definition-acceptance.md「受入検査の機械工程と検査証拠の保存」の後続抑止契約
- **根本原因**: accept_definition_checks.ts は非ゼロ終了の integrity gate を無条件で fail 扱いして後続ゲートを抑止する。対照救済（contrastive-no-worse-proof: main 対照実行で NG/Warning finding 集合の完全一致・悪化0件を機械証明）と手動相当手順（manual-equivalent-procedure: 残りゲートの個別実行・証跡保存）は GATE_ALTERNATIVE_ROUTES に定義されているが、script 側には baseline 悪化0件を機械判定した上で継続する経路が実装されておらず、実行毎にモデルの手動切替が必要になる
- **自律対応内容**: (1) check_integrity の報告を証跡保存（acceptance-report-3988.json の step detail） (2) main HEAD 対照実行で NG 0・Warning 1・finding 集合完全一致（IDENTICAL_SET=true）を機械証明 (3) overlap-cross-check・generate_indexes（AUTOGEN 再生成差分0件）・traceability-check（11検査 pass・fail 0）を個別実行・証跡保存 (4) 対照救済 warn として受入判断へ進み（検査を pass に書き換えない）、merge 実行
- **ユーザー確認の有無**: なし（GATE_ALTERNATIVE_ROUTES の代替経路適用・case-open 実績と同一経路・同一根拠）
- **REQ/Decision/Design影響**: なし（既存の対照救済経路の運用確認。script の自動対照判定追加は機構整理候補として記録まで）
- **横展開観点**: case-revise 由来の設計修正PR 受入（case-ready 再実行）でも同一構造で発生し得る。対照救済の証明材料（worktree/main の finding 集合突合結果）を検証記録へ機械突合可能な形で保存すると受入判断の根拠が強化される
- **再発条件**: 既存 warning が warning cap を超過した状態で受入検査を実行した場合（現行の gh-direct-invocation 警告残存下では継続的に発生し得る）
- **予防策候補**: 既知警告の解消（case-close scripts README の gh CLI 表現是正）または checker 側 warning cap 更新を別 Case で実施する。あるいは accept_definition_checks.ts に対照実行の自動突合 step を追加し、悪化0件機械証明時に needs-judgment で継続する経路を整備する
- **想定反映先**: learning-promote（機構整理候補の要件化判定）
- **関連**: Case #3988・PR #3991・.agentdev/integrity/reports/acceptance-report-3988.json・case-ready references/definition-acceptance.md「受入検査の機械工程と検査証拠の保存」節・2026-11-07 の measurement-convergence 学び（機械工程 fail の手動救済の先例）
- **タグ**: #case-ready #受入検査 #対照救済 #機械工程 #既存警告

---

## 2026-11-10: case-ready 実行中に並行レーンが main worktree の domain state を commit・push 済みで、前置永続化が冪等に不要化する実観測（Case #3988）

- **問題事象**: case-ready STEP-2 前置として、draft 未コミット修正（ACT-DESIGN-005 追加・case-open coverage 検出由来）と未追跡 jev 観測2件の明示パス指定 commit を実行しようとした時点で、working tree が clean になっており、並行レーンによる commit（c900bd9c6 draft 修正・f8e2a5570 learning）と push が完了していた。操作自体は失敗しないが、計画した前置永続化は不要になっていた
- **発生局面**: 運用（case-ready STEP-2 前置。case-auto orchestration の並行レーンと本レーンの同一 domain state 操作競合）
- **検知方法**: git branch --show-current・git status --short・git log の前置確認で、git status --short が空・c900bd9c6 が存在している事実を検出（git add が何もステージせず commit が nothing to commit で失敗する形で表面化）
- **根本原因**: 複数レーンが同一 main worktree で domain state 永続化を行い得る構造であり、前置確認は永続化対象の存在確認だけでは並行レーンの進行を予測できない
- **自律対応内容**: 重複実行なし。git status・git show で並行レーンの commit 内容を確認（draft 修正 18行追加・正規手順と同一の明示パス指定 commit 形式・push 済み）し、前置永続化を再実行せず STEP-2 以降を継続。結果的に競合・lost update なし
- **ユーザー確認の有無**: なし（冪等前置確認からの機械的再利用判定）
- **REQ/Decision/Design影響**: なし（並列実行安全ステージング手順の運用確認）
- **横展開観点**: stage 間並行実行（case-auto orchestration）では同一 domain state 対象を複数レーンが扱い得る。domain state 永続化の前置は「存在すれば再利用・不在なら実行」の冪等形で実装し、実行直前の git status 再確認が競合防止の最小手順
- **再発条件**: 同一対象の domain state を複数レーンが並行で永続化しようとした場合
- **予防策候補**: domain state 永続化の所有レーン明確化、または並行レーン検知時の待機・再確認手順の明文化（ REQ/Design 判断は learning-promote に委譲）
- **想定反映先**: learning-promote（並列実行レーン間の domain state 操作規律の知識化判定）
- **関連**: Case #3988・commit c900bd9c6・f8e2a5570・f7392b9be・agentdev-git-worktree git-common-procedures.md 手順3（concurrent-safe staging）
- **タグ**: #case-ready #並行実行 #domain-state #冪等前置

---

## 2026-11-10: worktree の junction 投影伝播状態が bun test 基線突合の試験数に直結し、投影適用後は基線形態の再現前置が必要（Case #3988・PR #3992 本文 Findings より回収）

- **問題事象**: worktree 環境の bun test 基線突合では、junction 投影の伝播状態（worktree-partial）が試験数に直接影響する（未投影時 3,000 試験 → 投影適用後 4,751 試験）。bun test ./.opencode/ を基線突合に使う worktree 実行では、`scripts/self-sync.ps1 -Mode apply` と third-party Skill 取得の前置が基線形態の再現に必要
- **発生局面**: case-run DEL-3988-2 の QG-4 検証（3 分割 bun test・件数突合）
- **検知方法**: 投影適用前後の bun test 試験数差（3,000 → 4,751）の実測
- **根本原因**: worktree への junction 伝播は部分的に開始し、self-sync apply と third-party Skill 取得を経て基線形態へ回復する。伝播状態がそのまま bun test の実行対象数に現れる
- **自律対応内容**: 検証差分に手順を記録済み（PR #3992 本文実行環境ラベル節）
- **ユーザー確認の有無**: なし（capture 回収）
- **REQ/Decision/Design影響**: なし（既存知識 worktree-environment-fail-classification.md の補強候補）
- **横展開観点**: worktree での基線突合は投影伝播状態の環境ラベルと前置手順の記録を必須化する
- **再発条件**: worktree の bun test 基線突合を投影状態を管理せずに実行する場合
- **予防策候補**: worktree 環境 fail 分類 knowledge への投影前置手順の追記（promote 判断）
- **想定反映先**: learning-promote（worktree-environment-fail-classification.md への補強判定）
- **関連**: PR #3992 本文 Findings/learning・Case #3988
- **タグ**: #worktree #junction #bun-test #基線突合 #投影前置

---

## 2026-11-10: checker の安定実行経路（node --experimental-strip-types）は bun 固有 API・CommonJS require を含む checker で利用不可・checker ごとの実行経路の使い分けが必要（Case #3988・PR #3992 本文 Findings より回収）

- **問題事象**: checker の安定実行経路（node --experimental-strip-types）は bun 固有 API（import.meta.path・import.meta.main）と CommonJS require を含む checker では利用できない。distribution boundary は runCli export + bun import wrapper、check_integrity は bun run 直実行で stdout 退避が成立した。stdout 退避の wrapper 手順（process.exit 差し替え + writeFileSync）は checker 実行契約の例外経路として有効
- **発生局面**: case-run DEL-3988-2 の checker 実行経路選択（配布依存境界・check_integrity）
- **検知方法**: node 経由実行の失敗と bun 経路での成立の実測
- **根本原因**: checker 側の Bun ランタイム API・require 依存が node の strip-types 経路で解決しない（checker 実行契約 Design「安定実行経路」の既知制約の具体実測）
- **自律対応内容**: checker ごとに bun import wrapper / bun run 直実行を使い分け、stdout 退避は spawnSync + writeFileSync（UTF-8 明示）で成立させた
- **ユーザー確認の有無**: なし（capture 回収）
- **REQ/Decision/Design影響**: なし（checker 実行契約「安定実行経路」の例外経路運用）
- **横展開観点**: 既存学び（#3968 module import ラッパ・#3970 bun ランタイム指定）と同一領域。checker 個別の依存 API に応じた経路選択表の整備が promote 判断の候補
- **再発条件**: bun 固有 API・require を含む checker を node 経路で実行する場合
- **予防策候補**: checker 実行契約の安定実行経路節に checker 依存 API と経路の対応表を追記する判断（promote 判断）
- **想定反映先**: learning-promote（checker 実行契約 Design への補強判定）
- **関連**: PR #3992 本文 Findings/learning・Case #3988・#3968/#3970 の textlint ラッパ学び（比較対象）
- **タグ**: #checker実行経路 #bun #node-strip-types #安定実行経路 #stdout退避

---

## 2026-11-10: Windows・bun 1.3.6 の当該環境で bun install --cwd の相対パス指定が ENOENT・絶対パス指定は成功（Case #3988・PR #3992 本文 Findings より回収）

- **問題事象**: Windows・bun 1.3.6 の当該環境で `bun install --cwd src/common/skills/agentdev-project-extensions/scripts` が ENOENT となり、同じ package の絶対パス指定は成功した。依存整備では絶対パスを使用（変更側と detached baseline 側の双方）。これは本環境での実測であり、全 Windows/Bun 版へ一般化しない
- **発生局面**: case-run DEL-3988-2 の依存パッケージ前置（worktree・baseline detached worktree の両方）
- **検知方法**: bun install --cwd 相対パス実行の ENOENT と絶対パス実行の成功（runs 10/11・exit=0）の実測
- **根本原因**: bun install --cwd の相対パス解決が本環境（bun 1.3.6・Windows）で機能しない実測。REQ-060 の bun install 前置手順は相対パス例を示すが、環境差で絶対パスが必要になり得る
- **自律対応内容**: 依存整備を絶対パス指定で実施（環境ラベルへ整備手段を記録）
- **ユーザー確認の有無**: なし（capture 回収）
- **REQ/Decision/Design影響**: なし（bun install 前置手順の環境差注記候補）
- **横展開観点**: bun install --cwd を手順化する際は相対パス失敗時の絶対パスフォールバックを併記するのが安全
- **再発条件**: 同環境で bun install --cwd に相対パスを渡す場合
- **予防策候補**: REQ-060 関連 reference への環境差注記追加（promote 判断）
- **想定反映先**: learning-promote（bun install 手順の環境差注記判定）
- **関連**: PR #3992 本文 Findings/learning・Case #3988・既存 learning「worktree で bun install 前置後に tsc --noEmit が依存解決可能になる」
- **タグ**: #bun-install #windows #絶対パス #ENOENT #依存前置

---

## 2026-11-10: 分割③の .opencode/plugins junction は src/opencode/plugins の test files を重複走査する・tracked union と実行延べ件数を区別して件数突合する（Case #3988・PR #3992 本文 Findings より回収）

- **問題事象**: 分割③の `.opencode/plugins` 配下 6 junction は src/opencode/plugins の 23 test files を重複走査する（44 files = scripts tracked 21 + 投影 23）。tracked union 253 と実行延べ件数 276 を区別する。旧 .opencode anchor 221 files も integrity 122 + skills 投影 58 + tools 投影 18 + plugins 投影 23 で説明でき、投影数を欠落や新規テストと誤認せず件数突合できる
- **発生局面**: case-run DEL-3988-2 の bun test 3 分割・件数突合（投影伝播済み worktree 環境）
- **検知方法**: 分割③の実行対象ファイル数（44）と tracked 列挙（21 scripts）の差分を投影 23 files として分離・union 突合
- **根本原因**: 投影伝播済み環境では分割③に投影重複が含まれ、実行延べ件数が tracked union を超える。既存学び「bun test 分割③の junction 未伝播環境差は件数安定でも実行対象数を検証差分へ明記する」（未伝播の欠落側）の対の環境差（伝播済みの重複側）
- **自律対応内容**: 件数突合に tracked union 全被覆と実行延べ件数の区別を記録（PR #3992 本文件数突合行）
- **ユーザー確認の有無**: なし（capture 回収）
- **REQ/Decision/Design影響**: なし（既存知識の対側環境差の補完）
- **横展開観点**: 件数突合の説明モデルは「未伝播 = 欠落側」「伝播済み = 重複側」の双方を検証差分へ記録できると突合が完全になる
- **再発条件**: 投影伝播済み worktree で bun test 分割③を実行し件数突合する場合
- **予防策候補**: 既存知識 worktree-environment-fail-classification.md への重複側環境差の追記（promote 判断）
- **想定反映先**: learning-promote（既存知識への補強判定）
- **関連**: PR #3992 本文 Findings/learning・Case #3988・既存 learning「bun test 分割③の junction 未伝播環境差」（2026-11-08・対側環境差）
- **タグ**: #bun-test #分割③ #junction投影 #重複走査 #件数突合

---

## 2026-11-11: check_changed_docs.ts は docs workflow 対象外ファイルを --files に渡すと TARGET-EMPTY strict failure を報告する誤用検出挙動を持つ・docs 変更 0 件の実装 PR では実行経路側の事前確認が必要（Case #3994・PR #3998 本文 Findings より回収）

- **問題事象**: check_changed_docs.ts は `--files` に docs workflow 対象外のファイル（.ps1 等）を渡すと TARGET-EMPTY strict failure を報告する誤用検出挙動を持つ。docs 変更 0 件の実装 PR では targeted docs guard は適用対象なしであり、実行経路側で docs 変更の有無を事前確認してから呼ぶ前提の設計である（計測 baseline: PR #3998 HEAD ea8b89cf3・case-run DEL-3994-1・2026-11-11・targeted docs guard 実行経路での観測）
- **発生局面**: case-run DEL-3994-1 の targeted docs guard 実行経路判断（docs 変更 0 件の実装 PR）
- **検知方法**: case-run の実行時実測と PR #3998 本文 Findings/learning への記録（case-close STEP-6-4 で回収）
- **根本原因**: targeted docs guard の検査対象は docs workflow 対象ファイルに限定されており、対象外ファイルのみの指定は検査対象 0 件（TARGET-EMPTY）として strict failure になる設計。誤用検出としての挙動は正しいが、実行経路側の docs 変更有無の事前確認規律が明文化されていない
- **自律対応内容**: docs 変更 0 件の本 PR では targeted docs guard を適用対象なしとして実行せず、PR #3998 本文検証差分へ「docs 変更 0 件のため適用対象なし」と記録した（guard 側の修正はしていない）
- **ユーザー確認の有無**: なし（capture 回収）
- **REQ/Decision/Design影響**: なし（実行経路側の事前確認運用の明確化候補のみ）
- **横展開観点**: 対象限定型 checker 全般で、実行経路側は適用対象の有無を事前確認してから呼ぶ。zero-targets を検査省略ではなく無効実行として扱う既知契約と同型の運用注意
- **再発条件**: docs 変更 0 件の実装 PR で targeted docs guard を `--files` 指定付きで実行する場合
- **予防策候補**: 機械工程・workflow 側の実行経路に docs 変更有無の事前確認前置を追加する判断、および TARGET-EMPTY 時の案内に誤用検出である旨の明記（promote 判断）
- **想定反映先**: learning-promote（checker 実行契約・機械工程手順への補強判定）
- **関連**: PR #3998 本文 Findings/learning・Case #3994・check_changed_docs.ts
- **タグ**: #targeted-docs-guard #check_changed_docs #対象限定 #誤用検出 #実行経路

---

## 2026-11-11: prepare_definition_pr.ts は measurement-convergence step で収束補正を完結させた後も元の check_integrity 終了コードで後続 gate を抑止して終了する・収束成立時の継続は呼出側の再実行と対照救済手順に依存する（Case #4002 より回収）

- **問題事象**: case-open STEP-4 機械工程 script（prepare_definition_pr.ts）で、check_integrity の NG 5件（req-updated-freshness 4件・IndexGenerationConsistency 1件）に対し measurement-convergence step が frontmatter updated 4ファイル追随・補正 commit・generate_indexes 再実行（exit 0）で全件解消した後も、script は元の check_integrity 非ゼロ終了コードを理由に後続 gate（traceability check）を抑止して終了コード 1 で返した。収束後の commit 済み HEAD での check_integrity 再実行は NG 0・Warning 1（既出債務）であり、実質的な gate 不合格は残っていない（計測 baseline: worktree HEAD 644ec5b4b・branch definition/issue-4002・Case #4002・2026-11-11・`bun .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --profile source --root .worktrees/4002-definition` での観測）
- **発生局面**: 実装（case-open STEP-4 機械工程・Definition 設計PR作成）
- **検知方法**: script 報告 JSON の step 一覧（measurement-convergence 4 step が pass、check_integrity step が fail・warning「check_integrity failed」）と終了コード 1 の突合
- **根本原因**: script の終了コード駆動が収束補正前の check_integrity 終了コードに固定されており、収束 step の成功を根拠に後続 gate を続行する分岐を持たない。あわせて check_integrity の終了コード規律は warning > 0 でも EXIT_NG を返すため、既存 warning 債務（#3998 由来の CanonicalConflict gh-direct-invocation・case-close scripts README:7）が 1 件以上ある環境では Definition PR 段階の script gate が構造的に非ゼロになる
- **自律対応内容**: 冪等再実行手順に従い、報告 JSON と git 状態から適用済み工程（worktree 再利用・編集適用済み・収束 commit 完了）を確認した上で、残 gate（check_integrity 再確認・traceability check）を同一 spec・同一証跡契約（stdout/stderr 全文・終了コード・対象版・実行条件）で commit 済み HEAD に対して再実行した。check_integrity の既出 warning は main HEAD との対照実行で findings 差分 0 件（本変更起因の検出悪化 0 件）を機械証明して PR 作成可と判断し、traceability check は共有 lib の consumeDefinitionTraceability で gate 判定仕様どおりに消費した（missing-design 0 件・missing-implementation/verification は deferred 義務）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（対照救済・手動 contingency・冪等再実行の既存契約の適用内。script 挙動の改善候補の記録のみ）
- **横展開観点**: 収束・補正型 step を持つ機械工程 script 全般で、補正後の再検証と後続 gate 続行を script 内で完結させるか、呼出側の継続手順として明文化する。check 系 gate が warning も fail 扱いにする終了コード規律の環境では、対照実行による悪化 0 件証明の併用が実務上必須
- **再発条件**: measurement-convergence の trigger 条件（計測日不整合・req-updated-freshness NG）が成立し、かつ既存 warning 債務が 1 件以上ある環境で prepare_definition_pr.ts を実行する場合
- **予防策候補**: prepare_definition_pr.ts の収束 step 完了時に後続 gate 続行（または収束後再実行の自動化）へ進む分岐の追加判断、check_integrity の warning-only exit に対する対照救済の script 組込み判断（promote 判断）
- **想定反映先**: learning-promote（機械工程 script 契約・checker 実行契約への補強判定）
- **関連**: Case #4002・PR #4003・src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts・docs/designs/commands/case-open.md「機械工程の script 呼び出し契約（RU-0162）」節
- **タグ**: #prepare_definition_pr #measurement-convergence #対照救済 #機械工程 #check_integrity

---

## 2026-11-11: generate_indexes 派生物は script 実行後に作業 tree へ未 commit で残るため、明示パス指定 commit の実行前に派生物の commit 状態を確認して含めるか分離するかを明示判断する（Case #4004 より回収）

- **問題事象**: case-open STEP-4 の機械工程後、stagePaths 外の generate_indexes 派生物（req-health-metrics.md・requirements/README.md）が作業 tree へ未 commit で残存していた。その状態で docs/README.md 手動管理区間の件数照合補正を明示パス指定 commit（`git commit -- docs/README.md`）したところ、対象パス内に generate_indexes が書き換えた AUTOGEN 件数行と REQ-120 行が含まれており、補正 commit に派生物変更が意図せず混在した（計測: HEAD f8a2d9bb5・worktree .worktrees/4004-definition・branch definition/issue-4004・Case #4004・2026-11-11・`git show f8a2d9bb5 --stat` で 3 insertions/2 deletions を観測）
- **発生局面**: 実装（case-open STEP-4・docs/README.md 手動管理区間の件数照合補正）
- **検知方法**: 補正 commit の git show --stat で差分行数が手動区間1行置換より多いことの突合
- **根本原因**: generate_indexes は commit 前配置契約で実行されるため派生物が script 実行後に作業 tree へ残る構造であり、明示パス指定 commit が対象パス内の派生物変更を含み得る点の実行時確認規律が手順に明文化されていない
- **自律対応内容**: 混在した commit を取り消さず、同一 commit に含まれた派生物変更を標準 contingency（派生物の同一 PR 取り込み）どおりの正当な構成として記録し、残りの stagePaths 外派生物を別の明示パス指定補正 commit（e4453c82）で回収した
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（generate_indexes 派生物の事後突合 contingency の適用内。手順補強の候補のみ）
- **横展開観点**: 明示パス指定 commit を行う機械工程手順では、commit 対象パス内の作業 tree 残存変更（特に generate_indexes 等の自動書換え派生物）の有無を `git status --short` で事前確認し、同一 commit へ含める contingency 適用か分離補正 commit かを明示的に判断してから commit する
- **再発条件**: REQ 行追加を伴う Definition 変更で generate_indexes 派生物が stagePaths 外に残る状態で、派生物パスを含む別パスの明示パス指定補正 commit を実行する場合
- **予防策候補**: 手動管理区間照合補正手順への派生物 commit 状態の事前確認前置の追加判断、および混在検出時の報告様式の明記（promote 判断）
- **想定反映先**: learning-promote（機械工程手順・Definition PR 構成への補強判定）
- **関連**: Case #4004・PR #4007・docs/designs/commands/case-open.md「機械工程の script 呼び出し契約（RU-0162）」節・definition-pr-and-idempotency.md「generate_indexes 派生物の事後突合」節
- **タグ**: #generate_indexes #派生物 #明示パス指定commit #stagePaths #手動管理区間

---

## 2026-11-11: 並行 case-auto 稼働環境では設計PR push 前に git fetch で origin/main の進行と重複パスを確認し、競合を push 前に解消して clean mergeable な PR を作成する手順が有効（Case #4004 より回収）

- **問題事象**: 並行 case-auto（C-β2・Case #4002）の設計PR #4003 が本 Case の Definition 作業中に origin/main へ merge され（bc7c75aa0）、本 Case の definition branch（起点 474180ed7）との間で重複パス 2件（custom-tool-contracts.md・req-health-metrics.md）の競合が push 前に判明した（計測: merge-base 474180ed7・重複検出は `git diff --name-only` の双方 branch 間突合・Case #4004・2026-11-11）
- **発生局面**: 実装（case-open STEP-4・設計PR push 直前）
- **検知方法**: push 前の並行隔離検査で origin/main 進行の実測（git fetch 後の merge-base 再計算）と重複パス突合
- **根本原因**: 並行 case-auto 複数稼働では Definition 作業中に base が進行し得るため、push 直前の base 進行確認が実質必須になる一方、作成元 origin/main HEAD 固定の隔離規律だけでは進行の追随時点を定めていない
- **自律対応内容**: origin/main を definition branch へ merge し（merge commit 99c40b49）、競合を実際に重なる箇所だけ調整（custom-tool-contracts.md は両 Case の design 宣言を統合保持・req-health-metrics.md は AUTOGEN を generate_indexes 再実行で正規形復元）した後、check_integrity・traceability check を merge 後 HEAD で再実行してから push した。PR #4007 は clean mergeable で作成された
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（並行 case-open の作業隔離規律・MUST DO「競合は実際に重なる箇所だけ調整」の適用内。手順補強の候補のみ）
- **横展開観点**: 並行 case-auto 稼働環境の Definition 工程では、push 直前に `git fetch` → merge-base 再計算 → 重複パス突合 → 重複ありなら branch へ merge・競合解消・ゲート再実行、の順を前置する。push 後の conflict は case-close/case-ready の同期リスク対応へ回帰するより実コストが低い
- **再発条件**: 並行 case-auto が他 Case の Definition PR を merge し得る環境で、重複パスを持つ Definition branch を push する場合
- **予防策候補**: case-open STEP-4 手順への「push 前の origin/main 進行確認と重複パス競合の解消前置」の明文化判断（promote 判断）
- **想定反映先**: learning-promote（並行実行手順・Definition PR 作成への補強判定）
- **関連**: Case #4004・Case #4002・PR #4007・PR #4003・definition-pr-and-idempotency.md「並行 case-open の作業隔離」節
- **タグ**: #並行case-auto #設計PR #merge追随 #競合解消 #push前確認

---

## 2026-11-11: 長文本文の bash heredoc 経由 node への渡しは終端解析に失敗し得るため、検査専用本文ファイルは extension rule 標準回復手段〔b〕（project root 内 git 管理対象外領域への作成）が安定（Case #4004 より回収）

- **問題事象**: PR 本文（約6,000字）を bash の heredoc で node stdin へ渡して検査専用本文ファイルを作成しようとしたところ、heredoc の終端解析が失敗し（warning: here-document delimited by end-of-file と node の Unterminated template）、本文ファイルの作成に失敗した（計測: workspace 外一時ディレクトリ・Case #4004・2026-11-11・bash stderr と node SyntaxError で観測）
- **発生局面**: 実装（case-open STEP-4・yomiyasu lint の検査専用本文ファイル作成）
- **検知方法**: node の SyntaxError（Unterminated template）と bash の here-document warning
- **根本原因**: 長文本文を heredoc 内のテンプレートリテラルへ組み込む構成は、本文中の記号や終端行の解析に脆弱であり、大文字サイズの本文には不向き
- **自律対応内容**: extension rule の標準回復手段〔b〕（作成先を project root 内の git 管理対象外領域 .agentdev/integrity/reports/ へ変更）へ切替し、write ツールによる検査専用本文ファイルの作成・lint 実行・検査後削除で完結させた
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（yomiyasu application rule の標準回復手段の適用内）
- **横展開観点**: 検査専用本文ファイルの作成は、workspace 外一時ディレクトリ経由の heredoc 渡しよりも project root 内 git 管理対象外領域（.agentdev/integrity/reports/）への直接作成が長文で安定する。切替は guard 違反の迂回ではなく rule 側が定義する正規の代替経路である
- **再発条件**: 5,000字超級の本文を yomiyasu lint または同型の検査専用ファイル経路へ渡す場合
- **予防策候補**: 長文本文の検査専用ファイル作成では project root 内領域を第一候補とする運用明記（promote 判断）
- **想定反映先**: learning-promote（yomiyasu rule 運用・書込み guard 対応手順への補強判定）
- **関連**: Case #4004・PR #4007・.agentdev/extensions/skills/agentdev-workflow-case-open.yaml「yomiyasu-application-before-write」rule
- **タグ**: #heredoc #検査専用ファイル #yomiyasu-lint #書込みguard #標準回復手段

---

## 2026-11-11: 並行 case-auto 稼働環境で untracked ファイルを掃除する場合、内容確認と削除実行を同一 bash コマンドへ連結せず所有者確認を別コマンドに分離する（Case #4005 より回収）

- **問題事象**: case-ready STEP-1 の対照実行で main 作業ディレクトリの untracked ファイル 3 件（.agentdev/jev-observations/20261111T1308〜1309Z）を自 run の環境ノイズと誤判定して削除した。削除と同一コマンドで実行したメタデータ確認の出力で、3 件が並行 run（Case #4002・workflow=case-ready）の Jev 観測（Standard/Epic 帰属・Wave 構成・スコープ重複の3判定）であることが判明したが、rm は連結実行済みで中止できなかった（計測: HEAD 7e851e67b 作業時点・Case #4005・2026-11-11・node による workflow/subject 確認で観測）
- **発生局面**: 実装（case-ready STEP-1・check_integrity 対照実行の untracked-residue NG 解消）
- **検知方法**: 削除後の観測メタデータ確認（workflow=case-ready・subject=Case #4002 の表示）
- **根本原因**: untracked ファイルの所有者確認を rm と同一 bash コマンドに連結したため、確認結果を踏まえた中止判断が実行序列に入らなかった。並行 case-auto run が共有 main 作業ディレクトリへ書き込む Jev 観測は自 run の一時物と外観が同一（jev-observations/ 配下の当日タイムスタンプ名）であり、タイムスタンプの新旧だけを所有判定根拠にしてはならない
- **自律対応内容**: 削除した 3 件の復元は不能（untracked のため）。並行 run への影響は observation_write が fail-open（観測書込み失敗は独立警告）であり判断成立を阻害しない契約であることを確認し、並行 run による当該3評価の再実行（evaluationKind と questionId は維持、新規 observationId で観測再作成）を回復経路として完了報告へ記録した
- **ユーザー確認の有無**: なし（並行 run 資源の非干渉実行条件(4)の違反。完了報告で報告済み）
- **REQ/Decision/Design影響**: なし（jev-observations は永続 git 管理対象の観測 domain state であり、削除条件は設定されない〔REQ-090-006〕。手順補強の候補のみ）
- **横展開観点**: untracked ファイルの削除判定は「内容確認 → 中止判断 → 削除実行」を別 bash コマンドに分離して実行する。同一コマンドへの連結は確認結果を反映しない実行序列になる。並行 case-auto 環境では .agentdev/jev-observations/ の当日タイムスタンプ物を自 run の一時物と断定せず、観測メタデータの workflow・subject で所有 run を照合する
- **再発条件**: 並行 case-auto run が稼働する環境で、main 作業ディレクトリの untracked ファイルを integrity NG 対応として掃除する場合
- **予防策候補**: untracked 掃除手順への所有者確認（観測メタデータ照合）の前置と、確認コマンドと削除コマンドの分離規律の明文化判断（promote 判断）
- **想定反映先**: learning-promote（並行実行環境の untracked 掃除手順・機械工程への補強判定）
- **関連**: Case #4005・Case #4002・.agentdev/README.md の jev-observations 行（永続・git 管理対象・削除条件なし）・check_integrity untracked-residue
- **タグ**: #並行case-auto #untracked #Jev観測 #誤削除 #所有者確認

---

## 2026-11-11: 並行 case-auto 稼働環境の squash merge 後ブランチ削除判定は diff 全体空ではなく、PR 変更ファイル単位の diff 空 + branch コミット変更ファイルの漏出 0 件で判定する（Case #4005 より回収）

- **問題事象**: squash merge 後の definition branch 削除判定（複数コミット構成・git diff origin/main {branch} が空であること）で、並行 run の push（#4003 merge・draft 削除 commit・learning capture）により diff が非空（7 ファイル）となり、判定条件を文字どおり適用すると -D 前の過剰停止になる状態が生じた（計測: HEAD 4881550ee・branch definition/issue-4005・Case #4005・2026-11-11・git diff --name-only で観測）
- **発生局面**: 実装（case-ready STEP-7・設計側 worktree とローカルブランチの削除）
- **検知方法**: diff 非空差分 7 ファイルの帰属分析（diff-tree による branch コミット変更ファイルとの突合）
- **根本原因**: worktree-operations.md「squash merge 後の条件付き -D 許可」の diff 空条件は単一 run 前提であり、並行 run が main を進行させる環境では branch 分岐後の main 側変更が恒常的に diff を非空にする
- **自律対応内容**: 判定を分解して機械確認した。限定確認（origin/main..branch が自 Case 2 commit のみ）合格、PR 対象 4 ファイルの diff が空（branch 側変更は main へ squash merge で取り込み済み）、非空差分 7 ファイルすべてが main 側進行分（#4003 関連 4 ファイル・draft 削除 2 件・inbox.md 追加）で branch 独自変更の漏出 0 件を確認した上で squash merge 済みと判定し -D を実行した。判定根拠は検証記録へ記録済み
- **ユーザー確認の有無**: なし（既存手順の趣旨〔branch 側未取り込み変更の不在確認〕を維持する分解検査の適用）
- **REQ/Decision/Design影響**: なし（worktree-operations.md の判定手順の並行実行環境での適用補強の候補のみ）
- **横展開観点**: 並行 case-auto 環境の squash merge 後ブランチ削除では、diff 全体空ではなく「PR 変更ファイル単位の diff 空 + branch コミット変更ファイル（diff-tree 出力）の diff 漏出 0 件」で判定する。非空差分は main 側進行分の帰属を機械突合で確認する
- **再発条件**: 並行 case-auto run が main を進行させ得る環境で squash merge 済みブランチを削除する場合
- **予防策候補**: worktree-operations.md「squash merge 後の条件付き -D 許可」への並行実行環境向け分解判定手順の追記判断（promote 判断）
- **想定反映先**: learning-promote（agentdev-git-worktree 手順への補強判定）
- **関連**: Case #4005・worktree-operations.md「squash merge 後の条件付き -D 許可」節・agentdev-git-worktree references git-common-procedures.md
- **タグ**: #squashmerge #ブランチ削除 #並行case-auto #判定分解 #worktree-operations

---

## 2026-11-12: agentdev-textlint-guard distribution test の archive install ケースが bun キャッシュ競合起因の疑いで不定期 fail する（基線 12 件外の新規出現・受入では不再現）(Case 4004・PR 4019 より回収)

- **問題事象**: bun test ③ 分割（.opencode/plugins）で agentdev-textlint-guard distribution / consumer install の archive install 系テストが ENOENT: failed copying files from cache to destination for package has-symbols で fail（2026-11-11〜12・基線 2026-11-11 採取時は合格・既知不合格 12 件リスト外の新規出現）
- **発生局面**: 検証（case-run 前置自己点検の 3 分割実行・Case 4004）
- **検知方法**: bun test fail 明細の読み取り（has-symbols パッケージのキャッシュコピー失敗）
- **根本原因**: bun install のキャッシュコピー段の競合レースの疑い（実行環境の同時実行・キャッシュ状態依存）。case-run は bun install 単独実行が plugin 配下で成功することを確認し環境由来と暫定分類したが、機械的なレース特定は未実施
- **自律対応内容**: 受入検査（基線構成を再現した投影 worktree・同一環境ラベル）で当該テストが 2 回の独立観測（③ 全分割実行・plugin 単独 187 pass / 0 fail）で不再現であることを確認し、新規不合格 0 の判定を維持した。実装側の環境由来説を申告のまま受入証拠へ昇格させず、「新規失敗なし」の自側実測のみを受入根拠とした
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（本 Case 変更対象の plugin・install.ps1 は未変更。既知不合格リストへの追加登録は未実施・再発時に改めて判断）
- **横展開観点**: bun キャッシュ競合の疑いがある失敗は、時間差再実行での不再現をフレーク分類の根拠にする前に同一環境での独立再観測回数を記録する。単独実行の成功だけでは環境由来の確定にならない
- **再発条件**: 並行実行やキャッシュ共有環境で textlint-guard distribution テストを含む bun test を実行する場合
- **予防策候補**: 失敗時の bun キャッシュ状態記録（cache dir の内容証跡）と、テスト内 bun install のキャッシュ分離（一時 cache dir 指定）の検討判断（promote 判断）
- **想定反映先**: learning-promote（textlint-guard distribution テストの安定化判定）
- **関連**: Case #4004・PR #4019 本文の Findings 節（検証詳細）・.agentdev/tmp/c-alpha2-baseline/known-failures-fixed.md（既知 12 件リスト・本件は含まない）
- **タグ**: #bun-cache #distribution-test #フレーク疑い #textlint-guard #並行実行

---

## 2026-11-12: textlint 最終 gate の script 経由 spawn 起動で一時的に exit 9 が観測され得る（単独再実行 exit 0・由来分類未確定）(Case 4004 より回収)

- **問題事象**: close_mechanical_steps pre-merge の textlint-final-check gate が exitCode 9・stderr 空 で 1 回だけ失敗（2026-11-12・同一構成の手動実行と単独再実行は exit 0・632 対象全件実行で合格）
- **発生局面**: 検証（case-close pre-merge 機械工程・Case 4004）
- **検知方法**: 機械工程報告 JSON の gate step FAIL（exitCode 9・stderrTail 空）
- **根本原因**: 未確定。直前に打ち切られた別起動（バックグラウンド起動を harness が kill）の残留プロセス、または spawn 実行形態（timeout・stdio pipe の差）に由来する可能性。gate 本体の終了コード表に 9 は定義されていない
- **自律対応内容**: 単独再実行（timing 隔離）で exit 0 を確認し、受入では exit 0 の独立実行 3 件（632 全件実行を含む）をもって textlint gate の合格証拠とし、exit 9 の失敗実行を隠蔽せず実値のまま記録した。merge 判断は再発なしの確認後に進めた
- **ユーザー確認の有無**: なし（merge 前に再発なし確認を完了・停止条件の適用判断として記録）
- **REQ/Decision/Design影響**: なし（gate 実装・契約の変更なし）
- **横展開観点**: 機械 gate の一時的異常終了（未定義の終了コード・stderr 空）は、単独再実行で解消しても「由来分類未確定」として記録を残す。合格証拠は実行形態規律に適合した再実行の実値とし、失敗実行の握り潰しをしない
- **再発条件**: 機械工程 script が外部 gate を spawn で起動し、同一環境に直近の打ち切り起動が残留する場合
- **予防策候補**: 機械工程の gate 起動前の残留プロセス確認、未定義終了コード検出時の自動単独再実行手順の検討判断（promote 判断）
- **想定反映先**: learning-promote（close_mechanical_steps の gate 起動堅牢化判定）
- **関連**: Case #4004・対応記録コメント（残課題として記録済み）・docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md（類型の既知事象）
- **タグ**: #textlint-gate #exit9 #spawn #由来未確定 #fail-closed記録

---

## 2026-11-12: ADF-COVERS 宣言コメントの終端子（-->）欠落が Design 宣言をパース不能にし、case-close のトレーサビリティ完全性 gate（3完全性ゲート）で初検出・完了阻止となった

- **問題事象**: docs/designs/responsibilities/custom-tool-contracts.md L8 の ADF-COVERS(design) 宣言行（REQ-011-034/035・A-7/A-8）に行末のコメント終端子 --> が欠落しており、agentdev-traceability check が当該行の design 対応を検出できず missing-design/missing-implementation/missing-verification の 3 findings が出た。REQ-011-034/035 の implementation/verification 対応は sidecar（traceability/agentdev-gh.yaml）にも未収録であった。case-close 機械工程（close_mechanical_steps pre-merge）の必須 gate で fail-closed に完了阻止され、子Issue/Epic クローズが阻断された
- **発生局面**: 検証（case-close 機械工程・Root Case #4002 C-β2 実装系契約是正。2026-11-12）
- **検知方法**: case-close の traceability-check gate（agentdev-traceability check --req 対象行限定）の exit 2・fail 3 findings。merge worktree と main root の双方で同一再現
- **根本原因**: 設計PR（a7b86e7c1・2026-11-11・本 Case の case-open 段階の REQ・Design 変更）で宣言行を追記した際に終端子を書き漏らした。docs 検査系（textlint・integrity 既存検査）は終端子欠落を検出せず、 REQ 行の対応関係を実際に照合する traceability check の実行が初めての検出経路になった。implementation/verification の sidecar 収録漏れは、実装系 Case で traceability gate を case-run 段階で実行しない運用（#4008 の証跡に meta-traceability-check が存在しない）の下では完結判定まで気付けない構造
- **自律対応内容**: case-close として対応関係の自動追加・Design 修正を行わず（禁止領域）、機械受理の fail-closed 拒否をそのまま受理してクローズを停止。根本原因を blame で確定し、main/worktree 両再現・実装 6PR 非起因（diffstat 29 files に当該ファイル不含）を機械的に確認し、監督者判断へ停止報告した
- **ユーザー確認の有無**: なし（停止報告で監督者判断を待つ形。修正方針の決定は監督者）
- **REQ/Decision/Design影響**: あり（要修正）。custom-tool-contracts.md L8 の終端子追記と traceability/agentdev-gh.yaml への REQ-011-034/035 の implementation（src/common/tools/agentdev-gh の specs-pr.ts・runner-cli.ts・runner-local.ts・contracts.ts）・verification（#4023 証跡・runner-cli.test.ts / runner-local.test.ts / engine-fail-closed.test.ts）対応の収録。修正は本 Case の case-run 側是正ラウンドまたは監督者判断での別 PR を想定
- **横展開観点**: 実装系 Case（REQ 参照を src 本文に持てない IR-055 系）では、Design/implementation/verification の対応関係が sidecar 収録に依存するため、case-open の設計PR 時点で対象行の完全性 gate（check --req）を走らせないと完結判定まで発見できない。設計PR 受入時の完全性 gate 前置が同種欠落の最短発見経路
- **再発条件**: ADF-COVERS 宣言行の手追記（特に括弧や注記付きの宣言）＋ docs 検査系が宣言構文を検査しない運用
- **予防策候補**: ADF-COVERS 宣言行の構文検査（行末終端子の存在・ADR-COVERS/ADF-COVERS 形式チェック）を check_changed_docs または integrity 系へ追加する判断（promote 判断）。設計PR 受入（case-open STEP-4）での traceability 完全性 gate 実行の検討判断
- **想定反映先**: learning-promote（docs 検査系への宣言構文検査追加判断）・intake（custom-tool-contracts.md 修正 + sidecar 収録の具体的作業候補として intake-capture で起票判断）
- **関連**: Root Case #4002・PR #4023（REQ-011-034/035 の実装）・commit a7b86e7c1・.agentdev/verify-logs/qg4-close/blocker-analysis.md（阻断分析の証跡）・traceability/agentdev-gh.yaml
- **タグ**: #ADF-COVERS #終端子欠落 #traceability #完全性ゲート #完了阻止 #case-close #sidecar

---

## 2026-11-12: PSModulePath 補正の部分修正（PS7 系 2 エントリ欠落）でも PS5.1 spawn 系テストは全て通過し、pwsh spawn 系 2 テストだけが静かに失敗する

- **問題事象**: bun test 分割①で trusted-distribution-gate 配下の cli-e2e 2 テスト（PowerShell entry 経由・pwsh を明示 spawn）のみが「Cannot find an overload for ExtractToDirectory and the argument count: 3」で失敗。同一 merge HEAD・PSModulePath を 4013 証跡の 4 エントリ値（system32 WindowsPowerShell 先頭 + PS7 系 2 エントリを含む）へ修正して分割①のみ再実行したら両テストとも pass へ回帰した
- **発生局面**: 検証（case-close 最終受入検査の環境再現・Root Case #4002。2026-11-12）
- **検知方法**: 分割①の (fail) 行抽出で既知 12 件に含まれない 2 件を検出。stderr のエラー出力が PS7 の Microsoft.PowerShell.Archive モジュール path を示していた
- **根本原因**: runner 側で設定した PSModulePath が 2 エントリ値（system32 WindowsPowerShell と Program Files\WindowsPowerShell のみ）で、4013/pass4 実績値の 4 エントリ（末尾に Program Files\PowerShell\Modules と c:\program files\powershell\7\Modules を含む）と異なっていた。PS5.1 を直接 spawn するテストは補正済み 2 エントリ値でも正しい Archive モジュールを解決して通過し、pwsh を spawn するテストだけがモジュール解決差で失敗する（環境の部分的な正しさが失敗面を縮小し、切り分けを惑わす）
- **自律対応内容**: 失敗 2 件を新規不合格として即断せず、pass4 証跡（qg4-precheck-result.json）と 4013 の env-labels.json（.agentdev/verify-logs/4013/・4013 worktree 内）から実績 PSModulePath 値を特定して正確に再現し、分割①のみ再実行して cli-e2e 2 件の解消を確認。第1回の失敗ログを run1 として証跡保持し、環境由来（pass4 の environmentIncidentResolved と同一分類）として記録した
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（テスト・検査契約・比較基準の変更なし。PSModulePath は実行環境変数）
- **横展開観点**: 環境変数系の既知事象対応では「正の値の完全再現」を確認するまで部分修正で中間判定しない。失敗テスト集合が既知集合の部分集合でも、実行環境差の証拠を先に確定してから由来分類する。証跡の env-labels（環境ラベル）に実行に使った env 値を残す運用が切り分けの要
- **再発条件**: PSModulePath の補正値を記憶や要約から再構築して設定する場合（実績値の証跡参照を省いた場合）
- **予防策候補**: 検証環境の再現手順に「4013 証跡 env-labels.json の PSModulePath 値をそのまま転写する」手順を明記（promote 判断）
- **想定反映先**: learning-promote（case-close 検証環境再現手順の env 値転写指示化判定）
- **関連**: Root Case #4002・.agentdev/verify-logs/qg4-close/（stdout-1-integrity-run1.log ほか）・.worktrees/4013-feature/.agentdev/verify-logs/4013/env-labels.json・.agentdev/verify-logs/qg4-precheck/qg4-precheck-result.json（pass4 environmentIncidentResolved）
- **タグ**: #PSModulePath #Expand-Archive #環境再現 #部分修正の罠 #pwsh #分割テスト

---

## 2026-11-12: 実装系 Case の traceability sidecar（traceability/agentdev-gh.yaml）未更新が case-run を完結させ、対応関係収録漏れが case-close 完全性 gate まで未検出になった

- **問題事象**: case-run #4008（PR #4023・REQ-011-034/035 の A-7/A-8 実装）が traceability sidecar（traceability/agentdev-gh.yaml）への対応関係収録を実施しないまま、実装・検証・push・マージまで完結した。IR-055 の inline 宣言制約により src/common/tools/agentdev-gh 配下のソース本文へ ADF-COVERS を書けないため sidecar が唯一の正規収録経路であるにもかかわらず、PR #4023 の変更ファイル（15ファイル）に traceability/ 配下が含まれなかった。収録漏れは case-close のトレーサビリティ完全性 gate で初めて検出された
- **発生局面**: 実装（case-run #4008・Root Case #4002 C-β2 実装系契約是正。2026-11-11〜12）
- **検知方法**: case-close pre-merge 機械工程の traceability-check gate（agentdev-traceability check --req 対象行限定）が REQ-011-034/035 で missing-design・missing-implementation・missing-verification の exit 2（このうち implementation/verification が sidecar 未収録に起因。missing-design は別因の ADF-COVERS 終端子欠落）
- **根本原因**: 実装委譲（DEL-4008 系列）の過程で sidecar 収録が実施されなかったことに加え、case-run の最終ゲート（3点ゲート）に traceability 完全性（check --req）の検査項目が存在せず、case-open 設計PR 受入時にも対象行の完全性 gate が走らないため、収録漏れが完結判定（case-close）まで構造的に未検出となる工程構造だった
- **自律対応内容**: case-close は対応関係の自動追加を禁止領域として実施せず fail-closed 停止報告。監督者の条件付き承認（修正は承認済み実装内容への sidecar 追記に限定・設計判断なし）を受けて親が PR #4025 で traceability/agentdev-gh.yaml へ REQ-011-034/035 の implementation（specs-pr.ts・contracts.ts・runner-local.ts・runner-cli.ts）・verification（runner-cli.test.ts・engine-fail-closed.test.ts）を PR #4023 実 diff の機能帰属で追記し、main 上で check --req 11行フルセット pass 11 / fail 0 を確認した
- **ユーザー確認の有無**: あり（監督者の条件付き承認: 修正PRで前進・親直接実施・修正範囲を承認済み内容への復元と sidecar 追記に限定）
- **REQ/Decision/Design影響**: なし（sidecar 追記は承認済み実装内容の収録であり新規の設計判断を含まない。二重宣言となる public-schema.ts〔senpi-tool-connection.yaml が単一所有〕・runner-local.test.ts〔本文 inline ADF-COVERS と重複〕は checker の duplicate-inconsistencies 検出で除外確定）
- **横展開観点**: 実装系 Case（REQ 参照を src 本文に持てない IR-055 管理下の src 変更）では、実装委譲契約への sidecar 収録義務の明示と、case-run 最終ゲートまたは case-close 前置での check --req 実行が未収録の最短発見経路になる。同一構造は agentdev-gh 以外の sidecar 収録対象コンポーネント（tools・plugins の src 変換）に同一適用される
- **再発条件**: REQ 参照を持つ src/common/tools 配下（sidecar 収録対象コンポーネント）の変更を、sidecar 収録工程を含まない委譲・ゲート構成のまま実装する場合
- **予防策候補**: 実装委譲契約テンプレートへ「対象 REQ 行の sidecar 収録確認」の MUST DO 追加、case-run 3点ゲートへの traceability check --req（対象行限定）前置、設計PR 受入時の完全性 gate 前置（いずれも promote 判断）
- **想定反映先**: learning-promote（委譲契約テンプレート・ゲート強化の要否判断）・agentdev-workflow-case-run（最終ゲート構成の検討判断）
- **関連**: Root Case #4002・PR #4023（sidecar 未収録の実装）・PR #4025（sidecar 追記是正・事実記録）・traceability/agentdev-gh.yaml・.agentdev/verify-logs/qg4-close/blocker-analysis.md・前条の ADF-COVERS 終端子欠落学び（同時検出・別因）
- **タグ**: #traceability #sidecar #case-run #工程逸脱 #委譲契約 #完全性ゲート #未検出構造

## 2026-11-12: close_mechanical_steps.ts は bun 固有契約（import.meta.path）で node 実行不可・bash ハーネスが起動セッションのバックグラウンド子プロセスを終了時に kill するため機械工程の自動駆動は detached spawn が必須（Case #4002 case-close 再開）

- **問題事象**: case-close 機械工程を自動駆動した際に3種の失敗が連鎖した。(1) bash ツールで `&` バックグラウンド起動した bun test 子プロセスがツール呼出し終了時にハーネスに kill された（受入検査の split 実行が途中終了・exit ファイル未書出し）。(2) ワークアラウンドで `process.execPath`（node.exe）から detached spawn した close_mechanical_steps.ts は、bun 固有の `import.meta.path`（isDirectExecution 判定）が node に存在せず path.resolve(undefined) の TypeError で即死した。(3) 直列チェーン駆動用 launcher で子プロセスに `p.unref()` を呼ぶと親のイベントループから子の参照が外れ、親が即終了して on("exit") コールバックが発火せず、#4009 以降の直列実行が開始されなかった（計測 baseline: main 0950de3de・case-close 再開実行 qg4-close-r2・2026-11-12・機械工程実行経路での観測）
- **発生局面**: 実装（case-close 機械工程の自動駆動・検証 worktree 実行）
- **検知方法**: stderr ログの TypeError 進行停止・progress.txt の DONE 行欠落・受理記録の provisional accepted:false 残存による手動確認
- **根本原因**: (1) bash ツールは呼出し終了時に同一セッションの spawn 子プロセスを kill するハーネス仕様。(2) close_mechanical_steps.ts は `import.meta.path` による直接実行判定を前提とする bun 実行体であり node には同等 API がない。(3) detached spawn した子の完了待ちを unref で解除すると、待ちタスクを持たない親プロセスが exit しコールバックが発火しない
- **自律対応内容**: (1) 長時間処理は child_process.spawn({detached: true, stdio: ファイルfd}) + unref でプロセスグループ分離して起動し、進捗はファイル（progress.txt・exit-{n}.txt）でポーリングする経路へ変更。(2) 機械工程の起動コマンドを bun に修正（spawn("bun", [script.ts, ...])）。(3) チェーン駆動の launcher 自体を detached で起動し、launcher 内では unref せず on("exit") で次実行を駆動する2段構成へ修正
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（機械工程 script の契約変更はなし・実行環境側の駆動経路の知見のみ）
- **横展開観点**: 機械工程や受入検査の長時間自動駆動（bun script・複数プロセス直列チェーン）すべてに適用可能。bun 実行体は node から spawn しない（bun で起動）。進捗確認は stdout よりファイルプロトコル（完了マーカーファイル）が堅牢
- **再発条件**: bash ツール内で `&` バックグラウンド起動した長時間コマンド・node から bun 固有 .ts 実行体を起動・unref を使ったチェーン駆動のいずれかを再び行うと再発
- **予防策候補**: 機械工程の駆動手順（workflow skill references かコマンド側）に「bun 起動・detached spawn・unref 禁止（チェーン駆動時）・ファイルポーリング」の前置知見を追記する判断は promote 判断で評価
- **想定反映先**: agentdev-workflow-case-close（機械工程の自動駆動手順）・learning-promote（機械工程駆動知見のゲート/参照反映の要否判断）
- **関連**: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（isDirectExecution 判定 L2033-2034）・.agentdev/verify-logs/qg4-close/mechanical/stderr-4008-premerge-r2.log（TypeError 証跡）・.agentdev/integrity/reports/close-r2/launch-mechanical.js（最終動作版）
- **タグ**: #機械工程 #bun #node差異 #detached-spawn #自動駆動 #bashハーネス

## 2026-11-12: 3分割受入検査の同時並列実行がタイミング系テストを広域に flake させる・既知 flake 登録外の11件が負荷下のみで fail し単独（規律適合）再実行で全件解消（Case #4002 case-close 再開）

- **問題事象**: 受入検査（実行条件 (1)・3分割正規形）を split1/2/3 を同時並列で実行したところ、既知不合格12件に加え11件のタイミング系 fail を観測した（split1: bootstrap-report 3件・cli-e2e PowerShell entry 2件・launcher protected-path 1件、split2: TS-009 並列短縮 timing 1件・TS-006 pipeline integration 1件、split3: misexecution stop REQ-050-006 3件）。全部で 23 fail と見え、既知12件との機械照合では11件が non-known に分類された。11件すべてを単独（負荷なし・直列）で再実行した結果、全件 pass して解消した（計測 baseline: main 0950de3de・bun 1.3.6・qg4-close-r2 worktree・2026-11-12・bun test 3011/1949/705 件の同時並列実行で観測）
- **発生局面**: CI（case-close 受入検査・3分割正規形の実行）
- **検知方法**: split ごとの fail 名一覧抽出と既知不合格 SSoT（.agentdev/tmp/c-alpha2-baseline/known-failures-fixed.md）との machine-match 照合（known-failures-comparison-r2.json・12/12 match・flake 11件）
- **根本原因**: 3つの bun test プロセス（約5,665 tests）の同時並列実行が CPU 負荷を生み、タイミング計測系（並列短縮の速度比較・5秒系の待ち上限）と spawn を伴う実経路テスト（PowerShell entry・pipeline integration・install.ps1 起動）が劣化して fail した。既知 flake の登録は「misexecution stop 5000ms」1種のみで、同時並列負荷による他のタイミング系 flake は記録外だった
- **自律対応内容**: プロンプト契約（既知 flake は単独再実行で origin 判定）に従い、11件をテスト名フィルタ（bun test -t）で負荷なし直列環境に単独再実行し、全件 pass を実測して環境由来（並列負荷 flake）と分類した。受入検査の判定は「規律適合再実行後の実効 fail = 既知12件のみ・新規0件」として確定し、機械受理記録に execution-form 分類の実体を保持する準備をした（最終的には機械工程内の直列実行で既知12件のみの観測となり observedFailCounts は既知のみで受理）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（合格条件「新しい不合格0件」の判定において規律適合再実行による解消確認は既存の execution-form 分類・プロンプトの既知 flake 契約の適用）
- **横展開観点**: 3分割正規形や複数 test suite の並列実行では、タイミング系・spawn 系テストの負荷 flake を前提に、観測 fail を既知 SSoT と照合し non-known は単独再実行で origin 判定してから分類する。判定の順序は「並列観測 → 照合 → 単独再実行 → 分類確定」を守る
- **再発条件**: 3分割以上の bun test 同時並列実行・CPU 負荷の高い環境でのタイミング系テスト実行
- **予防策候補**: 受入検査の標準手順を split 直列実行に統一するか、並列実行時は機械照合後に必ず単独再実行で分類確定する手順を明記する判断は promote 判断で評価
- **想定反映先**: agentdev-workflow-case-close（受入検査の実行手順・機械受理の分類手順）・learning-promote（並列負荷 flake の手順反映の要否判断）
- **関連**: .agentdev/verify-logs/qg4-close/known-failures-comparison-r2.json・stderr-{1,2,3}-*-r2.log・stdout/stderr-rerun-*.log（単独再実行証跡）・.agentdev/tmp/c-alpha2-baseline/known-failures-fixed.md（既知 SSoT）
- **タグ**: #受入検査 #3分割正規形 #並列実行 #flake #timing #origin分類 #規律適合再実行

## 2026-11-12: 完了条件チェックボックス確定（テキスト変更）で conditionId が再導出され、更新前本文から導出した判定入力は stale 判定として fail-closed 拒否される・機械工程実行の直前に同一本文から再導出する運用が必須（Case #4002 case-close 再開）

- **問題事象**: case-close 機械工程の受入評価で、checkbox 確定（[ ] → [x] + 判定記録追記）により本文テキストが変わった子 Issue（#4010〜#4013）に対し、更新前本文から事前導出した conditionId を判定入力（acceptanceVerdicts）に使った結果、verdict-for-unknown-condition（stale 判定）と verdict-missing-for-contract-condition で final-acceptance-evaluation が fail し、受理記録が accepted:false になった（#4010・#4011 の2件が1実行ずつ無駄になった。計測 baseline: main 0950de3de・2026-11-12・機械工程 pre-merge 実行での観測）
- **発生局面**: 実装（case-close 機械工程の判定入力構築）
- **検知方法**: 機械工程報告 JSON の final-acceptance-evaluation step fail（violations: verdict-for-unknown-condition・cond-036-a866a30d8b67f6c9 が母集団に不在）
- **根本原因**: deriveCompletionConditionId は条件本文と本文内行位置の sha256 から決定的に導出するため、checkbox 確定によるテキスト変更（判定記録追記・行末変更）で conditionId が変わる。判定入力の構築を本文更新（issue_update）より前に行ったため stale になった。母集団は機械工程が「機械工程に渡した本文」から抽出するため、判定入力側は同一本文から再導出する必要がある
- **自律対応内容**: GitHub の現行本文（gh issue view で再取得・本文 hash 照合済み）から deriveCompletionConditionId を再導出し、判定入力を再構築して input JSON を再生成。機械工程を再実行して受理記録を accepted に再生成した（fail-closed 拒否は A-12 個別対応化の正しい動作であり guard を迂回せず回復した）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（A-12 個別対応化の設計どおりの動作・恒久台帳なしの識別子再導出構造の実証）
- **横展開観点**: 条件本文から hash 導出される識別子を判定入力に使うすべての工程で、「本文の最終確定後に識別子を再導出」する順序を守る。本文更新 → 判定入力導出 → 機械工程実行 の順序固定が安全
- **再発条件**: checkbox 確定や結果セクション追加など本文変更を伴う更新後に、変更前本文から導出した判定入力を機械工程へ渡すと再発
- **予防策候補**: 機械工程の判定入力構築手順に「issueBodyPath に渡す本文と同一の本文から conditionId を導出する」前置条件を明記する判断は promote 判断で評価
- **想定反映先**: agentdev-workflow-case-close（機械工程の判定入力構築手順）・learning-promote（順序固定の手順反映の要否判断）
- **関連**: deriveCompletionConditionId（close_mechanical_steps.ts L605-608）・final-acceptance.ts（verdict-for-unknown-condition 検査）・.agentdev/verify-logs/qg4-close/mechanical/report-4010-premerge-r2.json（stale 判定の fail 証跡）
- **タグ**: #conditionId #stale判定 #受入評価 #機械工程 #fail-closed #A-12

---
## 2026-11-12: 完了記録コメント投稿・本文更新で Issue revision が進み、終了判定記録の targetRevision と突合する issue_close が fail-closed 拒否される・機械工程の最終実行は Issue への書込み完了後（issue_close 直前）に最新 revision 对象で実行する順序が必須（Case 3989 正規終了処理）

- **問題事象**: PR なし完了構成 Case のクローズで、機械工程 pre-merge（受理記録 accepted:true 生成）→ 完了記録コメント投稿 → 本文結果セクション更新 → issue_close の順で実行したところ、コメント投稿と本文更新で Issue の updated_at が進み、issue_close が「終了判定記録の対象版（旧 revision）と現在版が不一致・過去の受理結果の再利用拒否」で fail-closed 拒否された（計測: 2026-11-12T14:06:51Z revision で拒否）
- **発生局面**: 実装（case-close STEP-5 の完了契機反映と終了操作の順序）
- **検知方法**: Custom Tool agentdev_gh issue_close の verification-incomplete 拒否（targetRevision 2026-11-10T02:06:57Z vs 現在 revision 2026-11-12T14:06:51Z）
- **根本原因**: 終了判定記録の freshness 契約（対象版 = issue_close 時点の Issue revision）と STEP-5 の記録反映順序（コメント→本文→クローズ）の組合せで、受理後に必ず revision が進む。機械工程を受理記録生成のために1回だけ実行する構成だと freshness が保てない
- **自律対応内容**: Tool 拒否の指示（機械工程の再実行）に従い、記録中のタイムスタンプ記載を revision 非依存に修正した上で、最新 revision（再 issue_read）・現行本文を対象に機械工程をべき等再実行し、終了判定記録を accepted:true で再生成 → 直後に issue_close を実行して成功した（受理条件の迂回ではなく Tool 指示の正規経路）
- **ユーザー確認有無**: なし（fail-closed 拒否と Tool 指示への従経路は正規手順）
- **Decision/REQ/spec影響**: なし（freshness ゲートは設計どおりの動作）
- **横展開観点**: Issue 書込みを伴う全終了処理で「最後の Issue 書込み → 最新 revision 取得 → 機械工程実行 → issue_close（間に書込みを挟まない）」の順序固定が安全
- **再発条件**: 受理記録生成後に Issue へのコメント・本文更新を行ってから issue_close すると再発
- **予防策候補**: case-close Skill の STEP-5 手順に freshness 再実行の明示（完了記録反映後の機械工程再実行を手順内に組み込む）を promote 判断で評価
- **想定反映先**: agentdev-workflow-case-close（STEP-5 手順）・learning-promote
- **関連**: close_mechanical_steps.ts（issueUpdatedAt 入力契約・終了判定記録 targetRevision）・agentdev_gh issue_close freshness ゲート・Case 3989 実行記録（issuecomment-6825808332）
- **タグ**: #issue_close #freshnessゲート #終了判定記録 #機械工程 #べき等再実行 #順序契約

---
## 2026-11-12: 対象要件行なし Case（重複無力化クローズ等）で corpus 全域 traceability check は missing-implementation/missing-verification の corpus debt（advisory）で exit 2 となり機械工程が fail する・Case の主題要件行（集約先で対応完了した行）への --req スコープで lifecycle gate 完全性と corpus 診断を分離できる（Case 3989 正規終了処理）

- **問題事象**: traceabilityGate を --req なし（corpus 全域）で構成したところ、main の corpus debt（missing-implementation: REQ-032-045・REQ-117-001〜010 等、missing-verification: REQ-032-045・REQ-113-001/002・REQ-117-* 等）により summary {pass:9, fail:2}・exit 2 となり、traceability-check step が fail して受理記録が accepted にならない構成になった（計測: main 230d714aa3259cb9b1e305606db21f7c0f6920d4・2026-11-12）
- **発生局面**: 実装（case-close 機械工程のゲート構成）
- **検知方法**: 事前実行した check.ts の exit 2 と report.checks の missing-implementation/missing-verification findings
- **根本原因**: corpus 完全性の計数は到達目標状態の診断指標（advisory・fail-open）で lifecycle gate の完了条件ではないが、check CLI は fail>0 で exit 2 を返すため、完了阻止面（対象要件行の3完全性）と corpus 診断面がゲート終了コードで分離されていない。対象要件行が空の Case では --req スコープが空振りし corpus 全域しか選択肢がない
- **自律対応内容**: 当該 Case の主題（重複対象で集約先 #3988 で対応完了した要件行）へ --req REQ-031-029,REQ-015-012 をスコープし、11 検査 pass・fail 0 でゲートを通過させた。スコープ構成の根拠は完了記録コメントに明記した
- **ユーザー確認有無**: なし（SSoT 適用判断とは別の機械構成）
- **Decision/REQ/spec影響**: なし（corpus advisory と lifecycle gate の2層判定は v4-traceability-model Design どおり）
- **横展開観点**: 対象要件行なし Case の close では主題要件行への --req スコープ構成が必要。corpus debt の解消自体は別案件（REQ-117 の deferred 義務等）
- **再発条件**: 対象要件行なし Case で --req なしの corpus check をゲートに使うと corpus debt がある限り再発
- **予防策候補**: check CLI に構造検査のみ／完全性検査対象明示の実行モード分離、または case-close Skill の対象要件行なし構成時のスコープ導出手順の明記を promote 判断で評価
- **想定反映先**: agentdev-traceability（check CLI）・agentdev-workflow-case-close（ゲート構成手順）・learning-promote
- **関連**: traceability scripts/src/check.ts（exit 2 契約）・v4-traceability-model Design「completeness の 2 層」・Case 3989 完了記録コメント（スコープ構成記録）
- **タグ**: #トレーサビリティ #corpus完全性 #advisory #lifecyclegate #スコープ構成 #機械工程

---
## 2026-11-12: close_mechanical_steps.ts の実 runner が MechanicalRunner.deleteFile を実装せず post-merge の終了判定記録回収（close-acceptance-reclamation）が常に fail-closed する・直近実績（Case 4002 r2 post-merge）でも同一 fail で回収は exported reclaimCloseAcceptanceRecord の直接呼出で履行した（Case 3989 正規終了処理）

- **問題事象**: post-merge phase で reclamation.closeAcceptanceRecord を指定しても step が「mechanical runner does not provide deleteFile; reclamation cannot execute (fail-closed)」で fail する。verify-logs の直近実績（report-4002-postmerge-r2.json）でも同一メッセージで fail しており、回収が機械工程の外の手動経路に常態化している
- **発生局面**: 実装（case-close 機械工程 post-merge の回収 step）
- **検知方法**: post-merge 報告 JSON の close-acceptance-reclamation step fail
- **根本原因**: MechanicalRunner の deleteFile は任意インターフェースだが実 runner が未提供で、reclaimCloseAcceptanceRecord の I/O 注入が構成できない
- **自律対応内容**: 同一決定的関数（reclaimCloseAcceptanceRecord）に exists/deleteFile を注入した bun 直接呼出で回収を履行した（status: reclaimed・対象パス明示・terminalOperationCompleted: true）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（関数契約は不変・runner 実装の欠落）
- **横展開観点**: post-merge を実行する全 Case で同一。runner への deleteFile 実装で解消する
- **再発条件**: post-merge reclamation を機械工程で実行する全状況で再発
- **予防策候補**: 実 runner への deleteFile（と writeTextFile 系の揃え込み）実装を promote 判断で評価
- **想定反映先**: agentdev-workflow-case-close（close_mechanical_steps.ts 実 runner）・learning-promote
- **関連**: close_mechanical_steps.ts（runReclamation・MechanicalRunner.deleteFile）・report-4002-postmerge-r2.json（先行実績の同一 fail）
- **タグ**: #機械工程 #回収 #runnerインターフェース #post-merge #fail-closed

---
## 2026-11-13: 配布物へテーブル・節を移動・集約する際、docs 配下パス literal は IR-055（runtime-unresolved-reference）の新規違反検出対象になる（移動元から除去しても移動先で再検出される）

- **問題事象**: 既存ファイルから配布物（src/common/skills・src/common/commands）へテーブル等を移動・集約する際、docs/designs/・docs/guides/ のパス literal をそのまま移すと IR-055 の新規違反として検出される。修正前 6 件検出（Case #4026 Wave 1・PR #4038 実績）
- **発生局面**: 実装（B2-1 規則集約・lifecycle SKILL.md 新節への移動）
- **検知方法**: check_integrity --json の IR-055 runtime-unresolved-reference 新規違反
- **根本原因**: 配布物は docs 配下パスを runtime に解決できず、配布依存境界（distribution-reference-boundary）で未解決参照として検出される。移動元の除去だけでは移動先で新たに検出される
- **自律対応内容**: 移動先の docs 配下パス literal を文書種別表現へ置換してから移動し、修正後 0 件に解消した（名レベル参照はパス非依存のため配布後環境でも機能する）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（IR-055 の検査の規則・比較基準・契約は未変更・ir-055-baseline.json 未変更）
- **横展開観点**: B2-2 以降の規則集約（Wave 2 の #4030〜#4037）で配布物へ移動する全作業で再発し得る
- **再発条件**: docs 配下パス literal を含むテーブル・節を配布物へ移動・集約する全状況
- **予防策候補**: 配布物への移動前チェック（docs 配下パス literal の文書種別表現への置換を手順の一手順化）
- **想定反映先**: agentdev-workflow-lifecycle（工程駆動の実装手順）・learning-promote
- **関連**: PR #4038 本文 検証差分表（IR-055 行）・IR-055
- **タグ**: #IR055 #配布依存境界 #規則集約 #名レベル参照 #Wave2

---
## 2026-11-13: worktree で 3分割正規形 bun test を実行する場合の依存整備と plugins 分割の main root 読取専用代替（REQ-018-005 運用）

- **問題事象**: worktree の .opencode 投影欠落（plugins 未伝播）のため、worktree 内での 3分割正規形実行は分割③の plugins 対象欠落と plugin 依存（textlint-guard node_modules・vendor junction）の未生成を招く
- **発生局面**: 検証（case-run・case-close の bun test 実行形態契約の実施）
- **検知方法**: bun test の Test filter no matches・依存解決失敗
- **根本原因**: worktree は .opencode/plugins 投影と vendor 依存成果物を含まない（版固定情報のみ git 管理）
- **自律対応内容**: 依存整備（junction 10箇所: src/common/skills 配下 skill scripts 7 + repo-agentdev-integrity 1 + textlint-guard 2）を前置し、plugins 分割は worktree の junction 未伝播のため main root 実体からの読取専用実行で代替した。bun は worktree 配下からメイン root の node_modules を parent lookup で解決できることを確認済み（2026-11-13 wave1-baseline worktree 実測・996 tests 0 fail）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-018-004 環境差運用・変更起因検出と混同しない）
- **横展開観点**: Wave 2 の全子 Issue の検証と case-close の機械工程で継続利用
- **再発条件**: worktree 内での bun test 3分割実行の全状況
- **予防策候補**: worktree 作成手順の依存整備（junction 整備手順）の標準化。bun parent lookup の機能を前提にした junction 最小化の検討
- **想定反映先**: agentdev-git-worktree（worktree 運用指針）・agentdev-workflow-case-run・learning-promote
- **関連**: PR #4038 本文 検証差分表（実行環境ラベル）・REQ-018・worktree-operations.md「書込み guard 運用指針」
- **タグ**: #bunTest #worktree #依存整備 #junction #分割③代替 #Wave2

---
## 2026-11-13: generate_indexes.ts への新規セクション追加では最小構成 producer fixture（req-impact-map 等を持たない）を破壊しないため、ファイル不在・マーカー不在の扱いは既存 README 系と同一の skip 記録に統一すべき

- **問題事象**: AUTOGEN 導出の新規セクションを fail-fast 実装した結果、最小構成 producer fixture（req-impact-map 等の AUTOGEN ブロックを持たないテスト用最小構成）を壊した（Case #4026 Wave 1・PR #4039 の実装過程。修正済み）
- **発生局面**: 実装（REQ-047-013・generate_indexes.ts の req-impact-map 逆方向対応導出と manifest 導出処理）
- **検知方法**: bun test 分割①の generate_indexes producer 関連テスト fail（変更起因 1 件・同一 PR で修正）
- **根本原因**: 新規セクションの不在扱いが既存 README 系セクションの skip 記録契約と不整合の fail-fast だった
- **自律対応内容**: ファイル不在・マーカー不在の扱いを既存 README 系と同一の skip 記録に統一して修正（該当テスト解消）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: AUTOGEN 導出セクションを追加する全変更（Wave 2 の B3-2〜B3-6 で索引導出を拡張する場合）で適用すべき
- **再発条件**: generate_indexes.ts への新規セクション追加で最小構成 producer fixture と共存させる全状況
- **予防策候補**: AUTOGEN セクション追加時の不在扱い規約（skip 記録統一）を generate_indexes.ts の README・規則文書へ明記
- **想定反映先**: repo-agentdev-integrity（generate_indexes.ts 関連規則・README）・learning-promote
- **関連**: PR #4039 本文 Findings learning（DEL-4029-1）・generate_indexes.test.ts
- **タグ**: #AUTOGEN #索引導出 #producerFixture #skip記録 #Wave2

---
## 2026-11-13: bun test の spawnSync 型テストが main results 配列の呼出形式を文字列照合している場合、results 統合の構造変更は該当テストの同一 PR での追随更新を要する

- **問題事象**: check_integrity.ts の results 統合の構造変更（ir_ids 付与・annotateIrIds ラップ）に伴い、spawnSync 呼出形式を文字列照合する regression_issue616 型テスト 2 件が fail した（Case #4026 Wave 1・PR #4039 の実装過程。同一 PR で修正済み）
- **発生局面**: 実装（REQ-047-011・checker 出力への IR ID 包含）
- **検知方法**: bun test 分割①の regression_issue616 fail（変更起因 2 件・同一 PR で修正）
- **根本原因**: テストが呼出形式（コマンド・引数列）の文字列照合に依存しており、構造変更（ラップ関数の追加）で照合が不整合になった
- **自律対応内容**: 期待値を新呼出形式へ追随更新（契約テスト期待値の同一 PR 更新・REQ-047-012 の契約テスト追随に整合）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: checker 出力形式の構造変更を行う全 PR（Wave 2 の B3-2〜B3-6 で checker を拡張する場合）で再発し得る
- **再発条件**: check_integrity.ts の results 統合・呼出形式を変更する全状況
- **予防策候補**: 呼出形式の文字列照合テストを構造非依存のアサーション（ir_ids の存在・形式固定など PR #4039 で導入の ir_ids 出力形式固定テストと同様）へ移行
- **想定反映先**: repo-agentdev-integrity（check_integrity.test.ts・regression_issue616）・learning-promote
- **関連**: PR #4039 本文 Findings learning（DEL-4029-1）・regression_issue616.test.ts・ir_ids 出力形式固定テスト
- **タグ**: #checker出力 #契約テスト #spawnSync #results統合 #Wave2

---
## 2026-11-13: 後片付けの削除は wildcard を使わず自分が作成した具体ファイル名を個別指定する（wildcard 誤削除事故）

- **問題事象**: main root .agentdev/integrity/reports/ の後片付けで wildcard パターン（2026-11-12-integrity-report-*.md）を使用した結果、自分の生成分だけでなく同日の他工程起因の同名連番 scratch report も誤削除した（Case 4026 Wave 2・PR 4040 の実行過程。対象は gitignore 対象の派生 scratch 出力で恒久証跡チャネル参照なし・base 版と他日付分は無傷）
- **発生局面**: 実装検証の後片付け（check_integrity の report 生成物の回収）
- **検知方法**: 実行担当の自己申告（PR 4040 本文 Findings・報告義務の履行）
- **根本原因**: 共有領域の連番生成物に対する wildcard 一括削除は、同時刻に他工程が生成する同名パターンを区別できない
- **自律対応内容**: 誤削除対象は scratch 出力のため恒久影響なしと確認のうえ報告。再発防止策を自分への禁止事項として記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 共有領域（.agentdev/integrity/reports/ 等）で生成物の後片付けを行う全工程
- **再発条件**: 連番・タイムスタンプ等の衝突し得るパターンで共有領域の生成物を wildcard 削除する全状況
- **予防策候補**: 後片付けの削除は自分が作成した具体ファイル名を個別指定し wildcard を使用しない（実行時禁止事項として worktree-operations 系指針への追加候補）
- **想定反映先**: agentdev-git-worktree（worktree-operations 後片付け規律）・learning-promote
- **関連**: PR 4040 本文 Findings（DEL-4034-1）
- **タグ**: #後片付け #誤削除 #wildcard #共有領域 #Wave2

---

## 2026-11-13: worktree で依存 junction を作る場合は fs.symlinkSync(target, link, junction) 経由が信頼できる

- **問題事象**: worktree 内で bun test 3分割正規形の依存 junction を cmd /c mklink /J の bash 経由呼出しで作成すると引数 quoting の問題で対話モード起動に落ちる事例を確認（Case 4026 Wave 2・PR 4042 実測。4038 学びの補完）
- **発生局面**: worktree 検証環境の依存整備（bun test 分割実行の junction 準備）
- **検知方法**: 実行担当の実測（mklink 経由の失敗と symlinkSync 経由の成功）
- **根本原因**: bash 経由の cmd 呼出しでの mklink /J 引数 quoting が環境依存で破綻する
- **自律対応内容**: fs.symlinkSync(target, link, "junction") 経由へ統一（失敗ゼロを確認）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree で .opencode/plugins 等 junction 非伝播依存を補う全検証環境構築
- **再発条件**: cmd /c mklink /J を bash から呼び出す全状況
- **予防策候補**: 依存 junction 作成手順の正規形を fs.symlinkSync("junction") に固定し文書化
- **想定反映先**: agentdev-git-worktree（worktree-operations bun test 実行の環境前提）・learning-promote
- **関連**: PR 4042 本文 Findings learning・PR 4038 学び
- **タグ**: #worktree #junction #bunTest #Windows #Wave2

---

## 2026-11-13: plugins 分割（bun test ./.opencode/plugins/）の full-run は実行順序・負荷依存の flakiness を含む（個別再実行で確定する運用）

- **問題事象**: textlint-guard の parallel・pipeline-integration・runs の3テストが負荷下の full-run で fail し、個別実行と再実行では 0 fail（Case 4026 Wave 2・PR 4042 で 2回の full-run 実測。4038 実績と同一パターン）
- **発生局面**: bun test 分割③（plugins 分割）の full-run 実行と fail 由来分類
- **検知方法**: 同環境再実行と個別実行での pass 実証（fail の非再現）
- **根本原因**: plugin テスト群の実行順序・負荷依存の flakiness（full-run 固有）
- **自律対応内容**: full-run の fail は個別再実行での確定を証跡に含める運用で分類（REQ-018 環境差 fail 分類の拡張運用）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: plugins 分割を含む検証（QG-4 正規形・Wave 境界受入検査）全般
- **再発条件**: bun test ./.opencode/plugins/ の full-run を負荷がある環境で実行する全状況
- **予防策候補**: REQ-018 の環境差 fail 分類に plugin 分割の flakiness 観点（full-run fail は個別再実行で確定）を追加
- **想定反映先**: worktree-environment-fail-classification 知識・agentdev-quality-gates（実行形態契約の運用注意）・learning-promote
- **関連**: PR 4042 本文 Findings learning・PR 4038 実績
- **タグ**: #bunTest #flaky #plugins分割 #fail由来分類 #Wave2

---

## 2026-11-13: bun test の pass 行は非 TTY 時の退避ログに現れず、件数サマリーと fail 行のみが証跡になる（file-level split が有効）

- **問題事象**: 非 TTY 時の bun test 退避ログに pass 行が記録されず、fail 検出対象の特定は件数サマリー・fail 行・file-level split（対象ファイル単独実行の2段構成）に依存する（Case 4026 Wave 2・PR 4044 実測）
- **発生局面**: bun test 分割実行の証跡退避と fail set 比較
- **検知方法**: 退避ログの実観測（pass 行不在・fail 行とサマリーのみ）
- **根本原因**: bun test の出力形式が TTY/非 TTY で異なり、非 TTY では pass 行が省略される
- **自律対応内容**: fail 検出対象が明確な場合は file-level split（QG-4 の2段構成）を併用して特定
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: bun test の証跡退避を伴う全検証（case-run・case-close・QG-4）
- **再発条件**: 非 TTY の bun test 実行で pass 行を証跡に期待する全状況
- **予防策候補**: 証跡要件を件数サマリー・fail 行基準で定義し（QG-4 正規形の既定どおり stdout/stderr 分離退避）、fail 特定が必要な場合は file-level split を標準採用
- **想定反映先**: agentdev-quality-gates（bun test 正規形の運用注意）・learning-promote
- **関連**: PR 4044 本文 Findings・QG-4 file-level split 規定
- **タグ**: #bunTest #証跡 #fileLevelSplit #非TTY #Wave2

---

## 2026-11-13: fail set 比較は fail 名でなく fail クラスで対照する（git fixture 系の非決定性を吸収）

- **問題事象**: trusted-distribution-gate launcher 系試験の git fixture（makeFixtureRepo）が Windows 環境で非決定的に失敗し、baseline と worktree で fail 名の分布が変わる（fail 名の完全一致比較が偽差分を生む）
- **発生局面**: Wave 境界の fail set 対照（base vs 変更側）
- **検知方法**: PR 4043 実測（baseline/worktree で fail 名分布が変動）
- **根本原因**: git fixture の環境依存で fail の現れ方（どのテストが fail になるか）が非決定的
- **自律対応内容**: fail set 比較を fail クラス単位へ変更し、Epic 4026 最終受入検査（2026-11-13）でも同一 fail クラス集合で突合
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: bun test fail set 対照を伴う全受入検査・Wave 境界処理
- **再発条件**: 非決定的 fixture を含む suite の fail set を fail 名で機械突合する全状況
- **予防策候補**: fail set 対照手順に fail クラス正規化（既知 fail クラス集合との突合）を明記
- **想定反映先**: agentdev-quality-gates（fail 由来分類）・learning-promote
- **関連**: PR 4043 本文 Findings・2026-11-08-bun-test-preexisting-baseline-fails intake
- **タグ**: #failSet対照 #flaky #受入検査 #Windows #Wave2

---

## 2026-11-13: stash push/pop は同一 worktree の cwd で実行する（main worktree cwd からの pop は変更の誤適用を生む）

- **問題事象**: worktree 内 stash 対照で git stash pop を main worktree の cwd から実行してしまい、変更 11 ファイルが一時的に main worktree へ適用された（Case 4026 Wave 2・PR 4045 で発生・同手順で完全復旧）
- **発生局面**: IR-055 対照実行のための stash push/pop
- **検知方法**: pop 後の git status で main 側の変更集合異常を検知
- **根本原因**: stash はリポジトリ共通だが pop は実行 cwd の worktree に適用されるため、cwd 選択を誤ると別 worktree へ適用される
- **自律対応内容**: git diff 退避（patch）→ main 側 git restore（対象 11 パス指定）→ worktree 側 git apply で完全復旧。復旧後 bun test（286+63 pass/0 fail）と変更集合一致（13ファイル）を確認し報告
- **ユーザー確認有無**: なし（PR 本文へ報告義務の履行）
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree + stash を使う対照実行全般（IR-055 対照・baseline 対照）
- **再発条件**: stash 操作の cwd を実行対象 worktree と取り違える全状況
- **予防策候補**: stash push/pop は同一 worktree の cwd で実行するか、patch 退避方式を採用する（実行時禁止事項として明記）
- **想定反映先**: agentdev-git-worktree（worktree-operations）・learning-promote
- **関連**: PR 4045 本文 Findings（DEL-4035-1）
- **タグ**: #worktree #stash #事故復旧 #対照実行 #Wave2

---

## 2026-11-13: trusted-distribution-gate launcher 系 3件は worktree で非決定的に fail する（main root では pass）

- **問題事象**: trusted-distribution-gate launcher 系 3テストが worktree では依存整備の前後で fail 数が変動（skip 相当 → fail）し、同一コードが main root では pass（Case 4026 Wave 2・PR 4046 実測）
- **発生局面**: worktree での bun test 分割①実行と fail 由来分類
- **検知方法**: main root での同一コード pass 実測（環境差の切り分け）
- **根本原因**: worktree 環境固有の依存・junction 状態が launcher テストの前提と不一致
- **自律対応内容**: worktree 環境 fail 分類知識への追加候補として記録し、対照は main root または fail クラスで実施
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree で integrity suite（分割①）を実行する全検証
- **再発条件**: worktree で trusted-distribution-gate launcher 系を実行する全状況
- **予防策候補**: worktree-environment-fail-classification.md 知識へ本 fail クラスを追加
- **想定反映先**: docs/knowledge/worktree-environment-fail-classification.md・learning-promote
- **関連**: PR 4046 本文 Findings
- **タグ**: #worktree環境差 #trustedGate #fail由来分類 #Wave2

---

## 2026-11-13: 共通正本側の定数も陳腐化する（J-001 の逆方向）・正本を採用する場合は鮮度担保が両方向で必要

- **問題事象**: 共通正本の AGENTDEV_GH_TOOL_DESCRIPTION が実公開文から陳腐化した未参照定数として残存していた（release 初期段階の文言。Case 4026 Wave 2・PR 4046 で発見）。ホスト別複製の陳腐化（J-001 の想定方向）と逆方向の正本側陳腐化
- **発生局面**: 3系統ホスト接続の正本参照化（B3-5e）の実装検査
- **検知方法**: 正本参照化の実装中の実公開文との突合
- **根本原因**: 正本定数が未参照のまま放置され、鮮度が担保されていなかった
- **自律対応内容**: 正本参照化と契約テスト固定 6件で再発防止構造を構築（PR 4046）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 正本定数・単一正本へ集約した全資産（C-ε の集約対象全般）
- **再発条件**: 正本定数が参照されず放置される全状況（集約後に参照経路が切れた場合を含む）
- **予防策候補**: 正本を採用する変更では、正本側の鮮度担保（参照されない定数の放置検知・未参照定数の削除検査）を同時に整備する
- **想定反映先**: agentdev-workflow-lifecycle（共通報告・Decision・自律確定規約の集約運用）・custom-tool-contracts Design・learning-promote
- **関連**: PR 4046 本文 Findings（J-001 正本側実例）
- **タグ**: #正本鮮度 #J001 #ホスト接続 #Wave2

---

## 2026-11-13: trusted-distribution-gate pipeline が main root でも archive stage で FAIL する（boundary detector の unclassified 大量検出）

- **問題事象**: trusted-distribution-gate.ps1 pipeline（base 9ec88e649 → candidate ff4677e01・bootstrap mode・main root 実行）が code=9 で fail。manifests 全投影 entries 空・archive stage で配布対象多数 missing。boundary detector が tests 配下のサンプル文字列（wave-gate.test.ts の「FN-1」等）を unclassified-entry として大量検出し「projection detections bound exceeded」を記録（Case 4026 stage 4・AG-013 最終合格確認の試行実測）
- **発生局面**: Root Case close の AG-013（配布整合検査の最終合格）確認での pipeline 試行実行
- **検知方法**: pipeline 実行の exit code と summary（code=9・archive verification failed: missing）
- **根本原因**: boundary detector が distribution-boundary.md「検査対象の除外領域」規定（共通原本側 tests/ 配下の検出刺激用サンプル文字列・Issue #2480）を gate 実装へ適用していない疑い。tests 配下のサンプル識別子を producer 内部参照として unclassified 検出し、検出 bound を超過させた。blob 分類・manifest projection との整合も未確認
- **自律対応内容**: pipeline 実行障害の記録と intake 化（次サイクル修正対象）。正規成果物側の配布違反検出とは区別し、AG-013 の配布整合検査判定は既存の合格記録（E4-1 最終 gate・入口横断一致試験・Pester・trusted-distribution-gate 配下 test）で成立と判断
- **ユーザー確認有無**: 判定根拠は完了記録コメントで報告（pipeline は archive 公開前検査〔DEC-014 決定7・REQ-009-045〕で本 Case は archive 公開なし）
- **Decision/REQ/spec影響**: なし（検査装置側の実装乖離の修正は次サイクル対象）
- **横展開観点**: archive 公開前の gate pipeline 実行（backlog-auto リリース手順・trusted-distribution-gate を実行する全経路）
- **再発条件**: gate pipeline を archive 公開時や検証目的で実行する全状況
- **予防策候補**: gate 実装へ distribution-boundary.md 除外領域規定の適用と boundary detector 検出 bound の整備。pipeline の実行環境前提（Windows・main root）の検証手順整備
- **想定反映先**: repo-agentdev-integrity scripts trusted-distribution-gate・intake-promote（intake item 経由）
- **関連**: Case 4026 stage 4 完了記録コメント・intake item（2026-11-13-trusted-distribution-gate-pipeline-boundary-detector-unclassified-fail）
- **タグ**: #trustedGate #boundaryDetector #pipeline実行障害 #stage4

---

