# case-close Step 3-1 docs guard の false-clean 予防

## 概要

case-close Step 3-1 で実行する targeted docs guard（`check_changed_docs.ts`）が、main ワークツリー上での `--base-ref` 指定で `files_checked: []` を返し、変更ファイルがあるのに検査対象ゼロの false-clean になる事象の予防。

## 詳細

- `check_changed_docs.ts` は `git diff <base-ref>..HEAD` で変更ファイルを算出する
- case-close は main ワークツリーで実行され PR ブランチを checkout しないため、HEAD == merge-base となり diff が空になる
- 結果として `files_checked: []`・`failures: []` が返り、検査を実施していないのに pass と見える
- 実例: Issue #1425 / PR #1426 の case-close で発生。`--files` 明示に切り替えて再実行し回避

## 候補となる対応

以下のいずれか（組合せ可）:

1. case-close.md Step 3-1 の起動例を `--files <PR 変更ファイル明示>` を標準とする
2. `check_changed_docs.ts` が `--base-ref` 使用時 `files_checked` が空なら warning を出す
3. case-close 手順に「`files_checked` が空でないことの確認」ステップを追加する

## 根拠

- 観測元: PR #1426 の case-close 実行（draft #3 / 9、2026-07-05）
- 実行コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-close --base-ref 453cf9a8 --json`
- 結果: `files_checked: []`, `failures: []`, `full_docs_check_recommended: false`（PR は case-close.md + SKILL.md の2ファイルを変更）
- 関連 learning: `.agentdev/learning/inbox.md`「check_changed_docs.ts の --base-ref が main チェックアウト時に空 diff を返し docs guard が false-clean になる」
- 関連要件: REQ-0158-003（targeted docs guard）
