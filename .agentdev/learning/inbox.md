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

## Phase 1 一括 commit 運用パターン: 子Issue case-run が acceptance criteria 確認主体

- **由来**: PR #1748（Issue #1741、Epic #1736 Wave 3）
- **問題**: RU-20260722-02 の8 AG を Phase 1 commit 0192019c で一括保存した結果、Wave 1〜3 の子Issue case-run は実装追加でなく acceptance criteria 順位検証と小改善が主体となった。Wave 1 #1737, #1738、Wave 2 #1739, #1740 と同様のパターン（Phase 1 保存内容の確認 + 小改善）。この運用では子Issue の実質的完了判定が case-close に集中する。
- **再発防止候補**: Phase 1 一括保存と Phase 2 case-open の分離基準の明文化。acceptance criteria 順位検証のみの子Issue と実装追加の子Issue の完了条件テンプレート分離検討。
- **影響**: 子Issue の完了条件評価が case-close で都度行う負荷。Wave 単位で同パターンが再発。
- **検出元**: PR #1748 本文 Findings / Capture候補 セクション
- **日付**: 2026-07-23（Wave 3）

## 用語表記揺れの横断確認不足: SPEC 起票時の揺れが同一文書内に残留

- **由来**: PR #1749（Issue #1742、Epic #1736 Wave 3）
- **問題**: spec-health-metrics.md「SPEC 横断診断」節に「論理区分不当混成」（機械化境界段落）と「論理区分不当混在」（検出パターンテーブル行）の表記揺れが同一節内に残留していた。Phase 1 commit 0192019c 起票時の揺れと推定される。REQ-0108-285（「論理区分の不当な混在」）、Issue #1742 完了条件 #6（「不当混在」）とも矛盾する表記であり、起票時の用語統一が不十分だった。同種の揺れが他 SPEC にも残留していないか、inspect-docs / doc-writing 査読での横断確認が望ましい。
- **再発防止候補**: SPEC 起票時の用語統一チェックの強化。inspect-docs への用語揺れ検出パターン追加の検討。
- **影響**: 同一 SPEC 内の用語不統一による読手の負荷、REQ と SPEC の表記矛盾。
- **検出元**: PR #1749 本文 Findings / Capture候補 セクション
- **日付**: 2026-07-23（Wave 3）

## SPEC 主論理区分・正規所有対象宣言の未宣言: spec-save 段階適用の準備状態

- **由来**: PR #1750（Issue #1743、Epic #1736 Wave 4 最終 Wave）
- **問題**: SPEC 再評価基準（主論理区分、正規所有対象）の frontmatter 宣言状況を全現行 SPEC 142ファイルで横断確認した結果、`foundations/document-model.md`（L399, 401 で規定を述べる）のみ `spec_logical_division` / `canonical_owner` フィールド宣言を持ち、他 141 SPEC ファイル（基盤 SPEC、command SPEC、skill SPEC、横断 SPEC、IR-* ルール詳細）は frontmatter で主論理区分・正規所有対象を未宣言。OU-007 で責務境界浄化の基準を規定した段階で、宣言形式の運用は「後方互換運用（REQ-0136-035、ADR-0124 soft-contract）」に従い段階適用・警告モード扱いとしている。不合格理由ではないが、宣言付与の運用フローが未整備。
- **再発防止候補**: spec-save 工程で新規 SPEC から段階的に宣言付与を適用する手順の整備。既存 SPEC は spec-save UPDATE 機会で順次宣言付与。spec-health-metrics で宣言率を指標化し、検知の機械化を検討。
- **影響**: 142 SPEC 中 141ファイルが宣言未対応。spec-save で新規 SPEC を作成する際、宣言形式の参考がない状態で起票される可能性。横断的再評価（QG-3/QG-4）でも宣言ベースの判定が機能しない。
- **検出元**: PR #1750 本文 Findings / Capture候補 セクション F-2
- **日付**: 2026-07-23（Wave 4）
