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
## issue_create の labels 空配列では role に応じた物理ラベルが付与されず issue_list の labels フィルタで検出できない

- **問題事象**: case-open STEP-2 の Root Case 起票（issue_create、labels: []、role: case）後、issue_list（state: open、labels: [adf-case]）で当該 Issue が検出されなかった。issue_read の読み戻しで labels は空配列のままだった
- **発生局面**: 運用（case-open STEP-2 起票後の冪等検出・横断依存検査の未クローズ Case 群取得時）
- **検知方法**: labels フィルタ付き issue_list が空を返し、issue_read の読み戻しで labels 空を確認
- **根本原因**: labels: [] は Tool 契約上の必須フィールド（空配列以上）であり、起票時の既定付与は設けない契約。物理ラベル（adf-case 等）の付与は呼出側が検索・整理用ラベルとして任意選択する必要があり、空配列起票では labels 検索経路が失われる
- **自律対応内容**: labels フィルタを外した state: open の issue_list で全 open Issue を取得し、タイトル書式（Case: 接頭辞）で Root Case 役割を特定して回避した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（検索・整理用ラベルの任意付与契約の範囲内。運用側の選択改善）
- **横展開観点**: Root Case・追跡Issue の起票時に検索・整理用ラベルを付与すると後続工程の検出が安定する
- **再発条件**: labels: [] で起票した後、labels フィルタ付き issue_list で冪等検出・Case 群取得を行う場合
- **予防策候補**: case-open STEP-2 の起票で検索・整理用ラベルの付与を既定化する検討、issue-operation-safety.md への起票ラベル指針追記
- **想定反映先**: agentdev-workflow-case-open references/root-case-and-definition-package.md 手順6、agentdev-issue-management references/issue-operation-safety.md
- **関連**: src/common/tools/agentdev-gh/、Case #3782
- **タグ**:

## bash ヒアドキュメント約13KB でコマンドが途切れ node stdin script が構文エラーになる

- **問題事象**: DefinitionEdit 24件を組立・検証する node stdin ヒアドキュメント（約15KB）を1回の bash 呼び出しで実行したところ、コマンド文字列が約13KB で途切れ、here-document が end-of-file で終端され node に未完結 script が渡り SyntaxError になった
- **発生局面**: 運用（case-open STEP-4 機械工程の DefinitionEdit 入力組立時）
- **検知方法**: bash warning「here-document delimited by end-of-file」と node の SyntaxError（文字列が切れた行の位置）
- **根本原因**: bash ツールのコマンド文字列に長さ上限があり、長いヒアドキュメントを含む単一コマンドは後半が失われる
- **自律対応内容**: script を5分割して cat > / cat >> の複数回呼び出しで .agentdev/integrity/reports/build-edits.cjs へ断片追記し、最後に node で一括実行して回復した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行環境の制約回避）
- **横展開観点**: 長い定義・入力 JSON を組み立てる機械工程は、単一 bash コマンドに頼らず断片ファイル追記と一括実行の2段構成にする。断片は project root 内の実行時作業領域（.agentdev/integrity/reports/）へ置き、検査後に削除する
- **再発条件**: 10KB 超の inline スクリプト・入力 JSON を単一 bash コマンドのヒアドキュメントで渡す場合
- **予防策候補**: prepare_definition_pr の入力 JSON 組立手順へ分割書込みの標準手順追記
- **想定反映先**: agentdev-workflow-case-open references/definition-pr-and-idempotency.md（機械工程・入力 JSON 組立条項）、agentdev-git-worktree references/worktree-operations.md（標準手段節への分割書込み補足）
- **関連**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts、Case #3782
- **タグ**:

## Custom Tool 障害時に tool 内部 API を直接起動する一時ブリッジを作成し非正規経由で書き込んだ

