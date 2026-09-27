# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## main リポジトリに revert 進行中の中断残骸を検出し Definition branch 作成前に git revert --abort で復旧した

- **問題事象**: case-open 委譲実行の開始直後、main リポジトリの `git status` が「Revert currently in progress」状態を示した。staged は空・untracked（drafts・jev-observations）のみで HEAD = origin/main（827c88fd）と一致しており、revert 操作の中間状態だけが残留していた
- **発生局面**: case-open（case-auto orchestration stage 1 委譲）の STEP-4 Definition branch（definition/issue-3166）作成前の worktree 状態確認時。運用
- **検知方法**: git status の "Revert currently in progress" 表示（porcelain 短形式では検出不能な状態）
- **根本原因**: 未特定（観測限界）。同一環境での先行 Case 実行（case-close 系の revert 操作〔既知: DEC-040 部分置換 revert 等〕）が中断された残骸と推定。revert を開始したセッションの実行時点は観測不能
- **自律対応内容**: (1) `git status --porcelain` で staged/untracked の内容を確認し、revert 状態が本 Case 作業と無関係な残留であることを確認 (2) `git revert --abort` を実行して revert 状態を解除 (3) 解除後に HEAD = origin/main 一致・clean（untracked のみ）を再確認してから Definition branch 作成と Design 編集へ進んだ
- **ユーザー確認有無**: なし（abort は revert 中間状態の破棄のみであり、既に確定済みの HEAD・untracked 成果物へ影響しないことを事前確認の上で実施）
- **Decision/REQ/spec影響**: なし
- **横展開観点**: `git status` の短形式（`--porcelain`）では revert/rebase/merge 中間状態が表面化しない。worktree 操作前の状態確認は長形式 git status の表示（"Revert currently in progress" 等の operation in progress 行）を確認するのが確実。abort 前に staged 内容を porcelain で確認し、残留状態が自 Case の成果物を含まないことを検証してから解除する手順が resume 安全性を担保する
- **再発条件**: revert 操作を含む先行セッションが中断された後に、別セッション（委譲子エージェント等）が同環境で git 操作を開始する場合
- **予防策候補**: worktree・branch 作成を伴う workflow の前置確認に「長形式 git status で operation in progress 表示の有無確認」を含める。revert/rebase/merge 中間状態検出時は porcelain 確認 → abort 判定 → 解除後再確認の順で固定する
- **想定反映先**: agentdev-git-worktree reference（worktree-operations.md の書込み guard 運用指針・前置状態確認）、case-open references（definition-pr-and-idempotency.md「期待値確定前の branch HEAD 実測」節の前置手順）
- **関連**: Case #3166（本件検出時の実行 Case）、commit 827c88fd（解除後の確認済み HEAD）
- **タグ**: `#git` `#revert-abort` `#worktree` `#case-open`

## agentdev_gh issue_update 契約は role フィールドを受理しない（issue_create 専用）の実測

