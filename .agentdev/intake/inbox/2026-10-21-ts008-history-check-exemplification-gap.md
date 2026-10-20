# 2026-10-21 TS-008 の履歴検査不能例示と git 実挙動の乖離（REQ-039-007 関連文言見直し候補）

## 内容

- Issue #3823 完了条件 TS-008 は「履歴なし・検査手段が失敗する条件」を履歴検査不能の例とするが、実挙動は git リポジトリかつコミット 0 の場合 `git log --all` が exit=0・空出力となり、使用済み集合が空の検査成功（次の未使用番号の提案が正当）として成立し、履歴検査不能に該当しない
- fail-closed 条件の正確な定義（検査手段の失敗時: 非 git、権限欠如、git 破損等）は `src/common/skills/agentdev-backlog-integration/references/integration-judgment.md`「履歴検査不能時の fail-closed」側が正であり、REQ-039-007 行・test strategy 文言側の例示修正を req-define 経由の候補とする

## 根拠

- 観測元: PR #3825 本文「## Findings / Capture候補」セクション 1 件目（intake 候補）
- 実測証跡: case-run（DEL-3823-2）TS-008 実測。非 git 条件で exit=128 → fail-closed を観測、コミット 0 条件で exit=0・空出力 → 検査成功を観測
- 手続正: case-ready 受理済みの integration-judgment.md 規定（本 PR では手続正に従い処置済み。文言乖離の是正は未処置）

---
