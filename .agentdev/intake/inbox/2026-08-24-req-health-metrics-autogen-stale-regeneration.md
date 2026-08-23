# req-health-metrics の AUTOGEN 索引が要件行追記後に再生成されていなかった

## 観測

PR #2421（Issue 2420、REQ-049 対応関係補完）の作業で `docs/designs/quality/req-health-metrics.md` の REQ 行数集計 AUTOGEN ブロックが、commit 301cdc90（REQ-012-051、REQ-021-023〜025 追記）以降更新されていなかったことを確認した。req-save による要件行追記時に generate_indexes.ts の再生成が実行されていなかった可能性がある（PR #2421 本文「Findings / Capture候補」intake）。PR #2421 では鮮度是正として AUTOGEN ブロックを再生成した（REQ-012 26行、REQ-021 15行、計測日 2026-08-24）。

## 今回扱わない理由

AUTOGEN 再生成の工程組み込み（req-save 等への再生成ステップ追加、または検知手段の新設）は workflow 工程（req-save command / Workflow Skill）の設計変更を伴い、case-run の変更範囲に含めない。本件は PR #2421 の完了条件（REQ-049 対応関係補完）の外であり、鮮度是正の反映のみでマージを阻断していない。

## 影響

要件行の追記・廃止があっても req-health-metrics.md の行数集計が旧値のまま残り、メトリクス参照時の実態との乖離が蓄積する。乖離は次回誰かが再生成した時点で一括是正されるが、是正 diff が本来の変更と混在し、PR 差分のレビュー妨害要因になる。

## レビューで決めること

- req-save 工程（または要件行を追記する工程全般）への AUTOGEN 再生成ステップの組み込み要否
- 組み込まない場合、再生成漏れを検知する手段（targeted docs guard 等での鮮度検査）の要否

## 根拠

- PR #2421 本文「Findings / Capture候補」intake（発見元: PR #2421 実装作業中の AUTOGEN 再生成）
- docs/designs/quality/req-health-metrics.md（PR #2421 で鮮度是正済み。REQ-012 26行、REQ-021 15行）
- commit 301cdc90（req-save、REQ-012-051・REQ-021-023〜025 追記時点）
