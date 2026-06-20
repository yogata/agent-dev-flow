# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 2026-06-18: case-open cleanup で git add -A を使用すると意図しないファイル削除が混入するリスク

**状況**: case-open の後段処理（draft/RU削除）で `git add -A` を使用したところ、過去のcase-auto実行で作業ディレクトリから物理削除されていた他のtracked draftファイルの削除も同時にstagingしてしまった。対象外のdraft 2件が誤削除され、復元commitが必要になった。

**学び**: cleanup処理で `git add -A` を使う前に `git status` で意図しない変更・削除がないか必ず確認すること。または、削除対象ファイルのパスを明示的に `git rm` / `git add` で指定し、`git add -A` を避けること。

**再発防止**: case-open/case-close のcleanup stepでは、削除対象ファイルを明示的に指定して staging する。

## 2026-06-18: REQ ID は4桁、IR ID は3桁 — パーサ実装で桁数を取り違える落とし穴

**状況**: Issue #898 の catalog/impact-map パーサ実装で、REQ ID の正規表現を `/^REQ-\d{3}$/` と書いてしまった（3桁）。実際の REQ ID は4桁（REQ-0101 等）であり、テストで REQ ID が一切マッチしない不具合が発生した。IR ID は3桁（IR-001 等）であるため、両者を混同しやすい。

**学び**: AgentDevFlow の ID 体系では「REQ は4桁（REQ-NNNN）、IR は3桁（IR-NNN）」と桁数が異なる。パーサやバリデータを実装する際は、ID 種別ごとの桁数を明示的に確認し、正規表現の桁数を取り違えないこと。

**再発防止**: ID の正規表現を書く際は、対象 ID の実際のサンプル（REQ-0101, IR-001 等）をコメントに併記し、桁数を誤らないようにする。テストでは必ず実データ（catalog や impact-map からの実 ID）を使用して検証する。

## 2026-06-18: gate hook の strict/heuristic 区別は --strict-only flag で解決する（global exit code 変更禁止）

**状況**: Issue #899 の Delta Guard / Impact Guard 実装で、`check_integrity.ts` の exit code が strict 違反（block）と heuristic 違反（warning）を区別できない問題に直面した。`determineExitCode()` は ng と warning の両方で EXIT_NG(1) を返すため、heuristic 違反でも commit/push が block されてしまう。global な `determineExitCode()` の挙動を変更すると full-audit mode の既存テストが壊れるリスクがあった。

**学び**: gate hook で strict/heuristic を区別する必要がある場合、global exit code semantics を変更せず、`--strict-only` flag を追加して `determineExitCodeStrict()` を実装すること。これにより既存の full-audit 呼び出しは影響を受けず、gate hook のみが strict-only モードで動作する。併せて `classifyResult()` が `finding_level` を未設定のまま残す既存不具合も root-cause fix した（`--strict-only` の前提となるため）。

**再発防止**: exit code の strict/heuristic 区別が必要な場面では、呼び出し元が flag で挙動を切り替えられるようにする。global な関数の挙動を変更すると影響範囲が予測不能なため、flag-based の opt-in アプローチを優先する。

## 2026-06-18: Windows+junction worktree では .opencode/ が空になり source/projection 手動同期が必要 — driver 引き継ぎに明記

**状況**: Issue #900 (RU-3) の driver 委譲で、git worktree（`.worktrees/{N}-*`）内の `.opencode/commands/agentdev/`・`.opencode/skills/agentdev-*/` が junction 未伝播で空ディレクトリになった。本 repo では `.opencode/agentdev-*` が `.gitignore` で track 対象外のため worktree 作成時に内容が伝播せず、同期スクリプトに頼ると worktree 内で source-projection 系整合性検査が失敗する。

**学び**: Windows+junction 環境の worktree では plugin skill/command の projection 側が空になる。source（`src/opencode/**`）と projection（`.opencode/**`）の両辺を手動編集で同期し、同期スクリプトではなく手動コピーで担保する。この制約自体は `agentdev-workflow-orchestration` SKILL に既記載だが、driver subagent への引き継ぎプロンプトに毎回明記する必要がある。

**再発防止**: case-run から driver subagent を起動する際、プロンプトの CONTEXT に「worktree 内 `.opencode/` は空・source/projection は手動両辺編集・同期スクリプト非依存」を必ず明記する。提出フェーズのローカル検証で source-projection 系整合性検査を含む場合は worktree 内で失敗することを前提に扱う。

## 2026-06-18: REQ に command の Step 番号を固定すると drift する — 振る舞いで書き command reference 参照に

