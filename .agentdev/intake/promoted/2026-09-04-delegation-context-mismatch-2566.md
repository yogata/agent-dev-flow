# delegation structured_context と Issue 本文の対応付け不一致

## 観測内容
PR #2579（Issue #2566）で、DEL-2566-1 の指示が inspect-skills の別作業を示したが、Issue 本文は intake-from-github の GitHub I/O 表記統一だった。実行側は Issue 本文を SSoT として正しく実行した。

## 影響
Issue 番号と作業内容の対応付けを誤ると、別 OU の作業を誤って実行する危険がある。

## 課題
structured_context の作業内容を Issue 本文から抽出し、会話コンテキストや波及推定を注入しない。Issue 番号と対象成果物パスの突合、および purpose mismatch item との統合可否を検討する。

## 既存要件・正規成果物との関連
Issue #2566、PR #2579（0c7f9c48）、case-auto→case-run 委譲契約、agentdev-case-run-execution-adapter。
