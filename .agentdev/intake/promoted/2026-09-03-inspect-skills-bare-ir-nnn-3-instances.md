# agentdev-inspect-skills SKILL.md の裸 IR-{NNN} プレースホルダー 3 箇所

## 観測内容

2026-09-03 の docs-check（check_integrity）で、`src/opencode/skills/agentdev-inspect-skills/SKILL.md` の 59・61・98 行目に ID プレースホルダー `IR-{NNN}` の裸出力（コードスパン・括弧・テンプレート外）3 箇所が unresolved-placeholder [WARNING]（REQ-010-065、IR-064）として新規検出された。

本件は IR-064 裸出力の正規様式未確定問題の従属インスタンスである。ID プレースホルダー裸出力 48 件の正規様式確定 item（2026-08-22）が backtick 包囲か裸出力許容かの様式決定を保留中で、本 3 箇所はその決定を待つ新規インスタンスである。

原因分類: 確認済（検出箇所・検出根拠は checker 出力で確認済み）/ 様式確定の判断は既存 item の保留事項。

2026-09-03 現行確認: SKILL.md 59・61・98 行目の `IR-{NNN}` 裸出力を git grep で確認済み。

## 影響

正規様式確定まで baseline 承認も整形もできない状態で、check_integrity の WARNING として残存する。

## 課題（レビューで決めること）

- 既存 item の様式決定（backtick 包囲 or 裸出力許容）を先に確定し、本 3 箇所へ同一方針を適用する
- 48 件 baseline への本 3 箇所の追加要否

## 既存要件・契約との関連

- IR-064（unresolved-placeholder、REQ-010-065）の判定正規化。
- 関連 item: ID プレースホルダー裸出力 48 件の正規様式確定（2026-08-22、上位の様式決定 item）、inspect-skills の IR 参照表記の扱い統一（2026-08-30、59 行目の旧 IR-053 言及が本 3 箇所の `IR-{NNN}` 裸出力に変換された経緯で従属。配布依存境界 gate 側の扱い判断も含む）。3 item は backlog-review での統合判定候補。

## 根拠

- check_integrity レポート `.agentdev/integrity/reports/2026-09-03-integrity-report.md`（WARNING unresolved-placeholder ×3、src/opencode/skills/agentdev-inspect-skills/SKILL.md:59,61,98）
- 2026-09-03 機械確認: git grep で SKILL.md 59/61/98 行目の `IR-{NNN}` 裸出力を確認
