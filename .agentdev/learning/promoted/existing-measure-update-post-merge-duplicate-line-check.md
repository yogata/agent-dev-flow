# case-close 取り込み確認手順への merge 後重複行実検査の明記（squash merge auto-resolve 対応）

## 背景

同一スクリプト接触 PR（#3747 型エラー修正 → #3751 入力検証追加、3行重複見込み）を直列化してマージした結果、2つ目の PR は mergeStateStatus CLEAN のままマージ成功し、重複行混入は発生しなかった。GitHub の merge 機構が同一変更内容の行を畳み込む（trivial 重複の auto-resolve）platform 挙動が観測された。本件は実害が発生しなかった正常系の観測であるが、CLEAN 判定でも重複行が無音に畳み込まれ得ることが実証され、マージ後の取り込み実在確認で重複行なしを検査して受理した運用が有効だった。

## 問題

case-close の GitHub 版 STEP-4（`pr-merge-and-conflict.md`）は mergeable ポーリング・CONFLICTING 遷移の自動分岐・STEP-4-4 ローカル先行 commit 処理・STEP-4-5 コンフリクト解消 rebase パスを規定するが、同一ファイル接触 PR を直列に連続マージした場合の merge 後の重複行実検査（マージ後 main で該当行カウントを grep 等で確認する等）を規定する条項がない。CLEAN 判定は CONFLICTING を検出しない（GitHub が trivial 重複を auto-resolve する）ため、無音の重複混入または無音の畳み込みを検査せずに受理するリスクが残る。

## 望ましい変更

`pr-merge-and-conflict.md` の取り込み確認手順に、同一ファイル接触 PR を連続マージした場合の merge 後重複行実検査を明記する。既存の STEP-4-4「内容重複確認」（ローカル先行 commit vs remote squash commit の重複確認・`git pull --ff-only` 失敗予防目的）とは目的が異なる（本検査は merge 後の本文重複の無音混入検出）ため、区別して記載する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md`（GitHub 版 STEP-4 の取り込み確認への重複行実検査条項追記）

### 対象外

- ローカル版マージ手順（STEP「ローカル版 PR マージ（取り込み）の手順」の対象変更取り込み実在確認〔意味突合〕は既存のまま維持）
- STEP-4-5 コンフリクト解消 rebase パス（rebase 解消編集の取り込み確認〔merge 後 main 再検証〕は既存のまま維持）
- mergeable ポーリング契約・squash merge リトライ手順（変更しない）
- 直列化運用そのもの（同一ファイル接触 PR の直列マージは競合予防として維持）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill references | `src/common/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md` | GitHub 版 STEP-4 に同一ファイル接触 PR の merge 後重複行実検査条項を追記（STEP-4-4「内容重複確認」との目的差を区別して明記） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `src/common/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md`（L102-104 rebase 解消編集の取り込み確認、L112 ローカル版の対象変更取り込み実在確認〔意味突合〕、L89〔STEP-4-4〕内容重複確認）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: GitHub 版 STEP-4 に merge 後の重複行実検査の規定がない。L102-104 は rebase 経路限定、L112 はローカル版限定、L89 は目的が異なる（pull 失敗予防）ため、GitHub 版直列マージ後の本文重複検査がどの手順にも帰属しない

## 制約

- 直列化運用（同一ファイル接触 PR の直列マージ）は既存どおり維持する。本検査は直列化の補完であり、置換しない
- CLEAN 判定（mergeStateStatus）を取り込み受理の根拠にしない規律として明記する（GitHub の trivial 重複 auto-resolve により CLEAN でも重複は理論上起こり得る）
- STEP-4-4/4-5 の既存手順と mergeable ポーリング契約（10秒間隔・上限60秒）は変更しない

## 受け入れ条件

- [ ] 同一ファイル接触 PR を連続マージした場合の merge 後重複行実検査が取り込み確認手順に明記されている
- [ ] STEP-4-4 の「内容重複確認」との目的差（無音 auto-resolve 検出 vs `git pull --ff-only` 失敗予防）が区別して記載されている
- [ ] CLEAN 判定単独では取り込み受理としない規律が明記されている

## 元learning item / 根拠

- **要約**: 同一ファイルの軽微な行重複は GitHub squash merge が CONFLICTING にならず auto-resolve し得るため、直列マージ後の重複行実検査を case-close の取り込み確認手順に明記する
- **根拠**: PR #3747（merge commit 0026aefc）→ PR #3751（merge commit 29ae287f）の直列マージで、2つ目の PR は CLEAN のままマージ成功。マージ後の main で当該ファイルの重複行検査（narrow 行 1 件・残存 exitCode 明示行は #3751 追加の traceability gate 引数であり重複なし）を実施して受理した。根本原因は GitHub merge 機構の同一変更内容行の畳み込み
- **再発条件**: 同一ファイルへの並列変更 PR を直列化せず連続マージした場合（CLEAN 判定でも意味的重複の危険は残る）
- **横展開可能性**: GitHub を使う並列 PR 運用一般で起こり得る platform 挙動の知見。case-close の PR マージ全般に適用

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: なし（Case #3729、PR #3747/#3751）
