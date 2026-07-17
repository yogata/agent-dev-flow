# Intake Item: SPEC 確定候補（見送り）— artifact-responsibilities.md / command-authoring-standards.md

## 発生源

- PR: #1534 (Issue #1532, direct_case / maintenance)
- 発生 phase: case-close Step 3-2 (SPEC 確定フロー、見送り選択)
- capture 分類: intake (具体的修正対象 = SPEC 修正候補)

## 問題

PR #1534 の SPEC確定候補として case-run 実行担当者が2候補を記録した。case-close Step 3-2 で「見送り（c）」を選択し、後続 spec-save へ委譲する。

### 候補1: artifact-responsibilities.md「SKILL ↔ command 同一ルール重複許容基準」適用例の追記

project extensions boilerplate のように「command 公開契約の宣言部分」と「詳細契約」を分離できる場合の許容基準具体例を SPEC に追記すると、今後の類似判断が明確になる。

### 候補2: command-authoring-standards.md「Step 番号と詳細手順の配置」セクションの整理

現行 SKILL.md は「整数 Step のみ」と厳格、references は「N-M 形式は局所確認/VERIFY/分岐のみ OK」と許容。両者の表現ブレを整理し、どの Step X-Y が許容されるかの判定基準を SPEC 側で明確化する候補。

## 推奨修正対象

後続 spec-save で以下を検討:

1. artifact-responsibilities.md に重複許容基準の適用例を追記（project extensions boilerplate を事例化）
2. command-authoring-standards.md に Step X-Y 許容基準を整理（SKILL.md と references の表現ブレ解消）

CR-002 合意（SPEC 修正は case-run 都度 spec-save で対応）に従い、本 Issue の完了条件には含めず、後続で対応する。

## 関連

- PR: #1534 (SPEC確定候補 セクション)
- Issue: #1532 (REQ-0119, OU-001/RU-20260718-01)
- 合意: CR-002（SPEC 修正は case-run 都度 spec-save）
- SPEC: docs/specs/responsibilities/artifact-responsibilities.md, docs/specs/responsibilities/command-authoring-standards.md（※パスは extension 経由で確認）
