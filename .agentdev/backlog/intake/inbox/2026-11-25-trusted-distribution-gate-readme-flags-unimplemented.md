---
id: 2026-11-25-trusted-distribution-gate-readme-flags-unimplemented
created_at: 2026-11-25T09:10:00+09:00
source: case-close (Issue #4223 PR #4226 本文 Findings の回収)
status: unreviewed
---

# trusted-distribution-gate の README が案内する CLI フラグが check_distribution_boundary_cli.ts に実装されていない

- **課題**: trusted-distribution-gate の README が `--archive`・`--save-baseline`・`--delta`・`--exemptions` を案内するが、`check_distribution_boundary_cli.ts` に実装がない（文書と実装の不一致。PR #4226 では修正せず記録のみ）
- **期待する処分**: README と CLI 実装の一致の判断（フラグ実装の追加、または README 案内の縮減）
- **出典**: PR #4226 本文「Findings/ Capture候補」の intake 1 件目（実行担当の記録）
- **実証根拠**: PR #4226 の検証での README 案内オプションと CLI 実装の突合。配布境界 checker 自体の 5 profile 実行は exit 0 で完結しており、動作への即時影響はない
