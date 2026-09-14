# inspect-skills contracts.md 不在参照の修復と ng-baseline 登録判断（worktree fallback 前段可視化）

※ 統合成果物: 2 intake item（inspect-skills-references-contracts-md-missing-17、ng-baseline-registration-decision-for-worktree-fallback）を同一根拠（contracts.md 不在参照）として統合判断

## 観測内容

`agentdev-inspect-skills` references 配下 2 ファイル（`semantic-diagnostic-perspectives.md:202`、`spec-operation-contract-consistency.md` 複数行）が `references/contracts.md` を参照しているが、当該ファイルは src / projection（.opencode/skills）双方に存在しない。full-audit で reference-path-existence NG 17 件として検出（IR-062 ng 15 件としても観測。件数差は検出器・観測時点の差に由来）。

worktree fallback 運用開始（case 2777。junction 未伝播時の src/opencode 直参照）により、main 既知の当該違反が全 case の case-run 前段で常時発火するようになった。同様に main 既知の warning 2 件も前段可視化されている:

- IR-053（single.md の `gh issue edit` 直接呼び出し・agentdev_gh Custom Tool 経由へ迂回すべき）
- obsolete-vocabulary（agentdev-artifact-validation の `REQ/ADR/` 語彙）

本 promoted 成果物の生成時点（2026-09-15）で再検証済み:

- `references/contracts.md` は src・.opencode projection 双方とも不在（glob 確認）

## 影響

- 全 case 前段で NG/warning が発火し続け、新規違反との判別コストが発生する
- ng-baseline / exemptions 未登録のため delta 判定（exit code driver）への影響が運用解釈に委ねられる

## 課題（対応候補と判断材料）

対応候補は 3 系統。判断は後続工程（backlog-review → RU）で行う:

- (a) `references/contracts.md` の復元または参照側の修正（ng 17 件の根源解消）
- (b) ng-baseline への正式登録（`--update-ng-baseline --ng-baseline-additions` 手順。case 2777 の対象範囲外として未実施だった手続き）
- (c) exemptions 登録（意図した除外として管理）

補足: warning 2 件（IR-053・obsolete-vocabulary）も修復または baseline / exemptions 登録の判断対象。main のみで追加検出される agentdev-doc-writing projection ng 1 件（junction 投影環境固有・base 既知）の取り扱いも併せて確定する

## 既存要件との関連

- IR-062（参照先実在検査）: NG の検出器
- IR-053（Custom Tool 経由契約）: warning の検出器
- ng-baseline 運用: delta 判定の正規管理機構

## 根拠

- 観測元: PR 2786（case 2785）`## Findings / Capture候補` intake セクションおよび `## 検証差分` 無効 17 件行、PR 2778（case 2777）`## Findings / Capture候補` intake セクション。item 側が「統合または分離判断は intake-promote 側で行う」と明記。それぞれ case-close（2026-09-12）で回収
- 処分経緯: intake-promote（2026-09-15）で不在を glob により機械再確認し、同一根拠と判定して統合・採用を確定（統合はユーザー承認）