**状況**: Issue #903 (RU-5) の IR-044 クリーンアップで、REQ-0131-010 が「`case-close` Step 8 乖離検出において…」と記載していたが、現行 `case-close.md` では乖離検出（docs/検証）は Step 3 に該当し、REQ の Step 番号が実装と drift していた。REQ-0104-047 / REQ-0114-060/063 / REQ-0136-010 でも同様に command の Step 番号が REQ に固定されていた。IR-044 はこれらを SPEC 詳細（Step 番号）混入として検出した。

**学び**: REQ 要件行に特定 command の Step 番号を書くと、command のリファクタ（Step 番号変更）で即座に REQ が陳腐化する。REQ には振る舞い（何をするか・なぜ）を書き、具体的ステップ番号は command reference（`.md`）側にのみ保持し、REQ からは「対象ステップの詳細は command reference 参照」と抽象化する。これが REQ/SPEC 責務分離（REQ-0101-068）の Step 番号項目の実践的意味でもある。

**再発防止**: REQ を新規作成・更新する際、要件行に command の Step 番号を直接書かない。振る舞いで記述し、ステップ詳細は command reference へ委ねる。IR-044 が Step 番号混入を検出したら移行（番号除去 + 振る舞い残留）で是正する。

## 2026-06-19: gh CLI の --body-file が Windows Shift-JIS コンソール環境で文字化け — コンソール UTF-8 初期化で解消

**状況**: case-auto 自走中（Issue #932 / PR #933）に gh CLI の `--body-file` で Issue 本文を作成した際、本文が文字化けした。原因調査: 一時ファイルは正しく UTF-8 (BOM なし) で書かれていた（最初のバイト `23 23 20 E8 AA AC E6 98 8E 0A` = `## 説明\n`）。一方、PowerShell のコンソール出力エンコーディングが shift_jis（chcp 932）だった。gh CLI が PowerShell の Shift-JIS 環境下でファイル読み込み・引数渡し時にエンコーディング変換を起こし、GitHub 上の本文が文字化けした。READ 操作（Node.js execSync）では再発せず（パイプラインをバイパスするため）、WRITE 操作（--body-file / --title）でのみ発生。

**学び**: agentdev-gh-cli skill は「OpenCode の Write tool も使用可能（BOMなしUTF-8で書き出す）」としているが、コンソールエンコーディングが Shift-JIS の場合、それだけでは文字化けを防げない。gh CLI の呼び出し前に `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` + `cmd /c chcp 65001` でコンソールを UTF-8 に設定する必要がある。これは agentdev-gh-cli skill の Section 2（標準手順）に明記すべき初期化ステップ（現在は Section 1 禁止事項・Section 2 標準手順にコンソールエンコーディング初期化が明記されていない）。

**再発防止**: gh CLI を PowerShell から呼ぶ際（特に --body-file / --title で日本語を含む場合）、必ず以下を先に実行する:
```
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
cmd /c chcp 65001 | Out-Null
```
agentdev-gh-cli skill の Section 2（標準手順）にこのコンソールエンコーディング初期化ステップを追記すべき（intake 経由で RU 化 → req-define → req-save を推奨・本件は case-run worktree precondition gate とは別件）。

## 2026-06-20: req-define で指定した ADR 番号が adr-file-manager 採番ルールと矛盾 — req-save で max+1 に修正

**状況**: case-auto 並列Wave実行モデル（Epic #944）の req-save で、draft の artifact_actions に ADR-0115 と指定されていた。しかし adr-file-manager skill の採番ルールは「欠番の再利用禁止（常に最大番号+1）」であり、ADR-0115 は ADR-0114 と ADR-0123 の間の欠番だった。最大番号は ADR-0124 のため、正しい番号は ADR-0125 となる。req-save 実行時に ADR-0125 に修正したが、draft 内の全参照（AG-006, AG-007, REQ改訂内容, SPEC改訂内容）で ADR-0115 → ADR-0125 の置換が必要だった。

**学び**: req-define で ADR 番号を推測指定する場合、adr-file-manager の採番ルール（max+1, 欠番埋め禁止）と矛盾する可能性がある。req-save は ADR 番号の妥当性を保存前に検証し、必要に応じて正しい番号に修正すべき。draft の target フィールド（`new:{slug}`）は番号を指定しない形式のため、req-save が番号を決定する設計が安全。

**再発防止**: req-define の artifact_actions で ADR 番号を content タイトルに直接書き込む場合、req-save が adr-file-manager 採番ルールで番号を再検証し、矛盾時に自動修正する。または、draft では番号を未指定（`new:{slug}` のみ）とし、req-save が番号を割り当てる。

## 2026-06-20: 実行担当サブエージェントの worktree が古い commit 基準だと PR conflict — origin/main fetch 必須

**状況**: case-auto Wave 2（Issue #947 / PR #950）で、実行担当サブエージェントが worktree を作成した際、Wave 1 の PR merge 前の commit を基準にしていた。Wave 1 merge 後に main が更新されたため、PR #950 が DIRTY/CONFLICTING になった。worktree を削除し、origin/main から再作成して force-push で解消した。

