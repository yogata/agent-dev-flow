---
id: 2026-11-25-delegate-command-prelaunch-zero-target-check
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# 委譲文に書く検証コマンドは、委譲の前に取りまとめ自身が起動し、対象が 0 件でないことを確認する

- **問題事象**: 手順書のパスをそのまま委譲文へ写したため、実行担当と取りまとめがともに test ファイル 0 件の実行を 1 回ずつ実行した（`C/buntest-integrity-1.stderr`、`G/prhead-buntest-integrity.stderr.txt`）
- **発生局面**: 実装（Issue #4222 の case-run、実行委譲。2026-11-25 JST）
- **検知方法**: bun test の stderr（`22 files were searched` で test ファイル 0 件、exit 1）
- **根本原因**: 委譲文の検証コマンドを手順書から転記する際に、取りまとめ自身が対象の実在を確認しなかった
- **自律対応内容**: 正本のパス `./src/common/skills/repo-agentdev-integrity/scripts/` で再実行して解消した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（委譲運用の観測であり、正規成果物への影響なし）
- **横展開観点**: 委譲文に検証コマンドを書くときは、委譲の前に取りまとめ自身が 1 回起動し、対象が 0 件でないことを確認する
- **再発条件**: 手順書の記載パスを実体確認なしに委譲文へ転写する場合
- **予防策候補**: 委譲前の起動確認を委譲手順へ組み込む
- **想定反映先**: agentdev-case-run-execution-adapter SKILL（委譲プロトコル）
- **関連**: PR #4225、Issue #4222
- **タグ**: `#delegation` `#verification-command`
