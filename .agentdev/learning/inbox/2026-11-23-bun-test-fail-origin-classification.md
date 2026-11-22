---
id: 2026-11-23-bun-test-fail-origin-classification
created_at: 2026-11-23T07:50:00+09:00
source: case-close (Epic #4202 Wave-1 PR #4208・#4209・#4210 本文 Findings の回収)
status: unreviewed
---

# bun test の大量 fail を環境起因・既存起因・変更起因に機械的に切り分ける 3 手法

- **手法**: Wave-1 の 4 PR で実証された fail 起源分類の 3 手法。(1) main root の同一コミットで同一スイートを実行する対照実行（PR #4208・分割①②③の整備前後対照）(2) stash push -u → base 状態で同一スイートを再実行 → 復元し、fail が base 再現するかで既存起因を立証（PR #4209・textlint-guard 79 件の環境起因立証）(3) `git diff main` の空差分 + main tip での実体照合（対象ファイル不在・マーカー不在確認）により変更と無関係な pre-existing を機械的に立証（PR #4210）
- **発生局面**: REQ-125 Wave-1 実装・検証（2026-11-22〜23）
- **効果**: 変更起因 fail を 0 件と証明できるため、大量 fail があっても PR 判定を確実にできる。実際に 4 PR 全部で「変更起因 0 件」を立証してマージした
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: main root での bun test ./src/ 対照実行（3709 pass / 0 fail が REQ-125 完了条件の検証根拠にもなった）は fail 起源分類と完了条件検証の両方に使える定跡。テスト実行結果の報告書式に「整備前/由来分類/整備後」の 3 列表が有効だった（PR #4208 の検証差分表）
- **再発条件**: 該当なし（再現すべき問題ではなく手法の学び）
- **予防策候補**: なし（手法として case-run の検証差分報告に定着しているかの確認）
- **想定反映先**: case-run workflow の検証差分報告様式、または worktree 検証手順の references
- **関連**: `.agentdev/learning/inbox/2026-11-23-textlint-vendor-worktree-unpropagation.md`（環境起因 fail の主因）、`.agentdev/intake/inbox/2026-11-23-realization-actions-contract-preexisting-fails.md`（既存起因 fail の具体例）
- **タグ**: `#bun-test` `#検証` `#fail分類` `#worktree`
