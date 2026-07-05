# 操作契約

`agentdev-gh-cli` が提供する I/O 手続きと VERIFY の操作契約（REQ, ADR decision #2, #3）。
手続きの引数、戻り値、エラー扱いを定義する。
標準版（GitHub 版）の具体的実装手順は [standard-procedures.md](standard-procedures.md) 参照。

## I/O 手続き

### Issue 作成

| 項目 | 内容 |
|---|---|
| 入力 | タイトル（文字列）、本文（Markdown）、ラベル（文字列配列、省略可） |
| 出力 | Issue 番号（数値）、Issue URL（文字列） |
| エラー扱い | gh CLI が非零終了時は失敗。標準出力から Issue 番号を抽出できない場合も失敗 |
| 後続 | VERIFY（[verify.md](verify.md)）を直後に実行 |

### Issue 本文読込

| 項目 | 内容 |
|---|---|
| 入力 | Issue 番号 |
| 出力 | Issue 本文（Markdown） |
| エラー扱い | Issue が存在しない、または権限不足で gh CLI が非零終了時は失敗 |

### Issue 本文更新

| 項目 | 内容 |
|---|---|
| 入力 | Issue 番号、本文（Markdown） |
| 出力 | なし（VERIFY で反映を確認） |
| エラー扱い | gh CLI が非零終了時は失敗 |
| 前提 | 更新前後の本文比較のため、更新前に本文読込でスナップショットを取得することを推奨 |
| 後続 | VERIFY を直後に実行 |

### Issue コメント追加

| 項目 | 内容 |
|---|---|
| 入力 | Issue 番号、コメント本文（Markdown） |
| 出力 | なし（VERIFY で反映を確認） |
| エラー扱い | gh CLI が非零終了時は失敗 |
| 後続 | VERIFY を直後に実行 |

### PR 作成

| 項目 | 内容 |
|---|---|
| 入力 | タイトル（文字列）、本文（Markdown）、ベースブランチ、ヘッドブランチ |
| 出力 | PR 番号（数値）、PR URL（文字列） |
| エラー扱い | gh CLI が非零終了時は失敗。標準出力から PR URL を抽出できない場合も失敗 |
| 後続 | VERIFY（[verify.md](verify.md)）を直後に実行 |

### PR 本文読込

| 項目 | 内容 |
|---|---|
| 入力 | PR 番号 |
| 出力 | PR 本文（Markdown） |
| エラー扱い | PR が存在しない、または権限不足で gh CLI が非零終了時は失敗 |

### PR merge

| 項目 | 内容 |
|---|---|
| 入力 | PR 番号、merge 方式（`squash` / `merge` / `rebase`） |
| 出力 | merge コミットハッシュ |
| エラー扱い | conflict、CI 未通過、保護ブランチ違反等で gh CLI が非零終了時は失敗。エラーメッセージから原因を分類し [standard-procedures.md](standard-procedures.md) の Merge Conflict 対応に従う |
| 前提 | merge 前に HEAD commit hash を記録することを推奨（divergent 検出用） |

### Issue close

| 項目 | 内容 |
|---|---|
| 入力 | Issue 番号、close 理由（`completed` / `not_planned`、省略時は `completed`） |
| 出力 | なし |
| エラー扱い | gh CLI が非零終了時は失敗 |

## VERIFY

| 項目 | 内容 |
|---|---|
| 入力 | 操作対象の識別子（Issue 番号 / PR 番号 / コメント対象 Issue 番号）と、書き込み元テキスト |
| 出力 | 検証結果（PASS / FAIL）、検証観点別（4観点）の結果 |
| 実行契約 | 各書き込み操作の直後に個別に実行（一括検証は不可） |
| 失敗時 | [retry.md](retry.md) の3段階リトライロジックに従う |

VERIFY の観点と実装詳細は [verify.md](verify.md) 参照。

## エラー扱いの共通原則

- gh CLI の非零終了は失敗とする
- 標準出力、標準エラー出力から原因を分類可能な場合は、対応手順（Merge Conflict 等）へ遷移する
- ネットワーク揺れ、API 一時不具合等の同一内容リトライで解決する可能性がある失敗は、VERIFY のリトライロジック（[retry.md](retry.md)）の範囲で再試行する
- 上記以外の失敗は停止し、ユーザーに報告する
