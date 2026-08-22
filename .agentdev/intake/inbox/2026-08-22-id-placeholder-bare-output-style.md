# ID プレースホルダー裸出力 48 件の正規様式確定（backtick 包囲か裸出力許容か）

## 観測

IR-064（unresolved-placeholder）の heuristic 検出により、SKILL.md 表の根拠列等の ID プレースホルダー裸出力（REQ-{NNNN}、DEC-{N} 等）48 件が検出されている（provenance: issue-2372-ir064-initial-baseline。委譲注記様式として一貫使用中、TODO 系は 0 件）。

## 今回扱わない理由

裸出力を backtick 包囲（`REQ-{NNNN}` 形式）へ整形する正規様式の確定は Design 判断である（PR #2376 の Design確定候補 2 と連動）。case-close の capture 責務は回収・保存のみである。

## 影響

様式を確定しない場合、48 件は baseline-known（info）のまま残存し、IR-064 の heuristic 判定の正規化が未確定の状態が続く。

## レビューで決めること

- 正規様式を backtick 包囲とするか、表の根拠列裸出力を許容様式に加えるか
- 確定後の 48 件の扱い（一括整形か baseline 承認か）

## 根拠

- PR #2376 本文「Findings / Capture候補」intake 3、「Design確定候補」2
- docs/designs/integrity/rules/IR-064-unresolved-placeholder.md（許容条件）
