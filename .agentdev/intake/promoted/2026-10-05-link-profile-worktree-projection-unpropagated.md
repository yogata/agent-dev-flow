# 採用済み成果物: worktree での link profile zero-targets 解消 — STEP-S5 前置組み込みと checker 事前ガイド（learning C3 との統合前提）

## 観測内容

Case #3485（PR #3490）の case-run で、worktree `.worktrees/3485-case/` から配布依存境界 checker `--profile link` を実行したところ、worktree に `.opencode/skills/` の link projection（junction）が伝播しないため `zero-targets:link`（scanned_files 0）で停止した。実行担当は迂回せず未検証のまま PR 本文に記録し、case-close STEP-3 で main root・読取専用再実行（`ok=true`、failures 0、scanned 343）で最終 gate 合格を確認した。

## 影響

- case-run の実行担当が worktree で link profile を実行して zero-targets となり、未検証 finding が PR 本文へ記録され、case-close での補完実行が必須になる（工程間の往復コスト）
- worktree で junction を自作してしまう誘因が残り、環境汚染リスクが継続する

## 課題（統合先・現行状態の明記）

adversarial-review（Stream B・claim-stale 検証）による前提の修正を反映する:

- link profile の main root 指定は **checker-execution-contracts.md:187-189「link profile 実効実行要件」で既に契約化済み**（「link profile は main root を位置引数 repoRoot に指定して読取専用で実行する」）
- zero-targets を合格扱いにしない無効分類も **checker-execution-contracts.md:234 で既に規定済み**（「fallback 経路で検査対象が 0 件（zero-targets）に解決された場合は、検査を実施していない無効分類として記録し、合格として扱わない」）。元 item の「毎回手動で判断している」は不正確
- 切替条件（投影構成不能・検査対象が空・結果の信頼性が確保できない場合）の fallback 契約も :222-235 で既存

残る未整備論点（縮小後）:

1. **case-run STEP-S5 手順への前置組み込み**（実行環境ラベル判定の前置化・link profile の main root 指定を手順書面で明示）— 本論点は learning-promote 成果物 `existing-measure-update-worktree-junction-env-label.md`（C3: 環境ラベル必須化・実行 root 明示・gate パス規律）と変更先 Design（checker-execution-contracts.md）・変更内容がほぼ同一。**backlog-review で learning C3 と RU 統合必須（独立 RU 化は同型変更の並行 Case 化を生むため回避すること）**
2. **checker 実装側の zero-targets 事前ガイド**（main root 切替の自動案内）— checker スクリプト本体の変更を伴い、learning C3（docs・手順更新中心）とは非重複の独立論点
3. 事象根拠の補完: 本 item の根拠（Case #3485/PR #3490）は learning C3 の根拠（Case 3494・3500）に含まれない。統合時に zero-targets 事象を実行 root 明示規律の根拠として追加すること

## 既存要件との関連

- checker-execution-contracts.md「link profile 実効実行要件」（:187-189）、「worktree 環境での checker 実行 fallback（junction 未伝播時の SoT 直参照）」（:222-235）
- case-run SKILL.md STEP-S5（result 処理・配布依存境界 最終 gate）
- learning promoted 成果物 existing-measure-update-worktree-junction-env-label.md（C3・統合相手）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-05-link-profile-worktree-projection-unpropagated.md`（分類採用により削除済み）
- PR #3490 本文「Findings / Capture候補」、Issue #3485 対応記録コメント検証差分節（main root 再実行 ok=true scanned 343）
- adversarial-review Stream A/B（learning C3 重複分析・既存契約実在確認、2026-10-07）
