# 配布依存境界 gate link profile の worktree 検証不能 — 実行条件の明記候補

- 元 item: .agentdev/intake/inbox/2026-09-29-3236-distribution-link-profile-worktree-contract.md
- 観測元: case-run（Case #3236、DEL-3236-1、PR #3238 検証差分）
- 種別: 検証不能の構造的制約（具体的修正対象あり）

## 課題

配布依存境界 gate の link profile は、worktree では `.opencode/` link 投影が不在のため scan 対象 0 件となり検証不能である（worktree 構造的制約）。

- PR #3238 の検証差分: source profile は ok=true（scanned 359・新規違反 0）で合格、link profile は「merge 後の main 側投影で実行する検証」として無効分類で記録
- case-close STEP-3（main root、merge commit adc84579 実在確認済み）で link profile を再実行し ok=true（scanned 358・failures 0）を確認済み。検証自体は main 側で成立する

## 修正候補（2案 — 実現先の選択は req-define 責務）

- (a) link profile の実行条件（main 側投影の存在前提）を checker の実行契約（docs/designs/integrity/checker-execution-contracts.md 等）へ明記する
- (b) worktree 向けの代替実行手順（main root での再実行等）を case-close workflow の STEP reference（docs-and-design-promotion.md / epic-wave-close.md）へ明記する

## route 提示（backlog-review 判断用）

- req-define 変更影響分析による実行条件の明記先確定（(a) 実行契約 Design or (b) case-close STEP reference、または両方）。checker 実行契約 Design への記載追加は同一 Design を対象とする他候補（2026-09-29-3233-checker-execution-contracts-design-notes.md）と統合検討の余地あり
