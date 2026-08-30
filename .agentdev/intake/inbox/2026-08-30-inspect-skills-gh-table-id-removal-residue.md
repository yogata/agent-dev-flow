# inspect-skills SKILL.md line 59 の gh 直接記述表と ID 除去ポリシー適用時の表記残骸

## 観測

配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で、agentdev-inspect-skills SKILL.md line 59 の gh 直接記述の委譲漏れ表が IR-053 分類の課題（配布依存境界 check で unclassified-entry として既存起因検出中）であることが確認された。

- line 60 の「（REQ / AG-{NNN}）」「（CR-{NNN}」、See Also の「IR-{NNN}、IR-{NNN}」重複等、ID 除去ポリシー適用時の表記残骸候補も同時に確認

参照先 ID の特定が不能なため、本件（AG-005 推測修正禁止）では保持して是正していない。

## 影響

- unclassified-entry が配布依存境界 check の baseline に残存し続ける
- 表記残骸が検査基線のノイズ要因になる

## レビューで決めること

- IR-053 分類（gh 直接記述の委譲漏れ表の取り扱い）の判定と修正方針
- ID 除去ポリシー適用時の許容表記の確定と是正要否

## 根拠

- PR #2484 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
