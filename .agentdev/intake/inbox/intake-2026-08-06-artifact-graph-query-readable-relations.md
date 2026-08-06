# intake: Artifact Graph問い合わせ結果の関係情報を読みやすくする

## 発生日

2026-08-06

## 発生元

- Epic: #1941（本体リポジトリ固有Artifact Graphを導入する）
- Issue: #1944（Artifact Graphの探索効果を代表質問で検証する）
- PR: #1947
- 取得元: PR #1947本文「## Findings/ Capture候補」セクション

## 問題事象

Artifact Graphの問い合わせ結果はノードIDと関係IDを中心に返すため、関係種別と接続元、接続先を一覧で読むには関係IDを追加解釈する操作が必要である。

## 影響

- 代表質問10件のうち、根拠問い合わせを含む質問では問い合わせ結果の追加解釈が必要になる。
- 探索結果の正しさには影響しないが、人が結果を読む際の操作数と認知負荷が増える。

## 発生局面

効果検証（Issue #1944の代表質問10件を従来探索と比較した時点）

## 検知方法

PR #1947の効果検証で、問い合わせ結果を関係種別ごとに解釈する操作を確認した。

## 想定される対応方向

- 問い合わせ結果へ関係の`type`、`source`、`target`を含める。
- 既存のノードID、関係ID、根拠情報との互換性を保ったまま表示形式を拡張する。

## 関連

- Epic: #1941
- Issue: #1944
- PR: #1947
- 仕様: `docs/specs/local/artifact-graph.md`
- 問い合わせ処理: `.opencode/skills/repo-agentdev-artifact-graph/scripts/query_graph.ts`

## 出典引用

PR #1947本文「## Findings/ Capture候補」より:

> 問い合わせ結果へ `type`、`source`、`target` を含め、関係IDを追加解釈する操作を減らす候補。

## タグ

#intake #artifact-graph #query-result #usability #issue-1944
