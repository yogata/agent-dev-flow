# targeted docs guard の workflow プロファイル対象外ディレクトリ（docs/knowledge、src/opencode）

## 概要

check_changed_docs.ts の workflow プロファイル（appliesTo）は docs/designs・reports・requirements・decisions・guides/ とルート README 等を対象とし、docs/knowledge/** と src/opencode/** は対象外。docs/knowledge 変更を含む case-run で `--workflow case-run` を指定すると TARGET-EMPTY（検査見逃し防止の fail-closed）となり、全ファイル対象の `--workflow docs-check` プロファイルでの実行が必要になる。case-run/case-close の手順文書における workflow プロファイル使い分けの明確化、または対象ディレクトリ拡張の検討候補。

## 内容

- `--workflow case-run` / `--workflow case-close` の appliesTo に docs/knowledge/** を含めるか、docs/knowledge 変更時は docs-check プロファイルを使う旨の運用明記
- 現行の実務対応: case 2799（DEL-2799-3）では `--workflow docs-check` で files 6 件を検査し failures 0 を確認

## 根拠

- 観測元: case 2799（DEL-2799-3、PR #2803）本文 Findings（intake 候補）、case-close（2026-09-14）で回収
- 元テキスト: PR #2803 本文 Findings/Capture候補「targeted docs guard の case-run workflow プロファイル（appliesTo）は docs/designs・reports・requirements・decisions・guides/ とルート README 等を対象とし、docs/knowledge/** と src/opencode/** は対象外。docs/** 変更を含む case-run で --workflow case-run を指定すると TARGET-EMPTY となり、全ファイル対象の --workflow docs-check プロファイルでの実行が必要」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
