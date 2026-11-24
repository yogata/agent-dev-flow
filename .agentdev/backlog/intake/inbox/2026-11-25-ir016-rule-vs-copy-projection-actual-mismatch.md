---
id: 2026-11-25-ir016-rule-vs-copy-projection-actual-mismatch
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# IR-016 の規則と実際の copy 投影（`*.test.ts` を除く）が一致しない

- **課題**: IR-016 の規則（ファイル集合と内容の一致）と実際の copy 投影（`*.test.ts` を除く）が一致しない。比較関数は git-ignored のファイルを区別しない。`skill-projection-manifest.yaml` の `generated_at` が正本と投影で異なる
- **期待する処分**: 規則側（`*.test.ts` の除外と `generated_at` の扱い）と投影側（テストファイルを投影へ追加）のどちらを正とするかの判断
- **出典**: PR #4225 本文「Findings/ Capture候補」の intake 2 件目（実行担当の記録）。全文は PR コメント 7139211529「Findings と Design 確定候補の詳細記録」
- **実証根拠**: PR HEAD での正本と copy 投影の直接比較（`G/prhead2-ir016.*`、exit 0、verdict pass は `generated_at` の 1 行の差の例外適用後。正本の列挙 152 件、非テスト 106 件、投影 106 件）。Issue #4222 では検証エンジンも copy 投影の構成も変えず、テストファイルを投影へ追加していない
