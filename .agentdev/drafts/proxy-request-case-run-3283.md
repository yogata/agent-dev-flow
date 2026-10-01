# proxy request: pr_create（Issue #3283・DEL-3283-1）

- 生成日時（JST）: 2026-10-01
- 生成元: case-run 実行担当サブエージェント（DEL-3283-1）。agentdev_gh pr_create が gh exit 66 で2回失敗（初回 + 追試行1回・反復リトライなし）したため、Case #3278 合意の外側 Supervisor write-proxy 運用へ切替
- 実装 commit は origin push 済み（git push は gh 障害の影響を受けない）: `91d0848954121af7a4469fbf91f47ce6908ed7f7`
- worktree: `C:\Users\ogatay\work\agent-dev-flow\.worktrees\3283-docs`（branch `docs/issue-3283`・clean）

## exact operation

- operation: `pr_create`（Custom Tool `agentdev_gh` と同一操作）
- title: `Wave 2: RA-001+RA-005 Workflow Skill 判断規則の新モデル適用と Jev 参照整理（Case #3278 OU-003）`
- base: `main`
- head: `docs/issue-3283`
- body: 同ディレクトリの `pr-body-3283.md` の全文をそのまま使用する（UTF-8 BOM なし）

## 事前条件（本 request 生成時に検証済み）

- 対象 PR 不在: `gh pr list --head docs/issue-3283 --json number` の件数 0件（gh CLI 読み取りは sanctioned 経路で確認済み）
- head branch 存在・origin push 済み: `origin/docs/issue-3283` = 実装 commit `91d0848954121af7a4469fbf91f47ce6908ed7f7`
- base との前提: base origin/main = `ec762dc5`（Wave 1 #3281 merge `a6954a6f` を含む）

## read-back 期待値（作成後の検証基準）

- state: `OPEN`
- head ref: `docs/issue-3283`・head sha = `91d0848954121af7a4469fbf91f47ce6908ed7f7`
- base ref: `main`
- changed files 数: 35（src/opencode/skills/** 26件 + traceability/*.yaml 9件）
- body セクション: 「実行識別情報」「概要」「RA-001」「RA-005」「トレーサビリティ」「adversarial-review 非発動記録」「検証差分」「Findings / Capture候補」「Design確定候補」「補足」を含むこと
- body 冒頭行: `Parent: #3280`
