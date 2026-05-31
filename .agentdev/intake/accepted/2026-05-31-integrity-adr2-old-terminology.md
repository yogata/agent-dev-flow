# ADR-0002 結果・影響セクションに旧 terminology 残存

## 観測

`docs/adr/ADR-0002.md` L35 で「tips-capture は capture 専用として維持（orchestration skill 化なし）」と記載。現在の正しい名称は `agentdev-learning-capture`。ADR-0002 の結果・影響セクションに旧名称が残存している。

## 影響

ADR-0002 を参照した際に `tips-capture` という存在しないスキル名が記載されており、現在のスキル構成との対応関係が不明瞭。

## レビューで決めること

- L35 の `tips-capture` を `agentdev-learning-capture` に更新する

## 根拠

- 検出元: integrity-check F-05 (2026-05-31)
- 分類: obsolete-structure
- 対象ファイル: `docs/adr/ADR-0002.md:35`
