---
id: 2026-11-25-senpi-area-outside-boundary-scan-target
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# 既存の Senpi 接続領域（`src/senpi/`）が走査対象に含まれない

- **課題**: 既存の Senpi 接続領域（`src/senpi/`）が配布依存境界 checker の走査対象に含まれない
- **期待する処分**: 走査対象への追加判断
- **出典**: PR #4225 本文「Findings/ Capture候補」の intake 3 件目（実行担当の記録）。全文は PR コメント 7139211529「Findings と Design 確定候補の詳細記録」
- **実証根拠**: PR #4225 の最終検証での checker 実行での検出。Issue #4222 では変えていない
