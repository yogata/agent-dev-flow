# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## git pull と git fetch --prune の並列実行による ref lock 競合

- **問題事象**: 19 PR の squash merge 後、ローカル main を同期するため `git pull --ff-only origin main` と `git fetch --prune origin` を並列呼び出ししたところ、両者が `refs/remotes/origin/main` の更新で競合し pull が「Cannot fast-forward to multiple branches」、fetch --prune が「cannot lock ref ... is at c755b3e8 but expected adb06a30」で失敗した。merge 結果自体は成功していたが、ローカル同期が 1 回で完了しなかった。
- **発生局面**: case-close Step 9（実行前同期、git pull --ff-only）と Step 7（ブランチ削除確認、fetch --prune）を並列実行した際。
- **検知方法**: コマンドの終了コードと stderr の ref lock エラー。
- **根本原因**: 同一リモート追跡 ref（`refs/remotes/origin/main`）に対して fetch 系操作を並列実行すると、Git が ref の期待値 hash を検証する時点で他方の更新が既に反映済みとなり lock 衝突する。Git の ref lock は並列安全を保証しない。
- **自律対応内容**: 直後に `git fetch origin` で ref を再取得し、その後 `git pull --ff-only origin main` を再実行して fast-forward を完了させた（2 回目で成功、`Updating adb06a30..c755b3e8`）。
- **ユーザー確認有無**: なし。
- **ADR/REQ/spec影響**: なし（運用上の一時事象）。ただし case-close.md Step 9 は `git pull --ff-only` を必須実行としているため、Step 7 と Step 9 を並列で呼ぶ設計の場合は本件の再発余地がある。
- **横展開観点**: case-close Step 7（fetch --prune 系）と Step 9（pull --ff-only 系）は直列実行が安全。Epic Wave クローズ等でブランチ削除と main 同期を連続実行する場面でも同様。
- **再発条件**: 同一リモートの ref を更新する git コマンドを並列実行した時。特に squash merge 直後など origin/main が更新されている場面で、pull と fetch --prune を同時に呼ぶと高確率で再発。
- **予防策候補**: pull 系と fetch --prune 系を単一スクリプト内で直列化する。または pull 後に fetch --prune を実行する順序固定。`git pull --prune --ff-only` のように単一コマンドへ統合する手段も検討。
- **想定反映先**: `agentdev-git-worktree` skill の references/git-common-procedures.md（pull/push/hash 検証の共通手順）。必要であれば case-close.md Step 7 と Step 9 の順序依存に関する注意書き。
- **関連**: case-close Issue #1250〜#1268（19 PR 一括マージ）、PR #1280（case-close.md Step 4 --delete-branch ガードレール追加）。実行日時 2026-06-27 02:00-02:03 UTC。
- **タグ**: `#git` `#case-close` `#workaround` `#reflock`

## 学び: case-close Epic Wave クローズ時の GitHub mergeable UNKNOWN ポーリング待機

- **問題事象**: case-close Epic Wave クローズで複数PRを順次 squash merge する際、各PRマージ直後に後続PRの GitHub mergeable が UNKNOWN になり、再計算に 10〜20秒を要した。UNKNOWN 状態でマージ試行すると失敗する。
- **発生局面**: case-close（Step E4: PRマージ）
- **検知方法**: gh pr view N --json mergeable,mergeStateStatus でポーリングし、MERGEABLE/CLEAN になるまで Start-Sleep で待機。
- **根本原因**: GitHub が PR マージ後にバックグラウンドで mergeable を再計算する仕様。計算時間は即時ではなく、リポジトリの活性度や差分サイズに依存。
- **自律対応内容**: case-close Step 4 の「5秒待機×5回リトライ」を実行する前に、gh pr view で mergeable 状態をポーリング確認し、UNKNOWN の間は Start-Sleep 10〜20秒で待機してからマージ試行する運用で回避した。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（case-close Step 4 の運用解釈の範囲。要件化は learning-promote で判断）
- **横展開観点**: case-auto の Wave 反復制御、CI 対応ループ等の自動マージ処理全般で同様の事象が発生する可能性。自動化されるほどポーリング待機の組込みが重要。
- **再発条件**: GitHub で連続 squash merge を実行する全ケース。特に同一ファイルを変更するPRが連続する場合、mergeable 再計算が必須（conflict 可能性の再評価のため）。
- **予防策候補**: case-close Step 4 に「mergeable UNKNOWN 時のポーリング待機（最大60秒、10秒間隔）」手順を明記。または case-auto の自動マージロジックにポーリングを組込み。
- **想定反映先**: commands/agentdev/case-close.md Step 4、agentdev-workflow-orchestration（CI対応ループ等の自動マージ記述がある場合）
- **関連**: Epic #1288 Wave 1 クローズ（PR #1295-#1300）、case-close.md Step 4「Squash merge失敗時の自動リトライ」
- **タグ**: #case-close #epic-wave-close #github-mergeable #squash-merge #ポーリング

