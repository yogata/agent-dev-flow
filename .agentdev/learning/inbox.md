# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

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
