# Plan: Issue #320 — 関連スキル・報告フォーマット更新

## 対象

- [ ] `.opencode/skills/agentdev-epic-tracker/SKILL.md` — Wave一括更新セクション拡充
- [ ] `.opencode/skills/agentdev-workflow-reporting/SKILL.md` — Epic Orchestrator完了報告参照追加
- [ ] `.opencode/skills/agentdev-workflow-reporting/reference/completion-reports.md` — Epic Orchestrator完了報告フォーマット追加 + case-open Epic フォーマット更新
- [ ] `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_epic.md` — 確認のみ（#318で更新済み、変更不要見込み）

## 変更内容

### 変更1: epic-tracker/SKILL.md

- 「多重Issueモード」セクションを拡充:
  - Wave開始時一括更新（☐ 未着手 → 🔄 進行中）の詳細手順
  - Wave完了時ステータス更新（成功: 🔄 進行中 → ✅ 完了, 失敗時の対応）
  - べき等性ルール
  - 親エージェント責務の明記（REQ-0020-013）

### 変更2: workflow-reporting/SKILL.md

- 対象コマンドテーブルに Epic Orchestrator モード行を追加
- reference/ 構成一覧テーブルに Epic Orchestrator フォーマット追記
- See Also に workflow-orchestration 追加

### 変更3: completion-reports.md

- Epic Orchestrator 集約完了報告フォーマット追加（workflow-orchestration SKILL.md と整合）
- case-open Epic作成時フォーマット更新（REQ-0020-006: 次のステップを `/agentdev/case-run {epic_N}` に変更）

### 変更4: issue_desc_epic.md

- 確認結果: #318 で `## 実行順序` セクション追加済み。変更不要。

## 完了条件

- [x] epic-tracker が Wave一括更新に対応
- [x] workflow-reporting が Orchestrator完了報告を参照
- [x] completion-reports.md に Epic Orchestrator完了報告フォーマットが追加
- [x] 既存フォーマットに影響なし
