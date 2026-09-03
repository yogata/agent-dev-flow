# ID プレースホルダー裸出力 48 件の正規様式確定（backtick 包囲か裸出力許容か）

## 観測内容

IR-064（unresolved-placeholder）の heuristic 検出により、SKILL.md 表の根拠列等の ID プレースホルダー裸出力（REQ-{NNNN}、DEC-{N} 等）48 件が検出されている（provenance: issue-2372-ir064-initial-baseline。委譲注記様式として一貫使用中、TODO 系は 0 件）。

裸出力を backtick 包囲（`REQ-{NNNN}` 形式）へ整形する正規様式の確定は Design 判断である（PR #2376 の Design確定候補 2 と連動）として、case-close の capture 時点では回収・保存のみ実施。

## 影響

様式を確定しない場合、48 件は baseline-known（info）のまま残存し、IR-064 の heuristic 判定の正規化が未確定の状態が続く。

## 課題（レビューで決めること）

- 正規様式を backtick 包囲とするか、表の根拠列裸出力を許容様式に加えるか
- 確定後の 48 件の扱い（一括整形か baseline 承認か）

## 既存要件・契約との関連

- IR-064（docs/designs/integrity/rules/IR-064-unresolved-placeholder.md）の許容条件と heuristic 判定正規化。
- 関連 item: agentdev-inspect-skills SKILL.md の裸 `IR-{NNN}` プレースホルダー 3 箇所（2026-09-03、本件の従属インスタンス）。同 item は配布依存境界 gate の unclassified-entry 扱い（2026-08-30 の IR-053 言及扱い item）とも従属関係にある。

## 根拠

- PR #2376 本文「Findings / Capture候補」intake 3、「Design確定候補」2
- docs/designs/integrity/rules/IR-064-unresolved-placeholder.md（許容条件）