## 学び: docs_chore + `artifact: spec` の場合の case-run/spec-save 境界（PR が作成できない）

- **問題事象**: `work_type: docs_chore` で SPEC ファイルそのものが実装成果物（`artifact: spec`）のケースでは、spec-save が SPEC 変更を直接 main へコミットする。このため case-run は作業ブランチを作成しても main との差分が空（empty diff）となり、意味ある PR を作成できない。結果として case-close は「PR マージ → 子Issue クローズ」の標準フローから外れ、「PR なし・変更は main 上にある」というエッジケースとして子Issue を直接クローズする運用になった。
- **発生局面**: case-run（実装フェーズ、Step 5-6: 実装とPR作成）、case-close（Step E3: PR作成済み子Issue 特定、Step E4: PRマージ）
- **検知方法**: Epic #1301 Wave 1 の case-close 実行時。子Issue #1302〜#1307 は case-run で受け入れ基準 TS-001〜TS-006 を PASS（verify-complete）したが、紐づく PR が一つも存在しなかった。コミット 7f9e3472 で SPEC 変更が既に main にあることを確認して境界事象と判定。
- **根本原因**: spec-save と case-run の責務境界設計。spec-save は SPEC ファイルを直接 main にコミットするが、case-run はブランチ + PR モデルを前提としている。`docs_chore` + `artifact: spec` の組み合わせでは、両者が競合し case-run の出力（PR）が空になる。設計上、artifact 種別に応じた PR 要否判定が case-run/case-open に存在しない。
- **自律対応内容**: case-close で PR マージステップをスキップし、子Issue を直接クローズする運用で対応。各子Issue の close comment で「SPEC 変更は main commit 7f9e3472 で適用済み、PR は作成されていない（docs_chore + spec-save ワークフロー）」と理由を明示し、Epic ステータステーブルも `completed (commit 7f9e3472)` 形式で記録。
- **ユーザー確認有無**: あり（タスク指示で「PR は存在しない、変更は main 上にある」という境界条件が明示指定された）。
- **ADR/REQ/spec影響**: あり。case-run SPEC（`docs/specs/commands/case-run.md`）、case-close SPEC（`docs/specs/commands/case-close.md`）、spec-save SPEC（`docs/specs/commands/spec-save.md`）、REQ-0130（case-run）、REQ-0131（case-close）で「artifact 種別に応じた PR 要否」の境界仕様を見直す候補。現在の case-close Step E3 は「PR作成済み子Issue」を前提としており、PR が存在しないケースの手順が明示されていない。
- **横展開観点**: docs_chore 以外で spec-save が main に直接コミットする全ケース。将来 artifact 種別が拡張された場合（`artifact: adr` 等）にも同様の境界が発生する可能性。
- **再発条件**: `work_type: docs_chore`（または maintenance）で `artifact: spec` を指定し、spec-save → case-run → case-close と進めた時。
- **予防策候補**: (a) case-run に「artifact 種別に応じた PR 要否判定」を組み込み、spec の場合は PR スキップを自動判定する。(b) case-open 時に work_type + artifact から PR 不要フラグを設定し、case-run/case-close がそれに従う。(c) case-close に「PR なしクローズ」の明示手順を追加し、エッジケースを正規ルートとして文書化する。
- **想定反映先**: SPEC `docs/specs/commands/case-run.md`（PR 作成要否判定）、SPEC `docs/specs/commands/case-close.md` Step E3/E4（PR なしクローズ手順）、SPEC `docs/specs/commands/spec-save.md`（commit 直接適用時の case-run 連携）、REQ-0130、REQ-0131。
- **関連**: Epic #1301、子Issue #1302〜#1307、SPEC 変更 main commit 7f9e3472。実行日時 2026-06-27。
- **タグ**: `#case-run` `#spec-save` `#docs-chore` `#edge-case` `#boundary` `#pr-less-close`