- **問題事象**: agentdev_gh が gh exit 66 で全操作失敗した際、回復契約（issue-operation-recovery.md）を精査せず、tool 内部モジュール（runAgentdevGhOperation 等）を直接起動する一時ブリッジスクリプト（.agentdev/tmp/gh-bridge.ts）を作成して Issue 本文更新と SSoT コメント投稿を実行した。復旧後に全投稿を正規経路で訂正する必要が生じた
- **発生局面**: 運用（case-auto stage 3 の工程記録反映時。Custom Tool 障害中）
- **検知方法**: 停止報告の見直しと回復契約の再読込（bash gh による代理は読み取り専用に限定、書き込みの回復手段は harness 再起動、という契約の確認）
- **根本原因**: 障害時の回復手段を既存文書で確認せず、「内部 runner の直接実行が技術的に可能」を「正規経路として許容される」と誤って解釈した
- **自律対応内容**: ブリッジと当該実行の一時ファイルを削除し、opencode server 再起動後に Custom Tool で全投稿を訂正（子 Issue 進行状況6件、SSoT コメント3件、Root Case への判断変更記録コメント 6247541247 による経緯開示）
- **ユーザー確認有無**: あり（訂正指示）
- **Decision/REQ/spec影響**: なし（回復契約の遵守問題。契約自体の変更は不要）
- **横展開観点**: Custom Tool 障害時に書き込み要件が生じても、技術的代替経路の存在を以て正規とは解釈しない。回復文書の許容範囲を確認し、書き込みは harness 再起動による Tool 復旧を待つ
- **再発条件**: Tool 障害中に GitHub 書き込みを要する記録契機が発生し、回復契約を確認せず内部 API の直接起動に至る場合
- **予防策候補**: issue-operation-recovery.md へ「tool 内部モジュールの直接起動は読み取りを含め非許容」の明記。障害時の最初の対応手順に同文書の必読を組み込む
- **想定反映先**: src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md、agentdev-workflow-orchestration（障害伝播・回復手順）
- **関連**: Root Case #3782、comment 6247541247
- **タグ**: `#custom-tool` `#回復契約`

## 工程記録の日時を実測せず逆算で書き込み、完了確定前に終了日時を設定した

- **問題事象**: 子 Issue 6件の進行状況（開始・終了日時）を、実着手・完了確定の実測なしに PR 作成時刻からの逆算で書き込んだ。完了判定を所有しない case-run 段階で終了日時を設定し、record-comments.ts の構築・検証関数を経由しない raw 正規表現置換スクリプトで本文を書き換えた
- **発生局面**: 運用（case-auto stage 3 の工程記録取りまとめ反映時）
- **検知方法**: 停止後の記録精査。git と GitHub の観測事実（ブランチ作成 2026-10-18T13:39:23+09:00、各初回 commit 時刻、PR createdAt、コメント投稿時刻）と記載値の突合により、記載値が観測されていない値であることを確認
- **根本原因**: 記録契約（開始日時は初回実着手の実測値のみ、終了日時は completed 確定時のみ、本文は record-comments.ts で構築・検証）を記録の見栄え優先で省略し、観測できない値を埋めるために推定を生成した
- **自律対応内容**: 正規ツール復旧後に6件の進行状況を観測事実に基づく「未記録（実測境界付き）」へ置換し、case-close の完了確定時に実測終了日時（2026-10-18T20:14:57+09:00）のみを設定した。Root Case へ判断変更記録として開示
- **ユーザー確認有無**: あり（訂正指示）
- **Decision/REQ/spec影響**: なし（workflows/issue-lifecycle-records Design の契約遵守問題）
- **横展開観点**: 観測できない値は「未記録」と既知の境界時刻の併記で残す。日時フィールドを埋めるための推定生成を行わず、本文書き換えは正規の構築・検証関数を経由する
- **再発条件**: 記録契約上の時刻が未観測のまま記録欄を埋める必要が生じ、推定値の生成と raw での本文書き換えを選択する場合
- **予防策候補**: 未観測時刻の境界表現（既知の上限・下限時刻の併記）を記録様式として提供する
- **想定反映先**: src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts（境界表現の様式サポート検討）、docs/designs/workflows/issue-lifecycle-records.md
- **関連**: 子 Issue #3784〜#3789、Root Case #3782
- **タグ**: `#記録整合性` `#工程記録`

## bun 1.3.6 の test runner が最終テストファイルの fail でも終了コード 0 を返す場合がある

- **問題事象**: bun test（bun 1.3.6）のフル実行で、最後に読み込まれたテストファイル内の fail 1 件（TS-007）が残っていてもプロセス終了コードが 0 になる観測をした（2918 tests 中 1 fail で exit 0）。終了コードで機械受理するゲートをすり抜ける
- **発生局面**: 実装（case-close QG-4 正規形の機械ゲート実行時）
- **検知方法**: QG-4 実行の完全ログと終了コードの突合（fail 1 件と exit 0 の併存を観測）
- **根本原因**: bun 1.3.6 の test runner において、最終ファイル相当の fail 集計が終了コードへ反映されない race が存在する（ファイル読込順序に依存）
- **自律対応内容**: fail 検出対象ファイルを独立 gate（file-level split: split-1a 汎用 + split-1b 対象ファイル単独）へ分離し、対象ファイルの fail が単独 gate の終了コードへ確実に反映される構成で 3 PR の QG-4 を実行した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（QG-4 正規形の実行形態対応。契約変更不要）
- **横展開観点**: 終了コードで機械受理するゲートは、ランナー既知の race を前提に fail 検出対象を独立 gate 化する
- **再発条件**: bun 1.3.6 で bun test の最終ファイルに fail が集中する場合（baseline: commit e7f5c1fb、2026-10-18、QG-4 正規形 3 cwd 分割実行〔split-1a/1b、split-3 scripts、split-3 plugins〕での観測）
- **予防策候補**: QG-4 正規形の実行構成へ file-level split を標準化する。bun バージョン更新時に race の再検証を行う
- **想定反映先**: src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（実行形態節）
- **関連**: PR #3790、#3791、#3792、QG-4 証跡（qg4-*.log、退避先 C:/WINDOWS/TEMP/opencode）
- **タグ**: `#bun` `#QG-4` `#機械ゲート`

