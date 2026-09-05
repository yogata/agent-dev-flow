---
id: intake-20260905-link-profile-main-root-execution-contract-candidate-2632
title: check_distribution_boundary.ts link profile の実効要件（main root 読取専用実行と環境ラベル記録）を checker 実行契約へ明記する候補
created: 2026-09-05
status: inbox
---

## 概要
- PR: #2632（Issue #2628・Epic #2624 Wave 4・OU-004 最終検証 Report）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

check_distribution_boundary.ts の link profile は、worktree 内実行では junction 未伝播（REQ-018、git worktree は junction をコピーしない）により配置先実体が読めず、concrete-id 0件の無効実行になる。実質的な採証には main root からの読取専用実行と環境ラベル（実行環境・junction 伝播有無）の記録が実効要件である。現状は REQ-018 の構造的制約から利用者が推論する必要があり、checker 実行契約側に明記されていない（OU-004 では最終検証 Report §5.3 に実行環境ラベルを明記して運用で対応）。

## 変更候補

- checker 実行契約（checker 実行契約と検出基盤規則 Design）へ link profile の実効要件を明記する: worktree 内実行は無効（junction 未伝播 → concrete-id 0件）、main root からの読取専用実行 + 環境ラベル記録を標準手順とする
- あわせて source profile / link profile の実行環境要件の対比表があると誤用を防げる

## 関連
- PR #2632（merge commit b6a90fe4）
- 最終検証 Report（docs/reports/experiment-case-withdrawal-final-verification.md）§5.3 実行環境ラベル記録
- REQ-018（worktree 構造的制約とテスト fallback）
