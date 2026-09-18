---
title: v3 -> v4 Concept / Artifact Crosswalk
status: draft
created: 2026-09-18
updated: 2026-09-18
---

# v3 -> v4 Concept / Artifact Crosswalk

位置づけ: 本 Design は ADF v4 モデルの定義（現行成果物の v4 での処遇記録）である。実際の置換・廃止は RU §24 の後続 Sequence で実行する。

## 分類軸

v4 でも保持する標準概念 / v4 で意味を再定義する標準概念 / Runtime に属する実装責務 / Project Model に属する情報 / semantic Skill に属する責務 / deterministic code/tool に属する責務 / Adapter に属する責務 / Project Extension に属する責務 / v3 mechanism から v4 mechanism へ置換するもの、の 9 分類。

## 対象範囲

現行 v3 の主要概念と主要成果物ごとの v4 での処遇（keep/redefine/置換先）を記録する。

- 主要概念: REQ/Decision/Design、work_type/scale/workflow_route、Epic/Wave、Case、QG-1〜QG-4、Intake/Learning/Backlog、Traceability（TIM/sidecar/policy）、Project Extensions、Command/Skill/Custom Tool/Plugin、scripts/**（決定的ツール・検証スイート）、traceability/**（sidecar/policy 機構）、配布物、.agentdev/ 状態領域
- 主要成果物: REQ-001〜087、DEC-001〜030、Design 群、scripts、traceability sidecar 群

## planned supersede の記録

v3 側 Decision（DEC-002、DEC-015、DEC-017、DEC-019、DEC-029、DEC-030 等）および Design の v4 での処遇を記録する。

- supersede/retire は後続段階（RU §24）で実行し、本 crosswalk は planned supersede として記録するに留める
- 実際の supersede/retire の実行は本 Design の対象外である