- **問題事象**: Custom Tool agentdev_gh の issue_update 操作に `role: case` を含めて呼出したところ、invalid-input（"request does not match the issue_update input contract (unknown-field [role]: field 'role' is not part of the issue_update input contract)"、retryable: true）で拒否された。role を除去して再送したところ成功（VERIFY 通過）
- **発生局面**: case-open（case-auto orchestration stage 1 委譲）の STEP-3 adf_case 埋め戻し（Root Case #3166 の実行識別情報セクション更新）。運用
- **検知方法**: tool 応答の failure kind: invalid-input と detail（unknown-field 指摘）
- **根本原因**: Tool 操作契約上 `role` は issue_create 専用の入力フィールドであり、issue_update は受理しない。Tool 公開説明の「Tracking-issue operations expose logical values (role, kind, trackingState)」の記述が、role を全 tracking 操作で受理できると誤解させる表現になっている
- **自律対応内容**: invalid-input の detail を契約の実測として受入れ、role を除去した最小引数（body・labels・number・operation）で再送し成功。trackingState も指定せず本文更新のみとした（Case Issue の論理状態は case-ready 以降の工程で変化させる）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Tool 契約自体は fail-closed に機能。呼出側の知見補完）
- **横展開観点**: issue_update を使う全 workflow（case-ready の ready 遷移、case-close のクローズ、Epic tracker のステータス更新等）で同様の誤呼出が起こり得る。invalid-input は retryable 表示でも同一呼出の再試行では解消せず、引数修正が必須
- **再発条件**: issue_create の引数構成を issue_update へ流用する場合
- **予防策候補**: issue-operation-safety.md の tracking 軸 3 規則に「issue_update は role を受理しない（role は issue_create 専用）。labels は省略時追跡軸維持」を明記する。invalid-input（unknown-field）は再試行でなく引数修正対象である旨を contingency 記述へ補足する
- **想定反映先**: agentdev-issue-management issue-operation-safety.md（tracking 軸操作の 3 規則節・issue_update 項）、agentdev-issue-tracking Design（操作別入力契約の明記）
- **関連**: Case #3166（Root Case 本文更新・埋め戻し成功）
- **タグ**: `#agentdev-gh` `#issue_update` `#invalid-input` `#tool-contract`

---

## agentdev_gh 全操作で gh exit 66 が持続し Root Case 作成が blocked 停止した

- **問題事象**: Custom Tool agentdev_gh の全操作（issue_list・issue_create・issue_read）で operation-failed（gh exited with 66、retryable: true）が持続発生した。同一環境での gh CLI 手動実行（読み取り系: issue list・issue view・label list）は正常動作していた。case-open STEP-2 の Root Case 作成（issue_create）が 6回失敗し、tool 呼出合計 9回（読み取りを含む）すべて失敗した
- **発生局面**: case-open（case-auto orchestration stage 1 委譲）の STEP-2 Root Case 作成時。運用
- **検知方法**: agentdev_gh 操作応答の operation-failed（contingency canContinue: false〔書込み系〕/ true〔読取系〕）
- **根本原因**: 未特定（観測限界）。gh バイナリは v2.101.0 単一、GH_TOKEN/GITHUB_TOKEN 重複なし、gh CLI 手動実行は成功しており GitHub 接続・認証・バイナリ自体は健全。tool 内部の gh spawn 経路の一時的障害を疑うが tool 内部実装は観測不能。並行兄弟 case-open の GitHub I/O との時間的相関も未確認
- **自律対応内容**: issue_create の再試行（即時×2・待機 45s/90s/120s 後×3）、issue_read による tool 健全性確認、原因仮説検証（token 重複 exit code 実測は 1 で 66 と不一致・gh バイナリ特定）、冪等検出の READ_CONTINGENCY（gh CLI 読取）で既存 Root Case 不在を確認、最終確認で open Issue 0件（失敗した issue_create が成果物を残していないこと）を検証した上で blocked 停止報告へ切替。書込み操作を gh CLI で代替せず fail-closed を維持した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-011・REQ-052 の Custom Tool 集約契約と REQ-083-005 write guard 契約自体は変更不要。tool の一時障害として扱う）
- **横展開観点**: agentdev_gh に依存する全 workflow（case-ready pr_merge・case-close 等）で同種の停止が起こり得る。既知事象の記載が issue_list 限定であるが、全操作へ拡大する実測が得られた
- **再発条件**: tool 内部 gh spawn の障害状態が持続する場合。既知事象（issue_list 稀発 gh exit 66）が他操作へも波及した実測
- **予防策候補**: agentdev_gh の既知事象記述を「issue_list 稀発」から「全操作で発生し得る一時的障害・書込み失敗持続時は blocked 停止」へ更新する。blocked 停止時の resume 手順（冪等検出は再開時再実行されるため重複生成リスクなし。失敗した issue_create が GitHub 上に残骸を残さないことの gh CLI 読取確認を resume 前提に含める）を運用文書へ明記する
- **想定反映先**: agentdev-issue-management issue-operation-safety.md（issue_list 規律と contingency 節）、agentdev-workflow-case-open references（definition-pr-and-idempotency.md GitHub I/O 失敗時手順の書込み拡張）、REQ-092 関連
- **関連**: .agentdev/drafts/req-draft-docs-corpus-integrity-fixes.md（対象 draft。Root Case 未作成で停止・resume 可能）、.agentdev/intake/inbox/2026-09-27-agentdev-gh-exit66-investigation.md（同一観測の intake 側 split）
- **タグ**: `#agentdev-gh` `#gh-exit66` `#blocked` `#github-io`

