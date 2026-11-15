# 並行実行環境の untracked 掃除所有者確認規律

## 背景

case-ready STEP-1 の対照実行で main 作業ディレクトリの untracked ファイル 3 件（並行 run〔Case #4002〕の Jev 観測）を自 run の環境ノイズと誤判定して削除した。削除と同一コマンドで実行したメタデータ確認の出力で並行 run の所有であることが判明したが、rm は連結実行済みで中止できなかった。削除した 3 件は復元不能（untracked のため）であり、並行 run の observation_write が fail-open 契約で判断成立を阻害しないため再実行で回復した

## 問題

worktree-operations.md の現行 cleanup 規律（削除対象 = 未追跡のみ・.agentdev/tmp 列挙削除・stash の他セッション配慮 L375）に、(1) untracked ファイルの所有者確認（観測メタデータ〔workflow・subject〕照合）の前置 (2) 確認コマンドと削除コマンドの bash コマンド分離規律（同一コマンド連結は確認結果を反映しない実行序列になる）が不在（全文 grep 実測・STEP-4 review Stream B で確認）

## 望ましい変更

worktree-operations.md の cleanup 系規律へ「untracked ファイル削除判定は『内容確認 → 中止判断 → 削除実行』を別 bash コマンドに分離して実行する」「並行 case-auto 環境では .agentdev/jev-observations/ 等の当日タイムスタンプ物を自 run の一時物と断定せず、観測メタデータ（workflow・subject 等）で所有 run を照合する」を追加する

## 対象範囲

### 対象

- worktree-operations.md cleanup 系節（untracked 掃除の所有者確認・コマンド分離規律の追加）

### 対象外

- Jev 観測の保存契約・observation_write fail-open 契約の変更（REQ-090 系・既存維持）
- untracked 検出の機械化（integrity 検査側の変更）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-git-worktree/references/worktree-operations.md cleanup 系節 | untracked 掃除の所有者確認前置（観測メタデータ照合）と確認/削除コマンド分離規律の追加 |

## 既存対策確認

- **確認結果**: 対策あり（部分的）
- **該当ファイル**: src/common/skills/agentdev-git-worktree/references/worktree-operations.md（L375 stash の他セッション配慮は実在・untracked ファイル削除への所有者確認適用は不在・全文 grep 実測）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: untracked ファイル削除の所有者確認（観測メタデータ照合）前置と確認/削除コマンド分離規律の欠落。並行 run 観測 3 件の復元不能な誤削除実害

## 制約

- 並行実行環境の所有者照合は観測メタデータ（workflow・subject 等）を根拠とし、タイムスタンプの新旧だけを所有判定根拠にしない
- 削除は integrity NG 対応として正規手順内で行い、迂回削除としない

## 受け入れ条件

- [ ] worktree-operations.md の cleanup 系規律に所有者確認前置（観測メタデータ照合）と確認/削除コマンド分離規律が収録されていること
- [ ] 後続の並行実行環境での untracked 掃除で並行 run 生成物の誤削除が発生しないこと

## 元learning item / 根拠

- **要約**: 並行 case-auto 環境で untracked ファイルの所有者確認を削除と連結し並行 run の Jev 観測 3 件を復元不能に誤削除
- **根拠**: Case #4005 実害観測（inbox 原文で所有者確認の前置と分離規律の明文化判断を申告）・worktree-operations.md 全文 grep 実測で所有者確認規律不在（STEP-4 review Stream B が実測確認・2026-11-15）
- **再発条件**: 並行 case-auto run が稼働する環境で、main 作業ディレクトリの untracked ファイルを integrity NG 対応として掃除する場合
- **横展開可能性**: 並行実行環境の共有領域掃除全般に適用可能な規律。Jev 観測・検証記録・一時資材の所有判定に横展開可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: Case #4005・Case #4002
