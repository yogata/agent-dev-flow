# Design frontmatter updated の IR-072 違反 2件（local-case-file・custom-tool-contracts）

- 出所: inspect-docs 20261013T090730Z DS13（backlog-auto stage 1。機械検査 ReqFreshness NG 2件の裏付け）
- 種別: 修正候補（frontmatter updated の進行）
- 対象: docs/designs/local/local-case-file.md:5、docs/designs/responsibilities/custom-tool-contracts.md:5

## DS13: 機械検査NG裏付け: req-updated-freshness・IR-072、2件

- category: Design（機械検査NG裏付け: req-updated-freshness・IR-072、2件）
- target: `docs/designs/local/local-case-file.md:5`、`docs/designs/responsibilities/custom-tool-contracts.md:5`
- evidence: local-case-file.md は frontmatter `updated: 2026-10-04` に対し最終内容変更が 5958fe7e「ローカル版マージ取り込み保証の実装」2026-10-13（:143-147 のマージ結果節が該当差分）。custom-tool-contracts.md は frontmatter `updated: 2026-10-07` に対し最終内容変更が 321ebf3e「engine 入力契約の pr_merge commitHash 伝播」2026-10-13（:48 の pr_merge 入力契約が該当差分）。いずれも IR-072 違反。
- severity: low
- confidence: high
- source_of_truth: IR-072（docs/designs/integrity/rules/IR-072-req-updated-freshness.md）、git log
- recommended_route: 修正候補。両 frontmatter updated を 2026-10-13 へ進行。
- ng_classification: 今回修正対象候補（内容変更は今回 delta）。
- notes: 機械検査 ReqFreshness NG 2件の裏付け。本文内容と REQ 行の整合は別途問題なし（custom-tool-contracts の内容面は DS15 で別報）。

## 処置方針

1. local-case-file.md の frontmatter updated を 2026-10-13 へ進行する
2. custom-tool-contracts.md の frontmatter updated を 2026-10-13 へ進行する
3. 変更なし状態への復帰確認として check_integrity（IR-072）を再実行する

## 処置判断の根拠（inspect-promote 2026-10-13）

- 両ファイルの frontmatter updated（2026-10-04 / 2026-10-07）を現物実読確認
- 機械検査 ReqFreshness NG 2件（check_integrity、20261013 診断）が裏付け。修正は一意（updated 進行）

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: 両 frontmatter の現物実読で updated 不整合を再確認。
- Jev 評価: promote（0.92）で最終判断と一致（観測 20261013T094827Z-5dc0 d12）。
