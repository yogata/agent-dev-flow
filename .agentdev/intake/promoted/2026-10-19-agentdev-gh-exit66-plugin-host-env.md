# agentdev_gh の gh exit 66 が opencode plugin プロセス内のみ発生し bash/bun からは再現しない

## 観測内容

- 出所: case-auto orchestration stage 1 からの委譲による case-open 実行（RU-0240 / adoption-implementation-consistency。要件doc .agentdev/drafts/req-draft-adoption-implementation-consistency.md）
- case-open STEP-2（Root Case Issue 作成）で agentdev_gh の issue_list 2回・issue_create 2回がいずれも operation-failed・gh exited with code 66・stderr 空で失敗した。
- 同一コマンドの切り分けでは、bash 直叩き（gh issue list、gh repo view --json nameWithOwner）と bun からの spawnSync 直接実行（runner-cli.ts と同一経路・同一引数）はいずれも status 0 で成功した。
- issue-operation-recovery.md の診断手順（2段分離試験）の判定基準に従うと bash 成功 + runner 経路成功は「経路固有の一時事象」該当だが、Custom Tool 本体（opencode plugin プロセス内の runnerFor 成功後の runAgentdevGhOperation）だけが恒常的に 66 で失敗した。
- つまり runner 同一経路の単体再現が成功し、plugin ホストプロセス（opencode）内の実行だけが失敗する環境差である。

## 影響

- opencode plugin プロセス内での GitHub 書込み系操作が環境要因で全滅した場合、回復手段（harness 再起動）は harness 責務のため委譲サブエージェントからは実施不能であり、blocked 停止のみが選択肢になる運用限界がある。
- 診断手順の判定基準に「runner 経路の単体再現が成功し Custom Tool 本体のみ失敗する場合」の分類行がなく、同種事象の切り分け結果を正しく分類できない。

## 課題

- plugin プロセス内でのみ gh が非ゼロ終了（66・stderr 空）となる環境要因（plugin プロセスの PATH 解決、環境変数継承、console codepage、DLL 読込等）が未解明。
- issue-operation-recovery.md の 2段分離試験の判定基準への分類行（plugin ホストプロセス固有の環境差）追加の要否が未決。

## 既存要件との関連

- src/opencode/plugins/agentdev-gh-tool（plugin ホスト実行環境）
- src/common/tools/agentdev-gh（runner-cli.ts、診断 detail）
- src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md（診断手順・判定基準）

## 人間判断ポイント

- Problem 管理としての環境要因調査起票の要否と、診断手順改訂候補の採否。
