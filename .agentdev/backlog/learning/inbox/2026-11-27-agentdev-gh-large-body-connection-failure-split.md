---
id: 2026-11-27-agentdev-gh-large-body-connection-failure-split
created_at: 2026-11-27T02:22:00+09:00
source: case-ready (Root Case #4227 の自工程 deviation capture)
status: unreviewed
---

# agentdev_gh への書込みは 1 回あたり 6,000 文字以下に分割する（10,893 文字の本文で接続失敗が続き、5,716 文字以下では失敗しなかった）

- **問題事象**: Root Case #4227 の本文（execution contract と Epic 化を含む全体、10,893 文字）を Custom Tool `agentdev_gh` で書き込もうとしたところ、2026-11-27 00:42 から 00:50 JST までの間、本文を渡す tool 呼出しが接続失敗で完了しなかった。計測前提は次のとおり。計測日時は、失敗が 2026-11-27 00:42〜00:50 JST、成功が同日 01:37〜02:04 JST。計測対象は `agentdev_gh` の issue_create、issue_update、comment_create の body の文字数。リポジトリの HEAD は bffb818e
- **発生局面**: 運用（Root Case #4227 の case-ready、STEP-4 からの Root Case 本文の更新）
- **検知方法**: tool 呼出しの接続失敗。再開後に Issue とコメントを読み戻し、重複した書込みがないことを確認した
- **根本原因**: 未確定。本文の大きさと失敗の相関のみを観測した（10,893 文字で連続して失敗、5,716 文字以下で失敗なし）。既存 entry `2026-11-24-category-model-delegate-large-tool-call-reset` と `2026-11-25-large-body-single-send-split-to-comments` と同根の疑いがある
- **自律対応内容**: 親の case-auto の判断で、1 回の書込みの文字数の上限を 4,000 文字から 6,000 文字へ引き上げた（01:35 JST）。実行単位ごとの契約を子 Issue の本文（#4229 は 4,808 文字、#4230 は 5,716 文字）へ置き、Root Case は Epic レベルの契約（3,243 文字）だけを持つ構成にした。以後の書込み（子 Issue の作成、Root Case と子 Issue の本文更新、工程記録のコメント）は失敗なく完了し、読み戻しとの比較で一致した
- **ユーザー確認有無**: なし（上限の引き上げは親の case-auto が判断した）
- **Decision/REQ/spec影響**: なし（実行単位ごとの契約を子 Issue 本文が持つ構成への分割であり、契約の内容は変わらない）
- **横展開観点**: `agentdev_gh` で書く Issue とコメントの本文は 1 回あたり 6,000 文字以下にする。Epic の Root Case 本文に全実行単位の契約を書かず、子 Issue の本文へ置く
- **再発条件**: 8,000 文字を超える本文を 1 回の tool 呼出しで送るとき（既存 entry の観測と整合する。5,716 文字では再発しなかった）
- **予防策候補**: 委譲プロンプトと本文テンプレートに、1 回の書込みの文字数の上限（6,000 文字）と分割の規則を明記する
- **想定反映先**: `agentdev-workflow-templates`（Issue・PR 本文とコメントの分割運用）、case-auto の委譲プロンプトの雛形
- **関連**: `.agentdev/backlog/learning/inbox/2026-11-24-category-model-delegate-large-tool-call-reset.md`、`.agentdev/backlog/learning/inbox/2026-11-25-large-body-single-send-split-to-comments.md`、Root Case #4227、子 Issue #4229・#4230
- **タグ**: `#large-body` `#tool-call` `#agentdev-gh`
