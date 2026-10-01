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

## 2026-10-01 case-open（Case #3278 / REQ-096 ADF判断アーキテクチャ）: gh exit 66 が serve 再起動後も約8呼出で再発する劣化サイクルの観測と、多段 lifecycle を跨ぐ冪等再実行の実効性

- **問題事象**: 単一 Case の case-open（Root Case #3278 作成 → Definition PR #3279 作成）を3つの harness ウィンドウに跨いで実行したところ、gh exit 66（stderr 空・全操作対象）が serve 再起動による回復後も再発するサイクルを観測。window 1: issue_create ×2 失敗で blocked。window 2: 回復→issue_create/issue_update 成功後、issue_list（network error へ遷移）→再劣化で pr_create ×2 失敗。window 3: 回復→pr_create 成功→issue_update ×2 失敗。Supervisor 観測では plugin host が約8 gh spawn/serve 再起動で劣化するパターン。Tool 内 VERIFY（read-back）により実質1操作が2〜3 spawn を消費するため、実効呼出数はさらに少ない
- **発生局面**: case-auto 内部 lifecycle case-open 委譲（STEP-2 issue_create、STEP-4 pr_create と直後の Definition PR 記載埋め戻し issue_update）
- **検知方法**: agentdev_gh の構造化失敗応答（gh exit 66・stderr 空）と、gh CLI 単体実測（bash で auth/repo view/issue list/pr list すべて正常）による分離。failure detail の fallbacks フィールド（読取: canContinue true + gh CLI 手動実行 / 書込: fallbacks 空・canContinue false）で操作種別ごとの継続可否を機械的に判別
- **根本原因**: harness（OpenCode plugin host）プロセス内の gh spawn 起動環境が呼出回数に依存して劣化する状態（REQ-093 既知事象の新パターン。前例〔RU-0136/0149〕は恒常的起動不能だったが、今回は「回復→約8呼出で再劣化」の反復サイクル）。harness 側責務であり ADF 配布物の修正対象ではない
- **自律対応内容**: (1) 各ウィンドウで contract どおり同一操作 1 回再試行まで実施し、2 連続失敗で即 blocked（無駄な再試行をしない）。(2) 副作用操作の代替なし・fail-closed 契約を維持し手動 gh WRITE を行わない（write-guard も物理的にブロック）。(3) 各 blocked 時点で PR 残骸不在を head branch 検索で確認してから停止（重複生成予防）。(4) 再開時は永続化済み payload（`.agentdev/tmp/root-case-body.md`、`.agentdev/tmp/pr-body-3278.md`）で本文を再構成せず冪等再実行。(5) 横断依存検査エンジン等 gh 非依存タスクを blocked 報告前に完了させ、gh 再開後の残タスクを最小化
- **ユーザー確認有無**: なし（blocked 報告と Supervisor による harness 再起動のみ）
- **Decision/REQ/spec影響**: なし（REQ-093・issue-operation-safety.md 既知事象の適用範囲。劣化サイクルの定量観測は known-issues「観測 known-issues」節の蓄積候補）
- **横展開観点**: (a) gh exit 66 は「恒常的障害」だけでなく「serve 再起動後も呼出数に比例して再発する劣化」の形をとり得る。長い workflow（Issue 作成 → docs 実装 → PR 作成 → 埋め戻し）では途中で再 blocked を前提にし、gh 呼出を契約必須分だけに絞る。（b) blocked 時に payload ファイル（Issue/PR 本文）を gitignore 済み一時領域へ保存しておくと、再開ウィンドウでの再構成コストがゼロになり、限られた gh 呼出予算を副作用操作に全振りできる。（c) Tool 内 VERIFY で 1 操作が複数 gh spawn を消費するため、呼出数ベースの予算見積りでは成功応答数ではなく spawn 数で数える。（d) gh 非依存の残タスク（横断依存検査エンジン、learning capture のファイル保存と git 永続化）は gh 予算枯渇後でも完了できるため、gh 依存タスクを先に確定させる順序が有効
- **再発条件**: plugin host の gh spawn 起動環境が呼出数に依存して劣化する serve 状態で、複数 gh 操作を要する workflow を実行した場合
- **予防策候補**: case-auto orchestrator が委譲前疎通確認に加え、workflow 内の gh 呼出を（1）冪等再実行可能な最小副作用単位に分割し（2）各副作用直後に durable state（Issue 本文埋め戻し、payload ファイル）を更新する手順の運用周知。劣化サイクルの定量（約8 spawn/serve）は harness 側観測として REQ-093 の観測 known-issues への蓄積候補
- **想定反映先**: issue-operation-safety.md「観測 known-issues」節（劣化サイクルパターン）、REQ-093 の運用観測蓄積
- **関連**: 本ファイル直上の RU-0136/RU-0149 エントリ（恒常的起動不能パターン）、Case #3278 実行記録（Root Case 本文補足情報「GitHub I/O 起動環境障害記録」・Definition PR #3279 本文テスト結果）、`.agentdev/tmp/root-case-body.md`・`.agentdev/tmp/pr-body-3278.md`（payload 保存実例）
- **タグ**: `#agentdev_gh` `#起動環境障害` `#劣化サイクル` `#case-open` `#definition-pr` `#冪等再実行` `#payload永続化`

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

