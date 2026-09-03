# agentdev-distribution-boundary-guard の outside-root over-block checker 実装側解消

## 観測内容

repo-local pre-write gate plugin（agentdev-distribution-boundary-guard）が worktree 外（例: C:\WINDOWS\TEMP\opencode）への書き込みを outside-root target として fail-closed block する。REQ-057-010「outside-root over-block 解消方針」の checker 実装側解消は対象外として、Design 側（runtime-package-boundary.md「配布境界 checker の repo-local モデル」節）に一般化方針を保持済み。

checker 仕様変更は Issue #2508 の対象外（Design 側一般化方針の記述保持のみ実施済み）だった。

## 影響

ワークフロー実行時、TEMP 配下への正当なツール書き込みが gate で block される可能性が残る。

## 課題（レビューで決めること）

- outside-root 判定の例外規則（事前承認 TEMP ディレクトリ等）の checker 実装側適用
- Design 一般化方針との整合確認

## 既存要件・契約との関連

- REQ-057-010（outside-root over-block 解消方針）、runtime-package-boundary Design（docs/designs/local/runtime-package-boundary.md「配布境界 checker の repo-local モデル」節）の一般化方針。

## 根拠

- PR #2524 本文「Findings / Capture候補」finding 1（回収元: https://github.com/yogata/agent-dev-flow/pull/2524 ）
