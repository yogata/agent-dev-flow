# 整合性スクリプト pre-existing failures + Epic #828 後の新規不整合リスク

## 観測

3整合性スクリプトが全て exit 1 する（REQ-0124-019 未達）。元々 pre-existing failures だったが、Epic #828 の大規模REQ/SPEC/skill再編により新規不整合が追加されている可能性が高い。

### 元の pre-existing failures

| スクリプト | 結果 | 詳細 |
|---|---|---|
| `lint_skills.ts` | exit 1 | 5 NG は全て `repo-agentdev-integrity` の See Also 参照 |
| `check_templates.ts` | exit 1 | NG は `issue_desc_child.md` / `pr_desc.md` の marker |
| `check_integrity.ts` | exit 1 | NG は `repo-agentdev-integrity` skill-category-gap + command-capture-duty |

### Epic #828 後の追加リスク

Epic #828 で以下の構造変化が発生。整合性ルールの追従状況は未検証:

- **新規REQ 7件**: REQ-0125〜REQ-0133（REQ-0125/0126: inspect-skills/promote, REQ-0127〜0133: command REQ分割）
- **退役REQ 7件**: REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121（+ REQ-0106 の一部）
- **新規skill 2件**: agentdev-quality-gates, agentdev-execution-backend
- **削除skill 1件**: agentdev-spec-compliance
- **新規ADR 1件**: ADR-0114 (accepted), **deprecated 1件**: ADR-0113

これらの変化に対し、以下の整合性検査項目が未更新の可能性:
- integrity rule catalog の REQ参照リスト
- req-impact-map の REQ対応表
- rule-ownership の skill/REQ対応
- vocabulary-registry の旧語彙検出ルール
- skill registry の品質ゲート・実行バックエンド skill登録

## 影響

- REQ-0124-019（3スクリプト exit 0）の完全達成には、pre-existing failures + Epic後の新規不整合の両方の解決が必要
- CI等で整合性スクリプトを利用する場合に失敗扱いとなる
- docs-check / integrity 検査の信頼性低下

## 課題

1. `repo-agentdev-integrity` See Also 参照の修正方針（5件）
2. `issue_desc_child.md` / `pr_desc.md` の template marker 修正方針
3. `repo-agentdev-integrity` skill-category-gap + command-capture-duty の解決方針
4. **Epic #828 後の新規不整合**: integrity rule catalog, req-impact-map, rule-ownership, vocabulary-registry, skill registry の更新要否確認
5. 新規REQ（0125〜0133）の catalog entry 追加
6. 退役REQ（0115〜0121）の catalog entry 削除/履歴化

## 既存要件との関連

- REQ-0124-019: 3整合性スクリプト exit 0（未達）
- REQ-0108: docs-check / Validation / Tests（検査責務）
- Epic #828: 本件の原因となる大規模構造変化を実施

## 根拠

- 発見元: Wave FINAL 検証（PR #811）
- 関連: PR #811, Epic #805, 子Issue #810, REQ-0124-019, Epic #828（構造変化源）