## 2026-09-30 case-open（RU-0147 再実行）: issue_list search トークンの正規化不一致で冪等検出が偽陰性（空の成功応答）になる

- **問題事象**: agentdev_gh issue_list の search トークン `ru0147`（小文字・ハイフン無し結合形）が、既存 Root Case #3245（タイトル「case-open: RU-0147 untracked 競合の安全解消手順を case-close STEP-6-3-1 へ追記（REQ-032）」）に一致せず、state open/closed とも成功応答・空配列で帰着した。エラーではなく「不存在」の偽陰性であるため、このまま進めると 2 件目の Root Case を重複生成する危険があった。unfiltered issue_list（state=open、ラベル指定なし）で #3245 を検出し回復した。
- **発生局面**: 運用（case-auto 内部 lifecycle case-open 再実行委譲。STEP-5 冪等検出の既存 Root Case 検出）
- **検知方法**: 空結果を不存在の証拠とせず、状態フィルタ・ラベル指定なしの issue_list 全量取得で突合し直したところ #3245 を発見（成功応答の空配列と実体の不一致）
- **根本原因**: GitHub search API（search/issues in:title）のトークン化は `RU-0147` を `ru` / `0147` 等に分割し、ハイフン無し結合形 `ru0147` とは一致しない。ハイフン・番号入り識別子を小文字結合形に正規化して search に渡すと偽陰性になる。なお同観測内で issue_list は `state: "all"` を受付ず open/closed 個別指定のみ有効（構造化失敗で即検知できるため被害は限定的）という契約差も確認
- **自律対応内容**: search トークンの信頼を放棄し、open Issue 全量を issue_list で取得して case_ref 突合で冪等検出をやり直し、既存 Root Case #3245 を再利用判定（重複生成回避）。既存 Definition PR も `gh pr list --head definition/issue-3245` で 0 件確認し、不足分なしを確定
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（issue-operation-safety.md の search トークン選択性指針の適用事例の追補候補。新規 Decision/REQ 変更は不要）
- **横展開観点**: 冪等キー語がハイフン入り識別子（RU-NNNN、REQ-NNNN 等）の場合、search は (1) ハイフン無し結合形、(2) トークン分割形（`0147` 等の番号部単独）、(3) topic_slug 等の別系統語の複数形で試行するか、母集団が小さい場合は unfiltered issue_list 突合へ切替する。空配列の成功応答は「不存在の証拠」ではなく「検索方式の証拠」として扱い、突合方式を変えて再確認してから不存在と判定する
- **再発条件**: ハイフン・番号入り識別子（RU-NNNN 等）を小文字結合形に変換して issue_list search に渡し、既存 Issue のタイトルがトークン分割形（`RU-0147`）で表記されている場合
- **予防策候補**: issue-operation-safety.md「issue_list の絞り込み規律と上限到達時 contingency」節に、ハイフン入り識別子の正規化形トークン不一致による偽陰性の注意と、空結果時の unfiltered 突合 fallback（母集団少数リポジトリで有効）を追記する
- **想定反映先**: src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md「issue_list の絞り込み規律と上限到達時 contingency」節
- **関連**: Case #3245（既存 Root Case。タイトルに RU-0147 を含む）、src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md 同節、Issue #3256 補足情報の冪等検出記録（topic_slug search で 0 件帰着の前例）
- **タグ**: `#agentdev_gh` `#issue_list` `#冪等検出` `#search-token` `#case-open`
## 2026-10-01 gh exit 66 劣化が起動直後～2呼出以内に発生した観測（case-ready 段階・Case #3278）

