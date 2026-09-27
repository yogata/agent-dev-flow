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

---

## bun:test で可変 export 配列を fixture push → finally で length = 0 クリアするパターンは、実装が初期空でなくなった時点で後続テストを破壊する — fixture 復元は常に元長さ保存型に

- **問題事象**: ALLOWED_USAGE 等の可変 export 配列を fixture push し finally で length = 0 クリアするテストパターンが、実装が初期空でなくなった時点（初期エントリ保有）に後続テストを破壊した。Case #3166 で originalLength 復元型へ修正済み
- **発生局面**: 検証（case-run 回帰テスト実装・TS-004/TS-007 系 fixture パターンの実装改修）
- **検知方法**: PR #3168 実装時の fixture パターン修正（PR 本文 Findings / Capture候補 learning 候補・case-close 回収）
- **根本原因**: length = 0 クリアは「実装の初期状態が空配列」を暗黙前提とする。実装が初期エントリを持つようになった時点で、先行テストが全要素を消去した状態を後続テストへ引き渡し破壊する
- **自律対応内容**: originalLength 保存 + finally で元長さへ復元する形へ修正済み（Case #3166・PR #3168 で main 反映済み）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（テスト fixture パターンの知見）
- **横展開観点**: 可変 export 配列を fixture として操作する全テストに適用可能
- **再発条件**: 可変 export 配列への fixture push + finally での全消去（length = 0）を含むテストを新規実装または改修する場合
- **予防策候補**: 可変配列の fixture 復元は常に元長さ保存型（originalLength 保存 + finally 復元）とする指針の明文化
- **想定反映先**: check_content_corruption.test.ts 等の可変 export 配列 fixture を持つテスト群、テスト fixture パターンの知識化候補
- **関連**: Case #3166、PR #3168 本文 Findings / Capture候補
- **タグ**: `#bun-test` `#fixture-restoration` `#test-pattern`

---

## REQ 行追加を伴う Definition 変更では AUTOGEN 派生物（REQ 行数メトリクス・Decision 索引）が必ず陳腐化する — check 実測の直後に generate_indexes.ts 再生成を手順に組み込む

- **問題事象**: REQ 3行 append・Decision 1件新規作成を含む Definition 変更（Case #3169）で、check_integrity（index-generation-consistency NG 6件）と check_autogen_freshness（鮮度違反 2ブロック）が検出した。REQ 行数メトリクス（req-health-metrics.md の REQ-009 行数 51→52）、Decision 索引（docs/README.md・docs/decisions/README.md の DEC-045 追加）が REQ 行追加のみで自動追随せず、generate_indexes.ts 再生成が未実行のまま検査すると必ず失敗する
- **発生局面**: case-open（case-auto orchestration stage 1 委譲）STEP-4 の「期待値確定前の branch HEAD 実測」check_integrity・check_autogen_freshness 実行時
- **検知方法**: check_integrity の `[NG] index-generation-consistency` 6件（expected 差分に DEC-045 行・REQ-009 行数 52 と明示）と check_autogen_freshness の RENAME/CONTENT_CHANGE 報告
- **根本原因**: REQ 行追加と Decision 新規作成は AUTOGEN ブロック（README 索引・行数メトリクス）の入力源を変えるが、definition-pr-and-idempotency.md の branch HEAD 実測手順は再生成実行を明示しておらず、変更作業と再生成の順序が手順上明文化されていない
- **自律対応内容**: `bun .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` を実行して docs/README.md・docs/decisions/README.md・docs/designs/quality/req-health-metrics.md を再生成し、同一 commit に含めた。再実行で check_integrity（ng 0 / warning 0 / info 126・新規 unmanaged NG 0 件）と check_autogen_freshness（0 件）が合格
- **ユーザー確認有無**: なし（派生物の鮮度維持であり、要件内容の変更を伴わない）
- **Decision/REQ/spec影響**: なし（運用手順の知見。definition-pr-and-idempotency.md の branch HEAD 実測手順への再生成明示は将来の改善候補）
- **横展開観点**: REQ 行追加・Decision 追加・REQ ファイル行数を計上するメトリクス変更を含む全 Definition PR に適用。case-ready 受入時の check_integrity でも同様に失敗し得るため、PR 作成前に再生成して解消しておくのが安全
- **再発条件**: REQ 行追加または Decision 追加を含む Definition 変更を generate_indexes.ts 再生成なしで commit する場合
- **予防策候補**: STEP-4 変更手順に「REQ 行・Decision 変更後、check 実測前に generate_indexes.ts 再生成」を明文化
- **想定反映先**: src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（実測手順の順序明示）、learning-promote での docs/knowledge/ 知識化判定対象
- **関連**: Case #3169、PR #3170
- **タグ**: `#case-open` `#autogen-freshness` `#definition-pr` `#generate-indexes`

