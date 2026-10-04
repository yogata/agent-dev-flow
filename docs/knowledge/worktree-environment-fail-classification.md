---
title: worktree 環境差 fail の由来分離手順と依存前提の実行形態知見
created: 2026-10-05
updated: 2026-10-05
---

# worktree 環境差 fail の由来分離手順と依存前提の実行形態知見

## 知識内容

case-run/case-close の worktree 実行では、git 管理外の投影・生成物（`.opencode/` junction・plugins junction・node_modules・textlint vendor 等）が worktree に伝播せず、環境差 fail・未実施が構造的に生じる。由来分類（本変更起因か・既存か・環境依存か）の検証運用は次の手順と知見に基づく。

### 由来分離の3手段（evidence 化）

1. **main root 対照実行**: 同一テストを main root でも実行し再現を確認する（詳細手順は [worktree-preexisting-violation-main-crosscheck.md](worktree-preexisting-violation-main-crosscheck.md) が所有する）
2. **baseline 再現**: detached worktree で baseline（main HEAD・変更未適用）を再現し同一テストを再現する（詳細手順は [qg4-baseline-detached-worktree-reproduction.md](qg4-baseline-detached-worktree-reproduction.md) が所有する）
3. **同一条件実行**: worktree HEAD = origin/main HEAD + git status 変更ゼロの同一条件で実行し、分岐差を排他する

### 環境差の明示記録

- worktree 構造で実行不能・未実施の検査（link gate zero-targets・分割③未実施等）は「未実施」を明示記録し、実行済み扱い・暗黙の検査省略にしない
- skip / fallback 判定は判定根拠とともに明示する

### 依存前提の実行形態別判断（実測知見）

| 実行形態 | 判断 |
|---|---|
| repo-agentdev-integrity scripts など node_modules を同梱する資産 | 依存整備なしで直接実行可 |
| bun:test + fs/path 標準モジュールのみのテスト | 依存整備不要 |
| 上記以外（textlint vendor・package 依存の script 等） | bun install・vendor 生成が前置で必要（worktree 再作成後は node_modules が復元されない） |

## 適用条件

- worktree 内で bun test・checker を実行し、git 管理外領域に依存する fail・未実施が生じた場合
- QG-4 の fail 由来分類で「本変更起因 / pre-existing / 環境依存」を区別する必要がある場合
- worktree 再作成後に検証を実行する場合

## 適用対象

- case-run / case-close の worktree 検証・QG-4 fail 由来分類
- checker 実行契約（checker-execution-contracts.md）の worktree fallback 節と並ぶ実行側知見
- worktree 並列検証運用を持つプロジェクト全般

## 根拠

- src/opencode-local 未伝播 fail の main root 同結果実行による由来分類（Case #3388/#3391・PR #3405 で再観測）
- skills_structure See Also 参照検査の projection 不全 4 fail（PR #3401）・textlint vendor 未生成 39 fail（PR #3403）
- plugins junction 未伝播による分割③未実施の明示記録（PR #3419）・分割① pre-existing 4+1 の baseline 同一条件分類（Case #3433）
- repo-agentdev-integrity scripts の node_modules 同梱直接実行（PR #3400）・bun:test + 標準モジュールのみの依存整備不要（PR #3451）

## 関連知識

- [worktree-preexisting-violation-main-crosscheck.md](worktree-preexisting-violation-main-crosscheck.md)（main root 対照・突合の個別手順）
- [qg4-baseline-detached-worktree-reproduction.md](qg4-baseline-detached-worktree-reproduction.md)（baseline detached worktree 再現・3点確認の個別手順）
- [windows-bun-test-spawn-timeout-classification.md](windows-bun-test-spawn-timeout-classification.md)（timeout 由来 fail との切り分け・対照実行の標準手順）
- checker 実行契約（docs/designs/integrity/checker-execution-contracts.md）worktree fallback 節（backlog-review 2026-10-05 時点では相互参照は本文書側のみ。Design 側への相互参照追記は要件化経路〔RU-0009〕での接続候補とする）
