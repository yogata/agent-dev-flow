# 同一ファイルへの複数 edit 同時並行適用は部分適用残骸を残し得る（順次実行・実取得再 edit 規律）

## 背景
Case #3193 の req-impact-map.md への 7 edit 同時並行実行で 1 件が guard に fail-closed 拒否され、
ブロック後の grep で newString 一部のみ反映の部分適用残骸が残っていた。

## 問題
guard の oldString verbatim 照合は他 edit の適用結果に依存して成立し得ず、拒否応答時点の
適用状態は「完全未適用」ではなく「部分適用残骸」であり得る。同時並行適用の禁止・順次実行規律と
ブロック後の実取得→再 oldString→単発再 edit 手順が明文化されていない。

## 望ましい変更
(1) 同一ファイルへの複数 edit は相互非依存の oldString 選択または順次実行に限定する規律、
(2) guard ブロック後は grep 実取得で現在状態を確認してから oldString を組み立てる手順を、
AGENTS.md 編集規律節・worktree-operations.md 書込み guard 運用指針節（L248 の再読取規則の拡張）へ追記する。

## 対象範囲
### 対象
- AGENTS.md（編集規律節）
- src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md（書込み guard 運用指針節）
### 対象外
- guard 本体（agentdev-textlint-guard）の挙動変更

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| AGENTS.md | AGENTS.md | 同一ファイル複数 edit の順次実行規律の追記 |
| 配布skill reference | worktree-operations.md | ブロック後の部分適用残骸の可能性と実取得再 edit 手順の追記 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: worktree-operations.md L248（oldString 不一致時の再読取再試行）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 同時並行適用の禁止・部分適用残骸の機構説明が未記載

## 制約
guard の fail-closed 維持原則は不変（解除・迂回ではなく規律と手順の追記）。

## 受け入れ条件
- [ ] 両ファイルに規律・手順が追記されている

## 元learning item / 根拠
- **要約**: 同時並行 edit の guard ブロックが部分適用残骸を残し得る
- **根拠**: #3193（7 edit 並行で 1 件拒否・列挙追加のみ反映の残骸→grep 実取得の oldString で単発再 edit で解消）
- **再発条件**: 同一ファイルへの複数 edit を 1 メッセージで同時並行実行し guard が verbatim 照合を行う環境
- **横展開可能性**: edit ツール利用・guard 環境全般

## 推奨Issue分類
- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: Root Case #3193・Definition PR #3196
