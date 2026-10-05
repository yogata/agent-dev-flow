# main root の textlint plugin vendor/ 空化により worktree 分割③の依存整備手段が機能しない

## 観測

Epic #3457 Wave 2 子 Issue #3465 の case-run（PR #3483）で、bun test フル suite 正規形の分割③（plugins 系）を実行した際、main root の `src/opencode/plugins/agentdev-textlint-guard/` 配下の vendor 生成物（`textlint-engine.bundle.json` 等、`bun run build:engine` の生成物）が当日時点で空化していた。main 側 vendor への junction による worktree 分割③の依存整備手段が機能せず、分割③ 初回実行で 43 fail（全件 plugin vendor bundle 不在の環境起因）が発生した。worktree plugin 配下で package 単位 `bun install` + `bun run build:engine` により worktree 内生成へ切替した結果、同一環境での再実行で 594 pass / 0 fail を確認し解消した。case-close のマージ直前 HEAD 再実行でも同環境で 0 fail を維持した（退避証跡: C:/WINDOWS/TEMP/opencode/3465-close-evidence/、2026-10-05）。

## 今回扱わない理由

vendor 空化の根本原因の特定（手動削除か、生成物 flyway の不備か）と、知識文書（worktree 検証環境の依存整備手順）への追随更新は、worktree 検証環境ドキュメント群（agentdev-git-worktree references・関連 knowledge）の更新作業として別途行うべき作業であり、本 Case（整合性債務是正 Epic）の完了条件に含まれないため。

## 影響

- worktree で bun test フル suite 正規形を実行する際、main 側 vendor への junction 依存が無音に壊れ得る（環境 drift の検知が fail 由来分類の手作業に依存している）
- 分割③ 初回実行時の 43 fail のように、変更と無関係な環境起因 fail が発生し、fail 由来分類（証跡手順）のコストが増大する
- main root 自体で textlint gate や plugin テストを実行する環境でも vendor 再生成が必要な状態が無警告で続く

## レビューで決めること

- worktree 検証の依存整備手順（agentdev-git-worktree references・bun test 実行の環境前提）に、vendor/junction 経路の事前存在確認と worktree 内生成への切替条件を追記するか
- main root の plugin vendor 空化の根本原因（削除経路）を調査し、再発防止（build:engine 生成物の gitignore 整合・生成状態の検知）を入れるか
- 類似の「main 側生成物への junction 依存」箇所の棚卸しと、検知時の標準切替手順の一般化

## 根拠

- PR #3483 本文（Findings セクション・検証差分セクションの vendor bundle 43 fail 由来分類と整備後再実行の記録）
- Issue #3465 対応記録コメント（テスト結果・残課題。case-close 再実行での解消維持確認）
- 退避証跡: C:/WINDOWS/TEMP/opencode/3465-close-evidence/（suite-split3 初回/再実行の stdout/stderr、textlint gate 実行記録）
