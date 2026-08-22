# case-run 前置 gate・最終 gate の Design 反映（Design確定候補、見送り）

## 観測

PR #2394（Issue #2386、OU-008）が agentdev-workflow-case-run へ (a) STEP-S3-6「AUTOGEN 索引再生成 前置 gate」（検出基準: git diff vs 統合先、worktree 作成直後は Issue 計画対象で判定、必須指示契約）、(b) STEP-S3-5 事前委譲 gate（必須実行化、--profile source ベースライン取得）と STEP-S5-1 双方反映検証（source/link 両 profile 必須、junction 未伝播時の位置引数 repoRoot による読取専用実行、投影未実体化時の gate-not-passed、投影分離原則）を実装した。正規原本の case-run command Design（single workflow STEP 構成）と配布依存境界 Design（projection の分離）には未反映。

## 今回扱わない理由

Design ファイルの内容更新は design-save 系手続きの責務であり、case-close の capture 責務は回収・保存のみ（STEP-3-2 パターン (c) 見送り: 候補を記録し後続へ委ねる。Wave 1 の quality-gates Design 見送りと同一扱い）。

## 影響

Design と workflow skill の gate 記述が一時的に乖離し、case-run 実行時の正の参照源が不安定になる。

## レビューで決めること

- case-run command Design（docs/designs/commands/case-run.md）の single workflow STEP 構成へ STEP-S3-6（検出基準・必須指示契約）と STEP-S3-5/S5-1（事前 gate・双方反映検証）を反映する実施
- 配布依存境界 Design（docs/designs/integrity/distribution-boundary.md）の投影分離原則（source/link 両 profile、worktree 読取専用実行、投影未実体化時 gate-not-passed）の反映要否・記載位置

## 根拠

- PR #2394 本文「Design確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2394 ）
