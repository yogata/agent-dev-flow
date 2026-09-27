# intake: case-open 隔離検査（REQ-030-017）手順への merge-base 起点差分確認の明記

- 観測日: 2026-09-28
- 観測元: case-open #3192（Root Case Issue #3192、Definition PR #3195）自工程 deviation capture
- 種別: 手順補完要求（reference 手順の恒久補正）

## 要求内容

`agentdev-workflow-case-open` reference `definition-pr-and-idempotency.md` の「並行 case-open の PR 作成前隔離検査（REQ-030-017）」手順1 は `git diff --stat origin/main HEAD` による自 Case 差分検査を定めるが、並行 case-open 中に兄弟 Case が origin/main へ先行 push した場合、diff に origin/main 側変更の逆差分（非自 Case パス）が現れ、手順の期待（自 Case 分のみ）と直接一致しない。

## 提案する補正

手順1 に次を併記する:

- スタック構造判定: `git merge-base origin/main HEAD` と HEAD 親 commit の一致確認
- 自 Case 差分の機械確認: `git diff --stat <merge-base> HEAD` を起点とする突合（origin/main 直指定 diff は先行 commit 分の逆差分を含むため単独では判定に使えない）

## 根拠

- Root Case #3192 の case-open 実行（2026-09-28）で実観測。兄弟 Case 由来の capture learning commit（b14e1ce8）が origin/main 先行し、`diff --stat origin/main HEAD` に `.agentdev/learning/inbox.md` -16 行が表示された
- merge-base 起点の確認により救済不要と正しく判定できたが、手順が明示していないため実行者の解釈に依存する
- 関連 learning: `.agentdev/learning/inbox.md`「REQ-030-017 隔離検査の git diff --stat origin/main HEAD は並行 case-open の origin/main 先行進行で非自 Case 差分を含む」
