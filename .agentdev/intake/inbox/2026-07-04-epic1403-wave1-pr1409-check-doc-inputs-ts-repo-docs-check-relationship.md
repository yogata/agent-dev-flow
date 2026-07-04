# 旧 inspect-doc-inputs 呼出の check_doc_inputs.ts と /repo/docs-check の関係整理が未決定

## 観測

PR #1409（Epic #1403 Wave 1, Issue #1405）で `/agentdev/inspect-doc-inputs` command を削除し `/agentdev/inspect-extensions` へ統合したが、旧 command が呼び出していた `check_doc_inputs.ts`（repo-local、`repo-agentdev-integrity` skill 配下）と `/repo/docs-check` command との関係整理が未実施。

- `check_doc_inputs.ts`: IR-056（project doc-inputs 機構整合性検査）の実装スクリプト。`case-close` Step 3-1 doc-input 整合性検査、`/repo/docs-check` からも呼出対象。
- `/repo/docs-check`: 自己ホストリポジトリ専用の全体整合性検査 command。

## 今回扱わなかった理由

Issue #1405 のスコープは inspect-extensions command の実装と inspect-doc-inputs の統合・改名（command 定義・SPEC・README・入口表）。`check_doc_inputs.ts` と `/repo/docs-check` の整理は Wave 2 #1406（doc-inputs 機構の extensions 移行）と連動するため対象外とした。

## 影響

- `case-close` Step 3-1 doc-input 整合性検査が `check_doc_inputs.ts` を strict 実行するが、extensions 移行後に IR-056 の前提（`.agentdev/doc-inputs/**` 構造）が陈腐化する可能性がある。
- `/repo/docs-check` 経由で呼ばれる場合も同様。
- 移行過渡期は inspect-extensions 検査7（旧 doc-inputs 残存検出）を warning 扱いで運用することで影響を緩和済み（command 定義 G04、PR #1409 SPEC確定候補）。

## レビューで決めること

- `check_doc_inputs.ts` を extensions 機構（`.agentdev/extensions/**`）へ対応させるか、inspect-extensions 側へ機能統合するか
- `/repo/docs-check` の呼出先を inspect-extensions へ切り替えるか、併存期間を設けるか
- IR-056 ルール定義（`docs/specs/integrity/rules/IR-056-project-doc-input-integrity.md`）を extensions 機構へ書き直すか、retire するか

## 根拠

PR #1409 Findings セクションより。Wave 2 #1406 移行または別 Issue 候補として case-close（Epic Wave クローズ）で回収。
