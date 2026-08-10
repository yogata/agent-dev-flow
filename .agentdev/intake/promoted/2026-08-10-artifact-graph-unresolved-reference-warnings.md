# Artifact Graph の未解決参照 warning の分類と抽出精度改善

## 観測内容

Artifact Graph の構造検査スクリプト `check_graph.ts` はエラー0件で合格したが、未解決参照の観測 warning が22件残っている。Artifact Graph だけで候補探索を網羅できない可能性がある。

## 影響

- Wave 2 の非停止統合には影響しない。
- 未解決参照が残るため、候補探索の補完/反証が必要。
- 抽出精度改善は別課題として残る。

## 課題

未解決参照 warning 22件が参照種別/参照元ごとに分類されておらず、正規の相対参照で解決可能な項目と識別子/説明語として解決対象外の項目が混在している。抽出規則の改善と回帰検証が必要。

## 既存要件との関連

- Epic: #1941（本体リポジトリ固有 Artifact Graph を導入する）
- Issue: #1943
- PR: #1946
- 仕様: `docs/specs/local/artifact-graph.md`
- 構造検査: `.opencode/skills/repo-agentdev-artifact-graph/scripts/check_graph.ts`

## 対応方向

- warning 22件を参照種別/参照元ごとに分類する。
- 正規の相対参照で解決可能な項目と、識別子/説明語として解決対象外の項目を分離する。
- 抽出規則変更時は候補探索の補完/反証を維持して回帰検証する。

## 出典

- PR #1946（構造検査合格、warning 22件残存の確認）
- Issue #1943