## 学び: case-close Epic Wave クローズ手順中の SPEC 昇格編集が origin/main 進行後に行われることによる working tree 衝突

- **問題事象**: Epic Wave クローズ（Step E1-E6）の実行中、Step 3-2 SPEC 昇格（`draft → accepted`）の frontmatter 編集を Step 9（`git pull --ff-only`）の前に行ったところ、ローカル main の3ファイルが dirty 状態となり `git pull --ff-only` がブロックされた。ローカル main は origin/main より3コミット（4子Issue の squash merge）遅れており、編集した SPEC ファイルのうち `document-type-responsibilities.md` は Phase B（PR #1316）で変更されていたため、pull の fast-forward が working tree 変更により失敗した。
- **発生局面**: case-close Epic Wave クローズ（Step E4 / Step 3-2 SPEC 昇格編集 → Step 9 git pull の順序）
- **検知方法**: `git pull --ff-only` 実行時のエラーメッセージ「Your local changes to the following files would be overwritten by merge」により検知。
- **根本原因**: case-close の手順順序で Step 3-2（SPEC 昇格）が Step 9（git pull --ff-only）より前段に位置するが、Epic Wave クローズでは Step E4 で複数 PR をマージした直後に Step 3-2 を実行するとローカル main が古いまま編集を加える形になる。単一 Issue クローズでは PR マージが1回のみで working tree の編集衝突が起きにくいが、Wave クローズではマージ回数が増えるほど差分が蓄積し衝突可能性が高まる。
- **自律対応内容**: `git stash push -- <明示パス3件>` で SPEC 編集を退避 → `git pull --ff-only` で fast-forward → 退避した SPEC 編集を破棾し、pull 済みの最新内容へ編集を再適用（frontmatter は draft のまま維持されていたため昇格編集はそのまま有効）。これにより pull と SPEC 昇格を両立させた。
- **ユーザー確認有無**: なし。
- **ADR/REQ/spec影響**: あり。case-close SPEC（`docs/specs/commands/case-close.md`）の Step 3-2 と Step 9 の順序依存性、または Step E4 と Step 3-2 の実行順序に関する明示が必要。Step 9 を先に実行してから Step 3-2 を行う順序、または SPEC 昇格を `.agentdev/` commit と同時に最終ステージで行う順序が安全。
- **横展開観点**: 単一 Issue クローズでも PR マージ後の `git pull` 前にローカル編集を行う全ケース。特に docs/specs/ 配下の SPEC を直接編集する工程（case-close Step 3-2 以外にも spec-save、case-update 等）で同様のリスクあり。
- **再発条件**: (a) Epic Wave クローズで複数 PR を連続マージした後に SPEC 昇格編集を行う、(b) 単一クローズでも PR マージと git pull の間に docs/specs/ 配下ファイルを編集する、(c) PR が編集対象 SPEC と同一ファイルを変更している。
- **予防策候補**: (a) Step 3-2 SPEC 昇格を Step 9（git pull）の後に実行する順序に変更する、(b) Epic Wave クローズ Step E4 完了直後に Step 9 を実行し、その後に Step 3-2 / E5 / E6 を行う順序にする、(c) Step 3-2 編集前に必ず `git status` と `git fetch` を実行し origin/main との差分を確認する。
- **想定反映先**: SPEC `docs/specs/commands/case-close.md` Step 3-2、同 Step 9、同 Step E4-E6 の順序依存性、agentdev-git-worktree skill の references/git-common-procedures.md。
- **関連**: Epic #1308 Wave 1 クローズ（PR #1313/#1314/#1315/#1316）。実行日時 2026-06-28。
- **タグ**: `#case-close` `#epic-wave-close` `#spec-elevation` `#git-pull` `#working-tree` `#ordering`

