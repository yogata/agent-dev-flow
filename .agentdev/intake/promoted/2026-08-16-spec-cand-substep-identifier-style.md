# Workflow Skill 本文のサブステップ識別子様式の明文化（SPEC確定候補）

## 観測内容

command-file-format.md の順序ラベル様式節は「実番号形式（STEP-1 等）」までしか規定しておらず、(a) reference 内サブステップの階層形式（STEP-N-M、STEP-N-M-K。ゼロ起点禁止の要否含む）、(b) STEP model 対象外型（capture-only / read-only-diagnostic）SKILL.md の工程一覧表ラベル契約（| STEP | 列に STEP-N 値）が未規定である。PR #2153 は case-open の先行変換例に倣い運用で統一した（16 Skill 横断で様式統一済み、merge commit fb0a5ac5）。

## 影響

- サブステップ階層形式が SPEC 未規定のまま運用のみで統一されているため、新規 Workflow Skill 作成時の基準が安定しない
- ゼロ起点副番号（E4-0）を含む既存実装（epic-wave-close.md）の適否が判定できない

## 課題

spec-save 経由で (a) サブステップ階層形式・副番号開始値、(b) 対象外型の工程一覧表ラベル契約を確定する。

## 既存要件・成果物との関連

- SPEC: command-file-format.md 順序ラベル様式節
- 関連: 2026-08-16-ou010-epic-wave-close-zero-based-e-label.md（ゼロ起点 E4-0 問題、併せて確定）
- 実績: PR #2153（16 Skill 横断様式統一、merge commit fb0a5ac5）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-spec-cand-substep-identifier-style.md
