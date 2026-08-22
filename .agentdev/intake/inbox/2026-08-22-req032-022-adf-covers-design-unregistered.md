# REQ-032-022 の対応宣言（ADF-COVERS）が Design 側に未反映

## 観測

`agentdev-traceability` check（`--req REQ-032-022`）が missing-implementation / missing-verification の2不合格を返す。REQ-032-022（Epic Wave クローズ時一時成果物残留チェック）を実装した case-close command Design（`docs/designs/commands/case-close.md`）の ADF-COVERS(implementation) 行は REQ-032-001〜021 のみで REQ-032-022 が未登録。検証対応は `docs/designs/foundations/references/verification-scope-catalog.md` の任意行エントリにも未登録（未登録のため検証対応必須行として計上される）。

## 今回扱わない理由

両ファイルとも Design ファイルであり、Issue #2384（OU-006）の承認済み変更対象（template・skill・ガイダンス）から除外されるため（PR #2392 Findings 記録のとおり）。Design ファイル編集は design-save 系手続きの責務。

## 影響

case-close QG-4 のトレーサビリティ独立再検査（agentdev-traceability check）が対応欠落を検出した場合にマージ停止判断を誤る可能性がある。REQ-010-069/070 も同様の状況（→ 別 item「traceability missing-implementation 棚卸し」参照）。

## レビューで決めること

- case-close command Design の ADF-COVERS(implementation) 行へ REQ-032-022 を追加する修正の実施（design-save 相当手続き）
- 検証対応は verification-scope-catalog.md の任意行エントリ（品質ゲート・レビュー検証行）への登録または恒常的検証手段の新設のいずれにするか

## 根拠

- PR #2392 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2392 ）
- `bun src/opencode/skills/agentdev-traceability/scripts/src/check.ts --root . --req REQ-032-022` の missing-implementation / missing-verification 出力
