# .agentdev/extensions/skills/agentdev-workflow-case-auto.yaml の REQ-006-112 旧番号参照現行化

## 観測内容

`.agentdev/extensions/skills/agentdev-workflow-case-auto.yaml` 25 行目に REQ-006-112 の旧番号参照が dangling 状態で残存する。IR-055 baseline-known（issue-2383-ir067-initial-baseline）として記録済み。

OU-001 の対象範囲は docs/** と src/opencode/** であり、.agentdev/extensions/** は対象外だった。

2026-09-03 現行確認: 同 yaml 25 行目に REQ-006-112 参照が残存していることを確認済み。

## 影響

extensions YAML の参照が旧番号のまま残存する（baseline 登録済みのため検査 fail にはならない）。

## 課題（レビューで決めること）

- REQ-006-112 旧番号の現行所有行への付け替え先の特定と適用

## 既存要件・契約との関連

- REQ-006（Case実行オーケストレーション）の番号再編（REQ-006-112 の現行所有行）、bounded parent decision resolution（DEC-008、REQ-034-032〜034）の decision_context 正規診断文脈（当該行の purpose 記載と関連）。

## 根拠

- PR #2525 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2525 ）
- 2026-09-03 機械確認: .agentdev/extensions/skills/agentdev-workflow-case-auto.yaml 25 行目の REQ-006-112 残存
