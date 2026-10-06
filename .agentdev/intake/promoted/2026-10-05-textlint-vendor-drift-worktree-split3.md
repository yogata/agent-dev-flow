# 採用済み成果物: main root textlint vendor 空化の根本原因調査と再発防止（検知）— worktree 再生成手順は既存

## 観測内容

Epic #3457 Wave 2 子 Issue #3465 の case-run（PR #3483）で、bun test フル suite 正規形の分割③（plugins 系）実行時、main root の `src/opencode/plugins/agentdev-textlint-guard/` 配下の vendor 生成物（`textlint-engine.bundle.json` 等、`bun run build:engine` の生成物）が 2026-10-05 当時時点で空化しており、分割③ 初回実行で 43 fail（全件 plugin vendor bundle 不在の環境起因）が発生した。worktree plugin 配下での package 単位 `bun install` + `bun run build:engine` による worktree 内生成へ切替え、同一環境での再実行で 594 pass / 0 fail、case-close のマージ直前 HEAD 再実行でも 0 fail を維持した。

## 影響

adversarial-review による現状検証を反映:

- **現在 main root の vendor は再生成済み**（textlint-engine.bundle.json 約 1.5MB・kuromoji-dict 12 ファイル実在、タイムスタンプ 2026-10-05 17:44）。現在進行形の障害ではない
- 元 item の「main 側 vendor への junction による依存整備手段」は**現行契約に存在しない非正規手段**（worktree-operations.md は node_modules 用 junction 手順のみ規定、vendor については worktree 内再生成を正としている）
- worktree 内再生成手順は既存: worktree-operations.md:114「textlint guard plugin 依存成果物の再生成」（plugin package 配下で bun install && bun run build:engine、fail-closed 検知の手順を規定済み）、:167、docs/knowledge/worktree-environment-fail-classification.md:30、qg-4-final-acceptance.md:332「worktree での分割③ 対象欠落の環境差」
- 残る構造リスク: vendor 空化の**根本原因（削除経路）は未特定**で、生成状態の検知手段がなく、次の空化がまた無警告で発生し得る。発生時は fail 由来分類（証跡手順）の手作業コストが再発する

## 課題（統合先・現行状態の明記）

1. main root vendor 空化の根本原因調査（手動削除か、生成物 flyway の不備か）
2. 生成状態の検知（main root で textlint gate・plugin テスト実行前の vendor 存在確認、またはビルド必須の検知）
3. routing 注記: 既存再生成手順（worktree-operations.md:114/167）への追加追記で足りる部分は RU 化不要。backlog-review では knowledge 直 save 候補（worktree 環境系知識文書への補追記）としても検討すること

統合視点: worktree × Windows × 依存生成物領域の知見（learning promoted existing-measure-update-worktree-remove-recovery とは根本原因が別）として、backlog-review で近接配置を推奨。

## 既存要件との関連

- worktree-operations.md 依存整備節（:114, :167）
- docs/knowledge/worktree-environment-fail-classification.md（:30「bun install・vendor 生成が前置で必要」）
- qg-4-final-acceptance.md:332（worktree での分割③ 対象欠落の環境差の記録要件）
- AGENTS.md 開発者セットアップ（bun install && bun run build:engine 手順）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-05-textlint-vendor-drift-worktree-split3.md`（分類採用により削除済み）
- PR #3483 本文（vendor bundle 43 fail 由来分類と整備後再実行の記録）、Issue #3465 対応記録コメント
- 退避証跡: C:/WINDOWS/TEMP/opencode/3465-close-evidence/（2026-10-05。temp 領域のため揮発性注意）
- adversarial-review Stream B 実測（vendor 実在・既存手順の網羅確認、2026-10-07）
