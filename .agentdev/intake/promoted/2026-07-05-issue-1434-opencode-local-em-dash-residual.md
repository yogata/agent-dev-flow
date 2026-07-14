# src/opencode-local/ 配下の和文 em-dash 残存 16 件の查読是正

## 観測内容

PR #1435（em-dash 本文横断是正）は配布物（`docs/**` + `src/opencode/skills/agentdev-*/**`）を是正対象としたが、ローカル版専用配布物 `src/opencode-local/` をスコープ外として除外した。同配下に和文 em-dash（` — `）が 16 件残存。

残存内訳:
- `src/opencode-local/README.md` — 8件
- `src/opencode-local/case-file.md` — 7件
- `src/opencode-local/retry.md` — 1件

## 影響

- 表記品質の問題（機能的影響なし）
- ローカル版専用配布物（配布対象外）のため、外部影響なし

## 課題

`src/opencode-local/` 配下 16 件を対象として、PR #1435 と同じ判定基準（`mechanical-replacement-rules.md` section 2 パターン A〜D）で查読是正を実施する。

## 既存要件との関連

- 判定基準: `mechanical-replacement-rules.md` section 2（パターン A〜D）
- 関連 learning: `.agentdev/learning/inbox.md`「em-dash body 置換の文脈判定パターンと検出時の注意」
- 関連: Issue #1434, PR #1435, RU-0022

## 出典

- 観測元: PR #1435 の case-close 実行（2026-07-05）
