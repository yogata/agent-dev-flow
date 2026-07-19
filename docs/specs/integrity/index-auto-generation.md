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

## 人手編集領域と自動生成領域の分離

各索引ファイルは以下の3領域に分離する。

1. **人手編集領域**: 章導入、説明文、規約への参照など、自動生成対象外の本文。自由に編集可能
2. **自動生成領域**: 件数表明、一覧表、ビュー分類。自動生成マーカー（HTML コメントまたは固有の区切り行）で囲み、スクリプトが上書きする。人手編集は禁止
3. **混合領域**: 一覧表のうち一部列のみ自動生成、他列は人手編集とする場合。生成スクリプトは当該列のみ上書きし、他列を保持する

自動生成マーカーの形式は実装の段階導入で確定する。本 SPEC は領域分離の必要性のみを宣言する。

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
5. **Phase E（全索引展開）**: 対象索引すべてへ自動生成を展開する

Phase C 以降は case-run 工程で実施する。本 SPEC は Phase B の成果物である。

## 関連情報

- 関連 REQ: REQ-0101（文書・REQ 管理基準）、REQ-0154（SPEC status 追跡と draft 放置検出）
- 関連 SPEC: `docs/specs/foundations/numbering-policy.md`（採番管理）、`docs/specs/integrity/integrity-rule-catalog.md`（整合性ルールカタログ）、`docs/specs/integrity/integrity-contracts.md`（整合性契約）
- 関連ルール: IR-038（ADR index consistency）、IR-039（index REQ title consistency）、IR-042（hardcoded req count）
- 根拠監査台帳項目: AG-006 候補2/3/8、F-001（ADR README キャプション）、F-002（accepted リスト）、F-005（トピック別ビュー）
