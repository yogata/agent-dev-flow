# check_extensions テスト期待値の実態乖離（workflow_extensions 17 vs 16）

## 内容

`repo-agentdev-integrity/scripts/check_extensions.test.ts` の workflow_extensions 期待値（17）が実態（16）と乖離しており、checkExtensions integration テスト（integration against real repo）が main でも継続して fail する。Issue #2559 由来の base known drift コメント付き。checker 本体（check_extensions.ts）は ok:true / failures 0 で正常。

## 提案

テスト側の期待値更新（17 → 16 または動的算出）または実態追従の棚卸し（16 が正か、欠落した extension の追加が必要か）の判断。期待値固定テストが checker 本体の正常性（ok:true）を信頼できなくなる状態の解消。

## 根拠

- 観測元: PR #2872 本文 Findings（Case #2870 case-run 検証）および case-close での full integrity suite 再実行（split 1: 2556 pass / 3 fail、同一テスト）
- 観測時 commit: b85c179d（PR #2872 head）/ main HEAD 5d2f297b（merge 後）でも同一故障
- bun test split 1: `(fail) checkExtensions (integration against real repo) > returns ok=true with migrated stats after the atomic cutover`

## 分類

- 分類: intake（具体的修正対象あり: check_extensions.test.ts の期待値）
- 変更種別: tests（テスト期待値の現行化）
- 優先度: 低〜中（checker 本体は正常。テストスイートのノイズとして継続するため早めの解消が望ましい）
