# learning-capture/SKILL.md に archive/active.md 参照が残留（2箇所）

## 観測

PR #1402（Epic #1395 Wave 3, Issue #1398）のリネーム完了後、`src/opencode/skills/agentdev-learning-capture/SKILL.md` に `archive/active.md` への参照が2箇所残存:

- L69: 過去の学び参照として `archive/active.md`
- L71: 存在しない場合のファイル作成対象に `archive/active.md`

## 今回扱わなかった理由

Issue #1398 の OU リストは learning-pipeline SPEC/SKILL（OU-015）と learning-promote SPEC（OU-011）が対象であり、learning-capture スキル本文は明示対象外。capture 層は inbox.md のみを扱い、deferred.md は learning-promote が管理するため、本 PR（Wave 3）のスコープから外した。

## 影響

capture 層が `archive/active.md` を参照・作成しようとする記述が不正確になる可能性がある。`archive/active.md` は廃止され、`deferred.md` は learning-promote のみが管理するため、capture が作成対象とするのは inbox.md のみが正しい。学習ヘルパー利用者が誤ったファイルを作成するリスク。

## レビューで決めること

- capture スキル本文から `archive/active.md` 参照を削除するか、`deferred.md` に置き換えるか、あるいは inbox.md のみに役割を限定する記述に修正するか
- learning-capture/references/example.md（F-003）と合わせて同一 PR で更新するか

## 根拠

PR #1402 Findings F-002 より。`git grep -n "archive/active" src/opencode/skills/agentdev-learning-capture/SKILL.md` で2箇所の残存を確認済み。
