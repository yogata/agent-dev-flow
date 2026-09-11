# decisions/README.md 関連REQ列の retired REQ 後継注記の人手補記運用

## 観測内容

- 発生源: PR 2761（Issue 2756 / Epic 2755 W1）の Findings/intake 記録を回収
- capture 元: case-close Epic Wave 1（Epic 2755、delegation DEL-2756-1）
- captured_at: 2026-09-10

関連REQ表の AUTOGEN 生成規則では retired REQ の後継注記（「（retired、後継: REQ-012）」等）が関連REQ列から除去される。後継情報の維持は README 説明列（人手判断列）への補記運用が必要。PR 2761 では DEC-007/013/017 の説明列へ後継情報を補記済み。

2026-09-11 時点の現行突合: DEC-007/013/017 の補記は実施済みを確認（decisions/README.md L179/L185/L189）。残る未確認事項は補記の網羅性（現行 Decision 全行について retired 関連 REQ の後継注記が要否どおり揃っているか）と継続性（以後の retired 発生時の補記運用）である。

## 影響・課題

- 補記の網羅性・継続性は人手判断列の責務であり、生成規則側での保証対象外
- 補記漏れが発生しても機械検出されない

## 後続判断に残る選択肢

- 現行 Decision 表の retired 後継注記の網羅性確認の実施（要否と実施単位）
- 継続性の運用方式（再発防止知見としての保持か、生成規則側での補助か）

## 既存要件・契約との関連

- REQ-059（Decision と REQ の関連宣言管理）
- docs/designs/integrity/index-auto-generation.md
