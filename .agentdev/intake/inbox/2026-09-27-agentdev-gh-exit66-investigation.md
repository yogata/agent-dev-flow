# intake: agentdev_gh 全操作の gh exit 66 持続障害の調査

- 観測日: 2026-09-27
- 観測元: case-open（case-auto orchestration stage 1 委譲）STEP-2 Root Case 作成時の実観測。learning 側 split と対（learning inbox.md 同日エントリ）
- 種別: 具体的修正対象（積み残し作業候補）

## 候補: agentdev_gh tool 内部 gh spawn 経路の gh exit 66 持続障害の調査・修復

- **実観測事実**: Custom Tool agentdev_gh の全操作（issue_list・issue_create・issue_read）で operation-failed（gh exited with 66、retryable: true）が約7分間・tool 呼出 9回で持続した。同一環境の gh CLI 手動実行（v2.101.0・読み取り系）は正常。GH_TOKEN/GITHUB_TOKEN 重複なし（重複時 exit は 1 を実測で確認）
- **問題構造**: tool 内部の gh spawn 経路のみが失敗し、エージェント側からは tool 内部実装が観測不能のため原因特定・修復ができない。書込み操作は契約上 gh CLI 代替が禁止（fail-closed）であり、障害持続時は workflow 全体が GitHub I/O 依存工程で停止する。既知事象の記載は issue_list 限定であり、全操作へ波及する挙動は未記録だった
- **検討対象**: (i) tool 内部 gh 呼出の障害ログ・エラーコード 66 の意味特定（spawn 経路・引数渡し・環境変数継承の調査）、(ii) 既知事象記述の全操作への拡大と blocked 時 resume 手順（残骸 Issue 不在確認込み）の運用文書化、(iii) tool 側の一時障害検知時の構造化された retry/backoff 契約の検討
- **関連**: learning inbox.md 同日エントリ（再発防止知見側）、REQ-092（agentdev_gh issue_list 運用規律）、issue-operation-safety.md、definition-pr-and-idempotency.md「GitHub I/O 失敗時の gh CLI 切替継続手順」節