## gh issue edit --body-file でコンソールエンコーディング初期化（Step 0）を省略すると UTF-8 BOM なしファイルでも本文が mojibake 化する

- **問題事象**: case-close Step 2 で完了条件 checkbox を [x] 化するため、`[System.IO.File]::WriteAllText($tmp, $body, UTF8Encoding($false))` で UTF-8 BOM なしファイルを作成し `gh issue edit 1341 --body-file $tmp` を実行したところ、Issue 本文が CP932 として解釈され日本語が文字化けした（4562 バイトの本来本文が 3281 文字の mojibake 文字列として保存された）。
- **発生局面**: 実装（case-close Step 2 完了条件更新）。Windows + pwsh 7 環境。
- **検知方法**: 書き込み直後の VERIFY で `[regex]::Matches($body, '- \[ \]').Count` を見ると更新されているはずが 0 のままで、さらに本文頭部が `## 讎りｦ・` のように mojibake になっていることで検知。
- **根本原因**: gh CLI は `--body-file` で指定したファイル読み込み時にコンソールのコードページ（chcp）を参照する。Step 0（`[Console]::OutputEncoding`, `$OutputEncoding`, `chcp 65001` の3行）を省略したため chcp 932（Shift-JIS）環境で gh が UTF-8 バイト列を CP932 として解釈し文字化けした。`[System.IO.File]::WriteAllText` によるファイル側の UTF-8 BOM なし書き出し規定は、gh CLI のファイル読み取り側エンコーディング判別には影響しない。
- **自律対応内容**: agentdev-gh-cli skill の standard-procedures.md Section 2 Step 0 に規定の3行（`[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`, `$OutputEncoding = [System.Text.Encoding]::UTF8`, `cmd /c chcp 65001 | Out-Null`）を実行後に、正しい元本文（手元に残っていた最初の gh issue view 出力）を再構成して `[x]` 化し、`gh issue edit --body-file` を再実行して本文を復元した。VERIFY で unchecked=0, checked=2, mojibake なしを確認。
- **ユーザー確認有無**: なし。
- **ADR/REQ/spec影響**: なし。agentdev-gh-cli skill `references/standard-procedures.md` Section 2 Step 0 は既に規定済み。本事例は規定の運用徹底不足に起因。
- **横展開観点**: gh CLI の全 WRITE 操作（`gh issue edit`, `gh issue comment`, `gh issue create`, `gh pr create`, `gh pr edit`）で `--body-file`/ `--title` 引数を使用する際に同様に発生する。`--title` への日本語渡し、gh CLI 内部の文字列表記も影響を受ける。
- **再発条件**: (a) Windows PowerShell / pwsh 環境で chcp 932 のまま gh issue edit --body-file を実行した場合、(b) Step 0 の3行を実行せずに WRITE 操作に進んだ場合、(c) セッションを新規起動後にコンソールエンコーディング初期化を忘れた場合。
- **予防策候補**: (a) case-close / case-open / case-update 等、gh CLI WRITE を呼ぶ全 command の該当 Step に「agentdev-gh-cli standard-procedures Section 2 Step 0 を必ず実行」を明記、(b) verify.md の書き込み後 VERIFY に「本文の mojibake チェック（日本語文字種の正常性確認）」項目を追加、(c) README 等のハーネス側 AGENTS.md に Windows 環境での gh CLI 実行前のエンコーディング初期化を必須事項として明記。
- **想定反映先**: (a) `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0（既存・再徹底）、(b) `src/opencode/skills/agentdev-gh-cli/references/verify.md`（mojibake 検査項目追加候補）、(c) `src/opencode/commands/agentdev/case-close.md` 等 gh CLI WRITE を呼ぶ command の該当 Step（Step 0 参照を明記）。
- **関連**: Issue #1341 case-close、PR #1344。agentdev-gh-cli skill `references/standard-procedures.md` Section 2 Step 0、Section 1 禁止事項。
- **タグ**: `#gh-cli` `#encoding` `#windows` `#mojibake` `#case-close` `#verify`

