# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---


## case-open STEP-2 で agentdev_gh 全操作が gh exit 66 で恒常失敗し serve 再起動待ちで blocked になった

- **問題事象**: case-open STEP-2 の Root Case 作成（issue_create）が gh 終了コード 66・stderr 空で 3 回失敗した。疎通確認の issue_read も同一終了コードで失敗し、障害は全操作に及んだ。一方で bash 直叩き（gh auth status、gh issue list、gh repo view、node spawnSync による gh api GET --input）と bun からの CliRunner 直接実行（同一 spawnSync 経路の issue_read）はいずれも正常だった
- **発生局面**: 運用（case-auto 内部 lifecycle case-open STEP-2 の GitHub Issue 作成時）
- **検知方法**: agentdev_gh の構造化失敗応答（operation-failed、gh exited with code 66、stderr is empty）と再試行での同一再現
- **根本原因**: opencode serve（plugin ホスト）プロセス内の起動環境劣化。plugin ホスト経路のみが失敗し bash と runner 直接実行が正常であることから、gh CLI・認証・ネットワークではなく plugin ホスト環境差と特定した（issue-operation-recovery.md の 2 段分離試験の判定基準による）。E2E 記録（.agentdev/backlog-auto/end-to-end/20261015T180807JST、20261016T142343JST）にも同一事象が serve 再起動で回復した前例がある
- **自律対応内容**: 1 回再試行（同一失敗）の後、診断手順（failure detail 確認、gh auth status、gh repo view 手動実行、bash 直叩き、bun による CliRunner 経路の読取系実行）で plugin ホスト環境差と切り分け、write-proxy payload（タイトル・本文・labels）を .agentdev/tmp/ 標準配置へ先行保存し、最終再試行 1 回（同一失敗）を確認してから STEP-2 を blocked として停止した。残骸確認（open issue 0 件）を実施し重複生成のない再開状態を確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の縮退運用パターンと回復手順の適用範囲内。write-proxy payload 標準配置の実運用例として issue-operation-recovery.md の記述と整合）
- **横展開観点**: 同一障害の再発時は再試行ループに入らず、2 段分離試験で plugin ホスト環境差を切り分け、write-proxy payload の先行保存と残骸確認を済ませてから blocked 報告へ進む
- **再発条件**: opencode serve の長時間稼働環境で agentdev_gh を呼び出した場合（前例: 20261015・20261016 の E2E 実行と今回）
- **予防策候補**: case-open STEP-2 の最初の GitHub 書込み前に委譲前疎通確認（軽量 issue_read 1 件）を追加する。serve 側の exit 66 連続回数カウントと supervisor への再起動要求の自動化
- **想定反映先**: issue-operation-recovery.md の劣化サイクル節への定量観測値の追記、agentdev-workflow-case-open references の GitHub I/O 失敗時手順への疎通確認前置の検討
- **関連**: src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md、docs/designs/responsibilities/custom-tool-contracts.md、.agentdev/tmp/rootcase-payload-phase-route-reliability-202610.json、.agentdev/backlog-auto/end-to-end/（E2E 前例記録）
- **タグ**:    