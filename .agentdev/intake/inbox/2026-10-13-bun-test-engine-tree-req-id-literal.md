# workflow_body_contract.test.ts の ENGINE_TREE 検査でテストコード内 REQ ID リテラルが誤捕捉される問題を解消する

## 観測

scripts/self/case-intake-cross-inspection/workflow_body_contract.test.ts「エンジン配布ファイルに宣言行以外の具体要件行IDが含まれない」テストが、src/common/skills/agentdev-workflow-case-open/scripts/tests/definition-traceability-gate.test.ts（L58、L107）のテストコード内に存在する REQ ID リテラルを ENGINE_TREE 検査の対象として捕捉し、継続的に fail している。Wave-2（#3658）実行時から存在する pre-existing fail であり、bun test 全体（1732 テスト）が赤のままになっている。ENGINE_TREE 配下（src/common/skills/）は Wave-3 の変更対象外であり、本問題は Wave 実行と無関係である。main 現在（commit 3f457e6f）でも fail 継続を確認していないが、変更対象外のため解消されていない。

## 今回扱わない理由

問題の所在は共有エンジン側のテストコード（src/common/skills/agentdev-workflow-case-open/scripts/tests/ と scripts/self/ の検査定義）であり、Epic #3653 の Wave 実行対象範囲外である。

## 影響

bun test 全体が常に赤（1 fail）となり、CI・検証実行ごとに新規 fail と pre-existing fail の区別が手動判断となる。真の新規テスト失敗の見落としリスクが続く。

## レビューで決めること

- テストコード内のリテラル REQ ID を宣言行扱いにする（ENGINE_TREE 検査の除外規則の追加）か、フィクスチャ分離（リテラルを検査対象外の場所へ移す）かの方針
- 修正 Case の work_type（bugfix）と実行単位（単一 Standard flow で足りるか）

## 根拠（任意）

- 観測元: PR #3667（Wave-3 #3659、Findings/Capture候補の既出記録。Wave-2 由来と記載、2026-10-13 case-close 再実行時も変更対象外で未解消）
- 証拠: bun test 1731 pass / 1 fail（Wave-3 worktree 実行記録、PR #3667 本文）
- 関連: src/common/skills/agentdev-workflow-case-open/scripts/tests/definition-traceability-gate.test.ts、scripts/self/case-intake-cross-inspection/workflow_body_contract.test.ts
