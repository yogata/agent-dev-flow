# 採用済み成果物: REQ-003-055 系 phantom row 3件の残存（2026-10-01 REQ-096 移管由来の pre-existing）

## 観測内容

REQ-003-055 行を参照する箇所が 3件残存している（check_integrity IR-067 phantom row citation NG 3件）。

- `docs/designs/foundations/v4-responsibility-boundaries.md` L44/L67: 「旧 REQ-003-055」言及
- `docs/requirements/REQ-003.md` L56 付近: 移管注記行（REQ 本文内の移管記録行であり修正には REQ 本文編集が要る）

2026-10-01 の REQ-096 一般化移管由来の pre-existing。

## 影響

IR-067 検査で継続的に phantom row citation として検出され、検証差分のノイズとなる。REQ-096 への移管史の参照形式が未整理。

## 課題

REQ-003 本文内移管注記行の retired 実パス + 廃止注記形式への整理、v4-responsibility-boundaries.md の旧 ID 言及の現行化の対応候補（REQ-010-072 的な retired 実パス + 廃止注記の取扱い整理を含む）。

## 既存要件との関連

- REQ-096（ADF判断アーキテクチャ）への一般化移管（旧 REQ-003-055/056）
- IR-067（phantom row citation 検査）
- REQ-010-072（retired 実パス + 廃止注記の取扱い）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-04-req003-055-phantom-preexisting-req096-migration.md`（分類採用により削除済み）
- 観測元: PR #3439（Case #3432・Epic #3425 Wave 3）本文 Findings / Capture候補 intake セクション
- 備考（元 item）: Wave 3 完了判定では計画内 pre-existing として対象外・完了記録に明記済み
- captured_at_commit: cefc3f794e0ed6eedcf59ea53732ca08366ad00e
- 現行源検証（intake-promote・ad6e8341・読取のみ）: REQ-003.md L56 領域と v4-responsibility-boundaries.md L44/L67 の旧 ID 言及が現行も残存することを確認
- 関連: 2026-10-03 取得の既知債務 3系統 item の債務 1 と同一対象（統合記録 `2026-10-03-known-integrity-debts-consolidation.md` 参照）
