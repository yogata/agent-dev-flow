# agentdev-quality-gates Design の bun test 実行形態契約節への正規形反映（Design確定候補）

## 観測

PR #2391（Issue #2381、OU-003）が skill 側（agentdev-quality-gates SKILL.md / QG-4 reference「bun test フル suite 正規形（実行形態契約）」節）にフル suite 正規形（3 cwd 分割実行・依存パッケージ前置・環境ラベル・件数突合・fail 由来分類）を確定した。

Design 正規原本 docs/designs/skills/agentdev-quality-gates.md の「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」節は旧記述（integrity suite 単体形）のままであり、Design を正とする整理（正規原本への反映）が求められている。

## 今回扱わない理由

Design ファイルの内容更新は design-save 系手順の責務であり、case-close の capture 責務は回収・保存のみ（Design 確定候補の処理は Findings / Capture候補 とは区別、STEP-3-2 パターン (c) 見送り: 候補を記録し後続へ委ねる）。

## 影響

Design と skill 側の実行形態契約が一時的に乖離し、QG-4 実行時の正の参照源が不安定になる。

## レビューで決めること

- docs/designs/skills/agentdev-quality-gates.md 同節への正規形反映（3 cwd 分割実行・依存パッケージ前置・環境ラベル・fail 由来分類）を design-save 系手順で実施するタイミング（Wave 2 OU-008（Issue #2386）のフル suite 必須化・機械受理の前提として整理する候補）

## 根拠

- PR #2391 本文「Design確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2391 ）
- docs/designs/skills/agentdev-quality-gates.md「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」節