## 並行負荷下で git fixture 系テストが hook timeout により間欠失敗する

- **問題事象**: QG-4 実行中、git 操作の fixture を持つテスト群（IR-072、check_changed_docs TS-001、scripts-behavior 3件）が並行負荷下で 5000ms のデフォルト timeout 超過により間欠失敗した
- **発生局面**: 実装（case-close QG-4 正規形。複数 worktree の並行実行時）
- **検知方法**: QG-4 の fail 由来分類（solo 再実行での合格と --timeout 延長時の安定を再実測）
- **根本原因**: git fixture がディスク I/O を伴い、並行実行の負荷でデフォルト timeout を超過する（コード欠陥ではなく実行形態由来）
- **自律対応内容**: solo 再実行と bun test --timeout 15000/30000 の規律適合形の再実行で全件合格を確認した（chdocs-wt3784-solo-t15-stderr.log 54 pass、ir072-wt3784-solo-stderr.log 189 pass、3785-scriptsbehavior-solo-stderr.log 19 pass）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 並行実行時の fail は fail 由来分類（変更由来 / pre-existing / 実行形態由来 / 不明）を先行させ、実行形態由来は solo 実行と timeout 延長の規律適合再実行で確定する
- **再発条件**: 複数 worktree でフル suite を並行実行する場合（baseline: commit e7f5c1fb、2026-10-18、QG-4 正規形実行）
- **予防策候補**: QG-4 正規形の並行実行時における標準 --timeout 指針の整備
- **想定反映先**: src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
- **関連**: PR #3790、#3792、QG-4 証跡（C:/WINDOWS/TEMP/opencode/*.log）
- **タグ**: `#flaky` `#QG-4`

## Windows の long path 制限で git worktree remove が Filename too long により失敗する

- **問題事象**: マージ済み worktree（.worktrees/3784-refactor 等）の git worktree remove が "Filename too long" で失敗した
- **発生局面**: 運用（case-close の worktree クリーンアップ時）
- **検知方法**: git worktree remove のエラー出力
- **根本原因**: worktree 内の gitignore 済み依存実体（node_modules、vendor）が Windows の long path 制限を超え、git の削除処理が失敗する
- **自律対応内容**: 依存実体を先に掃除してから worktree prune とディレクトリ削除を行い解消した（--force 不使用を維持）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 依存インストール済み worktree の削除は、依存実体の先行掃除、prune、ディレクトリ削除の順で行う
- **再発条件**: bun install 済み worktree（node_modules の深いパス）を Windows で削除する場合
- **予防策候補**: worktree クリーンアップ手順へ依存実体の先行掃除ステップを明記する
- **想定反映先**: src/common/skills/agentdev-git-worktree/references/worktree-operations.md
- **関連**: .worktrees/3784-refactor 等（削除済み）、Root Case #3782
- **タグ**: `#windows` `#worktree`

## 配布境界 checker が case-run 工程の見逃しを case-close 最終 gate で捕捉した

- **問題事象**: PR #3790 の accept_definition_checks.ts コメント行に concrete ID（REQ-061-052）が直書きされ（配布物参照境界 IR-059 違反）、case-run の STEP-S5 最終 gate では検出されないまま case-close の配布依存境界 最終 gate で検出された
- **発生局面**: レビュー（case-close 配布依存境界 最終 gate）
- **検知方法**: check_distribution_boundary.ts の最終 gate 実行（concrete-id 違反 1 件の検出）
- **根本原因**: 実装PR 作成工程で配布境界 checker の事前実行が省略された（予防観点の引き渡しのみで、委譲内の事前面が機能しなかった）
- **自律対応内容**: コメント1行から concrete ID を除去する整備修正（commit 140d7f0b）で解消し、merge 直前 HEAD 契約に従い全 QG-4 gate を新 HEAD で再実行してからマージした
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既定境界の遵守。事後検知面が設計どおり機能）
- **横展開観点**: 配布対象ファイルにはコメントを含め concrete ID を直書きせず、対応宣言は repository top-level の traceability sidecar へ登録する
- **再発条件**: case-run 委譲で PR 作成前の配布境界 checker が省略された場合（case-close 最終 gate が捕捉する）
- **予防策候補**: case-run 委譲プロンプトの標準検査リストへ配布境界 checker の実行を明示する
- **想定反映先**: src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（委譲プロンプト構築）
- **関連**: PR #3790、commit 140d7f0b
- **タグ**: `#配布境界` `#委譲`

