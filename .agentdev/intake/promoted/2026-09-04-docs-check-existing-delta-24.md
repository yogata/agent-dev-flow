# docs-check 既存 delta の分類・処分候補

## 観測内容
OU-001 検証で、IR-055 runtime-unresolved-reference 16件、expanded-readme-sync、broken-req-ref、index-generation-consistency、draft-spec-staleness、unresolved-placeholder 等の既存 delta が記録された。後続の検証で一部（system.md の third-party-sync 登録）は解消済みだが、REQ-0108 参照など残存項目もある。

## 影響
既存 delta と新規違反の区別、baseline への取り込み、warning の扱いが不明確なままだと docs-check の exit code 解釈と処分判断が不安定になる。

## 課題
現行 main で全 delta を再実行し、解消済み・残存・warning を分離する。IR-055 baseline 更新、REQ-0108 参照修正、AUTOGEN 再生成、未解決 placeholder の処分を個別に判断する。

## 既存要件・正規成果物との関連
PR #2575、#2577、#2578、Issue #2554/#2555/#2558、IR-055、docs-check の integrity report。
