---
title: 索引類自動生成 SPEC
status: accepted
created: 2026-07-19
updated: 2026-07-24
---

# 索引類自動生成 SPEC

README 群、索引類、件数表明を実ファイルの frontmatter から再生成する機構を定義する。
人手更新に依存する件数や一覧の追記漏れを構造的に根絶し、実体と索引の不整合を発生させない。

本 SPEC は機構の契約を定義し、実装（生成スクリプト、CI 組込、pre-commit hook 等）は対象外とする。

## 適用範囲

- **現在自動生成される領域**: 実装済みAUTOGENブロックで生成される件数、一覧、status別ビュー、IR索引、関連マッピング、メトリクス例
- **現在人手管理される領域**: ADRトピック別ビュー、Decision Map、ADR関連REQ表、REQ移行判定
- **現在混合管理される領域**: 自動生成列と人手管理列が同一表に共存し、生成実装が対象列だけを更新する領域
- **対象外**: REQ、ADR、SPEC本文そのもの、および未実装の将来自動生成計画
## 自動生成の対象領域と生成元

| 索引類 | 現在の管理 | 生成元 |
|---|---|---|
| `docs/requirements/README.md`のREQ一覧・件数 | 自動生成 | REQ frontmatter |
| `docs/adr/README.md`の基盤一覧・status別一覧・件数 | 自動生成 | ADR frontmatter |
| `docs/adr/README.md`のトピック別ビュー・Decision Map・関連REQ表 | 人手管理 | ADR本文と人手判断 |
| `docs/specs/README.md`のSPEC一覧・status列 | 現行実装に従う混合管理 | SPEC frontmatterと人手管理列 |
| `docs/DOC-MAP.md`のインベントリ | 自動生成 | 実ファイル一覧 |
| `docs/requirements/mapping-table.md`の移行判定 | 人手管理 | 旧REQから現行REQへの移行判断 |
| integrity rule catalogとrule ownershipのAUTOGENブロック | 自動生成 | 個別IR文書 |
| REQ/SPECメトリクス計測例 | 自動生成 | 対象文書の計測結果 |

管理区分を変更する場合は、本SPEC、生成実装、検査実装を同時に整合させる。
## 生成規則

### 件数表明

件数表明は実ファイル frontmatter 値を集計した結果と一致すること。人手で件数を記述せず、自動生成マーカーで囲んだ領域へスクリプトが集計結果を出力する。

例: `docs/adr/README.md` のキャプション「承認済みステータス（accepted）の ADR-01XX 25件」は、`docs/adr/ADR-*.md` のうち `status: accepted` を集計した結果でなければならない。

### 一覧の網羅性

各一覧表は実ファイル全体を網羅する。追加、廃止、移動が発生した場合は生成タイミングで自動的に一覧へ反映される。人手による一覧行の追加、削除は原則として行わない（自動生成マーカー外の編集領域のみ人手編集を許容する）。

例: `docs/adr/README.md` のステータス別ビュー「承認済み（accepted）」リストは、`docs/adr/ADR-*.md` のうち `status: accepted` の全 ADR を漏れなく網羅しなければならない。新規 ADR 追加時にリストだけが更新されない事態を構造的に防ぐ。

### ステータス別ビュー、トピック別ビュー

ステータス別ビューはADR frontmatterから自動生成する。トピック別ビュー、Decision Map、関連REQ表は現在人手管理とし、実装されていない生成処理を現在契約として扱わない。
### 一致の検証

自動生成の実行有無にかかわらず、docs-check（`check_integrity.ts`、IR-061）が索引類と実ファイルの整合性を検証する。不整合を検出した場合、生成スクリプトの再実行または人手修正を促す。

### AUTOGEN block ID 命名パターン

AUTOGEN block ID は `{target}-{section}-{subsection}` 形式に従う。各要件は以下のとおり。

- `target`: 索引ファイルの短縮名（catalog, rule-ownership, adr, req, docmap, req-metrics, spec-metrics, readme）
- `section`: 索引ファイル内の自動生成対象セクション（ir-entries, ir-crossref, baseline, status, active, retired, inventory, measurement-example, req-summary）
- `subsection`: 同一セクション内の複数ブロック識別子（pre-045, post-045, count, table, accepted, proposed, superseded, deprecated 等）

採用 ID 参照例:

