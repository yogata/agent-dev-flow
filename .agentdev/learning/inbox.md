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