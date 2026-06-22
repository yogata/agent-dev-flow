# 完了条件 grep パターンが否定文脈・anti-pattern 例示を捕捉する設計ギャップ

## 観測

Issue #1017 の完了条件の grep パターンが、正規化済み SPEC の説明文（否定文脈・anti-pattern 例示）を捕捉してしまう設計ギャップ。字面判定では「未達」と判定されるが、実質は達成済み。

### 該当箇所

- `docs/specs/commands/case-run.md` L23: 「旧仕様の `load_skills=["ulw-loop"]` は誤りであり...」
- `docs/specs/commands/case-run.md` L21: 「`/ulw-loop` は skill ではなく...」
- `docs/specs/writing-style.md` L43: 「command を skill と呼ぶ...」

これらは否定文脈・anti-pattern 例示であり実害はない。

## 影響

- 将来同種の完了条件設定で機械的 grep 判定が実質達成を判定できない問題
- ガイダンス文の表現自由度を不当に制約するリスク
- QG-4 で「字面未達だが実質達成」との warn 判定が必要になり、判定の客観性が揺らぐ

## 課題

- 完了条件の grep パターンを「実害のある使用箇所のみ捕捉」に精密化する運用ルールの文書化
- 候補: (a) 否定文脈除外条件の付与、(b) スコープ段階化、(c) `src/opencode/` のみ必須条件化
- 既存 Issue の完了条件の横断検査

## 既存要件との関連

- QG-4 (Final Acceptance Gate) - PR #1022 で字面判定実質達成の問題が発生
- REQ-0101-017-026（文書・REQ管理基準）- 完了条件の設計に関連

## 根拠

- 元 inbox item: `2026-06-22-issue1017-completion-criteria-grep-pattern-design-gap.md`
- Issue #1017 / PR #1022
