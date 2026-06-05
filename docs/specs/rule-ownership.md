# Rule Ownership Matrix

各 rule domain と責任 REQ/SPEC の対応を示す（REQ-0103-058）。12 以上の rule domain をカバーする。

## Rule Domain 一覧

| # | Domain | Canonical REQ | Canonical SPEC | 補足 |
|---|--------|--------------|----------------|------|
| 1 | Command frontmatter | REQ-0103 (015, 044) | artifact-contracts.md | description + agent のみ |
| 2 | Skill frontmatter | REQ-0103 (012, 013) | artifact-contracts.md | name + description |
| 3 | Command 行数上限 | REQ-0103 (022-024) | quality-specs.md | 100行目標・150行上限・200行超禁止 |
| 4 | Skill 行数上限 | REQ-0103 (037) | quality-specs.md | 200行超で分割候補報告 |
| 5 | Template 配置 | REQ-0103 (005, 046) | artifact-contracts.md | command-local template 配置規約 |
| 6 | Script 配置 | REQ-0103 (006, 014) | artifact-contracts.md | skill scripts/ 配下 |
| 7 | Namespace 予約 | REQ-0103 (009, 056) | system.md | agentdev / agentdev-* 予約 |
| 8 | References 正規化 | REQ-0103 (013, 039) | — | references/ が canonical、reference/ は obsolete |
| 9 | Progressive disclosure | REQ-0103 (035, 036) | — | SKILL.md 入口 + references/ 詳細 |
| 10 | 完了報告フォーマット | REQ-0103 (046), REQ-0107 (013, 022) | artifact-contracts.md | variant 別管理 |
| 11 | 共通処理集約 | REQ-0103 (040-043) | — | Git 同期等の共通化 |
| 12 | Source/projection 分離 | REQ-0103 (048-055) | system.md | src/opencode/ source + .opencode/ projection |
| 13 | Integrity 検査カテゴリ | REQ-0108 (001-021) | integrity-contracts.md | 18 集合・strict/heuristic/observation |
| 14 | Finding 分類 | REQ-0108 (017, 018) | integrity-contracts.md | 6 category + route |
| 15 | Frontmatter dev metadata 禁止 | REQ-0108 (022-024, 095-098) | integrity-contracts.md | implementation_pattern/load_skills 等禁止 |
| 16 | Retired REQ 管理 | REQ-0108 (070-088) | integrity-contracts.md | mapping-table・注記・参照区別 |
| 17 | Link 整合性 | REQ-0108 (013) | integrity-contracts.md | Markdown link 先存在確認 |
| 18 | Namespace legacy 残存 | REQ-0108 (016) | integrity-contracts.md | 旧コマンド名・旧パス検出 |
| 19 | REQ/ADR 相互参照 | REQ-0108 (005) | integrity-contracts.md | 双方向参照確認 |
| 20 | Authoring DoD | REQ-0108 (060-064) | quality-specs.md | 行数・Steps・共通化・canonical path |

## 重複ルールの解消状況

以下の rule は複数 REQ 間で重複していたが、本 matrix で canonical owner を明確化:

| 重複ルール | 旧参照箇所 | Canonical owner | 状態 |
|-----------|-----------|----------------|------|
| Frontmatter 許可フィールド | REQ-0103-044, REQ-0108-046/098 | REQ-0103-044 (primary) | ✅ |
| references/ 正規化 | REQ-0103-013/039, REQ-0108-039/040/094 | REQ-0103-013 (primary) | ✅ |
| Template 配置規約 | REQ-0103-005/046, REQ-0107-013/022, REQ-0108-042/075 | REQ-0103-005 (primary) | ✅ |
| Namespace 予約 | REQ-0103-009/056, REQ-0108-016 | REQ-0103-009 (primary) | ✅ |
| Dev metadata 禁止 | REQ-0103-015/020, REQ-0108-022/095 | REQ-0103-015 (primary) | ✅ |
