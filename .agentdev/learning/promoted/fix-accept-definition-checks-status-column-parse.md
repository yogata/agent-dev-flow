# case-ready cleanup script の git status 列解析（trim 後先頭列参照）の是正

## 背景

case-ready STEP-7 の cleanup script（accept_definition_checks.ts canonical-and-cleanup phase）で、git status --short を行単位 trim 後に先頭列（entry[0]）で staged 判定する実装のため、worktree-only の未ステージ modified（兄弟 Case 所有の RU-0002 ドラフト）が staged と誤判定され、staged-entries-check の fail-closed で commit が停止した（Root Case #3653）。

## 問題

trim() 後の先頭列参照では git status --short の XY 2 列形式の X（staged 状態）と Y（worktree 状態）が区別できず、X が空白（未ステージ）の行が staged 扱いになる。実装バグが 2026-10-13 実測で現存している（L583 `.map((line) => line.trim())` の後の L586 `entry[0] !== " " && entry[0] !== "?"` は trim 後配列の 0 番目＝Y 列を読んでいる）。あわせて、前回実行の git rm 済みで working tree から消えた removals への再 git rm が pathspec 不一致で停止する 2 段障害が観測されている。

## 望ましい変更

status 解析を trim 前の列位置（raw line の [0] = X、[1] = Y）で判定する修正を行う。あわせて、インデックスの削除状態確認を前置した git rm の冪等化を検討する。

## 対象範囲

### 対象

- accept_definition_checks.ts の staged-entries-check における git status --short 出力の列解析

### 対象外

- case-ready STEP-7 手順自体の変更
- git status 出力形式への依存の全面解消（porcelain v2 への移行等の大幅リファクタ）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布script | src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts | stagedEntries 判定を trim 前の raw line の列位置（[0] と [1]）参照に修正 |

## 既存対策確認

- **確認結果**: 既存対策なし（列判定の実装不備）
- **該当ファイル**: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（L583-586）
- **ギャップ分類**: fix gap（実装不備）
- **ギャップ詳細**: trim 後の配列で entry[0] を参照するため、未ステージ modified（X 列が空白の行）が staged と誤判定される。staged-entries-check は fail-closed であるため誤判定時は commit が停止する（データ喪失はしないが工程が停止する）

## 制約

- 実害は回収済み（手動の staged entries check 確認と明示パス指定 commit で完了・commit 90733116）。2 段障害（git rm pathspec 不一致）も手動回収済み
- 修正は列参照位置の変更で済む一行相当の是正であり、未ステージ modified 混在時の回帰テスト追加を推奨する
- fail-closed 契約（誤判定時に停止して安全側に倒れる）は維持する。判定精度を上げる修正であり、check の緩和ではない

## 受け入れ条件

- [ ] git status --short の raw line を trim 前に列位置 [0]（X）と [1]（Y）で判定する
- [ ] 未ステージ modified が混在する状態で誤判定しないことを検証する回帰テストが存在する
- [ ] 既存の cleanup フロー（明示パス指定 commit）と非競合である

## 元learning item / 根拠

- **要約**: case-ready cleanup script が trim 後の先頭列判定で未ステージ modified を staged と誤判定した事象（Root Case #3653）
- **根拠**: script 報告 JSON の draft-ru-removal-commit fail（stagedEntries に未ステージ modified が混入）。XY 2 列形式の trim 後先頭列参照の機構を実装実測で確認
- **再発条件**: cleanup 実行時点でワークツリーに無関係な未ステージ modified が存在するとき。および git rm が部分適用された状態で同一 script を再実行したとき
- **横展開可能性**: git status --short の X/Y 2 列形式を自前解析する checker は trim 前の列位置で X と Y を区別する必要がある。working tree から消えた removals への再 git rm は pathspec 不一致になるため git rm 前提の cleanup script 再実行は冪等でない点も同型 script 全般に適用可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: なし（参考: commit 90733116）
