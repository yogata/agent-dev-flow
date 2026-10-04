# yomiyasu lint 実行経路の Windows 代替経路の明記（extension rule 改訂候補）

## 背景

project extension rule「yomiyasu-application-before-write」は「同梱 lint を標準入力により実行し、検査専用の本文ファイルを新規保存しない」を規定するが、Windows + bash 環境では日本語本文を標準入力（heredoc・inline）へ渡すと escape 解釈・heredoc 打ち切りによるコンテンツ破損の既知リスクがあり、worktree 操作指針（worktree-operations.md「shell inline・heredoc に起因するコンテンツ破損の回避」）はファイルベース伝達を標準手段とする。両規定が緊張する事象が観測された（Case #3388・Definition PR #3389）。

## 問題

extension rule が POSIX 標準入力前提で記述され、Windows 環境の破損回避指針との整合が未定義のため、rule 遵守とコンテンツ破損回避が両立できない。

## 望ましい変更

extension rule（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` 等、当該 rule を持つ workflow extension 群）へ Windows 環境の代替経路を明記する: guard 安全な経路（Write ツール等による検査専用本文ファイルの新規作成〔.agentdev/integrity/reports/ 配下・非永続領域〕+ lint のファイル引数実行 + 検査後削除）を Windows 環境での標準とする。実績のある適用（Case #3388・指摘は保持条件該当のみ・入力ファイル検査後削除・残留なし確認済み）を踏襲する。

## 対象範囲

### 対象

- `.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`（rules の yomiyasu-application-before-write。2026-10-05 実測: 標準入力規定のみで Windows 代替経路の記述なし）
- 同 rule を持つ他 workflow extension の横断確認

### 対象外

- yomiyasu skill 本体・lint スクリプトの変更
- worktree-operations.md の破損回避指針（現行維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 拡張 | .agentdev/extensions/skills/agentdev-workflow-case-open.yaml | rule への Windows 代替経路（ファイル引数+検査後削除・非永続領域）明記 |
| 拡張 | 同 rule を持つ他 workflow extension | 横断確認と同一追記 |

## 既存対策確認

- **確認結果**: 既存対策なし（rule に Windows 経路の規定なし）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: rule と guard 指針の緊張が未定義。Case #3388 は代替経路で自己解決したが規定化されていない

## 制約

- REQ-098 の推敲・lint 確認義務の内容は変更しない（実行経路のみ）
- 検査専用ファイルは非永続領域に限定し検査後削除する

## 受け入れ条件

- [ ] Windows 環境での代替実行経路が rule に明記される
- [ ] 横断確認（同 rule を持つ extension）の結果が記録される

## 元learning item / 根拠

- **要約**: yomiyasu lint 標準入力規定と Windows 破損回避指針の緊張（1件）
- **根拠**: Case #3388・Definition PR #3389（ファイル引数+検査後削除で代替実施・保持指摘のみ・残留なし確認）
- **再発条件**: Windows + bash 環境で extension rule の標準入力実行規定に従い日本語本文を渡す場合
- **横展開可能性**: Windows 環境で yomiyasu lint を実行する全工程（case-run・case-close 等）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, windows
- **関連Issue**: なし
