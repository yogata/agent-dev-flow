# IR-053 `last_verified` フィールドの stale placeholder

## 観測内容

`docs/specs/integrity/rules/IR-053-gh-direct-invocation-detection.md` line 23 の `last_verified` フィールドが `(新規登録時)` のまま放置されている。新規登録時刻を示す一時プレースホルダーとみなされ、検証実施日の実反映がされていない。

REQ-0152 は AG-010 合意（commit `fa992e0b`, 2026-07-20）で「新設・新規登録・Issue/PR番号・存在しないSPEC参照」の作業履歴を純化した。IR-053 は REQ-0152 の運用実体（related_req: REQ-0152-001/002/003）であるため、REQ-0152 純化と同期して `last_verified` を実検証日へ更新すべきだったが見送られた。REQ-0152 のスコープが REQ-0152.md 本文のみであったため、IR-053 は Issue #1687 の修正対象外となった。

- 由来 PR: #1691
- 由来 Issue: #1687
- 検知局面: REQ-0152 純化の副産物（case-run for Issue #1687 検証中、AG-010 純化と整合性確認時）

## 影響

重要度: low。機能影響なし。メタデータの陳腐化・整合性低下のみ。`last_verified` が実検証日を示さないため、IR-053 の検証実績の追跡性が損なわれる。

## 課題

IR-053 の `last_verified` フィールドに一時プレースホルダーが残置されたまま実検証日へ更新されていない。REQ-0152 純化（AG-010 合意）の伝播先として IR-053 が対象外となったことが原因である。

## 既存要件・仕様との関連

- IR-053（`docs/specs/integrity/rules/IR-053-gh-direct-invocation-detection.md`）: 本件の対象ファイル。frontmatter `status: accepted` と `last_verified` の整合性確認が必要。
- REQ-0152-001/002/003: IR-053 の related_req。REQ-0152 純化の運用実体として IR-053 が位置づけられている。
- AG-010 合意（commit `fa992e0b`, 2026-07-20）: REQ-0152 純化の合意。IR-053 の `last_verified` 更新はスコープ外であった。

## 対応方針の方向性

IR-053 body 表 `last_verified` を `(新規登録時)` から実検証日へ是正する。候補日は `2026-07-20`（AG-010 合意内容反映日）または `2026-07-21`（Issue #1687 case-run 検証日）。同時に IR-053 frontmatter `status: accepted` と `last_verified` の整合性を確認する。

対象ファイル: `docs/specs/integrity/rules/IR-053-gh-direct-invocation-detection.md` のみ。機能影響のない小修正。
