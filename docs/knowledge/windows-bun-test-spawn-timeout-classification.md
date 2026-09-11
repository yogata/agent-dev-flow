---
title: Windows + bun test の spawn timeout 由来分類と単独再実行手順
created: 2026-09-11
updated: 2026-09-11
---

# Windows + bun test の spawn timeout 由来分類と単独再実行手順

## 知識内容

Windows で integrity suite をフル実行すると、サブプロセス起動（spawn）を伴うテストが bun test の既定 5 秒 timeout で失敗することがある。stdout 途切れによる JSON parse error を含む環境 fail に見えるが、本質は spawn コストに対する timeout 不足である。取り扱いは次のとおりである。

1. 対象テストを `bun test --timeout 120000` 等の十分な timeout で単独再実行する。
2. pass 結果と「環境由来」の根拠（既定 timeout での fail → 延長単独再実行での pass）を QG-4 記録として残す。
3. 延長後も fail が残る場合は環境由来と扱わず、変更起因性を再評価する。timeout 延長だけで fail を無条件に環境由来と扱わない。
4. テスト削除や timeout 無制限化は根拠なく行わない。

## 適用条件

- Windows（win32）+ bun 環境で、サブプロセスを起動する integrity test が既定 timeout で失敗する場合。
- 高負荷時に spawn を伴うテストが既定 5 秒 timeout で fail し、環境由来か変更起因かの由来分類が必要な場合。
- QG-4 で fail 由来分類を記録する場面。

## 適用対象

- case-run / case-close での integrity suite 実行・由来分類手順。
- `docs/designs/skills/agentdev-quality-gates.md` の QG-4 fail 由来分類・fallback 契約に従う検証手順。
- Windows + bun のサブプロセス起動を伴うテスト全般。

## 根拠

- #12、PR #2749 / #2750: Windows 高負荷時の spawn 伴走テストが既定 5 秒 timeout で失敗し、`--timeout 120000` による単独再実行で pass、由来分類を環境由来として記録した観測。
- QG-4 の fail 由来分類・単独再実行の契約は既存（agentdev-quality-gates）。Windows の既定 5 秒 timeout と延長値の具体例は未整理だったため本知識文書へ整理した。

## 関連知識

- [checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路](checker-cli-stdout-loss-on-windows-bun.md)（stdout ロスは別現象。JSON parse error に見える fail の切り分けで関連）。
- [Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク](windows-powershell-bulk-io-corruption.md)（Windows 環境の検証系知識）。
