---
title: 索引類自動生成 SPEC
status: accepted
created: 2026-07-19
updated: 2026-07-20
---

# 索引類自動生成 SPEC

README 群、索引類、件数表明を実ファイルの frontmatter から再生成する機構を定義する。人手更新に依存する件数や一覧の追記漏れを構造的に根絶し、実体と索引の不整合（F-001、F-002、F-005）を発生させない（AG-006 候補2/3/8）。

本 SPEC は機構の契約を定義し、実装（生成スクリプト、CI 組込、pre-commit hook 等）は対象外とする。実装の段階的導入は別途 case-run 工程で実施する。

## 適用範囲

- **対象**: 以下の索引類に含まれる件数、一覧、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表の各自動生成対象領域
  - `docs/README.md`（ドキュメント入口。REQ 件数表明、SPEC 一覧、ADR/ガイド/DOC-MAP 参照リンク）
  - `docs/requirements/README.md`（REQ 一覧、廃止済み REQ 一覧）
  - `docs/adr/README.md`（現行基盤ビュー、ステータス別ビュー、トピック別ビュー、Decision Map、関連 REQ 表、廃止済み履歴ビュー）
  - `docs/specs/README.md`（command SPEC、skill SPEC、横断 SPEC、基盤 SPEC 一覧）
  - `docs/DOC-MAP.md`（探索経路インデックス）
  - `docs/requirements/mapping-table.md`（REQ 移行表）
  - `docs/specs/integrity/integrity-rule-catalog.md`（IR エントリ一覧。IR-* frontmatter から catalog エントリを再生成。スキーマ定義セクションは人手編集領域として残置）
  - `docs/specs/integrity/rule-ownership.md`（ルールドメイン → canonical REQ/SPEC の対応マトリクス。IR-* と各 SPEC の canonical owner 宣言から再生成）
  - `docs/specs/quality/req-health-metrics.md`（現行 REQ の計測例テーブル）
  - `docs/specs/quality/spec-health-metrics.md`（SPEC 計測例テーブル）
- **対象外**: 各 SPEC、REQ、ADR の本文（自動生成対象は索引類のみ）

## 自動生成の対象領域と生成元

| 索引類 | 自動生成対象 | 生成元 |
|--------|-------------|--------|
| `docs/README.md` | REQ 件数表明、SPEC 一覧（3 層 + 基盤 6 ドメイン）、ADR/ガイド/DOC-MAP 参照リンク | `docs/requirements/REQ-*.md`、`docs/specs/**/*.md`、`docs/adr/ADR-*.md` の frontmatter |
| `docs/requirements/README.md` | REQ 一覧表、件数表明 | `docs/requirements/REQ-*.md` の frontmatter（`id`、`title`） |
| `docs/adr/README.md` 現行基盤ビュー | accepted ADR 一覧表、件数表明 | `docs/adr/ADR-*.md` の frontmatter（`id`、`title`、`status`、`created`） |
| `docs/adr/README.md` ステータス別ビュー | accepted、proposed、superseded、deprecated 各リスト | 同上 |
| `docs/adr/README.md` トピック別ビュー | トピック分類一覧 | 同上 + トピック分類メタデータ（要拡張） |
| `docs/adr/README.md` Decision Map | supersedes、relates-to、superseded-by 関係 | 各 ADR 本文の「関連する決定」セクション |
| `docs/specs/README.md` 各一覧表 | SPEC 一覧、status 列 | `docs/specs/**/*.md` の frontmatter（`title`、`status`） |

## 生成規則

### 件数表明

件数表明は実ファイル frontmatter 値を集計した結果と一致すること。人手で件数を記述せず、自動生成マーカーで囲んだ領域へスクリプトが集計結果を出力する。

例: `docs/adr/README.md` のキャプション「承認済みステータス（accepted）の ADR-01XX 25件」は、`docs/adr/ADR-*.md` のうち `status: accepted` を集計した結果でなければならない（F-001 根絶）。

### 一覧の網羅性

各一覧表は実ファイル全体を網羅する。追加、廃止、移動が発生した場合は生成タイミングで自動的に一覧へ反映される。人手による一覧行の追加、削除は原則として行わない（自動生成マーカー外の編集領域のみ人手編集を許容する）。

例: `docs/adr/README.md` のステータス別ビュー「承認済み（accepted）」リストは、`docs/adr/ADR-*.md` のうち `status: accepted` の全 ADR を漏れなく網羅しなければならない。新規 ADR 追加時にリストだけが更新されない事態（F-002）を構造的に防ぐ。

### ステータス別ビュー、トピック別ビュー

ビューの分類基準は実ファイルの frontmatter またはメタデータから導出する。トピック分類など frontmatter に存在しないメタデータは、各 ADR 本文のセクション構造から導出する規則を定めるか、frontmatter への分類フィールド追加を別途検討する。

