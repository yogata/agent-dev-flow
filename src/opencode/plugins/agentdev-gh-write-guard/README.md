# agentdev-gh-write-guard（Plugin / Hook）

Custom Tool 等の正規経路の迂回（生 gh WRITE 等の直接実行）を検出・拒否する ADF 汎用 Plugin（決定5、多層 enforcement の適用対象拡張）。

## 仕組み

OpenCode の `tool.execute.before` フックでコマンド実行系ツール（既定: `bash`）の引数を検査し、`agentdev-gh` Custom Tool を迂回する生 gh WRITE コマンドを機械的に拒否する。モデルの遵守判断に委ねない。

拒否時はフックが `GuardBlockError` を throw し、対象ツール呼び出しを block する。

## fail-closed（決定6）

| 状態 | 挙動 |
|---|---|
| 設定を解釈できない | 既定検査対象（`bash`）を安全性確認不能として block |
| 強制処理自体が異常終了した | 検出器の例外を block へ変換 |
| 必須検証が完了できない | 検査対象ツールでコマンド引数が検証不能なら block |

パス解決不能系は本 Plugin の検査対象外（コマンド文字列検査はパス解決に依存しない）。Tool 側（`src/opencode/tools/agentdev-gh/`）の fail-closed テストが担保する。

## 検出範囲

拒否: `gh issue create/edit/close/...`、`gh pr create/merge/review/...`、`gh api` の書き込みメソッド（POST/PATCH/PUT/DELETE）、`gh label/release/repo/workflow/gist/milestone/project` の WRITE 系。

許容: `gh issue view/list/status`、`gh pr view/list/diff/checks/status`、`gh api`（GET）、その他 gh 読み取り系。

禁止範囲（読み取り系の許容等を含む）の詳細は Design `docs/designs/responsibilities/custom-tool-contracts.md`「迂回防止」が所有する。検出は over-block を許容し under-block を許さない（迂回防止優先）。

## 設定

環境変数 `AGENTDEV_GH_WRITE_GUARD_CONFIG` に JSON を指定できる（省略時は既定設定）。

```json
{ "enforcedTools": ["bash"] }
```

設定の解釈に失敗した場合は fail-closed として既定検査対象を block する。

## 実行権限の所有者

本 Plugin は実行前の拒否・強制の実行機構であり、副作用の実行権限の所有者を変更しない。

## テスト実行

```bash
bun test        # cwd: src/opencode/plugins/agentdev-gh-write-guard
```
