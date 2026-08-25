# 検証対応要否カタログの REQ-049 旧行帯（020〜030）残存の解消

## 観測

トレーサビリティ check（case-run、case-close の独立再検査）で、検証対応要否カタログ（docs/designs/foundations/references/verification-scope-catalog.md）の REQ-049 エントリが旧番号体系（REQ-049-020〜030 帯）のまま残存し、invalid-catalog-refs 5件を生じている。REQ-049 全面再構成（REQ-049-001〜019 の新行体系、commit 30a04ecf）への追従漏れ。pre-existing で Wave 1 実装起因ではない。

## 今回扱わない理由

カタログ再構成は Epic 2436 の子Issue OU-08（Issue 2439、Wave 2）の担当スコープとして計上済み（Epic 本文補足情報の経過措置に明記）。case-close（Wave 1 境界クローズ）での個別解消は Wave 構成の責務境界を超える。

## 影響

トレーサビリティ check が invalid-catalog-refs 5件で exit 2 になり続ける（対象要件行の missing-verification とは無関係のため完了判定には影響しない）。カタログの REQ-049 行が現行要件行と対応しない期間が継続する。

## レビューで決めること

- OU-08（Issue 2439）でのカタログ REQ-049 行の新行体系（001〜019）への再構成方針（既定は Wave 2 で実施）

## 根拠

- PR 2440 本文「Findings / Capture候補」intake 1件目
- case-close トレーサビリティ独立再検査（.agentdev/tmp 証跡 cl-trace-check-head.json、invalid-catalog-refs 5件）
