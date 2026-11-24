---
id: 2026-11-24-preexisting-installer-test-failures
created_at: 2026-11-24T23:10:00+09:00
source: case-close (Issue #4214 PR #4216 の最終処理での検出。利用者の判断による別案件の登録)
status: unreviewed
---

# インストーラー試験の 19 件の不合格は基準から存在する (PR #4216 由来ではない)

- **課題**: pre-push と `repo-agentdev-integrity` の試験の対象外にあるインストーラー試験 4 種のうち、3 種で合計 19 件が基準 `022ce20f7` から不合格である。`bun test ./scripts/` が 3 件、`scripts/self/release/stale-cleanup-behavior.Tests.ps1` が 10 件、`scripts/self/release/installer-host-projection.Tests.ps1` が 6 件である。残る 1 種 `scripts/self/release/install-check-mechanical-prerequisites.Tests.ps1` の不合格は 0 件である。PR #4216 の最終コミット `2f8da21cd` でも失敗する試験の名前は基準と完全に同一で、PR #4216 由来の増分はない
- **期待する処分**: 原因の調査と是正を別案件として扱う判断
- **出典**: PR #4216 のコメント 7122262754 (J・K 是正の記録の K 検証) と Issue #4214 の最終処理 (2026-11-24)
- **実証根拠**: 基準 `022ce20f7` は `bun test ./scripts/` 376 pass / 3 fail、`stale-cleanup-behavior.Tests.ps1` 10 fail、`installer-host-projection.Tests.ps1` 6 fail (監督の実測)。`68e94e108` は `bun test ./scripts/` 379 pass / 3 fail (382 tests)、`stale-cleanup-behavior.Tests.ps1` 122 pass / 10 fail、`installer-host-projection.Tests.ps1` 39 pass / 6 fail。失敗する試験の名前の基準との突き合わせ (`2f8da21cd`) は監督が実施した。`bun test ./scripts/` の 3 件は document-model 関連であり、既存の intake 項目 `2026-11-23-realization-actions-contract-preexisting-fails` が挙げる 3 件と同じ対象かは未確認である
