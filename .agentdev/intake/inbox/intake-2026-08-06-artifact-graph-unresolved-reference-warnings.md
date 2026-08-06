# intake: Artifact Graphの未解決参照warning 22件

## 発生日

2026-08-06

## 発生元

- Epic: #1941（本体リポジトリ固有Artifact Graphを導入する）
- Issue: #1943（Artifact Graphを既存Project Extensionsへ統合する）
- PR: #1946
- 取得元: PR #1946本文「## Findings/ Capture候補」セクション

## 問題事象

`check_graph.ts`の構造検査はエラー0件で合格したが、未解決参照の観測warningが22件残っている。
Artifact Graphによる候補探索の完全性を評価する際は、正規ファイルと別手段による補完、反証が必要である。

## 影響

- Wave 2の非停止統合には影響しない。
- 未解決参照が残るため、Artifact Graphだけでは探索候補を網羅できない可能性がある。
- 未解決参照の抽出精度改善は別課題として対応要否の判断が必要である。

## 発生局面

実装検証（Issue #1943のcase-runでArtifact Graph構造検査を実行した時点）

## 検知方法

PR #1946に記録された`check_graph.ts`の実行結果をcase-closeで回収した。

## 想定される対応方向

- warning 22件を参照種別と参照元ごとに分類する。
- 正規の相対参照で解決可能な項目と、識別子や説明語として解決対象外にすべき項目を分離する。
- 抽出規則を変更する場合は、候補探索の補完、反証を維持したまま回帰検証する。

## 関連

- Epic: #1941
- Issue: #1943
- PR: #1946
- 仕様: `docs/specs/local/artifact-graph.md`
- 検査: `.opencode/skills/repo-agentdev-artifact-graph/scripts/check_graph.ts`

## 出典引用

PR #1946本文「## Findings/ Capture候補」より:

> 構造エラーは0件だが、未解決参照の観測warningが22件残る。候補探索の完全性には引き続き正規ファイルと別手段による補完・反証が必要

## タグ

#intake #artifact-graph #unresolved-reference #graph-integrity #issue-1943
