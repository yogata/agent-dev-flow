# agentdev_gh の role/kind 入力契約の受理範囲明記（Case Issue 起票・後続操作）

## 背景
Case #3189（issue_update へ role 転記で invalid-input）と Case #3210（role: case + kind で
invalid-input、かつ gh issue list --label case が 0 件）で、操作別・role別の入力契約差異の
把握不足による初回失敗が2回観測された。前者の規則は issue-operation-safety.md に既に記載済み。

## 問題
agentdev_gh の受理フィールドは操作・role 別に異なるが、(a) role: case では kind が不受理
（kind requires role 'tracking'）である旨、(b) Case Issue の work_type は物理ラベル
（bug/maintenance/enhancement/bugfix 等）を labels へ指定する運用、(c) Case Issue は
"case" ラベルを持たず gh 読取補完の --label case フィルタが機能しない旨が、
issue 操作知識に未記載である。

## 望ましい変更
issue-operation-safety.md（population 実測節の隣接）と agentdev-issue-tracking の論理スキーマ
運用記述へ、role/kind/labels の受理対応表（role は issue_create/issue_list 専用、kind は
role 'tracking' 専用、role: case は labels へ work_type 物理ラベル）と「gh 読取補完は
ラベルなし列挙＋タイトル・本文確認」を追記する。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md
- src/opencode/skills/agentdev-issue-tracking/SKILL.md（Tool 呼出の 3 規則周辺）
### 対象外
- agentdev_gh Tool 本体の入力契約変更（受理仕様は現状正）

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | agentdev-issue-management/references/issue-operation-safety.md | role:case/kind 不受理・work_type 物理ラベル運用・gh ラベルフィルタ無効の規則追記 |
| 配布skill | agentdev-issue-tracking/SKILL.md | role/kind/labels 受理対応表の追記 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: issue-operation-safety.md L135（issue_update role 不受理は既記載）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: role: case での kind 不受理・work_type 物理ラベル指定・"case" ラベルフィルタ無効が未記載

## 制約
Tool 契約自体は変更しない。物理ラベル写像の再実装を上位層に誘導しない表現とする。

## 受け入れ条件
- [ ] issue-operation-safety.md に3規則が追記されている
- [ ] agentdev-issue-tracking SKILL.md に受理対応表が追記されている
- [ ] lint_skills / 契約テストが合格している

## 元learning item / 根拠
- **要約**: agentdev_gh の操作別・role別入力契約の受理範囲把握不足
- **根拠**: #3189（issue_update role で invalid-input・再実行で解消）、#3210（role:case+kind で
  invalid-input・kind 除去＋labels 物理ラベルで解消。#3186=bug、#3193/#3197/#3200=maintenance 等の実測）
- **再発条件**: issue_create 引数の流用・kind=work_type 誤前提での呼出、"case" ラベルフィルタ
- **横展開可能性**: agentdev_gh を使う全 workflow・Issue 操作

## 推奨Issue分類
- **分類**: fix（ドキュメント整備）
- **推奨ラベル**: documentation
- **関連Issue**: Root Case #3189・#3210
