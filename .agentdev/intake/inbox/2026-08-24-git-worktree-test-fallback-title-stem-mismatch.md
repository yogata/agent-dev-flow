# agentdev-git-worktree-test-fallback.md の frontmatter title 先頭識別子が filename stem と不一致（frontmatter-id warning が恒常検出される）

## 観測

PR #2422 の checker 恒常実行（REQ-010-063 是正後の check_skill_rename_symmetry）において、`docs/designs/skills/agentdev-git-worktree-test-fallback.md` が frontmatter-id warning として検出される。当該 Design の frontmatter title「agentdev-git-worktree 構造系テスト fallback 契約」の先頭識別子（`agentdev-git-worktree`）が filename stem（`agentdev-git-worktree-test-fallback`）と一致せず、REQ-010-063 の恒常検査契約（Design frontmatter 識別子 ↔ Design ファイル物理 path の整合）に従い warning として恒常的に報告される（2026-08-24 case-close 独立再検査でも同一内容を確認。skills 51 / designs 35 走査で warning 1件のみ）。

## 今回扱わない理由

当該 Design は本 Case（Issue #2417、OU-1）の修正対象外である。本 Case の変更範囲は checker（check_skill_rename_symmetry.ts）・回帰テスト・repo-agentdev-integrity SKILL.md カテゴリ行のみであり、データ側の是正（title 先頭を stem に一致させる、またはファイルを rename する）は既存 Design の変更を伴うため、case-close の merge-only 委譲境界では対応しない。

## 影響

checker 恒常実行・docs-check 出力に warning 1件が恒常的に残存する（ng ではなく恒常契約上の正しい検出であるため、検査阻害にはならない）。

## レビューで決めること

- frontmatter title 先頭識別子を filename stem（`agentdev-git-worktree-test-fallback`）へ一致させる方向で是正するか、filename を title 識別子側へ rename するか
- 是正時に title 文言（「agentdev-git-worktree 構造系テスト fallback 契約」）の人間可読性をどこまで維持するか

## 根拠

- PR #2422 本文「Findings / Capture候補」intake、同「検証差分」checker 恒常実行行（既出記録）
- Issue #2417 実装記録コメント（case-close、2026-08-24、検証差分 checker 行）
- REQ-010-063 恒常検査契約（docs/designs/integrity/targeted-docs-guard-implementation.md「skill rename 対称性検査観点」節）
