---
title: checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路
created: 2026-09-03
updated: 2026-09-04
---

# checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路

## 知識内容

Windows + bun 1.3.6 の環境で `bun run` により `process.exit` を呼ぶ checker CLI を実行した場合、終了タイミングにより機械可読な stdout レポートが失われることがある。モジュール import 経由（`node --experimental-strip-types` での import 呼び出し）では安定した stdout 出力を確認した。

stdout 証跡（機械可読出力のファイル退避・突合）を必要とする checker 実行では、モジュール import 経由での起動を標準経路とし、CLI 経由で実行する場合は stdout flush を保証する終了手順を例外経路として用いる。安定実行経路の契約は checker 実行契約（docs/designs/integrity/checker-execution-contracts.md）「安定実行経路」節で確定済みである。

## 適用条件

- Windows（win32）+ bun 環境で、`process.exit` を使用する checker CLI を実行する場合。
- checker の stdout 機械可読出力を証跡として取得し、ファイル退避や突合に使う場合。
- check_integrity、traceability check 等、checker-execution-contracts.md の実行契約対象 checker を含む。

## 適用対象

- case-run / case-close の検証手順における checker stdout 証跡取得（機械検査の出力退避）。
- checker-execution-contracts.md の実行契約に従う checker CLI の実行手順。
- 環境差による検証不成立（stdout 消失）の切り分け判断。

## 根拠

- learning inbox 2026-09-03 エントリ「checker CLI は bun + Windows で process.exit により stdout が失われることがありモジュール import 経由が安定」（PR #2539 / Issue #2538 の case-run 中の観測）。
- 対象 CLI（check_distribution_boundary_cli.ts）の `process.exit` 使用の実ファイル確認。

## 関連知識

- [Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク](windows-powershell-bulk-io-corruption.md)（checker stdout をファイル退避する場面で同じ破壊系統が適用される。併用時の注意）。
- 規範面の所在: [checker 実行契約と検出基盤規則](../designs/integrity/checker-execution-contracts.md)（bun run 標準・stdout 機械可読契約の正規所在。安定実行経路の補完は同契約の更新工程で行う）。
