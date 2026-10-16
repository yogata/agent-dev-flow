# agentdev-issue-tracking Design の番号リスト重複修正候補

- 出所: inspect-docs 20261016T034754Z DS33（backlog-auto stage 1、系統識別 [inspect-docs]）
- 種別: Design 表層修正候補（Markdown 番号リスト再採番）
- 対象: `docs/designs/skills/agentdev-issue-tracking.md:47-48`
- 処置: delta 挿入により重複した番号を連番へ再採番する候補。実修正は後続工程（backlog-review → req-define/case-auto）で実施する

## DS33: Markdown 番号リストの「16.」重複と番号ずれ

- target: `docs/designs/skills/agentdev-issue-tracking.md:47-48`
- evidence: :47「16. issue_create の labels 引数の必須契約（呼出側規律）」（2026-10-16 delta で挿入）と :48 既存「16. 件名（title）の書式」が番号重複し、以降の番号系列もずれる（2026-10-16 現物確認済み）。
- severity: low / confidence: high（機械的に一意判定）
- source_of_truth: 該当なし（表層品質。文章表層の辞書検査は textlint 共通基盤の管轄）
- 修正方向: 番号連番の再採番（一意）
- notes: docs 配下 Design ファイル内のため配布物構文健全性の機械検査対象外だった

## 処理記録

- 2026-10-16 backlog-auto stage 2 inspect 系統で採用（自律確定）: 機械的に一意な表層欠陥で修正方向（再採番）が一意のため。Jev 先行評価（観測 20261016T041350Z-3c9e）＋ adversarial-review 2 stream（証拠系・権限系）で権限面も収束（決定的処理として導出可能）
