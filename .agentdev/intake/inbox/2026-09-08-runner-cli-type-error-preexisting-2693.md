---
id: intake-20260908-runner-cli-type-error-preexisting-2693
title: src/opencode/tools/agentdev-gh/tests/runner-cli.test.ts:1034 の既知 TypeScript 型エラーが main でも再現する
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2693（Issue #2689・Epic #2686 Wave 2・OU-002 呼出元移行と issue_comment 廃止）
- 発見経路: case-run tools/agentdev-gh の typecheck（PR 本文 Findings / Capture候補 セクション由来）

## 内容
- `src/opencode/tools/agentdev-gh/tests/runner-cli.test.ts:1034` に既知の TypeScript 型エラーが存在し、本 PR の変更なしに main でも再現する（pre-existing）。
- テスト実行（bun test）は pass しており、typecheck のみで顕在化する。修正対象箇所の特定と修正の必要性判断が必要。

## 対応候補
- runner-cli.test.ts の当該行の型エラーを修正する（小規模 fix。後続判断）。
