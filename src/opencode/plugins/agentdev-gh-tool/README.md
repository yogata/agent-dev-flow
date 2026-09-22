# agentdev-gh-tool（Plugin / Custom Tool 登録）

Custom Tool `agentdev_gh` を OpenCode の実行時へ登録する ADF 汎用 Plugin（REQ-{NNNN}、REQ-{NNNN}、DEC-{NNN} 決定4）。

Plugin は登録の配線のみを担う。操作契約（入力、出力、保証、失敗時の意味）、fail-closed 実行ゲート、VERIFY（読み戻し照合）は Tool 本体（`src/opencode/tools/agentdev-gh/`）が所有する。

## 仕組み

OpenCode は `.opencode/plugins/` 直下のファイル（depth-1）のみを自動読み込みする。本パッケージはディレクトリ型のため、インストーラ（`scripts/install.ps1` / `scripts/self-sync.ps1` / archive installer）が junction 作成に加えて、同ディレクトリ直下へローダーシム `<パッケージ名>.ts`（`plugin.ts` の default を再エクスポートする1行）を生成する。シム経由で本 Plugin が読み込まれ、custom tool `agentdev_gh` が登録される。

## 実行の差し替え（ローカル版）

既定は GitHub 実装（Tool の `runner-cli.ts` が gh CLI を実行）。投影パス `.opencode/tools/agentdev-gh/runner-local.ts` に Local 実装が存在する場合（`install.ps1 -LocalMode` により junction 先が `src/opencode-local/agentdev-gh/` に差し替わっている場合）は、それを動的に読み込んで差し替える。Workflow は差を認識しない（REQ-{NNNN}-{NNN}、DEC-{NNN}）。

## 設定

環境変数 `AGENTDEV_GH_REPO`（`owner/name` 形式）で対象リポジトリを指定できる。未指定の場合は `gh repo view` で解決する。解決不能な場合、全操作は `config-uninterpretable` として失敗する（fail-closed）。

gh CLI の認証状態は `gh auth status` で確認できる。未認証やリモート不在のチェックアウトでは `gh repo view` による解決に失敗するため、`AGENTDEV_GH_REPO` を起動環境（launcher / .env 相当）へ設定する。設定手順は導入ガイド [Consumer Project 導入](../../../docs/guides/consumer-project-setup.md) の「AGENTDEV_GH_REPO の起動環境設定」節を参照する。

リポジトリ解決に失敗した場合の failure detail には、試行した解決手段、`gh repo view` の終了コードと stderr の要因が診断情報として含まれる。診断情報と併せて、`AGENTDEV_GH_REPO` 設定による解決手続きの導線が維持される。

## 実行権限の所有者

本 Plugin は登録機構であり、副作用の実行権限の所有者を変更しない。判断・承認は Workflow / 利用者側に残る。

## テスト実行

```bash
bun test        # cwd: src/opencode/plugins/agentdev-gh-tool
```
