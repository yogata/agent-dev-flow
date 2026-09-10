# intake: decisions/README.md 関連REQ列の retired REQ 後継注記の人手補記運用

- **発生源**: PR #2761（Issue #2756 / Epic #2755 W1）の Findings/intake 記録を回収
- **capture 元**: case-close Epic Wave 1（Epic #2755、delegation DEL-2756-1）
- **captured_at**: 2026-09-10

## 内容

関連REQ表の AUTOGEN 生成規則では retired REQ の後継注記（「（retired、後継: REQ-012）」等）が関連REQ列から除去される。後継情報の維持は README 説明列（人手判断列）への補記運用が必要。本 PR では DEC-007/013/017 の説明列へ後継情報を補記済み。補記の網羅性・継続性は人手判断列の責務であり、生成規則側での保証対象外。

## 補足
