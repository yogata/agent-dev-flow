# case-ready-definition-readiness テストの pin 文言を現行語彙へ追随させる

## 内容

`scripts/self/release/case-ready-definition-readiness.test.ts` の ROW_ANCHORS pin 文言（`["REQ-061-019", REF_STRUCT_REL, /重複をファイル単位で前置検出/]`）が、Wave 2-2 merge 336095b6 による `src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md` の語彙変更（「変更対象ファイル集合の重複をファイル単位で前置検出」→「主な変更対象（子 Issue が実行単位として所有する宣言）の重複を前置検出」）へ追随しておらず、bun test 分割③（repo ルート系 guard テスト）で決定的 fail が発生している。

- fail テスト: `row anchor matrix (REQ rows -> distribution artifact clauses) > REQ-061-019 is anchored in execution-structure.md`（case-ready-definition-readiness.test.ts:338）
- baseline tag baseline-v4-canonical-convergence-20261007（72e04cad）では pin パターンが旧文言と一致し pass（静的突合確認済み）
- 本 fail は Issue 3535（Wave 2-3）case-close の full integrity suite で初検出。Wave 2-2 case-close 実行時点では main が 336095b6 未マージのため検出されなかった

## 影響

bun test 分割③ が fail 1 件を継続し、full integrity suite の機械受理基準で fail 由来分類を毎回必要とする。Wave 変更後の全 case-close 実行で同 fail が再現する。

## 提案

ROW_ANCHORS の REQ-061-019 pin パターンを現行語彙（「主な変更対象（子 Issue が実行単位として所有する宣言）の重複」）へ追随させる。Wave 2-4（Issue 3536、語彙・配布物・投影）または Wave 3 横断検証（Issue 3538）の実行で解消する。修正は pin 文言 1 箇所の差し替えで、関連回帰（wave-composition-purity.test.ts）との重複管理も確認する。

## 根拠

Epic #3530 Wave 2-3（Issue 3535）case-close の full integrity suite 由来分類。Wave 2-2 merge 336095b6 が回帰検査 pin 文言の追随漏れを生んだ既知欠陥として分類（wave-composition-purity.test.ts は追随済みだが case-ready-definition-readiness.test.ts は漏れ）。

https://github.com/yogata/agent-dev-flow/pull/3541
