# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 同一ファイルを変更する兄弟PRの逐次マージ時のコンフリクト対処

- **問題事象**: case-closeでPR #507(Issue #504)を先にsquash mergeした後、PR #508(Issue #503)の `gh pr merge --squash` が失敗。両PRが同一テストファイル `check_integrity.test.ts` の末尾に独立したテストセクション（describe block）を追加しており、main側が更新されたことでfeature/issue-503ブランチがbehindになった
- **発生局面**: 実装（case-close の PRマージステップ）
- **検知方法**: `gh pr merge --squash` の非ゼロ終了コードとエラーメッセージ
- **根本原因**: 兄弟Issue (#503, #504) がEpic #502配下で並列開発され、同一ファイルに追記形の変更を行っていた。一方のマージ後にもう一方のブランチがbaseより古くなり、squash merge不可となった
- **自律対応内容**: (1) `git rebase origin/main` でfeature/issue-503を最新mainにrebase、(2) コンフリクトを解消（両方のテストセクションを保持）、(3) force push、(4) squash merge成功を確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 同一Epic配下の並列開発で同一ファイルを変更するパターン全般に適用可能。特にテストファイルの末尾追記型変更で顕著
- **再発条件**: (1) 同一ファイルを変更する2つ以上のPRが存在、(2) それらを逐次マージする場合、(3) 後続PRがrebaseなしでマージを試みた場合
- **予防策候補**: (1) case-closeで複数PRを処理する際、マージ順序で後になるPRほどコンフリクトリスクが高いことを認識する、(2) マージ失敗時はrebase + conflict resolution → force push → retryのワークフローを標準手順とする
- **想定反映先**: case-close コマンドの Step 4（PRマージ）のエラー回復手順として文書化、または case-run の並列開発ガイドライン
- **関連**: Issue #503, #504, PR #507, #508, Epic #502, `tests/check_integrity.test.ts`
- **タグ**: `#merge-conflict` `#case-close` `#parallel-development` `#rebase`
