# Decision 受理評価（STEP-3）

canonical Definition 確定後の proposed Decision の受理評価と accepted 遷移の実行時詳細である。
Decision のライフサイクル規則の正規所有は Decision Lifecycle Design、Decision ファイル操作の正規所有は `agentdev-decision-file-manager` である。

## 評価対象の特定

- 対象 REQ が Decision frontmatter の関連REQ宣言（related_reqs）に含まれ、かつ status が proposed の Decision を評価対象として特定する
- 特定は正規情報源（Decision ファイルの frontmatter）のみを用いる。本文の意味、文字列類似、周辺参照等の意味推測で補完しない
- 評価対象が 0 件の場合は本 STEP を完了とし、STEP-4 へ進む

## 受理評価

評価対象の各 proposed Decision について受理可否を評価する。

- req-define での合意内容と現行 REQ・Design・実装の状態から受理可否を一意に確定できる場合、既存ライフサイクル規則と承認記録形式に従って accepted への状態遷移を実行してから処理を継続する
- 状態遷移の実行は `agentdev-decision-file-manager` へ委譲する。case-ready 自身は Decision ファイルの保存手続きを実装しない
- 一意に確定できない場合はユーザー判断を求めて停止する
- 受理不能、または判断情報が不足する場合は proposed のまま維持し、ready へ遷移せず停止理由を報告する

## 冪等

- 再実行時、既に accepted へ遷移済みの Decision に対して重複する状態遷移や承認記録を生成しない
- 受理評価の判定結果は Root Case 本文の execution contract（関連 Decision の受理状態）に反映し、再開点の永続状態とする
