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

## 2026-09-30 case-open（RU-0149）: agentdev_gh 起動環境障害による case-open blocked（冪等検出と重複生成防止は完了済みで停止）

- **問題事象**: case-auto batch（RU-0149、並行 14 draft）配下の case-open サブエージェントで agentdev_gh の全操作（issue_list ×2、issue_read ×1、issue_create ×2）が `gh exited with code 66; stderr is empty`（operation-failed、stdout も空）で持続失敗。Root Case の issue_create が不可能となり case-open は blocked 停止。失敗は fail-closed で副作用なし。
- **発生局面**: 運用（case-auto 内部 lifecycle case-open 委譲。preflight 設定検証通過後、Root Case 作成の最初の issue_create で発覚）
- **検知方法**: agentdev_gh の構造化失敗応答（failure detail の gh 終了コード 66・stderr 空・stdout 空）と、bash セッションでの gh CLI 単体実行（gh auth status、gh repo view、gh issue list、gh pr view、gh pr view 3237 がすべて成功）による切り分け実測
- **根本原因**: harness（OpenCode プロセス）内の spawnSync gh 起動環境の障害（REQ-093 既知事象の再発）。gh CLI 実行ファイル・認証・ネットワークは健全でリポジトリ解決も成功（失敗分類が config-uninterpretable でなく runner 経路 operation-failed）のため、harness ツールプロセス内の起動環境（PATH・環境変数）が原因と特定。回復手段の harness 再起動はサブエージェント側から実行不能
- **自律対応内容**: known-issues（issue-operation-safety.md「起動環境障害の known-issues」）の診断手順に従い実施: (1) 失敗 detail の診断情報確認、(2) gh CLI 単体の健全性実測、(3) 同一操作 1 回再試行（問題: 既存成果物検出の重複チェックを兼ねた再試行でも持続失敗）、(4) 冪等検出を reference 契約どおり gh CLI 読取切替で完了（open Issue / open PR とも 0 件、切替理由・コマンド・結果を検証記録に残す）、(5) issue_create 再試行前後に重複生成チェック（gh CLI 読取で残骸 0 件確認）。書込み操作は gh CLI 代替禁止を維持し blocked 停止として親へ報告。Root Case 本文候補生成・adversarial-review skip 判定・横断依存検査（condition_a/b 警告 0 件、population 1）までは完了済みで停止
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-093・issue-operation-safety.md 既知事象の適用手順の範囲内。新規 Decision/REQ 変更は不要）
- **横展開観点**: bash の gh CLI 成功をもって harness 内 Tool の健全性と断定しない。失敗 detail の終了コード・stderr 空 → gh CLI 単体実測 → gh CLI 読取切替による冪等検出・重複チェック → blocked 報告、の順に進めれば書込み迂回なしで安全に停止できる。resume 時は issue_create 前の重複生成チェック結果（0 件）を根拠に中断した操作から再実行すればよい
- **再発条件**: harness 起動環境が gh 起動に不適な状態で agentdev_gh を呼び出した場合。batch 並行実行では全サブエージェントの書込系操作が同時に blocked し得る（本バッチで実際に兄弟 case-open も同時障害を記録）
- **予防策候補**: case-auto orchestrator が case-open 委譲前に agentdev_gh の軽量読取（issue_read 等）1 操作で疎通確認を行い（REQ-093-002 の投入前疎通確認の適用）、不通時は委譲せず harness 再起動へ誘導する
- **想定反映先**: issue-operation-safety.md 起動環境障害節の診断手順への gh CLI 単体対比実測の明記と、case-open 委譲前疎通確認の運用周知（REQ-093-002）
- **関連**: src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md「起動環境障害の known-issues」節、docs/requirements/REQ-093.md、src/opencode/tools/agentdev-gh/runner-cli.ts failFromExec、同バッチ RU-0136 case-open の同一障害エントリ（本ファイル直前）
- **タグ**: `#agentdev_gh` `#起動環境障害` `#case-open` `#blocked` `#冪等検出`
