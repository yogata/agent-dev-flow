---
id: 2026-11-24-root-lacks-pr-close-operation
created_at: 2026-11-25T00:07:00+09:00
source: case-close (Issue #4214 の残る事柄の登録。利用者の判断 2026-11-24: 案A)
status: unreviewed
---

# agentdev_gh に PR を統合せずに閉じる操作がない

- **課題**: agentdev_gh に「PR を統合せずに閉じる」操作がない。生の `gh pr close` は write guard が設計上使えない。issue_close は閉じた証 (`.agentdev/close-acceptance/` の実物) を要求する。PR #4217 を閉じた際 (2026-11-24) は、root が理由のコメントを投稿したあと、閉じる操作を監督が実施した
- **期待する処分**: この操作が今後必要になった場合に、root が自力で閉じられる手段 (操作の追加、または閉じた証の正規の作り方) を検討する
- **出典**: root が発行した質問 que_20dec1d99001lJsnxDh3xyHgJ6 (2026-11-24 23:18) と PR #4217 のクローズ (2026-11-24)
- **実証根拠**: root の質問本文の報告 (閉じた証がないため issue_close は拒否、生の gh pr close は write guard で不可、受理記録の捏造や別経路の回避はしない)。PR #4217 は 2026-11-24T14:21:39Z に CLOSED になった (監督が `gh pr close 4217` を実行)
