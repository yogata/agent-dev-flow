# inspect-docs finding 20260903T105357Z

## サマリ

- スキャン対象: 現行 REQ 49件、retired REQ 9件、Decision 26件、Design 170件（`references/` および `rules/` を含む）、guides 12件、配布物231件、README群。
- 検出カテゴリ: 第一参照導線／横断契約矛盾 1件、過去版 REQ 表記の層間DRIFT 1件。
- high severity: 1件。
- 未処理成果物: intake inbox 41件、learning inbox 未処理エントリあり。処理は行わない。

## 検出事項リスト

### F-01

- **id**: F-01
- **category**: 第一参照導線（README 導線）／横断契約矛盾
- **target**: `docs/README.md`（要件節の本文および REQ 一覧表）
- **evidence**: `docs/README.md` の AUTOGEN ブロックは「現行 REQ: 49件」と示す一方、直後の本文は「現行要件は48件である」と記載し、REQ 一覧表も `REQ-057` で終わり `REQ-058` を含まない。現行 REQ 実ファイルは49件で `docs/requirements/REQ-058.md` が存在し、`docs/requirements/README.md` の AUTOGEN 一覧は49件で `REQ-058` を含む。したがって docs 入口の手動本文・一覧表が正規 REQ インデックスと乖離している。
- **severity**: high
- **confidence**: high
- **source_of_truth**: 現行 REQ 実ファイルおよび `docs/requirements/README.md` の AUTOGEN ブロックを正とする。`docs/README.md` の手動本文・一覧表が下位の stale 記述である。
- **recommended_route**: inspect-promote → backlog-review。docs corpus 現行化として `docs/README.md` の件数・REQ 一覧を更新し、可能なら AUTOGEN 化する。docs-check route 候補として、README の hardcoded count と一覧の実体照合を提示する。
- **ng_classification**: pre-existing
- **notes**: `REQ-058` は2026-09-03作成。今回の診断では対象文書を修正していない。req-define入力案は「REQ インデックスの現行件数・一覧導線を正規インデックスと一致させる」であり、既存の docs corpus 現行化対象として扱う。

### F-02

- **id**: F-02
- **category**: 層間DRIFT（過去版 REQ 表記）／参照先不所存
- **target**: `docs/designs/commands/design-save.md:165`、`docs/designs/integrity/integrity-contracts.md:512`。関連する表記不統一候補は `docs/designs/integrity/rules/IR-066-legacy-path-removed-name.md:21,38`、`docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md:24`、`docs/designs/skills/agentdev-workflow-templates.md:112,119`、`docs/designs/skills/agentdev-req-analysis.md:100,107,123`。
- **evidence**: `docs/requirements/README.md` の「過去版との関係」は、過去版の4桁 REQ 番号帯を `v2:REQ-01XX` と表記して現行 REQ と区別するよう定める。しかし `design-save.md:165` は target_area 委譲の根拠を `REQ-0136-029` とし、`integrity-contracts.md:512` は archive と検査実行の分離の根拠を `REQ-0145-014` としており、いずれも `v2:` がない。横断検索では同様に `REQ-0108-262`、`REQ-0136-029`、`REQ-0129-012`、`REQ-0147-010`、`REQ-0164` の裸の過去版形式も確認した。ただし後者の多くは履歴説明、検出パターン説明、検証例または実績記録の文脈であり、根拠参照として明確なのは前記2件である。
- **severity**: medium
- **confidence**: high
- **source_of_truth**: `docs/requirements/README.md` の過去版 REQ 表記規約を正とする。現行体系に存在しない裸の4桁 REQ 参照は、版区別を失わせる下位 Design の記述である。
- **recommended_route**: inspect-promote → backlog-review。docs corpus 現行化として、根拠参照2件を `v2:REQ-...` 形式へ再同定し、履歴説明・検証例の候補は文脈確認後に表記を統一する。docs-check route 候補として、Report と検出パターン定義を除外した裸の `REQ-01XX` 参照検査を提示する。
- **ng_classification**: pre-existing
- **notes**: `content-corruption-checker.md` の旧ナンバリング検出パターンや `docs/reports/` の監査記録は対象外または履歴説明として扱った。req-define入力案は「過去版 REQ の根拠参照と履歴参照を区別し、根拠参照へ `v2:` 表記を付与する」である。

## 推奨アクション

- F-01: docs/README.md の本文カウントと REQ 一覧を `docs/requirements/README.md` および実ファイルへ同期する。変更判断・保存は後続 workflow で行う。
- F-02: 過去版 REQ を根拠として参照する箇所を `v2:REQ-01XX` 形式へ再同定し、履歴説明・検証例は文脈を確認して必要な場合のみ統一する。
- 未処理 intake/learning は本 workflow では処理せず、各 promote workflow の入力として保持する。

## 対象外（Out of Scope）

- 既存の `.agentdev/inspect/inbox/inspect-docs-finding-20260822T080133Z.md` および `inspect-docs-finding-20260901T120043Z.md` は過去サイクルの defer 残置分であり変更しない。
- `src/opencode/**/node_modules/` の4件の CRLF/LF 混在 README は gitignore 対象の依存解決副産物であり、管理対象配布物の検査対象外とした。
- 配布物の ID 汚染、実在しない command 参照、管理対象配布物の BOM/改行混在、frontmatter 重複、主要見出し重複は検出なし。`templates` は実在するテンプレートパス参照であり command 参照ではない。
- retired REQ および superseded Decision の履歴・廃止明示付き参照、guides の利用者向け導入手順、Design インデックスの決定的突合は本 finding の対象外とした。