例: `docs/adr/README.md` のトピック別ビューは、各 ADR の分類メタデータから全 ADR を主題別に網羅する。新規 ADR 追加時にトピック分類だけが更新されない事態（F-005）を構造的に防ぐ。

Decision Map は各 ADR 本文「関連する決定」セクションに記載された supersedes、relates-to、superseded-by 宣言を集計した結果とする。人手で Decision Map を直接編集しない。

### 一致の検証

自動生成の実行有無にかかわらず、docs-check（`check_integrity.ts`）が索引類と実ファイルの整合性を検証する。不整合を検出した場合、生成スクリプトの再実行または人手修正を促す（F-001、F-002、F-005 の根絶）。

### AUTOGEN block ID 命名パターン

AUTOGEN block ID は `{target}-{section}-{subsection}` 形式に従う。各要件は以下のとおり。

- `target`: 索引ファイルの短縮名（catalog, rule-ownership, adr, req, docmap, req-metrics, spec-metrics, readme）
- `section`: 索引ファイル内の自動生成対象セクション（ir-entries, ir-crossref, baseline, status, active, retired, inventory, measurement-example, req-summary）
- `subsection`: 同一セクション内の複数ブロック識別子（pre-045, post-045, count, table, accepted, proposed, superseded, deprecated 等）

採用 ID 参照例（Wave 1-5）:

| block ID | 索引ファイル | 由来 |
|---|---|---|
| `catalog-ir-entries-pre-045` | integrity-rule-catalog.md | Wave 1 |
| `catalog-ir-entries-post-045` | integrity-rule-catalog.md | Wave 1 |
| `rule-ownership-ir-crossref` | rule-ownership.md | Wave 1 |
| `adr-baseline-count`, `adr-baseline-table` | adr/README.md | Wave 2 |
| `adr-status-accepted` 等（proposed/superseded/deprecated） | adr/README.md | Wave 2 |
| `adr-retired-table` | adr/README.md | Wave 2 |
| `req-active-count`, `req-active-table`, `req-retired-table` | requirements/README.md | Wave 2 |
| `docmap-inventory` | DOC-MAP.md | Wave 2 |
| `req-metrics-measurement-example` | quality/req-health-metrics.md | Wave 3 |
| `spec-metrics-measurement-example` | quality/spec-health-metrics.md | Wave 3 |
| `readme-req-summary-count` | README.md | Wave 5 |

新規 AUTOGEN block は本形式に従う。Wave 1-5 以外の命名（camelCase、英語以外の混在等）は許容しない。

### appendix 表仕様（rule-ownership）

rule-ownership appendix は IR 別関連マッピング表を CSV ライクな Markdown 表形式で生成する。列構成は以下の4列。

| 列 | 内容 | 備考 |
|---|---|---|
| IR ID | `IR-NNN` 形式 | ファイル名由来 |
| title | IR 個別ファイルの H1 から抽出したタイトル | セル内パイプ・改行はサニタイズ |
| Related REQ | `related_req` 値（カンマ区切り）、無ければ `-` | frontmatter または本文 Field/Value 表由来 |
| Related SPEC | `related_spec` 値（カンマ区切り）、無ければ `-` | 同上 |

ヘッダー行と分離行は固定（`| IR ID | title | Related REQ | Related SPEC |` / `|-------|-------|-------------|--------------|`）。セル内にパイプ・改行が現れる場合は表構造を保持するためサニタイズする（catalog と同一規則）。

### SPEC 行数計測の AUTOGEN ブロック除外

SPEC 健全性メトリクス（`spec-health-metrics.md`「SPEC 計測例」）は SPEC 本文行数を計測する。計測対象 SPEC 自体に AUTOGEN ブロックが含まれる場合、AUTOGEN ブロックを行数計測対象から除外する。

除外により以下の2要件を両立する。

- SPEC 健全性: 人手執筆部分の肥大化検出を維持する（AUTOGEN 由来の行数は人手執筆ではない）
- べき等性: AUTOGEN ブロック自身が計測結果に影響しない。AUTOGEN ブロックのサイズ変動が SPEC 行数シグナルへ伝播する自己増幅ループを防止する

