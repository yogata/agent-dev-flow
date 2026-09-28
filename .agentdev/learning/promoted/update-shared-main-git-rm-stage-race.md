# 共有 working tree の main での git rm ステージ割り込み対策（明示パス commit の徹底と STEP-7 接続）

## 背景
case-ready STEP-7（Case #3186）の git rm ステージが、並走 Case #3189 の無パス指定 commit
（841a0c6f）に混入し、コミットメッセージと削除内容が不一致のまま push された。

## 問題
git-common-procedures.md 手順3（並列実行安全ステージング）は `git commit -- <paths>`
（--only pathspec 形式）を義務づけるが、(a) 並走プロセスの commit がこれに違反した場合の
被害側防御、(b) case-ready STEP-7（draft/RU 削除）から手順3への接続明示が不足している。

## 望ましい変更
readiness-and-cleanup.md「draft / RU 削除」節へ (1) `git rm <path>` と
`git commit -m "..." -- <path>` の連続実行（同一ステップ完結＝Form Zero）、
(2) commit 前 `git status --short` でステージ全体確認・自 Case 分以外のステージ存在時は
待機して再確認、を明記する。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md
### 対象外
- git-common-procedures.md 手順3（既存のまま参照）

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | readiness-and-cleanup.md | STEP-7 の rm→commit 連続実行とステージ確認の明記 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: git-common-procedures.md 手順3（明示パスステージ＋`git commit -- <paths>` 義務・Form Zero 原則）
- **ギャップ分類**: application miss（並走 commit が無パス指定で違反）＋ fix gap（STEP-7 接続の未明記）
- **ギャップ詳細**: 被害側防御手順の workflow 側接続なし

## 制約
混入済み履歴の amend（書き換え）は並走 push と競合するため対象外（本件は混入のまま記録済み）。

## 受け入れ条件
- [ ] STEP-7 手順に連続実行形とステージ確認が明記されている

## 元learning item / 根拠
- **要約**: git commit のインデックス全体コミット特性とステージ割り込み
- **根拠**: #3186（RU-0001.md 削除 37 行が #3189 の commit 841a0c6f に混入）
- **再発条件**: 共有 main で複数プロセスが git rm（ステージ）→ git commit（無パス指定）を実行する場合
- **横展開可能性**: draft/RU 削除・capture 永続化など main で commit する全工程

## 推奨Issue分類
- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: Case #3186・#3189（commit 841a0c6f）
