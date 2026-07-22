# SC-002 索引自動生成の混合領域明文化と case-close への generate_indexes.ts 必須実行

## 背景

Epic #1622（index AUTOGEN 化）と Epic #1711（REQ retire）で、索引類（README/DOC-MAP）の AUTOGEN block 運用が実証された。その過程で2つの構造的問題が顕在化した。(1) AUTOGEN block（frontmatter 由来情報）と人手編集領域（概要・関心対象・Decision Map 等）の分離基準が SC-002 SPEC で「混合領域」として許容されているものの明文化が不十分。(2) 複数PRが同じ索引ファイルを編集する際、最後にマージされるPRが generate_indexes.ts を実行せず AUTOGEN block の不整合が発生し、case-close QG-4 で docs-check が NG となった（Epic #1711 Wave 2）。

## 問題

索引類の AUTOGEN 化において、SC-002 SPEC は「混合領域」を許容するが frontmatter 由来情報と人手編集情報の分離基準が未明文化。また case-close に generate_indexes.ts の必須実行ステップがなく、複数PR跨ぎで AUTOGEN block の再生成が漏れる。結果として docs-check NG で case-close がブロックされる。

## 望ましい変更

1. SC-002 SPEC（`docs/specs/integrity/index-auto-generation.md`）に「混合領域」の明文化と frontmatter 由来情報と人手編集情報の分離基準を追記する
2. case-close SPEC（`docs/specs/commands/case-close.md`）の Step 3 または E5b に generate_indexes.ts の必須実行ステップを追加する
3. check_integrity.ts の index-generation-consistency（IR-061）が case-close の必須ゲートとして機能することを確認する

## 対象範囲

### 対象

- `docs/specs/integrity/index-auto-generation.md`（SC-002 SPEC「混合領域」明文化、分離基準）
- `docs/specs/commands/case-close.md`（Step 3/E5b への generate_indexes.ts 必須実行ステップ追加）

### 対象外

- generate_indexes.ts の実装変更（pre-existing bug の改修は別 Issue で対応）
- 新規 IR の作成（IR-061 で検査対象は既定義済み）
- Wave 3（metrics GENERATE 化）・Wave 4（SKILL.md DERIVE 機構）の設計

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/integrity/index-auto-generation.md` | 「混合領域」許容と frontmatter 由来情報（id/title/status/count は AUTOGEN block）と人手編集情報（概要・関心対象・Decision Map・Topic View は人手編集領域または別 block）の分離基準を明文化 |
| command spec | `docs/specs/commands/case-close.md` | Step 3 または E5b に generate_indexes.ts 実行ステップを追加。複数PRが索引ファイルを編集した場合の安全網として機能 |

## 既存対策確認

- **確認結果**: あり（SC-002 SPEC accepted、IR-061 定義済み）
- **該当ファイル**: `docs/specs/integrity/index-auto-generation.md`、`docs/specs/commands/case-close.md`
- **ギャップ分類**: fix gap（SC-002 に「混合領域」明文化なし、case-close に generate_indexes.ts 必須実行なし）
- **ギャップ詳細**: SC-002 SPEC は AUTOGEN block を定義するが、frontmatter 由来でない情報（関心対象列、Decision Map、Topic View 等）の取り扱いが「混合領域」として暗黙に許容されているのみ。case-close は PR マージ後に索引の再生成を必須としないため、複数PR跨ぎで AUTOGEN block の不整合が検出時にしか発覚しない。

## 制約

- SC-002 SPEC の AUTOGEN block 定義自体は変更しない（accepted 状態を維持、分離基準の追記が目的）
- case-close の generate_indexes.ts 実行ステップは、既存の QG-4 docs-check の前に配置すること（docs-check 通過の前提条件）
- generate_indexes.ts の pre-existing bug（spec-health-metrics.md L26 AUTOGEN marker backtick 誤認）は別 Issue 対応であり本変更の対象外

## 受け入れ条件

- [ ] SC-002 SPEC に「混合領域」許容と frontmatter 由来情報と人手編集情報の分離基準が明文化されていること
- [ ] case-close SPEC に generate_indexes.ts 必須実行ステップが追加されていること
- [ ] 分離基準に Wave 2 実証事例（ADR README、REQ README、DOC-MAP）が参照として併記されていること

## 元learning item / 根拠

- **要約**: 索引類自動生成の混合領域分離と複数PR跨ぎ AUTOGEN 再生成漏れの予防
- **根拠**: (1) Wave 2（PR #1629）で ADR/REQ README、DOC-MAP の AUTOGEN 化実施時、frontmatter 由来情報と人手編集情報が混在する「混合領域」が標準状態と判明。(2) Epic #1711 Wave 2 で OU-002/OU-003 が並列実行され、索引 AUTOGEN 再生成が漏れて case-close QG-4 で docs-check NG 7件検出（PR #1716/#1717/#1718）。
- **再発条件**: 複数PRが同じ索引ファイルの AUTOGEN block に依存する変更を行い、case-close で generate_indexes.ts が必須実行されない場合
- **横展開可能性**: 索引類 AUTOGEN 化全般、Wave 3（metrics GENERATE 化）、Wave 4（SKILL.md DERIVE 機構）でも同様の混合領域判断が必要

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue #1624, Issue #1712, PR #1629, PR #1716/#1717/#1718, Epic #1622, Epic #1711, SC-002, IR-061
