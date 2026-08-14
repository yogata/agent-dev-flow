# intake: MOVE済み REQ-002-022 の現行根拠参照が docs/specs/ に残存（case-close で解消済み）

## 発生日

2026-08-14

## 発生元

- Issue: #2093 (OU-009 最終検証)
- PR: #2098 (verify(integrity): OU-009 distribution boundary final verification)
- Epic: #2091 (Distribution boundary enforcement implementation and verification)
- 取得元: PR #2098 本文「## Findings / Capture候補」>「### intake」セクション（TS-012 検出）

## 問題事象

OU-009 最終検証の TS-012（参照残骸健全性）で、`docs/specs/foundations/harness-separation-model.md:125` が MOVE 済み `REQ-002-022`（harness固有詳細禁止）を現行根拠として引用していた。REQ-002-022 は REQ-029 へ MOVE 済み（当該意味は REQ-029-007 へ集約）。stale cross-reference ID（ID のみ陳腐化、意味内容は正しく enforcement 済み）。

## 影響

- TS-012 pass_criteria「MOVE または RETIRE 済み REQ-002 行への現行根拠参照が0件である」への抵触（1件）
- 配布依存境界 enforcement への影響: なし（0 violations across all 4 projections、ルール内容は正しく enforcement 済み、ID のみ陳腐化）
- case-close QG-4 完了条件の TS-012 達成を一時的に阻害

## 発生局面

検証（OU-009 TS-012 参照残骸健全性検査）

## 検知方法

PR #2098 実行担当サブエージェントが `docs/specs/**` で MOVE/RETIRE 済み REQ-002 行（021..026, 028, 029, 032, 035）の現行根拠参照を grep 検査。履歴文脈（従来/MOVE先/RETIRE後/保有していた）を除外し、現行根拠参照のみを抽出。`harness-separation-model.md:125` の REQ-002-022 を特定。

## 想定される対応方向

- **case-close で解消済み**: case-close QG-4 remediation scope（trivial citation fix）として REQ-002-022 → REQ-029-007 へ更新（commit 5c920055）。TS-012 stale-reference 件数は 0 へ解消。
- **後続不要**: 本 finding は解消済み。将来の REQ MOVE/RETIRE 操作時は同様の stale-reference クリーンアップを case-close または別 maintenance Issue で実施することが望ましい。

## 関連

- Epic: #2091
- Issue: #2093 (OU-009)
- PR: #2098 (verify-only)
- 修正 commit: 5c920055 (REQ-002-022 → REQ-029-007 citation fix)
- 関連要件: REQ-029-007（harness固有詳細禁止、REQ-002-022 から MOVE）
- 関連 SPEC: `docs/specs/foundations/harness-separation-model.md`

## 出典引用

PR #2098 本文「## Findings / Capture候補」>「### intake」より:

> - **Stale current-basis reference to MOVE'd REQ-002-022**: docs/specs/foundations/harness-separation-model.md:125 cites REQ-002-022 harness固有詳細禁止 as current normative basis... Recommended fix: update REQ-002-022 → REQ-029-007 in that parenthetical.

## タグ

#intake #stale-reference #req-move #req-002 #req-029 #ts-012 #resolved #case-close-remediation