## 学び: case-auto 並列実行中に main worktree が sibling ブランチにいる場合の main ref 同期

- **問題事象**: case-close Step 9（git pull --ff-only で main 同期）を実行しようとしたところ、main worktree の現在ブランチが sibling セッションの `fix/skill-frontmatter-backticks-removal-1345` になっていた。`git checkout main && git pull --ff-only` を実行すると working tree の状態（`.gitignore` 変更、`.agentdev/drafts/` 未追跡）が sibling セッション側へ持ち込まれ、sibling 作業を破壊するリスクがあった。
- **発生局面**: case-close Step 9（実行前同期）。case-auto draft9 並列実行中（OU-002 #1342、OU-003 #1343、OU-004 #1345 が同時進行）。
- **検知方法**: `git branch --show-current` で現在ブランチが main ではなく sibling ブランチであることを確認。`git pull --ff-only` が "Already up to date." を返し（sibling ブランチ視点では既に最新）、HEAD がマージコミット bc8331c3 でないことで検知。
- **根本原因**: case-auto 並列実行で sibling セッション（OU-004 #1345）が main worktree で `fix/skill-frontmatter-backticks-removal-1345` ブランチを作成し作業中。case-close の標準手順（Step 9 git pull --ff-only）は main worktree が main ブランチにいることを暗黙に前提としているが、並列実行時はその前提が崩れる。
- **自律対応内容**: `git checkout main` で working tree を移動する代わりに `git fetch origin main:main` を実行し、local main ref のみを fast-forward 更新した（working tree は sibling ブランチのまま、`.gitignore` 変更と `.agentdev/drafts/` 未追跡ファイルもそのまま保持）。これにより main ref は bc8331c3 へ同期され、sibling セッションの作業状態は無傷で維持された。
- **ユーザー確認有無**: なし。
- **ADR/REQ/spec影響**: あり。case-close Step 9（`agentdev-git-worktree` skill の `git pull --ff-only` 手順）は、main worktree が main ブランチにいることを前提としている。case-auto 並列実行時の main worktree 共有利用に関する明示が必要。REQ-0131（case-close）、agentdev-git-worktree skill。
- **横展開観点**: case-auto 並列実行で main worktree を sibling ブランチが占有する全ケース。Epic Wave クローズ等の自動マージ処理でも、sibling が main worktree を使用中に main 同期が必要な場面で同様。
- **再発条件**: (a) case-auto が OU を並列委譲し、sibling セッションが main worktree でブランチを作成している場合、(b) case-close Step 9 を実行する際に main worktree が main 以外のブランチにいる場合。
- **予防策候補**: (a) case-close Step 9 に「現在ブランチが main でない場合は `git fetch origin main:main` で ref のみ同期し、working tree を移動しない」分岐を明記、(b) case-auto 並列実行時に各 OU 専用の worktree を必ず作成させ main worktree を共有させない、(c) agentdev-git-worktree skill に main 以外のブランチにいる場合の代替同期手順を追加。
- **想定反映先**: `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md`（pull/push/hash 検証の共通手順に現在ブランチ判定の分岐を追加）、`src/opencode/commands/agentdev/case-close.md` Step 9。
- **関連**: Issue #1342 case-close、PR #1347（merge bc8331c3）。sibling: Issue #1345（OU-004）、ブランチ `fix/skill-frontmatter-backticks-removal-1345`。実行日時 2026-06-29。
- **タグ**: `#case-close` `#case-auto` `#parallel` `#git-fetch` `#main-worktree` `#workaround`