- **問題クラス**: 外部依存障害（harness/Custom Tool 基盤の劣化サイクル）
- **観測内容**: case-auto case-ready 段階の委譲実行において、serve 起動直後（window 消化 ~2 呼出と報告された直後）の最初の agentdev_gh pr_read が gh exit 66（stderr 空・起動環境失敗）で失敗し、1回の契約再試行でも同様に失敗。case-open STEP-6 学び（commit 97ee6a74）の「serve 再起動後も約8呼出で再発する劣化サイクル」に対し、**再起動後の窓が想定より短い（~2 呼出程度で枯渇し得る）**ことを示す反証データ。多段 lifecycle の各段が gh 呼出を9〜10件必要とする場合、1 窓で完結しない設計は中断→冪等再開の繰返しが常態化する
- **ユーザー確認有無**: なし（blocked 判定・infra-transient 分類で停止。HITL 該当なし）
- **Decision/REQ/spec影響**: なし（運用観測。gh-direct-invocation 統制・手動 WRITE 禁止契約は維持）
- **横展開観点**: stage 委譲側は gh 呼出数を事前に見積もり、窓枯渇を前提に「最も価値ある durable state 先行」（merge → Issue 生成 → 状態遷移の順）で呼出を順序付ける。payload の永続化（Issue 本文・resume plan をリポジトリ外恒久領域へ退避）により、中断後 resume は payload 再利用で再構成コストを最小化できる
- **再発条件**: serve 再起動直後の agentdev_gh 呼出で gh exit 66 が発生した場合（劣化が呼出数でなく時間経過・プロセス状態に依存する可能性）
- **予防策候補**: agentdev_gh 側の gh spawn プロセスプール再利用/再起動、または gh exit 66 検出時の serve 内自動回復（1回の内部 respawn）の導入検討。REQ-093 診断手順への「再起動直後でも発生し得る」追記候補
- **想定反映先**: docs/designs/responsibilities/custom-tool-contracts.md（agentdev_gh 操作契約の contingency）、REQ-093 関連診断 reference
- **関連**: Case #3278（case-ready 段階で infra-transient 停止・payload 退避済み）、commit 97ee6a74（同種観測の learning）、PR #3279（merge 待ち・merge 可能状態 CLEAN 確認済み）
- **タグ**: `#agentdev_gh` `#gh-exit-66` `#infra-transient` `#case-ready` `#冪等再開`

## 2026-10-01 case-run（Case #3278 Epic #3280 Wave 1 #3281）: serve 全体の gh exit 66 劣化で write-proxy 実行経路が二重に遮断された観測

