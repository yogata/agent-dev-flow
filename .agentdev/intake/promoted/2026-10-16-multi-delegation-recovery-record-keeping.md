# 採用済み intake: 同一 worktree 複数委譲（中断 → 回収）の記録運用

## 観測内容

同一 worktree への複数委譲（DEL-3741-1 中断 → DEL-3741-2 回収）では、回収側の検証完了後に別主体が commit/push/PR 作成まで進行し得る実測がある（PR #3750、子 Issue #3741 / OU-005 / DEL-3741-2 回収検証）。

回収側の完了扱いを重複 PR から守る運用として、「PR 本文の実行識別情報・検証差分に両委譲の記録を併記し、内容同一性を機械確認（diff 空）してから完了扱いとする」ことが候補として検討されている。

## 影響

- 回収側検証完了後に別主体が commit/push/PR 作成まで進行した場合、重複 PR が発生し、完了扱いが二重になる
- 実行識別情報（DEL 識別子）が PR 本文に記録されないと、中断→回収の同一性を後続工程（case-close の完了判定・Capture 回収）が機械的に確認できない

## 課題

- case-run 委譲・回収手順への反映先の特定と反映
  - PR 本文の実行識別情報・検証差分に両委譲の記録を併記する運用の条項化
  - 内容同一性の機械確認（diff 空）を完了扱いの前置条件とする運用の条項化

## 既存要件との関連

- case-run 委譲・回収手順は `docs/designs/foundations/v4-delegation-contracts.md` と `agentdev-workflow-case-run` / `agentdev-workflow-orchestration` の管理領域
- 発見元: PR #3750（merge commit 8c3e1d56）、Case #3729 / Epic #3732
- capture 由来: case-close Capture 回収 2026-10-16（PR 本文 intake セクション）

## 分類根拠（intake-promote 分類時の記録）

- 未対応（運用改善候補）かつ修正対象（case-run 委譲・回収手順）が具体的なため採用。learning 分岐は learning 該当なし（再発防止知見のみではなく具体的反映先あり）
- adversarial-review: 採用判断への本質的反証なし（learning 境界の疑念は learning 分岐判定の表適用により不成立と確認）