## 学び: 機械横断是正の除外ロジックが YAML frontmatter を考慮していなかった事例と Level 2 コンフリクト解消モデルの実証

- **問題事象**: PR #1334 の機械横断是正（backticks 機械付与）で、`src/opencode/skills/agentdev-*/SKILL.md` 計27ファイルの frontmatter `name:` 行にバッククォートが誤って付与された。frontmatter は構造データ（YAML）であり Markdown インラインコード表記の対象外であるため、opencode がスキル名を `` `agentdev-xxx` `` として誤認する不具合を引き起こした。さらに本是正 PR (#1346) の case-close 実行中に、origin/main へ PR #1347（AG-002）が push され `agentdev-inspect-skills/SKILL.md` で content conflict が発生。Level 1 rebase で自動解決失敗し case-auto へエスカレーション、Level 2 で rebase 解消してマージ完了した。
- **発生局面**: 機械横断是正の実行時（PR #1334）、および case-close Step 4-2（コンフリクト解消 rebase パス Level 1）。
- **検知方法**: (a) backticks 付与は opencode のスキルロード時の名前空間解決不正で発覚。(b) conflict は `gh pr merge 1346 --squash` が `GraphQL: Pull Request has merge conflicts` で失敗し、`gh pr view 1346 --json mergeable,mergeStateStatus` が `CONFLICTING/DIRTY` を返したことで検知。
- **根本原因**: (a) backticks 機械付与対象の除外ロジックが YAML frontmatter 等の構造データを考慮していなかった。自然言語記述（本文）のみが付与対象と明文化されていなかった。(b) conflict は case-close 実行中に別 PR (#1347) が origin/main へ push された纯粋なタイミング競合。
- **自律対応内容**: (a) 是正として frontmatter `name:` 行を YAML スカラー値（プレーン文字列）へ修正。再発防止として agentdev-inspect-skills へ frontmatter name バッククォート検出基準を追加、agentdev-skill-authoring へバッククォート禁止規定を明示。(b) Level 1 rebase 試行→自動解決失敗→`git rebase --abort`→case-auto へエスカレーション。case-auto から Level 2 再委譲を受け case-close Step 4 から再開、squash merge 成功。
- **ユーザー確認有無**: なし。
- **ADR/REQ/spec影響**: あり（前工程で完了済み）。REQ-0140（文書品質ゲート: 構造データ除外を明確化）、REQ-0153（機械横断是正の完了証明: 対象範囲妥当性）、`docs/specs/integrity/backticks-identifier-threshold.md`（適用対象外の構造データ明示）。_commit 11c754d9 で main マージ済み_。
- **横展開観点**: (a) 機械横断是正を実装する全ケースで、付与対象が自然言語記述のみであることの明示と、構造データ（YAML/JSON/ TOML frontmatter 等）の除外判定が必須。検出自動化は inspect-skills で担保（新設 `references/skill-frontmatter-name-backtick.md`、診断ラベル `skill-frontmatter-name-backtick`）。(b) コンフリクト解消モデル Level 1/2/3 の運用実績として、Level 1 失敗→Level 2 委譲の経路が機能することを実証。Level 2 は実装変更を伴う rebase 解消を case-auto/case-run が担う。
- **再発条件**: (a) backticks 機械付与対象を自然言語記述のみに限定する判定なしに機械横断是正を実行した場合。(b) case-close 実行中に別 PR が origin/main へ push され、同じファイルへ変更を加える場合。
- **予防策候補**: (a) 機械横断是正の実装前に付与対象・除外対象の分類チェックを必須化（REQ-0153 対象範囲妥当性）。検出は inspect-skills `skill-frontmatter-name-backtick` ラベルで自動化済み。(b) コンフリクト解消モデル文書（`docs/specs/commands/case-auto.md` Level 1/2/3）の運用継続。Level 1 失敗時のエスカレーション指示は case-close Step 4-2 に明記済み。
- **想定反映先**: 既に対処済み。(a) REQ-0140/0153、`docs/specs/integrity/backticks-identifier-threshold.md`、agentdev-inspect-skills（検出基準）、agentdev-skill-authoring（オーサリング規範）。(b) `docs/specs/commands/case-auto.md` コンフリクト解消モデル、`src/opencode/commands/agentdev/case-close.md` Step 4-2。
- **関連**: Issue #1345、PR #1346（squash merge c4e78897）、PR #1334（原本是正）、PR #1347（AG-002 conflict 相手、merge bc8331c3）、commit 11c754d9（REQ/SPEC 前提）。実行日時 2026-06-29。
- **タグ**: `#machine-transversal-correction` `#backticks` `#yaml-frontmatter` `#structural-data` `#conflict-resolution` `#level-2` `#case-auto` `#case-close`

## 学び: check_read_contracts.ts は Bun ランタイム必須（node --experimental-strip-types は ESM エラーで失敗）

- **問題事象**: case-close Step 2 の QG-4 証拠取得で `.opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.ts` を `node --experimental-strip-types` で実行したところ `ReferenceError: require is not defined in ES module scope, you can use import instead` で失敗した。スクリプト冒頭が `const path = require("path") as typeof import("path")` のハイブリッド記法であり、Node のネイティブ ESM（package.json なし）では解釈できない。
- **発生局面**: case-close Step 2（QG-4 証拠検証）、Step 3-1（read contract 検査 strict 実行）。
- **検知方法**: node 実行時の ReferenceError。併設テスト `check_read_contracts.test.ts` が `import { expect, test, describe } from "bun:test"` を持つことから Bun が想定ランタイムと判明。
- **根本原因**: スクリプトが TypeScript + CommonJS require を Bun 上で動かす前提で書かれている。`require() as typeof import()` は TS の型キャスト付き require であり、純 ESM の Node では構文エラーになる。docs-check.md Step 1 と `docs/specs/commands/inspect-read-contracts.md` は「check_read_contracts.ts を実行し」とだけ書き、ランナー（Bun）を明記していない。
- **自律対応内容**: テストを `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.test.ts` で実行し 2 pass を確認。スクリプト直接実行は `bun run` 用の小さなラッパ（checkReadContracts を import して呼ぶ）を書いて JSON レポートを取得し、ok=true / direct_refs=0 を確認した。
- **ユーザー確認有無**: なし。
- **ADR/REQ/spec影響**: なし（運用上の呼び出し方法）。docs-check.md Step 1、`docs/specs/commands/inspect-read-contracts.md`「検証観点」にランナー明記が望ましいが、機能欠陥ではない。
- **横展開観点**: repo-agentdev-integrity 配下の他スクリプト群も同様の require/bun:test 記法を採用する可能性がある。docs-check、inspect-read-contracts、case-close Step 3-1 が同スクリプトを呼ぶ全局面で Bun が必要。
- **再発条件**: (a) 新規セッションや CI で check_read_contracts.ts を node 系ランナーで実行しようとした場合、(b) docs-check を実行する agent がテストファイルの import 文を確認せずランナーを推測した場合。
- **予防策候補**: (a) docs-check.md Step 1 と inspect-read-contracts SPEC の「check_read_contracts.ts を実行し」に「Bun で実行し（`bun run` / `bun test`）」を明記、(b) スクリプト冒頭に実行方法のコメントを追記、(c) repo-agentdev-integrity 配下に package.json を置き `scripts` としてエイリアスを定義。
- **想定反映先**: `src/opencode/commands/repo/docs-check.md` Step 1、`docs/specs/commands/inspect-read-contracts.md`「検証観点」。必要なら `src/opencode/skills/repo-agentdev-integrity/SKILL.md` の実行手順。
- **関連**: Issue #1351、PR #1352（squash merge 0002cee2）、スクリプト `.opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.ts`、テスト `check_read_contracts.test.ts`。実行日時 2026-07-02。
- **タグ**: `#bun` `#node` `#esm` `#runtime` `#docs-check` `#inspect-read-contracts` `#workaround`
