# agentdev-inspect-skills SKILL.md の裸 IR-{NNN} プレースホルダー 3 箇所

## 観測

2026-09-03 の docs-check（check_integrity）で、`src/opencode/skills/agentdev-inspect-skills/SKILL.md` の 59・61・98 行目に ID プレースホルダー `IR-{NNN}` の裸出力（コードスパン・括弧・テンプレート外）3 箇所が unresolved-placeholder [WARNING]（REQ-010-065、IR-064）として新規検出された。

本件は IR-064 裸出力の正規様式未確定問題の従属インスタンスである。既存 intake item（`.agentdev/intake/inbox/2026-08-22-id-placeholder-bare-output-style.md`）が backtick 包囲か裸出力許容かの様式決定を保留中で、本 3 箇所はその決定を待つ新規インスタンスである。

原因分類: **確認済**（検出箇所・検出根拠は checker 出力で確認済み）/ 様式確定の判断は既存 item の保留事項

## 影響

- 正規様式確定まで baseline 承認も整形もできない状態で、check_integrity の WARNING として残存する

## レビューで決めること

- 既存 item の様式決定（backtick 包囲 or 裸出力許容）を先に確定し、本 3 箇所へ同一方針を適用する
- 48 件 baseline への本 3 箇所の追加要否

## 根拠

- check_integrity レポート `.agentdev/integrity/reports/2026-09-03-integrity-report.md`（WARNING unresolved-placeholder ×3、src/opencode/skills/agentdev-inspect-skills/SKILL.md:59,61,98）
- `.agentdev/intake/inbox/2026-08-22-id-placeholder-bare-output-style.md`（様式決定の保留 item）
