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

## 2026-09-30 case-run（Case #3252・PR #3267 Findings 由来）: verify-only closure 候補の委譲前に RA 単位の実施状態を実測確認してから経路を選択すべき

- **問題事象**: verify-only closure 前提の委譲コンテキスト（structured_context）が「実装済み・main merge 済み」と要約していたが、RA-001 は Definition PR #3255 に含まれず case-run 未実施だった。TS-001 初回検証で移管註不在を検出し fix-and-reverify（PR #3267）で解消。検証が RA の不在を確実に検出したため実害は回避されたが、委譲コンテキストの要約だけを信じて verify-only closure を選択していたなら未実装のままクローズし得た。
- **発生局面**: case-run（実現面実装。Case #3252 DEL-CASE3252-RUN-1）
- **検知方法**: TS-001 の検証（retired/REQ-013.md 実取得読取による移管註存在確認）
- **根本原因**: 委譲側の structured_context 要約が会話記憶ベースの記述を含み、Issue 本文 SSoT（Execution Contract「RA-001 は case-run 担当で PR 外」）と突合していなかった
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（運用改善。intake item として 2026-09-30-3252-delegation-context-realization-state-mismatch.md に回収済み）
- **横展開観点**: case-run に限らず、PR/carrier commit の不在・不在性の主張を含む委譲では、委譲前に RA（realization_actions）単位で Issue 本文・git log 実測を確認してから経路（実装系 / verify-only）を選択する。検証（TS）が不在検出の最後の防衛線であるため、TS の pass_criteria に「存在確認」を含める規約は維持する
- **再発条件**: 委譲コンテキスト要約が実現面の実施状態を正確に反映せず、かつ検証項目が不在を検出しない場合
- **予防策候補**: case-run 委譲 structured_context の「実装状態」記述は永続状態（Issue 本文・git log）からの実測に限定し、会話記憶からの要約を禁止する
- **想定反映先**: case-auto orchestration stage 3（委譲 prompt 生成）の運用規約・agentdev-case-run-execution-adapter の実装状態判定参照
- **関連**: PR #3267 本文「Findings / Capture候補」、Case #3252 Issue 本文 Execution Contract、同日 intake item（2026-09-30-3252-delegation-context-realization-state-mismatch.md）
- **タグ**: `#case-run` `#verify-only-closure` `#委譲コンテキスト` `#fix-and-reverify`

## 2026-09-30 case-close（Case #3252）: integrity checker の node --experimental-strip-types 実行が require 未定義で失敗する（bun run 経路への切替で解消）

- **問題事象**: case-close STEP-3 docs 検証で、checker 実行契約（checker-execution-contracts.md）が「標準経路」と規定する node --experimental-strip-types による checker 実行が `ReferenceError: require is not defined in ES module scope` で失敗（check_changed_docs.ts:44・generate_indexes.ts:25 等。スクリプト本体は require を使用・Node 26.7.0 では ESM からの require 呼出し非対応）。bun run 経路（spawnSync による status/stdout 分離取得・fs.writeFileSync UTF-8 退避）へ切替して EXIT=0 で解消。
- **発生局面**: case-close STEP-3 docs 検証（merge 後 main での targeted docs guard・check_autogen_freshness 実行）
- **検知方法**: checker 実行の EXIT=1・stdout 空 → 退避ファイルの stderr 参照（ReferenceError 特定）
- **根本原因**: checker 実行契約の「安定実行経路」節の標準経路記述（node --experimental-strip-types）と実機の実行環境（require 使用の TS スクリプト・bun 前提）との乖離
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（本 Case 対象外。既知の例外経路〔bun run CLI + stdout flush 考慮〕の範囲内で解消。契約文書側の更新要否は別途判断）
- **横展開観点**: bun 前提の integrity scripts を node で起動すると require 未定義で失敗する。Windows + bun 環境では bun run 経路に切替し、stdout 証跡は spawnSync（status/stdout 分離取得）+ fs.writeFileSync（UTF-8 明示）で退避する（PowerShell リダイレクト禁止規約と整合）
- **再発条件**: node --experimental-strip-types で require 使用の checker を実行した場合
- **予防策候補**: checker 実行契約の標準経路記述に「bun 前提スクリプトへの node 実行は require 未定義で失敗する」旨の実機制約を追記する（対象ファイル: .opencode/skills/repo-agentdev-integrity 配布外のため docs/designs/integrity/checker-execution-contracts.md 側の判断）
- **想定反映先**: checker-execution-contracts.md「安定実行経路」節、case-close/case-run STEP-3 の checker 実行手順
- **関連**: docs/designs/integrity/checker-execution-contracts.md、Case #3252 case-close 対応記録コメント（検証差分・テスト結果に実行経路記録済み）
- **タグ**: `#checker` `#bun` `#node` `#実行経路` `#case-close`

## 2026-09-30 case-close（RU-0150）: full integrity suite の spawnSync 型回帰テスト 4 件がローカル環境で継続 timeout fail（checker 実測による検証内容本体の分離確認が必要）

