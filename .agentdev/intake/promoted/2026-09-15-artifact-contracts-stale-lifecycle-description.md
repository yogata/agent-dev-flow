# artifact-contracts.md の lifecycle 記述が現行契約と不整合の可能性（突合タスク）

## 観測内容

`docs/designs/responsibilities/artifact-contracts.md` の lifecycle 記述が現行 lifecycle 契約と整合していない可能性が case 2805 OU-002（Issue #2807）の実行で指摘された。当該 Issue ではスコープ外として未変更のまま持ち帰られた。

## 影響

- responsibilities 系 Design の lifecycle 記述の信頼性が低下し、参照者が旧体系（case-ready 成功後削除の現行体系前）に誘導され得る

## 課題（対応候補と判断材料）

- artifact-contracts.md の lifecycle 記述を REQ-008 変更後行・backlog-artifact-lifecycle Design・.agentdev 状態表の「case-ready 成功後に削除」体系と突合し、旧記述が残っていれば更新する
- 横断確認: responsibilities 系 Design の lifecycle 記述の陳腐化確認

## 既存要件との関連

- REQ-008（変更後行体系）: 突合対象の正典
- backlog-artifact-lifecycle Design: 突合対象の正典

## 根拠

- 観測元: case 2805 OU-002（DEL-2807-1、PR #2815）本文 Findings / Capture（intake 候補）、case-close（2026-09-14）で回収
- 処分経緯: intake-promote（2026-09-15）で採用を確定（ユーザー承認。突合の実施は後続工程）