**学び**: case-run の worktree 作成（Step 4）は `origin/main` をベースとするが、Wave 内並列実行の場合、前 Wave の merge によって origin/main が更新されている可能性がある。worktree 作成前に `git fetch origin` を実行し、最新の origin/main から worktree を作成する必要がある。サブエージェントへの引き継ぎでも worktree の鮮度（base commit が最新か）を確認すべき。

**再発防止**: case-run Step 4 の worktree 作成時に `git fetch origin` を必ず実行する。並列 Wave 実行の場合、前 Wave 完了後に次 Wave の worktree を作成するタイミングで origin/main が更新されていることを前提とする。draft の Oracle 推定事項「Wave-2 の case-run が Wave-1 merge 後の origin/main から worktree を新規作成すること」の実装確認を case-run precondition gate に含めることを検討する。

## 2026-06-20: case-run で oh-my-openagent の存在確認をして停止した — 検出不要・bunx で直接起動

**状況**: case-auto（Issue #953）の case-run フェーズで、oh-my-openagent がインストールされているか確認しようとして `Get-Command oh-my-openagent` を実行し、NOT_FOUND となったため case-run をエラー停止した。実際には oh-my-openagent は opencode に統合済みであり、bunx 経由で常に起動可能だった。

**学び**: oh-my-openagent は opencode 統合済み。bunx oh-my-openagent run で常に起動可能。事前検出・存在確認は不要。adapter protocol（agentdev-case-run-execution-adapter）の記載通り、AGENTS.md で指定されたハーネスを前提として bunx で直接起動する。

**再発防止**: case-run Step 5 で oh-my-openagent の存在確認を行わない。AGENTS.md のハーネス選定記述を信頼し、bunx oh-my-openagent run --directory worktree で直接起動する。adapter protocol に「ハーネス不在時は case-run がエラー停止する（フォールバック経路なし）」とあるが、これは bunx 実行時のエラーを指すものであり、事前検出の必要を意味しない。

## 2026-06-20: bunx oh-my-opencode run が Windows でモジュール解決エラー — npx をフォールバックとして使用

**状況**: case-auto（Issue #955）の case-run フェーズで、`bunx oh-my-opencode run` を実行したところ `Cannot find module '...oh-my-openagent\bin\oh-my-opencode.js'` エラーが発生した。bunx がバイナリ解決でグローバルインストールディレクトリの bin パスを期待するが、Windows 版 oh-my-openagent のパッケージ構造（oh-my-openagent-windows-x64 等）と不一致だった。`npx oh-my-opencode run` では正常に動作した（npm がパッケージ解決を適切に行うため）。

**学び**: Windows 環境で bunx 経由の oh-my-opencode run がモジュール解決エラーを起こす場合がある。oh-my-openagent.md リファレンスの起動スクリプト例は `bunx` を前提としているが、bunx の解決が壊れている場合は `npx oh-my-opencode run` をフォールバックとして使用できる。パッケージ名は `oh-my-opencode`（npm）/ `oh-my-openagent`（bun global）で、バイナリ名は `oh-my-opencode`。

**再発防止**: case-run で bunx oh-my-opencode run がモジュール解決エラーで失敗した場合、npx oh-my-opencode run にフォールバックする。oh-my-openagent.md リファレンスの起動スクリプト例に npx フォールバック経路を追記すべき（intake 経由で RU 化候補）。

## 2026-06-20: oh-my-opencode ハーネスは最終検証フェーズでタイムアウト — 完了後も残留確認が必要

**状況**: case-auto（Issue #955）で oh-my-opencode ハーネスに30分タイムアウトを設定したところ、実装自体は完了（48ファイル変更）していたが、最終検証フェーズ（grep残留確認）の途中でタイムアウトした。ハーネスが作成した変更はコミット前にタイムアウトしたため、手動でコミット・PR作成を行う必要があった。また、ハーネスが「セルフホスティング」2件を見落としており、手動修正が必要だった。

**学び**: oh-my-opencode ハーネスの実装能力は高い（48ファイルの適用を完了）が、最終検証フェーズで時間を要する場合がある。タイムアウト後は worktree 内の未コミット変更を確認し、残留箇所を手動修正してからコミット・PR作成する。ハーネスの全件走査でも少数の見落としが発生するため、case-run 側での最終確認が重要。

**再発防止**: case-run でハーネスがタイムアウトした場合、worktree の git status で未コミット変更を確認し、対象語の grep で残留を検出して手動修正する。タイムアウト＝failed ではなく、実装完了・検証未完了として扱い、case-run 側で検証を引き継ぐ。

