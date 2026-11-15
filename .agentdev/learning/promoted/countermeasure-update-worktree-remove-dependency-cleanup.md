# worktree remove 前の依存整備物掃除前置の明記

## 背景

Windows 環境の case-close STEP-6（worktree・branch 削除）で、bun install や vendor 生成（textlint-guard plugin 配下の node_modules・vendor）を実施した worktree の git worktree remove が物理削除段階で失敗し、メタデータ解除のみが先行完了して「登録解除済み + 残骸ディレクトリ残存」の半分状態が残る事象が 4 Case（#3967・#3969・#3970・#4049）で反復した。worktree 登録は解除済みのため worktree list から対象が消える一方、node_modules 残骸付きのディレクトリが残存する

## 問題

worktree-operations.md「1.5 remove 前退避ファイル掃除」節（L395-401）の掃除対象が「.agentdev/tmp/ 配下の checker stdout / stderr 分離退避、検査入力 JSON 等の一時ファイル」に限定されており、依存整備で生成した gitignore 対象物（node_modules・vendor 等）が掃除対象に含まれない。その結果、remove 前に依存整備物が残存し、Windows の MAX_PATH・ファイルロック・大量ファイルにより物理削除段階が失敗する

## 望ましい変更

「1.5 remove 前退避ファイル掃除」節の掃除対象に依存整備物（node_modules・vendor 等 gitignore 対象・明示パス指定で fs.rmSync 等により削除）を含める前置を明記する。半分状態検出時の回復手順（rm -rf + git worktree prune + worktree list と物理ディレクトリ実在の照合）は L458-488 の既存フォールバック（MAX_PATH 起因・Filename too long 起因）で既に実在するため、前置掃除の追加のみを対象とする

## 対象範囲

### 対象

- worktree-operations.md「1.5 remove 前退避ファイル掃除」節（掃除対象の一覧に依存整備物を追加）
- case-close references cleanup-and-capture.md STEP-6-1 の「remove 前退避ファイル掃除」参照行（対象の追記に追随）

### 対象外

- git worktree remove 自体の実装・リトライ契約の変更（既存の Permission denied リトライ・フォールバック手順は維持）
- LongPathsEnabled 等の OS 設定変更
- case-close scripts 実装の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-git-worktree/references/worktree-operations.md「1.5 remove 前退避ファイル掃除」節 | 掃除対象に依存整備物（node_modules・vendor 等 gitignore 対象・明示パス指定）を追加 |

## 既存対策確認

- **確認結果**: 対策あり（部分的）
- **該当ファイル**: src/common/skills/agentdev-git-worktree/references/worktree-operations.md（L395-401 掃除節・L458-488 回復フォールバック実在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 1.5 節の掃除対象一覧に依存整備物（node_modules・vendor 等 gitignore 対象物）が含まれない（grep 実測・2026-11-15）。回復手順（半分状態検出時の rm -rf + prune 掃除）は L458-488 で被覆済み

## 制約

- 掃除対象は worktree 内に自 Case が生成した gitignore 対象物に限定する（他 Case 生成物の削除は既存の所有者確認規律に従う）
- 削除は明示パス指定とし wildcard を使用しない
- Windows 環境での fs.rmSync は bun 1.3.6 で maxRetries/retryDelay が無視される既知事象があるため、既存の bounded retry 慣行に従う

## 受け入れ条件

- [ ] 「1.5 remove 前退避ファイル掃除」節の掃除対象一覧に依存整備物（node_modules・vendor 等 gitignore 対象・明示パス指定）が含まれていること
- [ ] 削除後の git worktree remove が依存整備済み worktree で部分失敗しないことを 1 Case 以上で実測確認できること
- [ ] case-close cleanup 参照行との文言整合が取れていること

## 元learning item / 根拠

- **要約**: 依存整備済み worktree の git worktree remove が Windows 環境で部分失敗し残骸ディレクトリが残る（4 Case 反復）
- **根拠**: 4 Case（#3967 node_modules 1437+ ファイル・#3969 vendor 伝播済み 739 ファイル・#3970 半分状態・#4049 Filename too long）で同一パターンを観測。worktree-operations.md L395-401 の掃除対象文言に依存整備物が不在（grep 実測・2026-11-15）
- **再発条件**: worktree 内で node_modules・vendor 等の深いパスを持つ依存物を生成した後に git worktree remove を実行する条件
- **横展開可能性**: 依存整備（bun install・build:engine）を実施した worktree の cleanup は全 Case で同型の失敗が起こり得る（case-run で整備し case-close で削除する構成は常にこの組合せを含む）

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
