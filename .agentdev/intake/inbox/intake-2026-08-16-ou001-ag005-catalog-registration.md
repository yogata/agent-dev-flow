# Intake Item: AG-005 規則の integrity-rule-catalog / rule-ownership 未登録と新規カテゴリ追加判定フロー適用要否

## 発生源

- PR: #2184 (Issue #2179 / OU-001, Epic #2178 Wave 1)
- 発生 phase: case-run 実装
- capture 分類: intake（具体的修正対象、判断候補）

## 問題

AG-005 規則群の integrity-rule-catalog.md / rule-ownership.md への catalog 登録が未実施。lint_skills.ts は check_integrity.ts の categoryToCheckPattern 対象外のため、新規カテゴリ追加判定フロー（REQ-0145-005）の適用要否は未判断のまま。

## 推奨対応

catalog エントリ追加の要否を新規カテゴリ追加判定フローに従って判断し、必要なら integrity-rule-catalog.md / rule-ownership.md へ登録する。

## 関連

- Issue: #2179 (CLOSED), Epic: #2178
- PR: #2184 (Findings / Capture候補 セクション intake 2)
