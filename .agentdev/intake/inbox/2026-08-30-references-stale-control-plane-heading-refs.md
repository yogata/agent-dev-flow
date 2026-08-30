# references/ 配下に親 SKILL.md の旧見出し名「Control Plane」を参照する記述が複数残留

## 観測

配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で Workflow Skill の SKILL.md 側見出しを「制御平面（STEP 一覧）」等へ日本語化した結果、references/ 配下の親 SKILL.md 参照が旧見出し名「Control Plane」のままで参照語彙が追随していない状態が残った。

- `agentdev-workflow-case-auto/references/stop-and-decision-resolution.md`
- `agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md`
- `agentdev-workflow-case-auto/references/conflict-resolution-and-reporting.md`
- `agentdev-workflow-backlog-review/references/`
- `agentdev-workflow-backlog-auto/references/stage-execution.md`

references/ は REQ-053-013 履行の対象外（RU 確認対象外ファイル）のため本件では未是正。

## 影響

- 親 SKILL.md の見出し名と references 側参照語彙の不整合が継続する
- 次に同種の見出し語日本語化を行う場合も同型の追随漏れが発生する

## レビューで決めること

- references/ 配下の参照語彙追随更新を横断是正 Case として実施するか
- 見出し語の日本語化と参照先用語追随の順序規約を workflow 側へ組み込むか

## 根拠

- PR #2484 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