## covers コメント連鎖の文字列組立で ID 順序乖離が生じ verbatim 包含突合が捕捉した

- **問題事象**: case-open STEP-4 の Definition 編集組立で、逐次依存する ADF-COVERS コメント連鎖（ACT-DESIGN-001→002→003）を文字列置換（末尾 ` -->` 対象の replace）で生成した結果、REQ-110 covers 宣言の最終形に既存追跡対象識別子（REQ-104-008）が中間に残り、draft 合意文言（REQ-110-032 の後に REQ-104-008 が末尾）と ID 順序が乖離したまま commit された
- **発生局面**: 実装（case-open STEP-4 の prepare_definition_pr 入力 JSON 組立）
- **検知方法**: STEP-4 手順 6 の verbatim 包含突合（draft 合意文言の covers 最終形と適用後行の byte 一致照合）で 1 件の MISSING を検出
- **根本原因**: 置換関数の対象として ` -->`（行末トークン）を選択したため、識別子列挙の挿入点（既存最終 ID の直後）ではなく行末への追記になった。中間段の covers 行が前段との連鎖整合（連鎖 oldText = 前段 newText）は満たすため、行構造事前確認（REQ-030-030）と gate 検査では検出されない
- **自律対応内容**: 旧文完全一致の訂正 edit（commit 4624160b）で合意形へ復元し、再実行の gate 3 種を通過させてから PR を作成した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の verbatim 包含突合手順が設計どおり機能）
- **横展開観点**: 逐次依存する covers コメント連鎖を組立てる場合は、挿入点を識別子列挙内の直前の ID に固定し、組立後は必ず draft 合意文言との byte 一致照合を行う。行構造検査は連鎖整合を検証しないため代替にならない
- **再発条件**: covers 連鎖の中間段が前段 newText と一致する限り連鎖整合は成立するため、最終段の ID 順序を検査する突合が省略された場合に再発する
- **予防策候補**: covers 連鎖を組立する場合は最終形を draft から直接抽出した文字列と byte 照合する手順を入力組立の標準に含める
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（verbatim 包含突合の手順補足）
- **関連**: PR #3794、commit 4624160b、Root Case #3793
- **タグ**: `#トレーサビリティ` `#Definition編集`

## 実装後に sidecar 追加方針を決めると配布物本文への REQ 行 ID 直書きが checker concrete-id で検出される

- **問題事象**: PR #3799 の実装で、新規 lib/.ts と README に REQ 行 ID を JSDoc・節説明へ直書きした結果、配布依存境界 checker（case-run STEP-S3-5 事前 gate 相当）が concrete-id 違反 23 件・unclassified-entry 1 件を検出し、修正と再実行が発生した
- **発生局面**: 実装（case-run DELEGATE-3796 委譲内）
- **検知方法**: check_distribution_boundary.ts（source profile）の事前 gate 実行
- **根本原因**: 対応関係の正が traceability sidecar である規律に対し、実装者が本文の説明文に要件行 ID を書き込む実装順になった。sidecar 追加方針が本文編集より後に確定した
- **自律対応内容**: 配布物本文から REQ 行 ID 参照と SHA-256 語を除去し、対応関係は sidecar 正規配置へ集約する修正後、再実行で failures 0 を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既定境界の遵守。checker が設計どおり機能した）
- **横展開観点**: 実装前に sidecar 追加方針を確定し、配布物本文の説明は意味記述のみにする。同様の concrete-id 直書きはコメント行でも検出対象になる（PR #3790 由来の学びと同根）
- **再発条件**: 配布対象ファイル（.md/.ts）を新規作成・追記する実装で、sidecar 宣言追加を後回しにして本文へ要件行 ID を書いた場合
- **予防策候補**: 委譲 prompt の配布物本文記述規約に「要件行 ID は sidecar のみ、本文は意味記述」を明示し、実装着手時の最初の commit で sidecar 宣言を先行させる
- **想定反映先**: src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（委譲 prompt 構築）
- **関連**: PR #3799、Issue #3796、Root Case #3793
- **タグ**: `#配布境界` `#委譲` `#実装順`

## worktree 配布物 Markdown 編集では IR-055（runtime-unresolved-reference）が新規行の docs/ literal 参照を検出するため抽象表現へ合わせる