## agentdev_gh issue_list は role: case 指定でも物理ラベル依存で未クローズ Case 群を網羅列挙できず、横断依存検査の population 収集は gh CLI 読み取り補助が実質必要になる

- **問題事象**: case-open STEP-5 冪等検出・横断依存検査で、`agentdev_gh` issue_list（role: case、labels: ["case"]、search「case」）が作成直後の Root Case #3169（title に「case」を含まない）を検出せず 0 件を返した。labels: ["case"] 単独指定でも 0 件。未クローズ Case 群の population 収集は gh CLI（`gh issue list --state open`）読み取り補助で代替した
- **発生局面**: case-open（case-auto orchestration stage 1 委譲）STEP-5 冪等検出と横断依存検査の未クローズ Case 群取得時
- **検知方法**: issue_create 直後の issue_list 再検索で自 Case が不在（作成検証済みの Issue が列挙に現れない矛盾）
- **根本原因**: issue_list の search は GitHub search/issues の in:title トークン照合であり title 依存。labels フィルタは物理ラベル照合で「case」という物理ラベルは本リポジトリに存在しない（論理 role と物理ラベルの写像は Tool 内部管理のため、呼出側から論理 role 単位の網羅列挙を直接指定できない）。結果、論理 role: case の population 列挙は search トークン選択性に依存する
- **自律対応内容**: STEP-5 reference の「GitHub I/O 失敗時の gh CLI 切替継続手順」の趣旨に従い、読み取り補助として `gh issue list --state open --json number,title,labels` で population を実測（open は #3169 のみ・population_count 1）。横断依存検査エンジンの入力は実測 population で構築し、検査を完了（警告 0 件）。gh CLI による書込み代替は行わない（切替範囲の限定を遵守）
- **ユーザー確認有無**: なし（読み取り専用の補助）
- **Decision/REQ/spec影響**: なし（観測。REQ-092〔agentdev_gh issue_list 運用規律と labels 論理値専用〕系の運用知見として将来の整備候補）
- **横展開観点**: 横断依存検査・冪等検出など「population 全体列挙」を要する工程は、search トークン選択性規律（issue-operation-safety.md）に加え、title に工程識別語を含まない Issue の取りこぼし可能性を前提に、gh CLI 読み取りでの cross-check を標準手順として扱う
- **再発条件**: title に検索トークンを含まない Case Issue が存在する状態で issue_list による population 列挙を行う場合
- **予防策候補**: population 列挙時は search なし・state 単位の列挙（gh CLI または issue_list の等価操作）を実測手段とし、search トークン方式は重複排除・特定用途に限定する運用の明文化
- **想定反映先**: agentdev-issue-management issue-operation-safety.md（issue_list 絞り込み規律の補完）、case-open / case-ready の横断依存検査手順、REQ-092 系文書整備
- **関連**: Case #3169、PR #3170
- **タグ**: `#agentdev-gh` `#issue_list` `#cross-dependency` `#population-scan`

## 並行 case-open による主リポジトリ branch 切替下で case-ready STEP-7 の永続化 commit が並行 Definition branch へ誤配置される

