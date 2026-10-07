# design-save 工程言及 7 箇所の廃止判定（REQ-103-016 処遇）を Wave 3 で確定する

## 内容

PR #3543（Case 3536・Wave 2-4 RA-004）の TS-013 網羅全文検索で、src/common 側に「design-save 工程」言及 7 箇所が残存していることが確認された（agentdev-design-file-manager SKILL.md・references/design-lifecycle-application.md、agentdev-quality-gates/references/qg-4-final-acceptance.md）。design-save は command 実体が存在しないが、語彙レジストリ実体の IR-050/051 対象 command リストには「公開 command」として列挙が維持されており、廃止判定が未確定の状態である。

- 本 Wave（RA-004）は投影領域の語彙追随が対象で、src/common 原本の責務記述・統制の再編は Wave 2-1〜2-3（RA-002）の所有。廃止確定・工程名置換は行わず本 intake として回収した
- .opencode 投影領域の旧 lifecycle 名 4 箇所（remediation-routing.md・SKILL.md）は本 PR で現行語彙へ修正済みで、本件は src/common 側の残存分

## 影響

旧語彙（design-save 工程）の現行規範としての使用が src/common 側に残り続け、REQ-103-022 の旧語彙除去の完全解消を阻害し得る。TS-013 網羅検索の検出継続対象として後続 Wave の case-close で毎回由来分類の説明が必要になる。

## 提案

Wave 3 横断検証（Issue 3538）の REQ-103-016 全面再評価、または RA-002 対象行の処遇判定時に、design-save 工程の廃止判定を確定し、言及 7 箇所を現行語彙（case-ready / case-revise 等の実在工程）へ置換する。語彙レジストリ実体の IR-050/051 対象リストからの除去も同時に実施する（関連 intake: 2026-10-07-case-3536-vocabulary-registry-ir050-051-entry-model.md）。

## 根拠

Epic #3530 Wave 2-4（Issue 3536）の PR 本文 Findings 節と TS-013 検証記録（case-run 申告: 検出 58 件のうち廃止説明・検出器語彙領域を除く現行参照残存候補として記録）。case-close STEP-6-4 で PR 本文 Findings から回収。

https://github.com/yogata/agent-dev-flow/pull/3543
