# .agentdev/extensions/skills/agentdev-workflow-case-auto.yaml の REQ-006-112 旧番号参照現行化

## 観測

.agentdev/extensions/skills/agentdev-workflow-case-auto.yaml:25 に REQ-006-112 の旧番号参照が dangling 状態で残存する。IR-055 baseline-known（issue-2383-ir067-initial-baseline）として記録済み。

## 今回扱わない理由

OU-001 の対象範囲は docs/** と src/opencode/** であり、.agentdev/extensions/** は対象外。

## 影響

extensions YAML の参照が旧番号のまま残存する（baseline 登録済みのため検査 fail にはならない）。

## レビューで決めること

- REQ-006-112 旧番号の現行所有行への付け替え先の特定と適用

## 根拠

- PR #2525 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2525 ）
