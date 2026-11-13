# Definition Package の旧配置参照パス（scripts/src/ 配下）の更新候補

## 観測事実

- Epic 4026 Wave 2（PR 4040、Issue 4034 対応）の本文 Findings で、Issue 記載パス `scripts/src/check_workflow_preventive.ts` / `scripts/src/lint_skills.ts` が旧配置参照（現行は `.opencode/skills/repo-agentdev-integrity/scripts/` 配下）であることが申告された。検索で発見可能なため実害はないが、Definition 側（Issue 本文・Design 文面）の参照パスが実配置と乖離している。
- 同種の旧配置参照（`scripts/src/` 配下の機械工程 script 群への言及）は case-close workflow skill の references（epic-wave-close.md 等）にも確認されており、2026-11-13 時点で当該 script はリポジトリに存在しない。

## 具体的な修正対象

- Issue/Design/Skill 文面中の `scripts/src/` 旧配置参照を実配置（`.opencode/skills/repo-agentdev-integrity/scripts/` 等）へ更新する。存在しない機械工程 script（close_mechanical_steps.ts、final-acceptance.ts、record-comments.ts 等）への参照は、実在する等価手続または削除の判断材料として精査する。
- 精査は inspect-skills（参照有効性診断）・inspect-docs 経由の機械診断で列挙できる候補。

## 関連

- Epic 4026・PR 4040 本文 Findings / Capture候補（Issue 4034 対応）
- agentdev-workflow-case-close skill references（scripts/src/ 参照の実在性）
