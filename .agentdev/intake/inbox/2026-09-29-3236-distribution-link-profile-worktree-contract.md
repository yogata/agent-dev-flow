# intake: 配布依存境界 gate link profile の worktree 検証不能（実行条件の明記候補）

- 観測日: 2026-09-29
- 観測元: case-run（Case #3236、DEL-3236-1、PR #3238 検証差分）
- 種別: 検証不能の構造的制約（具体的修正対象あり → intake）

## 観測内容

- 配布依存境界 gate の link profile は、worktree では `.opencode/` link 投影が不在のため scan 対象 0 件となり検証不能である（worktree 構造的制約）
- PR #3238 の検証差分では source profile は ok=true（scanned 359・新規違反 0）で合格、link profile は「merge 後の main 側投影で実行する検証」として無効分類で記録された
- case-close STEP-3（main root、merge commit adc84579）で link profile を再実行し ok=true（scanned 358・failures 0）を確認済み。検証自体は main 側で成立する

## 修正候補

- link profile の実行条件（main 側投影の存在前提）を checker の実行契約へ明記する
- または worktree 向けの代替実行手順（main root での再実行等）を case-close workflow の STEP reference（docs-and-design-promotion.md / epic-wave-close.md）へ明記する
