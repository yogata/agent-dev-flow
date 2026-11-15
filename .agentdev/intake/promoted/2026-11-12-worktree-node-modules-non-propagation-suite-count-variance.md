# worktree は node_modules を伝播しない構造的制約により依存未復元で suite 計数が環境条件で変動する

## 観測内容

- Case #4005（PR #4020 本文 Findings/intake 候補）で記録。worktree は node_modules を伝播しない構造的制約があり、依存未復元では REQ-113-002 が skip され suite 計数が環境条件で変動する（integrity 分割 3,000 → 3,011 の差 11 件は投影・依存の復元で回収）。
- 正規整備手段は skip メッセージ記載の `bun install --cwd` と `scripts/self-sync.ps1 -Mode apply`（junctions + loader shims）。
- 本 Case の case-close 再検証でも、worktree 4015 の root node_modules 不在を bun install（package 単位整備）で復元後に正規計数を回収した。

## 影響

- worktree 作成手順に依存復元の前置が明示されておらず、worktree 内での suite 計数が環境条件（node_modules / junction / vendor 状態）で変動する。計数の環境差が baseline 対照の突合精度を低下させ得る。

## 課題

- worktree 作成手順（agentdev-git-worktree）への依存復元前置の明示、または suite 計数の環境前提（node_modules / junction / vendor 状態）の記録様式への追加の要否を判断する。

## 既存要件との関連

- Case #4005・PR #4020（実行識別情報の投影・依存の復元行・検証差分 #3）・REQ-113-002
