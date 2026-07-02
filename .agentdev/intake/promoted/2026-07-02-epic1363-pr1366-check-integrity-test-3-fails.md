# check_integrity.test.ts の3 fail（conditional vocabulary 以外の既存問題）

## 観測内容

case-close Epic #1363 Wave 1 / PR #1366 (REQ-0157/0158 doc-inputs 機構と docs guard の仕上げ) の PR 本文 Findings より観察。`check_integrity.test.ts` で3件の fail が存在する（「valid fixture で ng 6件」「--classification flag exitCode」ほか）。conditional vocabulary 検出（ACT-SPEC-012）とは別の検出による既存の問題であり、本 PR と無関係。

## 影響

- integrity テスト全体: 554 pass / 62 fail（REQ-0030-009 E2E の既存失敗、本 PR と無関係）
- 本 PR で追加した機能のテストは全て pass
- 既存の3 fail は別途対応が必要

## 課題

- `check_integrity.test.ts` の3 fail（「valid fixture で ng 6件」「--classification flag exitCode」ほか）の原因調査と修正
- conditional vocabulary 検出の valid fixture で obsolete-path-map.yaml が不在でスキップされる問題の確認（テスト環境の fixture 配置問題か）

## 既存要件との関連

- REQ-0030-009: E2E の既存失敗
- ACT-SPEC-012: conditional vocabulary 検出（本件の fail とは別）
- REQ-0157 / REQ-0158: PR #1366 の関連要件
- 本 item は `2026-06-28-valid-fixture-test-failures.md` と同一テストファイル（`check_integrity.test.ts`）の既存失敗であり、統合推奨

## 観測元

- PR #1366 (Epic #1363 Wave 1 / Issues #1364, #1365 / REQ-0157, REQ-0158)
- case-close Step 10 capture 回収