---

## gh exit 66 持続障害の並行再発観測で deferred.md 既知事象との同一性を特定し checkpoint resume を整備した

- **問題事象**: 前エントリと同一時間帯の並行 case-open 委譲セッション（対象 draft: req-draft-delegation-and-verification-reference-rules）で、Custom Tool agentdev_gh の全操作が operation-failed（gh exited with 66）で持続失敗。issue_create 4回・issue_read 3回・issue_list 2回の計9回以上、40分超（待機 30/60/180/300 秒を含む）で安定再現。bash 経由の gh CLI 手動実行（issue list / pr list / label list / auth status / api rate_limit）は全て正常
- **発生局面**: 運用（case-auto orchestration stage 1 case-open 委譲。並行兄弟 Case の同種停止と同時多発）
- **検知方法**: agentdev_gh 書込み・読取系操作の operation-failed 応答と手動 gh CLI 正常の対比
- **根本原因**: 前エントリの「未特定」を補強する特定知見として、.agentdev/learning/deferred.md の既知事象2件（2026-09-24「agentdev_gh は harness 起動環境でリポジトリ解決が壊れていると全操作が fail-closed 不能になる〔AGENTDEV_GH_REPO 起動環境設定が対処〕」・2026-09-25「agentdev_gh がハーネスプロセス内で gh exited with 66（無出力）で全系操作失敗」）と同一パターンであることを特定。症状（全操作 fail・無出力・bash 再現不能・安定持続）が一致し、harness プロセス環境の gh spawn 故障（既知: AGENTDEV_GH_REPO 未設定の launcher 起動かつ harness 内 spawnSync 故障。回復はハーネス再起動＝ユーザー環境アクション）と整合
- **自律対応内容**: (1) Root Case 本文候補（確定済み・RD 転記込み）を durable checkpoint として .agentdev/tmp/issue-body-delegation-and-verification-reference-rules.md へ保存（前例 .agentdev/tmp/issue-3123-body-step7.md の学びに従う。resume 手順・ラベル・タイトル・実変更判定を併記） (2) 実変更判定（direct_case・artifact_actions 空 → 実変更なし・Definition PR 不作成）と STEP-3 追随確認3項目（ポリシー不要・宣言不要・意味変更行なし）を機械的に事前確定し checkpoint へ記録 (3) 冪等検出を gh CLI 読取 fallback で完了（open Issue/PR 0件・兄弟 Case Issue 未作成・失敗 issue_create の残骸なし確認） (4) 書込みは raw gh 代替せず fail-closed 維持で blocked 停止
- **ユーザー確認有無**: なし（ハーネス再起動・AGENTDEV_GH_REPO 設定はユーザー環境アクションとして報告に含める）
- **Decision/REQ/spec影響**: なし（plugin の fail-closed 契約・gh 読取 fallback 契約・gh-write-guard は仕様どおり機能。deferred.md 判定どおり起動環境の運用問題）
- **横展開観点**: 障害発生セッションの責務は「確定済み判定の全部を checkpoint へ固定してから停止すること」。実変更判定・追随確認など Tool に依存しない機械的判定は停止前に確定でき、resume 時の再分析コストをゼロ化できる。前例（#3123）では Issue 本文の checkpoint が子委譲 3 回全損を回避した実績があり、本件で「Definition Package 生成済み direct_case」形態でも同手順が機能することを実証
- **再発条件**: AGENTDEV_GH_REPO 未設定の launcher で harness を起動し、かつ harness プロセス環境で gh 実行解決・spawnSync が壊れている場合の全 agentdev_gh 呼出（deferred.md 再発条件と同一）
- **予防策候補**: (1) launcher 側は plugin README 導線（AGENTDEV_GH_REPO を起動環境へ設定）に従う (2) case-auto 等のパイプライン開始時、最初の委譲前に agentdev_gh 軽量読取1操作の死活確認を前置する（deferred.md 予防策候補と同一。本件で実効性が再確認された） (3) 障害検知時に「手動 gh 正常性確認 → durable checkpoint → blocked 報告（回復はハーネス再起動を明記）」の順で固定する運用手順の明文化
- **想定反映先**: docs/guides/consumer-project-setup.md「AGENTDEV_GH_REPO の起動環境設定」節（deferred.md 想定反映先と同一）、agentdev-issue-management issue-operation-safety.md（GitHub I/O 失敗時の checkpoint・resume 手順）、前エントリとの統合（learning-promote）
- **関連**: .agentdev/tmp/issue-body-delegation-and-verification-reference-rules.md（durable checkpoint・resume 用）、.agentdev/drafts/req-draft-delegation-and-verification-reference-rules.md（対象 draft・未削除保持）、.agentdev/learning/deferred.md（2026-09-24 / 2026-09-25 既知事象エントリ）、Case #3123・intake item 2026-09-25-agentdev-gh-spawn-infra-transient（前例）
- **タグ**: `#agentdev-gh` `#gh-exit66` `#blocked` `#checkpoint-resume` `#AGENTDEV_GH_REPO`

