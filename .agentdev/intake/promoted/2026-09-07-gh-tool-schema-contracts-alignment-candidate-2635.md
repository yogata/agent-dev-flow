# agentdev_gh Tool 表示スキーマと契約型の整合改善

## 観測内容
PR #2646（Issue #2635）の Capture で、Custom Tool の表示スキーマと `contracts.ts` の `issue_list`（labels/search）および `issue_create`（labels 必須性）の記述差分が記録された。

## 影響
呼出可能な値や必須引数の誤認により、利用者が invalid input や呼出失敗に遭遇する可能性がある。

## 課題
`GhToolRequest` と表示側の description/parameter 定義を突合し、issue_list の role 単位制約、labels/search の扱い、issue_create の `labels: []` 明示要件を整合させる。Tool 実装の READ-ONLY 境界も確認する。

## 既存要件・正規成果物との関連
Issue #2635、PR #2646（0a7d30d7）、`src/opencode/tools/agentdev-gh/contracts.ts`。
