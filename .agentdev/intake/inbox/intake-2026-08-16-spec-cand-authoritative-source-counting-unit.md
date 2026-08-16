# Intake Item: 権威情報源宣言 ≤1 の計測単位（宣言サイト数え上げ）の正規化

## 発生源

- PR: #2186 (Issue #2181 / OU-003, Epic #2178 Wave 2)
- 発生 phase: case-run 実装
- capture 分類: intake（SPEC確定候補、backlog 化）

## 問題

権威情報源宣言 ≤1 の計測単位が SPEC に明示されていない。PR #2186 は「dispatch 宣言と soft guard 宣言節（維持必須の公開 interface）を除く明示的宣言サイトの数」と解釈して運用し、case-auto の「## workflow 実装の権威情報源」節（自コマンド分 + 下位 workflow 分の2段落）を単一宣言サイトとして維持した。

## 推奨対応

上記計測単位（宣言サイトとして数える運用）を agentdev-command-authoring SPEC「command authoring 基準（層1〜3適用）」節へ追記して正規化する。SPEC 本文の確定は backlog 化する。

## 関連

- Issue: #2181 (CLOSED), Epic: #2178
- PR: #2186 (SPEC確定候補 セクション 2)