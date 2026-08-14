# intake: 変更範囲外の既存行に一文一行機械判定違反とテーブルセル `| — |` プレースホルダが残存（横断是正 OU 候補）

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: case-run 実行（Stage 2、Issue 2105 / PR 2115）の TS-105 文書品質査読で発見。PR 2115 本文「## Findings / Capture候補」より case-close が回収

## 問題事象

Issue 2105（OU-005）の変更範囲外の既存行に、次の文書品質機械判定違反が残存している。

- 一文一行機械判定違反（prose line に複数句点。agentdev-doc-writing mechanical-replacement-rules.md の判定規則対象）
- テーブルセル `| — |` の N/A プレースホルダ残存（em-dash プレースホルダ。機械判定では `| - |` へ置換対象）

残存例: docs/specs/commands/inspect-promote.md、docs/specs/workflows/ 配下の未変更ファイル等。PR 2115 では変更行のみ是正（25行）し、変更範囲外の既存行は対象外として修正していない。

## 影響

- docs 全域の文書品質ばらつき（低 severity。機能・検査への影響なし）。TS-105 系査読で変更のたびに同違反が検出され続けるノイズ要因

## 発生局面

実装（case-run、TS-105 文書品質査読の機械判定実行）

## 検知方法

agentdev-doc-writing の機械判定規則（prose line 複数句点検出、`| — |` テーブルセル検出）を docs/ 全域へ適用

## 想定される対応方向

- 対象ファイルを固定した機械横断是正（独立 OU 化）。変更 PR と分離して一括修正する
- 採否・優先度は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2105（OU-005）, PR: 2115
- 判定規則原本: src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md

## 出典引用

PR 2115 本文「## Findings / Capture候補」より:

> 変更範囲外の既存行に一文一行機械判定違反、テーブルセル `| — |` N/A プレースホルダ（inspect-promote.md、docs/specs/workflows/ 配下の未変更ファイル等）が残存する。機械横断是正（独立 OU）での対応候補

## タグ

#intake #one-sentence-per-line #em-dash-placeholder #cross-file-remediation #epic-2099
