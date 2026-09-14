# artifact-contracts.md の lifecycle 記述整合（後続 Findings）

## 概要

docs/designs/responsibilities/artifact-contracts.md の lifecycle 記述が現行 lifecycle 契約と整合していない可能性が case 2805 OU-002（Issue #2807）の実行で指摘された。当該 Issue ではスコープ外として未変更。現行 lifecycle（REQ-008 変更後行・backlog-artifact-lifecycle Design・.agentdev 状態表の「case-ready 成功後に削除」体系）との整合要否を後続作業として検討する。

## 内容

- docs/designs/responsibilities/artifact-contracts.md の lifecycle 記述を REQ-008 変更後行・backlog-artifact-lifecycle Design と突合し、旧記述が残っていれば更新する
- 横断確認: responsibilities 系 Design の lifecycle 記述の陳腐化確認

## 根拠

- 観測元: case 2805 OU-002（DEL-2807-1、PR #2815）本文 Findings（intake 候補）、case-close（2026-09-14）で回収
- 元テキスト: PR #2815 本文 Findings / Capture「docs/designs/responsibilities/artifact-contracts.md の旧 lifecycle 記述はスコープ外のため未変更。後続 Findings として扱う」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
