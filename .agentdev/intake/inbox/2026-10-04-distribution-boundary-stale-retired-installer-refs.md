# intake: 配布依存境界メタデータと checker メッセージの旧公開入口名参照（scripts/install-consumer-opencode.ps1 廃止済み）

## 内容

廃止済みスクリプト名（scripts/install-consumer-opencode.ps1。現行入口は scripts/install.ps1）を、活動的なメタデータと checker メッセージが参照し続けている。

1. **.opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml**（L25/L34/L56/L64）: producer_script として scripts/install-consumer-opencode.ps1 を参照（実ファイルは存在しない）
2. **.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts**（L10579/L10619/L10641）: junction 修復案内メッセージが install-consumer-opencode.ps1 -Mode apply を案内
3. **.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-rules.ts**（L18）: コメント参照

対応候補: REQ-050-008（旧公開入口廃止）の文脈での現行入口への追随更新候補。Epic #3425 Wave 1 の RA-004 対象範囲外・既存債務のため case-close E6-2 では対応せず記録。

## 根拠

- 観測元: case-close E6-2 廃止キーワード全文検索（Epic #3425 Wave 1 Wave 境界定型手順、main 0f6adccf 時点）
- 検索キーワード: install-consumer-opencode
- スコープ内判定: Wave 1 の変更対象（agentdev-git-worktree-test-fallback.md）は scripts/install.ps1 へ修正済みで残存 0。上記 3 系統は Wave 1 起因の残存ではなく完了阻止対象外と判定
- captured_at_commit: 0f6adccf3d88c7da5a838597e156984a91910e84