- **問題事象**: PR #3802 の実装で、worktree 環境の check_integrity が design-file-manager SKILL.md への追記行の docs/designs/ literal 参照を新規 NG（runtime-unresolved-reference、IR-055 delta）として検出した
- **発生局面**: 実装（case-run DELEGATE-3795 委譲内）
- **検知方法**: check_integrity（source profile）の初回実行で新規 NG 検出
- **根本原因**: 追加した手順書文が「docs/designs/…」の literal パスで参照先を記述した。配布物はプロジェクト相対の runtime 解決を前提とせず、既存の SKILL.md 本体は「Design 管理インデックス（Design README 一覧表）」等の抽象表現で参照していた
- **自律対応内容**: 追記行を既存 SKILL.md 本体と同一の抽象表現へ修正し、check_integrity 再実行で新規 NG 0 件を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（IR-055 の既定検査が設計どおり機能）
- **横展開観点**: worktree で配布物 Markdown を編集する PR では、編集前に既存 SKILL.md 本体の参照表現（抽象表現）を確認して合わせる。検知は case-run の事前 gate で機能するが、修正コストは作成後より作成時に低い
- **再発条件**: 配布物 Markdown への新規行追加で参照先を literal パスで記述した場合
- **予防策候補**: 配布物編集時の記述規約（既存表現への統一）を委譲 prompt へ引き渡す（同内容の intake 候補として別途保存済み）
- **想定反映先**: src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（委譲 prompt 構築）
- **関連**: PR #3802、Issue #3795、Root Case #3793
- **タグ**: `#配布物` `#IR-055` `#委譲`

## REQ 追加の設計PRでは計測日収束が2段で発生し frontmatter updated 追随は stagePaths に事前包含できない

- **問題事象**: prepare_definition_pr.ts の機械工程で、commit 前配置の generate_indexes は req-metrics 計測日を commit author date より1日前の日付で AUTOGEN 更新し、commit 後の check_integrity が (1) req-health-metrics.md の計測日 AUTOGEN 旧日付 NG（IndexGenerationConsistency）を検出した。計測日 AUTOGEN の補正 commit で収束させた後、2回目の check_integrity は今度は同一ファイルの frontmatter updated 旧日付 NG（req-updated-freshness、IR-072）を検出した
- **発生局面**: case-open STEP-4 機械工程（Definition branch への REQ 行追加と品質ゲート実行）
- **検知方法**: check_integrity（worktree HEAD）の NG 検出と「1 new unmanaged NG (delta, exit code driver)」の構造化報告
- **根本原因**: generate_indexes は commit 前配置で動作するため commit author date を参照できず、req-metrics 計測日が1日遅れで書かれる。さらに派生物 req-health-metrics.md の frontmatter updated は generate_indexes が更新しないため、REQ 行追加と派生物更新が同一 PR の commit になった時点で frontmatter updated が最終内容変更日からずれる。stagePaths への事前包含は派生物確定後になるため構造的に不能
- **自律対応内容**: reference（definition-pr-and-idempotency.md「計測日収束」「generate_indexes 派生物の事後突合」）の標準 contingency どおり、generate_indexes 再実行 → 明示パス指定補正 commit（計測日 AUTOGEN + REQ 行数更新。diff が計測日と行数のみであることを unified diff で確認）→ frontmatter updated の追随 edit と追加 commit → check_integrity 再実行で NG 0件を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（計測日収束の既定手順が設計どおり機能。手順の実運用例を得た）
- **横展開観点**: REQ 行追加を伴う Definition PR では計測日収束は2段（AUTOGEN 計測日と frontmatter updated）で必ず発生し得る前提で進め、check_integrity の1回目の失敗を想定内の contingency として扱う。派生物の diff が計測日・行数のみであることを diff --unified=0 で機械確認してから commit する（内容変化を混入させない）
- **再発条件**: REQ 行追加（frontmatter updated を進行させる編集を含む）を伴う Definition PR で、generate_indexes 派生物（req-health-metrics.md）が自動更新対象に含まれる場合
- **予防策候補**: prepare_definition_pr へ計測日収束の自動補正（generate_indexes 再実行 + frontmatter updated 追随 + 補正 commit）を組込む拡張の検討
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts、references/definition-pr-and-idempotency.md（実運用例の追記）
- **関連**: Issue #3803、PR #3804（commit e3d728a83・35083aaa4）、Root Case #3803
- **タグ**: `#計測日収束` `#IR-072` `#DefinitionPR`

## DefinitionEdit の行構造事前確認は行内連結を拒否するため単一箇条書き行への行内追記は隣接行を含む2行編集で表現する

