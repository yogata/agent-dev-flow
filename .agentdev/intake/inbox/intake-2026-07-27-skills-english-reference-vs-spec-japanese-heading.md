# Intake Item: inspect-docs / inspect-skills からの document-model L580 cleanup モデル明示参照検討

## 発生源

- PR: #1848 (Issue #1847 / OU-001, Epic #1845 Wave 1)
- 発生 phase: case-run 検証（src/opencode/skills/** の document-model.md 参照 handoff 整合確認時）
- capture 分類: intake（具体的検討候補、積み残し作業候補）

## 問題

`docs/specs/foundations/document-model.md` L580「## 恒久基準と非規範情報の整理」は cleanup 実行契約として新設されたが、`src/opencode/skills/**` でこれを処置契約として明示的に参照しているスキルは現在存在しない。L580 は inspect-docs / inspect-skills / 専用 cleanup 作業（L584）を想定するが、各 inspect 系スキルが L580 cleanup モデルを明示参照するか、cleanup 実行時に L580 を適用するかは、本 Issue #1847 の「既存参照の整合確認」スコープ外であったため未検証である。

## 推奨検討対象

- `src/opencode/skills/agentdev-doc-diagnostics/`: inspect-docs の cleanup 実行時に L580 を処置契約として明示参照するか
- `src/opencode/skills/agentdev-req-structure-diagnostics/`: 同上
- `src/opencode/skills/agentdev-inspect-skills/`: 同上
- `src/opencode/skills/agentdev-learning-pipeline/`、`agentdev-intake-pipeline/`: L153 適格性判定を既に参照するこれらのスキルが L580 cleanup 実行契約を併用するか

## 推奨対応

別途 `/agentdev/inspect-promote` 等で採用判断を行う。本 Intake Item は検討候補（推奨）であり、直ちに cleanup を要求するものではない。L580 セクションは inspect 系 cleanup 実行のための契約 SSoT として機能できる状態にある。

## 関連

- references: docs/specs/foundations/document-model.md (L580-639, 特に L584)
- Issue: #1847 (CLOSED), Epic: #1845 (CLOSED)
- PR: #1848 (Findings / Capture候補 セクション F-2)
- commit: 6eeedabf（spec-save）、025a20a1（OU-001 case-close）
- source finding: 「Skill handoff 結果」F-2
