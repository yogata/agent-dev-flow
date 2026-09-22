# measure-update-agentdev-gh-repo-resolution-env-setup

## 背景

backlog-auto run3 stage 1（case-open、draft topic_slug: jev-adapter-score-criteria-fix）の実行中、Custom Tool `agentdev_gh` の全操作が `config-uninterpretable`（cannot resolve the target repository）で失敗した。同一環境の bash/bun からは `gh repo view --json nameWithOwner` が成功するが、opencode プロセス内の Plugin（`defaultResolveRepo`）では環境変数 `AGENTDEV_GH_REPO` 未設定・`gh repo view` 失敗でリポジトリ解決が不能となり、Root Case 作成・Definition PR 作成（書込み操作）が blocked 判定で停止した。読み取りは definition-pr-and-idempotency.md の切替手順に従い gh CLI で完遂済み。

## 問題

`AGENTDEV_GH_REPO` を opencode 起動環境へ設定する導線（launcher / .env 相当）が文書化されていない。plugin README 設定節と custom-tool-contracts.md は環境変数と fail-closed 挙動の正典化のみを行い、ユーザーが opencode を起動する前の設定手順（どの環境変数をどこに設定するか）を記載しない。このため AGENTDEV_GH_REPO 未設定の環境では、harness プロセス側の PATH / `context.worktree` 状態次第で `gh repo view` が失敗し、agentdev_gh を使う全 workflow（case-open / case-ready / case-run / case-close、issue）の書込み操作が case 実行のたびに blocked となる。

## 望ましい変更

- harness 導入ガイド（consumer project setup 等）に「opencode 起動環境への `AGENTDEV_GH_REPO=owner/name` 設定手順」を明記する。
- `config-uninterpretable` 失敗時の failure detail に解決手順（環境変数設定・gh 認証状態確認）を含める診断情報強化、または `git remote get-url origin` による fallback 解決を候補として req-define の変更影響分析に判断材料として渡す（実現先の選択は req-define）。
- 関連 intake item（intake-gh-tool-repo-resolution-failure.md、修正提案）と本成果物を backlog-review で統合判定し、重複 RU を生成しない。

## 対象範囲

### 対象

- harness 導入ガイド（docs/guides/ 配下の導入手順文書）
- `src/opencode/plugins/agentdev-gh-tool/README.md` 設定節（起動環境設定導線への参照追記候補）
- `src/opencode/plugins/agentdev-gh-tool/plugin.ts` の `defaultResolveRepo`（診断情報強化・fallback 解決の実装側候補。実現先の選択は req-define）

### 対象外

- gh CLI 直接書込みの解禁（POL-gh-io-delegation・fail-closed 契約の変更）
- Tool 操作契約（custom-tool-contracts.md）の意味変更
- intake / learning / backlog 以外の lifecycle 変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| guide | docs/guides/consumer-project-setup.md（導入手順該当箇所） | opencode 起動環境（.env / launcher）への AGENTDEV_GH_REPO 設定手順の追記 |
| 配布skill reference | src/opencode/plugins/agentdev-gh-tool/README.md 設定節 | 起動環境設定導線への参照・診断情報の説明追記（候補） |
| Custom Tool 実装 | src/opencode/plugins/agentdev-gh-tool/plugin.ts resolveRepo | failure detail の診断情報強化・git remote fallback 解決の検討（実装側候補） |
| intake 統合 | .agentdev/intake/inbox/intake-gh-tool-repo-resolution-failure.md | backlog-review での統合判定対象（同根問題の修正提案） |

## 既存対策確認

- **確認結果**: 既存対策あり（挙動の正典化のみ。起動環境への設定導線は欠落）
- **該当ファイル**: src/opencode/plugins/agentdev-gh-tool/README.md 設定節（環境変数と fail-closed 挙動の記載）、docs/designs/responsibilities/custom-tool-contracts.md L96（gh-tool Plugin の AGENTDEV_GH_REPO 設定）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: docs/ 配下全体を grep した結果、AGENTDEV_GH_REPO の記載は custom-tool-contracts.md L96 のみで、docs/guides/ の導入手順には不在。ユーザーが起動前に設定すべき手順（.env / launcher 設定）が文書化されていない。plugin README は「未指定の場合は gh repo view で解決する。解決不能な場合、全操作は config-uninterpretable として失敗する」と記載するが、解決不能を避けるための起動前設定導線を記載しない

## 制約

- 書込み操作の gh CLI 代替は契約上禁止（POL-gh-io-delegation、fail-closed）。本成果物は解決不能の予防（起動環境設定）を主眼とし、迂回手段の文書化はしない
- `config-uninterpretable` 失敗自体は Tool 契約どおりの正常な fail-closed 挙動であり、Tool の契約違反ではない
- plugin 実装変更（診断強化・fallback）を行う場合は Tool 操作契約（custom-tool-contracts.md）との整合確認が要る

## 受け入れ条件

- [ ] harness 導入ガイドに opencode 起動環境への AGENTDEV_GH_REPO 設定手順が記載されている
- [ ] AGENTDEV_GH_REPO 未設定環境での config-uninterpretable 失敗時、failure detail または README から解決手順（環境変数設定・gh 認証状態確認）に到達できる（実装側候補を採用する場合）
- [ ] intake-gh-tool-repo-resolution-failure.md と本成果物が backlog-review で統合判定され、同根問題の重複 RU が生成されない

## 元learning item / 根拠

- **要約**: agentdev_gh のリポジトリ解決失敗（AGENTDEV_GH_REPO 起動環境設定導線の欠落）における読み取り切替と書込み blocked 判定の知見
- **根拠**: Plugin README・custom-tool-contracts.md は挙動を正典化するが起動環境への設定手順を記載しない（docs/ 配下 grep で機械確認済み）。8軸評価 26/40・反映先明確度 4
- **再発条件**: `AGENTDEV_GH_REPO` 未設定の環境で opencode を起動し、かつ Plugin 内の `gh repo view` が失敗する場合
- **横展開可能性**: agentdev_gh を使う全 workflow（case-open / case-ready / case-run / case-close、issue workflow）で同条件なら同様に書込み不能になる

元 inbox エントリ全文（staged prune の証拠保存。出典: `.agentdev/learning/inbox.md` 2026-09-22 記載）:

```markdown
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
```

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, tooling
- **関連Issue**: なし（intake-gh-tool-repo-resolution-failure.md が関連 raw item）
