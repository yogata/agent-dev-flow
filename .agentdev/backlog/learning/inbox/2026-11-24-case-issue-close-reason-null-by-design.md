---
id: 2026-11-24-case-issue-close-reason-null-by-design
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 のクローズ確認での観測)
status: unreviewed
---

# agentdev_gh の issue_read は Case Issue の closeReason を null で返す

- **問題事象**: `agentdev_gh` の issue_close（reason: completed）で Issue #4218 を閉じた直後の issue_read で、`state` は `closed` だが `closeReason` は `null` だった。クローズが理由付きで記録されていない可能性を調べるために実装の確認を要した
- **発生局面**: 運用（Issue #4218 の case-close。2026-11-24 13:19 JST）
- **検知方法**: issue_close 後の issue_read の結果と、クローズ時に指定した理由との突き合わせ
- **根本原因**: `deriveCloseReason`（`src/common/tools/agentdev-gh/tracking-schema.ts` の 94〜109 行目）は、追跡Issue（role: tracking）以外に対して null を返す設計になっている。Case Issue の終了理由は導出せず、Tool の公開契約にも現れない
- **自律対応内容**: 実装（`tracking-schema.ts` の `deriveCloseReason`、`runner-cli.ts` の `issueClose`〔460〜489 行目〕）を読み、issue_close が PATCH に `state_reason` を渡していることと、closeReason の導出対象が追跡Issueに限られることを確認した。クローズの確認は `state: closed` で判定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Case Issue のクローズ確認には `state` を使う。`closeReason` は追跡Issueでのみ意味を持つ
- **再発条件**: Case Issue を閉じた直後に issue_read の closeReason を確認した場合に毎回 null になる
- **予防策候補**: agentdev-gh の README または case-close の手順に「Case Issue の closeReason は null」である旨を明記する
- **想定反映先**: `src/common/tools/agentdev-gh/README.md`、`src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md`（Issue クローズの STEP）
- **関連**: Issue #4218
- **タグ**: `#agentdev-gh` `#issue-close`
