---
id: 2026-11-27-mapped-drive-invisible-in-agent-shell-test-failure
created_at: 2026-11-27T23:58:00+09:00
source: case-close (Wave 1 #4229 第 3 回最終受入 capture)
status: unreviewed
---

# エージェントシェルからマップドドライブ（Z:）が見えないと環境起因の試験失敗になり、base 再現と等価パスで分類する

- **問題事象**: distribution-exclusion-consistency.test.ts の「judgment equality across entry configurations」が、マップドドライブ Z:（\\nas02\Videos）が可視でないシェル（case-close の子セッション、親の 2026-11-27 21:06 JST の基線採取など）で失敗する。Z: が見える環境（Wave 1 の case-run 実行時）では同じ試験が合格していた
- **発生局面**: case-close の分割 3（bun test ./.opencode/plugins/ ./scripts/）と、親の STEP-S3 基線採取（case-run-4230-tests-known-base-files）
- **検知方法**: 試験失敗の本体がドライブ解決エラーであること。fs.existsSync('Z:/') がセッション間で異なること（親シェルで false）
- **根本原因**: 未確定。試験のパス解決がセッションに継承されるドライブマップの可視性に左右される（Z: 不可視の環境で失敗、可視の環境で合格、既存ドライブの等価パスで全項目合格）
- **自律対応内容**: case-close 第 3 回は base の detached worktree で同一失敗を再現（distexcl-base-r5、8 試験 1 失敗）し、既存ドライブの等価パスでは全項目合格（distexcl-eq-c-head-r5）を確認して環境起因と分類し、merge を阻止しなかった
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: マップドドライブ依存の試験失敗は「base 再現＋等価パスでの全合格」で環境起因と分類し、本変更起因と混ぜない。将来の試験設計はドライブ解決を前提にしない
- **再発条件**: ドライブマップを継承しないエージェントセッションで当該試験を実行するとき
- **予防策候補**: 当該試験のパス解決をドライブ非依存にする、またはドライブ可視性に連動した skip 条件を設ける
- **想定反映先**: scripts/self/release/distribution-exclusion-consistency.test.ts
- **関連**: Issue #4229、findings-r5.md の新規検出、.agentdev/integrity/reports/case-close-4227-distexcl-base-r5*、case-close-4227-distexcl-eq-c-head-r5*
- **タグ**: `#environment` `#mapped-drive` `#test-failure`
