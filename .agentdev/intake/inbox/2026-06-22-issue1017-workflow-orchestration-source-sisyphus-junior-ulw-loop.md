# workflow-orchestration SKILL.md (source版) の Sisyphus-Junior(ulw-loop) 誤分類

## 観測

PR #1022 (Issue #1017) で `docs/specs/skills/agentdev-workflow-orchestration.md`（SPEC 版）の誤分類は修正したが、source 版 `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`（L8 description）に同じ `Sisyphus-Junior(ulw-loop)` 表記が1箇所残存することを検出した。SPEC 版と source 版の同一記述が一部未追従。

## 影響

- source 版 SKILL.md の description は `/help` 等でユーザに提示される可能性が高く、誤分類表記が継続露出するリスクがある。
- SPEC 版（`docs/specs/skills/agentdev-workflow-orchestration.md`）と source 版（`src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`）の同期が部分的に崩れる。SPEC↔source 同期ルールの遵守観点で要対応。

## レビューで決めること

- source 版 SKILL.md L8 を `Sisyphus-Junior(ulw-loop)` → `Sisyphus-Junior` に修正するバグ修正 Issue を起票するか（F-1 と同一 Issue でまとめるか別 Issue とするか）。
- SPEC↔source 同期の自動検査を強化するか（`docs/specs/skills/` と `src/opencode/skills/` の description 突き合わせ等）。
- 予防措置として `Sisyphus-Junior\(ulw-loop\)` パターン grep を恒久ルール化するか（F-1 と同根）。

## 根拠

- PR #1022: https://github.com/yogata/agent-dev-flow/pull/1022（Findings / Capture候補 F-2）
- Issue #1017: https://github.com/yogata/agent-dev-flow/issues/1017（本 PR の対象は SPEC 版のみ）
- 対象: `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` L8
- 関連 SPEC: `docs/specs/skills/agentdev-workflow-orchestration.md`（本 PR で修正済み）
- 後続 Epic: OU-002（文書責務境界の抜本修正）の候補対象
