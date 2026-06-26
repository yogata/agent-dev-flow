---
title: "em-dash 査読是正 検証レポート: docs/requirements (0 件, Issue #1170)"
source_issue: 1170
parent_issue: 1169
operation_unit: OU-002
source_ru: RU-0006
generated_at: 2026-06-25T22:32:11+09:00
generator: case-run Epic Wave mode part 1 (兼務実装, harness limitation)
detection_method: Select-String (mechanical-replacement-rules.md section 2 algorithm)
scope: docs/requirements (retired/ 除く, src/opencode-local/ 除く)
exclusions: docs/requirements/retired/, テーブルセル `| — |` (PR #1122 対象外, CR-004)
---

# em-dash 査読是正 検証レポート: docs/requirements (Issue #1170)

## 目的

OU-002 Epic #1169 Wave 1 child Issue #1170 の完了条件を満たすため、`docs/requirements` 配下の em-dash 本体（半角空白挟み ` — `）残存件数を機械判定アルゴリズムで確定する。PR #1163 カタログ（commit ca95b945, merge e3486488）では当該ディレクトリの em-dash 本体件数を 0 件と報告しており、本検証はその再確認である。

## 検証対象

- 対象ディレクトリ: `docs/requirements`
- 除外ディレクトリ: `docs/requirements/retired/`（retired 旧版のため対象外）
- 除外対象: `src/opencode-local/`（CR-002: 本バッチ #1118 と排他）
- 除外パターン: テーブルセル `| — |`（PR #1122 で機械置換済み、CR-004 対象外）
- 検出アルゴリズム: `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2 本文中 ` — `（半角空白 + U+2014 + 半角空白）の行単位検索

## 検証対象ファイル一覧（47 ファイル、retired/ 除く）

```
docs/requirements/mapping-table.md
docs/requirements/README.md
docs/requirements/REQ-0101.md
docs/requirements/REQ-0102.md
docs/requirements/REQ-0103.md
docs/requirements/REQ-0104.md
docs/requirements/REQ-0105.md
docs/requirements/REQ-0106.md
docs/requirements/REQ-0107.md
docs/requirements/REQ-0108.md
docs/requirements/REQ-0109.md
docs/requirements/REQ-0110.md
docs/requirements/REQ-0112.md
docs/requirements/REQ-0113.md
docs/requirements/REQ-0114.md
docs/requirements/REQ-0119.md
docs/requirements/REQ-0123.md
docs/requirements/REQ-0124.md
docs/requirements/REQ-0125.md
docs/requirements/REQ-0126.md
docs/requirements/REQ-0127.md
docs/requirements/REQ-0128.md
docs/requirements/REQ-0129.md
docs/requirements/REQ-0130.md
docs/requirements/REQ-0131.md
docs/requirements/REQ-0132.md
docs/requirements/REQ-0133.md
docs/requirements/REQ-0134.md
docs/requirements/REQ-0135.md
docs/requirements/REQ-0136.md
docs/requirements/REQ-0137.md
docs/requirements/REQ-0138.md
docs/requirements/REQ-0139.md
docs/requirements/REQ-0140.md
docs/requirements/REQ-0141.md
docs/requirements/REQ-0142.md
docs/requirements/REQ-0143.md
docs/requirements/REQ-0144.md
docs/requirements/REQ-0145.md
docs/requirements/REQ-0146.md
docs/requirements/REQ-0147.md
docs/requirements/REQ-0148.md
docs/requirements/REQ-0149.md
docs/requirements/REQ-0150.md
docs/requirements/REQ-0151.md
docs/requirements/REQ-0152.md
docs/requirements/REQ-0153.md
```

## 検証結果

### 本文中 em-dash（` — `）検出件数: **0 件**

`Select-String -Pattern " — " -SimpleMatch`（半角空白 + U+2014 + 半角空白）を全 47 ファイルへ適用した結果、一致件数 0 件。

- retired/ 配下は検索対象から除外した。
- テーブルセル `| — |`（`| — |` 形式）の検出も 0 件（PR #1122 で対応済み、CR-004 対象外）。
- 対象ディレクトリのファイルは一切編集していない（0 件のため是正不要）。

### 判定根拠

1. **検出アルゴリズムの適用**: mechanical-replacement-rules.md section 2 の本文中 ` — ` 行単位検索を適用。テーブルセル `| — |` は N/A プレースホルダ用途（PR #1122 対象）であり、本検証の查読是正対象外（CR-004）。
2. **0 件の裏付け**: PR #1163 カタログ（`.agentdev/inspect/inbox/inspect-docs-finding-20260625-202639.md` L40）でも `docs/requirements` の X-2a 本体件数を 0 件と報告。本検証の独立再実行結果も 0 件で一致。
3. **查読是正対象の不存在**: em-dash 本体出現箇所が 0 件のため、同格置換（括弧）/ 句点分割 / マーク判定（許容表現・SPEC 明示例・code block 内）の各查読分類を適用すべき対象が存在しない。本 child Issue の查読是正対象は空集合である。
4. **除外領域の遵守**: retired/ は旧版のため対象外、src/opencode-local/ は CR-002 により本バッチと排他、いずれも未変更。

## 完了条件対応表

| 完了条件（Issue #1170） | 対応 | 証拠 |
|---|---|---|
| docs/requirements（retired/ 除く）の本文中 ` — ` 検出件数が 0 件であること | 満たす | 本レポート「検証結果」参照（47 ファイル検索、0 件） |
| テーブルセル `| — |` が存在しないこと（PR #1122 対象外確認、非出現） | 満たす | 本レポート「検証結果」参照（0 件） |
| 査読是正 対象（0 件）の全出現箇所で同格置換/句点分割/マークの查読を完了し、是正根拠を PR 本文に記録すること | 満たす | 出現箇所 0 件のため查読対象は空集合。判定根拠は本レポートおよび PR 本文に記録 |
| src/opencode-local/ ディレクトリを変更していないこと（CR-002） | 満たす | 本 PR は `.agentdev/inspect/inbox/1170-em-dash-verification.md` のみ追加。src/opencode-local/ は未変更 |

## Findings / Capture候補

特になし。PR #1163 カタログの 0 件宣言と本検証の 0 件が一致しており、乖離なし。

## SPEC確定候補

特になし。

## 参考

- Epic: #1169
- draft: `.agentdev/drafts/req-draft-docs-expression-consistency.md`（OU-002）
- 検出カタログ: `.agentdev/inspect/inbox/inspect-docs-finding-20260625-202639.md`（PR #1163）
- 検出アルゴリズム: `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2
