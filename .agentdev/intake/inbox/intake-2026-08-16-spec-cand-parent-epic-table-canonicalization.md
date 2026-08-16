# Intake Item: SPEC確定候補 — Parent 配置・Epic 追跡テーブル正規形の SPEC 側正典化の要否

## 発生源

- PR: #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

Parent 先頭行配置・分解テーブル {wave}-{seq} 形式の正規形は現在テンプレートコメント（issue_desc_child.md / issue_desc_epic.md）と agentdev-epic-tracker references に一元化済み。構造契約として agentdev-workflow-templates SPEC または epic-wave-model SPEC へ正規記載するか否かが未確定。

## 推奨対応

spec-save 経由で正典化の要否を判断する。正典化する場合は正規所有者（テンプレート選定規則は workflow-templates、Wave 構成は epic-wave-model）を尊重して配置を決める。

## 関連

- Issue: #2141 (CLOSED), Epic: #2134
- PR: #2152 (SPEC確定候補 セクション 2)
