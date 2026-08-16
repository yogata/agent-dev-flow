# Intake Item: SPEC確定候補 — inspect-docs 各 reference の手順節採番の工程単位再整理

## 発生源

- PR: #2150 (Issue #2142 / OU-008, Epic #2134 Wave 2)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

agentdev-workflow-inspect-docs の各 reference の手順節ヘッダは旧 Command 手順の通し番号（scan-and-doc-diagnostics.md が Step 1〜10、distribution-check-and-output.md が Step 11〜17）をファイル分割で引き継いでいる。Workflow Skill 工程単位の採番（STEP-2-1 等）へ再整理する候補。なお PR #2153（OU-010）はこれら reference に STEP-N-M 形式の変換を適用済み（Step 1〜10 → STEP-2-1〜2-9 等）のため、本体の再採番は完了している。残る論点は手順節の採番体系を SPEC に正規記載するか否か。

## 推奨対応

PR #2153 の変換結果（merge commit fb0a5ac5）を踏まえ、手順節採番の正規契約を spec-save 経由で確定するか、現状運用（工程表+節名参照）で十分と判断するかを協議する。agentdev-doc-diagnostics からの参照は節名ベースのため再採番の影響を受けない。

## 関連

- Issue: #2142 (CLOSED), Epic: #2134
- PR: #2150 (SPEC確定候補 セクション)
- 関連変換: PR #2153 (Issue #2144, CLOSED)
