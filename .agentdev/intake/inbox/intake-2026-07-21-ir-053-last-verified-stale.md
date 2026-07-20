# IR-053 `last_verified` フィールドの stale placeholder

## 問題事象

`docs/specs/integrity/rules/IR-053-gh-direct-invocation-detection.md` line 23 の `last_verified` フィールドが `(新規登録時)` のまま放置されている。新規登録時刻を示す一時プレースホルダーとみなされ、検証実施日の実反映がされていない。

## 発生局面

検証（case-run for Issue #1687、REQ-0152 純化の副産物）

## 検知方法

PR #1691 の case-run 検証中、REQ-0152（IR-053 の運用実体）の AG-010 純化と整合性確認を実施した際、IR-053 frontmatter body 表の `last_verified` が `(新規登録時)` のままであることを発見。

## 根本原因

REQ-0152 は AG-010 合意（commit `fa992e0b`, 2026-07-20）で「新設・新規登録・Issue/PR番号・存在しないSPEC参照」の作業履歴を純化した。IR-053 は REQ-0152 の運用実体（related_req: REQ-0152-001/002/003）であるため、REQ-0152 純化と同期して `last_verified` を実検証日へ更新すべきだったが見送られた。REQ-0152 のスコープ外（REQ-0152.md 本文のみ対象）であったため、本 Issue #1687 では修正対象外となった。

## 提案内容

IR-053 body 表 `last_verified` を `(新規登録時)` から実検証日（例: `2026-07-20` = AG-010 合意内容反映日、または `2026-07-21` = Issue #1687 case-run 検証日）へ是正する。同時に IR-053 frontmatter `status: accepted` と `last_verified` の整合性を確認する。

## 対象ファイル

- `docs/specs/integrity/rules/IR-053-gh-direct-invocation-detection.md`

## 参照

- PR #1691, Issue #1687, REQ-0152, AG-010

## 分類

具体的な修正候補（IR-* フィールド是正）

## 優先度

low（機能影響なし、整合性向上）
