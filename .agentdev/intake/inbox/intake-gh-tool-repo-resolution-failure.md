---
source: case-open-capture
source_case: "draft:jev-adapter-score-criteria-fix"
source_ru: RU-0131
captured_at: "2026-09-22"
title: agentdev_gh のリポジトリ解決堅牢化（config-uninterpretable 失敗の環境差吸収）
---

# agentdev_gh のリポジトリ解決堅牢化（config-uninterpretable 失敗の環境差吸収）

## 実観測

case-auto stage 1（case-open、draft topic_slug: jev-adapter-score-criteria-fix）の実行中、Custom Tool `agentdev_gh` の全操作が `config-uninterpretable`（detail: `cannot resolve the target repository (set AGENTDEV_GH_REPO=owner/name or run inside a gh repo)`）で失敗した（issue_list で2回再現）。

同一環境の bash / bun からは `gh repo view --json nameWithOwner` が成功し（`yogata/agent-dev-flow` を返す）、`spawnSync("gh", ...)` 自体の動作は正常。Plugin（`src/opencode/plugins/agentdev-gh-tool/plugin.ts` の `defaultResolveRepo`）は (1) 環境変数 `AGENTDEV_GH_REPO`、(2) `context.worktree` 起点の `gh repo view` の順で解決するが、opencode プロセス内では両者が失敗する。失敗は Tool 側の fail-closed 設計どおりの正常な失敗通知であり、Tool の契約違反ではない。

## 提案する修正対象

- `src/opencode/plugins/agentdev-gh-tool/plugin.ts` の `defaultResolveRepo` の堅牢化候補: worktree が正しく解決されているかの診断情報を failure detail に含める、または `git remote get-url origin` による fallback 解決の検討。
- 運用面の恒久対策候補: opencode 起動環境（launcher / .env 相当）への `AGENTDEV_GH_REPO=yogata/agent-dev-flow` 設定を harness 導入手順に明記する（`src/opencode/plugins/agentdev-gh-tool/README.md` 設定節には既存の記載あり。起動環境への設定導線が欠落）。

## 補足

- 本 Case（jev-adapter-score-criteria-fix）では書込み操作（Root Case 作成・Definition PR 作成）が blocked で停止。読み取りは参照どおり gh CLI 切替で完遂済み。
- 修正判断は intake-promote / backlog-review の評価対象とする。本 item は case-open の実観測のみを記録する。
