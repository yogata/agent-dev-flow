#### DS-02: system.md（コマンド体系定義）から /agentdev/issue が完全に欠落
- **category**: 網羅欠落（生成・ライフサイクル・ドリフト）
- **target**: docs/designs/foundations/system.md（コマンド表 :28-66、IO 一覧 :112-134、個別節 :133-369）
- **evidence**: system.md 全体で `agentdev/issue` は 0 件（`issue` 言及も :186 の skill 依存リストのみ）。実コマンド .opencode/commands/agentdev/issue.md と accepted の commands/issue.md（REQ-049、updated 2026-09-19）が存在し、system.md は 2026-09-24 更新。他の 12 公開コマンド・内部 lifecycle 5 段階・/repo/docs-check は全て掲載され、パイプライン外の third-party-sync（:357）も掲載済み
- **severity**: medium / **confidence**: high
- **source_of_truth**: REQ-049（追跡Issue管理機構）、docs/designs/commands/issue.md、プロジェクト README のコマンド列挙
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 意図的スコープ除外を示す記述（適用範囲宣言 :416-420 等）は発見できず。除外意図の文書化欠如自体が問題

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: なし
- 後続: backlog-review による RU 化
