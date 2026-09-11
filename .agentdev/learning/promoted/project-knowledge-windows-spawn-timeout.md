# Windowsのspawn timeout由来分類

## 背景
Windowsでintegrity suiteをフル実行した際、サブプロセス起動を伴うテストが既定timeoutで失敗した。

## 問題
Bun testの既定5秒timeoutではWindowsのspawnコストに不足し、stdout途切れによるJSON parse errorを含む環境failに見える。

## 望ましい変更
単独再実行時は`--timeout 120000`等の十分なtimeoutを指定し、通常実行のfailと区別する。由来分類結果をQG-4記録へ残す。

## 対象範囲
### 対象
- Windowsでサブプロセスを起動するintegrity testの検証手順
### 対象外
- 根拠なしのテスト削除・timeout無制限化

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| knowledge / procedures | QG-4実行手順 | timeout延長単独再実行と由来分類を明記 |

## 既存対策確認
- **確認結果**: fail由来分類・単独再実行の契約は存在、Windows具体例に補完余地
- **該当ファイル**: `docs/designs/skills/agentdev-quality-gates.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 既定5秒timeoutと延長値の具体的注記がない

## 制約
timeout延長だけでfailを無条件に環境由来と扱わず、単独再実行結果を記録する。

## 受け入れ条件
- [ ] timeout延長で対象テストを単独再実行する
- [ ] pass結果と環境由来の根拠を記録する
- [ ] failが残る場合は変更起因性を再評価する

## 元learning item / 根拠
- **要約**: Windowsの5秒spawn timeout環境fail
- **根拠**: #12、PR #2749/#2750で単独`--timeout 120000`再実行passを確認
- **再発条件**: Windows高負荷時にspawnを伴うtestを既定timeoutで実行する場合
- **横展開可能性**: Windows/Bunのサブプロセスtest全般

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2706/#2708
