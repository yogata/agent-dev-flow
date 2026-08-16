# Intake Item: SPEC確定候補 — Workflow Skill 本文のサブステップ識別子様式の明文化

## 発生源

- PR: #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

command-file-format.md の順序ラベル様式節は「実番号形式（STEP-1 等）」までしか規定しておらず、(a) reference 内サブステップの階層形式（STEP-N-M、STEP-N-M-K。ゼロ起点禁止の要否含む）、(b) STEP model 対象外型（capture-only / read-only-diagnostic）SKILL.md の工程一覧表ラベル契約（| STEP | 列に STEP-N 値）が未規定。PR #2153 は case-open の先行変換例に倣い運用で統一した（16 Skill 横断で様式統一済み、merge commit fb0a5ac5）。

## 推奨対応

spec-save 経由で (a) サブステップ階層形式・副番号開始値（ゼロ起点 E4-0 問題は intake-2026-08-16-ou010-epic-wave-close-zero-based-e-label.md 参照）、(b) 対象外型の工程一覧表ラベル契約を確定する。

## 関連

- Issue: #2144 (CLOSED), Epic: #2134
- PR: #2153 (SPEC確定候補 セクション 1)