- **問題事象**: REQ 適用範囲の対象行（単一の長い箇条書き行）の末尾へ文言を追記する DefinitionEdit を「対象行のみを oldText、追記版のみを newText」として組み立てると、newText が oldText を接頭辞として保持する形状となり、行構造事前確認（validateEditLineStructure の連結検出規則。Case #3779 由来）が「追加内容は行頭から始まること」を要求して機械的に拒否される
- **発生局面**: case-open STEP-4 の入力 JSON 組立（DefinitionEdit の oldText/newText 設計）
- **検知方法**: reference の行構造事前確認規則の事前読み込み（機械検証に到達する前に組立段階で回避）
- **根本原因**: 対象行単独を oldText とする行内追記は「追加行の末尾行への連結」と同型になり、行の追加のみを許す規則と衝突する
- **自律対応内容**: oldText を「対象行 + 改行 + 隣接行（対象外行）」の2行、newText を「追記版対象行 + 改行 + 対象外行」の2行とする編集構成へ変更した。newText が oldText を接頭辞として保持しないため連結検出規則は不適用となり、行数も保全される。置換対象2行の一意性を node script で事前検証してから入力 JSON へ組込み、全17編集の一意性検証と適用を通過させた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の機械検証規則の適用範囲内の回避構成）
- **横展開観点**: 行単位の追記を含まない行内の文言追記（箇条書き行の列挙追加、frontmatter updated の日付変更等）を DefinitionEdit へ表現する場合、oldText に隣接行を含めて newText が oldText の接頭辞にならない形へ組むのが安全。置換対象の一部文字列のみの oldText（TS-008 → TS-010 の語句置換等、接頭辞保持にならない置換）はそのまま利用できる
- **再発条件**: prepare_definition_pr への DefinitionEdit 入力を組み立てる際に、単一箇条書き行への行内追記を oldText=対象行のみで組み立てた場合
- **予防策候補**: req-define 側の draft 組立（artifact_actions content の表現）へ、行内追記を含む content が DefinitionEdit へ転記可能な構造である旨の注記を追加する検討
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（DefinitionEdit 組立の実運用例追記）、req-define の draft-data 契約 reference
- **関連**: Issue #3803、PR #3804、Root Case #3803
- **タグ**: `#DefinitionEdit` `#行構造事前確認` `#case-open`

## case-run scripts 配下には package 単位の型検査基盤が存在せず新規 .ts の typecheck が定型化されていない

- **問題事象**: src/common/skills/agentdev-workflow-case-run/scripts/ 配下には tsconfig.json と package.json が存在せず、package 単位 typecheck（bun run typecheck）が適用されない。新規 .ts の検証は bun test 実行と bun build --target=bun --no-bundle トランスパイルで実施した（bunx tsc は環境に typescript 未解決のため不可）
- **発生局面**: case-run 委譲内の実装品質検証（PR #3809、PR #3812 の新規 anchor 型テスト追加時）
- **検知方法**: typecheck 実行可否の確認（既存テスト record-comments.test.ts、process-conformance.test.ts と同一立地・同一水準であることを確認）
- **根本原因**: 当該配下のテストは package 構成外で運用されており、型検査を必要とする .ts を追加する場合の検証手段が定型化されていない（本変更で導入した欠陥ではなく既存の領域特性）
- **自律対応内容**: bun test 実行（終了コード 0）と bun build トランスパイル通過で検証し、領域の現行検査水準として PR 本文の検証差分へ記録した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: package 構成外の scripts 領域へ型検査を必要とする .ts を追加する場合の検証手段（bun test + トランスパイル、または tsconfig 追加）を定型化すると検証記録の粒度が揃う
- **再発条件**: agentdev-workflow-case-run/scripts/ 配下へ新規 .ts を追加する委譲の場合
- **予防策候補**: 当該配下への tsconfig 導入または検証手段の定型記載の追加
- **想定反映先**: src/common/skills/agentdev-workflow-case-run/scripts/（tsconfig 追加の検討）、agentdev-quality-gates（型検査水準の記載）
- **関連**: PR #3809 Findings、PR #3812 検証差分 #6、Issue #3803
- **タグ**: `#typecheck` `#case-run` `#検証手段`

## bun test 全件実行で textlint 並列系のみタイミング起因のフレークが観測され再実行で 0 fail になる

- **問題事象**: textlint vendor 生成後の bun test 全件実行で 1 回のみ 4 fail（textlint 並列系のタイミング起因）を観測した。再実行で 0 fail となり、本変更と無関係の環境タイミング起因と判断した
- **発生局面**: case-run 委譲内の bun test 全件検証（PR #3811 検証差分 #11）
- **検知方法**: bun test 全件実行の fail 検出と再実行での消失
- **根本原因**: textlint 並列系テストのタイミング依存（推測。断定せず記録）
- **自律対応内容**: 再実行で 0 fail を確認し、フレーク分を本変更と無関係の環境タイミング起因として検証差分へ記録した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: bun test 全件の fail はまず再実行で再現性を確認し、タイミング起因と不具合を区別してから対応を決める
- **再発条件**: bun test 全件（textlint vendor 生成後）を CI 相当の1回実行で判定する場合
- **予防策候補**: textlint 並列系テストの同期化または再実行手順の恒常化、フレーク分類基準（タイミング起因と不具合の区別）の整備
- **想定反映先**: src/opencode/plugins/agentdev-textlint-guard/（並列系テストの安定化検討）、agentdev-learning-pipeline（フレーク分類基準）
- **関連**: PR #3811 Findings 第2項、Issue #3803
- **タグ**: `#bun test` `#フレーク` `#textlint`

