# intake: 既存 broken reference 群（REQ-021 の ADR-006 参照、vocabulary-registry の REQ-0145 参照、integrity/audits 相対リンク等）

## 発生日

2026-08-15

## 発生元

- Issue: 2129（OU-002）
- 取得元: PR 2133 本文 `## Findings / Capture候補` intake 節（case-run の /repo/docs-check 実行時に検出。.agentdev/ への書き込み禁止により intake item として未保存→case-close で回収）

## 問題事象

docs-check で検出される既存の broken reference 群が残存する。

- REQ-021 からの ADR-006 参照（ADR→Decision 移行後も旧 ADR 参照が残存）
- vocabulary-registry からの REQ-0145 参照（参照先 REQ 行が存在しない）
- `docs/specs/integrity/audits/` 配下の壊れた相対リンク等

いずれも本 PR（PR 2133）が触れていないファイルの既存指摘。

## 影響

- docs-check / check_integrity の NG 件数に常態的に含まれ、新規変更起因の指摘との判別コストが増す
- 読み手が存在しない参照先へ導かれる

## 発生局面

実装（case-run の /repo/docs-check 実行、既存指摘の観察）

## 検知方法

`check_integrity.ts` の broken reference 検査（PR 2133 テスト証拠 TS-005 の「残る NG 36 件はすべて本変更が触れていないファイルの既存指摘」に含まれる）

## 想定される対応方向

- 参照宛先の解決（ADR-006 → DEC 相当への置換、REQ-0145 → 現行 REQ 行への置換または除去、audits 相対リンク修正）
- ADR→Decision 移行（9ea67084）の横断是正で配下参照の洗い替えが完了していなかった事例。一括是正を独立 PR で処理可能
- 対応要否・優先度は backlog-review で判断する

## 関連

- Issue: 2129（OU-002）, PR: 2133
- 移行由来: commit 9ea67084（ADR→Decision 移行、OU-003 #2040）ほか
- 関連 learning: `.agentdev/learning/inbox.md`「verify-only 検証で MOVE/RETIRE 済み REQ 行の現行根拠参照を grep 検出するパターン」（検出手法の知見側）

## 出典引用

PR 2133 本文 `## Findings / Capture候補` intake 節より:

> 既存の broken reference 群（REQ-021 の ADR-006 参照、vocabulary-registry の REQ-0145 参照、integrity/audits 配下の壊れた相対リンク等）

## タグ

#intake #broken-reference #adr-dec-migration #stale-reference #pre-existing
