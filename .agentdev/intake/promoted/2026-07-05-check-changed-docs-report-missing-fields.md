# check_changed_docs.ts report オブジェクトのフィールド欠落（doc_inputs_check_required / extensions_check_required）

## 観測内容

`check_changed_docs.ts` の report オブジェクト生成部（L766 付近）で以下の不整合:

- `runWorkflowChecks()` 戻り値に `docInputsCheckRequired` プロパティが存在せず、report オブジェクトで `undefined` になる
- `runResult.extensionsCheckRequired` は存在するが report オブジェクトに含まれていない（※ PR #1477 で extensions_check_required は修正済みの可能性あり、doc_inputs_check_required は未対応の可能性）
- 結果として JSON 出力から `extensions_check_required` と `doc_inputs_check_required` が欠落

## 影響

- docs-check の JSON 出力から2フィールドが欠落する可能性
- TS-001（workflow/files_checked/failures のみ要求）には影響しない
- 拡張チェックの要否判定が JSON 出力から読み取れない

## 課題

1. `runWorkflowChecks()` の戻り値型に `docInputsCheckRequired` を追加し、該当判定ロジックを実装する
2. report オブジェクト生成部に `extensions_check_required: runResult.extensionsCheckRequired` を追加する（未対応の場合）
3. 既存テスト（req-save/spec-save/case-close/docs-check プロファイル）で該当フィールドが欠落していないことを検証する回帰テストを追加する

※ extensions_check_required は PR #1477 で部分的に修正済み。doc_inputs_check_required の対応状況を確認すること。

## 既存要件との関連

- REQ-0158（targeted docs guard）
- 関連 item: コマンド SPEC「JSON 出力」フィールド一覧の陳腐化（SPEC 記載側、別 item）。両 item は同じフィールド群を対象とするが層が異なる（コード実装 vs SPEC 記載）

## 出典

- 観測元: Issue #1455 / PR #1456 の case-run 実行（OU-001、2026-07-05）
- 対象ファイル: `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts` L766 付近
