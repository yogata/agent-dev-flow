# agentdev-learning-pipeline promote-judgment-logic.md が REQ-038-002 自律確定原則に未追従（旧「自動確定禁止」文言が残存）

## 観測

`src/opencode/skills/agentdev-learning-pipeline/references/promote-judgment-logic.md` 97行目「自動確定禁止: AI 単独で promote/ prune の最終確定を行ってはならない」が、REQ-038-002（learning-promote 最終確定の自律確定原則準拠、Issue #2290 で確定済み）と正面から矛盾する。同ファイル Phase 5「HITL承認」の全クラスタ提示・承認手順も旧原則のまま残存している。learning-promote Workflow Skill の STEP-5 は「提示形式、承認フローは agentdev-learning-pipeline の公開操作契約に従う」と参照しており、Workflow Skill（自律確定実装済み）と Capability Skill（旧原則）の指示が衝突する状態になっている。

## 今回扱わない理由

Issue #2294（learning-promote 自律確定実装）の対象範囲は agentdev-workflow-learning-promote 配下と command 定義であり、Capability Skill（agentdev-learning-pipeline）側のファイルは対象外。PR #2336 では変更せず、Capability Skill 側の追従を backlog 検討に回すことが提案された。

## 影響

learning-promote 実行時に Workflow Skill と Capability Skill の指示が衝突し、HITL 承認フローの解釈が不定になる（自律確定 item が HITL 待ちに戻る、または参照優先で判断が揺れる）。

## レビューで決めること

- promote-judgment-logic.md の「自動確定禁止」・Phase 5 全クラスタ提示手順を REQ-038-002 と横断契約SPEC 詳細判定表（docs/specs/workflows/workflow-contracts.md「promote系判断確定とHITL境界」）参照へ書き換える追従変更を実施するか

## 根拠

- PR #2336 本文「Findings / Capture候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2336）
- 矛盾先要件: REQ-038-002/003（Issue #2290、PR #2324 で適用確定済み）
