# DEC-036 旧二分法語彙の現行規範残存 2 箇所の処置を判断する

統合元: 2026-10-07-case-3535-old-vocabulary-residual-ra004.md

## 観測内容

Wave 2-3（Issue 3535・RA-003）の実行で検出された旧語彙残存候補のうち、2026-10-08 時点で処置対象として残る 2 箇所（実測確認済み）:

1. docs/designs/authoring/command-file-format.md:40 — 「workflow dispatch 先および委譲先 skill の責務分類（semantic 担当 / deterministic 委譲先 / 知識提供）は DEC-036 の分類と ../workflows/workflow-skill-model.md の機械分類規則に従う」。DEC-036 帰属語彙（semantic 担当 / deterministic 委譲先）を括弧内再掲したまま、v4-responsibility-boundaries「v4 責務分類語彙の後継」節への後継参照を持たない。inspect-docs F-09 が同一箇所を検出済み
2. docs/requirements/REQ-027.md:17 — 「Capability Skill の責務分類は workflow-skill-model Design の機械分類規則と DEC-036 の分類（semantic 担当 / deterministic 委譲先 / 知識提供）に従う」。旧語彙 3 区分を現行規範として再掲。参照先の workflow-skill-model.md 自身（:168）は「語彙正典は DEC-048 と v4-responsibility-boundaries『v4 責務分類語彙の後継』節が所有し、本節は再掲しない」と宣言済みであり、REQ-027:17 は参照先 Design の現行記述とも不整合

処置対象外（正当化済み）: docs/designs/foundations/v3-v4-crosswalk.md:25-29 は「『semantic Skill』『deterministic code/tool』は DEC-036 決定(1) 時点の帰属語彙であり、処遇記録の実行時点語彙を保持する（REQ-103-020）。現行語彙の後継は v4-responsibility-boundaries Design を参照する」との歴史注記・後継参照付きであり、REQ-103-020（歴史記述保持）により保持が正当化された歴史記録である。

## 影響

v4-responsibility-boundaries.md:169「旧語彙（semantic 6 項目・deterministic 11 項目）を正典参照として残存させない。skill Design 3区分節の語彙移行は RA-004 が担う」に対する RA-004（Wave 2-4）の追随漏れが現行 2 箇所に残る。Epic #3530 完了条件「旧語彙の現行規範としての使用が 0 件」の到達前状態として、後続の語彙検出（TS-013 網羅検索等）で毎回由来分類の説明が必要になる。

## 課題（backlog-review → req-define 向け）

1. command-file-format.md:40 を v4-responsibility-boundaries「v4 責務分類語彙の後継」節への参照へ置き換える（F-09 と同一処置。backlog-review で F-09 と統合すること）
2. REQ-027.md:17 の DEC-036 3 区分再掲を解消し、workflow-skill-model Design の機械分類規則と v4 後継節の参照へ置き換える REQ 変更要否を判断する（本箇所は inspect 検出事項に含まれず intake 側のみが保持）

## 既存成果物との関連

- inspect-docs F-09（command-file-format.md:40 旧責務分類語彙・DEC-036 参照残存）と backlog-review で統合する。F-09 は本件 2 箇所のうち 1 箇所のみをカバーし、REQ-027.md:17 は intake 側固有の検出である
- F-09 の evidence「本行のみ旧語彙 3 区分を再掲し後継参照がない」は「workflow-skill-model.md 機械分類規則への併記参照はあるが v4-responsibility-boundaries 後継節への参照がない」が正確（backlog-review での F-09 添削材料）

## 元 observation（参照）

- https://github.com/yogata/agent-dev-flow/pull/3541（Wave 2-3・Issue 3535・RA-003 Findings）