---

## 配布依存境界 gate の base 差分突合は detail 文言の番号ラベル込み比較で差分の実質を判定する

- **問題事象**: case-close の配布依存境界 gate で base（ブランチ分岐時の baseline）と現行 PR HEAD の concrete_id_hits 差分突合を行う際、手順番号付け直し（手順挿入による番号ズレ）が「同一文言・番号ラベル違い」の差分として現れ、行ラベル込みの単純比較では新規違反の追加か既存違反の行移動かを判別できなかった
- **発生局面**: 検証（case-close STEP-3 配布依存境界 最終 gate。手順番号付き手順書を含む配布物 reference 編集 Case で pr_create 前段手順を挿入した場合）
- **検知方法**: base 16 件 → 現行 16 件の件数突合は一致するのに、差分リストに added/removed の行ラベル変化（手順番号 4→5 の付け直しによる同一文言の対称差）が現れる
- **根本原因**: 突合キーに行ラベル（手順番号付き見出し・行頭書式）が含まれるため、手順挿入による番号シフトが後続行のラベル変化として差分に現れる。文言比較で番号ラベルを除外しないと挿入起因の見かけ差分と実質的な新規違反を区別できない
- **自律対応内容**: detail 文言の番号ラベル込み比較で差分の実質を判定し、added/removed 1 件ずつの対称差（同一文言・番号ラベル違いのみ）であることを確認して、本変更起因の新規違反 0 件を確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（配布依存境界 checker・gate 契約の変更なし。突合時の解釈手順の知見）
- **横展開観点**: 手順番号・番号付き見出しを含む配布物を編集する Case 全般で base 突合を行う場合に再利用可能。件数突合と番号ラベル込み対称差確認の組合せで新規違反 0 を機械的に確定できる
- **再発条件**: 手順番号付き手順書・番号付き見出しを含む配布物 reference を編集し、手順挿入・削除で番号がズレる Case で配布依存境界 gate の base 差分突合を実施する場合
- **予防策候補**: 配布依存境界 gate の突合手順に「件数突合に加え、detail 文言の番号ラベル込み比較で対称差を確認する」ステップの明記（case-run・case-close の差分突合記述への反映候補）
- **想定反映先**: agentdev-workflow-case-run・agentdev-workflow-case-close の配布依存境界 gate 手順（配布依存境界 Design 由来の差分突合記述）
- **関連**: Case #3161・PR #3164 本文の Findings / Capture候補（learning 候補の case-close 回収）、.agentdev/learning/deferred.md（配布依存境界既存違反の既知事象管理）
- **タグ**: `#distribution-boundary` `#base-diff` `#case-close`

