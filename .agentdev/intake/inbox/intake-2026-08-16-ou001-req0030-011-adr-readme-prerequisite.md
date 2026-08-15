# Intake Item: case-open 配布テンプレート側の前提ファイル参照の Decision 移行追随

## 発生源

- PR: #2148 (Issue #2135 / OU-001, Epic #2134 Wave 1)
- 発生 phase: case-run 検証（REQ-0030-011 テストの事前失敗分析）
- capture 分類: intake（具体的検討候補、積み残し作業候補）

## 問題

`commands_error_cases.test.ts` の「Prerequisite file references exist > ADR README.md exists (referenced by case-open, integrity-check)」は `docs/adr/README.md` 不在（DEC-009 廃止）により base commit から失敗していた。case-open 配布テンプレート側の前提ファイル参照の移行追随が必要（OU-002/OU-009 範囲と推定）。

case-close 時点状況: 同一 Wave の PR #2147（OU-005）のファイル再構成で当該テストの期待値は `docs/decisions/README.md` へ更新済みであり、merge 後 main（3143a0bf）で当該テスト群は pass を確認済み。テンプレート・コマンド定義側に `docs/adr/README.md` 参照が残存するかどうかは本 capture 時点で未確認。

## 推奨対応

OU-002（#2136）または OU-009（#2143）の実装時に、配布テンプレート・コマンド定義の前提ファイル参照に `docs/adr/README.md` 残存がないかを確認する。

## 関連

- Issue: #2135 (CLOSED), Epic: #2134
- PR: #2148 (Findings / Capture候補 セクション intake 2)
- 同一 Wave でテスト側の期待値更新: PR #2147 / PR #2146（#2146 は Level 1 コンフリクトで case-auto エスカレーション中）