| block ID | 索引ファイル |
|---|---|
| `catalog-ir-entries-pre-045` | integrity-rule-catalog.md |
| `catalog-ir-entries-post-045` | integrity-rule-catalog.md |
| `rule-ownership-ir-crossref` | rule-ownership.md |
| `adr-baseline-count`, `adr-baseline-table` | adr/README.md |
| `adr-status-accepted` 等（proposed/superseded/deprecated） | adr/README.md |
| `adr-retired-table` | adr/README.md |
| `req-active-count`, `req-active-table`, `req-retired-table` | requirements/README.md |
| `docmap-inventory` | DOC-MAP.md |
| `req-metrics-measurement-example` | quality/req-health-metrics.md |
| `spec-metrics-measurement-example` | quality/spec-health-metrics.md |
| `readme-req-summary-count` | README.md |

新規 AUTOGEN block は本形式に従う。camelCase、英語以外の混在等は許容しない。

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

## 現在稼働している自動生成契約

本 SPEC が定義する機構は現在以下の契約で稼働している。

1. **現在 AUTOGEN されている領域**: frontmatter 由来で機械生成される件数、一覧、ステータス別ビュー等。生成スクリプト `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` が存在し、AUTOGEN ブロック（HTML コメント形式 `<!-- AUTOGEN:BEGIN:id=xxx --> ... <!-- AUTOGEN:END -->`）で囲まれた領域を上書きする。docs-check 既存資産（cli_utils.ts, check_integrity.ts の parseFrontmatter, readText, listFiles 等）を再利用する。
2. **現在人手管理されている領域**: 導出規則が未確定、混合領域、人手判断を含む領域。後述「現在人手管理領域の5領域」参照。
3. **各領域の正規情報源**: frontmatter、各文書本文のセクション構造、宣言等。
4. **人手管理領域に対する整合性確認方法**: docs-check（IR-061、IR-038、IR-039、IR-042）による検出、人手レビュー等。

docs-check は G01 原則（検査対象を直接修正しない）を維持し、生成スクリプトは docs-check から独立して動作する。

### AUTOGEN marker 検出契約

generate_indexes.ts の AUTOGEN marker 検出は、行全体が正規のHTMLコメントマーカー形式（`<!-- AUTOGEN:BEGIN:id=xxx -->` または `<!-- AUTOGEN:END -->`）に一致するかで判定する。説明文中の backtick 囲み（インラインコード）AUTOGEN marker 記述を実 marker と誤認せず、行全体一致判定で自動的に除外する。backtick 文脈判定のような部分一致ロジックは併用しない。これにより正常な AUTOGEN block 認識の失敗と索引再生成の途中停止を防止する（PR #1718 の HTML コメント構文抽象化による暫定対応と置換）。正例（正規マーカー行）、負例（backtick 囲み marker 文字列を含む説明文）、境界例（マーカー行に backtick が隣接する場合）を含む回帰テストが生成スクリプトに付属する。

### 現在人手管理領域の5領域

以下5領域は現在契約上の自動生成対象外（人手管理領域）として確定する。これは「永久に自動化しない」決定ではなく、「現在実装されていない機能を実装済み契約として扱わない」決定である。将来、導出規則と生成機構を別要件で確定すれば本 SPEC を更新できる自動生成拡張ポイントである。

- **ADR README トピック別ビュー**: 人手管理。導出規則未確定のため。
- **ADR README Decision Map**: 人手管理。各 ADR 本文の宣言から導出するが、導出規則が未確定のため。
- **ADR README 関連 REQ 表**: 人手管理。各 ADR の関連宣言から導出するが、導出規則が未確定のため。
- **docs/specs/README.md**: 人手管理または既存生成部分のみ AUTOGEN。status 列は AUTOGEN 可能だが、責務列等の混合領域が大半のため、現状では一部列のみ AUTOGEN または人手管理。
- **docs/requirements/mapping-table.md**: 人手判断（migrated/retired-no-successor/historical-only 判定）を含むため人手管理。

## 関連情報

- 関連 REQ: REQ-0101（文書・REQ 管理基準）、REQ-0154（SPEC status 追跡と draft 放置検出）
- 関連 SPEC: `docs/specs/foundations/numbering-policy.md`（採番管理）、`docs/specs/integrity/integrity-rule-catalog.md`（整合性ルールカタログ）、`docs/specs/integrity/integrity-contracts.md`（整合性契約）
- 検査契約: IR-061（index generation consistency）、IR-038（ADR index consistency）、IR-039（index REQ title consistency）、IR-042（hardcoded req count）
