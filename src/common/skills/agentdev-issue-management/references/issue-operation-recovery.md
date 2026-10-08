# Issue 操作の起動環境障害

本書は `issue-operation-safety.md` の手順を補い、起動環境障害の診断、回復、作業再開を扱う。

## 起動環境障害（全操作対象）

`agentdev_gh` の起動環境障害（`AGENTDEV_GH_REPO` 未設定、harness 内 spawnSync 失敗による起動不能）は、issue_list 等の特定操作に限定されず、全操作に及ぶ。本節は全操作を対象とする既知事象の診断・回復・作業再開の手順である。特定操作だけが失敗する場合は本節ではなく各操作の規律（issue_list の絞り込み規律等）を確認する。

### 事象

| 事象 | 失敗分類 | failure detail の要点 |
|---|---|---|
| `AGENTDEV_GH_REPO` 未設定かつ `gh repo view` による解決に失敗 | config-uninterpretable | 試行した解決手段（環境変数設定状態の要点）、`gh repo view` の終了コード、stderr の要因 |
| harness 内 spawnSync 失敗による gh 起動不能 | enforcement-crashed | 起動失敗の旨と spawnSync エラー種別（ENOENT 等） |
| gh が非ゼロ終了コードで終了（stderr 空・非空を問わない） | operation-failed | gh 終了コードと stderr の空・非空。stderr 空の非ゼロ終了は環境起因の可能性を示唆する |

起動環境障害の失敗は全操作で同一の失敗分類になる。読み取り操作も書き込み操作も同じ失敗に分類されるため、失敗分類から操作種別を推定しない。

### 診断手順

1. failure detail を読み、次の要点を確認する。
  - 環境変数設定状態（`AGENTDEV_GH_REPO environment variable (not set)`、`set but invalid format` 等）
  - gh の終了コード
  - stderr の空・非空
  - spawnSync エラー種別（起動不能時に出力される）
2. `gh auth status` で gh CLI の認証状態を確認する。未認証の場合は `gh auth login` で認証する。`gh auth login` は gh CLI の API 認証を設定する対話的な案内であり、実行環境側で人間が行う操作に位置づける。一方、Git 操作（push を含むドメイン状態永続化）の認証は非対話経路で設定済みであることを前提とし、その設定手順と認証方式の選定規律は実行環境側が正規所有する（AGENTS.md「ハーネス選定」の非対話認証参照行と実行環境知識文書 `docs/knowledge/git-noninteractive-auth.md`）。Git 操作の認証失敗・対話要求・タイムアウトの検出と報告は `agentdev-git-worktree` の domain state 永続化プロシージャ（`references/git-common-procedures.md`「2. ドメイン状態永続化」の push 失敗時の認証起因分類）に従う。資格情報の値を解析証拠やログへ出力しない。
3. `gh repo view --json nameWithOwner` を手動実行し、gh CLI 単体でのリポジトリ解決可否を切り分ける。

### 回復手段（harness 再起動）

- `AGENTDEV_GH_REPO` の設定追加・変更後は、harness を再起動して起動環境（環境変数、PATH）を再読込する。再起動後に同一操作を再実行し、構造化応答（`ok: true`）が返ることを確認する。
- harness 内 spawnSync 失敗（spawnSync エラー種別付きの失敗）が継続する場合も、harness 再起動で起動環境を再読込してから再試行する。harness 再起動手段の実装は harness 責務であり、本手順は再起動の契機と再試行の確認のみを扱う。

### 障害中断時の再開手順

起動環境障害により workflow が blocked に遷移した場合、回復後の作業再開は次の順で行う。

1. 診断手順と回復手段で起動環境を回復し、軽量な読み取り操作（issue_read 等）で疎通を確認する。
2. 中断した副作用操作を冪等再実行する前に、残骸の有無を確認する。
  - issue_create、issue_update、comment_create 等が中断された疑いがある場合は、対象を issue_read または issue_list（search 併用）で確認し、既に反映済みの対象を二重に作成・更新しない。
  - pr_create が中断された疑いがある場合は、同一 head ブランチの PR の有無を確認し、残骸 PR があればそれを正として扱う。残骸 PR が作成目的に合わない場合は、削除判断を含めて処置を確定してから作り直す。
3. 残骸確認の結果を検証記録へ残し、再実行の対象範囲を確定してから中断した workflow を再開する。残骸不在を確認した場合は、その確認結果を根拠に中断した操作から再実行する。

### 劣化サイクルの定量観測と縮退運用パターン

起動環境障害には、回復手段の適用で一度解消しても、その後の gh 呼出の中で再発する劣化サイクルがある。縮退運用への移行可否と恒久対処の要否の判断根拠とするため、次の観点を定量観測として検証記録へ残す。

- **再発までの呼出数**: 回復手段の適用（harness 再起動等）後、起動環境障害が再発するまでの gh 呼出回数を記録する
- **再発局面**: 再発した局面（spawnSync 起動〔ENOENT 等の起動不能〕、gh 実行〔非ゼロ終了コード〕、gh 内 API 応答等）と失敗分類（enforcement-crashed、operation-failed 等）を記録する

劣化サイクルの継続により時間窓が枯渇する場合は、回復手段の反復を続けず、次の縮退運用パターンへ移行する。時間窓の枯渇は、再発までの呼出数の短縮により、同一作業を回復手段の反復で完了できる見込みが失われた状態を指す。

- **委譲前疎通確認**: 実行担当サブエージェントへの委譲の前に、軽量な読み取り操作（issue_read 1 件等）で gh 呼出経路の疎通を確認してから再試行する。委譲内で初めて障害を検知する構成を避ける
- **最小副作用単位分割と durable state 先行**: gh 呼出を伴う処理は副作用 1 件単位へ分割し、各呼出の前に durable state（Issue コメントへの経過記録、worktree 内の commit 等）を先行して残す。障害で中断されても「障害中断時の再開手順」の残骸確認と冪等再実行で再開できる
- **write-proxy payload の標準配置**: issue_create、issue_update、comment_create、pr_create 等の書込み payload（本文・タイトル）は、呼出に先立って標準配置（worktree root 相対 `.agentdev/tmp/` 配下の payload ファイル）へ保存する。書込み操作が障害で中断された場合も、payload ファイルを送信元として同一内容の再試行（「障害中断時の再開手順」の残骸確認後再実行）が可能になる
- **gh exit 66 恒常失敗時の bash gh 例外手順**: gh が終了コード 66（gh exit 66）で恒常的に失敗し、再試行と回復手段で解消しない場合は、読み取り系操作に限り bash から gh CLI を直接実行する例外手順で補完する。書込み系は引き続き Custom Tool `agentdev_gh` 正規経路に限定する。証跡様式は次のとおりで検証記録へ残す: 失敗した操作と failure detail の要点（終了コード、stderr の空・非空）、代替実行した gh コマンド、取得結果の要約

## 観測 known-issues（運用時発見事象の蓄積）

本節は issue 操作の運用中に観測された既知事象を蓄積する。起動環境障害の known-issues 節とは対象が異なり、`agentdev_gh` の検索・操作結果に関する観測を記録する。

| 観測事象 | 対処 |
|---|---|
| Case #3175: search index の遅延により、実在する Issue が search で 0 件帰着した | 検索結果 0 件だけで不在と判断せず、「search 0 件帰着の二重確認と population 実測」節に従って直接参照で確認する。index 反映待ちの sleep・ポーリングは行わない |
