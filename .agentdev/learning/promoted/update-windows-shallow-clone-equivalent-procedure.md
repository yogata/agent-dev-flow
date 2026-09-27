# Windows 環境の shallow clone 再現手順（git clone --depth の file:// transport 不動作時の等価手順）の knowledge 文書補記

## 背景

case-run TS-001 原因クラス別再現（Case #3177・PR #3181）で、検証ラボ local origin に対する shallow clone クラスの確定的再現手順（git clone --depth、file:// URL）を Windows 本環境（git 2.53.0.windows.3）で実行したところ "does not appear to be a git repository" で失敗した。git init + git fetch --depth=1 の等価手順へ読替し、`git rev-parse --is-shallow-repository` = true と shallow boundary より古い baseline commit の参照不能を確認して TS-001 判別力検証を完了した。

## 問題

- Windows 版 git の file:// transport における upload-pack 経由のローカル clone/fetch が失敗する（環境制約・git 2.53.0.windows.3 実測。git 本体の不具合詳細は未特定）
- docs/knowledge/qg4-baseline-detached-worktree-reproduction.md の shallow 再現手順は git clone --depth を規定するため、Windows 環境ではそのまま実行できない。等価手順の注記が欠落している

## 望ましい変更

- docs/knowledge/qg4-baseline-detached-worktree-reproduction.md の shallow 再現手順へ、Windows file:// transport 不動作時の等価手順（git init + git fetch --depth=1 <file:// remote>）の注記を補記する

## 対象範囲

### 対象

- docs/knowledge/qg4-baseline-detached-worktree-reproduction.md（shallow 再現手順の Windows 環境注記）

### 対象外

- git 本体の不具合詳細の究明（未特定のまま注記で対応）
- REQ-007-013 再現手順自体の変更（環境読替の知見の補記が対象）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/qg4-baseline-detached-worktree-reproduction.md | shallow 再現手順への Windows 環境注記（git init + fetch --depth=1 等価手順）補記 |

## 既存対策確認

- **確認結果**: あり（fix gap）
- **該当ファイル**: docs/knowledge/qg4-baseline-detached-worktree-reproduction.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 対象 knowledge 文書が既存し、clone --depth 規定手順に対する Windows 等価手順の注記が欠落。近縁 deferred「Windows 環境でスクリプトの network 系コマンド不使用をダミー git.cmd で実行時証明する検証技法」は Windows git 検証系の別面。該当 deferred エントリなし

## 制約

- 等価手順は shallow 状態の確定的再現が目的であり、`git rev-parse --is-shallow-repository` = true と shallow boundary 越えの参照不能確認を伴うことを手順に含める
- Windows 環境では等価手順への読替が実質必須（clone --depth 規定手順は file:// transport 不動作のため実行不可）

## 受け入れ条件

- [ ] knowledge 文書の shallow 再現手順に Windows file:// transport 不動作時の等価手順が注記されること
- [ ] 注記に適用環境条件（git 2.53.0.windows.3 実測）と shallow 確認手順が含まれること

## 元 learning item / 根拠

- **要約**: Windows 環境で git clone --depth の file:// transport が動作せず、git init + fetch --depth=1 の等価手順で shallow 状態を再現する
- **根拠**: inbox「Windows 環境で git clone --depth の file:// transport が動作せず git init + fetch --depth=1 の等価手順で shallow 再現する」（Case #3177・PR #3181）: upload-pack 経由の clone/fetch が "does not appear to be a git repository" で失敗。等価手順へ読替し is-shallow-repository = true・baseline commit 参照不能を確認、TS-001 判別力検証を完了
- **再発条件**: Windows 本環境で git clone --depth の file:// transport を検証手順に使用する場合
- **横展開可能性**: Windows 環境で shallow 状態を作る検証全般（QG-4 baseline 参照不能時の原因調査・shallow 再現等）に適用可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: なし