対象は AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=xxx -->` 〜 `<!-- AUTOGEN:END -->`）のみ。一般 HTML コメント（`<!-- ... -->`、複数行可）も同一規則で除外するが、コメント開始/終了と同一行にある本文は除外せず残置する。

## 人手編集領域と自動生成領域の分離

各索引ファイルは以下の3領域に分離する。

1. **人手編集領域**: 章導入、説明文、規約への参照など、自動生成対象外の本文。自由に編集可能
2. **自動生成領域**: 件数表明、一覧表、ビュー分類。自動生成マーカー（HTML コメントまたは固有の区切り行）で囲み、スクリプトが上書きする。人手編集は禁止
3. **混合領域**: 一覧表のうち一部列のみ自動生成、他列は人手編集とする場合。生成スクリプトは当該列のみ上書きし、他列を保持する

自動生成マーカーの形式は実装の段階導入で確定する。本 SPEC は領域分離の必要性のみを宣言する。

### 複数 AUTOGEN ブロック分割（catalog 2ブロック分割ポリシー）

1索引ファイル内で人手編集領域を挟むため、同一セクションに複数の AUTOGEN ブロックを分割して配置することを許容する。代表例は catalog（`integrity-rule-catalog.md`）の IR エントリ一覧である。

catalog は欠番 IR-045（削除済み、ファイル不在）を挟む2ブロック構成とする。人手編集領域（IR-045 削除注記）を中間に残置するため、自動生成領域を `catalog-ir-entries-pre-045`（IR-001〜IR-044）と `catalog-ir-entries-post-045`（IR-046 以降）の2ブロックへ分割する。生成スクリプトは各ブロックを独立して上書きし、中間の人手編集領域を保持する。

一般則: 欠番、注記、章導入等の人手編集領域を自動生成領域の中間に配置する必要がある場合、自動生成領域を複数ブロックへ分割することを許容する。分割時は各ブロック ID を `{target}-{section}-{subsection}` 形式で一意に識別する。

## 生成タイミング

生成は以下のいずれかのタイミングで実行する。最終的なタイミングは実装の段階導入で確定する。

- pre-commit hook: commit 直前に生成し、差分があれば index へ追加して commit する
- CI（GitHub Actions）: PR 作成時に生成し、差分があればチェック失敗とする
- 手動 trigger: メンテナが明示的にスクリプトを実行する

いずれのタイミングでも、生成結果と実体の不整合を検出した場合は即時修正を要する。

## 段階導入

本 SPEC が定義する機構は以下の段階で導入する。各段階の実施可否、タイミングは別途計画で確定する。

1. **Phase A（F-001/002/005 即時修正）**: 既知の不整合を人手修正で解消する（PR #1599 完了）
2. **Phase B（要件 SPEC 化）**: 本 SPEC を新設し、機構の契約を確定する（完了）
3. **Phase C（生成スクリプト実装）**: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` を新設し、主要な索引類から適用する。スクリプトは TypeScript + Bun 実行を前提とし、自動生成マーカー（HTML コメント形式 `<!-- AUTOGEN:BEGIN:id=xxx --> ... <!-- AUTOGEN:END -->`）で囲まれた領域を上書きする。docs-check 既存資産（cli_utils.ts, check_integrity.ts の parseFrontmatter, readText, listFiles 等）を再利用する
4. **Phase D（docs-check 組込）**: docs-check に新規 IR（IR-061: index generation consistency）を追加し、docs-check 実行時に自動生成の妥当性を検証する。CI（GitHub Actions 等）は導入せず、docs-check の定期実行で運用する。docs-check は G01 原則（検査対象を直接修正しない）を維持し、生成スクリプトは docs-check から独立して動作する
5. **Phase E（全索引展開）**: 対象索引すべてへ自動生成を展開する。Wave 1-5 で frontmatter 由来の件数・一覧表・ステータス別ビュー・メトリクス計測例・docs/README.md 件数表明を完了済。以下は frontmatter 由来でない、または混合領域が大半のため別途検討事項（個別 inspect-docs 等で評価対象）:
    - **トピック別ビュー、Decision Map、関連 REQ 表**（docs/adr/README.md）: frontmatter 由来でなく、各 ADR 本文のセクション構造・宣言（supersedes、relates-to、superseded-by、関連 REQ リンク）から導出する必要がある。導出規則の確定が前提
    - **docs/specs/README.md**: 各 SPEC 一覧表の status 列は frontmatter 由来で AUTOGEN 化可能だが、責務列等の混合領域が大半。一部列のみ AUTOGEN 化するか、全体を人手編集領域として残すかを別途判断
    - **docs/requirements/mapping-table.md**: 移行判定（migrated / retired-no-successor / historical-only）は人手判断であり frontmatter 由来でない。フル AUTOGEN 化は対象外

Phase C 以降は case-run 工程で実施する。本 SPEC は Phase B の成果物である。

## 関連情報

- 関連 REQ: REQ-0101（文書・REQ 管理基準）、REQ-0154（SPEC status 追跡と draft 放置検出）
- 関連 SPEC: `docs/specs/foundations/numbering-policy.md`（採番管理）、`docs/specs/integrity/integrity-rule-catalog.md`（整合性ルールカタログ）、`docs/specs/integrity/integrity-contracts.md`（整合性契約）
- 関連ルール: IR-038（ADR index consistency）、IR-039（index REQ title consistency）、IR-042（hardcoded req count）
- 根拠監査台帳項目: AG-006 候補2/3/8、F-001（ADR README キャプション）、F-002（accepted リスト）、F-005（トピック別ビュー）
