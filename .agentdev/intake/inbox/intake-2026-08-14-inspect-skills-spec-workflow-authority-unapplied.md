# intake: inspect-skills Command SPEC の Workflow Skill 権威宣言が Stage-0 commit d28d6b34 未適用

## 発生日

2026-08-14

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2110（Issue 2100、OU-000 current-state inventory）の Findings / Capture候補 セクション

## 問題事象

inspect-skills の Command SPEC（`docs/specs/commands/inspect-skills.md`）のみ、Stage-0 commit `d28d6b34` による Workflow Skill 権威宣言（専用 Workflow Skill `agentdev-workflow-inspect-skills` への dispatch 記述）が未適用のまま残っている。16 Command 中15件は専用宣言を持つが、inspect-skills のみ専用宣言なし（`agentdev-workflow-inspect-skills` 参照ゼロ）。

## 影響

- Command SPEC による専用 Workflow Skill 権威宣言の網羅が 15/16 となり、thin Command SPEC 化の整合が1件欠けた状態
- remediation の OU-002 以降（inspect 3 Command Workflow Skill 移行、OU-005 の 16 Command SPEC 同期）の移行対象リストから漏れるリスク

## 発生局面

検証（OU-000 現状マトリクス作成）

## 検知方法

全16 Command の Command SPEC における専用 Workflow Skill 宣言有無の突合（worktree HEAD `5c65709e` 時点）。

## 想定される対応方向

- `docs/specs/commands/inspect-skills.md` に他15 Command と同一形式の Workflow Skill 権威宣言を適用する（Stage-0 commit `d28d6b34` の内容の追適用）
- 本 remediation Epic 2099 内（OU-004 inspect 3 Command 移行、または OU-005 SPEC 同期）で処理するのが妥当（PR 本文 Findings の分類も intake（remediation OU-002 以降の移行対象リストへの追加候補、本 Epic 内で処理））

## 関連

- Epic: #2099
- Issue: 2100（OU-000）, PR: 2110
- 対象文書: `docs/specs/commands/inspect-skills.md`
- 移行先 Skill: `agentdev-workflow-inspect-skills`（未実在、OU-004 で Workflow Skill 化予定）
- 未適用元: Stage-0 commit `d28d6b34`

## 出典引用

PR 2110 本文 Findings / Capture候補（intake）より:

> inspect-skills の Command SPEC のみ Stage-0 commit `d28d6b34`（Workflow Skill 権威宣言の追加）が未適用（専用宣言なし、`agentdev-workflow-inspect-skills` 参照ゼロ）。発見元: Issue #2100 現状マトリクス作成。分類: intake（remediation OU-002 以降の移行対象リストへの追加候補。本 Epic 内で処理するのが妥当）

## タグ

#intake #spec-sync #inspect-skills #workflow-skill-declaration #epic-2099
