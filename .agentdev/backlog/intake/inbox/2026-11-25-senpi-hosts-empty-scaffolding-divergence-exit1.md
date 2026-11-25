---
id: 2026-11-25-senpi-hosts-empty-scaffolding-divergence-exit1
created_at: 2026-11-25T09:10:00+09:00
source: case-close (Issue #4223 PR #4226 本文 Findings の回収)
status: unreviewed
---

# senpi 適用で空の .opencode scaffolding が作成され check が DIVERGENCE exit 1 になる

- **課題**: senpi 適用の既存挙動として、`-Hosts senpi` でも空の `.opencode/commands`・`.opencode/skills` scaffolding が作成され、check が 4 件の機械ステップ欠落 DIVERGENCE で exit 1 になる（base `7f998b086` の挙動）
- **期待する処分**: 空 scaffolding 作成の要否と check の DIVERGENCE 判定の扱いの判断
- **出典**: PR #4226 本文「Findings/ Capture候補」の intake 3 件目（実行担当の記録）
- **実証根拠**: PR #4226 の検証ドライバの基準記録（証跡 cc1-base-senpi.txt）。既存 intake `2026-11-25-senpi-area-outside-boundary-scan-target`（走査対象の課題）とは別の挙動課題
