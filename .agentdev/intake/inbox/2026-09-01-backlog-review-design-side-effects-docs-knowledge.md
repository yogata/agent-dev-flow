# backlog-review Design 副作用節への docs/knowledge/ 永続化対象の反映候補

## 観測

backlog-review Design（docs/designs/commands/backlog-review.md、上流保存済み）の「副作用」節が「git commit/push: `.agentdev/` 配下」に限定しており、docs/knowledge/ 配下への知識文書書き込みと、git 永続化対象への docs/knowledge/ 明示パスステージングの追加が未反映。実装側（agentdev-workflow-backlog-review の contradiction-ru-and-persistence.md STEP-8）では docs/knowledge/ を差分確認・明示パスステージングの対象として実装済み。

## 影響

Design（正本）と実装（workflow 実装本体）の間に副作用範囲の記述差異が残存する。次回 Design 更新時に反映しないまま放置すると、docs/knowledge/ への書き込みが Design 契約上の副作用記述と整合しなくなる。

## レビューで決めること

- backlog-review Design の「副作用」節への docs/knowledge/ 書き込みと git 永続化対象の追加の要否

## 根拠

- PR #2502 本文「Design確定候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2502 ）
