# worktree で bun test を実行する際の事前セットアップ手順化（agentdev-project-extensions の bun install）

## 観測

worktree 内で bun test（integrity suite 全件）を実行する際、gitignore 対象の node_modules が worktree へ伝播しないため、src/opencode/skills/agentdev-project-extensions/scripts で bun install が必要だった（git-worktree skill の構造的制約どおり、PR への影響はない）。

## 今回扱わない理由

手順の文書化（git-worktree skill 構造的制約節への追記）はスキル文書の更新であり、検査クラス実装の完了条件外である。case-close の capture 責務は回収・保存のみである。

## 影響

手順化されない場合、worktree で integrity suite を実行する後続の case-run / case-close が同一の調査を繰り返す。

## レビューで決めること

- git-worktree skill（worktree-operations.md の構造的制約節）への追記要否と記載内容
- bun install の要否判定条件（どのテスト対象で必要になるか）の明記

## 根拠

- PR #2376 本文「Findings / Capture候補」intake 4、「検証結果」備考
