# 権威情報源宣言 ≤1 の計測単位（宣言サイト数え上げ）の正規化

## 観測内容

権威情報源宣言 ≤1 の計測単位が SPEC に明示されていない。PR #2186 は「dispatch 宣言と soft guard 宣言節（維持必須の公開 interface）を除く明示的宣言サイトの数」と解釈して運用し、case-auto の「## workflow 実装の権威情報源」節（自コマンド分 + 下位 workflow 分の2段落）を単一宣言サイトとして維持した。

## 影響

- 計測単位が解釈依存のため、機械検査化・レビュー判定の基準が安定しない

## 課題

上記計測単位（宣言サイトとして数える運用）を agentdev-command-authoring SPEC「command authoring 基準（層1〜3適用）」節へ追記して正規化する。

## 既存要件・成果物との関連

- SPEC: agentdev-command-authoring「command authoring 基準（層1〜3適用）」節
- 実績: PR #2186（case-auto での運用適用）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2186 (Issue #2181 / OU-003, Epic #2178 Wave 2) SPEC確定候補 セクション 2
- 元 item: intake-2026-08-16-spec-cand-authoritative-source-counting-unit.md
