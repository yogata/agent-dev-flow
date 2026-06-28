---
status: accepted
---

# IR-052: 完了条件 grep パターン設計（REQ-0145-011）

| Field | Value |
|-------|-------|
| rule_id | IR-052 |
| description | 完了条件 grep パターン（機械的 checkbox 検出、`- [ ]` / `- [x]` カウント）は、否定文脈、anti-pattern 例示を「未達」として捕捉しないこと（REQ-0145-011）。本ルールは grep ベース検出を実装する際の設計基準であり、現在の QG-4 完了条件評価は推論ベース（case-close Step 4）であるため、grep 実装追加時に適用する |
| severity | observation |
| category | integrity-rule-gap |
| detection_method | 設計基準ルール（実装時の静的レビュー）。grep ベース checkbox 検出を実装する場合、除外条件、スコープ段階化をコードレビューで確認 |
| affected_artifacts | [case-close, case-auto, quality-gates] |
| related_req | [REQ-0145-011] |
| related_spec | [integrity-contracts.md, quality-gates.md] |
| gate_level | full-audit |
| false_positive_risk | 高。現在実装なし。grep 実装時に否定文脈除外、anti-pattern 例示除外を誤ると true negative を取りこぼす |
| regression_test | (grep 実装追加時) |
| baseline_status | new |
| finding_route | none |
| triage_action | grep ベース完了条件検出を実装する際、本ルールの設計基準（除外条件、スコープ段階化）を満たすこと |
| last_verified | 2026-06-22 |

## IR-052 設計基準（REQ-0145-011）

grep ベースの完了条件 checkbox 検出（`- [ ]` / `- [x]`）を実装する場合、以下の除外条件、スコープ段階化を満たすこと:

| 除外条件 | 対象例 | 理由 |
|----------|--------|------|
| 否定文脈 | 「〜を含めない」「〜以外」「〜を禁止」 | 否定表現は未達ではなく要件の一部 |
| anti-pattern 例示 | 「次のように書かないこと: `- [ ] X`」 | 例示は未達ではなく説明 |
| コードブロック内 | ` ``` ` で囲まれた領域 | 例示、テンプレートは未達ではなく記述 |
| 引用、メタ文 | 「Issue 本文に `- [ ]` が含まれる」 | メタ記述は未達ではなく説明 |

スコープ段階化:
1. Issue 本文の完了条件セクション（`## 完了条件` 配下）のみを対象
2. 上記除外条件を適用後、残った `- [ ]` を未達として報告
3. `- [x]` は達成済みとして扱い、未達カウントから除外

現在の QG-4 完了条件評価は推論ベース（case-close Step 4、agent が各 checkbox の達成を意味判断）。
grep ベース実装は推論ベースを置き換えるのではなく、補助的機械検出として追加する場合に本基準を適用する。
