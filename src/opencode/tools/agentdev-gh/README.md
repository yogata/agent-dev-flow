# agentdev-gh（Custom Tool）

Git / GitHub 等への構造化された副作用操作を担う ADF 汎用 Custom Tool（種別契約 REQ、決定4）。

## 操作契約

各操作は次の外部契約のみを公開する（Design `docs/designs/responsibilities/custom-tool-contracts.md`）。

| 要素 | 内容 | 実装 |
|---|---|---|
| 入力 | 操作名、構造化引数（title、body、labels 等） | `contracts.ts`（GhToolRequest） |
| 出力 | 構造化結果（issue 番号、URL 等） | `contracts.ts`（GhToolSuccess） |
| 保証 | 操作の結果を検証（読み戻し）してから成功を返す | `engine.ts`（VERIFY） |
| 失敗 | 保存または検証に失敗した場合に成功扱いとしない。エラー種別と再試行可否を返す | `contracts.ts`（GhToolFailure） |

実装詳細（gh オプション、`--body-file`、UTF-8 BOM なし、chcp 初期化、REST API PATCH、一時ファイル運用、シェル呼出）は `runner.ts` の実行境界の内側に隠蔽する。

## 対象操作（初期セット）

`issue_create`、`issue_read`、`issue_update`、`issue_comment`、`issue_close`、`pr_create`、`pr_read`、`pr_merge`、`pr_changed_files`、`pr_mergeable`。

## fail-closed（決定6）

設定を解釈できない（`config-uninterpretable`）、対象パス等を安全に解決できない（`path-unresolvable`）、強制処理自体が異常終了した（`enforcement-crashed`）、必須検証が完了できない（`verification-incomplete`）のいずれかの場合、対象副作用を実行せず成功扱いとしない。

副作用操作（side-effect）は読み戻し照合（VERIFY）を通過した場合のみ成功を返す。読み取り操作（read-only）は応答の自己整合を確認する。

## 補助能力の継続契約

読み取り操作は代替手段（gh CLI 手動実行、GitHub Web UI）と継続可否（`canContinue: true`）を契約として公開する（`AGENTDEV_GH_PUBLIC_CONTRACTS`）。副作用操作は代替なし・継続不可（fail-closed）。

## 実行権限の所有者

本 Tool は実行機構であり、副作用の実行権限の所有者を変更しない。判断・承認は Workflow / 利用者側に残る。

## 登録構造と実装

- `index.ts` が Tool 名・公開契約・操作スペックを単一の登録単位へ接続する
- `runner-cli.ts` が gh CLI への具体的な写像（GitHub 実装 `GhRunner`）を実装する。`--input` による UTF-8 JSON ファイル渡し、シェル不使用の引数配列呼び出し、一時ファイルの作成と削除等の実装詳細はこの境界の内側に隠蔽される
- 登録 Plugin（`src/opencode/plugins/agentdev-gh-tool/`）が custom tool `agentdev_gh` を OpenCode の実行時へ登録する
- ローカル版（consumer-generated）は同一操作契約で Case ファイル読み書きへ読み替えた `GhRunner` 実装（`src/opencode-local/agentdev-gh-cli/runner-local.ts`）を差し替える

ツール名、ファイル構成、公開単位の詳細は Design `custom-tool-contracts.md` が所有する。

## テスト実行

```bash
bun test        # cwd: src/opencode/tools/agentdev-gh
```
