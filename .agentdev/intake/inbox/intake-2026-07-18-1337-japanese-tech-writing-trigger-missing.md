# Intake Item: japanese-tech-writing SKILL.md frontmatter description に USE FOR / DO NOT USE FOR trigger が欠落

## 発生源

- 発生 phase: /repo/docs-check 実行（2026-07-18 04:35）
- capture 分類: intake（具体的作業候補 = frontmatter description への trigger 句追加）

## 問題

`lint_skills.ts` が `src/opencode/skills/japanese-tech-writing/SKILL.md` の frontmatter description について WARNING 2件を検出した。

- USE FOR trigger missing: description に「USE FOR:」またはユースケースを示す trigger 語が含まれない。
- DO NOT USE FOR trigger missing: description に「DO NOT USE FOR:」または適用外を示す trigger 語が含まれない。

`agentdev-*` プレフィックスを持たない配布物依存スキル（`japanese-tech-writing` は `agentdev-doc-writing` が参照、ADR-0134/REQ-0159-001）も、配布対象として frontmatter description の trigger 記述要件を満たす必要がある。現状の description は規範の要約にとどまり、trigger 句が無い。

原因分類: 確認済（配布物依存スキルとして追加された際の frontmatter trigger 記述漏れ）。

## 推奨修正対象

`src/opencode/skills/japanese-tech-writing/SKILL.md` の frontmatter `description:` に USE FOR / DO NOT USE FOR の両 trigger 句を追加する。本文の「USE FOR」「DO NOT USE FOR」セクション（既存）の内容を frontmatter description に圧縮して反映する。他の agentdev-* スキルの frontmatter 記述様式に合わせる。

完了条件は `lint_skills.ts` の Content 検査 WARNING（USE FOR trigger / DO NOT USE FOR trigger）が japanese-tech-writing について0件になること。

## 関連

- 発見元レポート: `lint_skills.ts` 実行結果（Content WARNING 2件）
- 参照元: `agentdev-doc-writing`（本スキルを参照する配布物依存スキル）
- 要件: REQ-0159-001（配布物依存スキル）
- ADR: ADR-0134（配布物依存スキル）
