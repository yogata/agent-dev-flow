# QG-4 checker 実測は merge 直前の main 取り込み済み branch HEAD で実施し baseline 登録漏れを検査する

## 背景
#3211（40bd84e4）が distribution files への repo-* 参照追加に伴う IR-055 新規 strict violation 2 件を
baseline 登録なしで main へ merge し、host main が check_integrity EXIT 1 の状態で残留した。
後続 Case #3192 の冪等再実行がその delta を引き取った。

## 問題
QG-4 最終完了判定の checker 実測について、(a) merge 直前の origin/main 取り込み済み branch HEAD での
実施、(b) 「baseline-known 以外の新規 NG の出所が自 Case 変更であること」の evidence 化、
(c) provenance-tracked baseline 登録漏れの検査が手順に明記されていない。

## 望ましい変更
qg-4-final-acceptance.md（checker 実測の coverage 範囲）と case-close の QG-4 判定手順へ
上記 (a)(b)(c) を明記する。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
- src/opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md
### 対象外
- IR-055 rule・baseline 形式（不変）

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | qg-4-final-acceptance.md | checker 実測 coverage・出所 evidence 化・登録漏れ検査の明記 |
| 配布skill reference | issue-resolution-and-qg4.md | QG-4 判定手順への同一趣旨の接続 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: qg-4-final-acceptance.md（checker 実測・pre-existing 分類手順）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: merge 直前 HEAD 実測と baseline provenance 登録漏れ検査の未明記

## 制約
baseline は該当元 Case（#3210/#3211 系）が登録する前提（本 Case 対象外のまま）。

## 受け入れ条件
- [ ] QG-4 手順に merge 直前 HEAD 実測と出所 evidence 化が明記されている

## 元learning item / 根拠
- **要約**: checker 実測を経ない merge が main に新規 NG を残留させる
- **根拠**: #3192 修復時の worktree HEAD fac56445 で delta 2 件検出→host main 40bd84e4 同一実測で
  pre-existing 証明（出所 #3211 の worktree-operations.md:173・definition-pr-and-idempotency.md:33 追加行）
- **再発条件**: checker 関連行を含む PR が QG-4 実測を経ずに merge される場合
- **横展開可能性**: checker 関連行を含む PR 全般

## 推奨Issue分類
- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: Case #3192・PR #3211・IR-055 関連 rule
