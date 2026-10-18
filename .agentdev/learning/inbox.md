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
