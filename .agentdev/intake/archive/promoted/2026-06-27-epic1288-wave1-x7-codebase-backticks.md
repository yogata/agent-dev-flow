# X-7 backticks SPEC の codebase全体適用（unbacked skill names 189件候補）

## 観察

PR #1296（Issue #1289「X-7 backticks SPEC残作業完了確認」）は、X-7 SPEC 本体の自己適合性を是正し、SPEC files 内の X-2/X-7 違反を0件にした。ただし codebase全体（7ディレクトリ）に存在する unbacked skill names 189件候補は、AG-012（Issue #1118）により X-7 の finding 0件適用対象外として本 Issue の完了条件から明示的に除外した。

## 修正されなかった理由

Issue #1118 AG-012 が「X-7 は SPEC 詳細基準の確定も併せて完了条件とし、finding 0 件は X-7 には適用しないことを明示」と規定している。X-7 SPEC は 2026-06-25 に accepted 確定済みであり、codebase 全体への機械横断是正は別途 inspect-docs / 段階的実施の対象。

## 課題

- 189件の unbacked skill names の機械的 backticks 付与（codebase全体横断是正）
- ADR prose 内の skill name 参照（189件候補の内訳確認）
- inspect-docs で X-7 を finding 対象とするか、機械横断是正ツールを新設するかの判断

## 根拠

PR #1296 本文（Findings / Capture候補）より引用:

> X-7 codebase全体適用（189件候補の unbacked skill names）は、別途 inspect-docs / 機械横断是正で段階的に実施することを推奨。AG-012 により本 Issue の完了条件ではないが、技術債として記録する。

## 観測元

- PR #1296
- Issue #1289
- Epic #1288（OU-003, Wave 1）
