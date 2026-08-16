# Intake Item: checkExtensions integration テストの worktree 環境（junction 未伝播）失敗

## 発生源

- PR: #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2)
- 発生 phase: case-run 検証（scripts 全テストスイート実行）
- capture 分類: intake（具体的検討候補、main 環境での要再確認）

## 問題

checkExtensions (integration against real repo) > classifies the real skill tree deterministically が、本 worktree（junction 未伝播）の clean HEAD でも失敗する。worktree では `.opencode/skills/agentdev-*` junction が存在しないため実スキルツリー分類が成立しない環境依存失敗とみられる（OU-004 で解消された他 checker と同種の環境依存残差の可能性）。

## 推奨対応

main リポジトリ環境（junction 存在）での再実行により帰属を確認する。worktree 環境依存であれば `isInsideWorktree` 判定による skip または `src/opencode/` への fallback を checkExtensions 側に適用する候補。

## 関連

- Issue: #2141 (CLOSED), Epic: #2134
- PR: #2152 (Findings / Capture候補 セクション intake 2)
- 近接観測（同一テスト名、別条件）: intake-2026-08-16-ou004-check-extensions-order-dependent-failure.md（フルスイート時のみ・単体 pass の観測。本 item は単体でも worktree clean HEAD で失敗の観測。同一根かどうかは main 再実行で切り分け）
