# integrity-rule-catalog.md の他候補語（finding 等）の網羅検証を独立 OU として切り出し検討

## 発生源

- Issue: #1167
- PR: #1177 (merged, squash 289dfd73)
- 発生日: 2026-06-25

## 観測内容

PR #1177（OU-005、SUB-D 検証）の TS-005 候補語は `baseline`, `provider`, `variant`, `fixture` の 4 種に明示限定され、G14（スコープ拡大禁止）に従い `document-type-responsibilities.md` 訳語表の他候補語は対象外とした。

しかし同 SPEC ファイル内には他の散文英語普通名詞も出現する可能性がある。訳語表には `finding→検出事項` 等のエントリが掲載され、本ファイルは IR エントリ群の description/detection_method/triage_action 等の散文フィールドを多数含むため、網羅的 grep 検証の対象とする独立 OU を検討する価値がある。

## 影響

- 訳語表掲載語の散文普通名詞出現が未検証で、推奨訳語への置換漏れが潜在する可能性

## 課題

- `document-type-responsibilities.md` 訳語表の全エントリ（`finding`, `provider`, `baseline`, `variant`, `fixture`, `command`, `skill`, `template`, `commit`, `branch`, `worktree`, `draft`, `artifact`, `backlog` 等）を網羅的 grep 対象とする SUB-D 再実行
- 各出現箇所を識別子 vs 散文普通名詞で per-instance 判定
- 散文普通名詞残存のみを推奨訳語へ置換
- スコープが広大な場合は訳語表エントリを分割し、複数 OU へ分割

## 既存要件との関連

- `docs/specs/integrity/integrity-rule-catalog.md`
- `document-type-responsibilities.md` 訳語表
- `docs/specs/backticks-identifier-threshold.md`（#1164 accepted、判定基準）

## 対応方針候補

- 独立 Issue / RU として切り出す。スコープ次第で複数 OU へ分割
