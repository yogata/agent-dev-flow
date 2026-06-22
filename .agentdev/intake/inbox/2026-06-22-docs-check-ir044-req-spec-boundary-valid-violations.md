# WARNING: IR-044 req-spec-boundary-violation 真陽性 2件（REQ-0114-082, REQ-0144-008）の REQ 是正候補

## 発生源

- コマンド: /repo/docs-check（2026-06-22 実行）
- 検出カテゴリ: CanonicalConflict（IR-044, WARNING）
- ルート: req-define

## 内容

IR-044 `req-spec-boundary-violation` 検出が以下 2 finding を出しており、いずれも REQ 要件行に SPEC 詳細（Step 番号・fixture 件数）が混入している真陽性。REQ-0101-068（SPEC 詳細は SPEC/command reference/test docs へ配置）に従い、REQ 本文から SPEC 詳細を除去する候補。

### Finding 1: REQ-0114-082（docs/requirements/REQ-0114.md:90）

検出行:

> REQ-0114-082: case-auto は実行開始時刻（Step 1 入力解決の開始時点）および完了報告生成時刻（Step 8）を記録すること

混入 SPEC 詳細: 「Step 1」「Step 8」の Step 番号参照。本来の要件意図は「実行開始時刻・完了報告生成時刻を記録すること」であり、Step 番号は SPEC/command reference（case-auto command reference の Step 定義）に属する。

### Finding 2: REQ-0144-008（docs/requirements/REQ-0144.md:26）

検出行:

> REQ-0144-008: scripts/tests/check_integrity.test.ts の fixture は最新 check_integrity.ts ルールに追従する（既存5件赤 + valid fixture 7件 NG の解消）

混入 SPEC 詳細: 「既存5件赤」「valid fixture 7件 NG」の件数。これらは test docs・fixture 管理資料（SPEC 級）に属し、REQ 本文は「fixture は最新 check_integrity.ts ルールに追従すること」までに留めるべき。

## 影響

- REQ-0114 / REQ-0144 が SPEC 詳細を保持することで、Step 構成・fixture 件数が変化するたびに REQ 本文も更新が必要となり、REQ 安定性が損なわれる
- REQ/SPEC 境界基準（REQ-0101-067/068）からの逸脱。後に続く docs-check で同一 WARNING が継続検出される
- 整備 Issue を起票せず放置すると、Epic 完了条件や QG-4 最終受入で再指摘されるリスク

## 推奨対応先

- REQ-0114-082: 「Step 1」「Step 8」を除去し、実行開始時刻・完了報告生成時刻の記録のみを要件化。Step 番号対応は case-auto command reference または SPEC に記載
- REQ-0144-008: 「（既存5件赤 + valid fixture 7件 NG の解消）」を削除し、test docs または SPEC へ移管
- 修正後、`bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` で当該 WARNING が 0 件になることを確認
- req-define または req-save ワークフロー経由で是正（既存 REQ 編集）

## 原因分類

- 確認済: いずれの要件行も SPEC 詳細（Step 番号・fixture 件数）を直接保持している。REQ-0101-068 違反
- 仮説: 要件策定時に SPEC/command reference に既に記載があるべき内容を REQ にも再記載してしまった、または件数を具体値として明示したかった

## 根拠

- 検出レポート: `.agentdev/integrity/reports/2026-06-22-integrity-report.md` CanonicalConflict セクション（REQ-0114-082, REQ-0144-008 の2件）
- 検出元スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- 適用基準: REQ-0101-067（REQ/SPEC 責務境界定義）、REQ-0101-068（SPEC 詳細の配置先）
- 関連要件: REQ-0108-259（IR-044）、REQ-0140（文書品質ゲート）