- **問題事象**: case-ready STEP-7（draft 削除・DEC-045 accepted 遷移・索引再生成の git 永続化）で git add/commit を実行したところ、起動時に main であった主リポジトリの current branch が並行 Case #3171 の case-open が作業中の definition/issue-3171 へ切替わっており、commit 23593c94 が並行 Definition branch の先頭へ載った。git push origin main は Everything up-to-date で成果物が main に入らなかった
- **発生局面**: case-ready（case-auto orchestration stage 2 委譲）STEP-7 draft/RU 削除と git 永続化時
- **検知方法**: commit 出力の [definition/issue-3171 23593c94] 行と git push origin main の Everything up-to-date の組み合わせ矛盾
- **根本原因**: 共有主リポジトリの current branch は工程実行中に他プロセスの branch 切替で変化し得る。case-ready STEP-7 の永続化手順に「commit 前の current branch 確認」の前置ガードがなく、並行 case-open 側の worktree 隔離（REQ-030-017）が主ツリーで守られなかった構造に依存していた
- **自律対応内容**: commit 23593c94 が未 push（origin/definition/issue-3171 = 4319732d）を確認し、主ツリーで git reset --hard 4319732d により並行 branch を origin 状態へ復帰（自 commit の除去）。別 worktree で main を checkout し cherry-pick 23593c94 → push origin main（b2001d37）→ worktree 削除。並行プロセスの成果物（4087dfb8・4319732d）は不変
- **ユーザー確認有無**: なし（誤配置した自工程 commit の正規位置への移動のみ。並行 branch の push も force push も行わない）
- **Decision/REQ/spec影響**: なし（運用手順の知見）
- **横展開観点**: main への永続化 commit を行う全工程（case-ready STEP-7、case-close ドメイン状態永続化、learning/intake capture の git 永続化）で、commit 直前に git branch --show-current で current branch を確認し、main 以外なら主ツリーでの commit を行わず worktree 経由（main checkout）へ切替する前置ガードを標準化すべき
- **再発条件**: 共有主リポジトリで並行 Case の case-open が branch 切替した状態で、別工程が main への永続化 commit を行う場合
- **予防策候補**: STEP-7 永続化手順への current branch 前置ガード明文化、case-open 側の REQ-030-017 worktree 隔離徹底の enforcement、並列実行安全ステージング指針への current branch 確認追加
- **想定反映先**: src/opencode/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md（STEP-7 前置ガード）、agentdev-workflow-case-open の worktree 隔離運用、learning-promote での docs/knowledge/ 知識化判定対象
- **関連**: Case #3169、PR #3170
- **タグ**: #case-ready #git-worktree #branch-conflict #persistence

---

## agentdev-traceability coverage.ts の --req 複数行カンマ指定は実測で emptyResult を返し、単体（1行）実行の繰返しが実効手段になる

- **問題事象**: `bun src/opencode/skills/agentdev-traceability/scripts/src/coverage.ts --root <repo-root> --req REQ-090-014,REQ-090-015` のカンマ指定（2行）で relations 空かつ emptyResult: true を返した。単体指定（REQ-090-014 のみ）では design 1件・implementation 2件を正しく返す。カンマ指定3行（REQ-090-012,REQ-090-014,REQ-090-015）でも同様に空
- **発生局面**: case-open（内部 lifecycle 段階）STEP-3 の意味変更行 design 対応事前確認（REQ-090-012/014/015 の coverage --req 実査）。運用
- **検知方法**: カンマ指定の結果（design 0・emptyResult）と単体指定の結果（design 1）の矛盾。scripts/README.md は「--req は要件行ID（REQ-{NNNN}-{MMM}）の個別カンマ指定のみを受理する」と記述しており、カンマ指定が期待動作のはずが実測では機能しない
- **根本原因**: 実装（coverage.ts）が --req 値をカンマ split せず入力文字列全体を単一 reqId として扱っている可能性（実装本体は未確認・挙動は repo root 実測）。README 文言と実装の不一致
- **自律対応内容**: 対象行3つを単体実行（3回）に分解して design 対応事前確認（custom-tool-contracts.md design 1件×3）を完了した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（呼出側の知見補完）
- **横展開観点**: coverage / impact / check の3 CLI が共通 argv 解析（cli_utils.ts）を共有するため、coverage だけでなく impact・check の --req 複数指定も同じ挙動になり得る。README の文言を鵜呑みにせず、複数行指定の初回は単体実行で結果を cross-check するのが安全
- **再発条件**: scripts/README.md のカンマ指定文言を信頼して coverage / impact / check を複数行指定で呼出す場合
- **予防策候補**: (1) 実装へカンマ split を追加する、または README 文言を実装実態（単一 reqId のみ）へ修正する。どちらかを coverage 3 CLI で統一
- **想定反映先**: src/opencode/skills/agentdev-traceability/scripts/README.md（I/O 契約の文言修正候補）、scripts/lib/cli_utils.ts（argv 解析）、case-open / case-ready の design 対応事前確認手順（単体実行を既定とする記述）
- **関連**: Case #3171
- **タグ**: `#traceability` `#coverage` `#cli-contract` `#case-open`

