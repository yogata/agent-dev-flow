# agentdev-third-party-tool（Plugin / Custom Tool 登録）

Custom Tool `agentdev_third_party`（third-party Skill 取得）を OpenCode の実行時へ登録する ADF 汎用 Plugin（Custom Tool と Plugin/Hook の配布種別、登録機構の正は Design `docs/designs/responsibilities/custom-tool-contracts.md` 参照）。

Plugin は登録の配線のみを担う。操作契約（入力、出力、保証、失敗時の意味）、非破壊配置、fail-closed 実行ゲート、VERIFY（読み戻し照合）は Tool 本体（`src/opencode/tools/agentdev-third-party/`）が所有する。

## 仕組み

OpenCode は `.opencode/plugins/` 直下のファイル（depth-1）のみを自動読み込みする。本パッケージはディレクトリ型のため、インストーラ（`scripts/install.ps1` 等）が junction 作成に加えて、同ディレクトリ直下へローダーシム `<パッケージ名>.ts`（`plugin.ts` の default を再エクスポートする1行）を生成する。シム経由で本 Plugin が読み込まれ、custom tool `agentdev_third_party` が登録される。

## 設定

宣言ファイル（`src/third-party/skills.yaml`）と配置先（`.opencode/skills/`）は worktree（実行ディレクトリ）を基点に解決する。取得トランスポートは GitHub HTTPS（raw contents + contents API、git 依存なし）である。

## 実行権限の所有者

本 Plugin は登録機構であり、副作用の実行権限の所有者を変更しない。判断・承認は Workflow / 利用者側に残る。

## テスト実行

```bash
bun install && bun test   # cwd: src/opencode/plugins/agentdev-third-party-tool
```
