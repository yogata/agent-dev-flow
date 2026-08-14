# intake: thin Command の workflow 節における順序ラベル様式の統一基準が authoring/command-file-format.md へ未反映

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: case-run 実行（Stage 2、Issue 2105 / PR 2115）の SPEC確定候補処置で発見。PR 2115 本文「## Findings / Capture候補」より case-close が回収

## 問題事象

thin Command の workflow 節における順序ラベル様式（`### Step N` / `STEP-N` / `工程-N`）の統一基準、および同節の記述量基準といった執筆詳細が `docs/specs/authoring/command-file-format.md`（authoring ドメイン）へ反映されていない。

PR 2114 の SPEC確定候補のうち、workflows 側の構成契約（thin Command の workflow 節標準構造）は workflow-skill-model.md へ反映したが、執筆詳細の authoring/command-file-format.md への反映は Issue 2105（OU-005）の対象範囲（docs/specs/commands/ 全16件と workflows 横断 SPEC）外のため見送った。

## 影響

- 16 Workflow Skill の workflow 節で順序ラベル様式が3変種混在する状態が正規基準なしで継続する（文書品質上の medium severity。機能・検査への影響なし）

## 発生局面

実装（case-run Wave 3、SPEC確定候補処置の対象範囲判定）

## 検知方法

PR 2115 本文「## SPEC確定候補」処置列の「一部反映」記載と thin Command 化済み command 定義の順序ラベル観測

## 想定される対応方向

- 順序ラベル様式（`### Step N` / `STEP-N` / `工程-N` のいずれかに統一、または使い分け基準）と workflow 節の記述量基準を authoring/command-file-format.md へ規定する
- 採否・優先度は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2105（OU-005）, PR: 2115
- 発見元: PR 2114 SPEC確定候補（thin Command の workflow 節標準構造）
- 反映済み対称例: docs/specs/workflows/workflow-skill-model.md「thin Command の workflow 節標準構造」（PR 2115）

## 出典引用

PR 2115 本文「## Findings / Capture候補」より:

> thin Command の workflow 節における順序ラベル様式（`### Step N` / `STEP-N` / `工程-N`）の統一基準、記述量基準といった執筆詳細の docs/specs/authoring/command-file-format.md（authoring ドメイン）への反映。本 Issue の対象範囲は docs/specs/commands/ 全16件と workflows 横断 SPEC のみのため見送り、後続 issue 候補として記録する（発見元: PR #2114 SPEC確定候補のうち workflows 側構成契約のみを反映した残）

## タグ

#intake #command-file-format #order-label #authoring #epic-2099
