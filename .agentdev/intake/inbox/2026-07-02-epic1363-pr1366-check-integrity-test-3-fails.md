# check_integrity.test.ts の3 fail（conditional vocabulary 以外の既存問題）

## 観察

case-close Epic #1363 Wave 1 / PR #1366 (REQ-0157/0158 doc-inputs 機構と docs guard の仕上げ) の PR 本文 Findings より観察。

`check_integrity.test.ts` で3件の fail が存在:

1. 「valid fixture で ng 6件」
2. 「--classification flag exitCode」
3. （conditional vocabulary 検出は ACT-SPEC-012 対象だが valid fixture で obsolete-path-map.yaml 不在のためスキップ）

3 fail は conditional vocabulary 検出（ACT-SPEC-012）とは別の検出による既存の問題。本 PR（commit 46825fc2 + 3ae691a1）と無関係。

## 影響

- integrity テスト全体: 554 pass / 62 fail（REQ-0030-009 E2E の既存失敗、本 PR と無関係）
- 本 PR で追加した機能のテストは全て pass
- 既存の3 fail は別途対応が必要

## 修正されなかった理由

PR #1366 のスコープ外。3 fail は conditional vocabulary 検出（ACT-SPEC-012）とは別の検出による既存問題。case-run が Findings に記録し、case-close が capture 回収。

## 課題

- `check_integrity.test.ts` の3 fail（「valid fixture で ng 6件」「--classification flag exitCode」ほか）の原因調査と修正
- conditional vocabulary 検出の valid fixture で obsolete-path-map.yaml が不在でスキップされる問題の確認（テスト環境の fixture 配置問題か）

## 想定対応 Issue

- バグ修正系（bugfix）— check_integrity.test.ts の既存 fail 修正。優先度は中（テスト成功率に影響、ただし本機能と無関係）

## 根拠

PR #1366 本文「## Findings / Capture候補」より:

> **check_integrity.test.ts の3 fail**: 「valid fixture で ng 6件」「--classification flag exitCode」。conditional vocabulary 検出（ACT-SPEC-012）は valid fixture で obsolete-path-map.yaml 不在のためスキップされ、3 fail は別の検出による既存の問題。本 PR（commit 46825fc2 + 3ae691a1）と無関係。別途対応推奨（intake 候補）。

## 観測元

- PR #1366 (Epic #1363 Wave 1 / Issues #1364, #1365 / REQ-0157, REQ-0158)
- case-close Step 10 capture 回収
- 観測日時: 2026-07-02 (case-close 実行中)
