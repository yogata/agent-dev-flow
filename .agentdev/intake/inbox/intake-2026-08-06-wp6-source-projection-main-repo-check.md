# intake: WP-6 統合検証をメインリポジトリで実行し source-projection-sync の junction 整合性を再評価

## 発生日

2026-08-06

## 発生元

- Issue: #1925 (WP-0 現状固定と事前状態確認 OU-001)
- PR: #1932
- Epic: #1924 (AgentDevFlow 2026-08 移行)
- 取得元: PR #1932 本文「## Findings / Capture候補」セクション

## 問題事象

Integrity Checker の `source-projection-sync` チェックは worktree 環境で「Skipped inside git worktree（junctions not recreated）」となり、junction 整合性が検証されない。WP-0 の変更前検査（`integrity-before.json`/`integrity-before.md`）では info レベル1件として記録されるのみで、junction 不整合があっても検出できない。

WP-1〜WP-5 が worktree-per-WP モデルで実行される限り、source-projection-sync は全 WP で skip される。WP-6（#1931）でメインリポジトリ（非 worktree）にて統合検証を実行しない限り、junction 整合性は最終的に確認されないままとなる。

## 影響

- WP-6 Release Report で source-projection-sync の最終結果が未検証のまま成立するリスク
- junction 不整合（`src/opencode/` と配布先の接続断）が配布アーカイブ品質に影響する可能性
- 移行計画 §10.6 最終完了条件「source profile strict NG 0件」の達成判定が不完全になる

## 発生局面

実装（WP-0 case-run、変更前検査実行時）

## 検知方法

WP-0 case-run で Integrity Checker を実行した際、`source-projection-sync` チェック結果が「Skipped inside git worktree（junctions not recreated）」の info となり、worktree 環境では junction 再作成が行われないことを確認。メインリポジトリでの再評価が必要と判断し PR 本文 Findings へ記録。

## 想定される対応方向

- WP-6（#1931）の case-run をメインリポジトリ（C:\Users\ogatay\work\agent-dev-flow、非 worktree）で実行し、`bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --json --root .` を再実行して source-projection-sync の結果を確定
- WP-6 の完了条件へ「source-projection-sync が skip ではなく実行され、junction 整合性が確認済み」を明示
- 移行計画 §13.1 WP-6 行の QA シナリオへ追記（既に暗黙に含まれる可能性あり、WP-6 case-open で確認）

## 関連

- Epic: #1924
- Issue: #1925 (WP-0)、#1931 (WP-6)
- PR: #1932 (squash merge 0fac102d)
- 対象 checker: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`（source-projection-sync）
- 証拠ファイル: `.omo/plans/agentdev-migration-2026-08-05.integrity-before.json`（info source-projection-sync）
- 移行計画: `.omo/plans/agentdev-migration-2026-08-05.md` §10.6、§13.1 WP-6

## 出典引用

PR #1932 本文「## Findings / Capture候補」より:

> source-projection チェックの worktree 制約
> Integrity Checker の `source-projection-sync` チェックは worktree 環境で「Skipped inside git worktree（junctions not recreated）」となる。WP-6 統合検証はメインリポジトリ（非 worktree）で実行し、junction 整合性を再評価する必要がある。

## タグ

#intake #source-projection #worktree #junction #wp-6 #integration-check #integrity-checker #migration-2026-08
