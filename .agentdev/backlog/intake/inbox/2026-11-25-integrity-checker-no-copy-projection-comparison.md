---
id: 2026-11-25-integrity-checker-no-copy-projection-comparison
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# 既存の整合性チェックは copy 投影を比較していない（IR-016 は比較対象なし、IR-068 は空結果）

- **課題**: 既存の整合性チェックは copy 投影を比較していない。走査ルートに `.opencode` が無く manifest が null になるため、IR-016 は比較対象なし、IR-068 は空結果になる
- **期待する処分**: 整合性チェックの走査ルートと manifest 取得の契約を見直し、copy 投影を比較対象に含めるかどうかの判断
- **出典**: PR #4225 本文「Findings/ Capture候補」の intake 1 件目（実行担当の記録）。全文は PR コメント 7139211529「Findings と Design 確定候補の詳細記録」
- **実証根拠**: PR #4225 の最終検証での checker 実行での検出。copy 投影との比較は比較関数 `compareCopyProjection` の直接呼び出し（`G/prhead2-ir016.*`）で別途行った