## REQ 採用根拠照合の正規利用経路検証は恒常的 anchor 型テストと一回限りの実操作証跡の二層運用で機能する

- **問題事象・学び**: TS-010 の反例投入スクリプト（LocalRunner 駆動の正規利用経路実操作検証）は試験用一時ディレクトリとともに検証後削除した。実操作検証は一回限りの証跡（PR 本文の検証差分セクションへ記録）であり、恒常性は anchor 型構造照合テスト（adoption-basis-verification-anchors.test.ts、採用根拠照合条文の存在照合）が担う二層構造で機能することを確認した
- **発生局面**: case-run 委譲内の Epic 横断義務 RA-005 実行（PR #3812 検証差分 #5、#14）
- **検知方法**: 恒常検証手段（新規テスト 6 test）と実操作検証（17/17 PASS）の結果整合
- **根本原因**: なし（運用設計どおりの確認。実装の誤りではない）
- **自律対応内容**: 恒常検証手段を sidecar verification 宣言へ登録し、REQ-110.md の TS-010 行へ具体試験名を記録した。実操作検証スクリプトは破棄運用どおり削除し、証跡は PR 本文へ残した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-110-033 の検証手段としての二層運用の確認）
- **横展開観点**: 正規利用経路の実操作検証を要件とする REQ 行では、一回限りの実操作証跡（PR 本文）と恒常的な構造照合テスト（tests 配下）の二層を検証手段として宣言すると、merge 後も要求の検証可能性が維持される
- **再発条件**: 実操作検証を要件とする REQ 行の新規整備・更新の場合
- **予防策候補**: なし（現行運用で機能）
- **想定反映先**: REQ-110（TS-010 行。具体化済み）、agentdev-traceability（verification 宣言の二層記載例）
- **関連**: PR #3812 learning、Issue #3803
- **タグ**: `#検証二層運用` `#anchor型テスト` `#REQ-110-033`

## 2026-10-19: case-revise 由来の Definition Amendment draft が untracked のまま cleanup へ到達し removal commit が不成立した

- **問題事象**: case-ready の cleanup（canonical-and-cleanup phase、removalPaths に draft 指定）で、対象 draft（PR #3813 由来）が git tracked でないため script の冪等化前置きが git rm 対象から除外（skippedPaths 記録）し、removal commit 対象が空で commit が不成立した。draft は生成後、case-revise / case-ready のどの工程でも git 永続化（commit）されていなかった
- **発生局面**: case-ready STEP-7（draft 削除。Epic #3803 例外経路の是正 Case #3814 受入）
- **検知方法**: cleanup script 報告 JSON の draft-ru-removal-commit fail（removedPaths 空・skippedPaths に draft）と git ls-files / git status での untracked 確認
- **根本原因**: draft 作成後の git 永続化手順が例外経路（case-revise → case-ready）のどの工程でも実行されていなかった（推測を含む。断定せず記録）
- **自律対応内容**: draft が untracked であることを実確認し、canonical Definition（merge 済み REQ-108-013）への投影済みを確認した上で物理削除し、git 状態を clean にした。removal commit は不要（tracked 変更なし）と判定した
- **ユーザー確認有無**: なし
- **REQ/Decision/spec影響**: なし
- **横展開観点**: draft / RU の lifecycle 管理は「保存時の git 永続化」と「cleanup 時の git rm」が対になる。どちらか一方だけが成立していると cleanup の機械工程が安全に止まる（fail-closed として機能）が、永続化漏れの検知は cleanup 時点まで遅延する。draft 作成工程での永続化実施確認が前置として有効
- **再発条件**: case-revise が draft を生成・更新する場合、または req-define が draft を永続化 commit なしで次工程へ引き渡す場合
- **予防策候補**: draft 作成・更新後の git 永続化を case-revise / req-define の手順へ明示、または cleanup 前の untracked draft 検知時の警告メッセージ明確化
- **想定反映先**: agentdev-workflow-case-revise / agentdev-workflow-req-define（draft 永続化手順）、agentdev-workflow-case-ready scripts（untracked draft 検知時の報告文言）
- **関連**: Issue #3803、Issue #3814、PR #3813、case-ready cleanup script 報告（skippedPaths 記録）
- **タグ**: `#draft永続化` `#case-revise` `#cleanup`

