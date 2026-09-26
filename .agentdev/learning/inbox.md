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
