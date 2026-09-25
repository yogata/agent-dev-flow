# 既存対策の更新: worktree 型検証の依存整備手段判定補助（main 側 node_modules 不在時の bun install 一意化）

## 背景

Case #3103 の worktree 内で tsc 型検証（DEL-3103-2）を実行した際、bun types の解決失敗（TS2688）が発生した。
worktree には main 側 node_modules が自動伝播しない。main 側 node_modules が存在しない場合は junction による依存共有が成立せず、依存整備手段は worktree 内 bun install へ決定的に切り替わる。
agentdev-git-worktree の bun test 実行環境前提に従って worktree 内 bun install を実行し、型検証を再実行した。tsconfig の書き戻しがないことを git status で確認した（PR 本文の記録）。

## 問題

worktree で型検証・テストを行う際の依存整備手段選択について、既存の選択基準（junction による依存共有 / worktree 内 bun install）は存在するが、「main 側 node_modules 不在時は worktree 内 bun install へ一意に決まる」という判定補助の明示がない。
junction 未伝播かつ main 側 node_modules 不在の条件で、手段選択の判断に迷う余地が残る。

## 望ましい変更

bun 依存整備手段の選択基準表に、main 側 node_modules 不在時は手段2（worktree 内 bun install）へ一意に決まる判定補助を追記する。

- worktree 内で依存パッケージを必要とする検証の前に、node_modules の伝播状態（junction の成立・main 側 node_modules の存否）を確認する手順を明示する。

## 対象範囲

### 対象

- agentdev-git-worktree の worktree-operations.md「bun test 実行の環境前提」節（実在確認済み）の選択基準表への判定補助追記

### 対象外

- worktree の junction 機構自体の変更
- bun install の実行手順自体の変更（既存前提に従う）
- REQ-018（worktree 構造的制約とテスト fallback）の契約変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 「bun test 実行の環境前提」節の選択基準表に main 側 node_modules 不在時の判定補助を追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md「bun test 実行の環境前提」節（目次に同節の実在を確認済み）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: junction / bun install の選択基準は存在するが、main 側 node_modules 不在時の判定補助（一意に worktree 内 bun install へ決まる条件の明示）がない。

## 制約

- tsconfig 等の設定ファイルの書き戻しが発生しないことを実行後に確認する運用（git status 確認）を維持する。
- bun test 実行環境前提の既存記述（worktree 構造的制約、node_modules 未伝播）と矛盾しない追記にする。

## 受け入れ条件

- [ ] 選択基準表に「main 側 node_modules 不在時は worktree 内 bun install に一意に決まる」判定補助が追記されている
- [ ] 検証前の node_modules 伝播状態確認手順が確認できる

## 元learning item / 根拠

- **要約**: worktree 型検証で bun types が未解決の場合の依存整備手段選択（判定補助の明示ギャップ）。
- **根拠**: Case #3103（PR #3130）の DEL-3103-2 型検証での TS2688 発生と worktree 内 bun install による解消実績。REQ-018・agentdev-git-worktree の bun test 実行環境前提の運用記録。
- **再発条件**: worktree 内で依存パッケージを必要とする検証を行い、依存未伝播かつ main 側 node_modules が存在しない場合。
- **横展開可能性**: worktree を使う全検証工程（case-run、検証系サブエージェント）で発生し得る環境前提の知見。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation（判定補助追記）
- **関連Issue**: Case #3103（PR #3130）
