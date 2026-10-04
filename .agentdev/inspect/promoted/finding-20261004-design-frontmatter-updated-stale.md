# 対象期間内変更 Design の frontmatter updated 未進行 3件

- **分類**: inspect finding promote（DS-03・severity low・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261004T162140Z（backlog-auto stage 1）。inspect-promote 2026-10-05 自律確定

## 観測（evidence・実測確認済み）

- 3ファイルとも本文は edeb841d/082bb32a（2026-10-04）で節・表追加済みだが、frontmatter `updated` が旧日のまま（実読確認済み）:
  - `docs/designs/skills/agentdev-git-worktree.md`（updated: 2026-09-05）
  - `docs/designs/skills/agentdev-quality-gates.md`（updated: 2026-09-19）
  - `docs/designs/quality/req-health-metrics.md`（updated: 2026-09-24）
- patterns.md:77 は Design frontmatter `updated` を最終更新日と定義
- 対照的に 082bb32a は case-* Design 群の updated を 2026-10-04 へ正しく進行させており運用が不均質
- IR-072 は REQ ファイルのみ対象で Design は機械検査未カバー

## 影響課題

Design の最終更新日が本文実態と乖離し、鮮度判断の根拠として機能しない。

## 対応候補

docs-check route: 3ファイルの metadata 是正 + Design 拡張の検査規則候補（IR-072 の affected_artifacts 拡張）。

## 既存要件関連

foundations/patterns.md Design frontmatter 規約。

## 統合注記（backlog-review での統合判定候補）

20260928 promote 済み RQ-23（REQ frontmatter updated と last commit 日付の突合）は REQ 側の同種検査。本件は Design 側拡張として backlog-review で束化判定可。