- **問題クラス**: 外部依存障害（harness/Custom Tool 基盤の劣化サイクル）＋ 統制設計の相互作用
- **問題事象**: case-run 委譲（DEL-3281-1）で実装・全検証（TS-004/TS-021/TS スライス、textlint 544件 0違反、traceability check、UTF-8、AUTOGEN）が完了し pr_create のみが残る状態で、実行担当サブエージェント・親（Supervisor）両コンテキストの agentdev_gh が同一 serve 起因の gh exit 66（stderr 空）で全呼出失敗（親4/4・子も失敗）。Supervisor write-proxy として手動 gh api --input での代行を試みたところ、リポジトリの agentdev-gh-write-guard が raw gh WRITE を構造的に阻止（fail-closed 設計・迂回禁止）。結果、GitHub 書き込み経路が「正規 Tool の劣化」と「代替手動経路の guard 遮断」の二重で遮断され、serve 再起動以外の回復手段が存在しないことが確定した
- **発生局面**: case-run（case-auto orchestration stage 3・Epic Wave 1 子Issue の PR 作成段階）
- **検知方法**: 親・子両 session での agentdev_gh 失敗（gh exit 66・stderr 空）＋ write-guard のブロック応答（"blocked a raw gh WRITE command"）＋ 環境分離実測（ユーザ shell から gh CLI 直接触発・node spawnSync・bun spawnSync はすべて exit 0 で正常。serve 外では再現せず、serve プロセス内部の child spawn 劣化に局在）
- **根本原因**: serve プロセス内部の gh child spawn 劣化（gh.exe・認証・Bun・ローカル環境はすべて健全。全セッションが同一 serve を共有するため親子で同時失敗）。write-guard は仕様どおり動作（GitHub 副作用の Custom Tool 一元化の強制）であり、障害ではなく設計された境界
- **自律対応内容**: 実行担当サブエージェントが worktree の .agentdev/tmp/ へ proxy request package（exact operation・PR title/body・事前条件・read-back 期待値）と PR 本文を永続化し result=blocked で引き渡し。Supervisor が同 package を .agentdev/drafts/proxy-request-case-run-3281.md へ byte-exact アセンブルして git 永続化（case-ready 段階の commit 319ee3c6 と同パターン）。serve 再起動後の resume は package の pr_create 1呼出で完了する状態を構築して停止
- **ユーザー確認有無**: なし（infra-transient・運用上の前提不足として停止。HITL 該当なし）
- **Decision/REQ/spec影響**: なし（write-guard の fail-closed 設計は維持。guard のブロックは迂回せず標準手段〔agentdev_gh〕への復帰待ちとして扱った）
- **横展開観点**: serve 劣化中は親・子・委譲先の全 agentdev_gh が同時失敗するため、「子 → Supervisor write-proxy」の委譲だけでは回復しない（Supervisor の Tool も同一 serve 由来）。回復単位は serve 再起動。多段 pipeline の各段は gh 呼出を要するため、劣化検知時は早期に payload 永続化へ切替えて呼出を無駄に消費しない。また gh 呼出不要の作業（検証・本文作成・AUTOGEN）を先に完了させる委譲順序（本事例の実行担当の対応）が resume コストを最小化する
- **再発条件**: serve が gh exit 66 劣化状態にある間に GitHub 副作用操作（pr_create 等）が必要になった場合
- **予防策候補**: agentdev_gh の gh spawn 異常（exit 66・stderr 空）検出時の serve 内自動回復（gh spawn の内部 respawn）の導入検討、または REQ-093 診断手順への「serve 全体劣化の確認は親子両コンテキストでの失敗一致で判定する」追記候補
- **想定反映先**: docs/designs/responsibilities/custom-tool-contracts.md（agentdev_gh 操作契約の contingency・gh spawn 異常時の扱い）、REQ-093 関連診断 reference
- **関連**: Case #3278・Issue #3281（Epic #3280 Wave 1）・commit 319ee3c6（case-ready 段階の proxy package 永続化前例）・commit 97ee6a74 / e541536c（gh exit 66 劣化サイクルの先行観測）・.agentdev/drafts/proxy-request-case-run-3281.md（本件の永続化 payload）
- **タグ**: `#agentdev_gh` `#gh-exit-66` `#write-guard` `#infra-transient` `#case-run` `#write-proxy`

## 2026-10-01 配布依存境界 link profile は worktree で zero-targets、host root では実行可能（Case #3278 Epic #3280 Wave 2 case-close）

