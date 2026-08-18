# Workflow Skill の soft guard 未宣言による checkWorkflowPreventive の恒常失敗

## 観測
full integrity suite の checkWorkflowPreventive integration テスト（all 7 preventive items pass）が失敗する。agentdev-workflow-backlog-review、agentdev-workflow-case-auto 等 Workflow Skill の SKILL.md が soft guard（単独起動抑制）を未宣言であることが原因。base（5d89b9df）でも再現する既存失敗。

## 今回扱わない理由
src/opencode/skills/** の内容修正を要するため、Epic #2205（EU-B）Wave 1 の各 Issue スコープ外。PR #2254・PR #2252 の Findings に記録のみ実施。

## 影響
full integrity suite が恒常的に 2 fail のひとつとして失敗し、新規変更のテスト判定でノイズになる。機能への影響なし。

## レビューで決めること
- 未宣言の Workflow Skill を横断的に洗い出し、soft guard 宣言を一括で追加するか（対象スキルの抽出方法: checkWorkflowPreventive の失敗詳細から導出）。

## 根拠
- PR 2254 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2254）
- PR 2252 本文「Findings / Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2252）
- PR 2255 本文「事前存在 fail の記録」（回収元: https://github.com/yogata/agent-dev-flow/pull/2255）
