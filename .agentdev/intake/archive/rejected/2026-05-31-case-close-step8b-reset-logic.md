# case-close Step 8b の git checkout -- リセット対象判定ロジックの不備

## 観測

case-close の Step 8b（git pull --ff-only 実行前のローカル変更リセット）で、`git status --porcelain` で検出された全ローカル変更を `git checkout --` で無差別にリセットした結果、case-open で意図的に削除済みの RU ファイル（`.agentdev/backlog/req-units/RU-0001.md`）が git HEAD から復元された。

case-close コマンド定義の Step 8b は「ローカル変更リセットはPRで削除されたファイルに限定して実行する（SHALL）」と規定しているが、実行時の判定ロジックがこの規定に準拠していなかった。`.agentdev/` 配下の変更（case-open での RU 削除、learning/intake 追記）は PR 外の操作であり、pull 前リセットの対象ではない。

## 今回扱わない理由

修正は case-close コマンド定義（`.opencode/commands/agentdev/case-run.md` 内の Step 8b）の改善タスクとして扱うべき。現在の case #474 のスコープ外。

## 影響

- 全 case-close 実行で `.agentdev/` 配下に未コミット変更がある場合に再発する
- learning/intake capture（Step 9）の成果物が Step 8b でリセットされる可能性がある

## レビューで決めること

- Step 8b のリセット対象を `.agentdev/` 配下以外に限定するか
- Step 9（learning/intake capture）を Step 8b の前に実行して commit 済みにするか
- `git status --porcelain` の出力をフィルタリングする判定基準

## 根拠（任意）

- Issue #474 case-close 実行時に発覚
- commit d9084cb で手動再削除を実施