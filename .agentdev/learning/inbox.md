# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-30 case-open（RU-0136）: agentdev_gh 起動環境障害（gh exit 66・stderr 空）はサブエージェント側から回復不能

- 発生: case-auto batch（14 draft 並行）配下の case-open サブエージェントで agentdev_gh の全操作（issue_list 読取 4 回、issue_create 書込 1 回）が `gh exited with code 66; stderr is empty`（operation-failed）で失敗。書込は代替なし・canContinue: false（fail-closed）で blocked。
- 切り分け: 同一マシンの bash セッションでは同一 gh コマンド（`gh auth status`、`gh repo view`、`gh api search/issues`）がすべて正常（exit 0）。GH_CONFIG_DIR 破損仮説（再現せず、exit 4 + stderr あり）、WindowsApps スタブ仮説（gh.exe スタブ不在）は不成立。リポジトリ解決は成功している（失敗分類が config-uninterpretable ではなく runner 経路の operation-failed）ため、harness ツールプロセス側の起動環境起因と特定。
- 回復: harness 再起動が必要（REQ-093、issue-operation-safety.md「起動環境障害の known-issues」）。サブエージェント側からは実行不能。読取は gh CLI 切替で継続（切替理由・コマンド・結果を検証記録に残し、検出基準は不変）、書込は正規経路限定のため blocked。
- 示唆: 「stderr 空の非ゼロ終了は環境起因の可能性」（既知シグナル）に加え、終了コード 66 という具体値と「bash は健全・Tool プロセスのみ故障」の分離事実が診断の手がかりになる。batch 並行実行では全サブエージェントの書込系操作が同時に blocked し得るため、case-auto orchestrator 側での早期疎通確認（軽量読取 1 操作）が有効。
- 分類候補: learning（gh workaround・診断手順の追補。既存 known-issues との重複は learning-promote の既存対策確認で判定）
