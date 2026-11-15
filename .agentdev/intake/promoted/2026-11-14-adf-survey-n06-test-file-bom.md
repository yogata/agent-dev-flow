# 試験ファイルの先頭の BOM 2件（ADF簡素化調査 N-06）

## 観測内容

- `archive-builder.test.ts`・`boundary-pipeline.test.ts`（.opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/）の先頭バイトが EF BB BF（UTF-8 BOM）。他の2,146ファイルに BOM はない。
- 基準コミットにも archive-builder.test.ts の BOM が存在する。両ファイルの本文に BOM を扱う試験の記述はない（意図的な固定かは未確認）。

## 影響

- リポジトリ全体で唯一の BOM 付与ファイルが2件存在し、書き出し経路での混入（原因は仮説）が再発し得る。意図的な固定かの確認が未了。

## 課題

- BOM の除去（書き出し経路での混入と推定。原因は仮説）。意図的な固定かを確認した上で処理する。

## 既存要件との関連

- なし
