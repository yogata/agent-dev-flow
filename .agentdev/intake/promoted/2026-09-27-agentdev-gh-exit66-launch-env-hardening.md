# intake 採用済み成果物: agentdev_gh 全操作 gh exit 66 障害の起動環境前提の恒久化・運用文書化

- 観測日: 2026-09-27
- 観測元: case-open（case-auto orchestration stage 1 委譲）STEP-2 Root Case 作成時の実観測
- 種別: 具体的修正対象（積み残し作業候補）
- 分類確定: 採用（intake-promote 2026-09-27・adversarial-review 2 stream 収束・自律確定）

## 観測内容

- Custom Tool agentdev_gh の全操作（issue_list・issue_create・issue_read）で operation-failed（gh exited with 66、retryable: true）が約7分間・tool 呼出 9回で持続した。同一環境の gh CLI 手動実行（v2.101.0・読み取り系）は正常。GH_TOKEN/GITHUB_TOKEN 重複なし（重複時 exit は 1 を実測で確認）
- 並行再発観測（同日・別委譲セッション）と learning deferred.md の既知事象記録（2026-09-24・2026-09-25、L2338〜）により根本原因は特定済み: harness プロセス（OpenCode サーバ）の起動環境に AGENTDEV_GH_REPO が未設定であり、かつ harness プロセス内の spawnSync('gh') が exit 66・stderr 空で失敗する（bash 経由では再現しないプロセス環境差）。plugin はリポジトリ解決を環境変数 → gh repo view の順で行い、解決不能時は全操作を fail-closed で失敗させる（仕様どおりの動作）。回復は harness 再起動（ユーザー環境アクション）

## 影響

- tool 内部 gh spawn 経路のみが失敗するため、障害中はエージェント側から原因切り分けが困難。書込み操作は契約上 gh CLI 代替が禁止（fail-closed）のため、障害持続時は GitHub I/O 依存工程（case-open/ready/run/close、issue、intake-from-github 等）で workflow 全体が停止する

## 課題（検討対象・adversarial-review 反映後）

1. 運用文書化: 既知事象記述を issue_list 限定から全操作へ拡大し、blocked 時の resume 手順（残骸 Issue 不在確認込み・harness 再起動による回復）を文書化
2. 起動環境前提の恒久化: launcher での AGENTDEV_GH_REPO 設定、またはバッチ投入前の疎通確認（harness プロセスと同一環境で gh 解決が通ること）の前置を運用へ組み込む検討
3. エラー表面化: config-uninterpretable 失敗時の detail に「harness 起動環境の AGENTDEV_GH_REPO 未設定の可能性」を明示する等、原因特定を支援するエラー情報の改善検討

※ 当初検討対象の「エラーコード 66 の意味特定（spawn 経路・引数渡し・環境変数継承の調査）」は既知事象記録（deferred.md L2338〜）で根本原因特定済みのため除外。単発観測からの一般的な retry/backoff 契約の導入も、原因が起動環境前提にあるため対象外（再発・原因変化時に再検討）

## 既存要件との関連

- REQ-092（agentdev_gh issue_list 運用規律）、issue-operation-safety.md、definition-pr-and-idempotency.md「GitHub I/O 失敗時の gh CLI 切替継続手順」節、.agentdev/learning/deferred.md 既知事象（AGENTDEV_GH_REPO 起動環境設定が対処）
