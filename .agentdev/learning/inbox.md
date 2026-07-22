# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## QG-3 誤検知パターン: spec_readme_update_required / extensions_check_required

- **由来**: PR #1745 (Issue #1738, Epic #1736 Wave 1)。REQ-0155 関連 REQ 相互参照追加のみの変更で誤検知。
- **問題**: SPEC 一覧表や extensions に影響しない軽微な変更でも `spec_readme_update_required: true` と `extensions_check_required: true` が立つ。判定ロジックが変更の意味内容を考慮していない。
- **再発防止候補**:
  - check_changed_docs.ts のフラグ判定を行レベル差分ベースへ変更
  - または README 更新必須判定を frontmatter 変更時に限定
  - または false positive 抑止フラグ追加
- **影響**: QG-3 の信頼性低下、agent の判断負荷増大
- **検出元**: PR #1745 本文 Findings/docs-integrity セクション
- **日付**: 2026-07-23
