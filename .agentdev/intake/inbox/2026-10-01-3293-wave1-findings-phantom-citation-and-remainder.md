# intake: REQ-003-055 phantom citation（v4-responsibility-boundaries.md・REQ-003.md）他、docs整合Case #3293 Wave 1 検出分

- 観測元: Root Case #3293（docs-current-model-alignment-and-compression-foundation）Wave 1 case-close（PR #3305/#3306/#3307）
- 記録日: 2026-10-01

## 発見事象

1. **REQ-003-055 phantom citation**: docs/designs/foundations/v4-responsibility-boundaries.md:44,:67、docs/requirements/REQ-003.md:56 に REQ-003-055 参照が残存するが、当該要件行は現存しない（main/worktree 同一検出・Case #3293 非起因）。check_integrity 8 new unmanaged NG のうち 3件の原因。
2. **REQ-032.md frontmatter updated (2026-09-29) ≠ last content-change commit date (2026-10-01)**（IR-072・2026-10-01 別 merge 起因。Definition PR #3294 が REQ-032 本文を更新した際に frontmatter updated が追随していない可能性）。
3. **横断残存 concrete 箇所（OU-0008 最終同期の TS-001 解消対象・参照情報）**:
   - src/opencode/skills/agentdev-workflow-case-run/SKILL.md L117・references/single.md L86（blocked 正規再開経路「新しい意味判断が必要な場合は req-define」）
   - src/opencode/skills/agentdev-workflow-case-revise/references/handoff-and-update.md（case-ready の Definition PR 受入フロー記述に旧語）
   - src/opencode/skills/agentdev-workflow-case-auto/SKILL.md 2箇所
   - ただし Wave 1 PR #3305/#3306 の修正後再検証で case-auto・case-revise・case-ready 系の対象残存は 0 件済み。上記は case-run 系（OU 割当外・RA-002 の残り）と OU-0008 最終同期での処理対象候補。
4. **REQ-061-021 に design 対応 0 件（traceability missing-design）**: base 95d32719 と同一状態で本 Case 非起因。Design 対応 sidecar 登録要否の確認候補。

## 修正対象候補

- 上記1は citation 付け替えまたは行参照の現行化
- 上記2は frontmatter updated の更新日時是正
- 上記3は OU-0008（Issue #3304）の最終同期で処理予定（本 intake は参照情報として記録）
- 上記4は sidecar 登録確認
