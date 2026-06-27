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

