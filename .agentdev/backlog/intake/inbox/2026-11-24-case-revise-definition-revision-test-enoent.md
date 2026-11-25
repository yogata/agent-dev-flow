---
id: 2026-11-24-case-revise-definition-revision-test-enoent
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 の統合後確認での検出)
status: unreviewed
---

# case-revise-definition-revision.test.ts の 1 error は基準から存在する実行不能な試験

- **課題**: `scripts/self/release/case-revise-definition-revision.test.ts` の 209 行目が `docs/requirements/retired/REQ-033.md` を読めず ENOENT で異常終了する。AGENTS.md のみを変更した PR #4219 でも再現し、`bun test ./scripts/` の継続的なノイズとなっている
- **期待する処分**: 別課題化（追跡 Issue 起票または RU 化）の判断。既存 item `2026-11-23-realization-actions-contract-preexisting-fails` は `realization-actions-contract.test.ts` の 3 fail を扱っており、試験ファイルが異なるため、統合するかどうかは review で判断する
- **出典**: Issue #4218 の case-close。Issue #4218 の対応記録コメント（commentId 7121768655）の残課題
- **実証根拠**: PR #4219 の統合前の main root で `bun test ./scripts/self/release/case-revise-definition-revision.test.ts ./scripts/self/release/realization-actions-contract.test.ts` を実行し、51 pass / 3 fail / 1 error（exit 1、2026-11-24 08:43 JST）。基準 `83c45a54ff67e4f34d461d93d89d536cb42ec18e` の木でも同一の 51 pass / 3 fail / 1 error（exit 1、2026-11-24 08:47 JST）。error は `case-revise-definition-revision.test.ts:209:19` の ENOENT `docs/requirements/retired/REQ-033.md`
- **追記（2026-11-25・case #4223）**: base `7f998b086` の detached worktree でも同一の 1 error を再確認（PR #4226 分割③、証跡 cc3-test-split3.txt）。本件の変更と無関係
