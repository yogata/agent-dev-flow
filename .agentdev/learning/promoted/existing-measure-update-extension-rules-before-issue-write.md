# GitHub本文の更新前にworkflow extension rulesを確認する

## 背景

case-ready が Root Case 本文を更新した際、適用対象の workflow extension rules（GitHub本文を agentdev_gh へ渡す前に yomiyasu 推敲する規則）を確認せず投稿した。投稿後の散文検査で補完したが、前置手順の欠落は残った。

## 問題

Issue / PR 本文の書込み手順に、適用される workflow extension の rules を書込み前に解決・適用する必須工程が明示されていない。

## 望ましい変更

GitHub本文の書込み前に、実行中の workflow に適用される extension rules を確認し、要求される前処理を実行する手順を既存の書込み手順で明示する。投稿後の検査は前置処理の代替にしない。

## 対象範囲

### 対象

- Case / Issue / PR 本文の更新を行う workflow 手順
- workflow extension の rules 解決と書込み前処理の境界

### 対象外

- extension の適用を無条件に省略すること
- 既に実行された投稿を根拠に前置規律を不要とみなすこと

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | `agentdev-workflow-case-ready/references/execution-contract.md`、同様に GitHub 本文を更新する case-open / case-run 手順 | 書込み直前の extension rules 確認候補 |
| 配布skill | `agentdev-project-extensions` | 実行時 rules 解決契約との接続候補 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `agentdev-project-extensions` の runtime 読込契約、case-ready Root Case 本文更新手順
- **ギャップ分類**: application miss
- **ギャップ詳細**: rules の読込能力はあるが、本文書込み直前の必須確認として更新操作に結び付いていなかった。

## 制約

extension から適用される規則を削除・弱化しない。書込み後の検査を前置規律の代替として扱わない。

## 受け入れ条件

- [ ] GitHub本文更新前に適用対象の extension rules を確認する工程が明確である。
- [ ] rules が要求する前処理を書込み前に適用する。
- [ ] 投稿後検査を前置処理の代替にしない。

## 元learning item / 根拠

- **要約**: extension rules の確認前に Root Case 本文を投稿し、事後 lint で補完した。
- **根拠**: inbox の E9、Issue #3674、`.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml`。
- **再発条件**: extension rules が GitHub本文の前処理を要求する状態で、workflow が Issue / PR 本文を更新する場合。
- **横展開可能性**: 同様の書込みを行う Case / Issue / PR workflow 全般。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: #3674
