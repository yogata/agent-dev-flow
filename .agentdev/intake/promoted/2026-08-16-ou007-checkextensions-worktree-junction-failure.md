# checkExtensions integration テストの worktree 環境（junction 未伝播）失敗

## 観測内容

checkExtensions (integration against real repo) > classifies the real skill tree deterministically が、worktree（junction 未伝播）の clean HEAD でも失敗する。worktree では `.opencode/skills/agentdev-*` junction が存在しないため実スキルツリー分類が成立しない環境依存失敗とみられる（OU-004 で解消された他 checker と同種の環境依存残差の可能性）。

## 影響

- worktree で実行する scripts テストスイートに恒常的な失敗が混入し、QG 判定のノイズとなる

## 課題

main リポジトリ環境（junction 存在）での再実行により帰属を確認する。worktree 環境依存であれば `isInsideWorktree` 判定による skip または `src/opencode/` への fallback を checkExtensions 側に適用する候補。

## 既存要件・成果物との関連

- 対象: check_extensions（integration test）
- 近接観測: 2026-08-16-ou004-check-extensions-order-dependent-failure.md（フルスイート時のみ・単体 pass の観測）、2026-08-16-ou001-check-extensions-cwd-dependency.md（cwd 相対パス解決依存）— 同一根かどうかは main 再実行で切り分け（統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2) Findings / Capture候補 セクション intake 2
- 元 item: intake-2026-08-16-ou007-checkextensions-worktree-junction-failure.md
