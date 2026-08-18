# epic-wave-close.md の E5b 見出しがサブステップ階層形式でない（lettered suffix 残存）

## 観測

`src/opencode/skills/agentdev-workflow-case-close/references/epic-wave-close.md` の `### E5b:` 見出しは、command-file-format SPEC (a) のサブステップ階層形式（`STEP-N-M`、`STEP-N-M-K`、副番号 1 起点）でない lettered suffix（`b`）を用いる。旧 `E5a` 消滅後の残存と推定される。

## 今回扱わない理由

PR #2264（Issue #2225）は E4-0 の副番号開始値判断に限定されており、E5b の形式是正は対象外。

## 影響

サブステップ識別子様式の正規契約（CR-004）から外れた例外が epic-wave-close.md に残存する。

## レビューで決めること

- E5b の是正形式（`E5-1` 相当への振り直し・統合・削除のいずれを正とするか）
- OU-0023（工程・Step 参照是正）または別途検出の対象とするか

## 根拠

- PR 2264 本文「Findings / Capture候補」intake 小見出し1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2264）
