# 配布物本文内の相互参照パスの解決可能性検査（E4-1 配布依存境界 gate の検出強化別候補）

## 観測内容

- PR #4070（Issue #4068・RU-0279）は是正対象の欠陥クラス（配布物本文内の相互参照パス表記が上流専用の `src/common/skills/...` 形式で配布レイアウトで解決不能）であり、E4-1 配布依存境界 gate は非検出であった。PR 本文「E4-1 非検出事実と検出強化要否評価」セクションで評価済み。
- gate の検出対象は配布物本文への producer 側トレーサビリティ metadata（concrete ID・concrete path・fixed URL）直書きであり、本欠陥クラスは metadata 直書きに該当せず非検出は gate の目的に対する欠陥ではない（TS-006 評価の結論）。
- source profile の concrete_path_hits は本欠陥クラスで 0 ヒット（参照パスは backtick 囲み prose 内の記述）。本欠陥クラスの検出には既存ルールの追加ではなく別の検査（配布物本文内のパス参照の解決可能性検査）が必要。
- 対象限定の旧形式機械検索（TS-004 相当・rg）は低コストで汎用化し得るが、script 実行コマンド等の運用記述は意図的に `src/common` 形式を含み得るため全域の fail 判定化は誤検出リスクがある（Issue #4068 の対象外条項と整合）。

## 影響

- 配布物本文内の相互参照パス表記が配布レイアウトで解決不能な欠陥クラスが既存検査（E4-1 gate）で非検出のまま残る。別の検査（解決可能性検査）の候補設計が未実施で、採否判断が未了。

## 課題

- 配布物本文内の相互参照パスの解決可能性を検査する汎用 checker の候補設計（配布レイアウトでの実在解決を検証する・運用記述の `src/common` 形式を誤検出しない除外設計を含む）。
- 本 Case（Issue #4068）では実装しない（対象外条項）。別候補としての採否判断（backlog-review・req-define 経路）を想定する。

## 既存要件との関連

- Epic #4054・Issue #4068・PR #4070 本文「E4-1 非検出事実と検出強化要否評価（TS-006）」セクション・Findings/Capture候補
- E4-1 配布依存境界 最終 gate（check_distribution_boundary.ts・lib/distribution-boundary.ts・distribution-reference-boundary）
