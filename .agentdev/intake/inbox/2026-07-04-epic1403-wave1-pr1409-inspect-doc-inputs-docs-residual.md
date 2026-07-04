# docs 内部ファイルに inspect-doc-inputs への参照が残留（6ファイル）

## 観測

PR #1409（Epic #1403 Wave 1, Issue #1405）で `/agentdev/inspect-doc-inputs` を `/agentdev/inspect-extensions` へ統合・改名したが、以下の docs 内部ファイルに旧 `inspect-doc-inputs` への参照が残留:

- `docs/DOC-MAP.md`
- `docs/specs/foundations/system.md`
- `docs/specs/foundations/project-doc-inputs.md`
- `docs/specs/local/runtime-package-boundary.md`
- `docs/specs/authoring/command-file-format.md`
- `docs/specs/integrity/rules/IR-056-project-doc-input-integrity.md`

履歴参照のため更新不要と判断したファイル（PR #1409 Findings 記載）:

- `docs/adr/ADR-0133.md`（superseded ADR、歴史参照）
- `docs/requirements/retired/REQ-0157.md`（retired REQ、歴史参照）

## 今回扱わなかった理由

Issue #1405 のスコープは `/agentdev/inspect-extensions` command と SPEC の実装・改名であり、docs 内部ファイル群の参照更新は Wave 2 #1406（既存 doc-inputs 機構の extensions 移行）の担当範囲。スコープディシプリンにより Wave 1 では対象外とした。

## 影響

docs 読者が存在しない command `/agentdev/inspect-doc-inputs` へ誘導されるリスクがある。ただし command 本体（`src/opencode/commands/agentdev/inspect-doc-inputs.md`）は PR #1409 で削除済みのため、実害は限定的（コマンド実行不可）。Wave 2 #1406 での一括是正待ち。

## レビューで決めること

- 6ファイルの `inspect-doc-inputs` 参照を `inspect-extensions` へ機械的に置換するか、文脈に応じて書き直すか
- Wave 2 #1406 の実装スコープ（doc-inputs → extensions 移行）に含めて一括処理するか、独立した docs 整理 Issue として切り出すか
- IR-056-project-doc-input-integrity.md は検査ルール定義そのものが inspect-doc-inputs を前提としているため、extensions 機構へ書き直す必要がある（参照置換では不十分な可能性）

## 根拠

PR #1409 Findings セクションより。Wave 2 #1406 移行作業候補として case-close（Epic Wave クローズ）で回収。