## session 由来 RU の frontmatter が REQ-008-051 必須フィールド規律から逸脱する（generation_stage 不正値・generation_actor 欠落）

- **問題事象**: session 由来の RU-0154 の frontmatter が `generation_stage: supervisor-session`（規定値 pre-req-define でない値）を持ち、`generation_actor` を欠く。session由来RU の frontmatter 必須フィールド（REQ-008-051）と一致しない
- **発生局面**: case-open（内部 lifecycle 段階）への投入前の draft（req-draft-jev-semantic-eval-contract-hardening.md）準備時の RU-0154 frontmatter 確認。req-define 下流工程での発見。運用
- **検知方法**: review_dispositions 作成時の RU frontmatter 実査（REQ-008-051 との突合）
- **根本原因**: producer 側（session 内での RU 生成手順）が REQ-008-051 の必須フィールド規律に従っていない。RU 生成入口に frontmatter 必須フィールドの検証ゲートが存在しない
- **自律対応内容**: review_dispositions RD-002 として not_applicable / out_of_scope（producer 側の契約逸脱で本 draft の要件対象外）で合意済み。恒久証跡は Root Case #3171 のレビュー判断セクションへ転記済み
- **ユーザー確認有無**: あり（req-define の adversarial-review・STEP-10 提示経由で合意済み）
- **Decision/REQ/spec影響**: なし（本 Case の対象外と合意。RU 生成手順の改善候補として記録）
- **横展開観点**: session 由来 RU（backlog-review を経由しない direct 生成）は backlog-review 経由 RU と異なり frontmatter 品質の検証経路を持たない。REQ-008-051 追随チェックを RU 生成手順または req-define 入口の前置確認に組込む必要性
- **再発条件**: session 内で REQ-008-051 の frontmatter 規律を参照せずに RU を直接生成する場合
- **予防策候補**: session 由来 RU 生成時の frontmatter 必須フィールド検証（generation_stage 規定値・generation_actor 必須）を生成手順へ明文化する
- **想定反映先**: agentdev-backlog-integration（session 由来 RU の生成基準）、REQ-008-051 の運用整備候補
- **関連**: Case #3171、RU-0154
- **タグ**: `#ru-frontmatter` `#req-008-051` `#session-sourced-ru` `#case-open`

## 配布境界ベースライン突合で --profile source と --profile link のパス表記差を正規化比較で解消した

- **問題事象**: `--profile source`（worktree 実体、パスが `.worktrees/{N}-{type}/src/...`）と `--profile link`（main root 位置引数、ジャンクション経由でパスが `.opencode/...`）の検出結果を突合すると、同一違反がパス prefix 差で別エントリに現れ、生のファイル差分比較では「新規」誤判定となる
- **発生局面**: case-close STEP-3 配布依存境界 最終 gate の case-run STEP-S5 記録との突合（Case #3169 の PR #3173 検証差分確認）。運用
- **検知方法**: source 側 `.worktrees/3169-feature/src/...` と link 側 `.opencode/...` のパス差（case-run PR 本文の検証差分記録に明記）
- **根本原因**: 両 profile が同一実体を異なる root 起点・異なるパス表現（worktree 物理パス / junction 論理パス）で列挙する構造差
- **自律対応内容**: カテゴリ・行・スニペット一致 + パス prefix 正規化による比較で差分判定し、node による正規化比較で新規 0 件を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 配布境界 gate を複数 profile（source/link）で実行して突合する全 Case（case-run STEP-S5 と case-close 最終 gate の検証差分比較）で同様の誤差分が起こり得る。突合手順の正規化ルールを共通化すべき
- **再発条件**: worktree で source profile を実行し、main root で link profile を実行した結果を直接突合する場合
- **予防策候補**: 配布境界ベースライン突合手順に「カテゴリ・行・スニペット一致 + パス prefix 正規化後の比較」を明文化する。可能であれば checker 側で正規化済みパスを出力するオプションの追加
- **想定反映先**: agentdev-quality-gates / case-close references（配布依存境界 最終 gate の検証差分突合手順）、repo-agentdev-integrity scripts（checker 出力の正規化対応候補）
- **関連**: Case #3169、PR #3173
- **タグ**: `#distribution-boundary` `#baseline-diff` `#path-normalization` `#case-close`
