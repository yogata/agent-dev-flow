# Artifact Graph 問い合わせ結果の関係情報を読みやすくする

## 観測内容

Artifact Graph の問い合わせ結果はノードIDと関係IDを中心に返すため、関係種別と接続元、接続先を一覧で読むには関係IDを追加解釈する操作が必要である。

## 影響

- 代表質問10件のうち、根拠問い合わせを含む質問では問い合わせ結果の追加解釈が必要になる。
- 探索結果の正しさには影響しないが、人が結果を読む際の操作数と認知負荷が増える。

## 課題

問い合わせ結果に関係の意味情報（`type`/`source`/`target`）が含まれておらず、利用者が関係IDを追加解釈する必要がある。usability 改善として表示形式の拡張が求められる。

## 既存要件との関連

- Epic: #1941（本体リポジトリ固有 Artifact Graph を導入する）
- Issue: #1944（Artifact Graph の探索効果を代表質問で検証する）
- PR: #1947（効果検証にて追加解釈操作を確認）
- 仕様: `docs/specs/local/artifact-graph.md`
- 問い合わせ処理: `.opencode/skills/repo-agentdev-artifact-graph/scripts/query_graph.ts`

## 対応方向

- 問い合わせ結果へ関係の `type`、`source`、`target` を含める。
- 既存のノードID、関係ID、根拠情報との互換性を保ったまま表示形式を拡張する。

## 出典

- PR #1947 本文「## Findings / Capture候補」
- Issue #1944 代表質問10件での効果検証
