# Workflow Skill 間の STEP 識別子書式不統一（マスク形式 vs 実番号）

## 観測内容

case-open/case-auto の Workflow Skill は STEP 識別子がマスク形式（`STEP-{N}`）、case-close は実番号（`STEP-1` 等）で記述されており不統一。Wave 2 で新設した5 Workflow Skill は実番号を採用したため、既存2 skill が旧形式のまま残っている。

## 影響

- STEP 参照の書式混在が横断参照・機械検査の前提を損なう
- skill 間の STEP 対応関係の追跡コストが増加する

## 課題

case-open/case-auto の STEP 識別子を実番号へ統一する。横断是正候補として OU-005/OU-007 での対応候補。

## 既存要件・成果物との関連

- 対象: agentdev-workflow-case-open、agentdev-workflow-case-auto の SKILL.md および references/
- 関連: OU-005、OU-007、Wave 2 Workflow Skill 5件（実番号採用済み）

## 出典

- 発生日: 2026-08-15
- 取得元: Epic #2099 remediation 過程の観測
- 元 item: intake-2026-08-15-workflow-step-id-mask-vs-real-inconsistency.md
