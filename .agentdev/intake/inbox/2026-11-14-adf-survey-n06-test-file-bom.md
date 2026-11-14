# 試験ファイルの先頭の BOM 2件（ADF簡素化調査 N-06）

## 観測事実

- `archive-builder.test.ts`・`boundary-pipeline.test.ts`（.opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/）の先頭バイトが EF BB BF（UTF-8 BOM）。他の2,146ファイルに BOM はない。
- 基準コミットにも archive-builder.test.ts の BOM が存在する。両ファイルの本文に BOM を扱う試験の記述はない（意図的な固定かは未確認）。

## 具体的な修正対象

- BOM の除去（書き出し経路での混入と推定。原因は仮説）。

## 関連

- なし
