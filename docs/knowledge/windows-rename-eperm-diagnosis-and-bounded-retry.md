---
title: Windows rename EPERM の診断手法（対照プローブ・並行模倣）と bounded retry 対策
created: 2026-10-03
updated: 2026-10-05
---

## 知識内容

Windows における原子的書込み（tmp ファイル → 既存ファイルへの renameSync 置換）は、bun test 並行実行でのみ非決定的に EPERM / EACCES を返すことがある。直前の書込みハンドル解放や検査インデクサの一時保持が起因し、単体実行では再現しないため「テストの欠陥」と誤分類されやすい。診断と対策は次のとおり。

1. **対照プローブ手法**: 疑いのある新旧構成を同頻度（例: 20 ラウンド）で対照実行し、発生頻度の同水性から環境起因を実証する（Case #3314 PR #3325 で実証済み）。
2. **並行模倣再現**: Promise.all で複数テスト相当の並行実行を模倣し、単体では再現しない競合を再現特定する（Case #3316 PR #3329 で特定済み）。
3. **bounded retry パターン**: rename ベース原子的書込みに指数バックオフ（最大約 150ms）の bounded retry を適用する（`src/common/tools/agentdev-gh/local/runner-local.ts` に実装済み）。retry は上限付きとし、retry 後も失敗する場合は本来のエラーとして扱う。

## 適用条件

- Windows 環境で rename ベースの原子的書込みを並行実行コンテキスト（bun test のテスト間並行等）で行う場合
- 単体実行では再現せず並行実行でのみ再現する flaky テストの診断

## 手順

1. 対照プローブ（新旧構成 20 ラウンド同頻度実行）で環境起因かテスト起因かを切り分ける
2. Promise.all 模倣で競合を再現特定する
3. 指数バックオフ（最大約 150ms）の bounded retry を実装する
4. retry 上限到達時は本来のエラーとして扱い、無限リトライにしない

## 留意点

- EPERM / EACCES が並行実行時のみ出る場合、まず環境起因（ハンドル競合）を疑う
- bounded retry は上位層へのエラー隠蔽にならない範囲で適用する

## 出典

- Case #3314（PR #3325 Findings）: 対照プローブによる環境起因実証
- Case #3316（PR #3329 Findings）: Promise.all 模倣による再現特定と bounded retry 対処

## 適用対象

- Windows 環境で rename ベースの原子的書込みを実装・検証するコード（checker・tool engine の script 等）
- bun test 並行実行で非決定的 EPERM / EACCES が観測されるテスト資産の診断と対策
- 並行実行でのみ再現する flaky テストの診断全般

## 根拠

- 出典 2 件（Case #3314・PR #3325、Case #3316・PR #3329）の実証: 単体実行で再現しないため「テストの欠陥」と誤分類されやすい環境起因の競合を、対照プローブと並行模倣で切り分けた
- bounded retry 実装の実在（src/common/tools/agentdev-gh/local/runner-local.ts）

## 関連知識

- [windows-bun-test-spawn-timeout-classification.md](windows-bun-test-spawn-timeout-classification.md)（spawn timeout 由来 fail との切り分け・対照実行手順）
- [windows-powershell-bulk-io-corruption.md](windows-powershell-bulk-io-corruption.md)（Windows 環境のファイル I/O 系知見）
