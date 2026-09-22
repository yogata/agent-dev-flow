# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-22: agentdev_gh リポジトリ解決失敗時の読み取り切替と書込み blocked 判定

- **問題事象**: Custom Tool `agentdev_gh` の全操作が `config-uninterpretable`（cannot resolve the target repository）で失敗。同一環境の bash/bun から `gh repo view` は成功するが、opencode プロセス内の Plugin（`defaultResolveRepo`）では環境変数 `AGENTDEV_GH_REPO` 未設定・`gh repo view` 失敗となり解決不能。
- **発生局面**: case-auto stage 1（case-open）の Root Case 作成・Definition PR 作成（agentdev_gh issue_create / pr_create）
- **検知方法**: agentdev_gh issue_list の `config-uninterpretable` 失敗（2回再現、`retryable: false`）
- **根本原因**: opencode プロセス環境に `AGENTDEV_GH_REPO` が設定されておらず、Plugin 内 `spawnSync("gh", ["repo", "view", ...])` が harness プロセス側の PATH / `context.worktree` 状態で失敗する（bash セッション実測では同一呼出しが成功。環境差は harness プロセス側に存在）
- **自律対応内容**: definition-pr-and-idempotency.md の切替手順に従い、冪等検出（既存 Root Case・既存 Definition PR）を gh CLI 読み取り（gh issue list / gh pr list）で完遂。書込みは契約上 gh CLI 代替禁止（POL-gh-io-delegation、fail-closed）のため blocked 判定で停止
- **ユーザー確認の有無**: なし（case-auto 自走経路内の blocked 停止）
- **Decision/REQ/spec影響**: なし（Tool 契約どおりの fail-closed 挙動。迂回実行は行わなかった）
- **横展開観点**: agentdev_gh を使う全 workflow（case-open / case-ready / case-run / case-close、issue workflow）で同条件なら同様に書込み不能になる
- **再発条件**: `AGENTDEV_GH_REPO` 未設定の環境で opencode を起動し、かつ Plugin 内の `gh repo view` が失敗する場合
- **予防策候補**: opencode 起動環境への `AGENTDEV_GH_REPO` 設定（launcher / .env 相当）、plugin `resolveRepo` の診断情報強化・git remote fallback 検討
- **想定反映先**: src/opencode/plugins/agentdev-gh-tool/README.md 設定節、harness 導入ガイド
- **関連**: .agentdev/intake/inbox/intake-gh-tool-repo-resolution-failure.md、draft topic_slug: jev-adapter-score-criteria-fix
- **タグ**: #gh-tool #config-uninterpretable #case-open #fail-closed