---

## 配布物 references の規範参照を REQ ID 直書きで書くと IR-055 strict 違反になる — 宣言フィールド名・概念名での記述が安全

- **問題事象**: 配布物（src/opencode/skills 配下）の references への改訂で、規範参照を REQ ID 直書き（例: REQ-059）で記述した結果、IR-055（runtime-unresolved-reference）strict 違反を検出した
- **発生局面**: 実装（case-run RA-005: agentdev-decision-file-manager validation-and-consistency.md の照合手順改訂）
- **検知方法**: check_integrity full-audit の IR-055 違反検出（stash 差分突合で本変更由来と特定）
- **根本原因**: REQ ID 直書きは runtime 未解決参照として配布依存境界の検査対象になる（宣言の裏付けのない具体 ID 参照）
- **自律対応内容**: fix-and-reverify で REQ ID 直書きを除去し、宣言フィールド名・概念名での記述へ置換して再検証合格（1 回の fix-and-reverify を要した）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存 IR-055 契約どおりの検出・再発防止知見）
- **横展開観点**: 配布物 references を編集する全 Case で適用可能。「宣言フィールド名・概念名で書く」が記述指針として再利用できる
- **再発条件**: 配布物（src/opencode/skills 配下）の references で規範参照を REQ ID 直書きで記述する場合
- **予防策候補**: 配布物 references の執筆・改訂時に REQ ID 直書きを避け、宣言フィールド名・概念名での記述を標準とする指針の明文化候補
- **想定反映先**: agentdev-skill-authoring（配布物 skill reference 執筆基準）、check_integrity IR-055 の該当規約
- **関連**: Case #3162、PR #3165 本文 Findings / Capture候補（learning 候補の case-close 回収）
- **タグ**: `#IR-055` `#distribution-boundary` `#references`

---

## check_integrity.test.ts の IR-055 delta テストが baseline commit 時点でも fail（テスト期待値と baseline の乖離の調査候補）

- **問題事象**: check_integrity.test.ts の「IR-055 runtime-unresolved-reference 実修復回帰（Issue #1782）> 配布物に新規（delta from baseline）runtime-unresolved-reference 違反がないこと」テストが、base 時点（commit 3bd480cb の親 aed65975・ワークツリー変更ゼロ相当）でも fail（Received: 2）した
- **発生局面**: 検証（case-run 既存テスト回帰・fail 由来分類の baseline 再現確認）
- **検知方法**: stash による base 実行での同一 fail 再現確認（本変更非由来の確認）
- **根本原因**: 本変更非由来の pre-existing 不整合。delta baseline とテスト期待値の乖離（既存 intake 2026-09-27-integrity-delta-baseline-commit-persistence.md の delta baseline commit 参照不能問題と同系統の疑い）
- **自律対応内容**: fail 由来分類を pre-existing として記録（baseline 再現確認済み・PR 本文検証差分へ記載済み）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（調査候補の記録）
- **横展開観点**: pre-existing fail の baseline 再現確認手順（3点対照）の有効性再確認。fail 由来分類の証跡として baseline commit 指定の再現記録を残す運用が機能した
- **再発条件**: IR-055 delta テストを実行する全環境（baseline 系 durable state の追随差がある場合）
- **予防策候補**: delta baseline とテスト期待値の乖離の調査（関連 intake の検討対象と統合）
- **想定反映先**: check_integrity.test.ts（Issue #1782 系 delta テスト）、traceability 側の delta baseline 運用
- **関連**: Case #3162、PR #3165 本文 Findings / Capture候補、.agentdev/intake/inbox/2026-09-27-integrity-delta-baseline-commit-persistence.md（同系統調査候補）
- **タグ**: `#IR-055` `#pre-existing` `#baseline-diff`
