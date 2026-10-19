# issue-operation-recovery-tool-internal-launch-prohibition

## 背景

case-auto stage 3 の工程記録反映時、agentdev_gh が gh exit 66 で全操作失敗する Custom Tool 障害中に、回復契約（issue-operation-recovery.md）を精査せず「内部 runner の直接実行が技術的に可能」を「正規経路として許容される」と誤って解釈し、tool 内部モジュール（runAgentdevGhOperation 等）を直接起動する一時ブリッジスクリプトで Issue 本文更新と SSoT コメント投稿を実行した。復旧後に全投稿（子 Issue 6 件・SSoT コメント 3 件・判断変更記録）を正規経路で訂正する作業が発生した。同一の障害局面（gh exit 66 系の plugin ホスト環境劣化）は 5 回以上再発しており、障害時に毎回同じ誤解釈の可能性がある。

## 問題

issue-operation-recovery.md は書込みの非正規経路禁止を規定する（「読み取り系操作に限り bash gh 例外手順。書込み系は正規経路に限定」・診断手順の「書込み操作の gh CLI 代替禁止」）が、tool 内部モジュールの直接起動（CliRunner 経路）を書込みに流用することを明示的に禁止する規定を持たない。同文書の診断手順は CliRunner 直接実行を読み取り切り分けとして正当に規定しており、この診断手順と書込み禁止の間の文脈混同を防ぐ規律が不在である。custom-tool-contracts.md は「書込み系の直接実行は許容しない（読取 contingency は許容）」を規定するが、回復契約文書からはこの契約が参照されていない。

## 望ましい変更

issue-operation-recovery.md「劣化サイクルの定量観測と縮退運用パターン」節の gh exit 66 例外手順の近傍へ、次の趣旨の明記を追記する: 「内部モジュール（CliRunner 等の tool 内部 API）の直接起動は診断手順の読み取り切り分けに限定され、書込みを含む操作での直接起動は非許容（正規経路は Custom Tool に限定）」。あわせて診断手順節へ、障害時の最初の対応として回復契約文書の必読を組み込む候補を記す。文言の正確な確定は req-define の変更影響分析に委ねる。

## 対象範囲

### 対象

- src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md（縮退運用パターン節・診断手順節への明記追記）

### 対象外

- custom-tool-contracts.md の契約変更（読取 contingency 許容・書込み禁止の現行契約は変更しない）
- gh-write-guard 等の機械的 enforcement の導入
- 他 skill references への横展開（ワークフロー orchestration の障害伝播節は判断材料として参照するに留める）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill references | src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md | 内部モジュール直接起動の書込み非許容明記（診断手順の読取切り分けとの境界明確化）＋回復契約必読の前置 |
| Design（情報候補） | docs/designs/responsibilities/custom-tool-contracts.md | 契約変更なし。回復契約文書からの参照先として言及される可能性 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: issue-operation-recovery.md（L33「書込み操作の gh CLI 代替禁止」・L62「書込み系は正規経路に限定」）、custom-tool-contracts.md（L111「書込み系の直接実行は許容しない（読取 contingency は許容）」・L118 正規経路規定）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 診断手順（CliRunner 直接実行を規定）と書込み禁止の間の文脈混同を防ぐ規律が回復契約文書に不在。書込みの非正規経路禁止自体は既存であるが、障害時に回復契約を確認せず内部 runner 直接実行を「技術的に可能＝正規」と誤解釈した実例が存在し、診断手順の読取直接実行を書込みへ流用する誤解釈を防ぐ明記が欠けている

## 制約

- 診断手順の 2 段分離試験（bash 直叩き・CliRunner 直接実行による読み取り切り分け）は既存の正当な手順であり、追記文言がこれを無効化しないこと（adversarial-review finding A1 で確認された矛盾）
- custom-tool-contracts.md の読取 contingency 許容と矛盾しない文言とすること
- 文言は追加のみで既存規定を書き換えない

## 受け入れ条件

- [ ] issue-operation-recovery.md に、書込みを含む操作での tool 内部モジュール直接起動の非許容が明記されていること
- [ ] 追記文言が診断手順（読み取り切り分けとしての直接実行）と矛盾しないこと
- [ ] 障害時の最初の対応として回復契約文書を確認する前置が（採用する場合）診断手順節へ組み込まれていること

## 元learning item / 根拠

- **要約**: Custom Tool 障害時に tool 内部 API 直接起動の非正規経路書込みを防ぐ回復契約の規律明記
- **根拠**: 復旧後に全投稿を正規経路で訂正する作業とユーザー確認を要した実害 1 回。fix gap は実測（「直接起動」「内部モジュール」「内部 API」「非許容」の grep 0 件）で確認。反映文言の矛盾（A1）は adversarial-review で解決済み
- **再発条件**: Tool 障害中に GitHub 書込みを要する記録契機が発生し、回復契約を確認せず内部 API の直接起動に至る場合
- **横展開可能性**: Custom Tool を使用する全 workflow（6 系統）の障害局面に適用可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: なし
