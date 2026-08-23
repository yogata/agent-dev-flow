# missing-verification findings を未分類行として採用する記述と Issue 2419 導出契約統合の整合確認

## 観測

Issue 2418（PR #2424）の実装では、検証対応要否の分類状態導出を agentdev-traceability check の missing-verification findings と同義として利用し、req-save・case-open・case-close の各 Workflow Skill および fixture テストにその旨を記載した。Issue #2419（OU-3）が導出契約を check 操作へ明示統合する際、この記述群との整合確認が推奨されている（PR #2424 本文「Findings / Capture候補」3件目）。

## 今回扱わない理由

導出契約の check 操作への統合は Issue #2419（REQ-012-051）の担当範囲であり、Issue 2418 側で先行して契約を固定すると両 Issue の整合を崩すため、記録のみに留めた。

## 影響

なし（現時点で不整合は未発生。Issue #2419 実装時の確認事項として先回り記録したもの）。

## レビューで決めること

- Issue #2419 実装時に、missing-verification findings の意味（検証対応宣言なし＋検証対応要否カタログ未登録の行）が「未分類行」の定義と一致する形で check 操作仕様へ統合されることの確認
- 不一致が生じた場合の PR #2424 由来の各所記述（3 Workflow Skill、fixture テスト）の追随修正要否

## 根拠

- PR #2424 本文「Findings / Capture候補」3件目（発見元: case-run 実装）
- docs/designs/foundations/traceability-model.md「対応関係の完全性規則」節（commit 5cc32bb6）
