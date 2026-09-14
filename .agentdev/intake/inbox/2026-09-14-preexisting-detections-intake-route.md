# pre-existing 検出の intake route 記録（case-update REQ-033 参照・REQ-030 phantom・inspect-skills 参照不整合）

## 概要

PR #2817 の検証で検出された pre-existing 不整合の intake route 記録。いずれも main 由来で本変更では導入していない。修正はそれぞれの専属 OU / 追跡 Issue での解消候補。

## 内容

- docs/designs/commands/case-update.md の REQ-033（retired）参照 9 件（unknown-req-refs）
- verification-scope-catalog / epic-wave-model 等の REQ-030-012..025 phantom 参照（invalid-catalog-refs）
- agentdev-inspect-skills references の `references/contracts.md` 参照不整合 15 件

## 根拠

- 観測元: case 2805 OU-004（DEL-2809-1、PR #2817）本文 Findings/Capture候補（intake 候補）、case-close（2026-09-14）で回収。case-close 独立再検査（traceability check・配布依存境界 gate）でも同一 findings を再検出（既出分類）
- 元テキスト: PR #2817 本文「pre-existing 検出の intake route 記録: docs/designs/commands/case-update.md の REQ-033（retired）参照 9 件、verification-scope-catalog / epic-wave-model 等の REQ-030-012..025 phantom 参照、agentdev-inspect-skills references の `references/contracts.md` 参照不整合 15 件（いずれも main 由来、本変更で導入していない）。分類: intake」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
