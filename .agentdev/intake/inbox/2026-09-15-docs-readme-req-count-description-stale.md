# docs/README.md 本文の REQ 件数記述が実数と乖離（50 vs 51）

## 内容

`docs/README.md` 本文の「現行要件は50件である」という件数記述に対し、実数は 51 である（req-range-staleness NG）。同一ファイル内 AUTOGEN ブロックは 51 で正を向いており、本文の手動記述のみが乖離している。

## 提案

本文の件数記述を実数（51）へ更新する。AUTOGEN 再生成で解消しない箇所であるため手動修正、または件数記述の除去・参照置換を検討する。

## 根拠

- 観測元: PR #2868 本文 Findings（Case #2852 の case-run 実行時に docs-check で検出、本筋外として記録）
- 観測時 commit: d7372002（PR #2868 head、merge 後の main HEAD は bf4a3224）
- docs-check req-range-staleness NG、同ファイル内 AUTOGEN ブロック（51）との突合

## 分類

- 分類: intake（具体的修正対象あり: docs/README.md 本文）
- 変更種別: docs（件数記述の現行化）
- 優先度: 低〜中（現行 README の入口記述の正確性に関わる）
