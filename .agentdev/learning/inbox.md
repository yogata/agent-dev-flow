# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-26: agentdev_gh pr_create は head branch 未 push 状態で HTTP 422 を返す（branch push 前段が必要）

- **問題事象**: case-open STEP-4 で Definition branch を worktree 上で新規作成した直後に agentdev_gh の pr_create を実行したところ、HTTP 422 Validation Failed（operation-failed、retryable: true、fallbacks: なし）で失敗した
- **発生局面**: case-open STEP-4（Definition PR 作成）。Case 専用 worktree（.worktrees/{N}-definition）で origin/main HEAD から definition/issue-{N} を新規作成し commit 済みだが push 前の状態で pr_create を呼出した初回
- **検知方法**: agentdev_gh の構造化 failure（kind: operation-failed、detail: gh: Validation Failed (HTTP 422)）
- **根本原因**: pr_create は GitHub 側に head branch が存在しない場合 PR を作成できず、Custom Tool は branch push（git push）を内部で行わない。branch の新規作成と push は呼出側の前段操作である
- **自律対応内容**: git push -u origin definition/{branch} を前段で実行した上で pr_create を再実行し作成成功（VERIFY 通過）。gh CLI への切替は行わなかった（書込み操作のため切替範囲外）
- **ユーザー確認の有無**: なし（自律解決）
- **Decision/REQ/spec影響**: なし（既存契約の範囲内。pr_create 操作契約・REQ-083 に変更なし）
- **横展開観点**: case-revise の Definition Amendment PR も branch 新規作成後に pr_create する構成であり同条件になり得る
- **再発条件**: branch を新規作成した直後に push 前段なしで pr_create を呼出した場合
- **予防策候補**: case-open / case-revise の reference に「pr_create 前に head branch を origin へ push する」前段手順の明記。gh CLI 切替継続手順（definition-pr-and-idempotency.md）は読み取り切替のみを扱い、書込み系の 422 への言及がない
- **想定反映先**: agentdev-workflow-case-open references/definition-pr-and-idempotency.md、agentdev-workflow-case-revise の同等手順
- **関連**: Case #3142、PR #3147、REQ-083（definition/issue-{N}）
- **タグ**: #gh-cli #pr-create #branch-push #case-open

---

