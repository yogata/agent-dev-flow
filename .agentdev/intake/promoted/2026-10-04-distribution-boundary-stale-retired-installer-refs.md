# 採用済み成果物: 配布依存境界メタデータと checker メッセージの旧公開入口名参照（scripts/install-consumer-opencode.ps1 廃止済み）

## 観測内容

廃止済みスクリプト名（scripts/install-consumer-opencode.ps1。現行入口は scripts/install.ps1）を、活動的なメタデータと checker メッセージが参照し続けている。

1. `.opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml`（L25/L34/L56/L64）: producer_script として旧スクリプト名を参照（実ファイルは存在しない）
2. `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（L10579/L10619/L10641）: junction 修復案内メッセージが旧スクリプト呼出を案内
3. `.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-rules.ts`（L18）: コメント参照

## 影響

配布境界検査のメタデータが実在しない producer_script を参照し、検査結果の解釈と修復案内が現行入口と不整合になる。

## 課題

REQ-050-008（旧公開入口廃止）の文脈での現行入口（scripts/install.ps1）への追随更新の対応候補。

## 既存要件との関連

- REQ-050-008（旧公開入口廃止）
- 配布依存境界 guard（distribution-boundary）の検査基盤

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-04-distribution-boundary-stale-retired-installer-refs.md`（分類採用により削除済み）
- 観測元: case-close E6-2 廃止キーワード全文検索（Epic #3425 Wave 1 Wave 境界定型手順、main 0f6adccf 時点。検索キーワード: install-consumer-opencode）
- スコープ内判定: Wave 1 の変更対象は scripts/install.ps1 へ修正済みで残存 0。上記 3系統は Wave 1 起因の残存ではなく完了阻止対象外と判定
- captured_at_commit: 0f6adccf3d88c7da5a838597e156984a91910e84
- 現行源検証（intake-promote・ad6e8341・読取のみ）: 上記 3ファイルに旧スクリプト名参照が現行も残存することを確認
