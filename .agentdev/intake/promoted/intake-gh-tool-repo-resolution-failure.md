# agentdev_gh のリポジトリ解決堅牢化（config-uninterpretable 失敗の環境差吸収）

## 観測内容

case-auto stage 1（case-open、draft topic_slug: jev-adapter-score-criteria-fix）の実行中、Custom Tool `agentdev_gh` の全操作が `config-uninterpretable`（detail: `cannot resolve the target repository (set AGENTDEV_GH_REPO=owner/name or run inside a gh repo)`）で失敗した（issue_list で 2 回再現）。

同一環境の bash / bun からは `gh repo view --json nameWithOwner` が成功し（`yogata/agent-dev-flow` を返す）、`spawnSync("gh", ...)` 自体の動作は正常。Plugin（`src/opencode/plugins/agentdev-gh-tool/plugin.ts` の `defaultResolveRepo`）は (1) 環境変数 `AGENTDEV_GH_REPO`、(2) `context.worktree` 起点の `gh repo view` の順で解決するが、opencode プロセス内では両者が失敗する。失敗は Tool 側の fail-closed 設計どおりの正常な失敗通知であり、Tool の契約違反ではない。

adversarial-review の技術検証による実装確認（2026-09-22 時点）:

- config-uninterpretable の failure detail には worktree 解決状態・gh の stderr 等の診断情報が含まれない。
- `git remote get-url origin` による fallback 解決は実装されていない。
- plugin README 設定節は `AGENTDEV_GH_REPO` と fail-closed 挙動を文書化するが、opencode 起動環境（launcher / .env 相当）への設定導線の記載がない（docs/guides/ の導入手順にも不在であることを learning 側で機械確認済み）。

## 影響

- `AGENTDEV_GH_REPO` 未設定の環境で opencode プロセス内の `gh repo view` が失敗する場合、agentdev_gh を使う全 workflow（case-open / case-ready / case-run / case-close、issue）の書込み操作が case 実行のたびに blocked となる。本 Case でも書込み操作（Root Case 作成・Definition PR 作成）が blocked で停止した（読み取りは gh CLI 切替で完遂済み）。

## 課題

- 同根問題が learning lane でも昇格済み（`.agentdev/learning/promoted/measure-update-agentdev-gh-repo-resolution-env-setup.md`）。learning 成果物の受け入れ条件は「本 item と learning 成果物が backlog-review で統合判定され、同根問題の重複 RU が生成されない」ことを要求する。統合判定は backlog-review の正規機能（同一関心領域の複数成果物の N:1 統合・矛盾検出）で実施する。本 item は修正提案（修正対象の具体性）を、learning 成果物は再発防止知見（運用切替の知見）を保持する Split Rule どおりの分割であり、統合が正規の再合流経路である。
- plugin 実装変更（診断強化・fallback）を行う場合は Tool 操作契約（custom-tool-contracts.md）との整合確認が必要である。

## 提案する修正対象

- `src/opencode/plugins/agentdev-gh-tool/plugin.ts` の `defaultResolveRepo` の堅牢化候補: worktree が正しく解決されているかの診断情報を failure detail に含める、または `git remote get-url origin` による fallback 解決の検討。
- 運用面の恒久対策候補: opencode 起動環境（launcher / .env 相当）への `AGENTDEV_GH_REPO=yogata/agent-dev-flow` 設定を harness 導入手順に明記する（plugin README 設定節には既存の記載あり。起動環境への設定導線が欠落）。

## 既存要件との関連

- POL-gh-io-delegation（gh CLI 直接書込みの禁止・fail-closed 契約）、custom-tool-contracts.md（gh-tool Plugin の `AGENTDEV_GH_REPO` 設定と fail-closed 挙動の正典化）、REQ-052（Custom Tool 契約）。本提案は Tool 操作契約の意味変更（gh CLI 代替の解禁等）を含まない。

## 出典

- case-open-capture、Case #3056 関連（draft topic_slug: jev-adapter-score-criteria-fix）、captured_at 2026-09-22。
- 元 item frontmatter の source_ru: RU-0131 は現存しない過去 run の revert 済み履歴参照であり、実害なしとして扱う。
