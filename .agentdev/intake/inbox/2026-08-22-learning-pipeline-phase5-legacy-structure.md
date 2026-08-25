# promote-judgment-logic.md Phase 5 周辺の旧構造記述（L81 旧 Step 番号参照）

## 観測

agentdev-learning-pipeline の references/promote-judgment-logic.md Phase 5 周辺記述が旧構造のままである。

- L81 に旧 Step 番号参照「Step 10 ユーザー承認」が残存
- 判定結果提示の手続き詳細も旧構造の記述のまま

## 今回扱わない理由

Issue #2379（OU-001）は AG-006(h) の旧「自動確定禁止」文言是正のみを対象とし、RU-0005 残り（AG-006(a)〜(g)）は OU-004（Issue #2382、Wave 2）が担当する。case-close の capture 責務は回収・保存のみである。

## 影響

learning-promote 実行時において Phase 5 周辺の参照解釈が新旧構造の混在で不安定になる恐れがある。

## レビューで決めること

- Phase 5 周辺記述（旧 Step 番号参照、判定結果提示の手続き詳細）の REQ-038-002 自律確定構造への整理を OU-004（Issue #2382）のスコープに含めるか

## 根拠

- PR #2389 本文「Findings / Capture候補」intake 1（回収元: https://github.com/yogata/agent-dev-flow/pull/2389 ）
- src/opencode/skills/agentdev-learning-pipeline/references/promote-judgment-logic.md L81 周辺
