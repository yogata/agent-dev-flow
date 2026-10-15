# prepare_definition_pr.ts の pre-existing 型エラー 4 件を解消する

## 観測内容

2026-10-14、Case #3718（bun test 全テスト正常化）の case-run 検証で、`src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts` に pre-existing の型エラー 4 件（TS18048×2・TS2783×2）を観測。bun test では検出されず typecheck 実行時のみ顕在化する。変更対象外のため Case #3718 では修復せず記録のみ。

## 背景（実行 Case で扱わなかった理由）

本件は bun test 全テストの正常化（#3718）と無関係であり、実行契約の対象外（「全体正常化と無関係な機能改善」）。typecheck を gate に含む後続 Case で解消するのが本筋。

## 影響

prepare_definition_pr.ts を触る Case で typecheck を実行するたびに pre-existing 4 件が混在し、自 Case 起因の型エラー分離の手間が生じる。

## 課題（後段 review で決めること）

- TS18048（possibly undefined）2 件・TS2783（destructured default 無効）2 件の修復方針
- case-open scripts 配下への typecheck gate 組込み要否

## 既存要件・既存処遇との関連

- typecheck gate 組込みの方針決定・実装は REQ-112 / REQ-113（local package tsconfig 二重管理統合・typecheck gate 組込み）と関連する。後段 review で依存解決する

## 根拠

- 観測元: Case #3718 / PR #3720 本文「検証記録」typecheck 行（実行単位 DEL-3718-1、2026-10-14）
- 証拠: typecheck 実行退避（worktree 相対 `.agentdev/tmp/tc-caseopen.*`、PR 本文に記録済み）
