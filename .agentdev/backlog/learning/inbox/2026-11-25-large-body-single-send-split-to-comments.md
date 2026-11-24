---
id: 2026-11-25-large-body-single-send-split-to-comments
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# 大きな本文は 1 回の送信で送らない（8,000 字を超える本文は要約し、詳細は PR コメントへ分割する）

- **問題事象**: PR #4225 の case-run で、PR コメントへの詳細記録は (1/2)・(2/2) の分割投稿とした。実行担当は push の完了後に接続を断ち、PR 作成と最終報告に到達していない
- **発生局面**: 実装（Issue #4222 の case-run。2026-11-25 JST）
- **検知方法**: PR コメントの分割投稿（「検証差分の詳細記録 (1/2)」「同 (2/2)」など）と PR 本文「実装内容」の接続断の記録
- **根本原因**: 大型本文を 1 回の tool 呼び出しで送信する構成（既存 entry `2026-11-24-category-model-delegate-large-tool-call-reset` と同根の疑い。あちらの根拠は未確定）
- **自律対応内容**: PR 本文は要約し、詳細記録は PR コメントへ分割して投稿した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（本文運用の観測であり、正規成果物への影響なし）
- **横展開観点**: 8,000 字を超える本文は要約し、詳細は PR コメントへ分割する
- **再発条件**: 大型本文を 1 回の送信で扱う場合
- **予防策候補**: 本文の字数上限と分割投稿の手順化
- **想定反映先**: agentdev-workflow-templates SKILL（Issue/PR 本文とコメントの分割運用）
- **関連**: `.agentdev/backlog/learning/inbox/2026-11-24-category-model-delegate-large-tool-call-reset.md`（大型 tool 呼び出しの接続リセットの別観測）、PR #4225、Issue #4222
- **タグ**: `#large-body` `#tool-call` `#pr-comment`
