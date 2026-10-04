# intake: REQ-003-055 系 phantom row 3件の残存（2026-10-01 REQ-096 移管由来の pre-existing）

## 内容

REQ-003-055 行を参照する箇所が 3件残存している（check_integrity IR-067 phantom row citation NG 3件。Epic #3425 Wave 3 では planned pre-existing として対象外扱い）。

- `docs/designs/foundations/v4-responsibility-boundaries.md` L44/L67: 「旧 REQ-003-055」言及
- `docs/requirements/REQ-003.md` L56: 移管注記行（REQ 本文内の移管記録行であり修正には REQ 本文編集が要る）

2026-10-01 の REQ-096 一般化移管由来の pre-existing。REQ-010-072 的な retired 実パス + 廃止注記の取扱い整理を含む後続候補。

対応候補: REQ-003 本文内移管注記行の retired 実パス + 廃止注記形式への整理、v4-responsibility-boundaries.md の旧 ID 言及の現行化。

## 根拠

- 観測元: PR #3439（Case #3432・Epic #3425 Wave 3）本文 Findings / Capture候補 intake セクション
- 元テキスト: 「REQ-003-055 系 phantom row 3件の残存 … 2026-10-01 の REQ-096 一般化移管由来の pre-existing。REQ-003.md L56 は REQ 本文内の移管記録行であり修正には REQ 本文編集が要る（本 Issue 対象外）。REQ-010-072 的な retired 実パス + 廃止注記の取扱い整理を含む後続候補」
- 備考: Wave 3 完了判定では計画内 pre-existing として対象外・完了記録に明記済み
- captured_at_commit: cefc3f794e0ed6eedcf59ea53732ca08366ad00e