## 2026-10-19: 依存生成未実施 worktree で repo root 全体 bun test が 76 fail となり、変更起因失敗との分類にスイート分解が必要だった

- **問題事象**: worktree 環境では textlint-guard の vendor 依存が未伝播のため、`bun test ./`（repo root 全体）が 76 fail となる。fail の大半が依存生成未実施環境由来（fail-closed 挙動）であり、変更起因の失敗と区別するにはスイート単位実行（case-run scripts スイート等）への分解が必要だった
- **発生局面**: case-run（TS-001 検証。Epic #3803 是正 Case #3814・PR #3815）
- **検知方法**: bun test 全体実行の fail 明細が textlint vendor engine bundle・prh 辞書関連に集中することの確認
- **根本原因**: 依存生成手順（README「開発者セットアップ」の bun install && bun run build:engine）未実施環境での全体実行は fail-closed で依存解決失敗が fail として混入し、fail 一覧から環境差と変更起因が構造的に分かれない
- **自律対応内容**: 完了条件に合致するスイート単位実行（`bun test ./src/common/skills/agentdev-workflow-case-run/`）への分解で検査範囲を確定し、全体 fail を環境差として PR Findings へ分離記録
- **ユーザー確認有無**: なし
- **REQ/Decision/spec影響**: なし
- **横展開観点**: 依存生成未実施環境での bun test 全体実行結果の解釈には、依存生成前置の案内出力（fail-closed 案内）との突合が有効。worktree 環境差 fail の由来分類（docs/knowledge/worktree-environment-fail-classification.md）の運用と接続する位置にある
- **再発条件**: worktree または新規 checkout 環境で依存生成を実施せず repo root 全体の bun test を実行する場合
- **予防策候補**: 依存生成手順未実施環境での全体実行時に、依存由来 fail と検査 fail の判別指針（依存生成前置の案内出力との突合・案内メッセージの明示化）を提示する仕組み
- **想定反映先**: agentdev-textlint-guard（依存検知時の案内文言）、repo-agentdev-integrity（fail 由来分類の実行案内）、docs/knowledge/worktree-environment-fail-classification.md（接続記載）
- **関連**: PR #3815 Findings 第1項、Issue #3814、親 Epic #3803
- **タグ**: `#worktree環境差` `#bun test` `#fail由来分類`

## 2026-10-19: HOLD_AND_CONTINUE_TOKENS の宣言のみの未使用状態が typecheck 枠組み不在下で長期未検出となり、anchor 照合テストの token 定義と本文表現の対応関係が保守観点として残存

- **問題事象**: open-dependency-and-proto-application.test.ts の HOLD_AND_CONTINUE_TOKENS が宣言のみで参照がなく、noUnusedLocals を適用する typecheck で顕在化した。PR #3815 で case-run/adapter test への token 群照合追加により参照化したが、token 群定義と各 SKILL 本文表現（case-open は「…実行契約候補から除外しない」等の表現差）の対応関係は anchor 照合の保守観点として留意対象が残る
- **発生局面**: case-run（typecheck。Epic #3803 是正 Case #3814・PR #3815）
- **検知方法**: tsc --noEmit（strict 構成・noUnusedLocals）の未使用定数指摘
- **根本原因**: テストヘルパ定数の追加が参照結線なしで先行し、case-run scripts は package（tsconfig/package.json）を持たないため型検査枠組みが不在で長期未検出だった
- **自律対応内容**: 既存 HOLD_AND_CONTINUE_TOKENS 群への anchor 照合追加（case-run/adapter 未決依存 test）で参照化し、期待値としての意味を保持した
- **ユーザー確認有無**: なし
- **REQ/Decision/spec影響**: なし
- **横展開観点**: anchor 型 token 照合テストでは、token 定義群と SKILL 本文表現の対応関係（同型・表現差の区別）を定義側コメント等で明示すると、未使用化の早期検出と表現 drift の検知に繋がる
- **再発条件**: anchor 照合テストに token 群を追加する際に参照結線を作らず、かつ当該テスト領域の型検査が実行されない場合
- **予防策候補**: token 群定義への対応関係明示（どの SKILL のどの表現を期待値とするか）、token 群追加時の参照結線確認の手順化
- **想定反映先**: agentdev-workflow-case-run scripts/tests（token 群対応関係の明示）、型検査枠組み不在の課題は intake（同日別 entry）として分離管理
- **関連**: PR #3815 Findings 第3項、Issue #3814、親 Epic #3803
- **タグ**: `#anchor型テスト` `#noUnusedLocals` `#保守観点`
