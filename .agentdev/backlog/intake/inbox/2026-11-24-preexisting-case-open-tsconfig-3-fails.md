---
id: 2026-11-24-preexisting-case-open-tsconfig-3-fails
created_at: 2026-11-25T00:07:00+09:00
source: case-close (Issue #4214 の残る事柄の登録。利用者の判断 2026-11-24: 案A)
status: unreviewed
---

# case-open スキル内の scripts の構成で型検査の 3 件の不合格が基準からある

- **課題**: `bunx tsc --noEmit -p src/common/skills/agentdev-workflow-case-open/scripts/tsconfig.json` (case-open スキル内の scripts の構成) で 3 件の型検査の不合格が基準 `022ce20f7` からある。PR #4216 の前後で失敗の名前は同一であり、PR #4216 由来の増分はない
- **期待する処分**: 19 件のインストーラー試験の別案件 (`2026-11-24-preexisting-installer-test-failures`) と併せて、調査と是正を扱う
- **出典**: Issue #4214 の最終処理 (2026-11-24) での監督の検証
- **実証根拠**: 基準 `022ce20f7` と最終コミット `2f8da21cd` と統合後の状態で、次の 3 件が出力として同一であることを監督が確認した (基準の出力と統合後の出力が完全に一致)
  - `src/common/skills/agentdev-workflow-case-open/scripts/lib/status_summary.ts(310,10)`: error TS2304: Cannot find name 'runGitOk'.
  - `src/common/skills/agentdev-workflow-case-open/scripts/src/collect_status_summary.ts(125,30)`: error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  - `src/common/skills/agentdev-workflow-case-open/scripts/src/collect_status_summary.ts(126,28)`: error TS2345: (同じ内容)