- **発生**: case-close STEP-3 の full integrity suite（`bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`・timeout 600 秒明示指定・cwd main root）で check_integrity.test.ts 内の 4 test（IR-055 実修復回帰 ×2・NG21 N16/N17 ×2）がすべて `this test timed out after 15000ms` で fail。単独ファイル再実行でも同一 4 件が再現（flake ではない継続発生）。
- **発生局面**: case-close STEP-3 docs 検証（merge 後 main での full integrity suite 実測）
- **検知方法**: suite 実行結果の `(fail)` 行抽出 → 全 fail の所要時間が 15 秒台前後（[20844ms]/[16031ms]/[15031ms]/[15031ms]）で統一的な timeout シグネチャ → 単独再実行で再現確認 → 該当 checker（check_integrity.ts）の手動実測で分離
- **切り分け**: 4 test はいずれも Bun.spawnSync で check_integrity.ts を実行して JSON 解析する構造で、checker 実体の手動実測（spawnSync による status/stdout 分離取得 + fs.writeFileSync UTF-8 明示退避）は 20.6 秒で正常完了。fail の直接原因はテスト側 timeout 値（15 秒）とローカル実行速度の不整合であり、checker の検出結果ではない（検証内容本体は合格: runtime-unresolved-reference 新規 0 件・baseline-known 40 ≤ 548・skill-category-gap ok・command-capture-duty 対象 absent）。
- **回避**: fail 判定時に該当 checker を手動実測し検証内容本体を分離確認してから判定する。テスト fail をそのまま QG-4 不合格にせず、fail 由来分類（既知欠陥・環境依存・当該変更起因の3分類）を evidence 化する。本件の fail 分類は環境依存・当該変更起因なし。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（本 Case 対象外・REQ 行変更なし Case。テスト timeout 値の調整は別 Case 候補）
- **横展開観点**: spawnSync 型回帰テストの timeout 値は実行環境速度に依存して不成立になり得る（checker 実測 20.6s vs timeout 15s）。timeout 値は checker 実測所要時間に対する余裕を持たせるか、実行時間の事前測定に基づいて設定する。また bun test 全体実行は実測 308 秒のため timeout 未指定の打ち切りは fail 証拠にならない（既存契約の 300-600 秒明示指定が必須であることを再確認）。
- **再発条件**: check_integrity.test.ts 等の spawnSync + 固定 timeout テストをローカル環境で実行した場合（checker 実測所要時間が timeout 値を超える環境）
- **予防策候補**: check_integrity.test.ts の IR-055 / NG21 回帰 4 test の timeout 値（15000ms）を checker 実測所要時間に見合う値へ引き上げる、または checker 実行をモックしない構成での環境速度計測に基づく timeout 設定（対象ファイル: .opencode/skills/repo-agentdev-integrity 配布外スクリプト・Case 化して対応）
- **想定反映先**: check_integrity.test.ts（timeout 値調整）、checker 実行契約と検出基盤規則 Design（実行時間観点の注記要否判断）
- **関連**: Case #3248 case-close 対応記録コメント（full integrity suite 実測・fail 分類記録済み）
- **タグ**: `#integrity` `#bun-test` `#timeout` `#環境依存` `#case-close`

## 2026-09-30 case-run（Case #3243・PR #3272 Findings 由来）: worktree 環境での git stash pop 事故を防ぐ（一時状態切替は stash を使わず git show で）

- **問題事象**: stash は refs/stash としてリポジトリ全体（全 worktree 共通）に保存されるため、worktree から `git stash pop` を実行すると他環境（main 等）で作成された stash を pop し得る。本件では worktree 内検証での `git stash push`（pathspec を worktree サブディレクトリから相対指定して失敗）に続く `git stash pop` が main 環境の stash「unrelated local changes before .agentdev persist」を pop し、AGENTS.md / REQ-0134.md / REQ-0141.md にコンフリクトを発生させた。stash entry は pop 失敗時に kept され損失はなかったが、復旧手順（HEAD への checkout + `git rm -f` による modify/delete 解消、stash entry の kept 維持）を要した。
- **発生局面**: case-run（実現面検証。Case #3243 DEL-3243-1）
- **検知方法**: git stash pop のコンフリクト出力（modify/delete 衝突）
- **根本原因**: stash のリポジトリ全体共有性（worktree ローカルではなく refs/stash 共通）の理解不足と、pathspec 相対指定失敗後の pop 実行
- **ユーザー確認有無**: なし（stash entry は kept 維持・データ損失なし）
- **Decision/REQ/spec影響**: なし（運用改善）
- **横展開観点**: worktree 内検証での一時状態切替は stash を使わず、単一ファイルの base 比較には `git show <ref>:<path>` による内容取得を推奨。baseline 系比較は detached worktree（stash 不使用）の標準手順（agentdev-git-worktree worktree-operations「git stash 運用手順（一時退避）」の detached worktree 標準手順）と整合
- **再発条件**: worktree 内から git stash pop を実行した場合（他環境の stash entry が存在する場合）
- **予防策候補**: worktree 内の検証手順（case-run / case-close の STEP 契約・reference）に「stash 不使用・git show による base 比較」の規定を明示する（agentdev-git-worktree の detached worktree 標準手順への統一誘導）
- **想定反映先**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md「git stash 運用手順（一時退避）」節、case-run / case-close の検証手順 reference
- **関連**: PR #3272 本文「Findings / Capture候補」learning 項、docs/knowledge/windows-powershell-bulk-io-corruption.md（PowerShell 経由の証跡退避禁止規約と同時期に運用）
- **タグ**: `#git` `#worktree` `#stash` `#case-run`
