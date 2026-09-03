# checker CLI の安定実行経路

## 背景

Windows + bun 1.3.6 で `check_distribution_boundary_cli.ts` を実行した際、`process.exit` のタイミングにより機械可読な stdout レポートが失われることがある。モジュール import 経由（`node --experimental-strip-types`）では安定出力を確認した。

## 問題

`docs/designs/integrity/checker-execution-contracts.md` は `bun run` を標準起動手段、stdoutを機械可読出力として規定するが、stdout証跡を要するcheckerの環境差と安定実行経路を規定していない。

## 望ましい変更

checker共通実行契約へ、stdout証跡を要するcheckerの安定実行経路（モジュールimport経由またはstdout flushを保証する終了手順）を追記する。実現手段の選択はreq-defineで確定する。

## 対象範囲・制約

- 対象: checker-execution-contracts.mdとprocess.exitを呼ぶchecker CLIの実行手順。
- 対象外: 個別checkerの検出ロジック、exit code 0/1/2契約、Windows以外の環境対応。
- 既存のbun run、exit code、stdout機械可読契約と矛盾しない補完とする。

## 受け入れ条件

- [ ] stdout証跡を要するcheckerの安定実行経路が共通契約に規定される。
- [ ] Windows + bunで対象checker相当のstdout証跡を取得できる。
- [ ] 既存のexit code / stdout契約を維持する。

## 既存対策確認

既存対策あり（bun run標準・stdout機械可読出力）だが、安定実行経路はfix gap。対象CLIの`process.exit`使用を実ファイルで確認した。

## 元learning item / 根拠

2026-09-03 inbox「checker CLI は bun + Windows で process.exit により stdout が失われることがありモジュール import 経由が安定」（PR #2539、Issue #2538）。

## 推奨分類

fix、ラベル候補: docs。関連Issue: なし（回収元PR #2539 / Issue #2538）。
