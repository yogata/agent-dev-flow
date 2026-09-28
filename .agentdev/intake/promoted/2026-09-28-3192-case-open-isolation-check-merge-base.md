# case-open 隔離検査（REQ-030-017）手順への merge-base 起点差分確認の明記

- 元 item: .agentdev/intake/inbox/2026-09-28-3192-case-open-isolation-check-merge-base.md
- 観測元: case-open #3192（Root Case #3192・Definition PR #3195）自工程 deviation capture
- 対象: src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md「並行 case-open の PR 作成前隔離検査」手順1（:51）

## 課題

現行手順1 は `git merge-base origin/main HEAD` と `git diff --stat origin/main HEAD` を併記するが、差分の解釈規律を明示しない。並行 case-open 中に兄弟 Case が origin/main へ先行 push した場合、`diff --stat origin/main HEAD` に origin/main 側変更の逆差分（非自 Case パス）が現れ、手順の期待（自 Case 分のみ）と直接一致しない（実観測: 兄弟 Case の capture learning commit b14e1ce8 由来で `.agentdev/learning/inbox.md` -16 行が表示）。

## 要求される補記

- スタック構造判定: merge-base と HEAD 親 commit の一致確認
- 自 Case 差分の機械確認: `git diff --stat <merge-base> HEAD` を起点とする突合（origin/main 直指定 diff は先行 commit 分の逆差分を含むため単独では判定に使えない）

## 既存要件との関連

- REQ-030-017（隔離検査）の実行手順補完。要件行変更は不要と推定（要否は req-define 判断）。
- 対になる learning エントリ（learning inbox「REQ-030-017 隔離検査の git diff --stat origin/main HEAD は…」）は本 intake 経由での修正を明示済み。修正は本成果物経由で単一化すること。

## route 提示（backlog-review 判断用）

- workflow reference（case-open definition-pr-and-idempotency.md 手順1）への補記。小規模 docs/配布物修正 Case として実行。
