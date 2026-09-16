# check_extensions テスト期待値の実態乖離（workflow_extensions 17 vs 16）

## 観測内容

`repo-agentdev-integrity/scripts/check_extensions.test.ts` の workflow_extensions 期待値（17）が実態（16）と乖離しており、checkExtensions integration テスト（integration against real repo）が main でも継続して fail する。Issue #2559 由来の base known drift コメント付き。

2026-09-16 時点の再実測: checker 本体 `check_extensions.ts` は `workflow_extensions: 16`、`internal_workflow_extensions: 0`、`failures: 0` で正常。テスト期待値のみが 17 のまま。

- 再現テスト: bun test split 1 `(fail) checkExtensions (integration against real repo) > returns ok=true with migrated stats after the atomic cutover`

## 影響

- 期待値固定テストが checker 本体の正常性（ok: true）を信頼できなくなる状態が継続し、テストスイートの恒常的なノイズとなる

## 課題（対応候補と判断材料）

- テスト側の期待値更新（17 → 16、または動的算出）
- または実態追従の棚卸し（16 が正か、欠落した extension の追加が必要かの判断）— どちらが正かは採用後の Case で確定する

## 既存要件との関連

- Issue #2559（base known drift 由来）
- checkExtensions integration テスト（trusted-distribution-gate / repo-agentdev-integrity テスト群）

## 根拠

- 観測元: PR #2872 本文 Findings（Case #2870 case-run 検証）および case-close での full integrity suite 再実行（split 1: 2556 pass / 3 fail、同一テスト）
- 観測時 commit: b85c179d（PR #2872 head）/ main HEAD 5d2f297b（merge 後）でも同一故障
- 2026-09-16 再検証: checker 本体は正常（16・failures 0）、乖離は継続
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 現行でも乖離が機械検証済み。修正方向の分岐は後続工程で解決）
