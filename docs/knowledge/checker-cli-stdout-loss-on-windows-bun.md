---
title: checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路
created: 2026-09-03
updated: 2026-09-27
---

# checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路

## 知識内容

Windows + bun 1.3.6 の環境で `bun run` により `process.exit` を呼ぶ checker CLI を実行した場合、終了タイミングにより機械可読な stdout レポートが失われることがある。モジュール import 経由（`node --experimental-strip-types` での import 呼び出し）では安定した stdout 出力を確認した。

stdout 証跡（機械可読出力のファイル退避・突合）を必要とする checker 実行では、モジュール import 経由での起動を標準経路とし、CLI 経由で実行する場合は stdout flush を保証する終了手順を例外経路として用いる。安定実行経路の契約は checker 実行契約（docs/designs/integrity/checker-execution-contracts.md）「安定実行経路」節で確定済みである。

stdout ロスと区別すべき混入: `--json` 機械解析時に stderr のレポート書込みメッセージが統合キャプチャ（`2>&1` 等・推定）で混入し JSON.parse が失敗する事象がある（Case #3146）。checker 側は現行 `console.error` 出力（check_integrity.ts L11352、#611/e32b9352 以降不変）のため stdout 連結は現行実装と不整合 — 誤った checker stdout 連結説を知識として混入しない。

stdout ロスと区別すべき隣接現象として、stdout 自体は取得できても checker stdout が Windows + bun 環境の PowerShell パイプ経由で cp932 再解釈され、機械可読出力が破壊されて JSON パースが失敗する事象がある（PR #2582 / Issue #2561）。回避には外部コマンド stdout の取得で `spawnSync` の `encoding: "utf8"` を明示する。コンソールコードページの一時変更（chcp 65001）も回避策として有効。コンソール出力退避全般の標準手順は windows-powershell-bulk-io-corruption.md を参照する。

Bun.YAML に依存する checker は `node --experimental-strip-types` によるモジュール import 経路（標準経路）を利用できず、bun 直実行となるため process.exit による stdout flush 前終了でレポートが失われる。この場合は stdout を一時ファイルへ書き出した上で flush を保証してから出力し、実行後に一時ファイルを削除する `Bun.write(Bun.stdout)` による flush 保証ラッパー手順を例外経路として用いる（PR #2812 / Issue #2806）。

bun CLI 経由の checker `--json` 出力が Windows で末尾破損（途中破損）し、JSON パース不能となる variant がある。この場合は human readable 出力へ切り替え、可能な場合は node 単独実行で再取得する（PR #2817 / Issue #2809）。

これら例外経路の checker 実行契約 Design「安定実行経路」への補完は、req-define の変更影響分析による確定候補として本知識に記録する（知識文書更新と bundling しない）。

## 適用条件

- Windows（win32）+ bun 環境で、`process.exit` を使用する checker CLI を実行する場合。
- checker の stdout 機械可読出力を証跡として取得し、ファイル退避や突合に使う場合。
- Windows + bun 環境で checker stdout を PowerShell パイプ経由で受け取り、cp932 再解釈により UTF-8 機械可読出力の JSON パースが失敗する場合。
- Bun.YAML 依存の checker を Windows + bun で実行し、node によるモジュール import 経路を利用できない場合。
- bun CLI 経由で checker `--json` 出力を取得し、出力末尾が破損して JSON パースに失敗する場合。
- checker `--json` 出力を機械解析する場合は stdout を単独キャプチャし、stderr を統合しない（統合キャプチャ（`2>&1` 等）は stderr のレポート書込みメッセージ混入により JSON.parse が失敗する）。
- check_integrity、traceability check 等、checker-execution-contracts.md の実行契約対象 checker を含む。

## 適用対象

- case-run / case-close の検証手順における checker stdout 証跡取得（機械検査の出力退避）。
- checker-execution-contracts.md の実行契約に従う checker CLI の実行手順。
- 環境差による検証不成立（stdout 消失）の切り分け判断。
- 検査結果 stdout の機械処理（JSON パース、退避・突合）。

## 根拠

- learning inbox 2026-09-03 エントリ「checker CLI は bun + Windows で process.exit により stdout が失われることがありモジュール import 経由が安定」（PR #2539 / Issue #2538 の case-run 中の観測）。
- 対象 CLI（check_distribution_boundary_cli.ts）の `process.exit` 使用の実ファイル確認。
- PR #2582（Issue #2561）: checker stdout が PowerShell パイプ経由で cp932 再解釈され JSON パースが失敗。`spawnSync` の `encoding: "utf8"` が回避策として有効なことを確認。
- PR #2812（Issue #2806、case 2805 Wave 1 / case 2812、DEL-2806-1）: Bun.YAML 依存のため node import 経路が使えず、Bun.write(Bun.stdout) による flush 保証ラッパー（一時ファイル、実行後に削除）で対処した観測。同手順は当時の既存知識文書に明記されていなかった。
- PR #2817（Issue #2809、case 2805 OU-004、DEL-2809-1）: bun CLI 経由の checker --json 出力が Windows で途中破損。human readable 出力 + node 単独実行へ切り替えて回避した観測（checker 実行契約の「stdout flush 前 exit」回避策の実例）。
- Case #3146（PR #3152）: `--json` stdout を機械解析した際、レポート書込みメッセージが JSON と連結して JSON.parse が失敗。事実修正根拠: check_integrity.ts L11352 の `console.error` 実読、git log -S "Report written to" が e32b9352（#611、2026-06-06）のみを示すことから、checker 側 stdout 連結説は現行実装と不整合であり、混入は呼出側の統合キャプチャ（推定）と整理した。

## 関連知識

- [Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク](windows-powershell-bulk-io-corruption.md)（項3としてコンソール出力退避の cp932 再解釈系統が規定化済み。checker stdout のファイル退避・パイプ受信の両場面で関連）。
- 規範面の所在: [checker 実行契約と検出基盤規則](../designs/integrity/checker-execution-contracts.md)（bun run 標準・stdout 機械可読契約の正規所在。安定実行経路の補完は同契約の更新工程で行う）。
- [bun test 実行形態逸脱の検知条件と判別観点](bun-test-execution-form-drift-signals.md)（bun test 実行形態由来の fail・0 件実行の判別。checker CLI の stdout ロスとは別現象）。
