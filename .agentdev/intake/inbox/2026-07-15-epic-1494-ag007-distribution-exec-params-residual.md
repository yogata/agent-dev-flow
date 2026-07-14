# Epic 1494 AG-007: 配布 command の実行制御パラメータ残存（timeout/並列数/retry）

## 概要

Epic #1494（ADF配布物の責務境界浄化）の全 Wave（Wave 1-3）の PR Findings で共通して報告された finding。配布 command（case-run.md, case-auto.md, case-close.md, case-open.md, req-save.md, spec-save.md）の本文に実行制御パラメータ（最大5件の並列上限、120秒 timeout、最大5回 retry 等）の直接記述が残存している。REQ-0162-002 が規定する「配布 command/skill/docs は業務ワークフロー契約のみを記述し、実行制御の具体（固定並列数、timeout、retry 等）は各 skill の references/<topic>.md へ集約する」原則に対する違反候補。

Epic #1494 は本 finding を「対象外: 配布 command/skill/docs の実装本体改修」と明示し、本 Epic では対応しない。Epic クローズに伴い、追跡を intake pipeline へ移管する。

## 詳細

PR #1505（Wave 1, Issue #1495）の Findings で最初に詳細が記録され、以降の全 PR（#1506-#1514）で同一 finding が報告された:

| ファイル | 行 | パラメータ | 内容 |
|----------|-----|-----------|------|
| `case-run.md` | 62, 238, 275 | 最大5件 | Wave子Issue並列委譲上限の固定並列数 |
| `case-run.md` | 183 | 120秒 timeout | ツール呼び出し timeout の固定値 |
| `case-auto.md` | 106, 196, 202 | 最大5件 | case-run Wave内並列上限 |
| `case-close.md` | 67, 182-186, 196 | リトライ | squash merge retry 回数（最大5回） |
| `case-open.md` | 144 | 最大5件 | 子Issue作成並列上限 |
| `req-save.md` | 254 | 最大5件 | REQ/ADRファイル作成並列 |
| `spec-save.md` | 219 | 最大5件 | SPEC create/update並列 |

- 根拠 REQ: REQ-0162-002（配布物の harness 実行制御分離、原則の SSoT）。実行制御パラメータは harness 責務として AGENTS.md/references/<harness>.md に配置すべき
- Epic #1494 の対象外: 「配布 command/skill/docs の実装本体改修（各 Issue は検証主体。実装本体に差分が見つかった場合は case-run の QG-3 で分類）」と明記
- 各子Issue（#1495-#1504）の完了条件は全て PASS。本 finding は子Issue スコープ外（AG-007 スコープ）

## 候補となる対応

優先度は中（原則違反候補だが、機能的影響はなく運用上の問題も未報告）。以下のいずれか:

1. **配布 command から実行制御パラメータを除去**: 最大5件/timeout 120秒/retry 最大5回等の固定値を配布 command 本文から削除し、各 skill の references/<topic>.md（または AGENTS.md/references/<harness>.md）へ集約する。REQ-0162-002 原則への準拠
2. **段階的集約**: 並列数（最大5件）は最も影響範囲が広いため優先的に references へ移行。timeout/retry は個別に評価
3. **見送り（非推奨）**: REQ-0162-002 原則違反候補が残存するため、原則適用の完全性が損なわれる

## 根拠

- 観測元: Epic #1494 Wave 1-3 の case-close 実行（2026-07-14/15）。PR #1505, #1506-#1512, #1513, #1514 の Findings セクション
- 関連 REQ: REQ-0162-002（配布物の harness 実行制御分離）
- 関連 ADR: ADR-0136（配布物ハーネス境界の浄化）
- 関連 SPEC: docs/specs/responsibilities/responsibility-boundary-purification.md（accepted 昇格済、本 Epic で作成）
- 関連 Epic: #1494（クローズ対象、全10子Issue completed）
- 機能的影響: なし（配布 command の動作には影響しない、原則適用の完全性のみ）
- スコープ: Epic #1494 対象外（配布 command 実装本体改修）。本 intake item で intake pipeline へ移管