- **問題クラス**: 検証環境差（worktree 構造制約に起因する checker 実行可否の分岐）
- **観測内容**: case-close Wave 2 境界クローズ（DEL-3280-3）の QG で、`check_distribution_boundary.ts --profile link` を PR head worktree（.worktrees/3284-docs）に対して実行すると `zero scan targets found for projection 'link'`（zero-targets:link・adapter-failure 分類・検査対象 0件）となる一方、メインリポジトリ root（host）では link profile が実行可能で failures 0（scanned 359・rules scanned 286）を記録した。source profile は worktree からでも実行可能（PR #3287/#3288 の両 head で failures 0 を case-close 側で再実行・追証）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-018 worktree fallback 契約〔source profile 代替〕の適用事例の追補候補）
- **横展開観点**: worktree では .opencode/ 配布投影（junction）が未配置のため link profile は常に zero-targets になる。case-run/case-close で src/opencode/skills/**・commands/** 変更を含む PR を検証する場合、(1) worktree では source profile を実行して代替成立を記録し、(2) link profile は merge 後の host root での再実行を後続工程（Wave 3 最終 close 等）の検証手順として明示する。host root の link profile は merge 前は merge 前 src と投影の整合を示すにすぎないため、post-merge の投影 sync 後再実行が実質検査になる
- **再発条件**: junction 非展開の worktree で link profile を実行した場合（環境構造由来のため再現性 100%）
- **予防策候補**: checker 出力契約側で zero-targets:link を「検査不能（環境制約）」として明示し、source profile 代替運用の正当性を出力へ含めると、後続 Case の検証差分解釈が安定する（PR #3287 Findings の候補と同一趣旨）
- **想定反映先**: .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary*.ts（zero-targets 時の出力 guidance）・docs/designs/integrity/distribution-boundary.md（projection 分離の実行環境注記）
- **関連**: PR #3287/#3288（配布依存境界 Findings 記載）・Issue #3284・Epic #3280 Wave 2
- **タグ**: `#配布依存境界` `#link-profile` `#worktree` `#case-close` `#検証環境差`

## 2026-10-01 REQ-036-021 の「高確信度」語彙は自動昇格 opt-in 条件（REQ-096-004 禁止対象の別文脈）として現行性確認を要する（Case #3278 Wave 2 #3282）

- **問題クラス**: 語彙現行性（旧判断モデル語彙の別文脈残存の解釈分岐）
- **観測内容**: RA-003 正典 REQ 行語彙移行（PR #3286）の Capture 回収で、REQ-036-021（inspect-promote の自動昇格 opt-in 条件）が「機械的に特定可能で移行先が一意に定まる高確信度」語彙を使用していることを検知した。REQ-096-004 が禁止するのは確信度を人間判断要求の根拠とすることであり、本行は自動化の許可条件（別文脈）のため対象外と判断したが、語彙の現行性観点で将来確認候補と記録する
- **ユーザー確認有無**: なし（learning 記録のみ・対応実施はしない）
- **Decision/REQ/spec影響**: なし（REQ-096-004 の禁止範囲解釈の適用事例。本行自体は対象外）
- **横展開観点**: 旧語彙の一括置換では「同じ語彙でも文脈により禁止対象か許可対象かが分かれる」行の扱いが課題になる。語彙横断パスでは (1) 人間判断要求の根拠（禁止対象）、(2) 自動化の許可条件（要現行性確認）、(3) 禁じ手の明示的言及（対象外）を区別して処理する
- **再発条件**: REQ-096 判定表語彙への移行後に、確信度語彙を許可条件として使う REQ 行が残存する場合
- **予防策候補**: REQ-036-021 の条件語を判断方法・確定権限ベースの表現へ現行化するか、REQ-096 側で確信度語彙の許容文脈を明文化する候補
- **想定反映先**: docs/requirements/REQ-036.md（REQ-036-021）・docs/requirements/REQ-096.md（語彙許容文脈の明文化先）
- **関連**: PR #3286 Findings・Issue #3282（RA-003）・Epic #3280 Wave 2
- **タグ**: `#語彙現行性` `#REQ-096` `#RA-003` `#capture` `#Wave2`

## 2026-10-01 gh exit 66 持続時に durable state 先行ステージングで再開コストを最小化できた（case-open 段階・third-party-presupposition）

- **問題クラス**: 外部依存障害（harness/Custom Tool 基盤の劣化サイクル）＋運用改善の実証
- **観測内容**: case-open 段階（冪等再開ラン・serve 再起動後）で agentdev_gh が初期 1 呼出（issue_list 成功）を除き全操作で gh exit 66（stderr 空・起動環境失敗）を持続。45s/90s/120s バックオフ再試行でも回復せず、blocked 対応へ切替した。blocked 判定後に GitHub I/O 非依存の工程を先に完了させる順序変更（durable state 先行）を実施した結果、(1) Definition branch 作成・REQ/Design 変更・索引再生成・checker 実測・commit（definition/issue-pending @ f85216a0）までを完了、(2) Root Case 本文候補・PR 本文候補・再開手順を proxy payload として `.agentdev/drafts/` へ永続化、(3) gh CLI 読取による冪等残骸確認（Issue 0件・definition/* branch なし）まで完了した状態で停止できた。resume 時の gh 呼出は issue_create → push → pr_create → issue_update の最小 4 呼出に圧縮される
- **ユーザー確認有無**: なし（infra-transient blocked・HITL 該当なし）
- **Decision/REQ/spec影響**: なし（REQ-083-005 write guard・REQ-011/052 Custom Tool 集約契約は維持。gh CLI は読取専用 contingency のみで使用）
- **横展開観点**: 多段 lifecycle の各段は「gh 呼出を要する工程」と「要しない工程」を STEP 内で分離し、窓枯渇を前提に非依存工程を先行させる運用が有効。case-ready（Definition 受入検査はローカル検査中心）・case-run（実装・テストは非依存）でも同型の順序付けが可能。proxy payload の置場 `.agentdev/drafts/proxy-{stage}-{slug}-*.md` 先例（2319e3f9、e9b72e26）との整合も確認
- **再発条件**: serve 再起動直後の窓が ~1〜2 呼出で枯渇し、以降の呼出が持続失敗する場合（e541536c の反証データと整合）
- **予防策候補**: 各 workflow skill の STEP reference へ「gh 非依存工程の先行順序」と「blocked 時 proxy payload の標準配置」を明記する候補。agentdev_gh 側の spawn 失敗自動 respawn（REQ-093 予防策候補の継続）
- **想定反映先**: docs/designs/responsibilities/custom-tool-contracts.md（contingency 節）、agentdev-workflow-case-open / case-ready references（resume 手順）、REQ-093 関連 reference
- **関連**: `.agentdev/drafts/proxy-request-case-open-third-party-presupposition.md`（resume payload）、definition/issue-pending @ f85216a0、commit 6598a633 / e541536c / 97ee6a74（同種観測）
- **タグ**: `#agentdev_gh` `#gh-exit-66` `#infra-transient` `#case-open` `#durable-state-first` `#blocked`

## 2026-10-01 case-run（Case #3289・PR #3295 Findings 由来）: traceability sidecar は artifact パス × role を単一情報源で保持する（新規 REQ 成果物が既存 sidecar 登録済みファイルに跨る場合の対処）

- **問題クラス**: 検証基盤契約（トレーサビリティ sidecar の重複制約）
- **問題事象**: トレーサビリティ check の初回実行で duplicate-inconsistencies 6件（新規 sidecar が既存 sidecar の artifact パス × role と重複。glossary / README-INSTALL / 3スクリプトの implementation、scripts-behavior.test.ts の verification）。REQ 行が異なっていても同一パス × role が複数 sidecar / inline に現れると fail する
- **発生局面**: case-run（配布対象成果物のトレーサビリティ登録。Case #3289 DEL-3289-1）
- **検知方法**: check.ts --req REQ-097-001〜004 の duplicate-inconsistencies findings
- **根本原因**: traceability sidecar は artifact パス × role の組み合わせを単一情報源で保持する制約がある
- **自律対応内容**: REQ-097 関係を既存 sidecar（agentdev-textlint-guard、guides-terminology-correction）へ統合し、test ファイルの verification は inline ADF-COVERS へ寄せて再検証で 0 件化（修正済みとして検証差分に記録。case-close 独立再検査でも 9/9 pass 0 fail を確認済み）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（sidecar 追加時の事前確認手順の再発防止知見）
- **横展開観点**: 新規 REQ の成果物が既存 sidecar 登録済みのファイルに跨る場合、新規 sidecar を作らず既存 sidecar の当該パス × role へ REQ 行を追記するか、test ファイルのように producer 側であれば inline 宣言へ寄せる必要がある。sidecar 追加前に既存 sidecar のパス × role 登録状況を事前確認する
- **再発条件**: 新規 sidecar を作成し、既に別 sidecar に implementation / verification 登録済みのファイルを登録した場合
- **予防策候補**: sidecar 追加時の事前確認手順（重複パス × role の走査）を traceability の authoring 手順へ追記する候補
- **想定反映先**: traceability sidecar の authoring 手順（agentdev-traceability SKILL または sidecar policy 手順）
- **関連**: PR #3295 本文「Findings / Capture候補」learning 項、PR #3295 本文検証差分「トレーサビリティ check」行
- **タグ**: `#traceability` `#sidecar` `#duplicate-inconsistencies` `#case-run` `#capture`

## 2026-10-01 case-run（Case #3289・PR #3295 Findings 由来）: agentdev_gh pr_create / pr_read の gh exit 66 恒常失敗時に委譲手順定義の bash gh 例外手順で PR 作成を完遂した証跡

- **問題クラス**: 外部依存障害（harness/Custom Tool 基盤の劣化）＋委譲手順の例外適用
- **問題事象**: Custom Tool `agentdev_gh` の操作（pr_create 3回、pr_read 1回）が起動環境障害（gh exit 66・stderr 空）で恒常失敗した
- **発生局面**: case-run（実装 PR #3295 作成。Case #3289 DEL-3289-1）
- **検知方法**: agentdev_gh の構造化失敗応答（gh exit 66・stderr 空）と gh CLI 本体の健全性実測（auth・read 操作は成功）
- **根本原因**: harness ツールプロセス側の起動環境障害（REQ-093 既知事象）
- **自律対応内容**: 委譲手順に定められた例外手順（bash からの gh による PR 作成、body ファイル指定 + 読み戻し検証）へ切替し PR #3295 を作成。Tool 試行回数: 4回（pr_create 3回 + pr_read 1回、いずれも gh exit 66 / stderr 空）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（起動環境障害時の例外手順適用の証跡。後続観測〔Case #3278 Wave 1、本ファイル内」では write-guard が手動 gh WRITE を構造的に阻止する環境も存在するため、例外手順の可否は環境の guard 設定に依存する点に注意）
- **横展開観点**: 例外手順の適用可否は (1) 委譲手順への定義有無、(2) 環境の write-guard 状態の両方で決まる。両条件を確認してから切替する
- **再発条件**: serve 全体の gh exit 66 劣化中に PR 作成が必要になった場合
- **予防策候補**: 委譲手順の例外手順定義に write-guard 状態の事前確認を追記する候補（REQ-093 予防策の継続）
- **想定反映先**: agentdev-case-run-execution-adapter（例外手順定義）、REQ-093 関連 reference
- **関連**: PR #3295 本文「Findings / Capture候補」delegation-tool-fallback 項、本ファイル内 Case #3278 Wave 1 entry（write-guard 遮断の先行観測）、Case #3278 case-ready 段階 entry（再起動直後の窓枯渇）
- **タグ**: `#agentdev_gh` `#gh-exit-66` `#delegation-tool-fallback` `#case-run` `#capture`

## 2026-10-01 case-close（Case #3289）: third-party 配布物追加により check_integrity spawn 系回帰 4 test が main root 正規形で新規 timeout 超過（baseline 対照実行で +3.7 秒増を定量）

- **問題クラス**: 検証環境差（配布物増加に伴う checker 実行時間増加とテスト固定 timeout の不整合）
- **観測内容**: case-close STEP-3 の full integrity suite（main root・REQ-060 正規形）で check_integrity.test.ts の IR-055 実修復回帰 ×2・NG21 N16/N17 ×2 の 4 test が `timed out after 15000ms` で fail。4 test はいずれも Bun.spawnSync で check_integrity.ts を REPO_ROOT 起動し JSON 解析する構造。checker 実測（timeout なし直接実行、spawnSync 分離取得 + UTF-8 明示退避）は 16.9 秒で正常完了し検証内容本体は合格（runtime-unresolved-reference 新規 0・baseline-known 40 ≤ 548・skill-category-gap ok・command-capture-duty absent）。baseline 対照実行（third-party マージ直前 main 3016eb18 を detached worktree で再現）では同一 4 test が 0 fail（checker 実測 13.2 秒）
- **発生局面**: case-close STEP-3 docs 検証（merge 後 main での full integrity suite 実測。Case #3289）
- **検知方法**: suite 実行結果の fail 抽出 → 4 件すべて ~15 秒台の timeout シグネチャ → checker 手動実測で検証内容本体を分離 → baseline 対照実行（docs/knowledge/windows-bun-test-spawn-timeout-classification.md の手順）で 13.2 秒 / 0 fail を確認
- **根本原因**: 本 Case の配布物追加（tool package cli.ts 等・plugin・導入系3経路 drift 検知・skills.yaml 等）で checker 実行時間が 13.2 秒 → 16.9 秒（+3.7 秒）に増加し、既知事象（RU-0150、Case #3248）で指摘されたテスト側固定 timeout 15 秒の余裕を超過させた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既知事象の追補。timeout 値調整は後続 Case 対象）
- **横展開観点**: RU-0150 の分類（環境依存・当該変更起因なし）に対し、本観測は「配布物を増やす変更が checker 実行時間を増加させ、timeout 余裕を超過させ得る」ことを定量（+3.7 秒）で示す。配布物を追加する Case の case-close では full suite timeout 系 fail の由来分類に baseline 対照実行を併用するのが有効。timeout 値は checker 実測所要時間（現行 16.9 秒・更に増加する配布物追加を想定）に対する余裕を持たせて設定する
- **再発条件**: 配布物を追加する Case 以降、main root 正規形で check_integrity.test.ts を実行した場合（checker 実測 > 15 秒の間継続）
- **予防策候補**: check_integrity.test.ts の IR-055 / NG21 回帰 4 test の timeout 値（15000ms）を checker 実測所要時間に見合う値（例: 30〜60 秒）へ引き上げる（RU-0150 予防策候補の継続。Case 化して対応）
- **想定反映先**: check_integrity.test.ts（timeout 値調整）、checker 実行契約と検出基盤規則 Design（実行時間観点の注記要否判断）
- **関連**: 本ファイル内 RU-0150 entry（Case #3248 既知事象）、docs/knowledge/windows-bun-test-spawn-timeout-classification.md（対照実行手順）、Case #3289 case-close 対応記録（検証差分・fail 由来分類記録）
- **タグ**: `#integrity` `#bun-test` `#timeout` `#配布物増加` `#baseline対照実行` `#case-close`


## 2026-10-01 case-run/case-close（Root Case #3293 Wave 1）: 判断境界文言更新を含む配布物変更での契約テスト期待値同期と、docs guard profile 選定

- **問題事象1**: 配布物（src/opencode/skills/**）の判断境界文言を REQ-096 語彙へ更新した際、repo 側契約テスト（case-ready-definition-readiness）が旧文言を verbatim pin しており QG-4 fail。case-run 差し戻し→期待値同期（1行）で解消。
- **示唆1**: 文言更新を含む配布物変更では、同一変更セット内で pin テスト期待値の同期を予防確認する価値がある。
- **問題事象2**: targeted docs guard の case-run workflow profile は src/opencode 配下を appliesTo とせず、--files 明示指定でも TARGET-EMPTY（strict fail）となる。src/opencode 配布物のみの変更では docs-check profile（appliesTo 広域）で実行するのが実態に合致する。
- **問題事象3**: integrity suite のサブプロセス実行型回帰テスト（IR-055）はテスト側 15 秒タイムアウトを持ち、同一 HEAD・同一 canonical 形式で環境負荷により 0 fail ⇄ 4 fail が変動（main root 同一再現で確認）。タイムアウト値見直しまたは実行系分離が安定化方策。
- **運用実績（REQ-093 補強）**: agentdev_gh exit 66 持続時の縮退運用（probe 1回 → write 持続確認 1回 → 書込み打ち止め → proxy payload 化 → 外部 Supervisor 回復パスで consume）が機能した。
- 分類候補: learning（#3298/#3299 事例・PR #3306/#3307 Findings より）
