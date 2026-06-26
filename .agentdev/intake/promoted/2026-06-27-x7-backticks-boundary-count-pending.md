# X-7（backticks 識別子/一般名詞境界）件数確定を AG-011 SPEC 策定完了後に再計上

## 発生源

- Issue: #1162
- PR: #1163 (merged, squash e3486488)
- 発生日: 2026-06-25

## 観測内容

PR #1163 の inspect-docs カタログでは、X-7（backticks 識別子/一般名詞境界）の件数を確定していない。SPEC `docs/specs/backticks-identifier-threshold.md` が `status: draft` であり、文脈依存の境界ケースは機械判定対象外と明記されるため、現行カタログでは「查読対象」として扱った。

## 影響

- X-7 の残存状況が未確定で、AG-010 是正の入力に含まれない

## 課題

- AG-011（OU-001、X-7 SPEC 完結）で SPEC を `accepted` へ昇格させ、機械判定閾値を確定する
- SPEC accepted 化後に inspect-docs を再実行し、X-7 の残存状況を件数・ファイルパス・行番号とともに新カタログへ計上する
- AG-010 の入力に X-7 確定値を追加する

## 既存要件との関連

- `docs/specs/backticks-identifier-threshold.md`（status: draft、AG-011/OU-001 で accepted 昇格予定）
- AG-011（OU-001）、AG-010（優先度順是正）

## 対応方針候補

- **AG-011（OU-001）完了が前提**。SPEC accepted 化後に inspect-docs を再実行して件数を確定する
