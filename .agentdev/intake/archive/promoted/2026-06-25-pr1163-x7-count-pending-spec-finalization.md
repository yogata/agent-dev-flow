# X-7（backticks 識別子/一般名詞境界）件数確定を AG-011 SPEC 策定完了後に再計上

## 発生源

- Issue: #1162
- PR: #1163 (merged, squash e3486488)
- 発生日: 2026-06-25

## 内容

PR #1163 の inspect-docs カタログでは、X-7（backticks 識別子/一般名詞境界）の件数を確定していない。SPEC `docs/specs/backticks-identifier-threshold.md` が `status: draft` であり、文脈依存の境界ケースは機械判定対象外と明記されるため、現行カタログでは「查読対象」として扱った。

AG-011（OU-001、X-7 SPEC 完結）で SPEC を `accepted` へ昇格させ、機械判定閾値を確定した後に、別途 inspect-docs を再実行して X-7 の残存状況を確定する運用が適切。

## 推奨対応先

AG-011（OU-001、X-7 SPEC 策定）完了後の再実行を推奨。作業候補:

- AG-011 で `backticks-identifier-threshold.md` の `status` を `draft` → `accepted` へ昇格（要件: SPEC draft かつ AG-011 実装が SPEC 内容を検証済み）
- SPEC accepted 化後に inspect-docs を再実行し、X-7 の残存状況を件数・ファイルパス・行番号とともに新カタログへ計上
- AG-010（優先度順是正）の入力に X-7 確定値を追加

## 現在の追跡状態

- PR #1163 Findings セクション F-3 に記録済み
- 別 Issue 化: 未実施（本 intake は AG-011 完了後の再実行を促す起点）
