# Wave 2 AUTOGEN block 仕様（ID 命名パターンと検査ヘルパー）

## 問題事象

Wave 2（PR #1629）で ADR README、REQ README、DOC-MAP の AUTOGEN 化を実施した際、2つの SPEC確定候補が判明:

1. **AG-008/009/013 AUTOGEN block ID 命名パターン**: `{target}-{section}-{subsection}` 形式（`adr-status-accepted`, `req-active-table`, `docmap-inventory`, `adr-baseline-count`, `adr-retired-table` 等）。Wave 1（catalog/rule-ownership）の `catalog-ir-entries-pre-045`, `rule-ownership-ir-crossref` と整合する命名規則。SC-002 SPEC の生成規則として確定候補。

2. **verifyAutogenBlocksInFile 共通ヘルパー**: check_integrity.ts の IR-061 検査 `checkIndexGenerationConsistency` で、ファイル内の複数 AUTOGEN block の検証を一括処理するヘルパー関数。Wave 1 の catalog/rule-ownership 個別検証コードも本関数へリファクタリング可能。

## 発生局面

実装（case-run Wave 2 #1624 PR #1629、generate_indexes.ts 生成関数拡張 + check_integrity.ts IR-061 検査拡張時）

## 検知方法

実装検証。generate_indexes.ts へ ADR/REQ README、DOC-MAP 生成関数追加時と、check_integrity.ts の IR-061 検査拡張時に、命名パターンの一貫性とヘルパー関数の汎用性を確認。PR 本文 SPEC確定候補セクションに記録。

## 根本原因

Wave 1 では catalog/rule-ownership の2対象に個別対応し、命名パターンと検査ロジックを個別実装していた。Wave 2 で ADR/REQ README、DOC-MAP が追加され対象が5ファイルに増加した結果、命名パターンの標準化と検査ヘルパーの共通化が保守性・拡張性の観点から必要と判明。

## 提案内容

1. **SC-002 SPEC（`docs/specs/integrity/index-auto-generation.md`）へ、AUTOGEN block ID 命名パターン `{target}-{section}-{subsection}` を明文化**:
   - `target`: 対象ファイル領域（`adr`, `req`, `docmap`, `catalog`, `rule-ownership` 等）
   - `section`: セクション区分（`baseline`, `status`, `active`, `retired`, `ir-entries`, `ir-crossref` 等）
   - `subsection`: 補助区分（`count`, `table`, `accepted`, `proposed`, `superseded`, `deprecated`, `pre-045`, `post-045` 等）
   - Wave 1/2 で採用した ID を参考例として記載

2. **check_integrity.ts の verifyAutogenBlocksInFile ヘルパーを汎用化**:
   - Wave 1 の catalog/rule-ownership 個別検証コードを本関数へリファクタリング
   - スコープごとの case で検証を実行し、結果を ok/ng/count で報告
   - findFirstMismatch で期待値と実測の最初の不一致を特定

3. **新規 AUTOGEN block 追加時のチェックリスト化**:
   - 命名パターン（`{target}-{section}-{subsection}`）に準拠しているか
   - verifyAutogenBlocksInFile の検査対象に追加されているか
   - generate_indexes.ts の生成関数と check_integrity.ts の検査関数が論理的同一性を保持しているか（AG-002 docs-check G01 原則）

## 対象ファイル

- `docs/specs/integrity/index-auto-generation.md`（SC-002 SPEC、命名パターン明文化）
- `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（verifyAutogenBlocksInFile ヘルパー汎用化、Wave 1 コードリファクタリング）
- `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`（生成関数と検査関数の論理的同一性確認）

## 参照

- PR #1629, Issue #1624, Epic #1622 Wave 2
- Wave 1: PR #1628, Issue #1623（catalog/rule-ownership GENERATE 化、命名パターンと検査ロジックの原型）
- SC-002 SPEC（`docs/specs/integrity/index-auto-generation.md`）
- IR-061（`docs/specs/integrity/rules/IR-061-index-generation-consistency.md`、検査カテゴリ `index-generation-consistency`）

## 分類

SPEC 確定候補（SC-002 SPEC への命名パターン明文化）+ 実装リファクタリング候補（verifyAutogenBlocksInFile ヘルパー汎用化、Wave 1 コード統合）

## 優先度

medium（Wave 5 Phase E 全索引展開時に一括評価、または別 Issue で個別対応。Wave 3/4 で新規 AUTOGEN block を追加する際は、本候補の命名パターンとヘルパーを仮採用して進行可）
