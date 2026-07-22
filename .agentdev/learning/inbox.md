# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## QG-3 誤検知パターン: spec_readme_update_required / extensions_check_required

- **由来**: PR #1745 (Issue #1738, Epic #1736 Wave 1)。REQ-0155 関連 REQ 相互参照追加のみの変更で誤検知。
- **問題**: SPEC 一覧表や extensions に影響しない軽微な変更でも `spec_readme_update_required: true`、`requirements_readme_update_required: true`、`extensions_check_required: true` が立つ。判定ロジックが変更の意味内容を考慮していない。
- **再発**: PR #1746 (Issue #1739, Epic #1736 Wave 2)。artifact-responsibilities.md / learning-promote.md の SPEC 内参照表記是正（ADR-0139 参照追記、相対パス是正）のみの変更で `requirements_readme_update_required: true`（REQ ファイル未変更）と `extensions_check_required: true`（extensions に影響しない）が再び立つ。Wave 1 と同様に誤検知として処理。Wave 2 case-close の targeted docs guard (case-close workflow) でも同一フラグが立つ。
- **再発防止候補**:
  - check_changed_docs.ts のフラグ判定を行レベル差分ベースへ変更
  - または README 更新必須判定を frontmatter 変更時に限定
  - または false positive 抑止フラグ追加
- **影響**: QG-3 の信頼性低下、agent の判断負荷増大、Wave 単位で再発し agent が都度誤検知判定を強いられる
- **検出元**: PR #1745 本文 Findings/docs-integrity セクション（Wave 1）、PR #1746 本文 Findings / Capture候補 セクション（Wave 2）
- **日付**: 2026-07-23（Wave 1）、2026-07-23（Wave 2 再発追記）
