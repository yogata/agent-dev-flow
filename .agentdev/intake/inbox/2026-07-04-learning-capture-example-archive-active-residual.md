# learning-capture/references/example.md に archive/active.md 参照が残留（4箇所）

## 観測

PR #1402（Epic #1395 Wave 3, Issue #1398）のリネーム完了後、`src/opencode/skills/agentdev-learning-capture/references/example.md` の以下の行に `archive/active.md` 参照が残存:

- L160
- L162
- L163
- L173

## 今回扱わなかった理由

Issue #1398 の OU リストは learning-pipeline（OU-015）と learning-promote（OU-011）SPEC が対象であり、learning-capture スキル references は明示対象外。スコープディシプリンにより本 PR では修正対象外とした。

## 影響

学習ヘルパーの例示テキストが古いパス（`archive/active.md`）を示すため、利用者が誤ったファイルを参照するリスクがある。F-001（learning-pipeline/SKILL.md）、F-002（learning-capture/SKILL.md）と同様の残存。

## レビューで決めること

- example.md の `archive/active.md` 参照を削除するか、`deferred.md` に置き換えるか
- F-001/F-002 と合わせて learning ドメイン全体の残存を一括是正する PR を構成するか

## 根拠

PR #1402 Findings F-003 より。`git grep -n "archive/active" src/opencode/skills/agentdev-learning-capture/references/example.md` で4箇所の残存を確認済み。
