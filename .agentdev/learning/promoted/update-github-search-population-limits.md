# GitHub search population 列挙制約（title トークン依存・index 遅延）の補完検出手順整備

## 背景

case-open STEP-5 の冪等検出・横断依存検査で、agentdev_gh issue_list による population 全体列挙が Case #3169 と Case #3175 の2観測で欠落を起こした。いずれも gh CLI 読み取り専用 contingency で補完して検査は継続できたが、search の 0件帰着が「不存在」と「失敗・遅延」を区別できない構造の問題が実観測で確認された。

## 問題

- agentdev_gh issue_list の search は GitHub search/issues の in:title トークン照合であり、title に検索トークンを含まない Issue は検出不能。論理 role 単位の網羅列挙は物理ラベル写像が Tool 内部管理のため呼出側から直接指定できない
- 作成直後の Issue/PR は search index 反映遅延の時間窓で検出不能。0件帰着は ok: true で返り、不存在と失敗・遅延を区別できない
- REQ-092（issue_list search 規律）は存在するが、index 遅延と title トークン選択性の population 列挙への影響が未取込

## 望ましい変更

- search 0件帰着時は issue_read 直参照または gh issue list 読取補完のいずれかで不存在を二重確認する手順の明文化
- population 列挙は search なし・state 単位の列挙（gh CLI または issue_list の等価操作）を実測手段とし、search トークン方式は重複排除・特定用途に限定する規律の整備
- search index 遅延の実観測を REQ-093-001 known-issues 節へ記録

## 対象範囲

### 対象

- agentdev-issue-management issue-operation-safety.md（issue_list 絞り込み規律・known-issues 節）
- case-open / case-ready の横断依存検査・冪等検出手順（population 収集の実測手段記述）
- REQ-092 / REQ-093 系文書

### 対象外

- agentdev_gh Tool 契約自体の変更（search は GitHub search API への推送という現行契約は不変）
- gh CLI による書込み代替（読み取り専用 contingency に限定する現行契約を維持）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md | search 0件帰着時の二重確認手順、known-issues 節への index 遅延実観測の記録 |
| REQ | docs/requirements/REQ-092.md 関連 | issue_list search 規律への population 列挙制約（title トークン選択性）の取込候補 |
| REQ | docs/requirements/REQ-093.md 関連 | known-issues 節整備（Case #3175 実観測）の記録候補 |
| 配布skill reference | .opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | 「GitHub I/O 失敗時の gh CLI 切替継続手順」節への index 遅延補完の追記候補 |

## 既存対策確認

- **確認結果**: あり（fix gap）
- **該当ファイル**: docs/requirements/REQ-092.md、src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: search 規律は既存だが、index 遅延の実観測（0件帰着の解釈問題）と title トークン選択性の実観測（role: case 指定でも取りこぼし）が未反映。該当 deferred エントリなし（近縁は PR 番号 SSoT 記録欠落系の別問題クラス）

## 制約

- gh CLI による書込み代替は不可。補完は読み取り専用 contingency に限定する（切替基準・使用コマンド・検出結果の検証記録を残す）
- search index 反映待ちの sleep ポーリングは非効率のため推奨しない（二重確認手順での代替）

## 受け入れ条件

- [ ] search 0件帰着時の二重確認手順（issue_read 直参照または gh issue list 読取補完）が明文化されること
- [ ] population 列挙の実測手段（search なし・state 単位列挙）と search トークン方式の適用限定が規律として明記されること
- [ ] search index 遅延の実観測が known-issues 系の記録先へ反映されること

## 元 learning item / 根拠

- **要約**: GitHub search API 特性（in:title トークン照合・index 反映遅延）に起因する agentdev_gh issue_list の population 列挙制約
- **根拠**: 2観測。
  - inbox「agentdev_gh issue_list は role: case 指定でも物理ラベル依存で未クローズ Case 群を網羅列挙できず、横断依存検査の population 収集は gh CLI 読み取り補助が実質必要になる」（Case #3169・PR #3170）: 作成直後の Root Case #3169（title に「case」を含まない）が search・labels どちらの指定でも 0件。gh issue list --state open で population を実測（1件）し横断依存検査を完了
  - inbox「GitHub search API の index 遅延で issue_list が作成直後の Issue を 0件帰着させる」（Case #3175・PR #3178）: 直前に作成した Root Case #3175（title に「REQ-093」を含む）が search「REQ-093」「REQ」「agentdev」いずれでも 0件帰着（ok: true）。gh issue list --json では未クローズ Case 3件が即時取得できた
- **再発条件**: population 全体列挙（冪等検出・横断依存検査）および作成直後の Issue/PR の search 再検出
- **横展開可能性**: GitHub search API の一般特性。search 依存の全操作（冪等検出・重複確認・自己参照値の埋め戻し確認等）に波及する

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, bug
- **関連Issue**: なし
