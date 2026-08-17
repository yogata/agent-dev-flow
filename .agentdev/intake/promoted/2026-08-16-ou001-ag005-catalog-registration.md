# AG-005 規則の integrity-rule-catalog / rule-ownership 未登録と新規カテゴリ追加判定フロー適用要否

## 観測内容

AG-005 規則群の integrity-rule-catalog.md / rule-ownership.md への catalog 登録が未実施。lint_skills.ts は check_integrity.ts の categoryToCheckPattern 対象外のため、新規カテゴリ追加判定フロー（REQ-0145-005）の適用要否は未判断のまま。

## 影響

- 規則の正典（catalog）に AG-005 が存在せず、実装と規則体系の対応が追跡できない

## 課題

catalog エントリ追加の要否を新規カテゴリ追加判定フローに従って判断し、必要なら integrity-rule-catalog.md / rule-ownership.md へ登録する。

## 既存要件・成果物との関連

- 対象: integrity-rule-catalog.md、rule-ownership.md
- 実装: lint_skills.ts AG-005 規則（PR #2184 で main 入り済み）
- 関連: 2026-08-16-ou001-skill-md-check-table-ag005-row.md（検査カテゴリ表への行追加、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2184 (Issue #2179 / OU-001, Epic #2178 Wave 1) Findings / Capture候補 セクション intake 2
- 元 item: intake-2026-08-16-ou001-ag005-catalog-registration.md
