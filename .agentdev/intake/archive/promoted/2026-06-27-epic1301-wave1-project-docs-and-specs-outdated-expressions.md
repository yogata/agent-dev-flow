# docs/guides/project-docs-and-specs.md L60/L64 の旧表現（DOC-MAP.md #1303 修正と同種）

## 観察

Epic #1301 Wave 1（docs/specs/ 再構成 Phase 1）で `docs/DOC-MAP.md` の旧表現3点を修正した（子Issue #1303、TS-002 PASS、main commit 7f9e3472）。修正内容は以下の通り:

- (b) `patterns.md` の説明「実装パターンと文書フォーマット」→「文書フォーマット規約（frontmatter・命名・URL参照形式）」
- (c) `document-model.md` の説明「文書種別の責務マトリックス」→「文書種別マトリックス・文書分類ポリシー・SPEC内部5論理区分・文書7分類・ドメイン別体系化規範」

ガイド層の `docs/guides/project-docs-and-specs.md` には、これらと同一の旧表現が SPEC 一覧表に残存している:

- L60: `| patterns.md | 実装パターンと文書フォーマット |`
- L64: `| document-model.md | 文書種別の責務マトリックス |`

## 修正されなかった理由

Epic #1301 は `docs/specs/` 配下の基盤 SPEC ファイル群が対象であり、ガイド層（`docs/guides/`）は Phase 1 のスコープ外（docs/specs/ 再構成が主眼のため）。子Issue #1303 の対象範囲も `docs/DOC-MAP.md` に限定されていた。

ただし `docs/README.md`（基準文書の入口、Phase 1 対象 #1302）と `docs/guides/project-docs-and-specs.md`（ガイド層）は同じ SPEC 一覧表を持ち、基準文書との整合性の観点から修正が望ましい。

## 課題

- `docs/guides/project-docs-and-specs.md` L60, L64 の旧表現を DOC-MAP.md（#1303）修正後表現へ揃えるか、ガイド層は簡潔さを優先して別表現とするか
- 同ファイルの SPEC 一覧表全体（L57-72）が `docs/README.md` の基盤 SPEC 一覧と重複しており、二重メンテ状態。横展開でテーブル共有化（一方を参照リンク化）するかも検討課題
- ガイドは案内層（REQ-0101-014, 027、ADR-0103）であり、基準文書との矛盾時は基準優先だが、探索利用者が両者で表現ブレを観測すると信頼性低下の要因になる

## 根拠

Epic #1301 本文、子Issue #1303 本文、main commit 7f9e3472「docs(specs): docs-specs-phase1 Phase 1 整合修正 (6 SPEC updates)」より。

子Issue #1303 の完了条件:
> - [x] (b) patterns.md の説明が「文書フォーマット規約（frontmatter・命名・URL参照形式）」に修正されていること
> - [x] (c) document-model.md の説明が「文書種別マトリックス・文書分類ポリシー・SPEC内部5論理区分・文書7分類・ドメイン別体系化規範」に修正されていること
> - [x] 旧表現「Phase 2a（PR #1215）」「実装パターンと文書フォーマット」「文書種別の責務マトリックス」が残置されていないこと

DOC-MAP.md では旧表現の残置が禁止されたが、`project-docs-and-specs.md` には同表現が残っている。

## 観測元

- Epic #1301（docs/specs/ 再構成 Phase 1）
- Issue #1303（OU-002: docs/DOC-MAP.md 旧表現・説明ブレ3点修正）
- main commit 7f9e3472
