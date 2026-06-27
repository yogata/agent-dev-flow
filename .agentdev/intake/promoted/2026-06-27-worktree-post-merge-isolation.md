# worktree 隔離設計変更（case-close post-merge Step 9-11）

## 観測内容

Issue #1158（PR #1160、RU-0019「worktree 運用標準化」）は、`worktree-operations.md`、`git-common-procedures.md`、`case-close.md` Step 9 に worktree 運用標準手順を組み込んだ。ただし post-merge ステップ（9-11）における worktree 隔離設計の破壊的変更は「別途検討候補として記録」し、本 Issue スコープから除外した。

完了条件 checkbox でも「post-merge ステップ（9-11）の worktree 隔離設計変更は含まれないこと（対象外、別途検討候補として記録）」を明示した上で [x] 達成としている。

commit dd11ba91 の case-close.md 差分は Step 9 への Step 9-1 追加のみ。Step 9-11 の worktree 隔離設計変更は含まれていない（対象外維持）。

## 影響

- post-merge Step 9-11 の現状の worktree 隔離設計に課題が残る可能性があるが、具体内容は未特定。
- 破壊的変更のため後方互換性への影響範囲の評価が必要。

## 課題

- worktree 隔離設計の破壊的変更の内容（post-merge Step 9-11 の現状課題の特定）。
- 変更が破壊的と判定された根拠（後方互換性への影響範囲）。
- 隔離設計変更後の case-close Step 9-11 再構成と、RU-0019 で確立した標準手順との整合性。

## 既存要件との関連

- 出典 RU: RU-0019（`.agentdev/backlog/req-units/RU-0019.md`「worktree 運用標準化」）。
- RU-0019 は標準手順の確立のみを扱い、隔離設計の見直しは別途検討候補として明示的に除外。

## 観測元

- Issue #1158
- PR #1160
