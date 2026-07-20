# ng-baseline 広範囲取込: 既存未管理NG（mapping-table-completeness 等）の実修復検討

## 問題事象

PR #1634（retired 文書物理削除）に付随して `.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json` を更新した際、retired 削除由来の新規 NG 95件（broken-req-ref 71件、broken-adr-ref 22件、adr-req-crossref 11件、adr-readme-index 1件）に加え、既存未管理 NG（runtime-unresolved-reference、mapping-table-completeness 58件等）も一括で baseline に取り込まれた。本来は retired 由来のみを精密に取り込むべきだが、`--update-ng-baseline` が全体再生成方式のため広範囲になった。

## 発生局面

実装（PR #1634 retired 文書物理削除、IR-055 baseline 更新）

## 検知方法

case-run 実行担当サブエージェントが ng-baseline 更新時の diff を確認し、retired 由来以外の既存 NG も含まれていることを検知。

## 根本原因

`--update-ng-baseline` は全体再生成方式であり、現状の全 NG を再列挙して baseline 化する。そのため「特定由来（retired 削除等）」のみを精密に取り込むことができず、既存未管理 NG も巻き込んで baseline に取り込まれる。

## 提案内容

フォローアップとして既存未管理 NG（特に mapping-table-completeness 58件）の実修復を検討する。具体案:

- mapping-table-completeness 58件の実修復（mapping-table.md のカバレッジ欠損解消）
- runtime-unresolved-reference の実修復
- `--update-ng-baseline` を「由来ラベル付き差分追加」方式へ改修し、将来の広範囲取込を予防
- baseline に取り込まれた既存未管理 NG を「要修復」として別途トラッキング

## 対象ファイル

- `.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json`
- `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（`--update-ng-baseline` 改修時）
- `docs/requirements/mapping-table.md`（mapping-table-completeness 実修復時）

## 参照

- PR #1634, Issue #1633, IR-055 baseline 運用

## 分類

具体的な修正候補（ng-baseline 運用改善 + 既存未管理 NG の実修復）

## 優先度

medium（baseline 運用の精密化は IR-055 運用改善の一環。mapping-table-completeness 58件は別途 inspect/docs-check で扱う候補）
