# IR-056 検査項目10個詳細仕様（確定・反映済み）

## 観測

PR #1410（Epic #1403 Wave 2, Issue #1406）で IR-056 を `IR-056-project-doc-input-integrity.md` から `IR-056-project-extensions-integrity.md` へ改名・全面書き直し。検査項目10個の詳細仕様（exemption 含む）を確定し、`docs/specs/integrity/rules/IR-056-project-extensions-integrity.md` に反映済み。

検査項目10個（PR #1410 検証結果より）:
1. existing（extension ファイル存在）
2. structure（5セクション構造）
3. kind-placement（commands/skills 配置整合）
4. id-filename（extension id とファイル名一致）
5. context-paths（context.paths 実在）
6. skill-existence（委譲先 skill 実在）
7. legacy-residual（旧 doc-inputs 残存検出）
8. override-intent（上書き意図検出）
9. direct-refs in commands（command 本体の具体参照禁止）
10. direct-refs in skills（skill 本体の具体参照禁止）

## SPEC確定候補としての位置づけ

PR #1410 SPEC確定候補 S-2。case-close Step 3-2 の処理結果は **確定・反映済み**:
- 対象 IR-056 は当該 PR 内で `status: accepted, baseline_status: migrated` として全面書き直し済み
- `inspect-extensions.md` が `.agentdev/doc-inputs/**` を検査対象として宣言することは residual 検出のスキャン対象宣言（実参照ではない）として exemption 明文化済み
- 追加の SPEC 昇格・追記作業は不要

## 影響

- IR-056 は accepted status で確定。docs-check / inspect-docs 検査対象として稼働
- `check_extensions.ts` と IR-056 定義が相互整合（PR #1410 検証で ok=true, failures=0 を確認済み）

## レビューで決めること

- なし（確定・反映済みのため）。本 intake はトレーサビリティ記録として保存

## 根拠

PR #1410 SPEC確定候補 S-2 より。Wave 2 case-close で回収（確定・反映済みの確認記録）。