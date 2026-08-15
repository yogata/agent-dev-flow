# inspect-skills Command SPEC の Workflow Skill 権威宣言未適用

## 観測内容

inspect-skills の Command SPEC のみ、Stage-0 commit d28d6b34 による Workflow Skill 権威宣言が未適用のまま残っている。16 Command 中15件が専用宣言を持つ中で、inspect-skills のみ専用宣言なしの状態。

## 影響

- thin Command SPEC 化の整合が1件欠けており、remediation の移行対象リストから漏れるリスクがある
- 他15 Command と宣言形式が不揃いになる

## 課題

docs/specs/commands/inspect-skills.md に他15 Command と同一形式の Workflow Skill 権威宣言（Stage-0 commit d28d6b34 相当）を追適用する。

## 既存要件・成果物との関連

- 対象: docs/specs/commands/inspect-skills.md
- 関連: Stage-0 commit d28d6b34、thin Command SPEC 化

## 出典

- 発生日: 2026-08-14
- 取得元: Stage-0 適用状況確認の観測
- 元 item: intake-2026-08-14-inspect-skills-spec-workflow-authority-unapplied.md
- 注記: 経路C review で現行ファイル L45 に Workflow Skill（agentdev-workflow-inspect-skills）への言及があることが確認されている。専用宣言形式との突合は実装時に再確認すること
