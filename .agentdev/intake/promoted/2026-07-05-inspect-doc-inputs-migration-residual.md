# inspect-doc-inputs → inspect-extensions 移行残作業

## 観測内容

PR #1409（Epic #1403 Wave 1, Issue #1405）で `/agentdev/inspect-doc-inputs` command を `/agentdev/inspect-extensions` へ統合・改名した。移行に伴う残作業が2つある。

### 残作業1: check_doc_inputs.ts と /repo/docs-check の関係整理

旧 command が呼び出していた `check_doc_inputs.ts`（repo-local、`repo-agentdev-integrity` skill 配下）と `/repo/docs-check` command との関係整理が未実施。

- `check_doc_inputs.ts`: IR-056（project doc-inputs 機構整合性検査）の実装スクリプト。`case-close` Step 3-1 doc-input 整合性検査、`/repo/docs-check` からも呼出対象。
- `/repo/docs-check`: 自己ホストリポジトリ専用の全体整合性検査 command。

extensions 移行後に IR-056 の前提（`.agentdev/doc-inputs/**` 構造）が陈腐化する可能性がある。

### 残作業2: docs 内部ファイルの inspect-doc-inputs 参照残留（6ファイル）

以下の docs 内部ファイルに旧 `inspect-doc-inputs` への参照が残留:

- `docs/DOC-MAP.md`
- `docs/specs/foundations/system.md`
- `docs/specs/foundations/project-doc-inputs.md`
- `docs/specs/local/runtime-package-boundary.md`
- `docs/specs/authoring/command-file-format.md`
- `docs/specs/integrity/rules/IR-056-project-doc-input-integrity.md`

履歴参照のため更新不要と判断したファイル（PR #1409 Findings 記載）:
- `docs/adr/ADR-0133.md`（superseded ADR、歴史参照）
- `docs/requirements/retired/REQ-0157.md`（retired REQ、歴史参照）

## 影響

- `case-close` Step 3-1 doc-input 整合性検査が `check_doc_inputs.ts` を strict 実行するが、extensions 移行後に前提構造が陈腐化するリスク
- docs 読者が存在しない command `/agentdev/inspect-doc-inputs` へ誘導されるリスク（command 本体は PR #1409 で削除済みのため実害は限定的）
- IR-056-project-doc-input-integrity.md は検査ルール定義そのものが inspect-doc-inputs を前提としており、extensions 機構へ書き直す必要がある（参照置換では不十分な可能性）
- 移行過渡期は inspect-extensions 検査7（旧 doc-inputs 残存検出）を warning 扱いで運用し影響緩和済み

## 課題

- `check_doc_inputs.ts` を extensions 機構（`.agentdev/extensions/**`）へ対応させるか、inspect-extensions 側へ機能統合するか
- `/repo/docs-check` の呼出先を inspect-extensions へ切り替えるか、併存期間を設けるか
- IR-056 ルール定義を extensions 機構へ書き直すか、retire するか
- 6ファイルの `inspect-doc-inputs` 参照を機械的に置換するか、文脈に応じて書き直すか
- Wave 2 #1406 の実装スコープに含めて一括処理するか、独立した docs 整理 Issue として切り出すか

## 既存要件との関連

- Epic #1403 Wave 1 Issue #1405（inspect-extensions 統合・改名）
- Wave 2 Issue #1406（doc-inputs 機構の extensions 移行）
- IR-056（project-extensions-integrity、PR #1410 で全面書き直し済み）
- inspect-extensions command 定義 G04（検査7 warning 運用）
