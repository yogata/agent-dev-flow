# check_changed_docs.ts report オブジェクトのフィールド欠落（doc_inputs_check_required / extensions_check_required）

## 概要

`check_changed_docs.ts` の report オブジェクト生成部（L766 付近）で `doc_inputs_check_required` が `undefined` になる不整合。併せて `extensionsCheckRequired` は `runResult` に存在するが report オブジェクトに含まれておらず、結果として JSON 出力から `extensions_check_required` と `doc_inputs_check_required` が欠落している。

## 詳細

- `runWorkflowChecks()` 戻り値（`runResult`）に `docInputsCheckRequired` プロパティが存在しない。report オブジェクト生成部で `runResult.docInputsCheckRequired` を参照しているため `undefined` になる
- `runResult.extensionsCheckRequired` は存在するが report オブジェクトに含まれていない
- 結果として JSON 出力から `extensions_check_required` と `doc_inputs_check_required` の両フィールドが欠落する
- TS-001（workflow/files_checked/failures のみ要求）には影響しない。本 Issue（#1455）の完了条件・テスト戦略にも含まれないため、case-run では修正せず別 Issue 推奨として記録

## 候補となる対応

1. `runWorkflowChecks()` の戻り値型に `docInputsCheckRequired` を追加し、該当判定ロジックを実装する
2. report オブジェクト生成部に `extensions_check_required: runResult.extensionsCheckRequired` を追加する
3. 既存テスト（req-save/spec-save/case-close/docs-check プロファイル）で該当フィールドが欠落していないことを検証する回帰テストを追加する

## 根拠

- 観測元: Issue #1455 / PR #1456 の case-run 実行（OU-001、2026-07-05）。PR 本文 `## Findings / Capture候補` > `### 既存実装の不整合（本 Issue スコープ外、参考記録）`
- 対象ファイル: `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts` L766 付近（report オブジェクト生成部）
- 関連要件: REQ-0158（targeted docs guard）
- スコープ: OU-001（本 PR）対象外。OU-002 または別 Issue での処理を想定
