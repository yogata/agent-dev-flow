---
title: "em-dash 査読是正 検証レポート: docs/adr (0 件, Issue #1171)"
source_issue: 1171
parent_issue: 1169
operation_unit: OU-002
source_ru: RU-0006
generated_at: 2026-06-25T22:34:45+09:00
generator: case-run Epic Wave mode part 1 (兼務実装, harness limitation)
detection_method: Select-String (mechanical-replacement-rules.md section 2 algorithm)
scope: docs/adr (retired/ 除く, src/opencode-local/ 除く)
exclusions: docs/adr/retired/, テーブルセル `| — |` (PR #1122 対象外, CR-004)
---

# em-dash 査読是正 検証レポート: docs/adr (Issue #1171)

## 目的

OU-002 Epic #1169 Wave 1 child Issue #1171 の完了条件を満たすため、`docs/adr` 配下の em-dash 本体（半角空白挟み ` — `）残存件数を機械判定アルゴリズムで確定する。PR #1163 カタログ（commit ca95b945, merge e3486488）では当該ディレクトリの em-dash 本体件数を 0 件と報告しており、本検証はその再確認である。

## 検証対象

- 対象ディレクトリ: `docs/adr`
- 除外ディレクトリ: `docs/adr/retired/`（retired 旧版のため対象外）
- 除外対象: `src/opencode-local/`（CR-002: 本バッチ #1118 と排他）
- 除外パターン: テーブルセル `| — |`（PR #1122 で機械置換済み、CR-004 対象外）
- 検出アルゴリズム: `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2 本文中 ` — `（半角空白 + U+2014 + 半角空白）の行単位検索

## 検証対象ファイル一覧（25 ファイル、retired/ 除く）

```
docs/adr/ADR-0101.md
docs/adr/ADR-0102.md
docs/adr/ADR-0103.md
docs/adr/ADR-0104.md
docs/adr/ADR-0105.md
docs/adr/ADR-0106.md
docs/adr/ADR-0107.md
docs/adr/ADR-0108.md
docs/adr/ADR-0109.md
docs/adr/ADR-0110.md
docs/adr/ADR-0111.md
docs/adr/ADR-0112.md
docs/adr/ADR-0113.md
docs/adr/ADR-0114.md
docs/adr/ADR-0123.md
docs/adr/ADR-0124.md
docs/adr/ADR-0125.md
docs/adr/ADR-0126.md
docs/adr/ADR-0127.md
docs/adr/ADR-0128.md
docs/adr/ADR-0129.md
docs/adr/ADR-0130.md
docs/adr/ADR-0131.md
docs/adr/ADR-0132.md
docs/adr/README.md
```

## 検証結果

### 本文中 em-dash（` — `）検出件数: **0 件**

`Select-String -Pattern " — " -SimpleMatch`（半角空白 + U+2014 + 半角空白）を全 25 ファイルへ適用した結果、一致件数 0 件。

- retired/ 配下は検索対象から除外した。
- テーブルセル `| — |`（`| — |` 形式）の検出も 0 件（PR #1122 で対応済み、CR-004 対象外）。
- 対象ディレクトリのファイルは一切編集していない（0 件のため是正不要）。

### 判定根拠

1. **検出アルゴリズムの適用**: mechanical-replacement-rules.md section 2 の本文中 ` — ` 行単位検索を適用。テーブルセル `| — |` は N/A プレースホルダ用途（PR #1122 対象）であり、本検証の查読是正対象外（CR-004）。
2. **0 件の裏付け**: PR #1163 カタログ（`.agentdev/inspect/inbox/inspect-docs-finding-20260625-202639.md` L41）でも `docs/adr` の X-2a 本体件数を 0 件と報告。本検証の独立再実行結果も 0 件で一致。
3. **查読是正対象の不存在**: em-dash 本体出現箇所が 0 件のため、同格置換（括弧）/ 句点分割 / マーク判定（許容表現・SPEC 明示例・code block 内）の各查読分類を適用すべき対象が存在しない。本 child Issue の查読是正対象は空集合である。
4. **除外領域の遵守**: retired/ は旧版のため対象外、src/opencode-local/ は CR-002 により本バッチと排他、いずれも未変更。

## 完了条件対応表

| 完了条件（Issue #1171） | 対応 | 証拠 |
|---|---|---|
| docs/adr（retired/ 除く）の本文中 ` — ` 検出件数が 0 件であること | 満たす | 本レポート「検証結果」参照（25 ファイル検索、0 件） |
| テーブルセル `| — |` が存在しないこと（PR #1122 対象外確認、非出現） | 満たす | 本レポート「検証結果」参照（0 件） |
| 査読是正 対象（0 件）の全出現箇所で同格置換/句点分割/マークの查読を完了し、是正根拠を PR 本文に記録すること | 満たす | 出現箇所 0 件のため查読対象は空集合。判定根拠は本レポートおよび PR 本文に記録 |
| src/opencode-local/ ディレクトリを変更していないこと（CR-002） | 満たす | 本 PR は `.agentdev/inspect/inbox/1171-em-dash-verification.md` のみ追加。src/opencode-local/ は未変更 |

## Findings / Capture候補

特になし。PR #1163 カタログの 0 件宣言と本検証の 0 件が一致しており、乖離なし。

## SPEC確定候補

特になし。

## 参考

- Epic: #1169
- draft: `.agentdev/drafts/req-draft-docs-expression-consistency.md`（OU-002）
- 検出カタログ: `.agentdev/inspect/inbox/inspect-docs-finding-20260625-202639.md`（PR #1163）
- 検出アルゴリズム: `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2
