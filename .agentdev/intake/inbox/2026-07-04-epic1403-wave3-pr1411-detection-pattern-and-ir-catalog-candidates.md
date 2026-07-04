# 配布物参照境界 検知パターン・exemption・IR catalog の正式定義（SPEC確定候補）

## 観測

PR #1411（Epic #1403 Wave 3, Issue #1407）の SPEC確定候補セクションより。`check_distribution_boundary.ts` 実装で確定した検知パターン・exemption 運用・IR catalog エントリを SPEC として正式定義する候補を3つ提示。

## SPEC確定候補

### 候補1: 配布物参照境界 検知パターンの正式定義

`check_distribution_boundary.ts` 実装で確定した検知パターン:
- **具体ID**: `ADR-NNNN`, `REQ-NNNN` の4桁数字パターン
- **具体パス**: `docs/(adr|requirements|specs)/<file>.md`（ただし `README.md` は許容、テンプレート表記 `{}` `<>` `*` は許容）
- **固定URL**: `github.com/<owner>/<repo>/(blob|raw)/`, `raw.githubusercontent.com/<owner>/<repo>/`

### 候補2: exemption 運用

テンプレートプレースホルダー（`{NNNN}`, `<NNNN>`, `<existing-spec>`, `<domain>`, `<command>`, `<spec>`, `<rule>`）を行内に含む場合は具体ID/具体パス検査をスキップ。`README.md` への参照は索引として許容。

### 候補3: IR catalog エントリ

「Distribution reference boundary」を新 IR（例: IR-059）として以下へ登録するか、既存 IR-056 (project-extensions-integrity) の拡張とするかの判断:
- `docs/specs/integrity/integrity-rule-catalog.md`
- `docs/specs/integrity/rule-ownership.md`

## 影響

- 検知パターン・exemption が SPEC として確定されない場合、`check_distribution_boundary.ts` の実装依存となり将来の仕様変更時の整合性判断基準が不明確
- IR catalog への登録が未確定の場合、IR-056 の対象範囲（検査 #9/#10 は削除済み）と新 IR の責務境界が曖昧

## レビューで決めること

- 候補1/2: SPEC `docs/specs/foundations/project-extensions.md` の「検知パターン」セクションを新設し、上記パターンを accepted として追記するか（spec-save再起動または case-close Step 3-2 で昇格）
- 候補3: 新 IR-059 を新設するか、IR-056 を拡張するか（関連 intake: `spec-concrete-id-strictness-divergence` と併せて判断）

## 根拠

PR #1411 SPEC確定候補セクションより。Wave 3 case-close で回収。case-close Step 3-2 では処理せず見送り（SPEC 修正・IR 新設を伴うため）。本 intake は backlog-review → req-define → spec-save へ委ねる。
