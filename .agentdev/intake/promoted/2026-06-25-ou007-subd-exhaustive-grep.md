# OU-007 SUB-D: integrity-rule-catalog.md 散文英語の網羅的検証

## 観測内容

OU-007 SUB-D（docs/specs/ 散文英語の推奨訳語置換）で、PR #1084 は明確に散文と判定できる 3 インスタンス（integrity-rule-catalog.md IR-026/IR-031 description, L1195）を修正した。
同ファイルには他にも `baseline` `provider` `variant` 等の単語が潜在する。
PR Findings では「多くは backtick 識別子・技術的複合語であり明確な散文普通名詞は限定的」と判断している。

## 影響

明確な散文インスタンスは既に置換済みであり、完了条件 #1082「散文英語が推奨訳に置換されている」は主要 3 インスタンスについて達成済み。
残存インスタンスが識別子（英語維持正解）か散文普通名詞（推奨訳語置換必要）かが未確認のため、網羅性に抜けが残る可能性がある。

## 課題

残存インスタンスを網羅的に grep 検証し、識別子 vs 散文を per-instance で分類確認する作業候補。

## 既存要件との関連

- Epic #1075（Wave 1）、Issue #1082（OU-007 個別構造課題・PARTIAL 完了）
- PR #1084（merged, squash 634ab481）
- 完了条件 #1082: SUB-D checkbox [x]、網羅掃點は後続課題として本文に注記
- Follow-up Issue #1086 は SUB-B/C のみ対象（SUB-D 網羅検証は本件で個別追跡）

## 対応方針の方向性

Wave 2（#1078 中黒・#1076 em-dash・#1079 LLM 表現・#1080 一文一行）の機械的置換と並行、または完了後に実施。
`grep` で `baseline|provider|variant|fixture` 等の候補を抽出し、per-instance で識別子 vs 散文を判定する。
