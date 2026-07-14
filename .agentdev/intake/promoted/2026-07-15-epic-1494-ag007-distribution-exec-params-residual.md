# 配布 command の実行制御パラメータ残存（timeout/並列数/retry）

## 観測内容

Epic #1494（ADF配布物の責務境界浄化）の全 Wave PR Findings で共通報告。配布 command 6ファイルの本文に実行制御パラメータが直接記述されている。

| ファイル | 行 | パラメータ | 内容 |
|----------|-----|-----------|------|
| `case-run.md` | 62, 238, 275 | 最大5件 | Wave子Issue並列委譲上限 |
| `case-run.md` | 183 | 120秒 timeout | ツール呼び出し timeout |
| `case-auto.md` | 106, 196, 202 | 最大5件 | case-run Wave内並列上限 |
| `case-close.md` | 67, 182-186, 196 | リトライ最大5回 | squash merge retry |
| `case-open.md` | 144 | 最大5件 | 子Issue作成並列上限 |
| `req-save.md` | 254 | 最大5件 | REQ/ADRファイル作成並列 |
| `spec-save.md` | 219 | 最大5件 | SPEC create/update並列 |

## 影響

- REQ-0162-002 が規定する「配布 command/skill/docs は業務ワークフロー契約のみを記述し、実行制御の具体は各 skill の references/<topic>.md へ集約する」原則に対する違反候補
- 機能的影響なし（配布 command の動作には影響しない）
- 原則適用の完全性のみが損なわれている

## 課題

配布 command 本文から実行制御パラメータ（最大5件/timeout 120秒/retry 最大5回等の固定値）を除去し、各 skill の references/<topic>.md（または AGENTS.md/references/<harness>.md）へ集約する必要がある。

## 既存要件との関連

- REQ-0162-002（配布物の harness 実行制御分離、原則の SSoT）
- REQ-0162-006（ADF可観測壁時計タイムスタンプ — 当該タイムスタンプは所有対象、timeout/retry は管理対象外）
- ADR-0136（配布物ハーネス境界の浄化）
- SPEC: `docs/specs/responsibilities/responsibility-boundary-purification.md`（accepted、本 Epic #1494 で作成）

## 出典

- 観測元: Epic #1494 Wave 1-3 の case-close 実行（2026-07-14/15）。PR #1505, #1506-#1512, #1513, #1514 の Findings
