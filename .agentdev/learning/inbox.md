# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh Custom Tool 経由の gh が exit 66 で失敗し bash 直叩きは成功する

- **問題事象**: Custom Tool agentdev_gh の副作用・読取操作（issue_list 2 回、issue_create 4 回）が「gh exited with code 66; stderr is empty」で失敗。同一セッションの bash 直叩き gh（issue list、pr list、gh api search/issues、gh repo view）および bun -e による spawnSync("gh") 直接実行・CliRunner 直接実行はすべて成功
- **発生局面**: 運用（case-open STEP-2 Root Case 起票、backlog-auto 一気通貫 run 20261015T180807JST stage5）
- **検知方法**: agentdev_gh issue_create / issue_list の operation-failed 応答（retryable、gh exited with code 66、stdout・stderr 空）
- **根本原因**: 未特定。opencode plugin ホスト（長時間稼働 bun プロセス）から spawn された gh のみが stdout・stderr 空で非ゼロ終了。gh 認証（keyring・yogata）、AGENTDEV_GH_REPO 設定、gh バイナリ（2.102.0 単一、C:\Program Files\GitHub CLI）は正常確認済み。plugin ホストプロセス固有の環境差（opencode サーバー起動時の env・ランタイム差）が疑われるがセッション外部から観測不能
- **自律対応内容**: 時間間隔を置き計 7 回再試行（同一結果）。gh auth status・gh repo view・AGENTDEV_GH_REPO の確認。bun での CliRunner 直接実行により runner 契約と bash 環境の正常性を分離確認。読み取り系は契約どおり gh CLI 切替（1 回再試行後切替）で継続し冪等検出（既存 Root Case 0 件・既存設計PR 0 件）を完了。書込み系は契約上 gh CLI 代替不可のため fail-closed 停止し blocked 報告
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（retired REQ-093「agentdev_gh 起動環境障害の予防・診断・回復の恒久化」に関連する実観測。恒久化の再評価対象候補）
- **横展開観点**: Custom Tool 副作用操作が「非ゼロ終了・stdout/stderr 空」で失敗した場合、bash 直叩き gh 実行と bun による CliRunner 直接実行の 2 段分離試験で「runner 契約と実行環境の正常性」と「plugin ホスト環境差」を切り分けられる
- **再発条件**: opencode plugin ホストプロセスの環境から gh を spawn した場合（再現条件未特定。opencode サーバー再起動で回復する可能性あり）
- **予防策候補**: runner-cli.ts の failFromExec detail に「bash 直叩き分離試験」の diagnostic 提案を含める。opencode サーバー再起動を Custom Tool 障害の再開 contingency として手順化する。stderr 空失敗時に spawnSync の環境差診断出力（機密値除去）を detail へ含める
- **想定反映先**: src/common/tools/agentdev-gh/runner-cli.ts（failFromExec の診断 detail 拡張）、docs/knowledge/（Custom Tool 環境障害の分離試験手順の知識化）、agentdev-issue-management references issue-operation-safety.md
- **関連**: src/common/tools/agentdev-gh/runner-cli.ts（failFromExec、GhExec 注入点）、retired REQ-093
- **タグ**: `#gh` `#custom-tool` `#windows` `#blocked` `#環境差`
